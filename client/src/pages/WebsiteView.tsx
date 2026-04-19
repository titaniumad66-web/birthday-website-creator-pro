import { useParams, useLocation } from "wouter";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { apiUrl } from "../lib/api";
import { toast } from "../hooks/use-toast";
import CountdownLock from "../components/surprise/CountdownLock";
import MusicPlayer from "../components/surprise/MusicPlayer";
import SurpriseEntryOverlay from "../components/surprise/SurpriseEntryOverlay";
import { musicLabelFromContent, resolveMusicSrcFromContent } from "../lib/surpriseConfig";
import RomanticTemplate from "../templates/RomanticTemplate";
import EmotionalTemplate from "../templates/EmotionalTemplate";
import FunnyTemplate from "../templates/FunnyTemplate";
import RoyalTemplate from "../templates/RoyalTemplate";
import MinimalTemplate from "../templates/MinimalTemplate";
import PastelTemplate from "../templates/PastelTemplate";

type ConfettiParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  va: number;
  color: string;
};

type MemoryItem = {
  image?: string;
  caption?: string;
  date?: string;
  templateTitle?: string;
  /** User-editable chapter title; empty uses templateTitle in published views */
  title?: string;
  isFeatured?: boolean;
  body?: string;
};

type WebsiteContent = {
  type?: string;
  name?: string;
  relationship?: string;
  confessionMode?: boolean;
  message?: string;
  theme?: string;
  memories?: MemoryItem[];
  music?: string;
  musicBase64?: string;
  musicTrack?: string;
  scheduleSurprise?: boolean;
  unlockAt?: string;
  earlyUnlocked?: boolean;
};

type TeaserStyle = "romantic" | "funny" | "premium";

function pickTeaserStyle(theme?: string): TeaserStyle {
  if (theme === "funny") return "funny";
  if (theme === "romantic" || theme === "pastel" || theme === "emotional") {
    return "romantic";
  }
  return "premium";
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let offsetY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, offsetY);
      line = words[i];
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, offsetY);
  }
  return offsetY;
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha = 0.25
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x, y + size / 4);
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 3);
  ctx.bezierCurveTo(x - size / 2, y + size, x, y + size * 1.2, x, y + size * 1.5);
  ctx.bezierCurveTo(x, y + size * 1.2, x + size / 2, y + size, x + size / 2, y + size / 3);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawConfetti(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const colors = ["#f97316", "#f43f5e", "#facc15", "#22c55e", "#38bdf8"];
  for (let i = 0; i < 120; i++) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = colors[i % colors.length];
    const x = Math.random() * width;
    const y = Math.random() * height;
    const w = 10 + Math.random() * 16;
    const h = 8 + Math.random() * 12;
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 1.5);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

function launchConfetti(durationMs = 1600) {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "70";
  document.body.appendChild(canvas);

  const resize = () => {
    canvas.width = Math.floor(window.innerWidth * window.devicePixelRatio);
    canvas.height = Math.floor(window.innerHeight * window.devicePixelRatio);
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };
  resize();

  const colors = ["#fb7185", "#fbbf24", "#a78bfa", "#60a5fa", "#34d399"];
  const particles: ConfettiParticle[] = [];
  const narrow = typeof window !== "undefined" && window.innerWidth < 640;
  const count = narrow ? 96 : 160;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: window.innerHeight * 0.25 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 10,
      vy: -Math.random() * 9 - 3,
      r: Math.random() * 5 + 3,
      a: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  const gravity = 0.28;
  const start = performance.now();
  let raf = 0;

  const onResize = () => resize();
  window.addEventListener("resize", onResize);

  const tick = (t: number) => {
    const elapsed = t - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va;

      // Fade out near the end
      const life = 1 - Math.min(1, elapsed / durationMs);
      const alpha = Math.max(0, life);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    }

    if (elapsed < durationMs) {
      raf = requestAnimationFrame(tick);
    } else {
      cleanup();
    }
  };

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    canvas.remove();
  };

  raf = requestAnimationFrame(tick);
}

