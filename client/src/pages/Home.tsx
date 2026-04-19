import { useEffect, useState } from "react";
import IntroAnimation from "../components/IntroAnimation";
import HeroSection from "../components/HeroSection";
import { consumeHomeScrollAnchor } from "../lib/homeAnchorScroll";
import StoryboardSection from "../components/StoryboardSection";
import GiftRevealSection from "../components/GiftRevealSection";
import FeaturesSection from "../components/FeaturesSection";
import TemplateShowcase from "../components/TemplateShowcase";
import CallToActionSection from "../components/CallToActionSection";
import FooterSection from "../components/FooterSection";
import LandingAmbient from "../components/landing/LandingAmbient";
import MotionSection from "../components/landing/MotionSection";

export default function Home() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("aura_intro_shown");
    }
    return true;
  });

  useEffect(() => {
    if (showIntro) return;
    const pending = consumeHomeScrollAnchor();
    const hash =
      typeof window !== "undefined" && window.location.hash
        ? window.location.hash.replace(/^#/, "")
        : "";
    const target = pending || hash;
    if (!target) return;
    const run = () =>
      document.getElementById(target)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [showIntro]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <LandingAmbient />
      {showIntro && (
        <IntroAnimation
          onComplete={() => {
            setShowIntro(false);
            sessionStorage.setItem("aura_intro_shown", "true");
          }}
        />
      )}
      <div className="relative z-10 flex flex-col">
        <HeroSection onPrimaryHref="/create" onSecondaryHref="#demo" />
        <StoryboardSection />
        <GiftRevealSection />
        <MotionSection>
          <FeaturesSection />
        </MotionSection>
        <MotionSection delay={0.06}>
          <TemplateShowcase />
        </MotionSection>
        <MotionSection delay={0.06}>
          <CallToActionSection />
        </MotionSection>
        <MotionSection delay={0.04}>
          <FooterSection />
        </MotionSection>
      </div>
    </div>
  );
}

