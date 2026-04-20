import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import classicImg from "../assets/images/story/image-1.jpg";
import timelineImg from "../assets/images/story/image-2.jpg";
import surpriseImg from "../assets/images/story/image-3.jpg";

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const templates = [
  {
    title: "Classic celebration",
    description:
      "Quiet luxury: typography-led layouts that feel timeless and intimate.",
    image: classicImg,
    tag: "Premium",
  },
  {
    title: "Memory timeline",
    description:
      "A chronological walk through the moments that matter most.",
    image: timelineImg,
    tag: "Minimal",
  },
  {
    title: "Surprise story",
    description:
      "Interactive pacing that builds anticipation toward the reveal.",
    image: surpriseImg,
    tag: "Interactive",
  },
];

const TemplateShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      imagesRef.current.forEach((img) => {
        if (!img) return;
        const inner = img.querySelector("img");
        if (!inner) return;
        gsap.to(inner, {
          scrollTrigger: {
            trigger: img,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
          y: -40,
          scale: 1.08,
          ease: "none",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#FFF7FA] px-4 py-24 sm:px-6 sm:py-28 md:py-32"
      id="demo"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[40vh] w-[min(100%,720px)] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,214,231,0.5),transparent_100%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 text-center md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground"
          >
            Gallery
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-[3.25rem]"
          >
            Premium templates
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mx-auto mt-6 h-px w-20 origin-center bg-gradient-to-r from-transparent via-[#FF6B9D]/35 to-transparent"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-12">
          {templates.map((template, i) => (
            <motion.div
              key={template.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
              className="group relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[#FFD6E7]/90 bg-white/90 shadow-[0_24px_60px_-20px_rgba(255,107,157,0.18)] transition-[border-color,box-shadow,transform] duration-300 group-hover:border-[#FF6B9D]/25 group-hover:shadow-[0_32px_70px_-24px_rgba(255,107,157,0.22)]">
                <div
                  ref={(el) => {
                    imagesRef.current[i] = el;
                  }}
                  className="h-full w-full overflow-hidden"
                >
                  <img
                    src={template.image}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7FA]/95 via-[#FFF7FA]/20 to-transparent" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end p-7 sm:p-8">
                  <span className="mb-2 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6B9D] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {template.tag}
                  </span>
                  <h3 className="mb-2 font-serif text-2xl font-semibold text-foreground">
                    {template.title}
                  </h3>
                  <p className="line-clamp-2 font-sans text-sm font-normal leading-relaxed text-muted-foreground">
                    {template.description}
                  </p>
                  <div className="mt-4 h-px w-0 bg-gradient-to-r from-[#FF6B9D]/50 to-transparent transition-all duration-700 ease-out group-hover:w-full" />
                </div>
              </div>

              <motion.div
                className="pointer-events-none absolute -right-3 -top-3 h-14 w-14 rounded-full border border-[#FFD6E7]/80"
                animate={{ y: [0, -10, 0], opacity: [0.15, 0.35, 0.15] }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplateShowcase;

