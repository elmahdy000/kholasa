import { SiteHeader } from "@/components/landing/SiteHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#17243B] dark:text-[#F8FAFC]">
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesBento />
        <InteractiveDemo />
        <HowItWorks />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}