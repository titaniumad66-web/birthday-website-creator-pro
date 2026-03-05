import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { Link } from "wouter";
import { getAuthPayload, getValidAuthToken } from "@/lib/queryClient";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Wand2,
  Music,
  Heart,
  Download,
  Share2,
  QrCode,
  RefreshCcw,
  Gift,
  PlayCircle,
} from "lucide-react";

import heroBg from "@/assets/images/hero-bg.png";
import story1 from "@/assets/images/story-1.png";
import story2 from "@/assets/images/story-2.png";
import gift1 from "@/assets/images/gift-1.png";
import gift2 from "@/assets/images/gift-2.png";

type TemplateItem = { id: string; title: string; imageUrl: string };

type HeroSectionProps = {
  onPrimaryHref: string;
  onSecondaryHref: string;
};

function HeroSection({ onPrimaryHref, onSecondaryHref }: HeroSectionProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x1 = useTransform(mx, (v) => v * 0.02);
  const y1 = useTransform(my, (v) => v * 0.02);
  const x2 = useTransform(mx, (v) => v * -0.015);
  const y2 = useTransform(my, (v) => v * -0.015);
  const x3 = useTransform(mx, (v) => v * 0.01);
  const y3 = useTransform(my, (v) => v * 0.01);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-white via-[#f7f3ff] to-[#ffeef7] text-foreground"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        mx.set(((e.clientX - cx) / rect.width) * 200);
        my.set(((e.clientY - cy) / rect.height) * 200);
      }}
    >
      <motion.div
        animate={{ y: [0, -18, 0], opacity: [0.55, 0.75, 0.55] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -right-16 h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/25 blur-[120px] hidden md:block"
        style={{ x: x1, y: y1 }}
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.55, 0.75, 0.55] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-24 -left-16 h-[32rem] w-[32rem] rounded-full bg-purple-400/25 blur-[120px] hidden md:block"
        style={{ x: x2, y: y2 }}
      />
      <motion.div
        animate={{ y: [0, -14, 0], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/25 blur-[120px] hidden md:block"
        style={{ x: x3, y: y3 }}
      />
      <div className="container relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pt-28 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/60 px-5 py-2 text-sm font-medium text-foreground/80 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Powered by Aura AI
          </div>
          <h1 className="font-sans text-4xl md:text-7xl font-semibold leading-tight tracking-tight">
            Create Beautiful Birthday Websites in Seconds
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-foreground/70">
            Design unforgettable digital celebrations with the power of AI.
          </p>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link href={onPrimaryHref}>
              <button
                type="button"
                className="h-14 w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-10 text-white shadow-lg transition-all hover:opacity-95"
              >
                Create Website
              </button>
            </Link>
            <Link href={onSecondaryHref}>
              <button
                type="button"
                className="h-14 w-full sm:w-auto rounded-full border border-purple-200 bg-white/70 px-10 text-foreground shadow-sm transition-all hover:bg-white"
              >
                View Templates
              </button>
            </Link>
          </div>
          <Link href="/preview">
            <button
              type="button"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-purple-700"
            >
              <span className="inline-flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                Watch demo
              </span>
            </button>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative hidden md:block"
        >
          <DynamicHeroImage />
        </motion.div>
      </div>
    </section>
  );
}

function useSiteImage(section: string) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await fetch(`/api/site-images?section=${encodeURIComponent(section)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setUrl(Array.isArray(data) && data.length ? data[0].imageUrl : null);
      } catch {
        // ignore
      }
    };
    run();
    const onUpdated = (e: Event) => {
      try {
        const d = (e as CustomEvent).detail;
        if (!d || d.section !== section) return;
      } catch {}
      run();
    };
    window.addEventListener("site-images-updated", onUpdated as any);
    return () => {
      mounted = false;
      window.removeEventListener("site-images-updated", onUpdated as any);
    };
  }, [section]);
  return url;
}

function DynamicHeroImage() {
  const url = useSiteImage("hero");
  const src = url || heroBg;
  const [busy, setBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const payload = getAuthPayload();
    setIsAdmin(payload?.role === "admin");
  }, []);
  const onPick = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    ev.currentTarget.value = "";
    const token = getValidAuthToken();
    if (!token) return;
    setBusy(true);
    try {
      const res0 = await fetch(`/api/site-images?section=${encodeURIComponent("hero")}`);
      const list = res0.ok ? await res0.json() : [];
      const existingId = Array.isArray(list) && list.length ? list[0].id : null;
      const form = new FormData();
      form.append("section_name", "hero");
      form.append("image", f);
      const url = existingId ? `/api/site-images/${existingId}` : "/api/site-images";
      const method = existingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("site-images-updated", { detail: { section: "hero" } }));
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="relative rounded-[2rem] border border-purple-200/60 bg-white/70 p-2 shadow-xl backdrop-blur">
      <img src={src} alt="Celebration" className="w-full rounded-[1.6rem] object-cover" />
      {isAdmin && (
        <label className="absolute top-3 right-3 inline-flex items-center rounded-full border border-border bg-white/90 px-3 py-1 text-xs font-semibold cursor-pointer hover:bg-white">
          <input type="file" accept="image/*" className="hidden" onChange={onPick} />
          {busy ? "Uploading..." : "Replace Image"}
        </label>
      )}
    </div>
  );
}

function DynamicSectionImage({ section, alt }: { section: string; alt: string }) {
  const url = useSiteImage(section);
  const [busy, setBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const payload = getAuthPayload();
    setIsAdmin(payload?.role === "admin");
  }, []);
  const onPick = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    ev.currentTarget.value = "";
    const token = getValidAuthToken();
    if (!token) return;
    setBusy(true);
    try {
      const res0 = await fetch(`/api/site-images?section=${encodeURIComponent(section)}`);
      const list = res0.ok ? await res0.json() : [];
      const existingId = Array.isArray(list) && list.length ? list[0].id : null;
      const form = new FormData();
      form.append("section_name", section);
      form.append("image", f);
      const url = existingId ? `/api/site-images/${existingId}` : "/api/site-images";
      const method = existingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("site-images-updated", { detail: { section } }));
      }
    } finally {
      setBusy(false);
    }
  };
  if (!url) return null;
  return (
    <div className="relative rounded-[2rem] border border-purple-200/60 bg-white/70 p-2 shadow-xl backdrop-blur">
      <img src={url} alt={alt} className="w-full rounded-[1.6rem] object-cover" />
      {isAdmin && (
        <label className="absolute top-3 right-3 inline-flex items-center rounded-full border border-border bg-white/90 px-3 py-1 text-xs font-semibold cursor-pointer hover:bg-white">
          <input type="file" accept="image/*" className="hidden" onChange={onPick} />
          {busy ? "Uploading..." : "Replace Image"}
        </label>
      )}
    </div>
  );
}

type StepItem = { title: string; description: string; icon: ComponentType<{ className?: string }> };

function StoryBlock({
  eyebrow,
  title,
  description,
  image,
  reverse,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
}) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-white via-[#faf7ff] to-[#fff5fa]">
      <div className="container mx-auto px-6 py-24 max-w-7xl">
        <div
          className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? "lg:grid-flow-dense" : ""}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9 }}
            className={`${reverse ? "lg:col-start-2" : ""}`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/70 px-4 py-1 text-xs font-semibold">
              {eyebrow}
            </div>
            <h2 className="mt-6 font-sans text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05]">
              {title}
            </h2>
            <p className="mt-4 max-w-xl text-base sm:text-lg md:text-xl text-foreground/70">
              {description}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className={`${reverse ? "lg:col-start-1" : ""}`}
          >
            <div className="relative rounded-[2rem] border border-purple-200/60 bg-white/70 p-2 backdrop-blur shadow-xl">
              <img
                src={image}
                alt=""
                className="aspect-[4/3] w-full rounded-[1.6rem] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

type FeatureItem = { title: string; description: string; icon: ComponentType<{ className?: string }> };

function TemplateScrollerSection({ items }: { items: { title: string; image: string }[] }) {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-white via-[#faf7ff] to-[#fff5fa]">
      <div className="container mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-purple-700/70">Template Showcase</p>
          <h2 className="mt-3 font-sans text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05]">
            Explore cinematic themes
          </h2>
        </motion.div>
        <div className="mt-6">
          <DynamicSectionImage section="templates" alt="Templates Preview" />
        </div>
        <div className="mt-12 overflow-x-auto no-scrollbar">
          <div className="flex snap-x snap-mandatory gap-6">
            {items.map((item, i) => (
              <motion.div
                key={`${item.title}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="snap-center"
              >
                <div className="group relative w-[76vw] sm:w-[60vw] md:w-[520px] lg:w-[560px]">
                    <div className="rounded-[2rem] border border-purple-200/60 bg-white/70 p-2 backdrop-blur shadow-xl">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="aspect-[9/14] w-full rounded-[1.6rem] object-cover"
                    />
                  </div>
                  <div className="mt-4 text-lg font-medium text-foreground">{item.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type ShowcaseItem = { title: string; image: string };

function TemplatesSection({ showcase }: { showcase: ShowcaseItem[] }) {
  return (
    <section className="min-h-screen flex items-center bg-background">
      <div className="container mx-auto px-4 max-w-6xl py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-primary/70 mb-3">
            Template Showcase
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold mb-4">
            A birthday website aesthetic for every vibe
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Choose from premium layouts that feel handcrafted for the moment.
          </p>
        </motion.div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {showcase.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="rounded-3xl overflow-hidden border border-white/50 bg-white/70 shadow-xl hover:-translate-y-1 transition-transform"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>
              <div className="p-4 space-y-3 text-center">
                <div className="text-sm font-medium">{item.title}</div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/templates">
                    <button
                      type="button"
                      className="rounded-full border border-border px-4 py-1 text-xs font-semibold text-foreground hover:bg-secondary transition-colors min-h-10"
                    >
                      View
                    </button>
                  </Link>
                  <a
                    href={item.image}
                    download
                    className="rounded-full bg-foreground px-4 py-1 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors min-h-10 inline-flex items-center justify-center"
                  >
                    Download
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialTeasersSection() {
  return null;
}

function AISection() {
  const celebrationUrl = useSiteImage("celebration");
  const aiMagicUrl = useSiteImage("ai-magic");
  const [busy, setBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const payload = getAuthPayload();
    setIsAdmin(payload?.role === "admin");
  }, []);
  const onPick = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    ev.currentTarget.value = "";
    const token = getValidAuthToken();
    if (!token) return;
    setBusy(true);
    try {
      const section = aiMagicUrl ? "ai-magic" : "celebration";
      const res0 = await fetch(`/api/site-images?section=${encodeURIComponent(section)}`);
      const list = res0.ok ? await res0.json() : [];
      const existingId = Array.isArray(list) && list.length ? list[0].id : null;
      const form = new FormData();
      form.append("section_name", section);
      form.append("image", f);
      const url = existingId ? `/api/site-images/${existingId}` : "/api/site-images";
      const method = existingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("site-images-updated", { detail: { section } }));
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="min-h-screen flex items-center bg-gradient-to-b from-white via-[#faf7ff] to-[#fff5fa]">
      <div className="container mx-auto px-6 max-w-7xl py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-purple-700/70">
              Aura AI
            </p>
            <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05]">
              Meet Aura AI
            </h2>
            <p className="text-foreground/70 text-base sm:text-lg">
              A smart assistant that helps you design the perfect birthday surprise with
              theme guidance, message polish, and creative ideas.
            </p>
            <Link href="/create">
              <button
                type="button"
                className="h-12 w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-8 text-white font-medium shadow-lg transition-all hover:opacity-95"
              >
                Try Aura AI <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9 }}
            className="rounded-[2.5rem] border border-purple-200/60 bg-white/70 p-4 sm:p-6 shadow-xl backdrop-blur"
          >
            {(aiMagicUrl || celebrationUrl) ? (
              <div className="relative rounded-[2rem] border border-purple-200/60 bg-white/70 p-2 shadow-xl backdrop-blur">
                <img src={aiMagicUrl ?? celebrationUrl ?? undefined} alt="AI Magic" className="w-full rounded-[1.6rem] object-cover" />
                {isAdmin && (
                  <label className="absolute top-3 right-3 inline-flex items-center rounded-full border border-border bg-white/90 px-3 py-1 text-xs font-semibold cursor-pointer hover:bg-white">
                    <input type="file" accept="image/*" className="hidden" onChange={onPick} />
                    {busy ? "Uploading..." : "Replace Image"}
                  </label>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-purple-200/60 bg-white p-5 shadow-lg">
                <div className="text-sm font-semibold text-foreground">Aura AI ✨</div>
                <p className="text-xs text-foreground/70">Your design assistant</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-purple-50 px-4 py-2 text-sm text-foreground">
                    Which vibe suits a romantic surprise?
                  </div>
                  <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm text-white">
                    Try Romantic or Pastel. Keep the message soft and heartfelt.
                  </div>
                  <div className="rounded-2xl bg-purple-50 px-4 py-2 text-sm text-foreground">
                    Can you improve my birthday message?
                  </div>
                  <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm text-white">
                    Absolutely. I’ll craft a more emotional version for you.
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-full border border-purple-200/60 bg-white/70 px-3 py-2 text-xs text-foreground/70">
                  Type your question...
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const quotes = [
    {
      text: "Made my girlfriend's birthday unforgettable.",
      author: "Rohan",
    },
    {
      text: "Amazing surprise website.",
      author: "Priya",
    },
  ];

  return (
    <section className="min-h-screen flex items-center bg-secondary/30">
      <div className="container mx-auto px-4 max-w-6xl py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-primary/70 mb-3">
            Loved by users
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold mb-4">
            Real moments, real reactions
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {quotes.map((q, i) => (
            <motion.div
              key={q.text}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-md"
            >
              <p className="text-lg md:text-xl text-foreground/90">{`“${q.text}”`}</p>
              <div className="mt-4 text-sm text-muted-foreground">— {q.author}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function YoungCreatorsSection() {
  const founder = { name: "Anuj Dhavane", role: "Founder" };
  const cofounders = [
    { name: "Sahil", role: "Cofounder" },
    { name: "Amit", role: "Cofounder" },
    { name: "Kartik", role: "Cofounder" },
    { name: "Krishna", role: "Cofounder" },
  ];

  return (
    <section className="min-h-screen flex items-center bg-gradient-to-b from-white via-[#f7f3ff] to-[#ffeef7]">
      <div className="container mx-auto px-6 max-w-7xl py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-purple-700/70 mb-3">
            Built by Young Creators
          </p>
          <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl font-semibold">
            Passion, design, and a bit of magic
          </h2>
          <p className="mt-3 text-foreground/70 text-base sm:text-lg">
            A small team crafting joyful digital celebrations.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-purple-200/60 bg-white/70 p-6 shadow-xl backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-purple-700/70 mb-2">
              Founder
            </p>
            <div className="rounded-2xl bg-white p-6 shadow-md border border-purple-200/60">
              <h3 className="text-2xl font-semibold">{founder.name}</h3>
              <p className="text-foreground/70">{founder.role}</p>
            </div>
          </div>
          {cofounders.map((person) => (
            <div
              key={person.name}
              className="rounded-3xl border border-purple-200/60 bg-white/70 p-6 shadow-xl backdrop-blur"
            >
              <div className="rounded-2xl bg-white p-6 shadow-md border border-purple-200/60">
                <h4 className="text-xl font-semibold">{person.name}</h4>
                <p className="text-foreground/70">{person.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type TeamMember = { name: string; role: string };

function FounderSection({ founder, cofounders }: { founder: TeamMember; cofounders: TeamMember[] }) {
  return (
    <section className="min-h-screen flex items-center bg-secondary/30">
      <div className="container mx-auto px-4 max-w-6xl py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-primary/70 mb-3">
            Built With Passion
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold mb-4">
            Built With Passion
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            A small team crafting the most magical birthday experiences online.
          </p>
        </motion.div>
        <div className="mt-16 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-primary/70 mb-4">
              Founder
            </p>
            <div className="rounded-3xl bg-white/90 p-6 shadow-lg hover:-translate-y-1 transition-transform">
              <h3 className="text-2xl font-semibold">{founder.name}</h3>
              <p className="text-muted-foreground">{founder.role}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-primary/70 mb-4">
              Cofounders
            </p>
            <div className="grid gap-4">
              {cofounders.map((person) => (
                <div
                  key={person.name}
                  className="rounded-3xl bg-white/90 p-5 shadow-lg hover:-translate-y-1 transition-transform"
                >
                  <h4 className="text-lg font-semibold">{person.name}</h4>
                  <p className="text-muted-foreground text-sm">{person.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="min-h-screen flex items-center bg-[linear-gradient(180deg,_#fff7fb,_#f6f1ff)]">
      <div className="container mx-auto px-4 py-24 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="font-sans text-[36px] sm:text-[44px] md:text-[56px] font-semibold">
            Create a magical surprise today.
          </h2>
          <p className="text-foreground/70 text-base sm:text-lg md:text-xl">
            Start crafting a personalized experience that feels joyful and premium.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/create">
              <button
                type="button"
                className="h-14 w-full sm:w-auto px-10 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-medium text-lg shadow-xl hover:opacity-95 transition-all"
              >
                Create Website
              </button>
            </Link>
            <Link href="/templates">
              <button
                type="button"
                className="h-14 w-full sm:w-auto px-10 rounded-full border border-purple-200 bg-white text-foreground font-medium text-lg hover:bg-white/90 transition-all"
              >
                Explore Templates
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BuilderFlowSection() {
  const steps = [
    { title: "Enter Details", desc: "Tell us who it’s for and add memories." },
    { title: "AI Designs", desc: "Aura crafts a beautiful website instantly." },
    { title: "Share the Link", desc: "Send it and create a magical moment." },
  ];
  return (
    <section className="min-h-screen flex items-center bg-[linear-gradient(180deg,_#fff7fb,_#f6f1ff)]">
      <div className="container mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-purple-700/70">Website Builder Flow</p>
          <h2 className="mt-3 font-sans text-[36px] md:text-[48px] font-semibold leading-[1.05]">
            From idea to surprise in minutes
          </h2>
        </motion.div>
        <div className="mt-6">
          <DynamicSectionImage section="mockups" alt="Website Mockups" />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="rounded-2xl bg-white shadow-xl border border-purple-100 p-6 transition-transform duration-300 hover:scale-[1.02]"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-purple-700/70">Step {i + 1}</div>
              <div className="mt-2 text-xl font-semibold">{s.title}</div>
              <div className="mt-2 text-foreground/70">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="border-t border-purple-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-foreground/80">Aura — Celebrate with style ✨</div>
        <div className="flex gap-4 text-sm text-foreground/60">
          <a href="/templates" className="hover:text-foreground">Templates</a>
          <a href="/create" className="hover:text-foreground">Create</a>
          <a href="/ai-websites" className="hover:text-foreground">AI Websites</a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [templatesError, setTemplatesError] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch("/api/templates");
        if (!res.ok) {
          setTemplatesError(true);
          return;
        }
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      } catch {
        setTemplatesError(true);
      }
    };
    loadTemplates();
  }, []);

  const steps: StepItem[] = [
    {
      title: "Enter details",
      description: "Tell us who it’s for and add memories.",
      icon: Heart,
    },
    {
      title: "AI designs the website",
      description: "Aura builds a beautiful website instantly.",
      icon: Sparkles,
    },
    {
      title: "Share the surprise link",
      description: "Send the link and make their day.",
      icon: Share2,
    },
  ];

  const features: FeatureItem[] = [
    {
      title: "AI Website Generator",
      description: "Generate a premium website with one click.",
      icon: Sparkles,
    },
    {
      title: "Premium Templates",
      description: "Choose from elegant, modern designs.",
      icon: Gift,
    },
    {
      title: "Personal Messages",
      description: "Craft heartfelt notes with AI assistance.",
      icon: Music,
    },
    {
      title: "Shareable Website Links",
      description: "Share instantly via link or QR.",
      icon: QrCode,
    },
  ];

  const showcase: ShowcaseItem[] = [
    { title: "Romantic Elegance", image: story1 },
    { title: "Soft Pastel Glow", image: story2 },
    { title: "Golden Luxe", image: gift1 },
    { title: "Minimal Chic", image: gift2 },
  ];

  const founder = { name: "Anuj Dhavane", role: "Head of Project / Founder" };
  const cofounders = [
    { name: "Amit", role: "Cofounder" },
    { name: "Krishna", role: "Cofounder" },
    { name: "Sahil", role: "Cofounder" },
    { name: "Kartik", role: "Cofounder" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection onPrimaryHref="/create" onSecondaryHref="/templates" />
      <AISection />
      <TemplateScrollerSection
        items={[
          ...showcase,
          ...templates.slice(0, 6).map((t) => ({
            title: t.title || "Template",
            image: t.imageUrl,
          })),
        ]}
      />
      <BuilderFlowSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
