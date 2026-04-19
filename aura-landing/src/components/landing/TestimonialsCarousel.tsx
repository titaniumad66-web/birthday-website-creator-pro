"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Aura reframed how we think about product polish. Motion finally matches our ambition.",
    name: "Sarah Chen",
    role: "VP Product, Northwind",
  },
  {
    quote: "The depth and restraint in the design system is rare. It feels expensive in the best way.",
    name: "Marcus Webb",
    role: "Design Lead, Flux Labs",
  },
  {
    quote: "We shipped a flagship experience in weeks. The team hasn’t stopped talking about it.",
    name: "Elena Ruiz",
    role: "CEO, Orbit Health",
  },
  {
    quote: "Parallax done right — immersive without being gimmicky. Exactly what our brand needed.",
    name: "James Okonkwo",
    role: "Creative Director, Studio 9",
  },
] as const;

export function TestimonialsCarousel() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#05051a] py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-purple-400/90">
            Voices
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            Trusted by builders
          </h2>
        </motion.div>

        {/* Horizontal scroll: native scroll-snap + motion for entrance */}
        <div className="no-scrollbar -mx-6 flex gap-5 overflow-x-auto px-6 pb-4 pt-2 snap-x snap-mandatory md:mx-0 md:px-0">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="min-w-[min(100%,320px)] shrink-0 snap-center rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl md:min-w-[340px]"
            >
              <Quote className="h-8 w-8 text-purple-500/50" strokeWidth={1} />
              <p className="mt-4 text-sm leading-relaxed text-zinc-300 md:text-base">
                “{t.quote}”
              </p>
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="font-medium text-white">{t.name}</p>
                <p className="text-xs text-zinc-500">{t.role}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
