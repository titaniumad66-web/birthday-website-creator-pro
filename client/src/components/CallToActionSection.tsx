import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import SmoothButton from "./ui/SmoothButton";
import { ArrowRight } from "lucide-react";

const CallToActionSection: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[62vh] w-full items-center justify-center overflow-hidden bg-[#FFE4EC]/50 px-4 py-24 sm:px-6 sm:py-28 md:min-h-[70vh] md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_35%,rgba(255,214,231,0.55),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_75%_55%,rgba(255,107,157,0.08),transparent_52%)]" />
        {!reduce && (
          <motion.div
            className="absolute left-1/2 top-[28%] h-[min(50vmin,420px)] w-[min(90vw,780px)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.7),transparent_100%)] blur-3xl"
            animate={{ opacity: [0.45, 0.7, 0.45], scale: [1, 1.04, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_120%,rgba(255,247,250,0.95),transparent_65%)]" />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#FF6B9D]/25"
            style={{
              left: `${(i * 9.7) % 100}%`,
              top: `${(i * 13) % 100}%`,
            }}
            animate={
              reduce
                ? undefined
                : {
                    y: [0, -36, 0],
                    x: [0, 14, 0],
                    opacity: [0.15, 0.45, 0.15],
                  }
            }
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.35,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground"
        >
          Start today
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance font-serif text-[clamp(2rem,6vw,4rem)] font-bold leading-[1.08] tracking-tight text-foreground"
        >
          Create a magical birthday surprise.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mx-auto mt-8 max-w-xl font-sans text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-10"
        >
          Design a refined birthday site in minutes — one link, beautifully
          responsive, ready to share.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-10 flex w-full justify-center px-2 sm:mt-12"
        >
          <SmoothButton
            variant="primary"
            className="group w-full max-w-sm px-9 py-4 text-base sm:w-auto sm:max-w-none md:px-10 md:text-lg"
            onClick={() => {
              window.location.href = "/create";
            }}
          >
            Create your surprise
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </SmoothButton>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;
