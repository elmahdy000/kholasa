"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Filter,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  ListChecks,
  PenTool,
  PlayCircle,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import type {
  LessonViewerProps,
  Question,
  QuestionAnswerState,
} from "../types";
import type {
  ArabicLessonStructuredData,
  ArabicSection,
  ArabicSectionProgressItem,
} from "./types";
import { formatSourceReferences } from "./types";
import {
  ARABIC_ORIGIN_LABELS,
  ARABIC_SKILL_LABELS,
  type ArabicQuestionMeta,
  type ArabicQuestionOriginEnum,
  type ArabicSkillCategory,
} from "@/lib/arabic-curriculum";
import { ArabicLessonHeader } from "./ArabicLessonHeader";
import { LessonFooterNav } from "../LessonFooterNav";
import { LessonMistakesCapsuleModal } from "../LessonMistakesCapsuleModal";
import { ArabicContentBlockRenderer } from "./ArabicContentBlockRenderer";
import { ArabicQuestionCard } from "./ArabicQuestionCard";
import { ArabicAssessmentHub } from "./ArabicAssessmentHub";
import { offlineStorage } from "@/lib/offline-db";
import { fetchWithRetry } from "@/lib/network";

interface ArabicLessonViewerProps extends LessonViewerProps {
  structured: ArabicLessonStructuredData;
  initialSectionProgress?: ArabicSectionProgressItem[];
  prevLesson?: { id: string; title: string; order: number } | null;
  nextLesson?: { id: string; title: string; order: number } | null;
  previewMode?: boolean;
}

const STAGE_META: Record<
  string,
  {
    icon: typeof BookOpen;
    color: string;
    activeBg: string;
    subtitle: string;
  }
> = {
  understand: {
    icon: BookOpen,
    color: "text-[#1E40AF]",
    activeBg: "bg-[#1E40AF] text-white border-[#1E40AF]",
    subtitle: "الفهم القرائي والأفكار",
  },
  skills: {
    icon: PenTool,
    color: "text-[#800B34]",
    activeBg: "bg-[#800B34] text-white border-[#800B34]",
    subtitle: "النحو والأساليب والكتابة",
  },
  practice: {
    icon: Sparkles,
    color: "text-[#091B40] dark:text-[#E9AD32]",
    activeBg: "bg-[#091B40] text-white border-[#091B40]",
    subtitle: "تدريب موجه بتركة الحل",
  },
  assessment: {
    icon: ClipboardCheck,
    color: "text-amber-700",
    activeBg: "bg-amber-600 text-white border-amber-600",
    subtitle: "اختبارات شاملة ومهارية",
  },
};

