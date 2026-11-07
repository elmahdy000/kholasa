"use client";

import React from "react";
import {
  BookmarkSimple,
  Lightning,
  Exam,
  Sparkle,
  Check,
  Compass,
} from "@phosphor-icons/react";

export interface LessonLearningStepperProps {
  activeStep: "definitions" | "tf" | "exam" | "mistakes";
  onSelectStep: (step: "definitions" | "tf" | "exam" | "mistakes") => void;
  definitionsCount: number;
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
  tfQuestionsCount,
  tfAnsweredCount,
  examQuestionsCount,
  examAnsweredCount,
  unresolvedMistakesCount,
  isLanguages = false,
}: LessonLearningStepperProps) {
  // Check completion states
  const isTfDone = tfQuestionsCount > 0 && tfAnsweredCount >= tfQuestionsCount;
  const isExamDone = examQuestionsCount > 0 && examAnsweredCount >= examQuestionsCount;
  const isMistakesClean = unresolvedMistakesCount === 0 && (isTfDone || isExamDone);

  // Overall progress score (out of 4)
  let completedSteps = 1; // Concepts always available
  if (isTfDone || tfQuestionsCount === 0) completedSteps++;
  if (isExamDone) completedSteps++;
  if (isMistakesClean) completedSteps++;
  const progressPercent = Math.min(100, Math.round((completedSteps / 4) * 100));

  const steps = [
    {
      id: "definitions" as const,
      stepNumber: 1,
      title: isLanguages ? "Concepts & Notes" : "المفاهيم والشرح",
      badge: definitionsCount > 0 ? `${definitionsCount} ${isLanguages ? "terms" : "مصطلحات"}` : (isLanguages ? "Overview" : "ملخص"),
      isCompleted: true,
      icon: BookmarkSimple,
    },
    {
      id: "tf" as const,
      stepNumber: 2,
      title: isLanguages ? "Quick Challenges" : "التحديات السريعة",
      badge: tfQuestionsCount > 0 ? `${tfAnsweredCount}/${tfQuestionsCount}` : (isLanguages ? "0 challenges" : "متاح"),
      isCompleted: isTfDone,
      icon: Lightning,
    },
    {
      id: "exam" as const,
      stepNumber: 3,
      title: isLanguages ? "Exam Practice" : "أسئلة الامتحانات",
      badge: examQuestionsCount > 0 ? `${examAnsweredCount}/${examQuestionsCount}` : (isLanguages ? "0 questions" : "متاح"),
      isCompleted: isExamDone,
      icon: Exam,
    },
    {
      id: "mistakes" as const,
      stepNumber: 4,
      title: isLanguages ? "Mistakes Drill" : "تظبيط الغلطات",
      badge:
        unresolvedMistakesCount === 0
          ? isLanguages ? "0 mistakes ✓" : "صفر غلطات ✓"
          : `${unresolvedMistakesCount} ${isLanguages ? "mistakes" : "أخطاء"}`,
      isCompleted: isMistakesClean,
      icon: Sparkle,
    },
  ];

  const dir = isLanguages ? "ltr" : "rtl";

  return (
    <div
      dir={dir}
      className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3 transition-colors"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" weight="bold" />
          </div>
          <span className="text-xs sm:text-sm font-black text-[#12263F] dark:text-white">
            {isLanguages ? "Lesson Learning Path & Next Steps" : "خطة إنجاز الدرس خطوة بخطوة"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/50 dark:border-slate-700/50 hidden sm:block">
            <div
              className="h-full bg-gradient-to-l from-[#800020] to-[#D97706] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-black text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 dark:bg-[#800020]/25 border border-[#800020]/20 px-2.5 py-0.5 rounded-full">
            {progressPercent}% {isLanguages ? "Ready" : "جاهزية"}
          </span>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {steps.map((st) => {
          const isActive = activeStep === st.id;

          let borderStyle = "border-[#E8E9ED] dark:border-[#22364F]";
          let bgStyle = "bg-[#F8FAFA] dark:bg-[#0D1B2E]";

          if (isActive) {
            borderStyle = "border-[#800020] dark:border-[#FB7185] ring-2 ring-[#800020]/15 dark:ring-[#FB7185]/20";
            bgStyle = "bg-[#800020]/5 dark:bg-[#800020]/15";
          } else if (st.isCompleted) {
            borderStyle = "border-emerald-500/30 dark:border-emerald-500/30";
            bgStyle = "bg-emerald-50/50 dark:bg-emerald-950/20";
          }

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStep(st.id)}
              className={`p-3 rounded-xl border transition-all flex items-center gap-2.5 cursor-pointer relative overflow-hidden group hover:scale-[1.01] active:scale-[0.99] ${borderStyle} ${bgStyle} ${
                isLanguages ? "text-left" : "text-right"
              }`}
            >
              {/* Step indicator circle / checkmark */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono font-black text-xs transition-colors shadow-2xs ${
                  st.isCompleted
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-[#800020] dark:bg-[#FB7185] text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                {st.isCompleted ? (
                  <Check className="w-3.5 h-3.5" weight="bold" />
                ) : (
                  st.stepNumber
                )}
              </div>

              {/* Title & Badge */}
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-[13px] font-bold text-[#12263F] dark:text-white truncate">
                  {st.title}
                </div>

                <div className="mt-0.5">
                  <span
                    className={`text-[11px] font-medium font-mono px-1.5 py-0.2 rounded-md ${
                      st.isCompleted
                        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15"
                        : "text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/5"
                    }`}
                  >
                    {st.badge}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
