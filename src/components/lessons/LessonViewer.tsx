"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, Graph, BookmarkSimple } from "@phosphor-icons/react";
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
  // Navigation & Filter Tabs
  const [activeTab, setActiveTab] = useState<
    "summary" | "content" | "mindmap" | "questions"
  >("summary");
  const [flowFilter, setFlowFilter] = useState<FlowFilterType>("all");

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

  // Categorized Question Lists for Fast 6-Step Flow
  const mcqQuestions = lesson.questions.filter((q) => q.question.type === "MCQ");
  const tfQuestions = lesson.questions.filter((q) => q.question.type === "TRUE_FALSE");
  const essayQuestions = lesson.questions.filter((q) => q.question.type === "ESSAY");
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

      {/* 3. Main Navigation Tabs */}
      <div className="p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/80 border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          {
            id: "summary",
            label: "الزتونة وبنك الأسئلة السريع",
            icon: BookmarkSimple,
            badge: "سريع ومميز",
          },
          { id: "content", label: "الشرح والتفكيك", icon: BookOpen },
          { id: "mindmap", label: "خريطة المفاهيم", icon: Graph },
        ].map((tab) => {
          const isSelected =
            activeTab === tab.id ||
            (tab.id === "summary" && activeTab === "questions");
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isSelected
                  ? "bg-[#800020] text-white shadow-sm"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                weight={isSelected ? "fill" : "bold"}
              />
              <span>{tab.label}</span>
              {"badge" in tab && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#059669]/10 text-[#059669]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CONTENT (الشرح والتفكيك) */}
      {activeTab === "content" && (
        <LessonContentTab
          content={lesson.content}
          lessonTitle={lesson.title}
          embedUrl={getEmbedUrl(lesson.content?.videoUrl)}
        />
      )}

      {/* TAB 2: UNIFIED 6-STEP FAST LEARNING FLOW (الزتونة وبنك الأسئلة السريع) */}
      {(activeTab === "summary" || activeTab === "questions") && (
        <div className="space-y-8 print-content">
          {/* Quick-Jump Navigation Dock */}
          <LessonFlowDock
            flowFilter={flowFilter}
            definitionsCount={definitions.length}
            mcqCount={mcqQuestions.length}
            essayCount={essayQuestions.length}
            objectivesCount={objectivesList.length}
            tfCount={tfQuestions.length}
            onFilterChange={setFlowFilter}
          />

          {/* 1. الزتونة (The Golden Core Summary) */}
          {(flowFilter === "all" || flowFilter === "summary") && (
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
          )}

          {/* 2. التعريفات المهمة (Essential Definitions & Glossary) */}
          {(flowFilter === "all" || flowFilter === "definitions") && (
            <LessonDefinitionsSection
              definitions={definitions}
              filteredDefinitions={filteredDefinitions}
              definitionSearch={definitionSearch}
              copiedDefinition={copiedDefinition}
              onSearchChange={setDefinitionSearch}
              onClearSearch={() => setDefinitionSearch("")}
              onCopyDefinition={handleCopyDefinition}
            />
          )}

          {/* 3. أسئلة اختيار من متعدد (Multiple Choice Questions - MCQ) */}
          {(flowFilter === "all" || flowFilter === "mcq") && (
            <LessonMcqSection
              questions={mcqQuestions}
              questionAnswers={questionAnswers}
              onSelectOption={handleSelectOption}
            />
          )}

          {/* 4. أسئلة مقالي (Essay & Analytical Questions) */}
          {(flowFilter === "all" || flowFilter === "essay") && (
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

          {/* 5. أسئلة تقييمات (Self-Assessment & Mastery Ratings) */}
          {(flowFilter === "all" || flowFilter === "assessments") && (
            <LessonAssessmentSection
              objectivesList={objectivesList}
              masteryRatings={masteryRatings}
              readinessPercentage={readinessPercentage}
              masteredCount={masteredCount}
              reviewCount={reviewCount}
              onRatingChange={(idx, rating) =>
                setMasteryRatings((prev) => ({ ...prev, [idx]: rating }))
              }
            />
          )}

          {/* 6. أسئلة صح وغلط (True / False Fast Sprint) */}
          {(flowFilter === "all" || flowFilter === "true_false") && (
            <LessonTrueFalseSection
              questions={tfQuestions}
              questionAnswers={questionAnswers}
              onSelectOption={handleSelectOption}
            />
          )}
        </div>
      )}

      {/* TAB 3: MIND MAP (الخرائط الذهنية المصورة) */}
      {activeTab === "mindmap" && (
        <LessonMindMapTab mindMap={lesson.mindMap} />
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