import type { Request, Response } from "express";

const UNAVAILABLE = "Sorry, Aura AI is temporarily unavailable.";

const BASE_SYSTEM =
  "You are Aura AI, the assistant inside the Aura platform. Aura helps people create emotional birthday surprise websites and letters: themes, messages, memories, music, and shareable links. Be warm, concise, and practical. Suggest messages, themes, and gentle emotional guidance. Never ask for passwords or API keys.";

function buildContextBlock(ctx: Record<string, unknown> | null): string {
  if (!ctx || typeof ctx !== "object") return "";
  const lines: string[] = [];
  const name = typeof ctx.name === "string" ? ctx.name : undefined;
  const relationship = typeof ctx.relationship === "string" ? ctx.relationship : undefined;
  const theme = typeof ctx.theme === "string" ? ctx.theme : undefined;
  const confessionMode =
    typeof ctx.confessionMode === "boolean" ? (ctx.confessionMode ? "on" : "off") : undefined;
  const memoriesCount =
    typeof ctx.memoriesCount === "number" ? String(ctx.memoriesCount) : undefined;
  const message = typeof ctx.message === "string" ? ctx.message : undefined;
  if (name) lines.push(`Recipient name: ${name}`);
  if (relationship) lines.push(`Relationship: ${relationship}`);
  if (theme) lines.push(`Selected theme: ${theme}`);
  if (confessionMode) lines.push(`Confession mode: ${confessionMode}`);
  if (memoriesCount) lines.push(`Memories count: ${memoriesCount}`);
  if (message && message.length > 0) lines.push(`Draft message (may be partial): ${message}`);
  if (lines.length === 0) return "";
  return `\n\nContext:\n${lines.map((l) => `- ${l}`).join("\n")}`;
}

type Hist = { role: string; content: string };

function geminiContents(userMessage: string, history: Hist[]) {
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];
  let slice = history.slice(-14).filter((m) => m.role === "user" || m.role === "assistant");
  while (slice.length > 0 && slice[0].role !== "user") {
    slice = slice.slice(1);
  }
  for (const m of slice) {
    const content = typeof m?.content === "string" ? m.content : "";
    if (!content) continue;
    if (m.role === "user") {
      contents.push({ role: "user", parts: [{ text: content }] });
    } else if (m.role === "assistant") {
      contents.push({ role: "model", parts: [{ text: content }] });
    }
  }
  contents.push({ role: "user", parts: [{ text: userMessage }] });
  return contents;
}

function extractGeminiText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const candidates = d.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const c0 = candidates[0] as Record<string, unknown>;
  const content = c0?.content as Record<string, unknown> | undefined;
  const parts = content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const p0 = parts[0] as Record<string, unknown>;
  const text = typeof p0?.text === "string" ? p0.text : null;
  return text && text.trim().length > 0 ? text.trim() : null;
}

async function callGemini(params: {
  apiKey: string;
  model: string;
  systemText: string;
  userMessage: string;
  history: Hist[];
}): Promise<string | null> {
  const model = encodeURIComponent(params.model);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: params.systemText }] },
    contents: geminiContents(params.userMessage, params.history),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": params.apiKey,
    },
    body: JSON.stringify(body),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    console.error("Gemini API error:", resp.status, raw.slice(0, 500));
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    console.error("Gemini API: invalid JSON");
    return null;
  }
  return extractGeminiText(parsed);
}

async function callOpenAI(params: {
  apiKey: string;
  systemText: string;
  userMessage: string;
  history: Hist[];
}): Promise<string | null> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: params.systemText },
  ];
  for (const m of params.history) {
    const role = m?.role === "assistant" ? "assistant" : m?.role === "user" ? "user" : null;
    const content = typeof m?.content === "string" ? m.content : null;
    if (role && content) {
      messages.push({ role, content });
    }
  }
  messages.push({ role: "user", content: params.userMessage });

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    console.error("OpenAI API Error:", resp.status, errText);
    return null;
  }
  const data = (await resp.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === "string" && text.trim().length > 0 ? text.trim() : null;
}

/**
 * Aura AI chat — backend only. Prefers Gemini (`GEMINI_API_KEY`), else OpenAI (`OPENAI_API_KEY` / `AI_API_KEY`).
 * Used by POST /api/ai and POST /api/aura-ai/chat.
 */
export async function auraAIChatHandler(req: Request, res: Response): Promise<void> {
  try {
    const userMessage = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const history = Array.isArray(req.body?.history) ? (req.body.history as Hist[]) : [];
    const ctx =
      req.body?.context && typeof req.body.context === "object"
        ? (req.body.context as Record<string, unknown>)
        : null;

    if (!userMessage) {
      res.status(400).json({ reply: "Please enter a message to chat with Aura AI." });
      return;
    }

    const systemText = `${BASE_SYSTEM}${buildContextBlock(ctx)}`;

    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiKey) {
      const model =
        process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";
      const reply = await callGemini({
        apiKey: geminiKey,
        model,
        systemText,
        userMessage,
        history,
      });
      if (reply) {
        res.json({ reply });
        return;
      }
      res.json({ reply: UNAVAILABLE });
      return;
    }

    const openaiKey = (process.env.OPENAI_API_KEY || process.env.AI_API_KEY)?.trim();
    if (openaiKey) {
      const reply = await callOpenAI({
        apiKey: openaiKey,
        systemText,
        userMessage,
        history,
      });
      if (reply) {
        res.json({ reply });
        return;
      }
      res.json({ reply: UNAVAILABLE });
      return;
    }

    console.error("Aura AI: no GEMINI_API_KEY or OPENAI_API_KEY configured");
    res.json({ reply: UNAVAILABLE });
  } catch (error) {
    console.error("Aura AI Chat Error:", error);
    res.json({ reply: UNAVAILABLE });
  }
}
