"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle,
  Lightning,
  BookBookmark,
  Target,
  ArrowLeft,
  Sparkle,
  BookOpen,
  Check,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";

export interface DailyStudyPlanData {
  todayKey: string;
  focusLesson: {
    lessonId: string;
    lessonTitle: string;
    unitTitle: string;
    subjectId: string;
    subjectName: string;
    subjectColor?: string | null;
    masteryPercentage: number;
    unresolvedMistakesCount: number;
    reason: string;
  } | null;
  task1: {
    isCompleted: boolean;
  };
  task2: {
    isCompleted: boolean;
  };
  task3: {
    isCompleted: boolean;
    examAttempt?: {
      title: string;
      percentage: number;
    } | null;
  };
}

interface DailyGuidedStudyPlanCardProps {
  plan: DailyStudyPlanData;
  isSubscribed?: boolean;
  onOpenDailyChallenge?: () => void;
}

export function DailyGuidedStudyPlanCard({
  plan,
  isSubscribed = true,
  onOpenDailyChallenge,
}: DailyGuidedStudyPlanCardProps) {
  const [task1Done, setTask1Done] = useState(plan.task1.isCompleted);
  const [task2Done, setTask2Done] = useState(plan.task2.isCompleted);
  const [task3Done, setTask3Done] = useState(plan.task3.isCompleted);

  // Sync initial state if server props change
  useEffect(() => {
    setTask1Done(plan.task1.isCompleted);
  }, [plan.task1.isCompleted]);

  useEffect(() => {
    setTask2Done(plan.task2.isCompleted);
  }, [plan.task2.isCompleted]);

  useEffect(() => {
    setTask3Done(plan.task3.isCompleted);
  }, [plan.task3.isCompleted]);

  // Check localStorage for Task 2 client confirmation
  useEffect(() => {
    if (typeof window !== "undefined" && plan.focusLesson) {
      const storageKey = `kholasa_daily_summary_read_${plan.todayKey}_${plan.focusLesson.lessonId}`;
      if (localStorage.getItem(storageKey) === "true") {
        setTask2Done(true);
      }
    }
  }, [plan.todayKey, plan.focusLesson]);

  // Listen for real-time daily challenge completion event
  useEffect(() => {
    const handleStreakUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ isTodayCompleted: boolean }>;
      if (customEvent.detail?.isTodayCompleted) {
        setTask1Done(true);
      }
    };
    window.addEventListener("kholasa_streak_updated", handleStreakUpdate);
    return () => window.removeEventListener("kholasa_streak_updated", handleStreakUpdate);
  }, []);

  const handleMarkSummaryRead = () => {
    if (!plan.focusLesson) return;
    const storageKey = `kholasa_daily_summary_read_${plan.todayKey}_${plan.focusLesson.lessonId}`;
    localStorage.setItem(storageKey, "true");
    setTask2Done(true);
  };

  const completedCount = (task1Done ? 1 : 0) + (task2Done ? 1 : 0) + (task3Done ? 1 : 0);
  const progressPercentage = Math.round((completedCount / 3) * 100);
  const isAllCompleted = completedCount === 3;

  const handleStartChallenge = () => {
    if (onOpenDailyChallenge) {
      onOpenDailyChallenge();
      return;
    }
    const el = document.getElementById("daily-challenge-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.dispatchEvent(new CustomEvent("kholasa_open_entrance_exam"));
    }
  };

  const focus = plan.focusLesson;

  return (
    <section
      aria-label="مسار المذاكرة اليومي الذكي"
      className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-5 text-right transition-all"
    >
      {/* 1. Header with Badge & Dynamic Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800B34]/10 dark:bg-[#FB7185]/15 border border-[#800B34]/20 dark:border-[#FB7185]/25 text-[#800B34] dark:text-[#FB7185] text-xs font-bold">
            <Compass className="w-4 h-4" weight="bold" />
            <span>خطة النهاردة</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
            خطة مذاكرتك للنهاردة
          </h2>
          <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8]">
            3 خطوات خفيفة يمشوك في المنهج خطوة بخطوة من غير لخبطة.
          </p>
        </div>

        {/* Progress Summary Pill */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
              خلصت النهاردة:
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-sans tabular-nums text-xs font-bold ${
                isAllCompleted
                  ? "bg-[#059669]/15 text-[#059669] dark:text-[#34D399]"
                  : "bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185]"
              }`}
            >
              {completedCount} من 3 ({progressPercentage}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-44 sm:w-48 h-2 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAllCompleted
                  ? "bg-[#059669] dark:bg-[#34D399]"
                  : "bg-[#800B34] dark:bg-[#FB7185]"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. All Completed Celebration Banner */}
      {isAllCompleted && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#059669]/10 dark:bg-[#059669]/15 border border-[#059669]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Sparkle className="w-5 h-5" weight="fill" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                كده خلصت خطة النهاردة (100%)
              </h3>
              <p className="text-xs text-[#0F172A]/80 dark:text-[#94A3B8] leading-relaxed">
                سجلت حضورك، راجعت الدرس اللي محتاج تركيز، وحليت التدريب. تقدر تكمل أو تاخد راحة.
              </p>
            </div>
          </div>

          <Link
            href="/subjects"
            className="h-9 px-4 rounded-lg bg-white dark:bg-[#0F172A] border border-[#059669]/40 text-[#059669] dark:text-[#34D399] hover:bg-[#059669]/10 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>تصفح باقي المواد</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. The 3 Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Task 1: Daily Challenge */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
            task1Done
              ? "bg-[#059669]/5 dark:bg-[#059669]/10 border-[#059669]/30"
              : "bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34]/40"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                المهمة 1 • دقيقة واحدة
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  task1Done
                    ? "bg-[#059669]/15 text-[#059669] dark:text-[#34D399]"
                    : "bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185]"
                }`}
              >
                {task1Done ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                    <span>خلص</span>
                  </>
                ) : (
                  <span>لسه متعملتش</span>
                )}
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  task1Done
                    ? "bg-[#059669] text-white"
                    : "bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185]"
                }`}
              >
                <Lightning className="w-5 h-5" weight={task1Done ? "fill" : "bold"} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  حل تحدي اليوم
                </h4>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  سؤال واحد سريع يسجل حضورك النهاردة ويحسبلك يوم زيادة.
                </p>
              </div>
            </div>
          </div>

          <div>
            {task1Done ? (
              <div className="h-9 px-3 rounded-lg bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs font-bold flex items-center justify-center gap-1.5 w-full">
                <Check className="w-4 h-4" weight="bold" />
                <span>اتسجل حضورك النهاردة</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartChallenge}
                className="min-h-[44px] px-4 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-bold flex items-center justify-center gap-1.5 w-full transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <Lightning className="w-3.5 h-3.5" weight="bold" />
                <span>ابدأ التحدي دلوقتي</span>
              </button>
            )}
          </div>
        </div>

        {/* Task 2: Review Zaytouna of Weakest Lesson */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
            task2Done
              ? "bg-[#059669]/5 dark:bg-[#059669]/10 border-[#059669]/30"
              : "bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-[#E2E8F0] dark:border-[#334155] hover:border-[#D97706]/40"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                المهمة 2 • 5 دقائق
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  task2Done
                    ? "bg-[#059669]/15 text-[#059669] dark:text-[#34D399]"
                    : "bg-[#D97706]/15 text-[#D97706] dark:text-[#FBBF24]"
                }`}
              >
                {task2Done ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                    <span>اتراجعت</span>
                  </>
                ) : (
                  <span>كبسولة مركزة</span>
                )}
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  task2Done
                    ? "bg-[#059669] text-white"
                    : "bg-[#D97706]/15 text-[#D97706] dark:text-[#FBBF24]"
                }`}
              >
                <BookBookmark className="w-5 h-5" weight={task2Done ? "fill" : "bold"} />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                  {focus ? focus.lessonTitle : "مراجعة كبسولة الدرس"}
                </h4>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed line-clamp-2">
                  {focus
                    ? `${focus.subjectName} • ${focus.reason}`
                    : "ملخص سريع يجمع أهم أفكار الدرس والقوانين في مكان واحد."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {focus ? (
              <Link
                href={`/lessons/${focus.lessonId}#section-summary`}
                onClick={handleMarkSummaryRead}
                className="h-9 px-3 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#D97706] text-[#0F172A] dark:text-white text-xs font-bold flex-1 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#D97706]" weight="bold" />
                <span>افتح الزتونة</span>
              </Link>
            ) : (
              <Link
                href="/subjects"
                className="h-9 px-3 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold flex-1 flex items-center justify-center gap-1.5"
              >
                <span>اختار درس</span>
              </Link>
            )}

            {!task2Done && focus && (
              <button
                type="button"
                onClick={handleMarkSummaryRead}
                title="علم عليه إنه خلص"
                className="h-9 px-2.5 rounded-lg bg-[#D97706]/10 hover:bg-[#D97706]/20 text-[#D97706] dark:text-[#FBBF24] text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Check className="w-4 h-4" weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Task 3: 30-Question Mastery Quiz */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
            task3Done
              ? "bg-[#059669]/5 dark:bg-[#059669]/10 border-[#059669]/30"
              : "bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-[#E2E8F0] dark:border-[#334155] hover:border-[#4F46E5]/40"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                المهمة 3 • 30 سؤال
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  task3Done
                    ? "bg-[#059669]/15 text-[#059669] dark:text-[#34D399]"
                    : "bg-[#4F46E5]/10 text-[#4F46E5] dark:text-[#818CF8]"
                }`}
              >
                {task3Done ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                    <span>خلص</span>
                  </>
                ) : (
                  <span>تدريب سريع</span>
                )}
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  task3Done
                    ? "bg-[#059669] text-white"
                    : "bg-[#4F46E5]/10 text-[#4F46E5] dark:text-[#818CF8]"
                }`}
              >
                <Target className="w-5 h-5" weight={task3Done ? "fill" : "bold"} />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                  تدريب تثبيت المعلومة
                </h4>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  {task3Done && plan.task3.examAttempt
                    ? `خلصت التدريب وجبت ${plan.task3.examAttempt.percentage}%`
                    : "30 سؤال عشان تتأكد إن الدرس ثبت في دماغك من غير ما تنساه."}
                </p>
              </div>
            </div>
          </div>

          <div>
            {task3Done ? (
              <div className="h-9 px-3 rounded-lg bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs font-bold flex items-center justify-center gap-1.5 w-full font-sans tabular-nums">
                <Check className="w-4 h-4" weight="bold" />
                <span>
                  {plan.task3.examAttempt
                    ? `خلصته بـ ${plan.task3.examAttempt.percentage}%`
                    : "خلصت تدريب النهاردة"}
                </span>
              </div>
            ) : !isSubscribed ? (
              focus ? (
                <Link
                  href={`/lessons/${focus.lessonId}#section-assessment`}
                  className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center justify-center gap-1.5 w-full transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <Target className="w-3.5 h-3.5" weight="bold" />
                  <span>اختبر نفسك في الدرس المجاني</span>
                </Link>
              ) : (
                <Link
                  href="/subjects"
                  className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center justify-center gap-1.5 w-full transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <Target className="w-3.5 h-3.5" weight="bold" />
                  <span>تصفح الدروس والتدريبات</span>
                </Link>
              )
            ) : focus ? (
              <Link
                href={`/exams/builder?subjectId=${focus.subjectId}&lessonId=${focus.lessonId}&questionCount=30`}
                className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center justify-center gap-1.5 w-full transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <Target className="w-3.5 h-3.5" weight="bold" />
                <span>ابدأ اختبار الـ 30 سؤال</span>
              </Link>
            ) : (
              <Link
                href="/exams/builder"
                className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center justify-center gap-1.5 w-full transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <Target className="w-3.5 h-3.5" weight="bold" />
                <span>فصّل امتحانك (30 سؤال)</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
