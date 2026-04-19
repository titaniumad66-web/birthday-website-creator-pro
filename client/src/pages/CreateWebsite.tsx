import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, Type, Sparkles, Wand2, Upload, 
  ChevronRight, ChevronLeft, CheckCircle2, Loader2, PlayCircle, Eye,
  Music, Heart, Gift, Crown, Smile, Cloud, Download, Lock, MapPin, Play, Calendar, Star
} from "lucide-react";
import { useLocation } from "wouter";
import { apiUrl } from "../lib/api";
import { getValidAuthToken, getAuthPayload } from "../lib/queryClient";
import {
  memoryTemplates,
  musicTrackOptions,
  relationshipToKey,
  resolveMusicSrcFromContent,
  letterTemplates,
  getLetterPlaceholder,
  type MusicTrackId,
  type ExperienceType,
} from "../lib/surpriseConfig";

// Components
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";

// Images
import mockupImg from "../assets/images/website-mockup.png";
import gift1 from "../assets/images/gift-1.png";
import gift2 from "../assets/images/gift-2.png";

type Step =
  | "welcome"
  | "experience"
  | "recipient"
  | "letterType"
  | "letterCompose"
  | "theme"
  | "memories"
  | "message"
  | "delivery"
  | "music"
  | "generating"
  | "preview";

interface Memory {
  id: string;
  image: string;
  caption: string;
  date: string;
  /** Suggested chapter title from relationship templates */
  templateTitle?: string;
  /** User-editable chapter title; empty string uses templateTitle when published */
  title?: string;
  /** Only one memory should be featured; used as hero image on published page */
  isFeatured?: boolean;
  body?: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function encodePreviewPayload(payload: unknown) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function generatePublishId(length = 6) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}

function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getThemePalette(themeId: string) {
  switch (themeId) {
    case "royal":
      return {
        background: "linear-gradient(180deg, #0f172a, #1e293b 50%, #0f172a)",
        accent: "#facc15",
        text: "#f8fafc",
        card: "rgba(15, 23, 42, 0.8)",
      };
    case "minimal":
      return {
        background: "linear-gradient(180deg, #ffffff, #f8fafc 60%, #e2e8f0)",
        accent: "#0f172a",
        text: "#0f172a",
        card: "rgba(255, 255, 255, 0.85)",
      };
    case "emotional":
      return {
        background: "linear-gradient(180deg, #fff7ed, #ffedd5 45%, #fef2f2)",
        accent: "#ea580c",
        text: "#3b1d1d",
        card: "rgba(255, 255, 255, 0.75)",
      };
    case "funny":
      return {
        background: "linear-gradient(180deg, #fef9c3, #fef08a 50%, #ecfccb)",
        accent: "#65a30d",
        text: "#3f6212",
        card: "rgba(255, 255, 255, 0.75)",
      };
    case "pastel":
      return {
        background: "linear-gradient(180deg, #fce7f3, #e0e7ff 55%, #faf5ff)",
        accent: "#9333ea",
        text: "#4c1d95",
        card: "rgba(255, 255, 255, 0.75)",
      };
    case "romantic":
    default:
      return {
        background: "linear-gradient(180deg, #ffe4e6, #fbcfe8 55%, #fef3c7)",
        accent: "#db2777",
        text: "#3f1d2a",
        card: "rgba(255, 255, 255, 0.78)",
      };
  }
}