export default function WebsiteView() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const lockWasShownRef = useRef(false);
  const [data, setData] = useState<WebsiteContent | null>(null);
  const [loadError, setLoadError] = useState(false);
  /** 0 = entry gate, 1 = gate exiting, 2 = content visible */
  const [openingStage, setOpeningStage] = useState<0 | 1 | 2>(0);
  const openGateTimerRef = useRef<number | null>(null);
  const [teaserUrl, setTeaserUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleGateClear, setScheduleGateClear] = useState(false);
  /** Bumps after a gesture that should try one-shot music autoplay (tap-to-open unlocked, creator open early). */
  const [musicAutoplayNonce, setMusicAutoplayNonce] = useState(0);
  const memoriesRef = useRef<HTMLElement | null>(null);
  const qrWrapRef = useRef<HTMLDivElement | null>(null);

  const opened = openingStage === 2;

  const publishedJustNow =
    new URLSearchParams(window.location.search).get("published") === "1";

  const sharePath = id ? `/w/${id}` : "";
  const shareUrl = id ? `${window.location.origin}${sharePath}` : "";

  const copyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Paste it anywhere to share your surprise." });
      return;
    } catch {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      el.style.top = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      try {
        document.execCommand("copy");
        toast({ title: "Link copied!", description: "Paste it anywhere to share your surprise." });
      } finally {
        document.body.removeChild(el);
      }
    }
  };

  const openPreviewNewTab = () => {
    if (!shareUrl) return;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const downloadQrPng = () => {
    if (!shareUrl || !id) return;
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    try {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `aura-surprise-qr-${id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast({ title: "QR saved", description: "Use it on cards, posters, or stories." });
    } catch {
      toast({
        title: "Could not download QR",
        description: "Try again or copy the link instead.",
        variant: "destructive",
      });
    }
  };

  const musicSrc = useMemo(() => (data ? resolveMusicSrcFromContent(data) : null), [data]);

  const isScheduleLocked = useMemo(() => {
    if (!data?.scheduleSurprise || !data.unlockAt) return false;
    if (data.earlyUnlocked) return false;
    if (scheduleGateClear) return false;
    const t = new Date(data.unlockAt).getTime();
    if (Number.isNaN(t)) return false;
    return Date.now() < t;
  }, [data, scheduleGateClear]);

  useEffect(() => {
    setLoadError(false);
    setScheduleGateClear(false);
    setOpeningStage(0);
    setMusicAutoplayNonce(0);
    fetch(apiUrl(`/api/websites/${id}`))
      .then((res) => res.json())
      .then((res) => {
        if (!res?.content || typeof res.content !== "string") {
          setData(null);
          setLoadError(true);
          return;
        }
        try {
          const parsed = JSON.parse(res.content) as WebsiteContent;
          if (typeof res.earlyUnlocked === "boolean") {
            parsed.earlyUnlocked = res.earlyUnlocked;
          }
          if (res.unlockAt) {
            parsed.unlockAt = new Date(res.unlockAt).toISOString();
          }
          if (parsed.type === "letter" && id) {
            setLocation(`/letter/${id}`);
            return;
          }
          setData(parsed);
        } catch {
          setData(null);
          setLoadError(true);
        }
      })
      .catch(() => {
        setData(null);
        setLoadError(true);
      });
  }, [id, setLocation]);

  useEffect(() => {
    return () => {
      if (openGateTimerRef.current != null) {
        window.clearTimeout(openGateTimerRef.current);
      }
    };
  }, []);

  const handleOpenSurprise = () => {
    if (openingStage !== 0) return;

    if (loadError) {
      setOpeningStage(1);
      openGateTimerRef.current = window.setTimeout(() => {
        setOpeningStage(2);
        openGateTimerRef.current = null;
      }, 480);
      return;
    }

    if (!data) return;

    const unlockMs = data.unlockAt ? new Date(data.unlockAt).getTime() : NaN;
    const locked =
      Boolean(data.scheduleSurprise && data.unlockAt) &&
      !data.earlyUnlocked &&
      !scheduleGateClear &&
      !Number.isNaN(unlockMs) &&
      Date.now() < unlockMs;

    if (!locked) {
      launchConfetti();
      setMusicAutoplayNonce((n) => n + 1);
    }

    setOpeningStage(1);
    const exitMs = locked ? 520 : 640;
    openGateTimerRef.current = window.setTimeout(() => {
      setOpeningStage(2);
      openGateTimerRef.current = null;
    }, exitMs);
  };

  const handleCelebrateNow = () => {
    if (memoriesRef.current) {
      memoriesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleReplaySurprise = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (openGateTimerRef.current != null) {
      window.clearTimeout(openGateTimerRef.current);
      openGateTimerRef.current = null;
    }
    setOpeningStage(0);
    setMusicAutoplayNonce(0);
  };

  const handleGenerateTeaser = async () => {
    if (!data || !id || isGenerating) return;
    setIsGenerating(true);
    setTeaserUrl(null);

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    const style = pickTeaserStyle(data?.theme);
    const name = data?.name || "Someone special";
    const headline = "Something special is waiting...";
    const subtext = `A birthday surprise has been created for ${name} 🎉`;
    const linkLabel = "Open your surprise:";
    const linkText = `/w/${id}`;

    if (style === "romantic") {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#fde2e7");
      gradient.addColorStop(0.5, "#fbcfe8");
      gradient.addColorStop(1, "#fef3c7");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 18; i++) {
        drawHeart(
          ctx,
          Math.random() * canvas.width,
          Math.random() * canvas.height * 0.9,
          40 + Math.random() * 80,
          "#fb7185",
          0.2
        );
      }
    }

    if (style === "funny") {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#fef08a");
      gradient.addColorStop(0.5, "#fca5a5");
      gradient.addColorStop(1, "#a7f3d0");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawConfetti(ctx, canvas.width, canvas.height);
    }

    if (style === "premium") {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(0.6, "#1f2937");
      gradient.addColorStop(1, "#111827");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#fbbf24";
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(80 + i * 160, 120, 8, canvas.height - 240);
      }
      ctx.restore();
    }

    const memoryImage =
      data?.memories?.find((m) => m.isFeatured && m.image)?.image ??
      data?.memories?.find((m) => m.image)?.image;
    if (memoryImage) {
      try {
        const img = await loadImage(memoryImage);
        const imgWidth = 760;
        const imgHeight = 920;
        const imgX = (canvas.width - imgWidth) / 2;
        const imgY = 280;
        const radius = 40;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(imgX + radius, imgY);
        ctx.lineTo(imgX + imgWidth - radius, imgY);
        ctx.quadraticCurveTo(imgX + imgWidth, imgY, imgX + imgWidth, imgY + radius);
        ctx.lineTo(imgX + imgWidth, imgY + imgHeight - radius);
        ctx.quadraticCurveTo(
          imgX + imgWidth,
          imgY + imgHeight,
          imgX + imgWidth - radius,
          imgY + imgHeight
        );
        ctx.lineTo(imgX + radius, imgY + imgHeight);
        ctx.quadraticCurveTo(imgX, imgY + imgHeight, imgX, imgY + imgHeight - radius);
        ctx.lineTo(imgX, imgY + radius);
        ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
        ctx.restore();
      } catch {
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(160, 360, canvas.width - 320, 760);
        ctx.restore();
      }
    }

    ctx.fillStyle = style === "premium" ? "#fbbf24" : "#111827";
    ctx.font = "700 80px 'Playfair Display', serif";
    wrapText(ctx, headline, 120, 140, canvas.width - 240, 92);

    ctx.fillStyle = style === "premium" ? "#f8fafc" : "#1f2937";
    ctx.font = "500 44px 'Inter', sans-serif";
    const subtextY = wrapText(ctx, subtext, 120, 1040, canvas.width - 240, 58) + 50;

    ctx.fillStyle = style === "premium" ? "#fbbf24" : "#111827";
    ctx.font = "600 36px 'Inter', sans-serif";
    ctx.fillText(linkLabel, 120, subtextY);

    ctx.fillStyle = style === "premium" ? "#f8fafc" : "#0f172a";
    ctx.font = "700 42px 'Inter', sans-serif";
    ctx.fillText(linkText, 120, subtextY + 56);

    ctx.fillStyle = style === "premium" ? "#f8fafc" : "#334155";
    ctx.font = "500 30px 'Inter', sans-serif";
    ctx.fillText("Made with Aura ✨", 120, canvas.height - 90);

    const url = canvas.toDataURL("image/png");
    setTeaserUrl(url);
    setIsGenerating(false);
  };

  const shareMessage = "Check this birthday surprise 🎉";
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${shareMessage} ${shareUrl}`
  )}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareMessage
  )}&url=${encodeURIComponent(shareUrl)}`;
  const content = data;
  const themeKey = content?.theme ?? "romantic";
  const templates = {
    romantic: RomanticTemplate,
    emotional: EmotionalTemplate,
    funny: FunnyTemplate,
    royal: RoyalTemplate,
    minimal: MinimalTemplate,
    pastel: PastelTemplate,
  } as const;
  const TemplateComponent =
    templates[themeKey as keyof typeof templates] ?? RomanticTemplate;
  const themeLabels: Record<string, string> = {
    romantic: "Romantic",
    emotional: "Emotional",
    funny: "Funny",
    royal: "Royal",
    minimal: "Minimal",
    pastel: "Soft Pastel",
  };
  const musicLabel = content ? musicLabelFromContent(content) : undefined;
  const themeLabel = content?.theme ? themeLabels[content.theme] ?? content.theme : undefined;
  const actions = content ? (
    <div className="space-y-4">
      <MusicPlayer
        src={musicSrc}
        canInteract={opened && !isScheduleLocked}
        attemptAutoplayKey={musicAutoplayNonce}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerateTeaser}
          disabled={isGenerating}
          className="rounded-full border border-[#FFD6E7] bg-white px-6 py-3 text-sm font-semibold text-[#1A1A1A] shadow-sm transition-transform hover:scale-[1.02] hover:bg-[#FFF7FA] disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : "Generate Instagram Teaser"}
        </button>
        {teaserUrl && (
          <a
            href={teaserUrl}
            download={`birthday-teaser-${id}.png`}
            className="inline-flex rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#ff8fb3] px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_24px_-4px_rgba(255,107,157,0.35)] transition-transform hover:scale-[1.02]"
          >
            Download Instagram Story
          </a>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void copyLink()}
          className="rounded-full border border-[#FFD6E7] bg-[#FFE4EC]/50 px-5 py-2.5 text-sm font-medium text-[#1A1A1A] shadow-sm transition-transform hover:bg-[#FFD6E7]/60"
        >
          Copy link
        </button>
        <button
          type="button"
          onClick={openPreviewNewTab}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD6E7] bg-white/90 px-5 py-2.5 text-sm font-medium text-[#1A1A1A] shadow-sm transition-transform hover:bg-[#FFF7FA]"
        >
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          Preview
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-[#FFD6E7] bg-[#FFE4EC]/50 px-5 py-2.5 text-sm font-medium text-[#1A1A1A] shadow-sm transition-transform hover:bg-[#FFD6E7]/60"
        >
          WhatsApp
        </a>
        <a
          href={twitterHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-[#FFD6E7] bg-[#FFE4EC]/50 px-5 py-2.5 text-sm font-medium text-[#1A1A1A] shadow-sm transition-transform hover:bg-[#FFD6E7]/60"
        >
          Twitter (X)
        </a>
        <button
          type="button"
          onClick={handleReplaySurprise}
          className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#ff8fb3] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
        >
          Replay Surprise 🎁
        </button>
      </div>
    </div>
  ) : null;
  const qrNode = shareUrl ? (
    <div ref={qrWrapRef} className="flex flex-col items-start gap-3">
      <div className="rounded-2xl border border-[#FFD6E7] bg-white p-4 shadow-md">
        <QRCodeCanvas value={shareUrl} size={160} includeMargin />
      </div>
      <button
        type="button"
        onClick={downloadQrPng}
        className="rounded-full border border-[#FFD6E7] bg-white/90 px-4 py-2 text-xs font-semibold text-[#1A1A1A]/80 shadow-sm transition-colors hover:bg-[#FFF7FA]"
      >
        Download QR
      </button>
      <p className="text-sm text-[#1A1A1A]/55">Scan to open this birthday surprise</p>
    </div>
  ) : null;

  if (opened && content && id && content.scheduleSurprise && content.unlockAt && isScheduleLocked) {
    lockWasShownRef.current = true;
  }

  const surpriseMain = content ? (
    <TemplateComponent
      name={content.name}
      relationship={content.relationship}
      confessionMode={Boolean(content.confessionMode)}
      message={content.message}
      memories={content.memories}
      themeLabel={themeLabel}
      musicLabel={musicLabel}
      actions={actions}
      qr={qrNode}
      memoryRef={memoriesRef}
      onCelebrate={handleCelebrateNow}
      sequentialReveal={Boolean(opened && !isScheduleLocked)}
    />
  ) : null;

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#FFF7FA] via-[#FFE4EC]/40 to-[#FFF7FA] text-[#1A1A1A] ${
        opened ? "overflow-auto" : "overflow-hidden"
      }`}
    >
      <SurpriseEntryOverlay
        show={openingStage < 2}
        exiting={openingStage === 1}
        readyToOpen={Boolean(data) || loadError}
        loadError={loadError}
        onTapOpen={handleOpenSurprise}
      />

      {opened && publishedJustNow && id && (
        <div className="fixed left-1/2 top-6 z-50 w-[min(720px,calc(100%-2rem))] -translate-x-1/2">
          <div className="rounded-3xl border border-[#FFD6E7] bg-white/90 p-4 shadow-lg backdrop-blur-md">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#1A1A1A]">Website Published</div>
                <div className="mt-1 truncate text-sm text-[#1A1A1A]/60">
                  <span className="font-mono">{sharePath}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => void copyLink()}
                  type="button"
                  className="bg-primary text-primary-foreground hover:bg-[#e85a8a] px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Only reveal site after opening */}
      {opened && (
        <>
          {!content && !loadError ? (
            <div className="h-screen flex items-center justify-center text-xl">
              Loading...
            </div>
          ) : loadError ? (
            <div className="h-screen flex items-center justify-center text-xl">
              This birthday surprise is unavailable right now.
            </div>
          ) : content && id && content.scheduleSurprise && content.unlockAt ? (
            <AnimatePresence mode="wait">
              {isScheduleLocked ? (
                <motion.div
                  key="countdown-lock"
                  className="w-full"
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CountdownLock
                    websiteId={id}
                    unlockAt={content.unlockAt!}
                    recipientName={content.name}
                    onUnlocked={() => setScheduleGateClear(true)}
                    onEarlyOpened={() => {
                      setScheduleGateClear(true);
                      setData((prev) => (prev ? { ...prev, earlyUnlocked: true } : null));
                      setMusicAutoplayNonce((n) => n + 1);
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="scheduled-reveal"
                  className="w-full"
                  initial={
                    lockWasShownRef.current ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {surpriseMain}
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <motion.div
              key="surprise-reveal"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {surpriseMain}
            </motion.div>
          )}
        </>
      )}

    </div>
  );
}

