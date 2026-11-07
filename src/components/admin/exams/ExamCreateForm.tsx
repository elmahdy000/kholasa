"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  Shuffle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RefreshCw,
  Check,
  Eye,
  Sliders,
  BookmarkCheck,
} from "lucide-react";
import { Subject, ExamItem } from "./types";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { SimulatedQuestion } from "./ExamSimulatorModal";
import { ExamPreviewCard, PreviewExamData } from "./ExamPreviewCard";

interface ExamCreateFormProps {
  subjects: Subject[];
  isStandaloneRoute?: boolean;
  onClose?: () => void;
  onExamCreated?: (newExam: ExamItem) => void;
}

interface PoolQuestion extends SimulatedQuestion {
  unitId?: string | null;
  lessonIds?: string[];
}

export function ExamCreateForm({
  subjects,
  isStandaloneRoute = false,
  onClose,
  onExamCreated,
}: ExamCreateFormProps) {
  const router = useRouter();

  // Wizard Step: 1: Details & Schedule, 2: Scope, 3: Questions, 4: Preview & Simulate
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Details & Schedule
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [isPractice, setIsPractice] = useState(false);
  const [scheduleType, setScheduleType] = useState<"immediate" | "scheduled" | "draft">("immediate");
  const [startsAt, setStartsAt] = useState<string>("");
  const [endsAt, setEndsAt] = useState<string>("");

  // Step 2: Scope (Units & Lessons)
  const [isFullSubject, setIsFullSubject] = useState(true);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);

  // Step 3: Questions Assembler
  const [questionsPool, setQuestionsPool] = useState<PoolQuestion[]>([]);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [poolError, setPoolError] = useState<string | null>(null);

  // Selected Deck
  const [selectedQuestions, setSelectedQuestions] = useState<PoolQuestion[]>([]);

  // Smart Auto-Generator Settings
  const [mcqTargetCount, setMcqTargetCount] = useState(10);
  const [tfTargetCount, setTfTargetCount] = useState(5);
  const [essayTargetCount, setEssayTargetCount] = useState(0);

  // Manual Picker Drawer / Search
  const [showManualPicker, setShowManualPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [bankTypeFilter, setBankTypeFilter] = useState<string>("ALL");
  const [swapFeedback, setSwapFeedback] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derived active subject and units
  const activeSubject = useMemo(() => {
    return subjects.find((s) => s.id === subjectId) || subjects[0];
  }, [subjects, subjectId]);

  const availableUnits = activeSubject?.units || [];

  // Reset units/lessons/questions when subject changes
  const handleSubjectChange = (newSubjectId: string) => {
    setSubjectId(newSubjectId);
    setSelectedUnitIds([]);
    setSelectedLessonIds([]);
    setSelectedQuestions([]);
    setQuestionsPool([]);
  };

  // Fetch Questions Pool when moving to Step 3
  const fetchQuestionsPool = async () => {
    if (!subjectId) return;
    setIsLoadingPool(true);
    setPoolError(null);
    try {
      const params = new URLSearchParams();
      params.set("subjectId", subjectId);
      if (!isFullSubject) {
        if (selectedUnitIds.length > 0) {
          params.set("unitIds", selectedUnitIds.join(","));
        }
        if (selectedLessonIds.length > 0) {
          params.set("lessonIds", selectedLessonIds.join(","));
        }
      }

      const res = await fetch(`/api/admin/exams/questions-pool?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحميل بنك أسئلة النطاق المحدد");
      }

      // Map pool questions
      const mapped: PoolQuestion[] = (data.questions || []).map((q: any) => ({
        id: q.id,
        statement: q.statement,
        translation: q.translation,
        type: q.type,
        difficulty: q.difficulty,
        unitId: q.unitId,
        unitTitle: q.unit?.title,
        lessonIds: q.lessons?.map((l: any) => l.lesson?.id).filter(Boolean) || [],
        lessonTitle: q.lessons?.[0]?.lesson?.title || undefined,
        options: (q.options || []).map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          translation: opt.translation,
          isCorrect: opt.isCorrect,
          order: opt.order,
        })),
        explanation: q.explanation,
        rubric: q.rubric,
      }));

      setQuestionsPool(mapped);

      // If user hasn't selected any questions yet, auto-populate reasonable defaults
      if (selectedQuestions.length === 0 && mapped.length > 0) {
        const initialSelected = mapped.slice(0, Math.min(10, mapped.length));
        setSelectedQuestions(initialSelected);
      }
    } catch (err) {
      setPoolError(err instanceof Error ? err.message : "خطأ أثناء تحميل بنك الأسئلة");
    } finally {
      setIsLoadingPool(false);
    }
  };

  // Trigger pool loading when step switches to 3
  useEffect(() => {
    if (currentStep === 3 && questionsPool.length === 0) {
      fetchQuestionsPool();
    }
  }, [currentStep]);

  // Smart Balanced Auto-Assembly
  const handleSmartAssembly = () => {
    if (questionsPool.length === 0) return;

    const mcqs = questionsPool.filter((q) => q.type === "MCQ");
    const tfs = questionsPool.filter((q) => q.type === "TRUE_FALSE");
    const essays = questionsPool.filter((q) => q.type === "ESSAY");

    // Shuffle arrays
    const shuffle = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const chosenMcq = shuffle(mcqs).slice(0, mcqTargetCount);
    const chosenTf = shuffle(tfs).slice(0, tfTargetCount);
    const chosenEssay = shuffle(essays).slice(0, essayTargetCount);

    const combined = [...chosenMcq, ...chosenTf, ...chosenEssay];
    setSelectedQuestions(combined);
    setSwapFeedback(`تم توليد ${combined.length} سؤال متوازن وفق اختيارك.`);
    setTimeout(() => setSwapFeedback(null), 3500);
  };

  // Swap question with an alternative from the same lesson or unit
  const handleSwapQuestion = (indexToSwap: number) => {
    const currentQ = selectedQuestions[indexToSwap];
    if (!currentQ) return;

    const selectedIds = new Set(selectedQuestions.map((q) => q.id));

    // Try finding alternative in same lesson
    let candidates = questionsPool.filter((q) => {
      if (selectedIds.has(q.id)) return false;
      const sharesLesson = q.lessonIds?.some((lid) => currentQ.lessonIds?.includes(lid));
      return sharesLesson && q.type === currentQ.type;
    });

    // Fallback 1: same lesson, any type
    if (candidates.length === 0) {
      candidates = questionsPool.filter((q) => {
        if (selectedIds.has(q.id)) return false;
        return q.lessonIds?.some((lid) => currentQ.lessonIds?.includes(lid));
      });
    }

    // Fallback 2: same unit, same type
    if (candidates.length === 0 && currentQ.unitId) {
      candidates = questionsPool.filter((q) => {
        if (selectedIds.has(q.id)) return false;
        return q.unitId === currentQ.unitId && q.type === currentQ.type;
      });
    }

    // Fallback 3: any question from pool not in deck
    if (candidates.length === 0) {
      candidates = questionsPool.filter((q) => !selectedIds.has(q.id));
    }

    if (candidates.length === 0) {
      setSwapFeedback("لا توجد أسئلة بديلة أخرى متوفرة في هذا النطاق.");
      setTimeout(() => setSwapFeedback(null), 3000);
      return;
    }

    const replacement = candidates[Math.floor(Math.random() * candidates.length)];
    const updated = [...selectedQuestions];
    updated[indexToSwap] = replacement;
    setSelectedQuestions(updated);

    setSwapFeedback(`تم استبدال السؤال رقم ${indexToSwap + 1} بسؤال بديل بنجاح ✓`);
    setTimeout(() => setSwapFeedback(null), 3000);
  };

  // Move Question Up/Down
  const moveQuestion = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= selectedQuestions.length) return;
    const updated = [...selectedQuestions];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSelectedQuestions(updated);
  };

  // Remove question from deck
  const removeQuestion = (idx: number) => {
    setSelectedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Toggle question from manual bank picker
  const toggleBankQuestion = (q: PoolQuestion) => {
    const isSelected = selectedQuestions.some((item) => item.id === q.id);
    if (isSelected) {
      setSelectedQuestions((prev) => prev.filter((item) => item.id !== q.id));
    } else {
      setSelectedQuestions((prev) => [...prev, q]);
    }
  };

  // Unit and Lesson toggling in Step 2
  const handleToggleUnit = (unitId: string) => {
    const isChecked = selectedUnitIds.includes(unitId);
    const unit = availableUnits.find((u) => u.id === unitId);
    const unitLessonIds = unit?.lessons?.map((l) => l.id) || [];

    if (isChecked) {
      setSelectedUnitIds((prev) => prev.filter((id) => id !== unitId));
      setSelectedLessonIds((prev) => prev.filter((id) => !unitLessonIds.includes(id)));
    } else {
      setSelectedUnitIds((prev) => [...prev, unitId]);
      setSelectedLessonIds((prev) => Array.from(new Set([...prev, ...unitLessonIds])));
    }
  };

  const handleToggleLesson = (lessonId: string, unitId: string) => {
    const isChecked = selectedLessonIds.includes(lessonId);
    if (isChecked) {
      setSelectedLessonIds((prev) => prev.filter((id) => id !== lessonId));
    } else {
      setSelectedLessonIds((prev) => [...prev, lessonId]);
      if (!selectedUnitIds.includes(unitId)) {
        setSelectedUnitIds((prev) => [...prev, unitId]);
      }
    }
  };

  // Final Submission to API
  const handleCreateExam = async () => {
    if (!title.trim() || !subjectId) {
      setErrorMsg("يرجى كتابة عنوان الامتحان وتحديد المادة");
      return;
    }

    if (selectedQuestions.length === 0) {
      setErrorMsg("يجب أن يحتوي الامتحان على سؤال واحد على الأقل");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const isPublished = scheduleType !== "draft";
      const finalStartsAt = scheduleType === "scheduled" && startsAt ? new Date(startsAt).toISOString() : null;
      const finalEndsAt = scheduleType === "scheduled" && endsAt ? new Date(endsAt).toISOString() : null;

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        subjectId,
        durationMinutes: Number(durationMinutes),
        isPractice,
        questionIds: selectedQuestions.map((q) => q.id),
        unitIds: !isFullSubject ? selectedUnitIds : [],
        lessonIds: !isFullSubject ? selectedLessonIds : [],
        startsAt: finalStartsAt,
        endsAt: finalEndsAt,
        isPublished,
        scopeDetails: !isFullSubject
          ? {
              isFullSubject: false,
              unitIds: selectedUnitIds,
              lessonIds: selectedLessonIds,
            }
          : { isFullSubject: true },
      };

      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إنشاء الامتحان");
      }

      if (onExamCreated) {
        onExamCreated({
          ...data.exam,
          subject: activeSubject || { id: subjectId, name: "المادة" },
          questionsCount: selectedQuestions.length,
          attemptsCount: 0,
          avgPercentage: 0,
        });
      }

      if (isStandaloneRoute) {
        router.push("/admin/exams");
      } else if (onClose) {
        onClose();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ أثناء الإنشاء");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare preview data
  const previewData: PreviewExamData = {
    title: title || "امتحان بدون عنوان",
    description: description || null,
    subjectName: activeSubject?.name || "المادة",
    subjectColor: activeSubject?.color || "#800020",
    durationMinutes: Number(durationMinutes),
    isPractice,
    startsAt: scheduleType === "scheduled" && startsAt ? startsAt : null,
    endsAt: scheduleType === "scheduled" && endsAt ? endsAt : null,
    isPublished: scheduleType !== "draft",
    scopeSummary: {
      isFullSubject,
      unitTitles: availableUnits
        .filter((u) => selectedUnitIds.includes(u.id))
        .map((u) => u.title),
      lessonTitles: availableUnits
        .flatMap((u) => u.lessons || [])
        .filter((l) => selectedLessonIds.includes(l.id))
        .map((l) => l.title),
    },
    questions: selectedQuestions,
  };

  // Filtered bank questions for manual picker
  const filteredBankQuestions = useMemo(() => {
    return questionsPool.filter((q) => {
      if (bankTypeFilter !== "ALL" && q.type !== bankTypeFilter) return false;
      if (bankSearch.trim()) {
        const query = bankSearch.toLowerCase();
        const matchesStatement = q.statement.toLowerCase().includes(query);
        const matchesTranslation = q.translation?.toLowerCase().includes(query) || false;
        if (!matchesStatement && !matchesTranslation) return false;
      }
      return true;
    });
  }, [questionsPool, bankTypeFilter, bankSearch]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#0F172A] rounded-2xl p-5 sm:p-8 space-y-6 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155] font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          {isStandaloneRoute && (
            <button
              type="button"
              onClick={() => router.push("/admin/exams")}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer ml-1"
              title="العودة لقائمة الامتحانات"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <Award className="w-5 h-5 text-[#800020]" />
          <span>منظومة إعداد وجدولة الامتحانات الرسمية</span>
        </h3>
        {!isStandaloneRoute && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="grid grid-cols-4 gap-2 text-center text-[12px] sm:text-[13px] font-bold">
        {[
          { step: 1, title: "1. الإعداد والجدولة" },
          { step: 2, title: "2. نطاق الامتحان" },
          { step: 3, title: "3. بنك وتنسيق الأسئلة" },
          { step: 4, title: "4. المعاينة والمحاكاة" },
        ].map((item) => {
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => {
                if (item.step < currentStep || (item.step === 2 && title.trim()) || (item.step === 3 && title.trim())) {
                  setCurrentStep(item.step as any);
                }
              }}
              className={`py-2 px-2 rounded-xl transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-[#800020] text-white border-[#800020] shadow-xs"
                  : isDone
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155]"
              }`}
            >
              {isDone && <Check className="w-3.5 h-3.5" />}
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-[13px] font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ================= STEP 1: Basic Info & Scheduling ================= */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1">
              عنوان الامتحان *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: امتحان شامل شهر نوفمبر - تكنولوجيا المعلومات والاتصالات"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1">
              إرشادات وملاحظات للطلاب (اختياري)
            </label>
            <textarea
              rows={2}
              placeholder="تعليمات خاصة بمدة الاختبار، عدد المحاولات، وطريقة احتساب الدرجات..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium resize-none text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                المادة الدراسية *
              </label>
              <select
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                مدة الامتحان (بالدقائق) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                />
                <div className="flex gap-1 shrink-0">
                  {[15, 30, 45, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMinutes(m)}
                      className={`h-11 px-2.5 rounded-lg border text-[11px] font-bold font-mono cursor-pointer transition-colors ${
                        durationMinutes === m
                          ? "bg-[#800020] text-white border-[#800020]"
                          : "bg-white dark:bg-[#1E293B] text-[#64748B] border-[#E2E8F0] dark:border-[#334155]"
                      }`}
                    >
                      {m}د
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Exam Mode: Official vs Practice */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-2">
            <span className="block text-[13px] font-bold text-[#64748B]">نوع وضع الامتحان</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  !isPractice
                    ? "bg-white dark:bg-[#0F172A] border-[#800020] shadow-xs"
                    : "border-[#E2E8F0] dark:border-[#334155] opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="examMode"
                    checked={!isPractice}
                    onChange={() => setIsPractice(false)}
                    className="accent-[#800020] w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-[13px] text-[#0F172A] dark:text-white block">
                      امتحان رسمي بوقت محدد
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      إخفاء الإجابات والدرجات حتى إرسال الحل النهائي
                    </span>
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isPractice
                    ? "bg-white dark:bg-[#0F172A] border-[#800020] shadow-xs"
                    : "border-[#E2E8F0] dark:border-[#334155] opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="examMode"
                    checked={isPractice}
                    onChange={() => setIsPractice(true)}
                    className="accent-[#800020] w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-[13px] text-[#0F172A] dark:text-white block">
                      وضع تدريب (شرح وتفسير فوري)
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      إظهار تصحيح كل سؤال وتفسيره للتدريب الذاتي
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Scheduling & Release Control */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#800020]/5 to-transparent dark:from-[#800020]/15 border border-[#800020]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#800020]" />
                <span>إتاحة وجدولة ظهور الامتحان للطلاب</span>
              </span>
              <span className="text-[11px] font-medium text-[#64748B]">
                تحكّم في موعد النشر وبدء ونهاية الاختبار
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScheduleType("immediate")}
                className={`p-3 rounded-xl border text-[12px] font-bold transition-all text-center cursor-pointer ${
                  scheduleType === "immediate"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                }`}
              >
                نشر متاح فوراً للطلاب
              </button>

              <button
                type="button"
                onClick={() => setScheduleType("scheduled")}
                className={`p-3 rounded-xl border text-[12px] font-bold transition-all text-center cursor-pointer ${
                  scheduleType === "scheduled"
                    ? "bg-[#800020] text-white border-[#800020] shadow-xs"
                    : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                }`}
              >
                🗓️ جدولة بموعد محدد
              </button>

              <button
                type="button"
                onClick={() => setScheduleType("draft")}
                className={`p-3 rounded-xl border text-[12px] font-bold transition-all text-center cursor-pointer ${
                  scheduleType === "draft"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                }`}
              >
                حفظ كمسودة خاصة
              </button>
            </div>

            {scheduleType === "scheduled" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] mb-1">
                    موعد بدء الامتحان وإتاحته للطلاب *
                  </label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-mono font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                  />
                  <span className="text-[11px] text-[#94A3B8] mt-1 block">
                    يظهر للطلاب عدّاد تنازلي وشاشة انتظار قبل هذا الموعد
                  </span>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] mb-1">
                    موعد انتهاء وإغلاق الامتحان (اختياري)
                  </label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-mono font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                  />
                  <span className="text-[11px] text-[#94A3B8] mt-1 block">
                    يُغلق تلقائياً بعد هذا الموعد ولا يقبل إجابات جديدة
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!title.trim()) {
                  setErrorMsg("يرجى كتابة عنوان الامتحان قبل المتابعة");
                  return;
                }
                setErrorMsg(null);
                setCurrentStep(2);
              }}
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <span>التالي: تحديد نطاق الامتحان (الوحدات والدروس)</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: Scope (Units & Lessons) ================= */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
            <span className="block text-[13px] font-bold text-[#0F172A] dark:text-white">
              نطاق تغطية الامتحان لمادة ({activeSubject.name})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isFullSubject
                    ? "bg-white dark:bg-[#0F172A] border-[#800020] shadow-xs"
                    : "border-[#E2E8F0] dark:border-[#334155] opacity-70"
                }`}
              >
                <input
                  type="radio"
                  name="scopeChoice"
                  checked={isFullSubject}
                  onChange={() => {
                    setIsFullSubject(true);
                    setSelectedUnitIds([]);
                    setSelectedLessonIds([]);
                  }}
                  className="accent-[#800020] w-4 h-4"
                />
                <div>
                  <span className="font-bold text-[13px] text-[#0F172A] dark:text-white block">
                    امتحان شامل لكل وحدات ودروس المادة
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    سحب الأسئلة من كامل المحتوى المنهجي للمادة
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  !isFullSubject
                    ? "bg-white dark:bg-[#0F172A] border-[#800020] shadow-xs"
                    : "border-[#E2E8F0] dark:border-[#334155] opacity-70"
                }`}
              >
                <input
                  type="radio"
                  name="scopeChoice"
                  checked={!isFullSubject}
                  onChange={() => setIsFullSubject(false)}
                  className="accent-[#800020] w-4 h-4"
                />
                <div>
                  <span className="font-bold text-[13px] text-[#0F172A] dark:text-white block">
                    تحديد وحدات ودروس مخصصة
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    اختيار وحدات معينة أو دروس محددة للاختبار الدوري
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Unit & Lesson Tree Selector */}
          {!isFullSubject && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-bold text-[#64748B]">
                  حدد الوحدات والدروس المستهدفة:
                </span>
                <span className="text-[#800020] font-bold font-mono">
                  تم اختيار {selectedUnitIds.length} وحدة و {selectedLessonIds.length} درس
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {availableUnits.map((u) => {
                  const isUnitChecked = selectedUnitIds.includes(u.id);
                  const lessons = u.lessons || [];

                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-xl bg-white dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-[14px] text-[#0F172A] dark:text-white">
                          <input
                            type="checkbox"
                            checked={isUnitChecked}
                            onChange={() => handleToggleUnit(u.id)}
                            className="accent-[#800020] w-4 h-4 rounded"
                          />
                          <span>{u.title}</span>
                        </label>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] font-mono">
                          {lessons.length} دروس
                        </span>
                      </div>

                      {/* Lessons Grid */}
                      {lessons.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6 border-r-2 border-[#800020]/20">
                          {lessons.map((lesson) => {
                            const isLessonChecked = selectedLessonIds.includes(lesson.id);
                            return (
                              <label
                                key={lesson.id}
                                className={`p-2.5 rounded-lg border text-[12px] flex items-center gap-2 cursor-pointer transition-colors ${
                                  isLessonChecked
                                    ? "bg-[#800020]/5 border-[#800020]/40 text-[#800020] font-bold"
                                    : "bg-[#F8FAFC] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isLessonChecked}
                                  onChange={() => handleToggleLesson(lesson.id, u.id)}
                                  className="accent-[#800020] w-3.5 h-3.5 rounded"
                                />
                                <span className="line-clamp-1">{lesson.title}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="h-11 px-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
            >
              السابق: البيانات والجدولة
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isFullSubject && selectedUnitIds.length === 0 && selectedLessonIds.length === 0) {
                  setErrorMsg("يرجى اختيار وحدة أو درس واحد على الأقل أو اختر امتحان شامل للمادة");
                  return;
                }
                setErrorMsg(null);
                setCurrentStep(3);
                fetchQuestionsPool();
              }}
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <span>التالي: اختيار وتنسيق الأسئلة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: Zero-Confusion Question Assembler ================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Status & Feedback Banner */}
          {swapFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-[13px] font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{swapFeedback}</span>
            </div>
          )}

          {poolError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 text-[13px] font-bold">
              {poolError}
            </div>
          )}

          {/* Assembler Header Controls */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#800020]" />
                  <span>مولد الأسئلة الذكي والمتوازن</span>
                </h4>
                <p className="text-[12px] text-[#64748B] mt-0.5">
                  حدد عدد الأسئلة المطلوبة من كل نوع، وسيتم سحبها تلقائياً بدون أي تكرار
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] font-mono">
                  المتاح في النطاق: {questionsPool.length} سؤال
                </span>
                <button
                  type="button"
                  onClick={() => setShowManualPicker(!showManualPicker)}
                  className={`h-9 px-3 rounded-xl border text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showManualPicker
                      ? "bg-[#800020] text-white border-[#800020]"
                      : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white hover:border-[#800020]"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{showManualPicker ? "إغلاق بنك الأسئلة" : "البحث والإضافة اليدوية"}</span>
                </button>
              </div>
            </div>

            {/* Target Numbers Form */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                  اختيار من متعدد (MCQ)
                </label>
                <input
                  type="number"
                  min={0}
                  max={questionsPool.filter((q) => q.type === "MCQ").length}
                  value={mcqTargetCount}
                  onChange={(e) => setMcqTargetCount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold font-mono text-[#0F172A] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                  صح أو خطأ (True/False)
                </label>
                <input
                  type="number"
                  min={0}
                  max={questionsPool.filter((q) => q.type === "TRUE_FALSE").length}
                  value={tfTargetCount}
                  onChange={(e) => setTfTargetCount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold font-mono text-[#0F172A] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                  أسئلة مقالية (Essay)
                </label>
                <input
                  type="number"
                  min={0}
                  max={questionsPool.filter((q) => q.type === "ESSAY").length}
                  value={essayTargetCount}
                  onChange={(e) => setEssayTargetCount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold font-mono text-[#0F172A] dark:text-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSmartAssembly}
                  disabled={isLoadingPool || questionsPool.length === 0}
                  className="w-full h-10 px-4 rounded-xl bg-gradient-to-r from-[#800020] to-[#990026] hover:from-[#66001A] hover:to-[#800020] text-white text-[12px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>توليد الأسئلة المختارة</span>
                </button>
              </div>
            </div>
          </div>

          {/* Manual Picker Drawer */}
          {showManualPicker && (
            <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[13px] font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2">
                  <Search className="w-4 h-4 text-sky-600" />
                  <span>بنك الأسئلة المتاح للنطاق ({filteredBankQuestions.length} سؤال)</span>
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={bankTypeFilter}
                    onChange={(e) => setBankTypeFilter(e.target.value)}
                    className="h-9 px-2 rounded-lg border border-sky-200 bg-white dark:bg-[#0F172A] text-[12px] font-bold"
                  >
                    <option value="ALL">جميع الأنواع</option>
                    <option value="MCQ">اختيار من متعدد</option>
                    <option value="TRUE_FALSE">صح أو خطأ</option>
                    <option value="ESSAY">مقالي</option>
                  </select>

                  <input
                    type="text"
                    placeholder="بحث بنص السؤال..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-sky-200 bg-white dark:bg-[#0F172A] text-[12px] w-48"
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {filteredBankQuestions.length === 0 ? (
                  <p className="text-center text-[12px] text-[#94A3B8] py-4">
                    لا توجد أسئلة تطابق البحث داخل بنك النطاق الحالي
                  </p>
                ) : (
                  filteredBankQuestions.map((q) => {
                    const isAlreadyInDeck = selectedQuestions.some((item) => item.id === q.id);
                    return (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {q.type}
                            </span>
                            {q.lessonTitle && (
                              <span className="text-[11px] text-[#64748B] font-medium">
                                {q.lessonTitle}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] font-bold text-[#0F172A] dark:text-white line-clamp-2">
                            {q.statement}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleBankQuestion(q)}
                          className={`h-8 px-3 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer flex items-center gap-1 transition-colors ${
                            isAlreadyInDeck
                              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {isAlreadyInDeck ? (
                            <>
                              <span>حذف</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>إضافة</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Selected Question Deck Review */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-emerald-600" />
                <span>قائمة أسئلة الامتحان المختارة ({selectedQuestions.length} سؤال)</span>
              </h4>
              <span className="text-[12px] font-bold text-[#64748B]">
                إجمالي الدرجات:{" "}
                <span className="text-emerald-600 font-mono">
                  {selectedQuestions.reduce((s, q) => s + (q.rubric?.maxScore || 1), 0)} درجة
                </span>
              </span>
            </div>

            {isLoadingPool ? (
              <div className="p-8 text-center rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#64748B]">
                جارٍ تحميل بنك الأسئلة للنطاق المحدد...
              </div>
            ) : selectedQuestions.length === 0 ? (
              <div className="p-10 text-center rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-[#94A3B8]" />
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                  لم يتم اختيار أي أسئلة بعد
                </p>
                <p className="text-[12px] text-[#64748B]">
                  استخدم زر "توليد الأسئلة المختارة" بالأعلى أو اختر يدوياً من بنك الأسئلة
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedQuestions.map((q, idx) => {
                  return (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-xl bg-white dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155] space-y-3 hover:border-[#800020]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#800020] text-white text-[12px] font-bold flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B]">
                            {q.type === "MCQ" ? "اختيار من متعدد" : q.type === "TRUE_FALSE" ? "صح أو خطأ" : "مقالي"}
                          </span>
                          {q.lessonTitle && (
                            <span className="text-[11px] text-[#64748B] font-medium">
                              {q.lessonTitle}
                            </span>
                          )}
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            {q.rubric?.maxScore || 1} درجة
                          </span>
                        </div>

                        {/* Deck Control Actions */}
                        <div className="flex items-center gap-1.5">
                          {/* 1-Click Swap Button */}
                          <button
                            type="button"
                            onClick={() => handleSwapQuestion(idx)}
                            className="h-8 px-2.5 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-[11px] font-bold flex items-center gap-1 hover:bg-sky-100 cursor-pointer transition-colors"
                            title="استبدال بسؤال بديل من نفس الدرس"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>تبديل السؤال</span>
                          </button>

                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveQuestion(idx, "up")}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] disabled:opacity-30 cursor-pointer"
                            title="تحريك لأعلى"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === selectedQuestions.length - 1}
                            onClick={() => moveQuestion(idx, "down")}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] disabled:opacity-30 cursor-pointer"
                            title="تحريك لأسفل"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeQuestion(idx)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                            title="حذف من الامتحان"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="text-[13px] font-bold text-[#0F172A] dark:text-white leading-relaxed">
                        <BidiStatement text={q.statement} as="div" />
                      </div>

                      {/* Options preview with correct answer mark */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={opt.id || oIdx}
                              className={`p-2 rounded-lg border text-[12px] flex items-center justify-between ${
                                opt.isCorrect
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-bold"
                                  : "bg-[#F8FAFC] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                              }`}
                            >
                              <span>{opt.text}</span>
                              {opt.isCorrect && (
                                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                                  صحيحة ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="h-11 px-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
            >
              السابق: نطاق الامتحان
            </button>

            <button
              type="button"
              disabled={selectedQuestions.length === 0}
              onClick={() => {
                setErrorMsg(null);
                setCurrentStep(4);
              }}
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
            >
              <span>التالي: المعاينة النهائية والتجربة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: Premium Preview & Simulation ================= */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <ExamPreviewCard examData={previewData} />

          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="h-11 px-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
            >
              السابق: تعديل الأسئلة
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateExam}
                className="h-11 px-7 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ حفظ وجدولة الامتحان...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {scheduleType === "scheduled"
                        ? "تأكيد وجدولة الامتحان"
                        : scheduleType === "draft"
                        ? "حفظ كمسودة"
                        : "تأكيد ونشر الامتحان فوراً"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
