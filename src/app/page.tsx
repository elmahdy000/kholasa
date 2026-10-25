import { SiteHeader } from "@/components/landing/SiteHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SubjectsShowcase } from "@/components/landing/SubjectsShowcase";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] text-[#1A0A10] dark:text-[#F8FAFC]">
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesBento />
        <InteractiveDemo />
        <HowItWorks />
        <SubjectsShowcase />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}