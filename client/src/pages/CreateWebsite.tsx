import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, Type, Sparkles, Wand2, Upload, 
  ChevronRight, ChevronLeft, CheckCircle2, Loader2, PlayCircle, Eye,
  Music, Heart, Gift, Crown, Smile, Cloud, Download, Lock, MapPin, Play, Pause, Calendar
} from "lucide-react";
import { useLocation } from "wouter";
import { getValidAuthToken, getAuthPayload } from "@/lib/queryClient";

// Components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Images
import mockupImg from "@/assets/images/website-mockup.png";
import gift1 from "@/assets/images/gift-1.png";
import gift2 from "@/assets/images/gift-2.png";

type Step = "welcome" | "recipient" | "theme" | "memories" | "message" | "music" | "generating" | "preview";

interface Memory {
  id: string;
  image: string;
  caption: string;
  date: string;
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
  
  // Form State
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [confessionMode, setConfessionMode] = useState(false);
  const [theme, setTheme] = useState("romantic");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [message, setMessage] = useState("");
  const [music, setMusic] = useState("piano");
  const [isPlaying, setIsPlaying] = useState(false);
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

  useEffect(() => {
    const run = async () => {
      const token = getValidAuthToken();
      if (!token) return;
      const payload = getAuthPayload();
      if (payload?.role === "admin") return; // Admins skip monetization redirect
      try {
        const res = await fetch("/api/monetization/check", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.allowed === false) {
          setLocation("/pay");
        }
      } catch {
      }
    };
    run();
  }, [setLocation]);

  useEffect(() => {
    const context = {
      name,
      relationship,
      theme,
      confessionMode,
      memoriesCount: memories.length,
      message,
    };
    sessionStorage.setItem("aura_ai_context", JSON.stringify(context));
    window.dispatchEvent(new Event("aura-ai-context"));
  }, [name, relationship, theme, confessionMode, memories.length, message]);

  const themes = [
    { id: "romantic", name: "Romantic", icon: Heart, desc: "Deep reds, elegant serifs, soft fades", color: "bg-red-50 border-red-200 text-red-700" },
    { id: "emotional", name: "Emotional", icon: Cloud, desc: "Warm pastels, poetic typography, slow reveals", color: "bg-orange-50 border-orange-200 text-orange-700" },
    { id: "funny", name: "Funny", icon: Smile, desc: "Bright colors, playful fonts, bouncy animations", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
    { id: "royal", name: "Royal", icon: Crown, desc: "Gold accents, luxurious dark backgrounds", color: "bg-purple-50 border-purple-200 text-purple-700" },
    { id: "minimal", name: "Minimal", icon: ImageIcon, desc: "Clean whites, modern sans-serif, sharp lines", color: "bg-slate-50 border-slate-200 text-slate-700" },
    { id: "pastel", name: "Soft Pastel", icon: Sparkles, desc: "Dreamy gradients, bubbly shapes, soft glow", color: "bg-pink-50 border-pink-200 text-pink-700" },
  ];

  const tracks = [
    { id: "piano", name: "Soft Piano Melody", desc: "Emotional & cinematic" },
    { id: "lofi", name: "Lofi Chill Vibes", desc: "Relaxed & modern" },
    { id: "acoustic", name: "Acoustic Sunset", desc: "Warm & intimate" },
    { id: "upbeat", name: "Upbeat Pop", desc: "Happy & energetic" },
  ];

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
    setMemories(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  }

  const enhanceMessage = () => {
    setMessage("Every memory we've created together is a treasure I hold close to my heart. On this special day, I want to remind you of how uniquely beautiful your soul is, and how much light you bring into my world. Happy Birthday, may your day be as extraordinary as you are.");
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
    const musicSrc =
      uploadedMusicBase64 ??
      (music ? `${window.location.origin}/music/${music}.mp3` : "");

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
      window.open(`/w/${createdWebsiteId}`, "_blank", "noopener,noreferrer");
      return;
    }

    const d = encodePreviewPayload({
      name,
      relationship,
      confessionMode,
      message,
      memories,
      theme,
      music: uploadedMusicBase64 ?? music,
    });
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
    const effectiveMusic = uploadedMusicBase64 ?? music;

    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: websiteLinkName.trim()
            ? `${websiteLinkName.trim()} — ${name}'s Birthday Website`
            : `${name}'s Birthday Website`,
          theme,
          content: JSON.stringify({
            name,
            relationship,
            confessionMode,
            memories,
            message,
            theme,
            music: effectiveMusic,
          }),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to publish website");
      }

