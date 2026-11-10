import { getLandingCurriculumData } from "@/lib/landing-curriculum";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SubjectsShowcase } from "@/components/landing/SubjectsShowcase";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const curriculum = await getLandingCurriculumData();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] text-[#091B40] dark:text-[#F8FAFC]">
      <SiteHeader />
      <main>
        <HeroSection heroQuestions={curriculum.heroQuestions} />
        <InteractiveDemo grades={curriculum.grades} subjects={curriculum.subjects} />
        <FeaturesBento sampleProofs={curriculum.sampleProofs} />
        <HowItWorks />
        <SubjectsShowcase subjects={curriculum.subjects} />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
