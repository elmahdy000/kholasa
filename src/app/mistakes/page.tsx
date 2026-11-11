import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, questionScopeWhere, subjectScopeWhere } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { MistakeHubClient } from "@/components/mistakes/MistakeHubClient";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

interface MistakesPageProps {
  searchParams?: Promise<{
    subjectId?: string;
    lessonId?: string;
  }>;
}

export default async function MistakesPage({ searchParams }: MistakesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/mistakes");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const scope = getCurriculumScope(user);

  // Fetch student's published, track-scoped mistake records (excluding under-construction subjects)
  const mistakes = await prisma.mistakeReview.findMany({
    where: {
      userId: user.id,
      question: {
        status: "PUBLISHED",
        subject: { isPublished: true, isUnderConstruction: false },
        ...(scope ? { AND: [questionScopeWhere(scope)] } : {}),
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
      isUnderConstruction: false,
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

  const requestedSubjectId =
    typeof resolvedParams.subjectId === "string" ? resolvedParams.subjectId.trim() : "";
  const initialSubjectId =
    requestedSubjectId && filterSubjects.some((s) => s.id === requestedSubjectId)
      ? requestedSubjectId
      : "all";

  const requestedLessonId =
    typeof resolvedParams.lessonId === "string" ? resolvedParams.lessonId.trim() : "";
  const initialLessonId =
    requestedLessonId &&
    mistakes.some((m) =>
      m.question?.lessons?.some((l) => l.lesson.id === requestedLessonId)
    )
      ? requestedLessonId
      : null;

  return (
    <StudentShell user={user}>
      <div className="max-w-4xl mx-auto space-y-6 text-right font-sans pb-28">
        <div className="border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] border border-[#E2E8F0]/60 dark:border-[#F87171]/40 text-xs font-bold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>مراجعة لأخطائي ومتابعة مستواك</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white leading-[1.35]">
            مراجعة لأخطائي — راجع اللي وقف معاك
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
            هنا هتلاقي كل الأسئلة اللي غلطت فيها أو علمت عليها للمراجعة، متقسمة حسب المادة والدرس عشان ترجع لها بسهولة.
          </p>
        </div>

        <MistakeHubClient
          initialMistakes={mistakes as any}
          subjects={filterSubjects}
          initialSubjectId={initialSubjectId}
          initialLessonId={initialLessonId}
        />
      </div>
    </StudentShell>
  );
}
