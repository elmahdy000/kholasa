import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { MistakeHubClient } from "@/components/mistakes/MistakeHubClient";
import { AlertTriangle, Sparkles } from "lucide-react";

export default async function MistakesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/mistakes");
  }

  // Fetch student's mistake records
  const mistakes = await prisma.mistakeReview.findMany({
    where: { userId: user.id },
    orderBy: { lastAttemptAt: "desc" },
    include: {
      question: {
        include: {
          subject: { select: { id: true, name: true } },
          unit: { select: { id: true, title: true } },
          options: { orderBy: { order: "asc" } },
          explanation: true,
          rubric: true,
          lessons: {
            include: {
              lesson: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
  });

  // Fetch student's enrolled subjects for the filter
  const subjects = await prisma.subject.findMany({
    where: { isPublished: true },
    select: { id: true, name: true },
    orderBy: { order: "asc" },
  });

  return (
    <StudentShell user={user}>
      <div className="max-w-4xl mx-auto space-y-6 text-right font-sans pb-28">
        <div className="border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] border border-[#E2E8F0]/60 dark:border-[#F87171]/40 text-[13px] font-bold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>مركز المراجعة والتصحيح</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
            غلطاتي — اتعلم من كل خطأ
          </h1>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            هنا تتجمع كل الأسئلة التي تعثرت بها في التدريبات والامتحانات السابقة لتتمكن من إعادة حلها وفهم سبب الخطأ حتى تتقنها تماماً
          </p>
        </div>

        <MistakeHubClient
          initialMistakes={mistakes as any}
          subjects={subjects}
        />
      </div>
    </StudentShell>
  );
}
