"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  Check,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";

export interface SimulatedQuestion {
  id: string;
  statement: string;
  translation?: string | null;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty?: string;
  unitTitle?: string;
  lessonTitle?: string;
  options: {
    id: string;
    text: string;
    translation?: string | null;
    isCorrect?: boolean;
    order: number;
  }[];
  explanation?: { text?: string; correctReason?: string; concept?: string } | null;
  rubric?: { modelAnswer?: string | null; maxScore?: number | null } | null;
}

interface ExamSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle: string;
  durationMinutes: number;
  subjectName: string;
  questions: SimulatedQuestion[];
  isPractice?: boolean;
}

export function ExamSimulatorModal({
  isOpen,
  onClose,
  examTitle,
  durationMinutes,
  subjectName,
  questions,
  isPractice = false,
}: ExamSimulatorModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> selectedOptionId
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({}); // questionId -> essayText
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset simulation when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setAnswers({});
      setEssayAnswers({});
      setSecondsRemaining(durationMinutes * 60);
      setIsCompleted(false);
      setShowExitConfirm(false);
    }
  }, [isOpen, durationMinutes]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isCompleted]);

  if (!isOpen) return null;

  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Evaluation of results
  let correctCount = 0;
  let mcqTotal = 0;
  questions.forEach((q) => {
    if (q.type !== "ESSAY") {
      mcqTotal++;
      const userSel = answers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (userSel && correctOpt && userSel === correctOpt.id) {
        correctCount++;
      }
    }
  });

  const percentage = mcqTotal > 0 ? Math.round((correctCount / mcqTotal) * 100) : 100;
  const answeredCount = Object.keys(answers).length + Object.keys(essayAnswers).filter((k) => essayAnswers[k]?.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F172A]/80 backdrop-blur-md transition-all font-sans select-none">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-right">
        
        {/* Top Simulation Banner */}
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>🧪 وضع تجربة الامتحان (محاكاة الطالب) — هذه جلسة تجريبية خاصة بالمعلم ولن تؤثر على درجات الطلاب</span>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-500/20">
            SIMULATOR
          </span>
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#1E293B]/60">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#800020] text-white text-xs font-bold">
                {subjectName}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white truncate">
                {examTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Timer */}
            {!isCompleted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-xs font-mono font-bold text-[#0F172A] dark:text-white shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#800020]" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            )}

            {/* Exit button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors cursor-pointer"
              title="إنهاء المحاكاة والخروج"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {isCompleted ? (
            /* Results Screen */
            <div className="space-y-6 text-center max-w-xl mx-auto py-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#0F172A] dark:text-white">
                  تم اختبار الامتحان بنجاح!
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
                  هذه هي النتيجة التجريبية لاختبارك كما سيراها الطالب بالضبط بعد التسليم.
                </p>
              </div>

              {/* Score Box */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid grid-cols-3 gap-3">
                <div>
                  <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] block">
                    النسبة المئوية
                  </span>
                  <span className="text-2xl font-black text-[#0F172A] dark:text-white font-mono mt-1 block">
                    {percentage}%
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] block">
                    الإجابات الصحيحة
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                    {correctCount} / {mcqTotal}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] block">
                    الوقت المستغرق
                  </span>
                  <span className="text-2xl font-black text-[#0F172A] dark:text-white font-mono mt-1 block">
                    {formatTime(durationMinutes * 60 - secondsRemaining)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(0);
                    setAnswers({});
                    setEssayAnswers({});
                    setSecondsRemaining(durationMinutes * 60);
                    setIsCompleted(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white hover:border-[#800020] flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة التجربة من البداية</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>العودة لإعدادات الامتحان</span>
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* Question Solver Screen */
            <div className="space-y-5">
              {/* Progress and Question Palette */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                  <span>
                    السؤال{" "}
                    <span className="font-mono text-[#0F172A] dark:text-white font-black">
                      {currentIndex + 1}
                    </span>{" "}
                    من{" "}
                    <span className="font-mono text-[#0F172A] dark:text-white font-black">
                      {totalQuestions}
                    </span>
                  </span>
                  <span>
                    تم حل {answeredCount} من {totalQuestions}
                  </span>
                </div>

                {/* Question Numbers Quick Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {questions.map((q, idx) => {
                    const isAnswered = q.type === "ESSAY" ? Boolean(essayAnswers[q.id]?.trim()) : Boolean(answers[q.id]);
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold font-mono shrink-0 transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-[#800020] text-white ring-2 ring-[#800020]/30"
                            : isAnswered
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : "bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Question Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]">
                      {currentQ.type === "MCQ" ? "اختيار من متعدد" : currentQ.type === "TRUE_FALSE" ? "صح أو خطأ" : "سؤال مقالي"}
                    </span>
                    {currentQ.unitTitle && (
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        {currentQ.unitTitle}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185]">
                    {currentQ.type === "ESSAY" ? "درجتان" : "درجة واحدة"}
                  </span>
                </div>

                {/* Statement */}
                <h4 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-relaxed">
                  <BidiStatement as="span" text={currentQ.statement} />
                </h4>

                {/* Translation if exists */}
                {currentQ.translation && (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    <BidiStatement as="span" text={currentQ.translation} />
                  </p>
                )}

                {/* Options or Essay Box */}
                {currentQ.type === "ESSAY" ? (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                      اكتب إجابتك هنا:
                    </label>
                    <textarea
                      rows={4}
                      value={essayAnswers[currentQ.id] || ""}
                      onChange={(e) =>
                        setEssayAnswers((prev) => ({
                          ...prev,
                          [currentQ.id]: e.target.value,
                        }))
                      }
                      placeholder="اكتب إجابتك النموذجية كما يكتبها الطالب..."
                      className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                    />
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = answers[currentQ.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [currentQ.id]: opt.id,
                            }))
                          }
                          className={`w-full p-3.5 rounded-xl border text-right flex items-center justify-between gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#800020]/10 border-[#800020] text-[#0F172A] dark:text-white"
                              : "bg-[#F8FAFC] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#E2E8F0] hover:border-[#800020]/40"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-[#800020] text-white"
                                  : "bg-[#E2E8F0] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8]"
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="text-sm font-semibold break-words">
                              <BidiStatement as="span" text={opt.text} />
                            </span>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-[#800020] bg-[#800020] text-white"
                                : "border-[#CBD5E1] dark:border-[#475569]"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>السابق</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>التالي</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCompleted(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>إنهاء المحاكاة وعرض النتيجة</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#64748B]">لا توجد أسئلة في هذا الامتحان</div>
          )}
        </div>
      </div>
    </div>
  );
}

