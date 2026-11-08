"use client";

import React from "react";
import {
  BookmarkSimple,
  Lightning,
  Exam,
  Sparkle,
  Check,
  Compass,
  ArrowLeft,
  ArrowRight,
} from "@phosphor-icons/react";

export interface LessonLearningStepperProps {
  activeStep: "definitions" | "tf" | "exam" | "mistakes";
  onSelectStep: (step: "definitions" | "tf" | "exam" | "mistakes") => void;
  definitionsCount: number;
  definitionsReviewed?: boolean;
  tfQuestionsCount: number;
  tfAnsweredCount: number;
  examQuestionsCount: number;
  examAnsweredCount: number;
  unresolvedMistakesCount: number;
  isLanguages?: boolean;
}

export function LessonLearningStepper({
  activeStep,
  onSelectStep,
  definitionsCount,
  definitionsReviewed = true,
  tfQuestionsCount,
  tfAnsweredCount,
  examQuestionsCount,
  examAnsweredCount,
  unresolvedMistakesCount,
  isLanguages = false,
}: LessonLearningStepperProps) {
  // 1. Completion & Activity Logic
  const isDefsDone = definitionsCount > 0 ? definitionsReviewed : true;
  const isTfDone = tfQuestionsCount > 0 && tfAnsweredCount >= tfQuestionsCount;
  const isExamDone = examQuestionsCount > 0 && examAnsweredCount >= examQuestionsCount;
  const hasPracticed = tfAnsweredCount > 0 || examAnsweredCount > 0;
  const isMistakesDone = hasPracticed && unresolvedMistakesCount === 0;

  // 2. Count actual completed activities (out of 4)
  let completedCount = 0;
  if (isDefsDone) completedCount++;
  if (tfQuestionsCount > 0 ? isTfDone : true) completedCount++;
  if (examQuestionsCount > 0 ? isExamDone : true) completedCount++;
  if (isMistakesDone) completedCount++;

  const progressPercent = Math.min(100, Math.round((completedCount / 4) * 100));

  // 3. Determine next recommended activity
  let nextStepId: "definitions" | "tf" | "exam" | "mistakes" | null = null;
  if (!isDefsDone) {
    nextStepId = "definitions";
  } else if (tfQuestionsCount > 0 && !isTfDone) {
    nextStepId = "tf";
  } else if (examQuestionsCount > 0 && !isExamDone) {
    nextStepId = "exam";
  } else if (unresolvedMistakesCount > 0) {
    nextStepId = "mistakes";
  } else {
    nextStepId = null; // All done
  }

  // Next step label
  let nextStepTitle = "";
  if (nextStepId === "definitions") nextStepTitle = isLanguages ? "Concepts & Notes" : "المفاهيم والشرح";
  else if (nextStepId === "tf") nextStepTitle = isLanguages ? "Quick Challenges" : "التحديات السريعة";
  else if (nextStepId === "exam") nextStepTitle = isLanguages ? "Exam Practice" : "أسئلة الامتحانات";
  else if (nextStepId === "mistakes") nextStepTitle = isLanguages ? "Review Mistakes" : "تحليل الأخطاء";

  // 4. Construct step items
  const steps = [
    {
      id: "definitions" as const,
      stepNumber: 1,
      title: isLanguages ? "Concepts & Notes" : "المفاهيم والشرح",
      metric: definitionsCount > 0 ? `${definitionsCount} ${isLanguages ? "terms" : "مصطلحات"}` : (isLanguages ? "Overview" : "ملخص الدرس"),
      isCompleted: isDefsDone,
      isInProgress: false,
      isNext: nextStepId === "definitions",
      statusText: isDefsDone ? (isLanguages ? "Completed" : "مكتمل") : (nextStepId === "definitions" ? (isLanguages ? "Next Step" : "الخطوة التالية") : (isLanguages ? "Available" : "متاح")),
      icon: BookmarkSimple,
    },
    {
      id: "tf" as const,
      stepNumber: 2,
      title: isLanguages ? "Quick Challenges" : "التحديات السريعة",
      metric: tfQuestionsCount > 0 ? `${tfAnsweredCount}/${tfQuestionsCount} ${isLanguages ? "answered" : "مُجاب"}` : (isLanguages ? "No challenges" : "غير متوفر"),
      isCompleted: isTfDone,
      isInProgress: tfQuestionsCount > 0 && tfAnsweredCount > 0 && !isTfDone,
      isNext: nextStepId === "tf",
      statusText: isTfDone
        ? (isLanguages ? "Completed" : "مكتمل")
        : (nextStepId === "tf"
            ? (isLanguages ? "Next Step" : "الخطوة التالية")
            : (tfAnsweredCount > 0 ? (isLanguages ? "In Progress" : "قيد الحل") : (isLanguages ? "Available" : "متاح"))),
      icon: Lightning,
    },
    {
      id: "exam" as const,
      stepNumber: 3,
      title: isLanguages ? "Exam Practice" : "أسئلة الامتحانات",
      metric: examQuestionsCount > 0 ? `${examAnsweredCount}/${examQuestionsCount} ${isLanguages ? "answered" : "مُجاب"}` : (isLanguages ? "No questions" : "غير متوفر"),
      isCompleted: isExamDone,
      isInProgress: examQuestionsCount > 0 && examAnsweredCount > 0 && !isExamDone,
      isNext: nextStepId === "exam",
      statusText: isExamDone
        ? (isLanguages ? "Completed" : "مكتمل")
        : (nextStepId === "exam"
            ? (isLanguages ? "Next Step" : "الخطوة التالية")
            : (examAnsweredCount > 0 ? (isLanguages ? "In Progress" : "قيد الحل") : (isLanguages ? "Available" : "متاح"))),
      icon: Exam,
    },
    {
      id: "mistakes" as const,
      stepNumber: 4,
      title: isLanguages ? "Mistakes Analysis" : "تحليل الأخطاء",
      metric: unresolvedMistakesCount > 0
        ? `${unresolvedMistakesCount} ${isLanguages ? "mistakes" : "أخطاء للمراجعة"}`
        : (hasPracticed ? (isLanguages ? "0 mistakes ✓" : "صفر أخطاء ✓") : (isLanguages ? "Ready" : "جاهز للتدريب")),
      isCompleted: isMistakesDone,
      isInProgress: unresolvedMistakesCount > 0,
      isNext: nextStepId === "mistakes",
      statusText: unresolvedMistakesCount > 0
        ? (isLanguages ? "Needs Review" : "يحتاج مراجعة")
        : (isMistakesDone ? (isLanguages ? "Completed" : "مكتمل") : (isLanguages ? "Ready" : "جاهز")),
      icon: Sparkle,
    },
  ];

  const dir = isLanguages ? "ltr" : "rtl";

  return (
    <div
      dir={dir}
      className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E2E8F0] dark:border-[#22364F] shadow-xs space-y-3 transition-colors"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#14213D]/10 dark:bg-blue-900/30 text-[#14213D] dark:text-blue-300 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" weight="bold" />
            </div>
            <span className="text-xs sm:text-sm font-black text-[#0F172A] dark:text-white">
              {isLanguages ? "Lesson Learning Path" : "خطة إنجاز الدرس"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-[#0F172A] dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
              {completedCount} من 4 {isLanguages ? "done" : "مكتملة"}
            </span>
          </div>
        </div>

        {/* Next Recommended Activity CTA / All Done badge */}
        <div className="self-start sm:self-auto shrink-0">
          {nextStepId ? (
            <button
              type="button"
              onClick={() => onSelectStep(nextStepId!)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-xs font-bold transition-all cursor-pointer group shadow-2xs"
              title={isLanguages ? "Go to recommended next activity" : "الانتقال للنشاط المقترح التالي"}
            >
              <span>{isLanguages ? "Next:" : "الخطوة التالية:"}</span>
              <span className="font-black underline decoration-dotted">{nextStepTitle}</span>
              {isLanguages ? (
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" weight="bold" />
              ) : (
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" weight="bold" />
              )}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              <Check className="w-3.5 h-3.5" weight="bold" />
              <span>{isLanguages ? "All activities completed" : "تمت جميع أنشطة الدرس"}</span>
            </span>
          )}
        </div>
      </div>

      {/* 4 Activity Steps Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {steps.map((st) => {
          const isActive = activeStep === st.id;

          let cardClasses = "border-[#E2E8F0] dark:border-[#22364F] bg-[#F8FAFC] dark:bg-[#0D1B2E] hover:border-slate-300";
          let badgeClasses = "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
          let iconBoxClasses = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300";

          if (isActive) {
            cardClasses = "border-[#14213D] dark:border-blue-400 ring-2 ring-[#14213D]/10 dark:ring-blue-400/20 bg-white dark:bg-[#14213D]/30 shadow-xs";
            iconBoxClasses = "bg-[#14213D] dark:bg-blue-600 text-white";
          } else if (st.isCompleted) {
            cardClasses = "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-300";
            badgeClasses = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300";
            iconBoxClasses = "bg-emerald-600 text-white";
          } else if (st.isNext) {
            cardClasses = "border-blue-300 dark:border-blue-700/80 bg-blue-50/40 dark:bg-blue-950/25 hover:border-blue-400";
            badgeClasses = "bg-blue-100 text-[#2563EB] dark:bg-blue-900/60 dark:text-blue-300 font-black";
            iconBoxClasses = "bg-[#2563EB] text-white";
          } else if (st.isInProgress) {
            cardClasses = "border-amber-300 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400";
            badgeClasses = "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300";
            iconBoxClasses = "bg-amber-600 text-white";
          }

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStep(st.id)}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 cursor-pointer relative overflow-hidden group hover:scale-[1.01] active:scale-[0.99] min-h-[88px] sm:min-h-[96px] ${cardClasses} ${
                isLanguages ? "text-left" : "text-right"
              }`}
            >
              {/* Top Row: Icon & Status Badge */}
              <div className="flex items-center justify-between gap-1.5 w-full">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-mono font-black text-xs transition-colors shadow-2xs ${iconBoxClasses}`}
                >
                  {st.isCompleted ? (
                    <Check className="w-3.5 h-3.5" weight="bold" />
                  ) : (
                    st.stepNumber
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[110px] ${badgeClasses}`}
                >
                  {st.statusText}
                </span>
              </div>

              {/* Title */}
              <div className="text-xs sm:text-[13px] font-bold text-[#0F172A] dark:text-white truncate w-full">
                {st.title}
              </div>

              {/* Metric */}
              <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-medium truncate w-full">
                {st.metric}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