export function ArabicLessonViewer({
  lesson,
  structured,
  initialIsBookmarked,
  initialIsCompleted,
  initialMistakes = [],
  initialQuestionAttempts = [],
  initialSectionProgress = [],
  prevLesson = null,
  nextLesson = null,
  userId,
  previewMode = false,
}: ArabicLessonViewerProps) {
  const stages = useMemo(
    () =>
      structured.stages && structured.stages.length > 0
        ? [...structured.stages].sort((a, b) => a.order - b.order)
        : [
            {
              id: "understand",
              order: 1,
              title: "افهم الدرس",
              description: "النص وفكرته وأساليب تحليله",
            },
            {
              id: "skills",
              order: 2,
              title: "اتقن المهارات",
              description: "النحو واللغة والكتابة والاستماع",
            },
            {
              id: "practice",
              order: 3,
              title: "حل واتعلم",
              description: "أسئلة متدرجة مع شرح تركة الحل",
            },
            {
              id: "assessment",
              order: 4,
              title: "اختبر نفسك",
              description: "اختبار مرتبط بمهارات الدرس",
            },
          ],
    [structured.stages]
  );

  // Resume learning baseline from persisted StudentSectionProgress
  const resumeTarget = useMemo(() => {
    if (!initialSectionProgress || initialSectionProgress.length === 0) return null;
    const latest = initialSectionProgress[0];
    const sec = structured.sections.find((s) => s.id === latest.sectionAnchorId);
    if (!sec) return null;
    return {
      sectionId: sec.id,
      stageId: sec.stageId,
      title: sec.title,
    };
  }, [initialSectionProgress, structured.sections]);

  const [completedSections, setCompletedSections] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const item of initialSectionProgress || []) {
      if (item.isCompleted) s.add(item.sectionAnchorId);
    }
    return s;
  });

  const [writingDraftState, setWritingDraftState] = useState<{
    drafts?: Record<string, string>;
    checklist?: Record<string, boolean>;
  }>(() => {
    const writingItem = (initialSectionProgress || []).find(
      (p) => p.sectionAnchorId === "u1-l1-s15" && p.state
    );
    return (writingItem?.state as {
      drafts?: Record<string, string>;
      checklist?: Record<string, boolean>;
    }) || {};
  });

  const [activeStageId, setActiveStageId] = useState<string>(
    stages[0]?.id || "understand"
  );
  const [sectionIndexByStage, setSectionIndexByStage] = useState<Record<string, number>>({});
  const [showMobileSectionDrawer, setShowMobileSectionDrawer] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(Boolean(resumeTarget));
  const [showQuickReference, setShowQuickReference] = useState(false);

  // Practice stage filters
  const [practiceSkillFilter, setPracticeSkillFilter] = useState<string>("ALL");
  const [practiceTypeFilter, setPracticeTypeFilter] = useState<string>("ALL");
  const [practiceOriginFilter, setPracticeOriginFilter] = useState<string>("ALL");
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);

  // Header & Progress states
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const [bookmarkNotice, setBookmarkNotice] = useState<string | null>(null);

  const [mistakes, setMistakes] = useState(initialMistakes);
  const [isMistakesCapsuleOpen, setIsMistakesCapsuleOpen] = useState(false);
  const [zoomedAssetUrl, setZoomedAssetUrl] = useState<string | null>(null);

  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [isSavingOffline, setIsSavingOffline] = useState(false);
  const [offlineToast, setOfflineToast] = useState<string | null>(null);

  // Question states hydrated cleanly from Student's prior attempts (zero pre-submission leak)
  const [answerStates, setAnswerStates] = useState<Record<string, QuestionAnswerState>>(() => {
    const init: Record<string, QuestionAnswerState> = {};
    for (const att of initialQuestionAttempts) {
      if (att.selectedOptionId) {
        init[att.questionId] = {
          selectedOptionId: att.selectedOptionId,
          revealed: true,
          isCorrect: att.isCorrect,
        };
      }
    }
    return init;
  });

  const [essayDrafts, setEssayDrafts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const att of initialQuestionAttempts) {
      if (att.essayText) init[att.questionId] = att.essayText;
    }
    return init;
  });

  const [essayRevealed, setEssayRevealed] = useState<Record<string, boolean>>({});
  const stageTopRef = useRef<HTMLDivElement>(null);

  // Check offline cache presence
  useEffect(() => {
    let active = true;
    if (previewMode) return;
    offlineStorage
      .hasLesson(lesson.id)
      .then((found) => {
        if (active) setIsSavedOffline(found);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lesson.id, userId, previewMode]);

  // All lesson questions keyed by BOTH DB ID and externalKey (L1Q...)
  const allDbQuestions = useMemo(
    () => lesson.questions.map((ql) => ql.question),
    [lesson.questions]
  );

  const questionsMap = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of allDbQuestions) {
      map.set(q.id, q);
      if (q.externalKey) map.set(q.externalKey, q);
    }
    return map;
  }, [allDbQuestions]);

  // Group sections by stage
  const sectionsByStage = useMemo(() => {
    const grouped: Record<string, ArabicSection[]> = {};
    for (const stage of stages) grouped[stage.id] = [];

    const ordered = [...(structured.sections || [])].sort((a, b) => a.order - b.order);
    for (const sec of ordered) {
      if (!grouped[sec.stageId]) grouped[sec.stageId] = [];
      grouped[sec.stageId].push(sec);
    }
    return grouped;
  }, [stages, structured.sections]);

  const currentStageSections = sectionsByStage[activeStageId] || [];
  const currentSecIdx = Math.min(
    sectionIndexByStage[activeStageId] || 0,
    Math.max(0, currentStageSections.length - 1)
  );
  const currentSection = currentStageSections[currentSecIdx] || null;

  const sectionVisualAssets = useMemo(() => {
    if (!currentSection || !Array.isArray(structured.visualAssets)) return [];
    return structured.visualAssets
      .filter((a) => a.sectionId === currentSection.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [currentSection, structured.visualAssets]);

  // Persist section visit / completion to DB without duplicating Progress tables
  const persistSectionProgress = useCallback(
    async (
      sectionAnchorId: string,
      stageId: string,
      opts?: { isCompleted?: boolean; state?: Record<string, unknown> }
    ) => {
      if (previewMode) return;
      try {
        const res = await fetchWithRetry(`/api/lessons/${lesson.id}/arabic-progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionAnchorId,
            stageId,
            ...(opts?.isCompleted !== undefined ? { isCompleted: opts.isCompleted } : {}),
            ...(opts?.state !== undefined ? { state: opts.state } : {}),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.isLessonCompleted) setIsCompleted(true);
        }
      } catch {
        // Non-blocking background sync
      }
    },
    [lesson.id, previewMode]
  );

  const navigateToSection = useCallback(
    (stageId: string, sectionIdx: number, markPrevCompleted = false) => {
      if (markPrevCompleted && currentSection) {
        setCompletedSections((prev) => {
          const next = new Set(prev);
          next.add(currentSection.id);
          return next;
        });
        void persistSectionProgress(currentSection.id, currentSection.stageId, {
          isCompleted: true,
        });
      }

      setActiveStageId(stageId);
      setSectionIndexByStage((prev) => ({ ...prev, [stageId]: sectionIdx }));
      setShowMobileSectionDrawer(false);

      const targetSec = (sectionsByStage[stageId] || [])[sectionIdx];
      if (targetSec) {
        void persistSectionProgress(targetSec.id, targetSec.stageId);
      }

      stageTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [currentSection, persistSectionProgress, sectionsByStage]
  );

  const handleResumeLearning = () => {
    if (!resumeTarget) return;
    const list = sectionsByStage[resumeTarget.stageId] || [];
    const idx = list.findIndex((s) => s.id === resumeTarget.sectionId);
    navigateToSection(resumeTarget.stageId, idx >= 0 ? idx : 0);
    setShowResumeBanner(false);
  };

  // Answer handlers
  const handleSelectOption = async (questionId: string, optionId: string) => {
    if (previewMode) {
      // In Admin Preview Mode show local non-persistent feedback if available
      const q = questionsMap.get(questionId);
      const opt = q?.options.find((o) => o.id === optionId);
      setAnswerStates((prev) => ({
        ...prev,
        [questionId]: {
          selectedOptionId: optionId,
          revealed: true,
          isCorrect: Boolean(opt?.isCorrect),
          reveal: {
            isCorrect: Boolean(opt?.isCorrect),
            explanation: q?.explanation || null,
            options: q?.options.map((o) => ({ id: o.id, isCorrect: o.isCorrect })),
          },
        },
      }));
      return;
    }

    setAnswerStates((prev) => ({
      ...prev,
      [questionId]: {
        selectedOptionId: optionId,
        revealed: false,
        isCorrect: false,
        isLoading: true,
      },
    }));

    try {
      const res = await fetchWithRetry(`/api/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: optionId }),
      });
      const data = await res.json();
      setAnswerStates((prev) => ({
        ...prev,
        [questionId]: {
          selectedOptionId: optionId,
          revealed: true,
          isCorrect: Boolean(data.isCorrect),
          reveal: data,
        },
      }));
    } catch {
      setAnswerStates((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleRevealEssay = async (questionId: string, draftText?: string) => {
    if (previewMode) {
      setEssayRevealed((p) => ({ ...p, [questionId]: true }));
      return;
    }
    try {
      const res = await fetchWithRetry(`/api/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essayText: draftText || "" }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnswerStates((prev) => ({
          ...prev,
          [questionId]: {
            selectedOptionId: "",
            revealed: true,
            isCorrect: true,
            reveal: data,
          },
        }));
      }
    } finally {
      setEssayRevealed((p) => ({ ...p, [questionId]: true }));
    }
  };

  const handleToggleEssayReview = async (
    questionId: string,
    mark: boolean,
    essayText?: string
  ) => {
    if (previewMode) return;
    const res = await fetchWithRetry(`/api/questions/${questionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mark ? { markForReview: true, essayText: essayText || "" } : { resolve: true }
      ),
    });
    if (res.ok) {
      const targetQ = questionsMap.get(questionId);
      if (mark && targetQ) {
        setMistakes((prev) =>
          prev.some((m) => m.questionId === questionId)
            ? prev
            : [...prev, { id: `m_${questionId}`, questionId, wrongCount: 1, question: targetQ }]
        );
      } else {
        setMistakes((prev) => prev.filter((m) => m.questionId !== questionId));
      }
    }
  };

  const toggleBookmark = async () => {
    if (previewMode || isTogglingBookmark) return;
    setIsTogglingBookmark(true);
    try {
      const res = await fetchWithRetry("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      if (res.ok) {
        const next = !isBookmarked;
        setIsBookmarked(next);
        setBookmarkNotice(next ? "تم حفظ الدرس في مفضلتك" : "تمت إزالة الدرس من المفضلة");
        setTimeout(() => setBookmarkNotice(null), 2500);
      }
    } finally {
      setIsTogglingBookmark(false);
    }
  };

  const toggleComplete = async () => {
    if (previewMode || isTogglingComplete) return;
    setIsTogglingComplete(true);
    try {
      const next = !isCompleted;
      const res = await fetchWithRetry(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCompleted: next,
          progressPercent: next ? 100 : 50,
        }),
      });
      if (res.ok) setIsCompleted(next);
    } finally {
      setIsTogglingComplete(false);
    }
  };

  const handleToggleOffline = async () => {
    if (previewMode || isSavingOffline) return;
    setIsSavingOffline(true);
    try {
      if (isSavedOffline) {
        await offlineStorage.deleteLesson(lesson.id);
        setIsSavedOffline(false);
        setOfflineToast("تمت إزالة النسخة الأوفلاين");
      } else {
        const res = await fetchWithRetry(`/api/lessons/${lesson.id}/offline`);
        if (res.ok) {
          const pkg = await res.json();
          await offlineStorage.saveLesson(pkg);
          setIsSavedOffline(true);
          setOfflineToast("تم حفظ الدرس للمذاكرة أوفلاين ✓");
        }
      }
      setTimeout(() => setOfflineToast(null), 3000);
    } finally {
      setIsSavingOffline(false);
    }
  };

  // Practice filtering
  const markedForReviewIds = useMemo(
    () => new Set(mistakes.map((m) => m.questionId)),
    [mistakes]
  );

  const getMeta = useCallback(
    (q: Question): ArabicQuestionMeta | undefined =>
      (q.externalKey ? structured.questionMetaByJsonId?.[q.externalKey] : undefined) ||
      structured.questionMetaByJsonId?.[q.id],
    [structured.questionMetaByJsonId]
  );

  const practiceSkills = useMemo(() => {
    const map = new Map<ArabicSkillCategory, number>();
    for (const q of allDbQuestions) {
      const sk = (q.skillCategory || getMeta(q)?.skillCategory || "general") as ArabicSkillCategory;
      map.set(sk, (map.get(sk) || 0) + 1);
    }
    return Array.from(map.entries());
  }, [allDbQuestions, getMeta]);

  const filteredPracticeQuestions = useMemo(() => {
    return allDbQuestions.filter((q) => {
      const m = getMeta(q);
      const sk = String(q.skillCategory || m?.skillCategory || "general");
      const originGroup = String(q.origin || m?.originEnum || "KHOLASA_ORIGINAL");

      if (practiceSkillFilter !== "ALL" && sk !== practiceSkillFilter) return false;
      if (practiceTypeFilter !== "ALL" && q.type !== practiceTypeFilter) return false;
      if (practiceOriginFilter === "OFFICIAL" && !originGroup.startsWith("OFFICIAL_")) return false;
      if (practiceOriginFilter === "KHOLASA" && originGroup !== "KHOLASA_ORIGINAL") return false;
      return true;
    });
  }, [
    allDbQuestions,
    practiceSkillFilter,
    practiceTypeFilter,
    practiceOriginFilter,
    getMeta,
  ]);

  const jumpToPracticeQuestion = (jsonQuestionId: string) => {
    const q = questionsMap.get(jsonQuestionId);
    setActiveStageId("practice");
    setPracticeSkillFilter("ALL");
    setPracticeTypeFilter("ALL");
    setPracticeOriginFilter("ALL");
    if (q) {
      setFocusedQuestionId(q.id);
      setTimeout(() => {
        document.getElementById(`arabic-q-${q.id}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);
    }
  };

  const totalCurriculumSections = Math.max(1, structured.sections.length);
  const completedCount = completedSections.size;
  const lessonSectionPercent = Math.min(
    100,
    Math.round((completedCount / totalCurriculumSections) * 100)
  );

  return (
    <div dir="rtl" className="space-y-5 text-right font-sans pb-24 overflow-x-hidden">
      {!previewMode && (
        <ArabicLessonHeader
          subject={lesson.unit.subject}
          unit={lesson.unit}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          durationMinutes={lesson.durationMinutes}
          questionsCount={allDbQuestions.length}
          isBookmarked={isBookmarked}
          isCompleted={isCompleted}
          isTogglingBookmark={isTogglingBookmark}
          isTogglingComplete={isTogglingComplete}
          bookmarkNotice={offlineToast || bookmarkNotice}
          unresolvedMistakesCount={mistakes.length}
          isSavedOffline={isSavedOffline}
          isSavingOffline={isSavingOffline}
          onToggleBookmark={toggleBookmark}
          onToggleComplete={toggleComplete}
          onToggleOffline={handleToggleOffline}
          onOpenMistakesCapsule={() => setIsMistakesCapsuleOpen(true)}
        />
      )}

      {/* Academic Identity & Progress Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200">
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span>مادة اللغة العربية (تحت الإنشاء — محتوى الدرس الأول مفعّل)</span>
            </span>
            {structured.education?.lesson?.textClassification && (
              <span className="px-2.5 py-1 rounded-full bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] text-[#091B40] dark:text-white">
                {structured.education.lesson.textClassification}
              </span>
            )}
            {structured.education?.lesson?.predominantDiscourse && (
              <span className="px-2.5 py-1 rounded-full bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] text-[#800B34] dark:text-[#E9AD32]">
                خطاب {structured.education.lesson.predominantDiscourse}
              </span>
            )}
          </div>

          {structured.studentQuickReference && (
            <button
              type="button"
              onClick={() => setShowQuickReference((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-[#091B40] text-white text-xs font-extrabold inline-flex items-center gap-1.5 self-start sm:self-auto min-h-[36px]"
            >
              <ListChecks className="w-3.5 h-3.5 text-[#E9AD32]" />
              <span>{showQuickReference ? "إخفاء الملخص السريع" : "القواعد الـ 5 الحاسمة"}</span>
            </button>
          )}
        </div>

        {/* Section Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-black text-[#475569] dark:text-[#CBD5E1]">
            <span>
              تقدّمك في أقسام الدرس: {completedCount} من {totalCurriculumSections} قسم
            </span>
            <span className="tabular-nums text-[#800B34] dark:text-[#E9AD32]">
              {lessonSectionPercent}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#E2E8F0] dark:bg-[#132C60] overflow-hidden">
            <div
              className="h-full bg-[#800B34] dark:bg-[#E9AD32] rounded-full transition-all duration-300"
              style={{ width: `${lessonSectionPercent}%` }}
            />
          </div>
        </div>

        {structured.sources && structured.sources.length > 0 && (
          <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
            المصادر المعتمدة: {structured.sources.map((s) => s.fileName).join(" • ")}
          </p>
        )}
      </div>

      {/* Quick Reference Drawer (Collapsible) */}
      {showQuickReference && structured.studentQuickReference && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/60 space-y-3">
          <p className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
            الخلاصة السريعة — قواعد الفهم والتحليل قبل الحل:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(structured.studentQuickReference.fiveRules || []).map((rule, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white dark:bg-[#0D214D] border border-amber-200 dark:border-amber-900/40 text-xs font-bold text-[#091B40] dark:text-white leading-relaxed"
              >
                {idx + 1}. {rule}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resume Learning Banner */}
      {showResumeBanner && resumeTarget && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#EFF6FF] dark:bg-[#0D214D] border border-[#BFDBFE] dark:border-[#1E3A6E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#1E40AF] dark:text-[#93C5FD]">
            <PlayCircle className="w-5 h-5 shrink-0" />
            <span>
              توقفت آخر مرة عند: <strong className="font-black">«{resumeTarget.title}»</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResumeLearning}
              className="px-3.5 py-2 rounded-xl bg-[#1E40AF] text-white text-xs font-extrabold min-h-[38px]"
            >
              استكمل من حيث توقفت
            </button>
            <button
              type="button"
              onClick={() => setShowResumeBanner(false)}
              aria-label="إغلاق"
              className="p-2 rounded-xl text-[#64748B] hover:text-[#091B40]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {lesson.content?.audioUrl && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E]">
          <audio controls src={lesson.content.audioUrl} className="w-full" />
        </div>
      )}

      {/* 4 LEARNING STAGE CARDS */}
      <div ref={stageTopRef} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {stages.map((stage) => {
          const meta = STAGE_META[stage.id] || STAGE_META.understand;
          const Icon = meta.icon;
          const isActive = activeStageId === stage.id;
          const countLabel =
            stage.id === "practice"
              ? `${allDbQuestions.length} سؤال`
              : stage.id === "assessment"
                ? `${structured.finalAssessment?.questionIds?.length || 21} سؤال + أنماط`
                : `${(sectionsByStage[stage.id] || []).length} أقسام`;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => {
                setActiveStageId(stage.id);
                setShowMobileSectionDrawer(false);
              }}
              className={`text-right p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2 min-h-[96px] ${
                isActive
                  ? meta.activeBg
                  : "bg-white dark:bg-[#0D214D] border-[#E2E8F0] dark:border-[#1E3A6E] text-[#091B40] dark:text-white hover:border-[#800B34]/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : meta.color}`}
                />
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#F1F5F9] dark:bg-[#132C60] text-[#475569] dark:text-[#CBD5E1]"
                  }`}
                >
                  {countLabel}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-black break-words">{stage.title}</p>
                <p
                  className={`text-[11px] mt-0.5 break-words ${
                    isActive ? "text-white/85" : "text-[#64748B] dark:text-[#94A3B8]"
                  }`}
                >
                  {stage.description || meta.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* STAGE 1 & STAGE 2: Sequential Section Reader (NEVER shows all sections at once) */}
      {(activeStageId === "understand" || activeStageId === "skills") &&
        currentSection && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Desktop Topic Sidebar (Hidden on < lg so mobile stays clean!) */}
            <aside className="hidden lg:block lg:col-span-4 p-4 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2 sticky top-4">
              <p className="text-xs font-black text-[#091B40] dark:text-white pb-2 border-b border-[#E2E8F0] dark:border-[#1E3A6E] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32]" />
                <span>أقسام هذه المرحلة ({currentStageSections.length})</span>
              </p>
              <div className="space-y-1.5 max-h-[65vh] overflow-y-auto pl-1">
                {currentStageSections.map((sec, sIdx) => {
                  const isCurrent = sIdx === currentSecIdx;
                  const isDone = completedSections.has(sec.id);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => navigateToSection(activeStageId, sIdx)}
                      className={`w-full text-right p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between gap-2 ${
                        isCurrent
                          ? "bg-[#091B40] text-white"
                          : "bg-[#F8FAFC] dark:bg-[#081633] text-[#091B40] dark:text-white hover:bg-[#EFF6FF] dark:hover:bg-[#132C60]"
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 tabular-nums ${
                            isCurrent
                              ? "bg-[#E9AD32] text-[#091B40]"
                              : isDone
                                ? "bg-emerald-600 text-white"
                                : "bg-[#E2E8F0] dark:bg-[#1E3A6E] text-[#475569] dark:text-white"
                          }`}
                        >
                          {isDone ? "✓" : sIdx + 1}
                        </span>
                        <span className="truncate">{sec.title}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Active Section Content Canvas */}
            <div className="lg:col-span-8 space-y-4 min-w-0">
              {/* Mobile Topic Index Toggle */}
              <div className="lg:hidden flex items-center justify-between gap-2 p-3 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E]">
                <span className="text-xs font-black text-[#091B40] dark:text-white tabular-nums">
                  القسم {currentSecIdx + 1} من {currentStageSections.length}
                </span>
                <button
                  type="button"
                  onClick={() => setShowMobileSectionDrawer((v) => !v)}
                  className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#132C60] text-xs font-extrabold text-[#091B40] dark:text-white flex items-center gap-1.5 min-h-[38px]"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showMobileSectionDrawer ? "إغلاق الفهرس" : "تبديل القسم"}</span>
                </button>
              </div>

              {showMobileSectionDrawer && (
                <div className="lg:hidden p-3 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-1.5">
                  {currentStageSections.map((sec, sIdx) => {
                    const isCurrent = sIdx === currentSecIdx;
                    const isDone = completedSections.has(sec.id);
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => navigateToSection(activeStageId, sIdx)}
                        className={`w-full text-right p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 min-h-[42px] ${
                          isCurrent
                            ? "bg-[#091B40] text-white"
                            : "bg-[#F8FAFC] dark:bg-[#081633] text-[#091B40] dark:text-white"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 tabular-nums ${
                            isDone ? "bg-emerald-600 text-white" : "bg-[#E2E8F0] text-[#091B40]"
                          }`}
                        >
                          {isDone ? "✓" : sIdx + 1}
                        </span>
                        <span className="break-words">{sec.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Section Header Card */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-extrabold text-[#800B34] dark:text-[#E9AD32]">
                      {ARABIC_SKILL_LABELS[currentSection.skillCategory]}
                    </span>
                    <h2 className="text-base sm:text-xl font-black text-[#091B40] dark:text-white break-words leading-snug">
                      {currentSection.title}
                    </h2>
                  </div>
                  {formatSourceReferences(currentSection.sourceReferences, structured.sources) && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F1F5F9] dark:bg-[#132C60] text-[#475569] dark:text-[#CBD5E1] shrink-0">
                      {formatSourceReferences(currentSection.sourceReferences, structured.sources)}
                    </span>
                  )}
                </div>
                {currentSection.summary && (
                  <p className="text-xs sm:text-sm font-medium text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                    {currentSection.summary}
                  </p>
                )}
              </div>

              {/* Section-linked Visual Mind Map Assets (Admin uploaded or honest metadata note) */}
              {sectionVisualAssets.length > 0 && (
                <div className="space-y-2.5">
                  {sectionVisualAssets.map((asset) =>
                    asset.imageUrl ? (
                      <div
                        key={asset.assetKey}
                        className="p-3.5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-black text-[#800B34] dark:text-[#E9AD32]">
                          <span className="inline-flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 shrink-0" />
                            <span>{asset.title}</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E]">
                            {asset.assetKey}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setZoomedAssetUrl(asset.imageUrl!)}
                          className="block w-full rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E3A6E] bg-white cursor-zoom-in"
                        >
                          <img
                            src={asset.imageUrl}
                            alt={asset.title}
                            className="w-full max-h-[380px] object-contain mx-auto"
                          />
                        </button>
                        {asset.caption && (
                          <p className="text-[11px] font-medium text-[#475569] dark:text-[#CBD5E1]">
                            {asset.caption}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div
                        key={asset.assetKey}
                        className="p-3 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-dashed border-amber-300 dark:border-amber-800/60 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                          <ImageIcon className="w-4 h-4 text-[#800B34] shrink-0" />
                          <span>
                            <strong className="font-black">{asset.title}</strong>
                            {asset.caption ? ` — ${asset.caption}` : ""}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                          خريطة مرجعية ({asset.assetKey})
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Render All Content Blocks in Order */}
              <div className="space-y-3.5">
                {currentSection.blocks.map((block) => (
                  <ArabicContentBlockRenderer
                    key={block.id}
                    block={block}
                    sources={structured.sources}
                    writingModels={structured.writingModels}
                    questionsMap={questionsMap}
                    questionMetaByJsonId={structured.questionMetaByJsonId}
                    sectionSolvingTip={currentSection.examSolvingMethod?.[0]}
                    answerStates={answerStates}
                    essayDrafts={essayDrafts}
                    essayRevealed={essayRevealed}
                    markedForReviewIds={markedForReviewIds}
                    writingDraftState={writingDraftState}
                    onPracticeQuestionClick={jumpToPracticeQuestion}
                    onSelectOption={handleSelectOption}
                    onChangeEssayDraft={(qId, val) =>
                      setEssayDrafts((p) => ({ ...p, [qId]: val }))
                    }
                    onRevealEssay={handleRevealEssay}
                    onToggleEssayReview={handleToggleEssayReview}
                    onSaveWritingDraftState={async (drafts, checklist) => {
                      setWritingDraftState({ drafts, checklist });
                      await persistSectionProgress(currentSection.id, currentSection.stageId, {
                        isCompleted: true,
                        state: { drafts, checklist },
                      });
                    }}
                  />
                ))}
              </div>

              {/* Previous / Next Navigation + Section Completion */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  disabled={currentSecIdx === 0}
                  onClick={() => navigateToSection(activeStageId, Math.max(0, currentSecIdx - 1))}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-extrabold text-[#091B40] dark:text-white disabled:opacity-40 flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>القسم السابق</span>
                </button>

                {currentSecIdx < currentStageSections.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigateToSection(activeStageId, currentSecIdx + 1, true)
                    }
                    className="px-5 py-2.5 rounded-xl bg-[#091B40] hover:bg-[#132C60] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#E9AD32]" />
                    <span>إتمام القسم والانتقال للتالي</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const nextStage =
                        activeStageId === "understand" ? "skills" : "practice";
                      if (currentSection) {
                        setCompletedSections((p) => new Set(p).add(currentSection.id));
                        void persistSectionProgress(currentSection.id, currentSection.stageId, {
                          isCompleted: true,
                        });
                      }
                      setActiveStageId(nextStage);
                      stageTopRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <span>
                      {activeStageId === "understand"
                        ? "أتممت الفهم ← انتقل إلى إتقان المهارات"
                        : "أتممت المهارات ← انتقل إلى حل واتعلم"}
                    </span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      {/* STAGE 3: Organized Practice Workspace */}
      {activeStageId === "practice" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-[#091B40] dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>تدريبات الدرس المنظمة حسب المهارات ({filteredPracticeQuestions.length} سؤال)</span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B]">
                <Filter className="w-3.5 h-3.5" />
                <span>صفّي الأسئلة حسب المهارة أو النوع</span>
              </div>
            </div>

            {/* Skill Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPracticeSkillFilter("ALL")}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold min-h-[36px] ${
                  practiceSkillFilter === "ALL"
                    ? "bg-[#091B40] text-white"
                    : "bg-[#F1F5F9] dark:bg-[#132C60] text-[#091B40] dark:text-white"
                }`}
              >
                كل المهارات ({allDbQuestions.length})
              </button>
              {practiceSkills.map(([sk, count]) => (
                <button
                  key={sk}
                  type="button"
                  onClick={() => setPracticeSkillFilter(sk)}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold min-h-[36px] ${
                    practiceSkillFilter === sk
                      ? "bg-[#800B34] text-white"
                      : "bg-[#F1F5F9] dark:bg-[#132C60] text-[#091B40] dark:text-white"
                  }`}
                >
                  {ARABIC_SKILL_LABELS[sk] || sk} ({count})
                </button>
              ))}
            </div>

            {/* Type & Provenance Selectors */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { key: "ALL", label: "كل الأنواع" },
                { key: "MCQ", label: "اختيار من متعدد" },
                { key: "TRUE_FALSE", label: "صواب وخطأ" },
                { key: "ESSAY", label: "أسئلة مقالية" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setPracticeTypeFilter(t.key)}
                  className={`px-3 py-1 rounded-xl border text-[11px] font-bold min-h-[34px] ${
                    practiceTypeFilter === t.key
                      ? "border-[#1E40AF] bg-[#EFF6FF] text-[#1E40AF]"
                      : "border-[#E2E8F0] dark:border-[#1E3A6E] text-[#64748B]"
                  }`}
                >
                  {t.label}
                </button>
              ))}

              <span className="border-r border-[#E2E8F0] dark:border-[#1E3A6E] mx-1 hidden sm:inline" />

              {[
                { key: "ALL", label: "كل المصادر" },
                { key: "OFFICIAL", label: "مصادر رسمية (كتاب/تقييمات)" },
                { key: "KHOLASA", label: "تدريبات الخلاصة" },
              ].map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setPracticeOriginFilter(o.key)}
                  className={`px-3 py-1 rounded-xl border text-[11px] font-bold min-h-[34px] ${
                    practiceOriginFilter === o.key
                      ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                      : "border-[#E2E8F0] dark:border-[#1E3A6E] text-[#64748B]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredPracticeQuestions.map((q, idx) => {
              const meta = getMeta(q);
              const matchedSec = meta?.sectionId
                ? structured.sections.find((s) => s.id === meta.sectionId)
                : undefined;
              return (
                <div
                  key={q.id}
                  className={
                    focusedQuestionId === q.id
                      ? "ring-2 ring-[#800B34] rounded-2xl"
                      : undefined
                  }
                >
                  <ArabicQuestionCard
                    index={idx}
                    question={q}
                    answerState={answerStates[q.id]}
                    essayDraft={essayDrafts[q.id] || ""}
                    isEssayRevealed={Boolean(essayRevealed[q.id])}
                    isMarkedForReview={markedForReviewIds.has(q.id)}
                    sectionSolvingTip={matchedSec?.examSolvingMethod?.[0]}
                    meta={{
                      ...meta,
                      originEnum: (q.origin || meta?.originEnum) as ArabicQuestionOriginEnum | undefined,
                      skillCategory: (q.skillCategory || meta?.skillCategory) as ArabicSkillCategory | undefined,
                      sourceReferences: q.sourceReferences || meta?.sourceReferences,
                    }}
                    onSelectOption={handleSelectOption}
                    onChangeEssayDraft={(qId, val) =>
                      setEssayDrafts((p) => ({ ...p, [qId]: val }))
                    }
                    onRevealEssay={handleRevealEssay}
                    onToggleEssayReview={handleToggleEssayReview}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE 4: Assessment Hub & Checklist */}
      {activeStageId === "assessment" && (
        <div className="space-y-5">
          <ArabicAssessmentHub
            lessonTitle={lesson.title}
            allQuestions={allDbQuestions}
            questionsMap={questionsMap}
            questionMetaByJsonId={structured.questionMetaByJsonId || {}}
            finalAssessment={structured.finalAssessment}
            weeklyCoverage={structured.officialWeeklyAssessmentCoverage}
            mistakes={mistakes}
            answerStates={answerStates}
            essayDrafts={essayDrafts}
            essayRevealed={essayRevealed}
            markedForReviewIds={markedForReviewIds}
            onSelectOption={handleSelectOption}
            onChangeEssayDraft={(qId, val) =>
              setEssayDrafts((p) => ({ ...p, [qId]: val }))
            }
            onRevealEssay={handleRevealEssay}
            onToggleEssayReview={handleToggleEssayReview}
          />

          {(sectionsByStage.assessment || []).map((sec) => (
            <div key={sec.id} className="space-y-3">
              {sec.blocks.map((block) => (
                <ArabicContentBlockRenderer
                  key={block.id}
                  block={block}
                  sources={structured.sources}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Honest Source Limits Transparency Strip */}
      {structured.sourceLimits && structured.sourceLimits.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          <div className="space-y-0.5 leading-relaxed">
            {structured.sourceLimits.map((lim, idx) => (
              <p key={idx}>
                <strong className="font-black">{lim.topic}:</strong> {lim.fact}
              </p>
            ))}
          </div>
        </div>
      )}

      {!previewMode && (
        <>
          <LessonFooterNav
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            subjectId={lesson.unit.subject.id}
            unresolvedMistakesCount={mistakes.length}
            onOpenMistakesCapsule={() => setIsMistakesCapsuleOpen(true)}
          />

          <LessonMistakesCapsuleModal
            lessonTitle={lesson.title}
            unitTitle={lesson.unit.title}
            isOpen={isMistakesCapsuleOpen}
            onClose={() => setIsMistakesCapsuleOpen(false)}
            mistakes={mistakes}
            onMistakeResolved={(qId: string) =>
              setMistakes((prev) => prev.filter((m) => m.questionId !== qId))
            }
          />
        </>
      )}

      {zoomedAssetUrl && (
        <div
          className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoomedAssetUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedAssetUrl(null)}
              aria-label="إغلاق"
              className="absolute top-3 left-3 p-2 rounded-full bg-black/70 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={zoomedAssetUrl}
              alt="خريطة ذهنية"
              className="w-full max-h-[84vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
