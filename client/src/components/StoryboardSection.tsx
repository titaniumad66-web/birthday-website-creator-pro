import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import image1 from "../assets/images/story/image 1.jpg";
import image2 from "../assets/images/story/image 2.jpg";
import image3 from "../assets/images/story/image 3.jpg";
import image4 from "../assets/images/story/image 4.jpg";

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const StoryboardSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

  const scenes = [
    { image: image1, caption: "Every birthday holds memories" },
    { image: image2, caption: "Every memory deserves a surprise" },
    { image: image3, caption: "Turn moments into magical experiences" },
    { image: image4, caption: "Create a birthday website with Aura" },
  ];

  useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) {
      console.error("GSAP or ScrollTrigger not found on window object");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      panelsRef.current.forEach((panel) => {
        if (!panel) return;

        const img = panel.querySelector("img") as HTMLElement | null;
        const caption = panel.querySelector(".caption-text") as HTMLElement | null;
        const overlay = panel.querySelector(".panel-overlay") as HTMLElement | null;

        if (!img || !caption || !overlay) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play reverse play reverse",
          },
        });

        tl.fromTo(
          img,
          { opacity: 0, scale: 1.08, y: 24 },
          { opacity: 1, scale: 1, y: 0, duration: 1.35, ease: "power3.out" },
        );

        tl.fromTo(
          caption,
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
          "-=0.95",
        );

        tl.fromTo(
          overlay,
          { opacity: 0.35 },
          { opacity: 0.58, duration: 1.35 },
          "-=1.35",
        );

        gsap.to(img, {
          scrollTrigger: {
            trigger: panel,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
          y: -44,
          ease: "none",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="bg-[#FFF7FA]">
      {scenes.map((scene, index) => (
        <section
          key={index}
          ref={(el) => {
            if (el) panelsRef.current[index] = el as HTMLDivElement;
          }}
          className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 h-full w-full">
            <img
              src={scene.image}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="panel-overlay absolute inset-0 bg-[#FFF7FA]/35 backdrop-blur-[2px] transition-opacity duration-1000" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8">
            <motion.h2 className="caption-text font-serif text-[clamp(1.75rem,5.5vw,3.75rem)] font-bold leading-[1.12] tracking-tight text-[#1A1A1A] drop-shadow-[0_2px_24px_rgba(255,255,255,0.9)]">
              {scene.caption}
            </motion.h2>
            <div className="mx-auto mt-8 h-px w-16 bg-gradient-to-r from-transparent via-rose-300/50 to-transparent sm:mt-10" />
          </div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-white/15 blur-[1px]"
                style={{
                  left: `${20 + i * 22}%`,
                  top: `${15 + i * 18}%`,
                }}
                animate={{
                  y: [0, -28, 0],
                  x: [0, 16, 0],
                  opacity: [0.12, 0.38, 0.12],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default StoryboardSection;

