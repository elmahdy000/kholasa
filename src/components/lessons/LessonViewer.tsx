"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkle,
  Graph,
  Question,
  BookmarkSimple,
  CheckCircle,
  Clock,
  Play,
  Pause,
  ArrowCounterClockwise,
  SpeakerHigh,
  SpeakerX,
  CaretRight,
  CaretLeft,
  ArrowRight,
  ArrowLeft,
  Check,
  Warning,
  Lightbulb,
  Copy,
  ArrowsOut,
  ArrowsIn,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  TreeStructure,
  ShareNetwork,
  Stack,
} from "@phosphor-icons/react";

interface LessonContent {
  id: string;
  body: string;
  videoUrl?: string | null;
  objectives: string[];
}

interface Definition {
  term: string;
  meaning: string;
}

interface Formula {
  title: string;
  code: string;
}

interface Comparison {
  aspect: string;
  first: string;
  second: string;
}

interface Mistake {
  mistake: string;
  correction: string;
}

interface ChecklistItem {
  task: string;
  completed?: boolean;
}

interface LessonSummary {
  id: string;
  keyConcepts: string[];
  definitions: Definition[];
  formulas: Formula[];
  comparisons: Comparison[];
  examTips: string[];
  commonMistakes: Mistake[];
  checklist: ChecklistItem[];
}

interface MindNode {
  id: string;
  label: string;
  level: number;
  description?: string;
}

interface MindEdge {
  id: string;
  source: string;
  target: string;
}

interface MindMap {
  id: string;
  title: string;
  nodes: MindNode[];
  edges: MindEdge[];
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
  explanation?: string | null;
}

interface QuestionExplanation {
  id: string;
  concept: string;
  correctReason: string;
  sectionId?: string | null;
}

interface Question {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  options: QuestionOption[];
  explanation?: QuestionExplanation | null;
}

interface LessonViewerProps {
  lesson: {
    id: string;
    title: string;
    durationMinutes: number;
    unit: {
      id: string;
      title: string;
      subject: {
        id: string;
        name: string;
        color?: string | null;
      };
      lessons: { id: string; title: string; order: number }[];
    };
    content?: LessonContent | null;
    summary?: LessonSummary | null;
    mindMap?: MindMap | null;
    questions: { question: Question }[];
  };
  initialIsBookmarked: boolean;
  initialIsCompleted: boolean;
  userId?: string | null;
}

