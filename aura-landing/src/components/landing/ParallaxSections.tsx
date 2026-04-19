"use client";

/**
 * Three stacked parallax bands: each section uses useScroll on its own ref
 * so foreground copy and background “layers” move at different rates.
 */
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Cpu, Layers, Zap } from "lucide-react";

const SECTIONS = [
  {
    id: "innovation",
    title: "Innovation",
    description:
      "Breakthrough interfaces that adapt to your users — built for what comes next.",
    icon: Cpu,
    gradient: "from-violet-600/20 to-transparent",
    speed: 0.35,
  },
  {
    id: "simplicity",
    title: "Simplicity",
    description:
      "Complex systems, distilled. Every interaction feels obvious and effortless.",
    icon: Layers,
    gradient: "from-blue-600/20 to-transparent",
    speed: 0.5,
  },
  {
    id: "performance",
    title: "Performance",
    description:
      "Silky motion, instant feedback, and experiences that stay fast at scale.",
    icon: Zap,
    gradient: "from-cyan-500/15 to-transparent",
    speed: 0.65,
  },
] as const;

function ParallaxBand({
  title,
  description,
  icon: Icon,
  gradient,
  speed,
}: (typeof SECTIONS)[number]) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const layerY = useTransform(scrollYProgress, [0, 1], ["12%", `${-18 * speed}%`]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["8%", `${-6 * speed}%`]);

  return (
    <div
      ref={ref}
      className="relative min-h-[85vh] overflow-hidden border-t border-white/[0.06] py-24 md:min-h-screen md:py-32"
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
        style={{ y: layerY }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_70%_50%,rgba(59,130,246,0.08),transparent)]" />

      <motion.div
        className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 md:flex-row md:items-center md:gap-16"
        style={{ y: contentY }}
      >
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_60px_-12px_rgba(168,85,247,0.35)] backdrop-blur-xl"
        >
          <Icon className="h-10 w-10 text-purple-400" strokeWidth={1.25} />
        </motion.div>
        <div className="max-w-xl">
          <motion.h2
            className="text-4xl font-bold tracking-tight text-white md:text-6xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.05 }}
          >
            {title}
          </motion.h2>
          <motion.p
            className="mt-4 text-lg leading-relaxed text-zinc-400 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.15 }}
          >
            {description}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

export function ParallaxSections() {
  return (
    <section id="parallax" className="relative bg-[#030014]">
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-purple-400/80">
          Depth & motion
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Built in layers
        </h2>
      </div>
      {SECTIONS.map(({ id, ...rest }) => (
        <ParallaxBand key={id} {...rest} />
      ))}
    </section>
  );
}
