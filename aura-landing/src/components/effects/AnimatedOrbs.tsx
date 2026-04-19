"use client";

/**
 * Lightweight “particle” substitute: animated gradient orbs.
 * Pure CSS transforms + Framer Motion — no canvas, stays 60fps-friendly.
 */
import { motion } from "framer-motion";

export function AnimatedOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-1/4 top-0 h-[min(80vw,600px)] w-[min(80vw,600px)] rounded-full bg-purple-600/30 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/4 top-1/3 h-[min(70vw,520px)] w-[min(70vw,520px)] rounded-full bg-blue-600/25 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, 50, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[min(50vw,400px)] w-[min(50vw,400px)] rounded-full bg-cyan-500/20 blur-[100px]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
