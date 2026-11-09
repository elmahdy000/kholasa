"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { BookOpen, Graph, BookmarkSimple, CheckCircle, Sparkle, ArrowLeft, X } from "@phosphor-icons/react";
import {
  LessonViewerProps,
  FlowFilterType,
  MasteryRatingType,
  QuestionAnswerState,
  ChecklistItem,
  Definition,
  Formula,
  Comparison,
  Mistake,
} from "./types";
import { LessonHeader } from "./LessonHeader";
import { LessonAudioPlayer } from "./LessonAudioPlayer";
import { LessonContentTab } from "./LessonContentTab";
import { LessonMindMapTab } from "./LessonMindMapTab";
import { LessonFooterNav } from "./LessonFooterNav";
import { LessonFlowDock } from "./flow/LessonFlowDock";
import { LessonSummarySection } from "./flow/LessonSummarySection";
import { LessonDefinitionsSection } from "./flow/LessonDefinitionsSection";
import { LessonMcqSection } from "./flow/LessonMcqSection";
import { LessonEssaySection } from "./flow/LessonEssaySection";
import { LessonAssessmentSection } from "./flow/LessonAssessmentSection";
import { LessonTrueFalseSection } from "./flow/LessonTrueFalseSection";
import { LessonLearningStepper } from "./flow/LessonLearningStepper";
import { LessonFlashcardsModal } from "./LessonFlashcardsModal";
import { LessonMistakesCapsuleModal } from "./LessonMistakesCapsuleModal";
import { offlineStorage } from "@/lib/offline-db";
import { fetchWithRetry } from "@/lib/network";
import { ListChecks, SlidersHorizontal } from "lucide-react";

function getEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }
  return null;
}

