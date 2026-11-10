"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Play,
  Target,
  CheckCircle2,
  BookmarkCheck,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { PaywallModal } from "@/components/student/subscription/PaywallModal";

export interface SubjectLessonData {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  isTrial?: boolean | null;
  summary?: { id: string } | null;
  questions: { questionId: string }[];
}

export interface SubjectUnitData {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: SubjectLessonData[];
}

interface SubjectUnitsListProps {
  subjectId: string;
  units: SubjectUnitData[];
  completedLessonIds: string[];
  masteredQuestionIds: string[];
  isSubscriptionActive: boolean;
  user?: {
    name?: string | null;
    loginCode?: string | null;
    phone?: string | null;
  } | null;
}

export function SubjectUnitsList({
  subjectId,
  units,
  completedLessonIds,
  masteredQuestionIds,
  isSubscriptionActive,
  user,
}: SubjectUnitsListProps) {
  const [lockedModal, setLockedModal] = useState<{
    lessonTitle: string;
    unitTitle: string;
  } | null>(null);

  const completedSet = new Set(completedLessonIds);
  const masteredSet = new Set(masteredQuestionIds);

  return (
    <>
      <div className="space-y-4">
        {units.map((unit, index) => {
          const unitCompleted = unit.lessons.filter((l) => completedSet.has(l.id)).length;
          const unitTotal = unit.lessons.length;
          const unitProgress = unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0;

          const unitQuestions = unit.lessons.flatMap((l) => l.questions.map((q) => q.questionId));
          const unitMasteredCount = unitQuestions.filter((qid) => masteredSet.has(qid)).length;
          const unitMasteryPct =
            unitQuestions.length > 0
              ? Math.round((unitMasteredCount / unitQuestions.length) * 100)
              : 0;

          return (
            <div
              key={unit.id}
              className="rounded-3xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] overflow-hidden shadow-[0_8px_28px_rgba(9,27,64,0.07)]"
            >
              {/* Unit Header */}
              <div className="p-4 sm:p-5 bg-[#EAF2FF]/40 dark:bg-[#071737] border-b border-[#E2E8F0] dark:border-[#1E3A6E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-mono font-bold text-[#800B34] dark:text-[#E9AD32]">
                      الوحدة {index + 1}
                    </span>
                    <span className="text-[13px] text-[#536681]">•</span>
                    <span className="text-[13px] font-mono text-[#536681] dark:text-[#94A3B8]">
                      {unitCompleted} من {unitTotal} منجز ({unitProgress}%)
                    </span>
                    {unitQuestions.length > 0 && (
                      <>
                        <span className="text-[13px] text-[#536681]">•</span>
                        <span
                          className={`text-[12px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            unitMasteryPct >= 80
                              ? "bg-[#17834B]/10 text-[#17834B] dark:text-[#34D399]"
                              : unitMasteryPct >= 50
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : "bg-[#536681]/10 text-[#536681] dark:text-[#94A3B8]"
                          }`}
                        >
                          إتقان الأسئلة: {unitMasteryPct}% ({unitMasteredCount}/{unitQuestions.length})
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#091B40] dark:text-white">
                    {unit.title}
                  </h3>
                  {unit.description && (
                    <p className="text-[13px] text-[#536681] dark:text-[#94A3B8]">
                      {unit.description}
                    </p>
                  )}
                </div>

                <Link
                  href={`/exams/builder?subjectId=${subjectId}&unitId=${unit.id}`}
                  className="h-10 px-4 rounded-xl bg-white dark:bg-[#0D214D] hover:bg-[#F7F9FC] dark:hover:bg-[#1E3A6E] text-[#091B40] dark:text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all shrink-0 self-start sm:self-center border border-[#E2E8F0] dark:border-[#1E3A6E]"
                >
                  <Target className="w-3.5 h-3.5 text-[#800B34] dark:text-[#E9AD32]" />
                  <span>امتحان الوحدة</span>
                </Link>
              </div>

              {/* Lessons in this Unit */}
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E3A6E]">
                {unit.lessons.map((lesson) => {
                  const isLessonCompleted = completedSet.has(lesson.id);
                  const lessonQuestions = lesson.questions.map((q) => q.questionId);
                  const lessonMasteredCount = lessonQuestions.filter((qid) => masteredSet.has(qid)).length;
                  const lessonMasteryPct =
                    lessonQuestions.length > 0
                      ? Math.round((lessonMasteredCount / lessonQuestions.length) * 100)
                      : 0;

                  const isFreeTrialLesson =
                    Boolean(lesson.isTrial) || (unit.order === 1 && lesson.order === 1);
                  const isLessonLocked = !isSubscriptionActive && !isFreeTrialLesson;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        if (isLessonLocked) {
                          setLockedModal({
                            lessonTitle: lesson.title,
                            unitTitle: unit.title,
                          });
                        }
                      }}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        isLessonLocked
                          ? "bg-[#FAF6F7]/60 dark:bg-[#0A1A3A]/40 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 cursor-pointer"
                          : "hover:bg-[#F7F9FC]/80 dark:hover:bg-[#11244E]/40"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isLessonLocked
                              ? "bg-amber-500/10 text-[#800B34] dark:text-[#E9AD32] border border-amber-500/20"
                              : isLessonCompleted
                              ? "bg-[#17834B]/10 dark:bg-[#17834B]/20 text-[#17834B] dark:text-[#34D399]"
                              : "bg-[#800B34]/10 dark:bg-[#800B34]/20 text-[#800B34] dark:text-[#E9AD32]"
                          }`}
                        >
                          {isLessonLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : isLessonCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-1" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-[#091B40] dark:text-white leading-snug">
                              {lesson.title}
                            </h4>

                            {isLessonLocked ? (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-[#800B34] dark:text-[#E9AD32] border border-amber-500/20 inline-flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>مقفول للمشتركين</span>
                              </span>
                            ) : isLessonCompleted ? (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#17834B]/10 dark:bg-[#17834B]/20 text-[#17834B] dark:text-[#34D399]">
                                مكتمل
                              </span>
                            ) : null}

                            {lessonQuestions.length > 0 && !isLessonLocked && (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-sans tabular-nums font-bold px-2 py-0.5 rounded-full ${
                                  lessonMasteryPct >= 80
                                    ? "bg-[#17834B]/10 text-[#17834B] dark:text-[#34D399]"
                                    : lessonMasteryPct >= 40
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                    : "bg-[#536681]/10 text-[#536681] dark:text-[#94A3B8]"
                                }`}
                              >
                                إتقان {lessonMasteryPct}%
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[13px] text-[#536681] dark:text-[#94A3B8] font-medium flex-wrap">
                            <span className="flex items-center gap-1 font-sans tabular-nums text-[13px]">
                              <Clock className="w-3 h-3 text-[#536681]" />
                              <span>{lesson.durationMinutes} دقيقة</span>
                            </span>
                            {lesson.summary && (
                              <span className="inline-flex items-center gap-1 text-[#E9AD32] font-bold">
                                <BookmarkCheck className="w-3.5 h-3.5" />
                                <span>الزتونة جاهزة</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2 shrink-0 self-stretch sm:self-center"
                        onClick={(e) => isLessonLocked && e.stopPropagation()}
                      >
                        {!isLessonLocked && (
                          <Link
                            href={`/exams/builder?subjectId=${subjectId}&unitId=${unit.id}&lessonId=${lesson.id}`}
                            className="h-10 px-3.5 rounded-xl bg-white dark:bg-[#0D214D] hover:bg-[#F7F9FC] dark:hover:bg-[#1E3A6E] text-[#800B34] dark:text-[#E9AD32] border border-[#E2E8F0] dark:border-[#1E3A6E] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                            title="امتحان على هذا الدرس"
                          >
                            <Target className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">امتحان الدرس</span>
                          </Link>
                        )}

                        {isLessonLocked ? (
                          <button
                            type="button"
                            onClick={() =>
                              setLockedModal({
                                lessonTitle: lesson.title,
                                unitTitle: unit.title,
                              })
                            }
                            className="h-10 px-4 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all shrink-0 active:scale-98 flex-1 sm:flex-initial bg-[#800B34] hover:bg-[#680829] text-white shadow-xs cursor-pointer"
                            title="ابدأ المذاكرة (محتوى مخصص للمشتركين)"
                          >
                            <span>ابدأ المذاكرة</span>
                            <Lock className="w-3.5 h-3.5 text-[#E9AD32]" />
                          </button>
                        ) : (
                          <Link
                            href={`/lessons/${lesson.id}`}
                            className={`h-10 px-4 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all shrink-0 active:opacity-80 flex-1 sm:flex-initial ${
                              isLessonCompleted
                                ? "bg-[#F7F9FC] dark:bg-[#0D214D] hover:bg-[#E2E8F0] dark:hover:bg-[#1E3A6E] text-[#091B40] dark:text-[#F7F9FC] border border-[#E2E8F0] dark:border-[#1E3A6E]"
                                : "bg-[#800B34] hover:bg-[#680829] text-white shadow-xs"
                            }`}
                          >
                            <span>{isLessonCompleted ? "مراجعة الدرس" : "ابدأ المذاكرة"}</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Paywall Modal for Locked Lessons */}
      <PaywallModal
        isOpen={Boolean(lockedModal)}
        onClose={() => setLockedModal(null)}
        lessonTitle={lockedModal?.lessonTitle}
        unitTitle={lockedModal?.unitTitle}
        user={user}
      />
    </>
  );
}

