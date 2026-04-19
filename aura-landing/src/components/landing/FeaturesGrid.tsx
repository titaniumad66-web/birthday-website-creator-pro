"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Gauge,
  Lock,
  Palette,
  Rocket,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Adaptive intelligence",
    description: "Systems that learn context and respond with precision.",
  },
  {
    icon: Palette,
    title: "Signature aesthetics",
    description: "Cohesive visuals that feel unmistakably yours.",
  },
  {
    icon: Gauge,
    title: "Real-time speed",
    description: "Optimized pipelines for instant, fluid interactions.",
  },
  {
    icon: Lock,
    title: "Trusted by design",
    description: "Security and privacy woven into every layer.",
  },
  {
    icon: Users,
    title: "Human-centered",
    description: "Interfaces shaped around real people and real tasks.",
  },
  {
    icon: Rocket,
    title: "Ship faster",
    description: "From concept to launch without compromising quality.",
  },
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function FeaturesGrid() {
  return (
    <section id="features" className="relative border-t border-white/[0.06] bg-[#05051a] py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(88,28,135,0.12),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-400/90">
            Capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Everything you need to stand out
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Six pillars engineered for teams who care about craft and velocity.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-30px" }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-lg backdrop-blur-sm transition-shadow hover:border-purple-500/30 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.35)]"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-60" />
              <f.icon
                className="relative z-10 h-9 w-9 text-purple-400"
                strokeWidth={1.25}
              />
              <h3 className="relative z-10 mt-4 text-lg font-semibold text-white">
                {f.title}
              </h3>
              <p className="relative z-10 mt-2 text-sm leading-relaxed text-zinc-400">
                {f.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
