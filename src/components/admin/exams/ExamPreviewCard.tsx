"use client";

import { useState } from "react";
import {
  Clock,
  HelpCircle,
  Award,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  FileCheck,
  Check,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { ExamSimulatorModal, SimulatedQuestion } from "./ExamSimulatorModal";

export interface PreviewExamData {
  title: string;
  description?: string | null;
  subjectName: string;
  subjectColor?: string | null;
  durationMinutes: number;
  isPractice: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  isPublished?: boolean;
  scopeSummary?: {
    unitTitles?: string[];
    lessonTitles?: string[];
    isFullSubject?: boolean;
  };
  questions: SimulatedQuestion[];
}

interface ExamPreviewCardProps {
  examData: PreviewExamData;
  onLaunchSimulator?: () => void;
  customAction?: React.ReactNode;
}

export function ExamPreviewCard({
  examData,
  onLaunchSimulator,
  customAction,
}: ExamPreviewCardProps) {
  const [viewMode, setViewMode] = useState<"student" | "teacher">("teacher");
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const {
    title,
    description,
    subjectName,
    subjectColor,
    durationMinutes,
    isPractice,
    startsAt,
    endsAt,
    isPublished = true,
    scopeSummary,
    questions,
  } = examData;

  const totalQuestions = questions.length;
  const totalScore = questions.reduce((sum, q) => {
    if (q.rubric?.maxScore) return sum + q.rubric.maxScore;
    return sum + 1; // 1 mark by default
  }, 0);

  const handleOpenSimulator = () => {
    if (onLaunchSimulator) {
      onLaunchSimulator();
    } else {
      setIsSimulatorOpen(true);
    }
  };

  const formatSchedule = (isoString?: string | null) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="w-full bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] p-5 sm:p-7 space-y-6 text-right font-sans shadow-sm">
      {/* Top Banner / Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155] pb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[13px] font-bold px-3 py-1 rounded-xl text-white shadow-xs"
            style={{ backgroundColor: subjectColor || "#800020" }}
          >
            {subjectName}
          </span>

          <span
            className={`text-[12px] font-bold px-2.5 py-1 rounded-lg border ${
              isPractice
                ? "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30"
                : "bg-[#059669]/10 text-[#059669] border-[#059669]/30"
            }`}
          >
            {isPractice ? "وضع تدريب (شرح فوري)" : "امتحان رسمي بوقت محدد"}
          </span>

          {startsAt && (
            <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>مجدول: {formatSchedule(startsAt)}</span>
            </span>
          )}

          {!isPublished && (
            <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              مسودة (غير مرئي للطلاب)
            </span>
          )}
        </div>

        {/* Simulator Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenSimulator}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>اختبار وضع الامتحان (محاكاة الطالب)</span>
          </button>
          {customAction}
        </div>
      </div>

      {/* Exam Header Overview */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white leading-snug">
          {title || "بدون عنوان"}
        </h2>
        {description && (
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Quick Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155]">
        <div className="space-y-0.5">
          <span className="text-[12px] font-bold text-[#94A3B8] block">مدة الامتحان</span>
          <span className="text-[14px] font-bold text-[#0F172A] dark:text-white font-mono flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#800020]" />
            {durationMinutes} دقيقة
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[12px] font-bold text-[#94A3B8] block">عدد الأسئلة</span>
          <span className="text-[14px] font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#800020]" />
            {totalQuestions} سؤال
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[12px] font-bold text-[#94A3B8] block">إجمالي الدرجات</span>
          <span className="text-[14px] font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            {totalScore} درجة
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[12px] font-bold text-[#94A3B8] block">نهاية الإتاحة</span>
          <span className="text-[13px] font-bold text-[#0F172A] dark:text-white">
            {endsAt ? formatSchedule(endsAt) : "متاح بدون موعد إغلاق"}
          </span>
        </div>
      </div>

      {/* Scope Details Pills */}
      {scopeSummary && (
        <div className="p-3.5 rounded-xl bg-[#F8FAFC]/80 dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] text-[13px] space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-[#64748B] dark:text-[#94A3B8]">
            <Layers className="w-4 h-4 text-[#800020]" />
            <span>نطاق الأسئلة المشمول:</span>
            {scopeSummary.isFullSubject ? (
              <span className="text-[#0F172A] dark:text-white font-bold">
                امتحان شامل لجميع وحدات ودروس المادة
              </span>
            ) : (
              <span className="text-[#0F172A] dark:text-white font-medium">
                وحدات ودروس مخصصة
              </span>
            )}
          </div>
          {!scopeSummary.isFullSubject && scopeSummary.unitTitles && scopeSummary.unitTitles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {scopeSummary.unitTitles.map((ut, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md text-[12px] font-semibold bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#334155] dark:text-[#E2E8F0]"
                >
                  {ut}
                </span>
              ))}
              {scopeSummary.lessonTitles && scopeSummary.lessonTitles.map((lt, idx) => (
                <span
                  key={`lesson-${idx}`}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#800020]/5 dark:bg-[#800020]/20 border border-[#800020]/20 text-[#800020] dark:text-[#FB7185]"
                >
                  📖 {lt}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Mode Switcher */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
        <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#800020]" />
          <span>قائمة أسئلة الامتحان ({totalQuestions} أسئلة)</span>
        </h3>

        <div className="inline-flex rounded-xl p-1 bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
          <button
            type="button"
            onClick={() => setViewMode("teacher")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === "teacher"
                ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-white shadow-xs"
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>مفتاح الإجابة (للمعلم)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("student")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === "student"
                ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-white shadow-xs"
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>عرض الطالب (بدون إجابات)</span>
          </button>
        </div>
      </div>

      {/* Questions Stack */}
      {questions.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] text-[#94A3B8] text-sm">
          لم يتم تحديد أي أسئلة لهذا الامتحان بعد.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isEssay = q.type === "ESSAY";
            return (
              <div
                key={q.id || idx}
                className="p-5 rounded-xl bg-[#F8FAFC]/50 dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] space-y-3"
              >
                {/* Header line of question */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#800020] text-white text-[12px] font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                      {q.type === "MCQ"
                        ? "اختيار من متعدد"
                        : q.type === "TRUE_FALSE"
                        ? "صح أم خطأ"
                        : "سؤال مقالي"}
                    </span>
                    {q.difficulty && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {q.difficulty === "EASY"
                          ? "سهل"
                          : q.difficulty === "HARD"
                          ? "صعب"
                          : "متوسط"}
                      </span>
                    )}
                  </div>

                  <div className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
                    {q.unitTitle && <span>{q.unitTitle}</span>}
                    {q.lessonTitle && <span>• {q.lessonTitle}</span>}
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono">
                      {q.rubric?.maxScore || 1} درجة
                    </span>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="text-[14px] sm:text-[15px] font-bold text-[#0F172A] dark:text-white leading-relaxed">
                  <BidiStatement text={q.statement} as="div" />
                </div>
                {q.translation && (
                  <div className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed border-r-2 border-[#800020]/40 pr-2.5">
                    {q.translation}
                  </div>
                )}

                {/* Options or Essay Model */}
                {isEssay ? (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-2">
                    {viewMode === "student" ? (
                      <div className="h-20 rounded-lg border border-dashed border-[#CBD5E1] dark:border-[#334155] flex items-center justify-center text-[13px] text-[#94A3B8]">
                        مساحة كتابة إجابة الطالب
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 block">
                          نموذج الإجابة ومعايير التصحيح:
                        </span>
                        <p className="text-[13px] text-[#0F172A] dark:text-[#E2E8F0] leading-relaxed">
                          {q.rubric?.modelAnswer || "لا يوجد نموذج إجابة مسجل"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = opt.isCorrect;
                      const showAsCorrect = viewMode === "teacher" && isCorrect;

                      return (
                        <div
                          key={opt.id || optIdx}
                          className={`p-3 rounded-xl border text-[13px] font-medium flex items-center justify-between gap-2 transition-colors ${
                            showAsCorrect
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-bold"
                              : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#334155] dark:text-[#E2E8F0]"
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span
                              className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                showAsCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B]"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="leading-snug">{opt.text}</span>
                          </div>

                          {showAsCorrect && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shrink-0">
                              <Check className="w-3 h-3" />
                              <span>الإجابة الصحيحة</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation in Teacher View */}
                {viewMode === "teacher" && (q.explanation?.text || q.explanation?.correctReason || q.explanation?.concept) && (
                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 text-[12px] text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">التفسير والشرح: </span>
                      <span>{q.explanation.correctReason || q.explanation.text || q.explanation.concept}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Simulator Modal Instance */}
      <ExamSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        examTitle={title}
        durationMinutes={durationMinutes}
        subjectName={subjectName}
        questions={questions}
        isPractice={isPractice}
      />
    </div>
  );
}

