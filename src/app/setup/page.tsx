import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SetupForm } from "./SetupForm";

export default async function SetupPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // If user already has system and grade set, skip setup
  if (user.systemId && user.gradeId) {
    redirect("/dashboard");
  }

  const systems = await prisma.educationalSystem.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      grades: {
        orderBy: { order: "asc" },
        include: {
          tracks: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center p-4 relative font-sans">
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      <div className="w-full max-w-2xl space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#800020] flex items-center justify-center text-white  mx-auto text-xl font-bold">
            خ
          </div>
          <h1 className="text-2xl sm:text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            مرحباً بك في منصة الخلاصة
          </h1>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            لتخصيص خطتك الدراسية ومحتوى المنهج بدقة، يرجى تحديد النظام التعليمي والصف الدراسي الحالي.
          </p>
        </div>

        {/* Setup Form Card */}
        <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] ">
          <SetupForm systems={systems} userId={user.id} />
        </div>
      </div>
    </div>
  );
}