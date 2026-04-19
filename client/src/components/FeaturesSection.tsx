import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Gift, Music, Share2 } from "lucide-react";

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const features = [
  {
    title: "Memory timeline",
    description:
      "Lay out photos, notes, and milestones in a calm, editorial layout.",
    icon: Clock,
    color: "from-[#FFD6E7]/90 to-[#FFE4EC]/40",
    glow: "shadow-[0_12px_40px_-8px_rgba(255,107,157,0.15)]",
  },
  {
    title: "Surprise reveal",
    description:
      "Build suspense and reveal the moment with intentional pacing.",
    icon: Gift,
    color: "from-[#FF6B9D]/20 to-[#FFD6E7]/50",
    glow: "shadow-[0_12px_40px_-8px_rgba(255,107,157,0.2)]",
  },
  {
    title: "Music & motion",
    description:
      "Pair a soundtrack with subtle motion — never noisy, always polished.",
    icon: Music,
    color: "from-[#FFE4EC]/95 to-[#FFF7FA]/50",
    glow: "shadow-[0_12px_40px_-8px_rgba(255,182,210,0.25)]",
  },
  {
    title: "One link to share",
    description:
      "A single URL that feels premium on every device and screen size.",
    icon: Share2,
    color: "from-[#FFD6E7]/80 to-[#FFE4EC]/40",
    glow: "shadow-[0_12px_40px_-8px_rgba(255,107,157,0.12)]",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = (reduce: boolean | null) => ({
  hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
});

const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(".features-bg-shape", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
        y: (i: number) => (i % 2 === 0 ? 80 : -80),
        rotation: 12,
        ease: "none",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#FFF7FA] px-4 py-24 sm:px-6 sm:py-28 md:py-32"
      id="features"
    >
      <div className="features-bg-shape absolute left-[-10%] top-1/4 h-72 w-72 rounded-full bg-[#FF6B9D]/[0.08] blur-[100px]" />
      <div className="features-bg-shape absolute bottom-1/4 right-[-5%] h-96 w-96 rounded-full bg-[#FFD6E7]/80 blur-[120px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFD6E7] to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 text-center md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground"
          >
            Product
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-[3.25rem]"
          >
            Crafted for moments
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-6 h-px w-20 origin-center bg-gradient-to-r from-transparent via-[#FF6B9D]/35 to-transparent"
          />
        </div>

        <motion.div
          className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-7"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item(reduce)}
              whileHover={{ y: -5, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
              className={`group relative overflow-hidden rounded-[1.75rem] border border-[#FFD6E7]/90 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:border-[#FF6B9D]/25 hover:shadow-[0_20px_48px_-14px_rgba(255,107,157,0.18)] sm:p-7 ${feature.glow}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#FFD6E7]/40 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FFD6E7] bg-[#FFF7FA] transition-transform duration-300 group-hover:scale-[1.04]">
                  <feature.icon className="h-7 w-7 text-[#FF6B9D]" strokeWidth={1.5} />
                </div>
                <h3 className="mb-3 font-sans text-lg font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="font-sans text-sm font-normal leading-relaxed text-muted-foreground md:text-[0.9375rem]">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
