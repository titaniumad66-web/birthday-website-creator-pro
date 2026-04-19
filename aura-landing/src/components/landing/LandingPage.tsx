"use client";

import { Hero } from "@/components/landing/Hero";
import { ParallaxSections } from "@/components/landing/ParallaxSections";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { InteractiveSection } from "@/components/landing/InteractiveSection";
import { TestimonialsCarousel } from "@/components/landing/TestimonialsCarousel";
import { Footer } from "@/components/landing/Footer";

/**
 * Composes all landing sections. Kept as a single client boundary so
 * Framer Motion hooks stay in client components while `page.tsx` can stay minimal.
 */
export function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ParallaxSections />
      <FeaturesGrid />
      <InteractiveSection />
      <TestimonialsCarousel />
      <Footer />
    </main>
  );
}
