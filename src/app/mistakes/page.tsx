import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, questionScopeWhere, subjectScopeWhere } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { MistakeHubClient } from "@/components/mistakes/MistakeHubClient";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MistakesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/mistakes");
  }

  const scope = getCurriculumScope(user);

  // Fetch student's published, track-scoped mistake records (including essay questions flagged for review)
  const mistakes = await prisma.mistakeReview.findMany({
    where: {
      userId: user.id,
      question: {
        status: "PUBLISHED",
        subject: { isPublished: true },
        ...questionScopeWhere(scope),
      },
    },
    orderBy: { lastAttemptAt: "desc" },
    include: {
      question: {
        include: {
          subject: { select: { id: true, name: true, color: true, schoolCategory: true } },
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

  const subjects = await prisma.subject.findMany({
    where: {
      isPublished: true,
      ...subjectScopeWhere(scope),
    },
    select: { id: true, name: true },
    orderBy: { order: "asc" },
  });

  const subjectsMap = new Map<string, string>();
  subjects.forEach((s) => subjectsMap.set(s.id, s.name));
  mistakes.forEach((m) => {
    if (m.question?.subject?.id && !subjectsMap.has(m.question.subject.id)) {
      subjectsMap.set(m.question.subject.id, m.question.subject.name);
    }
  });
  const filterSubjects = Array.from(subjectsMap.entries()).map(([id, name]) => ({
    id,
    name,
  }));

  return (
    <StudentShell user={user}>
      <div className="max-w-4xl mx-auto space-y-6 text-right font-sans pb-28">
        <div className="border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] border border-[#E2E8F0]/60 dark:border-[#F87171]/40 text-xs font-bold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>مركز المراجعة والتصحيح</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white leading-[1.35]">
            غلطاتي — اتعلم من كل خطأ
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
            هنا تتجمع كل الأسئلة التي تعثرت بها في التدريبات والامتحانات — والأسئلة المقالية التي حددتها للمراجعة — لتتمكن من إعادة حلها وفهم سبب الإجابة حتى تتقنها تماماً.
          </p>
        </div>

        <MistakeHubClient
          initialMistakes={mistakes as any}
          subjects={filterSubjects}
        />
      </div>
    </StudentShell>
  );
}