      const data = await res.json();
      setCreatedWebsiteId(data.id);
      setLocation(`/w/${data.id}?published=1`);
    } catch (err) {
      setPublishError(
        "Publishing failed. Please check your connection and try again."
      );
    } finally {
      setIsPublishing(false);
    }
  };

 const handleGenerate = async () => {
  setStep("generating");
  setProgress(0);

  const token = getValidAuthToken();
  if (!token) {
    setStep("music");
    setLocation("/login");
    return;
  }

  const interval = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 100) {
        clearInterval(interval);
        return 100;
      }
      return prev + 2;
    });
  }, 100);

  try {
    const res = await fetch("/api/websites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: `${name}'s Birthday Website`,
        theme,
        content: JSON.stringify({
          name,
          relationship,
          confessionMode,
          memories,
          message,
          music: uploadedMusicBase64 ?? music,
        }),
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create website");
    }

   const data = await res.json();
    setCreatedWebsiteId(data.id);

    setTimeout(() => {
      setStep("preview");
    }, 500);

  } catch (error) {
    alert("Something went wrong while creating the website.");
    clearInterval(interval);
    setProgress(0);
    setStep("music");
  }
};

  const nextStep = (next: Step) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(next);
  };

  const renderProgress = () => {
    const steps: Step[] = ["recipient", "theme", "memories", "message", "music"];
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

  return (
    <div className="min-h-screen bg-background pt-8 pb-24 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {step !== "welcome" && step !== "generating" && step !== "preview" && renderProgress()}

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
                onClick={() => nextStep("recipient")}
                className="bg-foreground text-background px-10 py-4 rounded-full font-medium text-lg hover:bg-foreground/90 transition-all flex items-center gap-2 mx-auto shadow-xl hover:-translate-y-1"
              >
                Let's Begin <ChevronRight className="w-5 h-5" />
              </button>
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
              </div>

              <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <button type="button" onClick={() => nextStep("welcome")} className="text-muted-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => nextStep("theme")}
                  disabled={!name || !relationship}
                  className="bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
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
                <button type="button" onClick={() => nextStep("recipient")} className="text-muted-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => nextStep("memories")} className="bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-all flex items-center gap-2">
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* MEMORY TIMELINE */}
          {step === "memories" && (
            <motion.div key="memories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white/40 glass-card rounded-3xl p-8 md:p-12 shadow-sm border border-white/20">
              <div className="flex items-start justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-serif font-medium mb-2">Build a Memory Timeline</h2>
                  <p className="text-muted-foreground">Upload photos and add dates to create a beautiful storytelling journey.</p>
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
                        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-md">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Caption / Story</label>
                          <Input 
                            value={memory.caption} 
                            onChange={(e) => updateMemory(memory.id, "caption", e.target.value)}
                            placeholder="e.g., The day we first met at the coffee shop..." 
                            className="h-10 bg-secondary/30"
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <button type="button" onClick={() => nextStep("theme")} className="text-muted-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => nextStep("message")} className="bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-all flex items-center gap-2">
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
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <button type="button" onClick={() => nextStep("memories")} className="text-muted-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => nextStep("music")} className="bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-all flex items-center gap-2">
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* BACKGROUND MUSIC */}
          {step === "music" && (
            <motion.div key="music" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white/40 glass-card rounded-3xl p-8 md:p-12 shadow-sm border border-white/20">
              <h2 className="text-3xl font-serif font-medium mb-2">Set the Mood with Music</h2>
              <p className="text-muted-foreground mb-10">Select a background track that will play automatically when they open the website.</p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {tracks.map((t) => (
                  <div 
                    key={t.id}
                    onClick={() => setMusic(t.id)}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${music === t.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-white hover:border-primary/30'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${music === t.id ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{t.name}</h4>
                        <p className="text-sm text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${music === t.id ? 'bg-primary/20 text-primary' : 'bg-secondary hover:bg-secondary/80'}`}
                      onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                    >
                      {music === t.id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
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
                <button type="button" onClick={() => nextStep("message")} className="text-muted-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={handleGenerate} className="bg-primary text-white px-10 py-3 rounded-full font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-primary/30 shadow-primary/20">
                  Generate Website <Wand2 className="w-4 h-4" />
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
              
              <h2 className="text-3xl font-serif font-medium mb-4">Crafting Your Masterpiece...</h2>
              <div className="h-8 mb-8 text-muted-foreground font-medium">
                <AnimatePresence mode="wait">
                  {progress < 25 && <motion.span key="1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Structuring timeline and memories...</motion.span>}
                  {progress >= 25 && progress < 50 && <motion.span key="2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Applying the '{themes.find(t=>t.id===theme)?.name}' aesthetic...</motion.span>}
                  {progress >= 50 && progress < 75 && <motion.span key="3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Integrating background music...</motion.span>}
                  {progress >= 75 && progress < 90 && <motion.span key="4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Writing beautifully optimized HTML/CSS...</motion.span>}
                  {progress >= 90 && <motion.span key="5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Finalizing the deployment package...</motion.span>}
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
        Your Website is Ready!
      </h2>
      <p className="text-lg text-muted-foreground">
        Aura has successfully generated your website for {name}.
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
      <iframe
        src={createdWebsiteId ? `/w/${createdWebsiteId}` : ""}
        className="w-full h-[500px]"
        title="Website Preview"
      />
    </div>

    <div className="max-w-xl mx-auto space-y-2">
      <label className="text-sm font-medium mb-2 block">Website Link Name</label>
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
        className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-black/90 transition-all"
      >
        Fullscreen Preview
      </button>

      <button
        type="button"
        onClick={handlePublishWebsite}
        className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all"
      >
        Publish Website
      </button>

      <button
        type="button"
        onClick={() => setStep("recipient")}
        className="bg-gray-200 text-black px-8 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all"
      >
        Edit Details
      </button>

      <button
        type="button"
        onClick={handleDownloadHtml}
        className="bg-white border px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all"
      >
        Download HTML/CSS
      </button>
    </div>
  </motion.div>
)}


        </AnimatePresence>
      </div>
    </div>
  );
}
