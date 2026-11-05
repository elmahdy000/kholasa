import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SubjectsShowcase } from "@/components/landing/SubjectsShowcase";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const subjectsData = await prisma.subject
    .findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      take: 6,
      include: {
        track: { select: { name: true } },
        _count: {
          select: {
            units: true,
            questions: true,
          },
        },
      },
    })
    .catch(() => []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] text-[#12263F] dark:text-[#F8FAFC]">
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesBento />
        <InteractiveDemo />
        <HowItWorks />
        <SubjectsShowcase subjects={subjectsData} />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}