export default function CreateWebsite() {
  const [step, setStep] = useState<Step>("welcome");
  const [, setLocation] = useLocation();
  const [experienceType, setExperienceType] = useState<ExperienceType>("website");

  // Form State
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [confessionMode, setConfessionMode] = useState(false);
  const [theme, setTheme] = useState("romantic");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [message, setMessage] = useState("");
  const [musicTrack, setMusicTrack] = useState<MusicTrackId>("soft_piano");
  const [scheduleSurprise, setScheduleSurprise] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("09:00");
  const [progress, setProgress] = useState(0);
  const [createdWebsiteId, setCreatedWebsiteId] = useState<string | null>(null);
  const [websiteLinkName, setWebsiteLinkName] = useState("");
  const [publishError, setPublishError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const [uploadedMusicBase64, setUploadedMusicBase64] = useState<string | null>(
    null
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const [letterType, setLetterType] = useState("");
  const [letterTitle, setLetterTitle] = useState("");
  const [letterBody, setLetterBody] = useState("");
  const [letterImage, setLetterImage] = useState<string | null>(null);
  const [letterBodyTouched, setLetterBodyTouched] = useState(false);
  const letterImageInputRef = useRef<HTMLInputElement>(null);

  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(() =>
    typeof window !== "undefined"
      ? Boolean(new URLSearchParams(window.location.search).get("edit"))
      : false,
  );
  const [editLoadError, setEditLoadError] = useState<string | null>(null);

  // Monetization: defer checks to the moment user generates the website for better UX

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit")) {
      return;
    }
    try {
      const stored = sessionStorage.getItem("ai_preview_payload");
      if (stored) {
        const data = JSON.parse(stored);
        if (typeof data?.name === "string") setName(data.name);
        if (typeof data?.relationship === "string") setRelationship(data.relationship);
        if (typeof data?.confessionMode === "boolean") setConfessionMode(data.confessionMode);
        if (typeof data?.theme === "string") setTheme(data.theme);
        if (Array.isArray(data?.memories)) {
          const ms: Memory[] = data.memories.map((m: any) => ({
            id: Math.random().toString(36).slice(2),
            image: String(m.image || ""),
            caption: String(m.caption || ""),
            date: String(m.date || new Date().toISOString().split("T")[0]),
            templateTitle:
              typeof m.templateTitle === "string" ? m.templateTitle : undefined,
            title: typeof m.title === "string" ? m.title : undefined,
            isFeatured: Boolean(m.isFeatured),
            body: typeof m.body === "string" ? m.body : undefined,
          }));
          setMemories(ms);
        }
        if (typeof data?.message === "string") setMessage(data.message);
        if (typeof data?.music === "string") {
          if (data.music.startsWith("data:")) setUploadedMusicBase64(data.music);
          else setMusicTrack(mapLegacyMusicId(data.music));
        }
        if (typeof data?.musicTrack === "string") {
          setMusicTrack(mapLegacyMusicId(data.musicTrack));
        }
        setStep("message");
      }
    } catch {}
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (!editId) {
      setEditingSiteId(null);
      setEditLoading(false);
      setEditLoadError(null);
      return;
    }

    const token = getValidAuthToken();
    if (!token) {
      setLocation("/login");
      return;
    }

    let cancelled = false;
    setEditLoading(true);
    setEditLoadError(null);

    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/websites/${editId}`));
        if (!res.ok) throw new Error("notfound");
        const row = (await res.json()) as {
          id: string;
          title: string;
          theme: string;
          content: string;
          userId?: string;
        };
        if (cancelled) return;

        const me = getAuthPayload()?.id;
        if (row.userId && me && row.userId !== me) {
          setEditLoadError("You can only edit your own creations.");
          setEditLoading(false);
          return;
        }

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(row.content) as Record<string, unknown>;
        } catch {
          setEditLoadError("Could not read this creation.");
          setEditLoading(false);
          return;
        }

        setEditingSiteId(editId);
        setTheme(typeof row.theme === "string" ? row.theme : "romantic");
        setCreatedWebsiteId(editId);

        if (parsed.type === "letter") {
          setExperienceType("letter");
          setName(typeof parsed.name === "string" ? parsed.name : "");
          setRelationship(typeof parsed.relationship === "string" ? parsed.relationship : "");
          setLetterType(typeof parsed.letterType === "string" ? parsed.letterType : "");
          setLetterTitle(typeof parsed.title === "string" ? parsed.title : "");
          setLetterBody(typeof parsed.content === "string" ? parsed.content : "");
          setLetterImage(typeof parsed.image === "string" ? parsed.image : null);
          setLetterBodyTouched(true);
          setConfessionMode(false);
          if (typeof parsed.musicBase64 === "string" && parsed.musicBase64) {
            setUploadedMusicBase64(parsed.musicBase64);
          } else if (
            typeof parsed.music === "string" &&
            parsed.music.startsWith("data:")
          ) {
            setUploadedMusicBase64(parsed.music);
          } else {
            setUploadedMusicBase64(null);
            const tr = parsed.musicTrack ?? parsed.music;
            if (typeof tr === "string") setMusicTrack(mapLegacyMusicId(tr));
          }
          setScheduleSurprise(false);
          setUnlockDate("");
          setUnlockTime("09:00");
          setMemories([]);
          setMessage("");
          setStep("preview");
        } else {
          setExperienceType("website");
          setName(typeof parsed.name === "string" ? parsed.name : "");
          setRelationship(typeof parsed.relationship === "string" ? parsed.relationship : "");
          setConfessionMode(Boolean(parsed.confessionMode));
          if (Array.isArray(parsed.memories)) {
            const ms: Memory[] = (parsed.memories as any[]).map((m) => ({
              id: Math.random().toString(36).slice(2),
              image: String(m.image || ""),
              caption: String(m.caption || ""),
              date: String(m.date || new Date().toISOString().split("T")[0]),
              templateTitle:
                typeof m.templateTitle === "string" ? m.templateTitle : undefined,
              title: typeof m.title === "string" ? m.title : undefined,
              isFeatured: Boolean(m.isFeatured),
              body: typeof m.body === "string" ? m.body : undefined,
            }));
            setMemories(ms);
          } else {
            setMemories([]);
          }
          setMessage(typeof parsed.message === "string" ? parsed.message : "");
          if (typeof parsed.musicBase64 === "string" && parsed.musicBase64) {
            setUploadedMusicBase64(parsed.musicBase64);
          } else if (
            typeof parsed.music === "string" &&
            parsed.music.startsWith("data:")
          ) {
            setUploadedMusicBase64(parsed.music);
          } else {
            setUploadedMusicBase64(null);
            const tr = parsed.musicTrack ?? parsed.music;
            if (typeof tr === "string") setMusicTrack(mapLegacyMusicId(tr));
          }
          setScheduleSurprise(Boolean(parsed.scheduleSurprise));
          if (parsed.scheduleSurprise && typeof parsed.unlockAt === "string") {
            const d = new Date(parsed.unlockAt);
            if (!Number.isNaN(d.getTime())) {
              const y = d.getFullYear();
              const mo = String(d.getMonth() + 1).padStart(2, "0");
              const da = String(d.getDate()).padStart(2, "0");
              setUnlockDate(`${y}-${mo}-${da}`);
              const hh = String(d.getHours()).padStart(2, "0");
              const mi = String(d.getMinutes()).padStart(2, "0");
              setUnlockTime(`${hh}:${mi}`);
            }
          } else {
            setUnlockDate("");
            setUnlockTime("09:00");
          }
          setLetterType("");
          setLetterTitle("");
          setLetterBody("");
          setLetterImage(null);
          setLetterBodyTouched(false);
          setStep("preview");
        }
      } catch {
        if (!cancelled) setEditLoadError("Could not load this creation.");
      } finally {
        if (!cancelled) setEditLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  useEffect(() => {
    const context = {
      experienceType,
      name,
      relationship,
      theme,
      confessionMode,
      memoriesCount: memories.length,
      message,
      letterType,
      letterTitle,
      letterBodyPreviewLen: letterBody.length,
    };
    sessionStorage.setItem("aura_ai_context", JSON.stringify(context));
    window.dispatchEvent(new Event("aura-ai-context"));
  }, [
    experienceType,
    name,
    relationship,
    theme,
    confessionMode,
    memories.length,
    message,
    letterType,
    letterTitle,
    letterBody.length,
  ]);

  useEffect(() => {
    if (step !== "letterType" || !relationship) return;
    const key = relationshipToKey(relationship);
    const options = letterTemplates[key];
    if (!options?.length) return;
    if (!letterType || !options.includes(letterType)) {
      setLetterType(options[0]);
    }
  }, [step, relationship, letterType]);

  useEffect(() => {
    if (experienceType !== "letter") return;
    if (step !== "letterCompose") return;
    if (letterBodyTouched) return;
    setLetterBody(getLetterPlaceholder(relationship, letterType, name));
  }, [experienceType, step, relationship, letterType, name, letterBodyTouched]);

  const themes = [
    { id: "romantic", name: "Romantic", icon: Heart, desc: "Deep reds, elegant serifs, soft fades", color: "bg-red-50 border-red-200 text-red-700" },
    { id: "emotional", name: "Emotional", icon: Cloud, desc: "Warm pastels, poetic typography, slow reveals", color: "bg-orange-50 border-orange-200 text-orange-700" },
    { id: "funny", name: "Funny", icon: Smile, desc: "Bright colors, playful fonts, bouncy animations", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
    { id: "royal", name: "Royal", icon: Crown, desc: "Gold accents, luxurious dark backgrounds", color: "bg-purple-50 border-purple-200 text-purple-700" },
    { id: "minimal", name: "Minimal", icon: ImageIcon, desc: "Clean whites, modern sans-serif, sharp lines", color: "bg-slate-50 border-slate-200 text-slate-700" },
    { id: "pastel", name: "Soft Pastel", icon: Sparkles, desc: "Dreamy gradients, bubbly shapes, soft glow", color: "bg-pink-50 border-pink-200 text-pink-700" },
  ];

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  function mapLegacyMusicId(raw: string): MusicTrackId {
    const legacy: Record<string, MusicTrackId> = {
      piano: "soft_piano",
      acoustic: "romantic_melody",
      upbeat: "birthday_tune",
      lofi: "soft_piano",
      none: "none",
    };
    if (musicTrackOptions.some((o) => o.id === raw)) return raw as MusicTrackId;
    return legacy[raw] ?? "soft_piano";
  }

  function buildWebsitePayload() {
    const unlockAtIso =
      scheduleSurprise && unlockDate
        ? new Date(`${unlockDate}T${unlockTime || "09:00"}`).toISOString()
        : null;
    const effectiveMusic = uploadedMusicBase64 ?? (musicTrack === "none" ? "" : musicTrack);
    return {
      experienceType: "website" as const,
      name,
      relationship,
      confessionMode,
      memories,
      message,
      theme,
      music: effectiveMusic,
      musicTrack: uploadedMusicBase64 ? undefined : musicTrack,
      scheduleSurprise: Boolean(scheduleSurprise && unlockAtIso),
      unlockAt: scheduleSurprise && unlockAtIso ? unlockAtIso : null,
      earlyUnlocked: false,
    };
  }

  function buildLetterPayload() {
    const effectiveMusic = uploadedMusicBase64 ?? (musicTrack === "none" ? "" : musicTrack);
    return {
      type: "letter" as const,
      experienceType: "letter" as const,
      name,
      relationship,
      letterType,
      title: letterTitle.trim(),
      content: letterBody,
      image: letterImage || undefined,
      theme,
      music: effectiveMusic,
      musicTrack: uploadedMusicBase64 ? undefined : musicTrack,
      scheduleSurprise: false,
      unlockAt: null,
      earlyUnlocked: false,
    };
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (!input.files) return;

    const files = Array.from(input.files);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await fileToDataUrl(file);

        setMemories((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2),
            image: dataUrl,
            caption: "",
            date: new Date().toISOString().split("T")[0],
            isFeatured: false,
          },
        ]);
      }
    } catch (err) {
      alert("Failed to process one of the images. Please try again.");
    } finally {
      // allow selecting the same file again
      input.value = "";
    }
  };

  const handleLetterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setLetterImage(dataUrl);
    } catch {
      alert("Failed to process the image. Please try again.");
    } finally {
      input.value = "";
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setUploadedMusicBase64(dataUrl);
    } catch (err) {
      alert("Failed to process the audio file. Please try again.");
    } finally {
      // allow selecting the same file again
      input.value = "";
    }
  };
  function updateMemory(id: string, field: keyof Memory, value: string) {
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const next: Memory = { ...m, [field]: value };
        if (field === "image" && !value.trim()) {
          next.isFeatured = false;
        }
        return next;
      }),
    );
  }

  function setFeaturedMemory(id: string) {
    setMemories((prev) =>
      prev.map((m) => ({
        ...m,
        isFeatured: m.id === id && Boolean(m.image?.trim()),
      })),
    );
  }

  function addSuggestedMemory(templateTitle: string) {
    setMemories((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        templateTitle,
        image: "",
        caption: "",
        body: "",
        date: new Date().toISOString().split("T")[0],
        isFeatured: false,
      },
    ]);
  }

  const enhanceMessage = () => {
    setMessage("Every memory we've created together is a treasure I hold close to my heart. On this special day, I want to remind you of how uniquely beautiful your soul is, and how much light you bring into my world. Happy Birthday, may your day be as extraordinary as you are.");
  };

  const regenerateWithAI = async () => {
    try {
      const tone =
        theme === "funny"
          ? "funny"
          : theme === "minimal"
          ? "minimal"
          : theme === "romantic" || theme === "pastel" || theme === "emotional"
          ? "romantic"
          : "premium";
      const res = await fetch(apiUrl("/api/ai/generate-birthday"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          relationship,
          theme,
          tone,
          memories: memories.map((m) => ({ image: m.image, caption: m.caption || null })),
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data?.message === "string") setMessage(data.message);
      const captions: string[] = Array.isArray(data?.captions) ? data.captions : [];
      if (captions.length) {
        setMemories((prev) =>
          prev.map((m, i) => ({
            ...m,
            caption: m.caption && m.caption.length > 0 ? m.caption : captions[i] || m.caption,
          })),
        );
      }
    } catch {}
  };
  const createDownloadHtml = () => {
    const palette = getThemePalette(theme);
    const safeName = escapeHtml(name || "Birthday Star");
    const safeRelationship = escapeHtml(relationship || "");
    const safeMessage = escapeHtml(message || "");
    const safeMemories = memories.map((memory) => ({
      image: memory.image,
      caption: escapeHtml(memory.caption || ""),
      date: escapeHtml(memory.date || ""),
    }));
    const resolvedAudio =
      uploadedMusicBase64 ?? resolveMusicSrcFromContent({ music: musicTrack, musicTrack });
    const musicSrc = resolvedAudio
      ? resolvedAudio.startsWith("data:")
        ? resolvedAudio
        : `${window.location.origin}${resolvedAudio}`
      : "";

    const memoryCards = safeMemories
      .map(
        (memory) => `
          <article class="memory-card">
            <div class="memory-image">
              <img src="${escapeHtml(memory.image)}" alt="${memory.caption || "Memory"}" />
            </div>
            <div class="memory-content">
              <div class="memory-caption">${memory.caption}</div>
              <div class="memory-date">${memory.date}</div>
            </div>
          </article>
        `
      )
      .join("");

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeName}'s Birthday Website</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: "Inter", "Segoe UI", sans-serif; background: ${palette.background}; color: ${palette.text}; min-height: 100vh; }
      .hero { padding: 90px 24px 70px; text-align: left; position: relative; overflow: hidden; }
      .hero-inner { max-width: 1100px; margin: 0 auto; display: grid; gap: 40px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); align-items: center; }
      .hero-title { font-size: clamp(36px, 6vw, 72px); font-family: "Georgia", serif; line-height: 1.05; }
      .hero-subtitle { margin-top: 16px; font-size: 18px; opacity: 0.85; max-width: 520px; }
      .hero-card { background: ${palette.card}; border-radius: 28px; padding: 32px; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); backdrop-filter: blur(12px); }
      .hero-tag { display: inline-flex; padding: 8px 16px; border-radius: 999px; background: rgba(255,255,255,0.7); color: ${palette.accent}; font-weight: 600; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
      .message { margin-top: 18px; font-size: 18px; line-height: 1.7; white-space: pre-wrap; }
      .section { padding: 70px 24px 90px; }
      .section-inner { max-width: 1100px; margin: 0 auto; }
      .section-title { font-family: "Georgia", serif; font-size: clamp(28px, 4vw, 42px); text-align: center; margin-bottom: 16px; }
      .section-subtitle { text-align: center; opacity: 0.7; margin-bottom: 40px; }
      .memories { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
      .memory-card { background: ${palette.card}; border-radius: 24px; overflow: hidden; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12); }
      .memory-image img { width: 100%; height: 220px; object-fit: cover; display: block; }
      .memory-content { padding: 20px; display: grid; gap: 6px; }
      .memory-caption { font-weight: 600; }
      .memory-date { font-size: 13px; opacity: 0.7; }
      .footer { padding: 28px 24px 50px; text-align: center; font-size: 14px; opacity: 0.65; }
      .audio { margin-top: 16px; width: 100%; }
    </style>
  </head>
  <body>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="hero-tag">Birthday Surprise</div>
          <h1 class="hero-title">Happy Birthday ${safeName}</h1>
          <p class="hero-subtitle">A small corner of the internet made just for you.</p>
        </div>
        <div class="hero-card">
          <h2>${safeRelationship ? `A message for ${safeName} (${safeRelationship})` : `A message for ${safeName}`}</h2>
          <p class="message">${safeMessage}</p>
          ${musicSrc ? `<audio class="audio" src="${escapeHtml(musicSrc)}" controls loop></audio>` : ""}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-inner">
        <h2 class="section-title">Memory Gallery</h2>
        <p class="section-subtitle">Highlights captured in a simple grid.</p>
        <div class="memories">
          ${memoryCards || `<div class="section-subtitle">No memories added yet.</div>`}
        </div>
      </div>
    </section>

    <footer class="footer">Made with ❤️ using Aura</footer>
  </body>
</html>`;
  };

  const handleDownloadHtml = () => {
    const html = createDownloadHtml();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const baseName = normalizeSlug(websiteLinkName || `${name}-birthday`) || `birthday-site-${Date.now()}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `${baseName || "birthday-website"}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleOpenPreview = () => {
    if (createdWebsiteId) {
      window.open(
        experienceType === "letter"
          ? `/letter/${createdWebsiteId}`
          : `/w/${createdWebsiteId}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    const payload =
      experienceType === "letter" ? buildLetterPayload() : buildWebsitePayload();
    const d = encodePreviewPayload(payload);
    window.open(`/preview?d=${encodeURIComponent(d)}`, "_blank", "noopener,noreferrer");
  };

  const handlePublishWebsite = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    setPublishError(null);

    const token = getValidAuthToken();
    if (!token) {
      setIsPublishing(false);
      setLocation("/login");
      return;
    }
    try {
      const publishTitle =
        experienceType === "letter"
          ? websiteLinkName.trim()
            ? `${websiteLinkName.trim()} — ${name}'s Letter`
            : `${name}'s Letter`
          : websiteLinkName.trim()
            ? `${websiteLinkName.trim()} — ${name}'s Birthday Website`
            : `${name}'s Birthday Website`;
      const payloadJson = JSON.stringify(
        experienceType === "letter" ? buildLetterPayload() : buildWebsitePayload()
      );

      const res = editingSiteId
        ? await fetch(apiUrl(`/api/websites/${editingSiteId}`), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: publishTitle,
              theme,
              content: payloadJson,
            }),
          })
        : await fetch(apiUrl("/api/websites"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: publishTitle,
              theme,
              content: payloadJson,
            }),
          });

      if (!res.ok) {
        throw new Error("Failed to publish website");
      }

      const data = await res.json();
      const outId = editingSiteId ?? data.id;
      setCreatedWebsiteId(outId);
      setLocation(
        experienceType === "letter"
          ? `/letter/${outId}?published=1`
          : `/w/${outId}?published=1`
      );
    } catch (err) {
      setPublishError(
        "Publishing failed. Please check your connection and try again."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const finalizeExperience = async () => {
    const token = getValidAuthToken();
    if (!token) {
      setLocation("/login");
      return;
    }

    if (experienceType === "letter" && !letterBody.trim()) {
      alert("Write a few lines for your letter before continuing.");
      return;
    }

    setStep("generating");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const payload =
      experienceType === "letter" ? buildLetterPayload() : buildWebsitePayload();
    const defaultTitle =
      experienceType === "letter" ? `${name}'s Letter` : `${name}'s Birthday Website`;
    const payloadJson = JSON.stringify(payload);

    try {
      const res = editingSiteId
        ? await fetch(apiUrl(`/api/websites/${editingSiteId}`), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: defaultTitle,
              theme,
              content: payloadJson,
            }),
          })
        : await fetch(apiUrl("/api/websites"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: defaultTitle,
              theme,
              content: payloadJson,
            }),
          });

      if (!res.ok) {
        throw new Error("Failed to create website");
      }

      const data = await res.json();
      setCreatedWebsiteId(editingSiteId ?? data.id);

      setTimeout(() => {
        setStep("preview");
      }, 500);
    } catch (error) {
      alert(
        experienceType === "letter"
          ? "Something went wrong while creating your letter."
          : "Something went wrong while creating the website."
      );
      clearInterval(interval);
      setProgress(0);
      setStep(experienceType === "letter" ? "theme" : "music");
    }
  };

  const nextStep = (next: Step) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(next);
  };

  const renderProgress = () => {
    const steps: Step[] =
      experienceType === "letter"
        ? ["recipient", "letterType", "letterCompose", "theme"]
        : ["recipient", "theme", "memories", "message", "delivery", "music"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex === -1) return null;

    return (
      <div className="mb-10 max-w-2xl mx-auto">
        <div className="flex justify-between mb-2">
          {steps.map((s, i) => (
            <div key={s} className={`text-xs font-medium ${i <= currentIndex ? 'text-primary' : 'text-muted-foreground'}`}>
              Step {i + 1}
            </div>
          ))}
        </div>
        <div className="flex gap-2 h-1.5">
          {steps.map((s, i) => (
            <div key={s} className={`flex-1 rounded-full transition-colors duration-500 ${i <= currentIndex ? 'bg-primary' : 'bg-primary/10'}`} />
          ))}
        </div>
      </div>
    );
  };

  if (editLoadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-20">
        <div className="max-w-md rounded-2xl border border-red-200/80 bg-red-50/90 px-6 py-8 text-center text-sm text-red-800">
          {editLoadError}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setLocation("/dashboard")}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (editLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#FFF7FA] to-[#FFE4EC]/30 px-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading your creation…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-24 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        {editingSiteId ? (
          <div className="mb-6 rounded-2xl border border-[#FFD6E7]/80 bg-[#FFE4EC]/40 px-4 py-3 text-center text-sm text-[#1A1A1A]/70">
            You&apos;re editing an existing surprise. Saving publishes updates to the same link.
          </div>
        ) : null}

        {step !== "welcome" &&
          step !== "experience" &&
          step !== "generating" &&
          step !== "preview" &&
          renderProgress()}

        <AnimatePresence mode="wait">
          {/* WELCOME ONBOARDING */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12 max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center mb-8 rotate-3">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6">Welcome to Aura Studio</h1>
              <p className="text-lg text-muted-foreground mb-12">
                We'll guide you step-by-step to create a premium, fully customized birthday website. 
                Our AI will assist you with styling, messaging, and selecting the perfect gifts.
              </p>
              
              <div className="space-y-4 text-left max-w-md mx-auto mb-12">
                {[
                  "Personalize the experience for them",
                  "Choose a mood-driven aesthetic theme",
                  "Build a storytelling memory timeline",
                  "Add music and AI-enhanced messaging"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-foreground/80 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => nextStep("experience")}
                className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-medium text-lg hover:bg-[#e85a8a] transition-all flex items-center gap-2 mx-auto shadow-xl shadow-[#FF6B9D]/25 hover:-translate-y-1"
              >
                Let's Begin <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === "experience" && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-3xl py-10 text-center"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                Step 1
              </p>
              <h1 className="mb-3 font-serif text-3xl font-medium md:text-4xl">Choose Experience Type</h1>
              <p className="mx-auto mb-12 max-w-xl text-muted-foreground">
                A full birthday website, or a quiet letter they can open anywhere — both feel handmade.
              </p>

              <div className="mx-auto grid max-w-2xl gap-5 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setExperienceType("website");
                    nextStep("recipient");
                  }}
                  className="group rounded-3xl border border-border bg-white/70 p-8 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="mb-2 font-serif text-xl font-medium">Website</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Timeline, photos, music, and a reveal — the full Aura surprise.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExperienceType("letter");
                    setLetterBodyTouched(false);
                    nextStep("recipient");
                  }}
                  className="group rounded-3xl border border-[#FFD6E7] bg-gradient-to-br from-[#FFF7FA] to-[#FFE4EC]/60 p-8 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-primary">
                    <Type className="h-6 w-6" />
                  </div>
                  <h2 className="mb-2 font-serif text-xl font-medium">Letter</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    One scroll, one heartbeat — words first, optional image, shareable link.
                  </p>
                </button>
              </div>

              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => nextStep("welcome")}
                  className="flex items-center gap-2 rounded-full px-6 py-3 font-medium text-muted-foreground transition-colors hover:bg-secondary"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              </div>
            </motion.div>
          )}

          {/* RECIPIENT & CONFESSION MODE */}
          {step === "recipient" && (
            <motion.div key="recipient" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white/40 glass-card rounded-3xl p-8 md:p-12 shadow-sm border border-white/20">
              <h2 className="text-3xl font-serif font-medium mb-2">Who is this masterpiece for?</h2>
              <p className="text-muted-foreground mb-10">Tell us a bit about them so our AI can personalize the experience.</p>

              <div className="space-y-8 max-w-xl">
                <div>
                  <label className="text-sm font-medium mb-2 block">Their Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sarah" className="h-14 text-lg bg-white/60" />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Relationship</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Partner", "Best Friend", "Family", "Crush"].map((rel) => (
                      <div 
                        key={rel} 
                        onClick={() => setRelationship(rel)}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${relationship === rel ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-white hover:border-primary/30'}`}
                      >
                        <span className="text-sm font-medium">{rel}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {experienceType === "website" ? (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <Lock className="w-5 h-5 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-pink-900">Confession Mode</h4>
                          <p className="text-sm text-pink-700/80">Make it subtle and emotionally expressive</p>
                        </div>
                        <Switch checked={confessionMode} onCheckedChange={setConfessionMode} />
                      </div>
                      {confessionMode && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-xs text-pink-800 mt-2">
                          We'll use poetic language, subtle animations, and deep aesthetic tones to convey your feelings beautifully without being overwhelming.
                        </motion.p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <button type="button" onClick={() => nextStep("experience")} className="text-muted-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => nextStep(experienceType === "letter" ? "letterType" : "theme")}
                  disabled={!name || !relationship}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-[#e85a8a] transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-[#FF6B9D]/20"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === "letterType" && experienceType === "letter" && (
            <motion.div
              key="letterType"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-3xl border border-white/20 bg-white/40 p-8 shadow-sm md:p-12"
            >
              <h2 className="mb-2 font-serif text-3xl font-medium">What kind of letter?</h2>
              <p className="mb-10 text-muted-foreground">
                Pick a tone — we&apos;ll suggest gentle opening lines you can rewrite completely.
              </p>

              <div className="mx-auto grid max-w-xl gap-3 sm:grid-cols-2">
                {relationship
                  ? letterTemplates[relationshipToKey(relationship)].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setLetterType(label)}
                        className={`rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all ${
                          letterType === label
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-border bg-white/80 hover:border-primary/30"
                        }`}
                      >
                        {label}
                      </button>
                    ))
                  : null}
              </div>

              <div className="mt-10 flex justify-between border-t border-border pt-10">
                <button
                  type="button"
                  onClick={() => nextStep("recipient")}
                  className="flex items-center gap-2 rounded-full px-6 py-3 font-medium text-muted-foreground transition-colors hover:bg-secondary"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => nextStep("letterCompose")}
                  disabled={!letterType}
                  className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground shadow-md shadow-[#FF6B9D]/20 transition-all hover:bg-[#e85a8a] disabled:opacity-50"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === "letterCompose" && experienceType === "letter" && (
            <motion.div
              key="letterCompose"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-3xl border border-white/20 bg-white/40 p-8 shadow-sm md:p-12"
            >
              <h2 className="mb-2 font-serif text-3xl font-medium">Write your letter</h2>
              <p className="mb-10 text-muted-foreground">
                Optional title, your words in the center, one soft image if you&apos;d like.
              </p>

              <div className="mx-auto max-w-2xl space-y-8">
                <div>
                  <label className="mb-2 block text-sm font-medium">Title (optional)</label>
                  <Input
                    value={letterTitle}
                    onChange={(e) => setLetterTitle(e.target.value)}
                    placeholder="e.g., For you, on your birthday"
                    className="h-12 bg-white/70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Letter</label>
                  <Textarea
                    value={letterBody}
                    onChange={(e) => {
                      setLetterBodyTouched(true);
                      setLetterBody(e.target.value);
                    }}
                    placeholder="Start typing…"
                    className="min-h-[280px] resize-none bg-white/80 p-6 text-base leading-relaxed shadow-inner"
                  />
                  <p className="mt-2 text-right text-xs text-muted-foreground">{letterBody.length} characters</p>
                </div>

                <div className="rounded-2xl border border-dashed border-[#FFD6E7] bg-[#FFF7FA]/80 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium">Featured image (optional)</h3>
                      <p className="text-sm text-muted-foreground">One photo beneath your words.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => letterImageInputRef.current?.click()}
                        className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-secondary"
                      >
                        <Upload className="mr-2 inline h-4 w-4" />
                        Add image
                      </button>
                      {letterImage ? (
                        <button
                          type="button"
                          onClick={() => setLetterImage(null)}
                          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <input
                    ref={letterImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLetterImageUpload}
                  />
                  {letterImage ? (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-[#FFD6E7]/80 bg-white shadow-sm">
                      <img src={letterImage} alt="" className="max-h-64 w-full object-cover" />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-10 flex justify-between border-t border-border pt-10">
                <button
                  type="button"
                  onClick={() => nextStep("letterType")}
                  className="flex items-center gap-2 rounded-full px-6 py-3 font-medium text-muted-foreground transition-colors hover:bg-secondary"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => nextStep("theme")}
                  disabled={!letterBody.trim()}
                  className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground shadow-md shadow-[#FF6B9D]/20 transition-all hover:bg-[#e85a8a] disabled:opacity-50"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* THEME SELECTION */}
          {step === "theme" && (
            <motion.div key="theme" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white/40 glass-card rounded-3xl p-8 md:p-12 shadow-sm border border-white/20">
              <h2 className="text-3xl font-serif font-medium mb-2">Select an Aesthetic Vibe</h2>
              <p className="text-muted-foreground mb-10">This defines the colors, typography, and animations of the generated website.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((t) => (
                  <div 
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group ${theme === t.id ? t.color + ' shadow-md scale-[1.02]' : 'bg-white border-border hover:border-primary/30 hover:shadow-sm'}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === t.id ? 'bg-white/50' : 'bg-secondary'}`}>
                        <t.icon className={`w-6 h-6 ${theme === t.id ? 'opacity-100' : 'text-muted-foreground'}`} />
                      </div>
                      {theme === t.id && (
                        <div className="bg-current text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          Selected
                        </div>
                      )}
                    </div>
                    <h3 className="font-serif font-medium text-xl mb-2">{t.name}</h3>
                    <p className={`text-sm ${theme === t.id ? 'opacity-90' : 'text-muted-foreground'}`}>{t.desc}</p>
                    
                    {/* Decorative background element */}
                    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${theme === t.id ? 'bg-current' : 'bg-primary'}`} />
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <button
                  type="button"
                  onClick={() => nextStep(experienceType === "letter" ? "letterCompose" : "recipient")}
                  className="text-muted-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                {experienceType === "letter" ? (
                  <button
                    type="button"
                    onClick={() => void finalizeExperience()}
                    disabled={!letterBody.trim()}
                    className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 disabled:opacity-50"
                  >
                    Create letter <Wand2 className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => nextStep("memories")}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-[#e85a8a] transition-all flex items-center gap-2 shadow-md shadow-[#FF6B9D]/20"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* MEMORY TIMELINE */}
          {step === "memories" && (
            <motion.div key="memories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white/40 glass-card rounded-3xl p-8 md:p-12 shadow-sm border border-white/20">
              <div className="flex items-start justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-serif font-medium mb-2">Build a Memory Timeline</h2>
                  <p className="text-muted-foreground">
                    Upload photos, add dates, and weave optional story notes. Suggested chapters match
                    your relationship — add only what feels right.
                  </p>
                  {relationship ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {memoryTemplates[relationshipToKey(relationship)].map((title) => (
                        <button
                          key={title}
                          type="button"
                          onClick={() => addSuggestedMemory(title)}
                          className="rounded-full border border-[#FFD6E7] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#FF6B9D] shadow-sm transition-colors hover:bg-[#FFF7FA]"
                        >
                          + {title}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary/10 text-primary hover:bg-primary/20 px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Add Photos
                </button>
                <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              </div>

              {memories.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-16 text-center bg-white/50 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-1">Upload your favorite memories</h3>
                  <p className="text-sm text-muted-foreground">We'll organize them into a stunning interactive timeline.</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {memories.map((memory, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      key={memory.id} 
                      className="flex gap-6 bg-white p-4 rounded-2xl border border-border shadow-sm group"
                    >
                      <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0 bg-secondary relative">
                        <img src={memory.image} alt="Memory" className="w-full h-full object-cover" />
                        <div className="absolute left-2 top-2 rounded-md bg-white/85 px-2 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-md">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        {memory.templateTitle ? (
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Suggested: {memory.templateTitle}
                          </p>
                        ) : null}
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Chapter title
                          </label>
                          <Input
                            value={memory.title ?? ""}
                            onChange={(e) => updateMemory(memory.id, "title", e.target.value)}
                            placeholder={memory.templateTitle || "Name this moment…"}
                            className="h-10 bg-secondary/30"
                          />
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Clear the field to use the suggested title on the published page.
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Short caption
                          </label>
                          <Input
                            value={memory.caption}
                            onChange={(e) => updateMemory(memory.id, "caption", e.target.value)}
                            placeholder="A one-line label for this moment…"
                            className="h-10 bg-secondary/30"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Story (optional)
                          </label>
                          <Textarea
                            value={memory.body ?? ""}
                            onChange={(e) => updateMemory(memory.id, "body", e.target.value)}
                            placeholder="Write what you felt, what you remember, what you want them to know…"
                            className="min-h-[88px] resize-none bg-secondary/30 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Date / Timeframe</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              type="date"
                              value={memory.date} 
                              onChange={(e) => updateMemory(memory.id, "date", e.target.value)}
                              className="h-10 bg-secondary/30 pl-10"
                            />
                          </div>
                        </div>
                        {memory.image ? (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setFeaturedMemory(memory.id)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                memory.isFeatured
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-[#FFD6E7] bg-white/80 text-[#1A1A1A]/70 hover:border-primary/40"
                              }`}
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${memory.isFeatured ? "fill-primary text-primary" : ""}`}
                              />
                              {memory.isFeatured ? "Featured image" : "Set as featured"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <button type="button" onClick={() => nextStep("theme")} className="text-muted-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => nextStep("message")} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-[#e85a8a] transition-all flex items-center gap-2 shadow-md shadow-[#FF6B9D]/20">
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* MESSAGE & AI STYLIST */}
          {step === "message" && (
            <motion.div key="message" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white/40 glass-card rounded-3xl p-8 md:p-12 shadow-sm border border-white/20">
              <h2 className="text-3xl font-serif font-medium mb-2">Write Your Heart Out</h2>
              <p className="text-muted-foreground mb-10">Add a personal message. Our AI Stylist can help make it poetic and impactful.</p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <Textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write something sweet..." 
                    className="min-h-[250px] resize-none text-lg p-6 bg-white/80 border-border/50 leading-relaxed shadow-inner"
                  />
                  <p className="text-xs text-muted-foreground text-right">{message.length} characters</p>
                </div>

                <div className="bg-gradient-to-b from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Wand2 className="w-5 h-5" />
                    <h3 className="font-serif font-medium text-lg">AI Website Stylist</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Having trouble finding the words? Let our AI elevate your message based on your chosen theme ({themes.find(t=>t.id===theme)?.name}).</p>
                  
                  <div className="space-y-3 mt-auto">
                    <button type="button" onClick={enhanceMessage} className="w-full bg-white border border-primary/30 text-primary py-3 rounded-xl text-sm font-medium hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" /> Enhance Message
                    </button>
                    <button type="button" onClick={() => setMessage("Happy Birthday! Wishing you a day filled with joy, laughter, and all your favorite things.")} className="w-full bg-white border border-border text-foreground py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
                      Keep it Simple
                    </button>
                    <button type="button" onClick={regenerateWithAI} className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#e85a8a]">
                      Regenerate with AI
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <button type="button" onClick={() => nextStep("memories")} className="text-muted-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => nextStep("delivery")} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-[#e85a8a] transition-all flex items-center gap-2 shadow-md shadow-[#FF6B9D]/20">
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCHEDULED SURPRISE */}
          {step === "delivery" && (
            <motion.div
              key="delivery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-3xl border border-white/20 bg-white/40 p-8 shadow-sm md:p-12"
            >
              <h2 className="mb-2 font-serif text-3xl font-medium">Schedule the surprise</h2>
              <p className="mb-10 text-muted-foreground">
                Optionally pick when the full experience unlocks. Before then, they see a gentle
                countdown — still emotional, still yours.
              </p>

              <div className="max-w-xl space-y-6 rounded-2xl border border-[#FFD6E7]/80 bg-white/70 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-foreground">Schedule surprise reveal</h4>
                    <p className="text-sm text-muted-foreground">
                      They tap to open, then see “unlocks in…” until the moment you choose.
                    </p>
                  </div>
                  <Switch checked={scheduleSurprise} onCheckedChange={setScheduleSurprise} />
                </div>
                {scheduleSurprise && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 border-t border-[#FFD6E7]/60 pt-5"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Date
                        </Label>
                        <Input
                          type="date"
                          value={unlockDate}
                          onChange={(e) => setUnlockDate(e.target.value)}
                          className="mt-1.5 h-12 bg-white/80"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Time
                        </Label>
                        <Input
                          type="time"
                          value={unlockTime}
                          onChange={(e) => setUnlockTime(e.target.value)}
                          className="mt-1.5 h-12 bg-white/80"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You can always open early from your account while signed in (creator only).
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="mt-10 flex justify-between border-t border-border pt-10">
                <button
                  type="button"
                  onClick={() => nextStep("message")}
                  className="flex items-center gap-2 rounded-full px-6 py-3 font-medium text-muted-foreground transition-colors hover:bg-secondary"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => nextStep("music")}
                  disabled={scheduleSurprise && !unlockDate}
                  className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground shadow-md shadow-[#FF6B9D]/20 transition-all hover:bg-[#e85a8a] disabled:opacity-50"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* BACKGROUND MUSIC */}
          {step === "music" && (
            <motion.div key="music" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white/40 glass-card rounded-3xl p-8 md:p-12 shadow-sm border border-white/20">
              <h2 className="text-3xl font-serif font-medium mb-2">Set the Mood with Music</h2>
              <p className="text-muted-foreground mb-6">
                Pick a gentle soundtrack for the published page. Playback always starts after their
                tap — browsers require a gesture for sound.
              </p>
              <audio ref={previewAudioRef} className="hidden" />

              <div className="mb-8 grid gap-6 md:grid-cols-2">
                {musicTrackOptions.map((t) => (
                  <div
                    key={t.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setUploadedMusicBase64(null);
                        setMusicTrack(t.id);
                      }
                    }}
                    onClick={() => {
                      setUploadedMusicBase64(null);
                      setMusicTrack(t.id);
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                      musicTrack === t.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-white hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          musicTrack === t.id
                            ? "bg-primary text-white"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Music className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{t.name}</h4>
                        <p className="text-sm text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                    {t.file ? (
                      <button
                        type="button"
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                          musicTrack === t.id ? "bg-primary/20 text-primary" : "bg-secondary hover:bg-secondary/80"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedMusicBase64(null);
                          setMusicTrack(t.id);
                          const el = previewAudioRef.current;
                          if (!el) return;
                          el.src = apiUrl(`/music/${t.file}.mp3`);
                          el.play().catch(() => {});
                        }}
                        aria-label={`Preview ${t.name}`}
                      >
                        <Play className="ml-0.5 h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6 border border-border border-dashed text-center">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-medium mb-1">Have a special song?</h4>
                <p className="text-sm text-muted-foreground mb-4">Upload your own MP3 file to make it truly personal.</p>
                <button
                  type="button"
                  onClick={() => musicInputRef.current?.click()}
                  className="bg-white border border-border px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-secondary transition-colors"
                >
                  Upload MP3
                </button>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  ref={musicInputRef}
                  onChange={handleMusicUpload}
                />
              </div>

              <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <button
                  type="button"
                  onClick={() => nextStep("delivery")}
                  className="flex items-center gap-2 rounded-full px-6 py-3 font-medium text-muted-foreground transition-colors hover:bg-secondary"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => void finalizeExperience()}
                  className="flex items-center gap-2 rounded-full bg-primary px-10 py-3 font-medium text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30"
                >
                  Generate Website <Wand2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* GENERATING */}
          {step === "generating" && (
            <motion.div key="generating" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative w-32 h-32 mb-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-4 border-primary border-opacity-50" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border-b-4 border-foreground border-opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center text-primary">
                  <Sparkles className="w-10 h-10 animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-3xl font-serif font-medium mb-4">
                {experienceType === "letter" ? "Sealing your letter..." : "Crafting Your Masterpiece..."}
              </h2>
              <div className="h-8 mb-8 text-muted-foreground font-medium">
                <AnimatePresence mode="wait">
                  {experienceType === "letter" ? (
                    <>
                      {progress < 34 && (
                        <motion.span key="l1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                          Choosing paper-soft colors…
                        </motion.span>
                      )}
                      {progress >= 34 && progress < 68 && (
                        <motion.span key="l2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                          Setting gentle line breaks and rhythm…
                        </motion.span>
                      )}
                      {progress >= 68 && (
                        <motion.span key="l3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                          Preparing your shareable link…
                        </motion.span>
                      )}
                    </>
                  ) : (
                    <>
                      {progress < 25 && <motion.span key="1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Structuring timeline and memories...</motion.span>}
                      {progress >= 25 && progress < 50 && <motion.span key="2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Applying the '{themes.find(t=>t.id===theme)?.name}' aesthetic...</motion.span>}
                      {progress >= 50 && progress < 75 && <motion.span key="3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Integrating background music...</motion.span>}
                      {progress >= 75 && progress < 90 && <motion.span key="4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Writing beautifully optimized HTML/CSS...</motion.span>}
                      {progress >= 90 && <motion.span key="5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Finalizing the deployment package...</motion.span>}
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full max-w-md bg-secondary rounded-full h-3 mb-3 overflow-hidden shadow-inner">
                <motion.div className="h-full bg-gradient-to-r from-primary to-pink-400" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ ease: "linear" }} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{progress}% Complete</p>
            </motion.div>
          )}

          {/* PREVIEW & SMART GIFTS */}
          
{step === "preview" && (
  <motion.div
    key="preview"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-10"
  >
    <div className="text-center">
      <h2 className="text-4xl font-serif font-medium mb-3">
        {experienceType === "letter" ? "Your letter is ready" : "Your Website is Ready!"}
      </h2>
      <p className="text-lg text-muted-foreground">
        {experienceType === "letter"
          ? `Aura saved a quiet page for ${name || "them"} — open it like a note in their pocket.`
          : `Aura has successfully generated your website for ${name}.`}
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
      <iframe
        src={
          createdWebsiteId
            ? experienceType === "letter"
              ? `/letter/${createdWebsiteId}`
              : `/w/${createdWebsiteId}`
            : ""
        }
        className="w-full h-[500px]"
        title={experienceType === "letter" ? "Letter preview" : "Website Preview"}
      />
    </div>

    <div className="max-w-xl mx-auto space-y-2">
      <label className="text-sm font-medium mb-2 block">
        {experienceType === "letter" ? "Link name (optional)" : "Website Link Name"}
      </label>
      <Input
        value={websiteLinkName}
        onChange={(e) => setWebsiteLinkName(e.target.value)}
        placeholder="e.g., ishwari-birthday"
        className="h-12 bg-white/60"
      />
      {publishError && (
        <div className="text-sm font-medium text-red-600">{publishError}</div>
      )}
      {!publishError && (
        <div className="text-xs text-muted-foreground">
          Optional. If left blank, we&apos;ll generate a random link for you.
        </div>
      )}
    </div>

    <div className="flex gap-4 justify-center">
      <button
        type="button"
        onClick={handleOpenPreview}
        className="rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:bg-[#e85a8a]"
      >
        Fullscreen Preview
      </button>

      <button
        type="button"
        onClick={handlePublishWebsite}
        className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all"
      >
        {experienceType === "letter" ? "Publish letter" : "Publish Website"}
      </button>

      <button
        type="button"
        onClick={() => setStep(experienceType === "letter" ? "letterCompose" : "recipient")}
        className="bg-gray-200 text-black px-8 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all"
      >
        Edit Details
      </button>

      {experienceType === "website" ? (
        <button
          type="button"
          onClick={handleDownloadHtml}
          className="bg-white border px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all"
        >
          Download HTML/CSS
        </button>
      ) : null}
    </div>
  </motion.div>
)}


        </AnimatePresence>
      </div>
    </div>
  );
}

