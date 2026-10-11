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
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#090E17] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#6858EA] to-[#11B7B4] flex items-center justify-center text-white shadow-xl shadow-[#6858EA]/25 mx-auto text-2xl font-black">
            خ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14243D] dark:text-white">
            أهلاً بك في الخلاصة! 👋
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            عشان نجهز لك تجربة تعليمية مخصصة تماماً، محتاجين نعرف نظامك الدراسي والصف الحالي.
          </p>
        </div>

        {/* Setup Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111A2B] border border-[#E2E8F0] dark:border-slate-800 shadow-xl">
          <SetupForm systems={systems} userId={user.id} />
        </div>
      </div>
    </div>
  );
}