export function LessonViewer({
  lesson,
  initialIsBookmarked,
  initialIsCompleted,
  initialMistakes = [],
  initialQuestionAttempts = [],
  userId,
}: LessonViewerProps) {
  // 4 Main Student Navigation Tabs (Defaults to "definitions" if available, else mindmap, questions, or content)
  const [activeTab, setActiveTab] = useState<
    "content" | "mindmap" | "definitions" | "questions"
  >(() => {
    const rawDefs = lesson.summary?.definitions;
    const hasDefs = Array.isArray(rawDefs) && rawDefs.length > 0;
    if (hasDefs) return "definitions";
    if (lesson.mindMap?.images && lesson.mindMap.images.length > 0) return "mindmap";
    if (lesson.questions && lesson.questions.length > 0) return "questions";
    return "definitions";
  });

  // Question Filters (Difficulty & Type)
  const [difficultyFilter, setDifficultyFilter] = useState<
    "ALL" | "EASY" | "MEDIUM" | "HARD"
  >("ALL");
  const [questionTypeFilter, setQuestionTypeFilter] = useState<
    "ALL" | "MCQ" | "TRUE_FALSE" | "ESSAY"
  >("ALL");

  // Definitions Search & Copy
  const [definitionSearch, setDefinitionSearch] = useState("");
  const [copiedDefinition, setCopiedDefinition] = useState<string | null>(null);

  // Essay Student Drafting, Reveal & Self-scoring (Restored from previous attempts)
  const [essayDrafts, setEssayDrafts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const a of initialQuestionAttempts) {
      if (a.essayText) init[a.questionId] = a.essayText;
    }
    return init;
  });

  const [revealedEssays, setRevealedEssays] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const a of initialQuestionAttempts) {
      if (a.essayText || a.isCorrect) init[a.questionId] = true;
    }
    return init;
  });

  const [essaySelfScores, setEssaySelfScores] = useState<Record<string, number>>({});
  const [definitionsReviewed, setDefinitionsReviewed] = useState(false);
  const [stepCelebration, setStepCelebration] = useState<{
    step: "definitions" | "tf" | "exam";
    title: string;
    description: string;
    nextStep?: "definitions" | "tf" | "exam" | "mistakes";
    nextStepLabel?: string;
  } | null>(null);

  // Mastery Ratings for Learning Objectives
  const [masteryRatings, setMasteryRatings] = useState<
    Record<number, MasteryRatingType>
  >({});

  // Practice Questions Answer State (Restored from previous saved attempts)
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<string, QuestionAnswerState>
  >(() => {
    const init: Record<string, QuestionAnswerState> = {};
    for (const a of initialQuestionAttempts) {
      if (a.selectedOptionId) {
        const qObj = lesson.questions.find((lq) => lq.question.id === a.questionId)?.question;
        const correctOpt = qObj?.options.find((o) => o.isCorrect);
        init[a.questionId] = {
          selectedOptionId: a.selectedOptionId,
          revealed: true,
          isCorrect: a.isCorrect,
          reveal: {
            isCorrect: a.isCorrect,
            correctOptionId: correctOpt?.id,
            explanation: qObj?.explanation,
            options: qObj?.options.map((o) => ({
              id: o.id,
              text: o.text,
              isCorrect: o.isCorrect,
              explanation: o.explanation,
            })),
          },
        };
      }
    }
    return init;
  });

  // Bookmark & Progress States
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [mistakes, setMistakes] = useState(initialMistakes);
  const [isMistakesCapsuleOpen, setIsMistakesCapsuleOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

  // Sync mistakes when initialMistakes prop updates
  useEffect(() => {
    setMistakes(initialMistakes);
  }, [initialMistakes]);

  const handleMistakeResolved = useCallback((questionId: string) => {
    setMistakes((prev) => prev.filter((m) => m.questionId !== questionId));
  }, []);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const [bookmarkNotice, setBookmarkNotice] = useState<string | null>(null);

  // Offline PWA Mode State
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [isSavingOffline, setIsSavingOffline] = useState(false);
  const [offlineToast, setOfflineToast] = useState<string | null>(null);

  // Check if lesson is cached in IndexedDB
  useEffect(() => {
    let isMounted = true;
    offlineStorage
      .hasLesson(lesson.id)
      .then((saved) => {
        if (isMounted) setIsSavedOffline(saved);
      })
      .catch((err) => {
        console.warn("IndexedDB check failed:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [lesson.id]);

  const handleToggleOffline = async () => {
    if (isSavingOffline) return;
    setIsSavingOffline(true);
    try {
      if (isSavedOffline) {
        await offlineStorage.deleteLesson(lesson.id);
        setIsSavedOffline(false);
        setOfflineToast("تم حذف الدرس من المذاكرة بدون إنترنت");
      } else {
        const res = await fetch(`/api/lessons/${lesson.id}/offline`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "تعذر تجهيز حزمة الدرس أوفلاين");
        }
        const data = await res.json();
        if (data.package) {
          await offlineStorage.saveLesson(data.package);
          setIsSavedOffline(true);
          setOfflineToast("تم حفظ الدرس بنجاح للمذاكرة بدون إنترنت!");
        }
      }
    } catch (err) {
      console.error("Offline toggle error:", err);
      setOfflineToast("حدث خطأ أثناء حفظ الدرس أوفلاين");
    } finally {
      setIsSavingOffline(false);
      setTimeout(() => setOfflineToast(null), 3000);
    }
  };

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  // Interactive Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    (lesson.summary?.checklist as ChecklistItem[]) || []
  );

  // Total Question Counts for Badges & Filters
  const totalQuestionsCount = lesson.questions.length;
  const easyCount = lesson.questions.filter((q) => q.question.difficulty === "EASY").length;
  const mediumCount = lesson.questions.filter((q) => q.question.difficulty === "MEDIUM").length;
  const hardCount = lesson.questions.filter((q) => q.question.difficulty === "HARD").length;

  // Deduplicate questions by ID and normalized statement to guarantee zero repetition
  const deduplicateLessonQuestions = <T extends { question: { id: string; statement: string } }>(
    items: T[]
  ): T[] => {
    const seenIds = new Set<string>();
    const seenStatements = new Set<string>();
    const result: T[] = [];

    for (const item of items) {
      if (!item?.question) continue;
      const qId = item.question.id;
      const norm = item.question.statement.trim().toLowerCase();
      if (!seenIds.has(qId) && !seenStatements.has(norm)) {
        seenIds.add(qId);
        seenStatements.add(norm);
        result.push(item);
      }
    }

    return result;
  };

  // Check if medium fallback is currently active
  const isMediumFallback =
    difficultyFilter === "MEDIUM" && mediumCount === 0 && easyCount + hardCount > 0;

  // Questions filtered by active difficulty level with fallback rule:
  // "ولو مفيش اسئلة متوسطة نعرض من السهل والصعب بدون تكرار"
  let filteredByDifficulty: typeof lesson.questions = [];
  if (difficultyFilter === "ALL") {
    filteredByDifficulty = deduplicateLessonQuestions(lesson.questions);
  } else if (difficultyFilter === "MEDIUM") {
    const mediumOnly = lesson.questions.filter(
      (q) => q.question.difficulty === "MEDIUM"
    );
    if (mediumOnly.length > 0) {
      filteredByDifficulty = deduplicateLessonQuestions(mediumOnly);
    } else {
      // Fallback rule: display from EASY and HARD without duplicates
      const easyQuestions = deduplicateLessonQuestions(
        lesson.questions.filter((q) => q.question.difficulty === "EASY")
      );
      const hardQuestions = deduplicateLessonQuestions(
        lesson.questions.filter((q) => q.question.difficulty === "HARD")
      );

      // Interleave easy and hard questions for a balanced progressive learning experience
      const combined: typeof lesson.questions = [];
      const maxLen = Math.max(easyQuestions.length, hardQuestions.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < easyQuestions.length) combined.push(easyQuestions[i]);
        if (i < hardQuestions.length) combined.push(hardQuestions[i]);
      }

      filteredByDifficulty = deduplicateLessonQuestions(combined);
    }
  } else {
    filteredByDifficulty = deduplicateLessonQuestions(
      lesson.questions.filter((q) => q.question.difficulty === difficultyFilter)
    );
  }

  const mcqQuestions = filteredByDifficulty.filter((q) => q.question.type === "MCQ");
  const tfQuestions = filteredByDifficulty.filter((q) => q.question.type === "TRUE_FALSE");
  const essayQuestions = filteredByDifficulty.filter((q) => q.question.type === "ESSAY");
  const definitions = (lesson.summary?.definitions as Definition[]) || [];
  const keyConcepts = (lesson.summary?.keyConcepts as string[]) || [];
  const objectivesList =
    lesson.content?.objectives && lesson.content.objectives.length > 0
      ? lesson.content.objectives
      : keyConcepts.slice(0, 3);
  const examTips = (lesson.summary?.examTips as string[]) || [];
  const commonMistakes = (lesson.summary?.commonMistakes as Mistake[]) || [];
  const formulas = (lesson.summary?.formulas as Formula[]) || [];
  const comparisons = (lesson.summary?.comparisons as Comparison[]) || [];

  const filteredDefinitions = definitions.filter(
    (d) =>
      !definitionSearch.trim() ||
      d.term.toLowerCase().includes(definitionSearch.toLowerCase()) ||
      d.meaning.toLowerCase().includes(definitionSearch.toLowerCase())
  );

  const handleCopyDefinition = (term: string, meaning: string) => {
    navigator.clipboard.writeText(`${term}: ${meaning}`);
    setCopiedDefinition(term);
    setTimeout(() => setCopiedDefinition(null), 2000);
  };

  // Live readiness percentage for assessments
  const totalObjectives = objectivesList.length;
  const masteredCount = Object.values(masteryRatings).filter(
    (r) => r === "mastered"
  ).length;
  const reviewCount = Object.values(masteryRatings).filter(
    (r) => r === "review"
  ).length;
  const readinessPercentage =
    totalObjectives > 0
      ? Math.round(
        ((masteredCount * 1 + reviewCount * 0.5) / totalObjectives) * 100
      )
      : 100;

  // Sibling lessons navigation calculations
  const isLanguagesSubject =
    lesson.unit.subject.schoolCategory === "LANGUAGES" ||
    !/[\u0600-\u06FF]/.test(lesson.title || "");

  const tfAnsweredCount = useMemo(() => {
    return tfQuestions.filter((q) => Boolean(questionAnswers[q.question.id])).length;
  }, [tfQuestions, questionAnswers]);

  const examAnsweredCount = useMemo(() => {
    const mcqAnswered = mcqQuestions.filter((q) => Boolean(questionAnswers[q.question.id])).length;
    const essayAnswered = essayQuestions.filter(
      (q) => Boolean(revealedEssays[q.question.id] || essayDrafts[q.question.id]?.trim())
    ).length;
    return mcqAnswered + essayAnswered;
  }, [mcqQuestions, essayQuestions, questionAnswers, revealedEssays, essayDrafts]);

  const isQuestionsFullyAnswered = useMemo(() => {
    const totalPractice = tfQuestions.length + mcqQuestions.length + essayQuestions.length;
    if (totalPractice === 0) return true;
    return (tfAnsweredCount + examAnsweredCount) >= totalPractice;
  }, [tfQuestions.length, mcqQuestions.length, essayQuestions.length, tfAnsweredCount, examAnsweredCount]);

  const activeStep = useMemo(() => {
    if (activeTab === "definitions" || activeTab === "content" || activeTab === "mindmap") {
      return "definitions";
    }
    if (activeTab === "questions") {
      if (questionTypeFilter === "TRUE_FALSE") return "tf";
      return "exam";
    }
    return "definitions";
  }, [activeTab, questionTypeFilter]);

  const handleSelectStep = useCallback((step: "definitions" | "tf" | "exam" | "mistakes") => {
    if (step === "definitions") {
      setActiveTab("definitions");
    } else if (step === "tf") {
      setActiveTab("questions");
      setQuestionTypeFilter("TRUE_FALSE");
    } else if (step === "exam") {
      setActiveTab("questions");
      setQuestionTypeFilter("ALL");
    } else if (step === "mistakes") {
      setIsMistakesCapsuleOpen(true);
    }
  }, []);

  // Auto-dismiss step celebration toast after 10s
  useEffect(() => {
    if (!stepCelebration) return;
    const timer = setTimeout(() => {
      setStepCelebration(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [stepCelebration]);

  // Siblings navigation
  const siblingLessons = lesson.unit.lessons;
  const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < siblingLessons.length - 1
      ? siblingLessons[currentIndex + 1]
      : null;

  // Auto-complete lesson progress in background when student answers all questions in the lesson
  useEffect(() => {
    if (
      userId &&
      !isCompleted &&
      isQuestionsFullyAnswered &&
      lesson.questions.length > 0
    ) {
      fetchWithRetry(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCompleted: true,
          progressPercent: 100,
        }),
      })
        .then((res) => {
          if (res.ok) setIsCompleted(true);
        })
        .catch((err) => console.error("Auto progress error:", err));
    }
  }, [userId, isCompleted, isQuestionsFullyAnswered, lesson.id, lesson.questions.length]);

  // Set audio playback speed
  useEffect(() => {
    if (audioElemRef.current) {
      audioElemRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Audio simulation / Real HTML5 audio playback
  useEffect(() => {
    const audio = audioElemRef.current;
    if (lesson.content?.audioUrl && audio) {
      if (isPlayingAudio) {
        audio.play().catch(() => { });
      } else {
        audio.pause();
      }
      return;
    }

    if (isPlayingAudio) {
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 500);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isPlayingAudio, playbackSpeed, lesson.content?.audioUrl]);

  const toggleBookmark = async () => {
    if (!userId) {
      setBookmarkNotice("يرجى تسجيل الدخول لحفظ الدرس في المفضلة");
      setTimeout(() => setBookmarkNotice(null), 3500);
      return;
    }
    setBookmarkNotice(null);
    setIsTogglingBookmark(true);
    try {
      const res = await fetchWithRetry("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingBookmark(false);
    }
  };

  const toggleComplete = async () => {
    if (!userId) {
      setIsCompleted(!isCompleted);
      return;
    }
    setIsTogglingComplete(true);
    try {
      const newStatus = !isCompleted;
      const res = await fetchWithRetry(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCompleted: newStatus,
          progressPercent: newStatus ? 100 : 0,
        }),
      });
      if (res.ok) {
        setIsCompleted(newStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingComplete(false);
    }
  };

  const handleSelectOption = async (questionId: string, optionId: string) => {
    if (questionAnswers[questionId]?.selectedOptionId === optionId) return;

    // Instant optimistic visual feedback (0ms perceived latency for the student)
    setQuestionAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selectedOptionId: optionId,
        revealed: prev[questionId]?.revealed || false,
        isCorrect: prev[questionId]?.isCorrect || false,
        reveal: prev[questionId]?.reveal,
      },
    }));

    try {
      const res = await fetchWithRetry(`/api/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: optionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر التحقق من الإجابة");
      }
      const isRight = !!data.isCorrect;
      setQuestionAnswers((prev) => ({
        ...prev,
        [questionId]: {
          selectedOptionId: optionId,
          revealed: true,
          isCorrect: isRight,
          reveal: data,
        },
      }));

      // Reactive Auto-Sync: Check if this answer completes all True/False challenges
      const targetQ = lesson.questions.find((lq) => lq.question.id === questionId)?.question;
      if (targetQ?.type === "TRUE_FALSE" && tfQuestions.length > 0) {
        const willBeAnswered = tfQuestions.filter(
          (q) => q.question.id === questionId || Boolean(questionAnswers[q.question.id]?.selectedOptionId)
        ).length;
        if (willBeAnswered >= tfQuestions.length && tfAnsweredCount < tfQuestions.length) {
          setStepCelebration({
            step: "tf",
            title: isLanguagesSubject ? "Quick Challenges Complete! 🎯" : "عاش يا بطل! قفلت التحديات السريعة كلها 🎯",
            description: isLanguagesSubject
              ? "All True/False challenges completed. Ready for comprehensive exam questions?"
              : "كدا إجاباتك كلها متسجلة تمام التمام.. يلا بينا ندخل على أسئلة الامتحانات ونفرمها سوا 💪",
            nextStep: "exam",
            nextStepLabel: isLanguagesSubject ? "Go to Exam Practice" : "يلا بينا على أسئلة الامتحانات",
          });
        }
      }

      // Live reactive synchronization with the lesson mistakes capsule
      if (!isRight) {
        setMistakes((prev) => {
          if (prev.some((m) => m.questionId === questionId)) {
            return prev.map((m) =>
              m.questionId === questionId ? { ...m, wrongCount: m.wrongCount + 1 } : m
            );
          }
          const qObj = lesson.questions.find((lq) => lq.question.id === questionId)?.question;
          if (!qObj) return prev;
          return [
            ...prev,
            {
              id: `temp-${questionId}`,
              questionId,
              wrongCount: 1,
              question: qObj as any,
            },
          ];
        });
      } else {
        setMistakes((prev) => prev.filter((m) => m.questionId !== questionId));
      }
    } catch (err) {
      console.error(err);
      setQuestionAnswers((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const toggleChecklistItem = (index: number) => {
    setChecklist((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="space-y-6 text-right font-ui pb-28">
      {/* 1. Top Header & Breadcrumbs & Actions */}
      <LessonHeader
        subject={lesson.unit.subject}
        unit={lesson.unit}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        durationMinutes={lesson.durationMinutes}
        questionsCount={lesson.questions.length}
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
        onStartFlashcards={() => setIsFlashcardsOpen(true)}
        onOpenMistakesCapsule={() => setIsMistakesCapsuleOpen(true)}
      />

      {/* 2. Audio Player Bar */}
      <LessonAudioPlayer
        audioUrl={lesson.content?.audioUrl}
        isPlayingAudio={isPlayingAudio}
        audioProgress={audioProgress}
        playbackSpeed={playbackSpeed}
        audioElemRef={audioElemRef}
        onTogglePlay={() => setIsPlayingAudio(!isPlayingAudio)}
        onChangeSpeed={() => {
          const speeds: (1 | 1.5 | 2)[] = [1, 1.5, 2];
          const next =
            speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
          setPlaybackSpeed(next);
        }}
        onTimeUpdate={(currentTime, duration) => {
          setAudioProgress((currentTime / duration) * 100);
        }}
        onEnded={() => {
          setIsPlayingAudio(false);
          setAudioProgress(0);
        }}
      />

      {/* 2.5 Interactive Step-by-Step Learning Stepper (شريط خطوة بخطوة للدرس) */}
      <LessonLearningStepper
        activeStep={activeStep}
        onSelectStep={handleSelectStep}
        definitionsCount={definitions.length}
        definitionsReviewed={definitionsReviewed}
        tfQuestionsCount={tfQuestions.length}
        tfAnsweredCount={tfAnsweredCount}
        examQuestionsCount={mcqQuestions.length + essayQuestions.length}
        examAnsweredCount={examAnsweredCount}
        unresolvedMistakesCount={mistakes.length}
        isLanguages={isLanguagesSubject}
      />

      {/* 2.6 Step Completion Celebration Banner with Smooth Next-Step Transition */}
      {stepCelebration && (
        <div
          dir={isLanguagesSubject ? "ltr" : "rtl"}
          className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-300 dark:border-emerald-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkle className="w-5 h-5" weight="fill" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200">
                {stepCelebration.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                {stepCelebration.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {stepCelebration.nextStep && (
              <button
                type="button"
                onClick={() => {
                  handleSelectStep(stepCelebration.nextStep!);
                  setStepCelebration(null);
                }}
                className="h-8 sm:h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <span>{stepCelebration.nextStepLabel || (isLanguagesSubject ? "Next Step" : "الخطوة التالية")}</span>
                <ArrowLeft className={`w-3.5 h-3.5 ${isLanguagesSubject ? "rotate-180" : ""}`} weight="bold" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setStepCelebration(null)}
              className="w-8 h-8 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Navigation Tabs (4 Clear Student Tabs with Zero Cutoff & Mobile Optimization) */}
      <div
        role="tablist"
        aria-label="أقسام محتوى الدرس"
        className="w-full p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-2xs grid grid-cols-4 gap-1 sm:gap-2"
      >
        {[
          {
            id: "content",
            label: "شرح الدرس",
            mobileLabel: "الشرح",
            icon: BookOpen,
          },
          {
            id: "definitions",
            label: "التعريفات والمفاهيم",
            mobileLabel: "المفاهيم",
            icon: BookmarkSimple,
            badge: definitions.length > 0 ? `${definitions.length}` : undefined,
          },
          {
            id: "mindmap",
            label: "الملخص الذهني",
            mobileLabel: "الملخص",
            icon: Graph,
            badge:
              lesson.mindMap?.images && lesson.mindMap.images.length > 1
                ? `${lesson.mindMap.images.length}`
                : undefined,
          },
          {
            id: "questions",
            label: "تدريبات وبنك الأسئلة",
            mobileLabel: "الأسئلة",
            icon: ListChecks,
            badge: totalQuestionsCount > 0 ? `${totalQuestionsCount}` : undefined,
          },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full min-h-[44px] py-2 px-1 sm:px-3 rounded-xl text-xs sm:text-[13px] font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer select-none active:scale-[0.98] ${
                isSelected
                  ? "bg-[#800B34] text-white shadow-xs border border-[#800B34] font-black"
                  : "bg-[#F8FAFC] dark:bg-[#071737] text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#11244E]/80 border border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#E9AD32]" : "text-[#64748B] dark:text-[#94A3B8]"}`}
              />
              <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
              <span className="sm:hidden whitespace-nowrap">{tab.mobileLabel}</span>
              {"badge" in tab && tab.badge && (
                <span
                  className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 dark:bg-slate-800 text-[#536681] dark:text-[#94A3B8]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CONTENT (شرح الدرس) */}
      {activeTab === "content" && (
        <LessonContentTab
          content={lesson.content}
          lessonTitle={lesson.title}
          embedUrl={getEmbedUrl(lesson.content?.videoUrl)}
        />
      )}

      {/* TAB 2: MIND MAP (الملخص الذهني) */}
      {activeTab === "mindmap" && (
        <LessonMindMapTab mindMap={lesson.mindMap} />
      )}

      {/* TAB 3: DEFINITIONS & SUMMARY CAPSULE (التعريفات والمفاهيم المهمة) */}
      {activeTab === "definitions" && (
        <div className="space-y-8 print-content">
          <LessonDefinitionsSection
            definitions={definitions}
            filteredDefinitions={filteredDefinitions}
            definitionSearch={definitionSearch}
            copiedDefinition={copiedDefinition}
            onSearchChange={setDefinitionSearch}
            onClearSearch={() => setDefinitionSearch("")}
            onCopyDefinition={handleCopyDefinition}
            isLanguages={isLanguagesSubject}
          />

          <LessonSummarySection
            summary={lesson.summary}
            keyConcepts={keyConcepts}
            formulas={formulas}
            comparisons={comparisons}
            examTips={examTips}
            commonMistakes={commonMistakes}
            checklist={checklist}
            onToggleChecklistItem={toggleChecklistItem}
          />
        </div>
      )}

      {/* TAB 4: PRACTICE QUESTIONS WITH DIFFICULTY FILTER (تدريبات وبنك أسئلة الدرس) */}
      {activeTab === "questions" && (
        <div className="space-y-6 print-content">
          {/* Difficulty & Type Filter Dock (Redesigned UI/UX - Compact, Balanced 2x2/4x1 Grids, Unified Burgundy) */}
          <div className="p-3.5 sm:p-4.5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-2xs space-y-3.5">
            {/* Header: Action Title + Single Primary Counter */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]/80 dark:border-[#1E3A6E]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#800B34]/10 dark:bg-[#800B34]/20 text-[#800B34] dark:text-[#E9AD32] flex items-center justify-center shrink-0 border border-[#800B34]/20 shadow-2xs">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#091B40] dark:text-white leading-tight">
                    تخصيص وتصفية التدريب
                  </h3>
                  <p className="text-[11px] sm:text-xs font-medium text-[#536681] dark:text-[#CBD5E1] mt-0.5">
                    اختر مستوى الصعوبة ونوع السؤال للتركيز على ما تحتاجه
                  </p>
                </div>
              </div>

              {/* Single Primary Counter Badge */}
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-mono font-bold shadow-2xs">
                  <span className="text-[#800B34] dark:text-[#E9AD32] font-black">{filteredByDifficulty.length}</span>
                  <span className="text-[#536681] dark:text-[#94A3B8]">من</span>
                  <span className="text-[#091B40] dark:text-white">{totalQuestionsCount} سؤال</span>
                </span>
              </div>
            </div>

            {/* Filter 1: Difficulty Levels (Balanced 2x2 Mobile / 4x1 Desktop Grid) */}
            <div className="space-y-1.5">
              <span className="text-xs font-black text-[#091B40] dark:text-white block">
                مستوى الصعوبة:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "ALL", label: "كل المستويات", count: null },
                  { id: "EASY", label: "سهل ومباشر", count: easyCount },
                  {
                    id: "MEDIUM",
                    label: "متوسط",
                    count:
                      mediumCount > 0
                        ? mediumCount
                        : easyCount + hardCount > 0
                          ? `${easyCount + hardCount}`
                          : 0,
                  },
                  { id: "HARD", label: "متقدم وللتفوق", count: hardCount },
                ].map((item) => {
                  const isActive = difficultyFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficultyFilter(item.id as any)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer select-none active:scale-[0.98] ${
                        isActive
                          ? "bg-[#800B34] text-white border-[#800B34] shadow-xs font-black"
                          : "bg-[#F8FAFC] dark:bg-[#071737] text-[#536681] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#800B34]/30 hover:text-[#091B40] dark:hover:text-white"
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.count !== null && (
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white font-bold"
                              : "bg-slate-200/80 dark:bg-slate-800 text-[#091B40] dark:text-slate-200 font-bold"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter 2: Question Types (Balanced 2x2 Mobile / 4x1 Desktop Grid, Unified Burgundy) */}
            <div className="space-y-1.5 pt-0.5">
              <span className="text-xs font-black text-[#091B40] dark:text-white block">
                نوع السؤال:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "ALL", label: "جميع الأنواع", count: null },
                  { id: "MCQ", label: "اختيار من متعدد", count: mcqQuestions.length },
                  { id: "TRUE_FALSE", label: "صح وغلط", count: tfQuestions.length },
                  { id: "ESSAY", label: "أسئلة مقالية", count: essayQuestions.length },
                ].map((item) => {
                  const isActive = questionTypeFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setQuestionTypeFilter(item.id as any)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer select-none active:scale-[0.98] ${
                        isActive
                          ? "bg-[#800B34] text-white border-[#800B34] shadow-xs font-black"
                          : "bg-[#F8FAFC] dark:bg-[#071737] text-[#536681] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#800B34]/30 hover:text-[#091B40] dark:hover:text-white"
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.count !== null && (
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white font-bold"
                              : "bg-slate-200/80 dark:bg-slate-800 text-[#091B40] dark:text-slate-200 font-bold"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Questions Rendered */}
          {filteredByDifficulty.length === 0 ? (
            <div className="py-14 px-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-dashed border-[#E2E8F0] dark:border-[#334155] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#0F172A] dark:text-white">
                لا توجد أسئلة بهذا المستوى حالياً
              </h4>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto">
                مفيش أسئلة بالمستوى دا حالياً، جرب تختار مستوى تاني أو (كل المستويات) علشان تتدرب أكتر
              </p>
              <button
                type="button"
                onClick={() => {
                  setDifficultyFilter("ALL");
                  setQuestionTypeFilter("ALL");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#800020] text-white hover:bg-[#660019] transition-all cursor-pointer"
              >
                عرض كل الأسئلة
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Fallback Notice for Medium questions */}
              {isMediumFallback && (
                <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-[13px] font-semibold flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold text-sm">
                    !
                  </span>
                  <span className="leading-relaxed">
                    لا توجد أسئلة مصنفة كـ (متوسط) في هذا الدرس حالياً — تم عرض تشكيلة متوازنة من الأسئلة السهلة والصعبة بدون تكرار لتثبيت واستيعاب المفاهيم.
                  </span>
                </div>
              )}

              {/* MCQ Section */}
              {(questionTypeFilter === "ALL" || questionTypeFilter === "MCQ") && mcqQuestions.length > 0 && (
                <LessonMcqSection
                  questions={mcqQuestions}
                  questionAnswers={questionAnswers}
                  onSelectOption={handleSelectOption}
                  isLanguages={isLanguagesSubject}
                />
              )}

              {/* True / False Section */}
              {(questionTypeFilter === "ALL" || questionTypeFilter === "TRUE_FALSE") && tfQuestions.length > 0 && (
                <LessonTrueFalseSection
                  questions={tfQuestions}
                  questionAnswers={questionAnswers}
                  onSelectOption={handleSelectOption}
                  isLanguages={isLanguagesSubject}
                />
              )}

              {/* Essay Section */}
              {(questionTypeFilter === "ALL" || questionTypeFilter === "ESSAY") && essayQuestions.length > 0 && (
                <LessonEssaySection
                  questions={essayQuestions}
                  essayDrafts={essayDrafts}
                  revealedEssays={revealedEssays}
                  essaySelfScores={essaySelfScores}
                  isLanguages={isLanguagesSubject}
                  onDraftChange={(qId, draft) =>
                    setEssayDrafts((prev) => ({ ...prev, [qId]: draft }))
                  }
                  onToggleReveal={(qId) => {
                    setRevealedEssays((prev) => {
                      const next = !prev[qId];
                      if (next) {
                        fetchWithRetry(`/api/questions/${qId}/answer`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            essayText: essayDrafts[qId] || "",
                            resolve: true,
                          }),
                        }).catch(() => { });
                      }
                      return { ...prev, [qId]: next };
                    });
                  }}
                  onSelectScore={(qId, score) =>
                    setEssaySelfScores((prev) => ({ ...prev, [qId]: score }))
                  }
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Sibling Lessons Navigation Footer (with Next Lesson Hero Action) */}
      <LessonFooterNav
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        subjectId={lesson.unit.subject.id}
        isAllAnswered={isQuestionsFullyAnswered}
        unresolvedMistakesCount={mistakes.length}
        onOpenMistakesCapsule={() => setIsMistakesCapsuleOpen(true)}
        isLanguages={isLanguagesSubject}
      />
      {/* Flashcards Smart Active Recall Modal (كروت التثبيت الذكي) */}
      <LessonFlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        unitTitle={lesson.unit?.title}
        definitions={definitions}
        isLanguages={isLanguagesSubject}
        onCompleted={() => {
          setDefinitionsReviewed(true);
          setStepCelebration({
            step: "definitions",
            title: isLanguagesSubject ? "Concepts Mastered! 👏" : "الله ينور عليك يا وحش! كدا المفاهيم في جيبك 👏",
            description: isLanguagesSubject
              ? "All concepts reviewed. Continue to Quick Challenges to test your understanding."
              : "راجعت كل الكروت وظبطت المصطلحات.. تعالى بقى ع السريع ندخل ع التحديات ونثبت المعلومة سوا 😉",
            nextStep: tfQuestions.length > 0 ? "tf" : "exam",
            nextStepLabel: tfQuestions.length > 0
              ? (isLanguagesSubject ? "Start Quick Challenges" : "يلا بينا ع التحديات السريعة")
              : (isLanguagesSubject ? "Start Exam Questions" : "يلا بينا على أسئلة الامتحانات"),
          });
        }}
      />
      {/* Mistakes Quick Drill Capsule Modal (كبسولة تظبيط الغلطات) */}
      <LessonMistakesCapsuleModal
        isOpen={isMistakesCapsuleOpen}
        onClose={() => setIsMistakesCapsuleOpen(false)}
        lessonTitle={lesson.title}
        unitTitle={lesson.unit?.title}
        mistakes={mistakes}
        onMistakeResolved={handleMistakeResolved}
      />
    </div>
  );
}