import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, isSubjectInScope } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { LessonViewer } from "@/components/lessons/LessonViewer";
import { ArabicLessonViewer } from "@/components/lessons/arabic/ArabicLessonViewer";
import { isArabicStructuredData } from "@/components/lessons/arabic/types";
import { sanitizeArabicPayloadForStudent } from "@/lib/arabic-curriculum";
import { StudentPaywallView } from "@/components/student/subscription/StudentPaywallView";
import { SubjectUnderConstructionView } from "@/components/subjects/SubjectUnderConstructionView";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: {
      title: true,
      unit: {
        select: {
          title: true,
          subject: { select: { name: true, schoolCategory: true } },
        },
      },
    },
  });

  if (!lesson) {
    return { title: "الدرس غير موجود | الخلاصة للبكالوريا" };
  }

  const catLabel = lesson.unit.subject.schoolCategory === "LANGUAGES" ? "بكالوريا لغات" : "بكالوريا عربي";
  const title = `${lesson.title} — ${lesson.unit.subject.name}`;
  const description = `درس ${lesson.title} من ${lesson.unit.title} في ${lesson.unit.subject.name} (${catLabel}). ملخص الزتونة، خرائط ذهنية، وبنك تدريبات تفاعلي على منصة الخلاصة للبكالوريا بإشراف Dr/Elmahdy.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | الخلاصة للبكالوريا`,
      description,
      url: `https://el-kholasa.online/lessons/${id}`,
    },
    alternates: {
      canonical: `/lessons/${id}`,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?callbackUrl=/lessons/${id}`);
  }

  const lesson = await prisma.lesson.findFirst({
    where: {
      id,
      isPublished: true,
      unit: { isPublished: true, subject: { isPublished: true } },
    },
    include: {
      unit: {
        include: {
          subject: true,
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true },
          },
        },
      },
      content: true,
      summary: true,
      mindMap: true,
      questions: {
        where: {
          question: { status: "PUBLISHED" },
        },
        select: {
          question: {
            select: {
              id: true,
              externalKey: true,
              origin: true,
              skillCategory: true,
              sourceReferences: true,
              statement: true,
              translation: true,
              type: true,
              difficulty: true,
              imageUrl: true,
              options: {
                select: { id: true, text: true, translation: true, order: true },
                orderBy: { order: "asc" },
              },
              rubric: {
                select: {
                  modelAnswer: true,
                  modelAnswerTranslation: true,
                  criteria: true,
                  maxScore: true,
                },
              },
              explanation: {
                select: {
                  concept: true,
                  correctReason: true,
                  examTrick: true,
                  origin: true,
                  sectionId: true,
                },
              },
            },
          },
        },
      },
      progress: user
        ? {
            where: { userId: user.id },
          }
        : false,
    },
  });

  if (!lesson) {
    notFound();
  }

  // Students may only open lessons from their own curriculum.
  if (!isSubjectInScope(getCurriculumScope(user), lesson.unit.subject)) {
    notFound();
  }

  // Subscription check:
  // If user is not ACTIVE, only the first trial lesson is open (order === 1, isTrial === true, or first in unit)
  // Staff/Admins are always exempt from subscription check
  const isStaffUser =
    user &&
    (user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN");

  if (lesson.unit.subject.isUnderConstruction && !isStaffUser) {
    return (
      <StudentShell user={user}>
        <SubjectUnderConstructionView
          subjectName={lesson.unit.subject.name}
          description="المادة والدرس مغلقان حالياً للطلاب لحين استكمال التجهيز."
        />
      </StudentShell>
    );
  }

  // Single trial lesson: ONLY the first lesson of Unit 1 (or explicitly marked isTrial)
  // All other lessons require an ACTIVE subscription
  const isFreeTrialLesson =
    Boolean(lesson.isTrial) || (lesson.unit.order === 1 && lesson.order === 1);
  const isSubscriptionActive =
    Boolean(isStaffUser) || user?.subscriptionStatus === "ACTIVE";

  if (!isSubscriptionActive && !isFreeTrialLesson) {
    return (
      <StudentShell user={user}>
        <StudentPaywallView
          lessonTitle={lesson.title}
          unitTitle={lesson.unit.title}
          user={user}
        />
      </StudentShell>
    );
  }

  // Increment views count asynchronously
  prisma.lesson
    .update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    })
    .catch(() => {});

  let isBookmarked = false;
  if (user) {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        lessonId: lesson.id,
      },
    });
    isBookmarked = !!bookmark;
  }

  const isCompleted =
    Array.isArray(lesson.progress) && lesson.progress.length > 0
      ? lesson.progress[0].isCompleted
      : false;

  let initialMistakes: any[] = [];
  if (user) {
    const rawMistakes = await prisma.mistakeReview.findMany({
      where: {
        userId: user.id,
        isResolved: false,
        question: {
          lessons: {
            some: { lessonId: lesson.id },
          },
        },
      },
      orderBy: { lastAttemptAt: "desc" },
      include: {
        question: {
          include: {
            options: { orderBy: { order: "asc" } },
            explanation: true,
            rubric: true,
          },
        },
      },
    });

    initialMistakes = rawMistakes.map((m) => ({
      id: m.id,
      questionId: m.questionId,
      wrongCount: m.wrongCount,
      question: m.question,
    }));
  }

  // Fetch student's previously saved answers for this lesson's questions
  let initialQuestionAttempts: {
    questionId: string;
    selectedOptionId: string | null;
    essayText: string | null;
    isCorrect: boolean;
  }[] = [];

  if (user && lesson.questions.length > 0) {
    const rawAttempts = await prisma.questionAttempt.findMany({
      where: {
        userId: user.id,
        questionId: {
          in: lesson.questions.map((q) => q.question.id),
        },
      },
    });

    initialQuestionAttempts = rawAttempts.map((a) => ({
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
      essayText: a.essayText,
      isCorrect: a.isCorrect,
    }));
  }

  const isArabicGuidedSubject = lesson.unit.subject.learningEngine === "ARABIC_GUIDED";

  if (isArabicGuidedSubject && isArabicStructuredData(lesson.content?.structuredData)) {
    const rawSectionProgress = await prisma.studentSectionProgress.findMany({
      where: { userId: user.id, lessonId: lesson.id },
      orderBy: { lastVisitedAt: "desc" },
    });

    const initialSectionProgress = rawSectionProgress.map((sp) => ({
      id: sp.id,
      sectionAnchorId: sp.sectionAnchorId,
      stageId: sp.stageId,
      isCompleted: sp.isCompleted,
      lastVisitedAt: sp.lastVisitedAt.toISOString(),
      state: (sp.state as Record<string, unknown> | null) || null,
    }));

    const attemptedOrMistakeIds = new Set<string>([
      ...initialQuestionAttempts.map((a) => a.questionId),
      ...initialMistakes.map((m) => m.questionId),
    ]);

    // Never expose correct reasons, exam tricks, or essay model answers before student attempt submission
    const sanitizedLesson = {
      ...lesson,
      questions: lesson.questions.map((ql) => {
        const q = ql.question;
        if (attemptedOrMistakeIds.has(q.id)) return ql;
        return {
          ...ql,
          question: {
            ...q,
            rubric: q.rubric
              ? { ...q.rubric, modelAnswer: undefined, modelAnswerTranslation: undefined }
              : null,
            explanation: q.explanation
              ? {
                  ...q.explanation,
                  correctReason: "",
                  examTrick: null,
                }
              : null,
          },
        };
      }),
    };

    const orderedUnitLessons = [...lesson.unit.lessons].sort((a, b) => a.order - b.order);
    const curLessonIdx = orderedUnitLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson = curLessonIdx > 0 ? orderedUnitLessons[curLessonIdx - 1] : null;
    const nextLesson =
      curLessonIdx >= 0 && curLessonIdx < orderedUnitLessons.length - 1
        ? orderedUnitLessons[curLessonIdx + 1]
        : null;

    return (
      <StudentShell user={user}>
        <ArabicLessonViewer
          lesson={sanitizedLesson as any}
          structured={sanitizeArabicPayloadForStudent(lesson.content.structuredData)}
          initialIsBookmarked={isBookmarked}
          initialIsCompleted={isCompleted}
          initialMistakes={initialMistakes}
          initialQuestionAttempts={initialQuestionAttempts}
          initialSectionProgress={initialSectionProgress}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          userId={user?.id}
        />
      </StudentShell>
    );
  }

  return (
    <StudentShell user={user}>
      <LessonViewer
        lesson={lesson as any}
        initialIsBookmarked={isBookmarked}
        initialIsCompleted={isCompleted}
        initialMistakes={initialMistakes}
        initialQuestionAttempts={initialQuestionAttempts}
        userId={user?.id}
      />
    </StudentShell>
  );
}
