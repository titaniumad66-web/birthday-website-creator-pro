"use client";

/**
 * Scroll-triggered stagger: parent uses whileInView + staggerChildren
 * so lines reveal sequentially without running heavy JS per frame.
 */
import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const el = ref.current;
    const ctrl = animate(0, value, {
      duration: 1.35,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        el.textContent = `${Math.round(latest)}${suffix}`;
      },
    });
    return () => ctrl.stop();
  }, [isInView, value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function InteractiveSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#030014] py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-purple-950/20" />
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-12 lg:grid-cols-2 lg:items-center"
        >
          <div>
            <motion.p
              variants={item}
              className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400/90"
            >
              Momentum
            </motion.p>
            <motion.h2
              variants={item}
              className="mt-3 text-3xl font-bold text-white md:text-5xl"
            >
              Numbers that move with you
            </motion.h2>
            <motion.p variants={item} className="mt-4 text-lg text-zinc-400">
              Scroll into view to animate metrics — spring physics keeps motion
              feeling natural, not robotic.
            </motion.p>
          </div>

          <motion.div
            variants={item}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: "Uptime", value: 99, suffix: "%" },
              { label: "Regions", value: 12, suffix: "+" },
              { label: "Latency", value: 42, suffix: "ms" },
              { label: "Teams", value: 2400, suffix: "+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md"
              >
                <div className="text-3xl font-bold tabular-nums text-white md:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
