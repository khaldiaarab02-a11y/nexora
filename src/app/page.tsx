"use client";

import Hero, { HeroSection } from "@/components/landing/Hero";
import WhyNexora from "@/components/landing/WhyNexora";
import Features from "@/components/landing/Features";
import MediaSection from "@/components/landing/MediaSection";
import HowItWorks from "@/components/landing/HowItWorks";
import PlansPreview from "@/components/landing/PlansPreview";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { useI18n } from "@/i18n/LanguageProvider";

export default function LandingPage() {
  const { dir } = useI18n();

  return (
    <main dir={dir} className="landing-page min-h-screen overflow-x-hidden bg-white text-zinc-950 dark:bg-[var(--nx-bg)]">
      <Hero />
      <HeroSection />
      <WhyNexora />
      <Features />
      <MediaSection />
      <HowItWorks />
      <PlansPreview />
      <CTA />
      <Footer />
    </main>
  );
}
