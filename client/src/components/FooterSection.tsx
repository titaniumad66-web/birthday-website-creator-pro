import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Create surprise", href: "/create" },
  { label: "Templates", href: "/templates" },
  { label: "Contact", href: "/contact" },
];

const credits = [
  { role: "Founder", name: "ANUJ DHAVANE" },
  { role: "Co-Founder", name: "KRISHNA" },
];

const FooterSection: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(".footer-glow", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
        y: -80,
        opacity: 0.22,
        ease: "none",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative w-full overflow-hidden border-t border-[#FFD6E7]/80 bg-[#FFF7FA] px-4 py-16 sm:px-6 sm:py-20 md:py-24"
    >
      <div className="footer-glow pointer-events-none absolute -bottom-1/4 left-1/4 h-[20rem] w-[40rem] rounded-full bg-[#FF6B9D]/[0.12] opacity-0 blur-[120px]" />
      <div className="footer-glow pointer-events-none absolute -top-1/4 right-1/4 h-[15rem] w-[30rem] rounded-full bg-[#FFD6E7]/90 opacity-0 blur-[100px]" />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-12 sm:gap-14 md:grid-cols-2 md:gap-16 lg:grid-cols-4 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[0_4px_24px_-4px_rgba(255,107,157,0.2)] ring-1 ring-[#FFD6E7]/80 transition-transform duration-300 hover:rotate-6">
              <Sparkles className="h-6 w-6 text-[#FF6B9D]" />
            </div>
            <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Aura
            </span>
          </div>
          <p className="max-w-sm font-sans text-sm font-normal leading-relaxed text-muted-foreground">
            Unforgettable birthday surprises — moments turned into a calm,
            cinematic web experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="space-y-5"
        >
          <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Navigation
          </h4>
          <ul className="space-y-3.5">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>
                  <a className="group relative inline-block font-sans text-sm font-normal text-muted-foreground transition-colors duration-300 hover:text-foreground">
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-[#FF6B9D]/70 to-[#FFD6E7] transition-all duration-300 group-hover:w-full" />
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-5"
        >
          <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Credits
          </h4>
          <div className="space-y-4">
            {credits.map((credit) => (
              <div key={credit.name} className="space-y-1">
                <span className="block font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                  {credit.role}
                </span>
                <span className="font-sans text-sm font-normal tracking-wide text-foreground/80">
                  {credit.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="space-y-5"
        >
          <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Stay updated
          </h4>
          <div className="relative group">
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-full border border-[#FFD6E7] bg-white px-5 py-3.5 pr-[5.5rem] font-sans text-sm text-foreground placeholder:text-muted-foreground/60 transition-[border-color,box-shadow] duration-300 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/15"
            />
            <button
              type="button"
              className="absolute right-1.5 top-1/2 flex h-10 -translate-y-1/2 items-center rounded-full bg-primary px-4 font-sans text-xs font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-[#e85a8a] active:scale-[0.98]"
            >
              Join
            </button>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto mt-14 flex max-w-6xl flex-col items-center justify-between gap-6 border-t border-[#FFD6E7]/80 pt-8 sm:mt-16 sm:flex-row">
        <p className="text-center font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-left">
          © {new Date().getFullYear()} Aura. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-end">
          <a
            href="#"
            className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            Privacy
          </a>
          <a
            href="#"
            className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
