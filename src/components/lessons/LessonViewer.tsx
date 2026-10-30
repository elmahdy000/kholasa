"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, Graph, BookmarkSimple, CheckCircle } from "@phosphor-icons/react";
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
  userId,
}: LessonViewerProps) {
  // 4 Main Student Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "content" | "mindmap" | "definitions" | "questions"
  >("content");

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

  // Essay Student Drafting, Reveal & Self-scoring
  const [essayDrafts, setEssayDrafts] = useState<Record<string, string>>({});
  const [revealedEssays, setRevealedEssays] = useState<Record<string, boolean>>({});
  const [essaySelfScores, setEssaySelfScores] = useState<Record<string, number>>({});

  // Mastery Ratings for Learning Objectives
  const [masteryRatings, setMasteryRatings] = useState<
    Record<number, MasteryRatingType>
  >({});

  // Practice Questions Answer State
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<string, QuestionAnswerState>
  >({});

  // Bookmark & Progress States
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const [bookmarkNotice, setBookmarkNotice] = useState<string | null>(null);

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

  // Questions filtered by active difficulty level
  const filteredByDifficulty = lesson.questions.filter((q) => {
    if (difficultyFilter === "ALL") return true;
    return q.question.difficulty === difficultyFilter;
  });

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

  // Siblings navigation
  const siblingLessons = lesson.unit.lessons;
  const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < siblingLessons.length - 1
      ? siblingLessons[currentIndex + 1]
      : null;

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
        audio.play().catch(() => {});
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
      const res = await fetch("/api/bookmarks", {
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
      const res = await fetch(`/api/lessons/${lesson.id}/progress`, {
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
    if (questionAnswers[questionId]?.revealed) return;

    try {
      const res = await fetch(`/api/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: optionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر التحقق من الإجابة");
      }
      setQuestionAnswers((prev) => ({
        ...prev,
        [questionId]: {
          selectedOptionId: optionId,
          revealed: true,
          isCorrect: !!data.isCorrect,
          reveal: data,
        },
      }));
    } catch (err) {
      console.error(err);
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
        lessonTitle={lesson.title}
        durationMinutes={lesson.durationMinutes}
        questionsCount={lesson.questions.length}
        isBookmarked={isBookmarked}
        isCompleted={isCompleted}
        isTogglingBookmark={isTogglingBookmark}
        isTogglingComplete={isTogglingComplete}
        bookmarkNotice={bookmarkNotice}
        onToggleBookmark={toggleBookmark}
        onToggleComplete={toggleComplete}
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

      {/* 3. Main Navigation Tabs (4 Clear Student Tabs) */}
      <div className="p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/80 border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: "content", label: "شرح الدرس", icon: BookOpen },
          { id: "mindmap", label: "الملخص الذهني", icon: Graph },
          {
            id: "definitions",
            label: "التعريفات المهمة",
            icon: BookmarkSimple,
            badge: definitions.length > 0 ? `${definitions.length}` : undefined,
          },
          {
            id: "questions",
            label: "تدريبات وبنك الأسئلة",
            icon: CheckCircle,
            badge: totalQuestionsCount > 0 ? `${totalQuestionsCount}` : undefined,
          },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[130px] sm:min-w-[140px] py-2.5 px-3 rounded-lg text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#800020] text-white shadow-sm"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#334155]/50"
              }`}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                weight={isSelected ? "fill" : "bold"}
              />
              <span>{tab.label}</span>
              {"badge" in tab && tab.badge && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#800020]/10 text-[#800020] dark:bg-[#FB7185]/20 dark:text-[#FB7185]"
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
          {/* Difficulty & Type Filter Dock */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0]/80 dark:border-[#334155]/80 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" weight="fill" />
                  <span>تدريبات وبنك أسئلة الدرس</span>
                </h3>
                <p className="text-[12px] sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  تدرج في الحل من المباشر للمتقدم، وجرب كل أنواع الأسئلة مع التصحيح الفوري
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-xl bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185] text-xs font-bold font-mono">
                  {filteredByDifficulty.length} من {totalQuestionsCount} سؤال
                </span>
              </div>
            </div>

            {/* Filter by Difficulty */}
            <div className="space-y-2">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                مستوى الصعوبة:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "ALL", label: "كل المستويات", count: totalQuestionsCount },
                  { id: "EASY", label: "سهل ومباشر", count: easyCount },
                  { id: "MEDIUM", label: "متوسط", count: mediumCount },
                  { id: "HARD", label: "متقدم وللتفوق", count: hardCount },
                ].map((item) => {
                  const isActive = difficultyFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficultyFilter(item.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                        isActive
                          ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                          : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020]/40"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-black/5 dark:bg-white/10 text-inherit"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter by Question Type */}
            <div className="space-y-2 pt-1">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                نوع السؤال:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "ALL", label: "جميع الأنواع", count: filteredByDifficulty.length },
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isActive
                          ? "bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] border-transparent shadow-sm"
                          : "bg-white dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155] hover:text-[#0F172A] dark:hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[11px] font-mono opacity-80">({item.count})</span>
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
              {/* MCQ Section */}
              {(questionTypeFilter === "ALL" || questionTypeFilter === "MCQ") && mcqQuestions.length > 0 && (
                <LessonMcqSection
                  questions={mcqQuestions}
                  questionAnswers={questionAnswers}
                  onSelectOption={handleSelectOption}
                />
              )}

              {/* True / False Section */}
              {(questionTypeFilter === "ALL" || questionTypeFilter === "TRUE_FALSE") && tfQuestions.length > 0 && (
                <LessonTrueFalseSection
                  questions={tfQuestions}
                  questionAnswers={questionAnswers}
                  onSelectOption={handleSelectOption}
                />
              )}

              {/* Essay Section */}
              {(questionTypeFilter === "ALL" || questionTypeFilter === "ESSAY") && essayQuestions.length > 0 && (
                <LessonEssaySection
                  questions={essayQuestions}
                  essayDrafts={essayDrafts}
                  revealedEssays={revealedEssays}
                  essaySelfScores={essaySelfScores}
                  onDraftChange={(qId, draft) =>
                    setEssayDrafts((prev) => ({ ...prev, [qId]: draft }))
                  }
                  onToggleReveal={(qId) =>
                    setRevealedEssays((prev) => ({
                      ...prev,
                      [qId]: !prev[qId],
                    }))
                  }
                  onSelectScore={(qId, score) =>
                    setEssaySelfScores((prev) => ({ ...prev, [qId]: score }))
                  }
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Sibling Lessons Navigation Footer */}
      <LessonFooterNav
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        subjectId={lesson.unit.subject.id}
      />
    </div>
  );
}