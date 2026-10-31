import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SetupForm } from "./SetupForm";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface SetupPageProps {
  searchParams: Promise<{ reset?: string }>;
}

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { reset } = await searchParams;

  // If user already has system, grade, and schoolCategory set (and didn't ask to reset), skip setup
  if (reset !== "true" && user.systemId && user.gradeId && user.schoolCategory) {
    redirect("/dashboard");
  }

  const systems = await prisma.educationalSystem.findMany({
    where: { isActive: true, code: "baccalaureate" },
    orderBy: { order: "asc" },
    include: {
      grades: {
        where: { code: { in: ["bacc_g10", "bacc_g11"] } },
        orderBy: { order: "asc" },
        include: {
          tracks: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center p-3 sm:p-5 relative font-sans overflow-hidden">
      {/* Ambient background mesh & subtle glowing brand orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#800020]/10 dark:bg-[#800020]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 dark:bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-20 pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6 sm:space-y-7 relative z-10 my-6">
        {/* Top Logo & Welcome */}
        <div className="flex flex-col items-center text-center space-y-2">
          <BrandLogo variant="combined" size="lg" glow showSubtitle subtitleText="منصة البكالوريا الذكية" />
        </div>

        {/* Setup Form Glassmorphic Card */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#0F172A]/90 backdrop-blur-md border border-[#E2E8F0] dark:border-[#334155] shadow-2xl shadow-black/5 dark:shadow-black/40">
          <SetupForm systems={systems} userId={user.id} userName={user.name} />
        </div>

        {/* Footer Guarantee */}
        <div className="text-center text-[11px] sm:text-xs text-[#94A3B8] flex items-center justify-center gap-2">
          <span>🔒 بياناتك التعليمية مشفرة ومحمية بالكامل ومخصصة لمنهج البكالوريا</span>
        </div>
      </div>
    </div>
  );
}