export function LessonViewer({
  lesson,
  initialIsBookmarked,
  initialIsCompleted,
  userId,
}: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState<
    "content" | "summary" | "mindmap" | "questions"
  >("content");
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Interactive Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    (lesson.summary?.checklist as ChecklistItem[]) || []
  );

  // Mind map state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isOutlineMode, setIsOutlineMode] = useState(false);
  const [selectedMindNode, setSelectedMindNode] = useState<string | null>(null);

  // Practice questions state
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<
      string,
      {
        selectedOptionId: string;
        revealed: boolean;
        isCorrect: boolean;
      }
    >
  >({});

  // Siblings navigation
  const siblingLessons = lesson.unit.lessons;
  const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < siblingLessons.length - 1
      ? siblingLessons[currentIndex + 1]
      : null;

  // Audio simulation / Web Speech API
  useEffect(() => {
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
  }, [isPlayingAudio, playbackSpeed]);

  const toggleBookmark = async () => {
    if (!userId) {
      alert("يرجى تسجيل الدخول لحفظ الدرس في المفضلة");
      return;
    }
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
        body: JSON.stringify({ isCompleted: newStatus, progressPercent: 100 }),
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
    if (questionAnswers[questionId]?.revealed) return; // already answered

    try {
      const res = await fetch(`/api/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: optionId }),
      });
      const data = await res.json();
      setQuestionAnswers((prev) => ({
        ...prev,
        [questionId]: {
          selectedOptionId: optionId,
          revealed: true,
          isCorrect: !!data.isCorrect,
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
    <div className="space-y-6 text-right font-sans">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 border-b border-slate-200 dark:border-slate-800 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-2 sm:mb-3 flex-wrap">
            <Link
              href="/subjects"
              className="hover:text-[#6858EA] transition-colors"
            >
              المواد
            </Link>
            <span>/</span>
            <Link
              href={`/subjects/${lesson.unit.subject.id}`}
              className="hover:text-[#6858EA] transition-colors"
            >
              {lesson.unit.subject.name}
            </Link>
            <span>/</span>
            <span className="text-[#14243D] dark:text-white">
              {lesson.unit.title}
            </span>
          </div>

          <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-[#14243D] dark:text-white leading-tight flex items-center gap-2.5">
            <span>{lesson.title}</span>
          </h1>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] font-bold mt-2 sm:mt-3">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6858EA]" />
              <span>مدة الدرس: {lesson.durationMinutes} دقيقة</span>
            </span>
            <span>•</span>
            <span className="text-[#11B7B4]">
              {lesson.questions.length} أسئلة تدريبية
            </span>
          </div>
        </div>

        {/* Actions (Bookmark & Complete) */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={toggleBookmark}
            disabled={isTogglingBookmark}
            className={`h-10 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isBookmarked
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
            />
            <span>{isBookmarked ? "محفوظ" : "حفظ"}</span>
          </button>

          <button
            onClick={toggleComplete}
            disabled={isTogglingComplete}
            className={`h-10 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              isCompleted
                ? "bg-[#12A87E] text-white shadow-md shadow-[#12A87E]/20"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-[#12A87E]/10 hover:text-[#12A87E] text-[#14243D] dark:text-white"
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${isCompleted ? "fill-white/20" : ""}`}
            />
            <span>{isCompleted ? "تم الإنجاز ✓" : "تحديد كمكتمل"}</span>
          </button>
        </div>
      </div>

      {/* Smart Audio Companion Bar (الخلاصة الصوتية) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#6858EA]/10 via-[#11B7B4]/10 to-transparent border border-[#6858EA]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="w-10 h-10 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white flex items-center justify-center shadow-md shadow-[#6858EA]/25 transition-transform active:scale-95 shrink-0"
          >
            {isPlayingAudio ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current mr-0.5" />
            )}
          </button>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[#14243D] dark:text-white flex items-center gap-1.5">
              <span>الخلاصة الصوتية الذكية (بودكاست الدرس)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#11B7B4] text-white">
                جديد
              </span>
            </h4>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              استمع إلى ملخص مركز للدرس أثناء المشي أو الاسترخاء
            </p>
          </div>
        </div>

        {/* Progress Bar & Speed */}
        <div className="flex items-center gap-3 w-full sm:w-64">
          <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-[#6858EA] to-[#11B7B4] transition-all duration-300"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
          <button
            onClick={() => {
              const speeds: (1 | 1.5 | 2)[] = [1, 1.5, 2];
              const next =
                speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
              setPlaybackSpeed(next);
            }}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black text-[#14243D] dark:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* 4 Interactive Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none -mx-4 sm:mx-0 px-4 sm:px-0">
        <button
          onClick={() => setActiveTab("content")}
          className={`h-10 sm:h-11 px-3.5 sm:px-5 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
            activeTab === "content"
              ? "bg-[#6858EA] text-white shadow-md shadow-[#6858EA]/20"
              : "text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" weight="bold" />
          <span>الشرح</span>
        </button>

        <button
          onClick={() => setActiveTab("summary")}
          className={`h-10 sm:h-11 px-3.5 sm:px-5 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
            activeTab === "summary"
              ? "bg-[#FFBA55] text-[#14243D] shadow-md shadow-[#FFBA55]/20 font-black"
              : "text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Sparkle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" weight="fill" />
          <span>الزتونة</span>
        </button>

        <button
          onClick={() => setActiveTab("mindmap")}
          className={`h-10 sm:h-11 px-3.5 sm:px-5 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
            activeTab === "mindmap"
              ? "bg-[#11B7B4] text-white shadow-md shadow-[#11B7B4]/20"
              : "text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Graph className="w-3.5 h-3.5 sm:w-4 sm:h-4" weight="bold" />
          <span className="hidden sm:inline">خريطة المفاهيم</span>
          <span className="sm:hidden">المفاهيم</span>
        </button>

        <button
          onClick={() => setActiveTab("questions")}
          className={`h-10 sm:h-11 px-3.5 sm:px-5 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
            activeTab === "questions"
              ? "bg-[#14243D] dark:bg-white text-white dark:text-[#14243D] shadow-md"
              : "text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Question className="w-3.5 h-3.5 sm:w-4 sm:h-4" weight="bold" />
          <span>الأسئلة ({lesson.questions.length})</span>
        </button>
      </div>

      {/* TAB 1: CONTENT (الشرح) */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* Objectives Card */}
          {lesson.content?.objectives &&
            lesson.content.objectives.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-black uppercase text-[#6858EA] mb-3 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" weight="fill" />
                  <span>الأهداف التعليمية ومخرجات التعلم</span>
                </h3>
                <ul className="space-y-2">
                  {lesson.content.objectives.map((obj, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-[#14243D] dark:text-slate-200"
                    >
                      <div className="w-4 h-4 rounded-full bg-[#6858EA]/10 text-[#6858EA] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">
                        {i + 1}
                      </div>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Structured Rich Body */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="prose dark:prose-invert max-w-none text-[#14243D] dark:text-slate-200 leading-relaxed font-content space-y-4">
              {lesson.content?.body ? (
                lesson.content.body.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2
                        key={index}
                        className="text-lg sm:text-xl font-black text-[#14243D] dark:text-white pt-4 pb-2 border-b border-slate-100 dark:border-slate-800"
                      >
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h3
                        key={index}
                        className="text-base sm:text-lg font-black text-[#6858EA] pt-2"
                      >
                        {paragraph.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith("* ") || paragraph.startsWith("- ")) {
                    const items = paragraph.split("\n");
                    return (
                      <ul key={index} className="space-y-1.5 list-disc pr-5">
                        {items.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            className="text-xs sm:text-sm leading-relaxed"
                          >
                            {item.replace(/^[*|-]\s+/, "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (
                    paragraph.startsWith("```") ||
                    paragraph.includes("cout") ||
                    paragraph.includes("int ")
                  ) {
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto dir-ltr text-left"
                      >
                        <pre>{paragraph.replace(/```[a-z]*/g, "")}</pre>
                      </div>
                    );
                  }
                  return (
                    <p
                      key={index}
                      className="text-xs sm:text-sm leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  );
                })
              ) : (
                <p className="text-slate-500">محتوى الدرس قيد التحديث...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOLDEN SUMMARY (الزتونة) */}
      {activeTab === "summary" && (
        <div className="space-y-6 print-content">
          {lesson.summary ? (
            <>
              {/* Golden Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-500/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                    <Sparkle className="w-6 h-6" weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#14243D] dark:text-white">
                      الزتونة الذهبية — كبسولة الدرس المركزة
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      كل ما تحتاجه للمراجعة السريعة قبل الامتحان في دقائق معدودة
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#14243D] font-black text-xs flex items-center justify-center gap-2 shadow-sm shadow-amber-500/20 transition-transform active:scale-95 shrink-0"
                >
                  <ShareNetwork className="w-3.5 h-3.5" weight="bold" />
                  <span>طباعة الزتونة / حفظ PDF</span>
                </button>
              </div>

              {/* Key Concepts Grid */}
              {lesson.summary.keyConcepts &&
                lesson.summary.keyConcepts.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-[#6858EA] flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>أهم المفاهيم الأساسية</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(lesson.summary.keyConcepts as string[]).map(
                        (concept, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-[#6858EA]/5 border border-[#6858EA]/15 text-xs sm:text-sm font-bold text-[#14243D] dark:text-slate-200 flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#6858EA] text-white flex items-center justify-center text-[10px] shrink-0 font-black">
                              {idx + 1}
                            </span>
                            <span>{concept}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Definitions */}
              {lesson.summary.definitions &&
                (lesson.summary.definitions as Definition[]).length > 0 && (
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-[#11B7B4] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>المصطلحات والتعريفات الهامة</span>
                    </h3>
                    <div className="space-y-2.5">
                      {(lesson.summary.definitions as Definition[]).map(
                        (item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-baseline gap-2"
                          >
                            <span className="font-black text-xs sm:text-sm text-[#11B7B4] shrink-0 font-mono">
                              {item.term}
                            </span>
                            <span className="text-slate-300 hidden sm:inline">
                              :
                            </span>
                            <span className="text-xs sm:text-sm text-[#14243D] dark:text-slate-200 font-medium">
                              {item.meaning}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Formulas & Code Snippets */}
              {lesson.summary.formulas &&
                (lesson.summary.formulas as Formula[]).length > 0 && (
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-amber-500 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>القوانين، الأكواد، والصيغ المعيارية</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(lesson.summary.formulas as Formula[]).map(
                        (formula, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left dir-ltr"
                          >
                            <div className="text-[11px] font-bold text-amber-400 mb-2 font-sans dir-rtl text-right">
                              {formula.title}
                            </div>
                            <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                              <code>{formula.code}</code>
                            </pre>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Common Mistakes Alert */}
              {lesson.summary.commonMistakes &&
                (lesson.summary.commonMistakes as Mistake[]).length > 0 && (
                  <div className="p-6 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-4">
                    <h3 className="text-sm font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>احذر! أخطاء شائعة في الامتحانات</span>
                    </h3>
                    <div className="space-y-3">
                      {(lesson.summary.commonMistakes as Mistake[]).map(
                        (item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/40 space-y-2"
                          >
                            <div className="flex items-start gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                              <span className="shrink-0">❌ الخطأ:</span>
                              <span>{item.mistake}</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="shrink-0">✅ الصواب:</span>
                              <span>{item.correction}</span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Exam Tips */}
              {lesson.summary.examTips &&
                (lesson.summary.examTips as string[]).length > 0 && (
                  <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-4">
                    <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>نصائح ذهبية للامتحان</span>
                    </h3>
                    <ul className="space-y-2">
                      {(lesson.summary.examTips as string[]).map((tip, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-[#14243D] dark:text-slate-200"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Interactive Revision Checklist */}
              {checklist.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-[#14243D] dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6858EA]" />
                    <span>قائمة التحقق من الفهم (راجع بنفسك)</span>
                  </h3>
                  <div className="space-y-2">
                    {checklist.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleChecklistItem(idx)}
                        className={`w-full p-3.5 rounded-2xl border text-right flex items-center gap-3 transition-colors ${
                          item.completed
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                            item.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {item.completed && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            item.completed ? "line-through opacity-80" : ""
                          }`}
                        >
                          {item.task}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">
              الزتونة لهذا الدرس قيد الإعداد...
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MIND MAP (خريطة المفاهيم) */}
      {activeTab === "mindmap" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                طريقة العرض:
              </span>
              <button
                onClick={() => setIsOutlineMode(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  !isOutlineMode
                    ? "bg-[#11B7B4] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                شجرة بصرية
              </button>
              <button
                onClick={() => setIsOutlineMode(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  isOutlineMode
                    ? "bg-[#11B7B4] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                مخطط تفصيلي (Outline)
              </button>
            </div>

            {!isOutlineMode && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="تصغير"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-bold text-slate-500 w-10 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="px-2.5 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إعادة ضبط
                </button>
              </div>
            )}
          </div>

          {/* Interactive Mind Map Canvas */}
          {lesson.mindMap ? (
            !isOutlineMode ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 min-h-[420px] overflow-auto flex items-center justify-center">
                <div
                  className="flex flex-col items-center gap-6 transition-transform duration-200 origin-center max-w-full"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {/* Root Node */}
                  {(() => {
                    const nodes = lesson.mindMap.nodes as MindNode[];
                    const rootNode = nodes.find((n) => n.level === 0) || nodes[0];
                    const level1Nodes = nodes.filter((n) => n.level === 1);

                    return (
                      <>
                        {rootNode && (
                          <div
                            onClick={() => setSelectedMindNode(rootNode.id)}
                            className="p-4 px-6 rounded-2xl bg-gradient-to-r from-[#6858EA] to-[#11B7B4] text-white shadow-xl shadow-[#6858EA]/25 text-center cursor-pointer hover:scale-105 transition-all"
                          >
                            <h4 className="text-base font-black">
                              {rootNode.label}
                            </h4>
                            {rootNode.description && (
                              <p className="text-[11px] opacity-90 mt-1">
                                {rootNode.description}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Connector line */}
                        <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />

                        {/* Level 1 branches */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                          {level1Nodes.map((l1) => {
                            // Find level 2 children
                            const edgeTargets = (
                              lesson.mindMap!.edges as MindEdge[]
                            )
                              .filter((e) => e.source === l1.id)
                              .map((e) => e.target);
                            const l2Children = nodes.filter((n) =>
                              edgeTargets.includes(n.id)
                            );

                            return (
                              <div
                                key={l1.id}
                                className="flex flex-col items-center gap-3"
                              >
                                <div
                                  onClick={() => setSelectedMindNode(l1.id)}
                                  className={`w-full p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                                    selectedMindNode === l1.id
                                      ? "bg-[#6858EA]/10 border-[#6858EA] shadow-md shadow-[#6858EA]/20"
                                      : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-[#6858EA]/50"
                                  }`}
                                >
                                  <h5 className="text-xs sm:text-sm font-black text-[#14243D] dark:text-white">
                                    {l1.label}
                                  </h5>
                                  {l1.description && (
                                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                                      {l1.description}
                                    </p>
                                  )}
                                </div>

                                {l2Children.length > 0 && (
                                  <>
                                    <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-700" />
                                    <div className="w-full space-y-2">
                                      {l2Children.map((l2) => (
                                        <div
                                          key={l2.id}
                                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center shadow-xs text-xs font-bold text-[#14243D] dark:text-slate-200"
                                        >
                                          {l2.label}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              /* Outline View */
              <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-3">
                {(lesson.mindMap.nodes as MindNode[]).map((n) => (
                  <div
                    key={n.id}
                    style={{ paddingRight: `${n.level * 24}px` }}
                    className="flex items-start gap-2.5"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        n.level === 0
                          ? "bg-[#6858EA]"
                          : n.level === 1
                          ? "bg-[#11B7B4]"
                          : "bg-amber-400"
                      }`}
                    />
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-black ${
                          n.level === 0
                            ? "text-[#6858EA] text-base"
                            : "text-[#14243D] dark:text-white"
                        }`}
                      >
                        {n.label}
                      </h4>
                      {n.description && (
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                          {n.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="p-8 text-center text-slate-500">
              خريطة المفاهيم قيد الإعداد...
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CHECKPOINT QUESTIONS (الأسئلة والتدريب) */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#14243D] dark:text-white">
                أسئلة التدريب والتحقق من الفهم
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                اختر الإجابة لتظهر لك النتيجة والشرح التفصيلي فوراً
              </p>
            </div>
            <Link
              href={`/exams/builder?subjectId=${lesson.unit.subject.id}&unitId=${lesson.unit.id}`}
              className="h-9 px-4 rounded-xl bg-[#6858EA] text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-[#6858EA]/20"
            >
              <span>امتحان شامل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-5">
            {lesson.questions.map(({ question }, qIndex) => {
              const state = questionAnswers[question.id];

              return (
                <div
                  key={question.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-xs font-black text-[#6858EA]">
                      السؤال رقم {qIndex + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {question.difficulty === "EASY"
                        ? "سهل"
                        : question.difficulty === "MEDIUM"
                        ? "متوسط"
                        : "متقدم"}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-[#14243D] dark:text-white leading-relaxed">
                    {question.statement}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {question.options.map((opt) => {
                      const isSelected =
                        state?.selectedOptionId === opt.id;
                      const isRevealed = state?.revealed;
                      let btnStyle =
                        "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200 hover:border-[#6858EA]/50";

                      if (isRevealed) {
                        if (opt.isCorrect) {
                          btnStyle =
                            "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-black";
                        } else if (isSelected && !opt.isCorrect) {
                          btnStyle =
                            "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300 font-black";
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={isRevealed}
                          onClick={() =>
                            handleSelectOption(question.id, opt.id)
                          }
                          className={`w-full p-4 rounded-2xl border text-right text-xs sm:text-sm font-bold flex items-center justify-between gap-3 transition-all ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-black shrink-0">
                              {opt.order}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {isRevealed && (
                            <div>
                              {opt.isCorrect ? (
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1">
                                  <Check className="w-4 h-4" />
                                  <span>الإجابة الصحيحة</span>
                                </span>
                              ) : isSelected ? (
                                <span className="text-red-600 dark:text-red-400 text-xs font-black">
                                  إجابتك (غير صحيحة)
                                </span>
                              ) : null}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation Reveal */}
                  {state?.revealed && question.explanation && (
                    <div className="p-4 rounded-2xl bg-[#6858EA]/5 border border-[#6858EA]/20 space-y-2 mt-3 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-xs font-black text-[#6858EA]">
                        <Lightbulb className="w-4 h-4" />
                        <span>
                          المفهوم: {question.explanation.concept}
                        </span>
                      </div>
                      <p className="text-xs text-[#14243D] dark:text-slate-200 leading-relaxed font-medium">
                        {question.explanation.correctReason}
                      </p>

                      {/* Per-option explanations if available */}
                      <div className="pt-2 border-t border-[#6858EA]/15 space-y-1.5">
                        <span className="text-[11px] font-black text-[#64748B] dark:text-[#94A3B8] block">
                          تفسير الخيارات:
                        </span>
                        {question.options.map((opt) => (
                          <div
                            key={opt.id}
                            className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-start gap-1.5"
                          >
                            <span className="font-bold shrink-0">
                              • {opt.text}:
                            </span>
                            <span>
                              {opt.explanation ||
                                (opt.isCorrect
                                  ? "صحيح"
                                  : "غير مطابق لمعايير السؤال")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sibling Lessons Navigation Footer */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 mt-8">
        {prevLesson ? (
          <Link
            href={`/lessons/${prevLesson.id}`}
            className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#64748B] dark:text-[#94A3B8] hover:text-[#6858EA] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <div className="text-right">
              <span className="block text-[10px] text-slate-400">
                الدرس السابق
              </span>
              <span className="truncate max-w-[150px] sm:max-w-xs block">
                {prevLesson.title}
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#6858EA] hover:text-[#5444D8] transition-colors"
          >
            <div className="text-left">
              <span className="block text-[10px] text-[#6858EA]/70">
                الدرس التالي
              </span>
              <span className="truncate max-w-[150px] sm:max-w-xs block">
                {nextLesson.title}
              </span>
            </div>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href={`/subjects/${lesson.unit.subject.id}`}
            className="h-10 px-4 rounded-xl bg-[#6858EA] text-white text-xs font-black flex items-center gap-1.5"
          >
            <span>تم إنهاء الوحدة! عودة للمادة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
