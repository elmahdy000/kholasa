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
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200/60 dark:border-rose-900/40 text-xs font-bold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>مركز المراجعة والتصحيح</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white">
            غلطاتي — اتعلم من كل خطأ
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-1">
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
