import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Send } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AuraAIContext = {
  name?: string;
  relationship?: string;
  theme?: string;
  confessionMode?: boolean;
  memoriesCount?: number;
  message?: string;
};

const AI_UNAVAILABLE = "Sorry, Aura AI is temporarily unavailable.";

const starterMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I’m Aura AI ✨ Ask me about themes, messages, or how to build your surprise.",
  },
];

export default function AuraAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [context, setContext] = useState<AuraAIContext | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [isOpen, messages]);

  useEffect(() => {
    const readContext = () => {
      const raw = sessionStorage.getItem("aura_ai_context");
      if (!raw) {
        setContext(null);
        return;
      }
      try {
        setContext(JSON.parse(raw) as AuraAIContext);
      } catch {
        setContext(null);
      }
    };
    readContext();
    const handleContext = () => readContext();
    window.addEventListener("aura-ai-context", handleContext);
    const open = () => setIsOpen(true);
    window.addEventListener("aura-ai-open", open);
    return () => {
      window.removeEventListener("aura-ai-context", handleContext);
      window.removeEventListener("aura-ai-open", open);
    };
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          context,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string };
      const reply =
        typeof data.reply === "string" && data.reply.length > 0
          ? data.reply
          : !res.ok
            ? AI_UNAVAILABLE
            : "I’m here to help with themes, messages, and builder guidance. Ask me anything.";
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          role: "assistant",
          content: AI_UNAVAILABLE,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-[320px] overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Aura AI ✨</div>
              <div className="text-xs text-white/60">Your design assistant</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
            >
              Close
            </button>
          </div>
          <div ref={containerRef} className="max-h-[320px] overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-white text-slate-900"
                    : "bg-white/10 text-white"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isSending && (
              <div className="max-w-[60%] rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/70">
                Aura AI is typing<span className="inline-block animate-pulse">...</span>
              </div>
            )}
          </div>
          <div className="border-t border-white/10 px-3 py-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your question..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSend();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 disabled:opacity-40"
              >
                <span className="flex items-center gap-1">
                  <Send className="h-3 w-3" />
                  Send
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 text-white shadow-xl transition-transform hover:scale-105"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    </div>
  );
}
