"use client";

/**
 * Hero parallax: background layer moves faster than headline (depth illusion).
 * useScroll maps scroll progress → translateY via useTransform.
 */
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { AnimatedOrbs } from "@/components/effects/AnimatedOrbs";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Background drifts more than text → parallax separation
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16"
    >
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <AnimatedOrbs />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,255,0.25),transparent)]" />
      </motion.div>

      {/* Floating chips — subtle motion, low cost */}
      <motion.div
        className="absolute left-[10%] top-[28%] hidden md:block"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-400 backdrop-blur-md">
          Intelligence
        </div>
      </motion.div>
      <motion.div
        className="absolute right-[12%] top-[38%] hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-400 backdrop-blur-md">
          Performance
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center"
        style={{ y: textY, opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-200"
        >
          <Sparkles className="h-4 w-4 text-purple-400" />
          Next-generation experience
        </motion.div>

        <motion.h1
          className="bg-gradient-to-b from-white via-zinc-100 to-zinc-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textShadow: "0 0 80px rgba(168,85,247,0.15)",
          }}
        >
          Experience the Power of Aura
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg text-zinc-400 md:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Elevate your digital presence with intelligent design
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <a
            href="#features"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 text-sm font-semibold text-white shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#parallax"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/10"
          >
            Explore
          </a>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <motion.div
          className="h-8 w-5 rounded-full border border-white/20"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="mx-auto mt-2 h-1.5 w-1 rounded-full bg-zinc-500"
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </section>
  );
}
