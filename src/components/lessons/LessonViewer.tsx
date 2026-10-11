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
  CaretRight,
  CaretLeft,
  ArrowLeft,
  Check,
  Lightbulb,
  ShareNetwork,
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
    <div className="space-y-6 text-right font-ui">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-slate-700 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-slate-400 mb-2 flex-wrap">
            <Link
              href="/subjects"
              className="hover:text-[#4F46E5] transition-colors"
            >
              المواد
            </Link>
            <span>/</span>
            <Link
              href={`/subjects/${lesson.unit.subject.id}`}
              className="hover:text-[#4F46E5] transition-colors"
            >
              {lesson.unit.subject.name}
            </Link>
            <span>/</span>
            <span className="text-[#0F172A] dark:text-white">
              {lesson.unit.title}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white leading-tight flex items-center gap-2.5">
            <span>{lesson.title}</span>
          </h1>

          <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-slate-400 font-medium mt-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#4F46E5]" weight="bold" />
              <span>مدة الدرس: {lesson.durationMinutes} دقيقة</span>
            </span>
            <span>•</span>
            <span className="text-[#059669]">
              {lesson.questions.length} أسئلة تدريبية
            </span>
          </div>
        </div>

        {/* Actions (Bookmark & Complete) */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={toggleBookmark}
            disabled={isTogglingBookmark}
            className={`h-10 px-3.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isBookmarked
                ? "bg-[#D97706]/10 border-[#D97706]/30 text-[#D97706]"
                : "border-[#E2E8F0] dark:border-slate-700 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B] dark:text-slate-400"
            }`}
          >
            <BookmarkSimple
              className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
              weight={isBookmarked ? "fill" : "bold"}
            />
            <span>{isBookmarked ? "محفوظ" : "حفظ"}</span>
          </button>

          <button
            onClick={toggleComplete}
            disabled={isTogglingComplete}
            className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              isCompleted
                ? "bg-[#059669] text-white"
                : "bg-[#F8FAFC] dark:bg-slate-800 hover:bg-[#059669]/10 hover:text-[#059669] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-slate-700"
            }`}
          >
            <CheckCircle
              className={`w-4 h-4 ${isCompleted ? "fill-white/20" : ""}`}
              weight={isCompleted ? "fill" : "bold"}
            />
            <span>{isCompleted ? "تم الإنجاز ✓" : "تحديد كمكتمل"}</span>
          </button>
        </div>
      </div>

      {/* Smart Audio Companion Bar (الخلاصة الصوتية) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="w-9 h-9 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-2xs"
          >
            {isPlayingAudio ? (
              <Pause className="w-4 h-4 fill-current" weight="fill" />
            ) : (
              <Play className="w-4 h-4 fill-current mr-0.5" weight="fill" />
            )}
          </button>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
              <span>الخلاصة الصوتية الذكية (بودكاست الدرس)</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500 text-white">
                LIVE
              </span>
            </h4>
            <p className="text-[11px] text-[#475569] dark:text-slate-400">
              استمع إلى ملخص مركز للدرس أثناء المشي أو الاسترخاء
            </p>
          </div>
        </div>

        {/* Progress Bar & Speed */}
        <div className="flex items-center gap-3 w-full sm:w-64">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-[#4F46E5] transition-all duration-300"
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
            className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-[#0F172A] dark:text-white bg-slate-50 dark:bg-slate-800 hover:border-slate-300 transition-colors"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* 4 Interactive Tabs (Vercel / Replit Segmented Tabs) */}
      <div className="p-1 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: "content", label: "الشرح والتفكيك", icon: BookOpen },
          { id: "summary", label: "الزتونة الذهبية", icon: Sparkle, badge: "مركز" },
          { id: "mindmap", label: "خريطة المفاهيم", icon: Graph },
          { id: "questions", label: `الأسئلة (${lesson.questions.length})`, icon: Question },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[110px] h-9.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                isSelected
                  ? "bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white shadow-2xs border border-slate-200/80 dark:border-slate-700/80 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-medium"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#4F46E5]" : ""}`} weight={isSelected ? "fill" : "bold"} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#D97706] text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CONTENT (الشرح) */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* Objectives Card */}
          {lesson.content?.objectives &&
            lesson.content.objectives.length > 0 && (
              <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700">
                <h3 className="text-xs font-bold uppercase text-[#4F46E5] mb-3 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" weight="fill" />
                  <span>الأهداف التعليمية ومخرجات التعلم</span>
                </h3>
                <ul className="space-y-2">
                  {lesson.content.objectives.map((obj, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-[#0F172A] dark:text-slate-200 font-content"
                    >
                      <div className="w-4 h-4 rounded bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                        {i + 1}
                      </div>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Structured Rich Body */}
          <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700">
            <div className="prose dark:prose-invert max-w-none text-[#0F172A] dark:text-slate-200 leading-relaxed font-content space-y-4">
              {lesson.content?.body ? (
                lesson.content.body.split("\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2
                        key={index}
                        className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white pt-4 pb-2 border-b border-[#E2E8F0] dark:border-slate-700"
                      >
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h3
                        key={index}
                        className="text-base sm:text-lg font-bold text-[#4F46E5] pt-2"
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
                        className="p-4 rounded-lg bg-[#0F172A] text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto dir-ltr text-left"
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
                <p className="text-[#64748B]">محتوى الدرس قيد التحديث...</p>
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
              <div className="p-6 rounded-xl bg-[#D97706]/10 border border-[#D97706]/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#D97706] text-white flex items-center justify-center shrink-0">
                    <Sparkle className="w-6 h-6" weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                      الزتونة الذهبية — كبسولة الدرس المركزة
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      كل ما تحتاجه للمراجعة السريعة قبل الامتحان في دقائق معدودة
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-10 px-4 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0"
                >
                  <ShareNetwork className="w-3.5 h-3.5" weight="bold" />
                  <span>طباعة الزتونة / حفظ PDF</span>
                </button>
              </div>

              {/* Key Concepts Grid */}
              {lesson.summary.keyConcepts &&
                lesson.summary.keyConcepts.length > 0 && (
                  <div className="p-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-[#4F46E5] flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" weight="fill" />
                      <span>أهم المفاهيم الأساسية</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(lesson.summary.keyConcepts as string[]).map(
                        (concept, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-lg bg-[#4F46E5]/5 border border-[#4F46E5]/15 text-xs sm:text-sm font-medium text-[#0F172A] dark:text-slate-200 flex items-start gap-2.5 font-content"
                          >
                            <span className="w-5 h-5 rounded bg-[#4F46E5] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
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
                  <div className="p-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-[#059669] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" weight="bold" />
                      <span>المصطلحات والتعريفات الهامة</span>
                    </h3>
                    <div className="space-y-2.5">
                      {(lesson.summary.definitions as Definition[]).map(
                        (item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 flex flex-col sm:flex-row sm:items-baseline gap-2 font-content"
                          >
                            <span className="font-bold text-xs sm:text-sm text-[#059669] shrink-0 font-mono">
                              {item.term}
                            </span>
                            <span className="text-[#E2E8F0] dark:text-slate-700 hidden sm:inline">
                              :
                            </span>
                            <span className="text-xs sm:text-sm text-[#0F172A] dark:text-slate-200 font-medium">
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
                  <div className="p-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-[#4F46E5] flex items-center gap-2">
                      <span className="font-mono text-base">#</span>
                      <span>القوانين والمعادلات الأساسية</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(lesson.summary.formulas as Formula[]).map(
                        (formula, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg bg-[#0F172A] text-white space-y-2 dir-ltr text-left"
                          >
                            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                              {formula.title}
                            </span>
                            <code className="text-sm font-mono text-emerald-400 block">
                              {formula.code}
                            </code>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Comparisons Table */}
              {lesson.summary.comparisons &&
                (lesson.summary.comparisons as Comparison[]).length > 0 && (
                  <div className="p-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2">
                      <span className="text-base">⇄</span>
                      <span>المقارنات الهامة</span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm text-right font-content">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] dark:border-slate-700">
                            <th className="py-2 px-3 font-bold text-[#64748B]">وجه المقارنة</th>
                            <th className="py-2 px-3 font-bold text-[#4F46E5]">العنصر الأول</th>
                            <th className="py-2 px-3 font-bold text-[#059669]">العنصر الثاني</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(lesson.summary.comparisons as Comparison[]).map(
                            (comp, idx) => (
                              <tr key={idx} className="border-b border-[#E2E8F0]/50 dark:border-slate-700/50 last:border-0">
                                <td className="py-2.5 px-3 font-bold text-[#0F172A] dark:text-white">{comp.aspect}</td>
                                <td className="py-2.5 px-3 text-[#64748B] dark:text-slate-300">{comp.first}</td>
                                <td className="py-2.5 px-3 text-[#64748B] dark:text-slate-300">{comp.second}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Exam Tips */}
              {lesson.summary.examTips &&
                lesson.summary.examTips.length > 0 && (
                  <div className="p-6 rounded-xl bg-[#D97706]/5 border border-[#D97706]/20 space-y-4">
                    <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2">
                      <span className="text-base">⚠️</span>
                      <span>تنبيهات وتكات امتحانية هامة</span>
                    </h3>
                    <ul className="space-y-2">
                      {lesson.summary.examTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-[#0F172A] dark:text-slate-200 font-content">
                          <span className="text-[#D97706] shrink-0 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Common Mistakes */}
              {lesson.summary.commonMistakes &&
                (lesson.summary.commonMistakes as Mistake[]).length > 0 && (
                  <div className="p-6 rounded-xl bg-[#DC2626]/5 border border-[#DC2626]/20 space-y-4">
                    <h3 className="text-sm font-bold text-[#DC2626] flex items-center gap-2">
                      <span className="text-base">✗</span>
                      <span>أخطاء شائعة يجب تجنبها</span>
                    </h3>
                    <div className="space-y-2.5">
                      {(lesson.summary.commonMistakes as Mistake[]).map(
                        (mistake, idx) => (
                          <div key={idx} className="p-3.5 rounded-lg bg-white dark:bg-[#1E293B] border border-[#DC2626]/15 font-content">
                            <div className="flex items-start gap-2">
                              <span className="text-[#DC2626] font-bold text-xs shrink-0 mt-0.5">خطأ:</span>
                              <span className="text-xs text-[#DC2626] line-through">{mistake.mistake}</span>
                            </div>
                            <div className="flex items-start gap-2 mt-1.5">
                              <span className="text-[#059669] font-bold text-xs shrink-0 mt-0.5">صح:</span>
                              <span className="text-xs text-[#059669] font-medium">{mistake.correction}</span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Interactive Checklist */}
              {checklist.length > 0 && (
                <div className="p-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 space-y-4">
                  <h3 className="text-sm font-bold text-[#059669] flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" weight="bold" />
                    <span>قائمة مراجعة إتقان الدرس</span>
                  </h3>
                  <div className="space-y-2">
                    {checklist.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleChecklistItem(idx)}
                        className={`w-full p-3 rounded-lg border text-right flex items-center gap-3 transition-colors text-xs sm:text-sm font-medium font-content ${
                          item.completed
                            ? "bg-[#059669]/5 border-[#059669]/30 text-[#059669]"
                            : "bg-[#F8FAFC] dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-slate-300 hover:border-[#059669]/50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            item.completed
                              ? "bg-[#059669] border-[#059669] text-white"
                              : "border-[#E2E8F0] dark:border-slate-600"
                          }`}
                        >
                          {item.completed && <Check className="w-3 h-3" weight="bold" />}
                        </div>
                        <span className={item.completed ? "line-through opacity-60" : ""}>
                          {item.task}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-[#64748B] rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700">
              الزتونة الذهبية قيد الإعداد...
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MIND MAP (خريطة المفاهيم) */}
      {activeTab === "mindmap" && (
        <div className="space-y-6">
          {lesson.mindMap ? (
            <div className="rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
              {/* Toolbar */}
              <div className="p-3 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                    className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-sm font-bold">−</span>
                  </button>
                  <span className="text-xs font-bold text-[#64748B] min-w-[3rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                    className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-sm font-bold">+</span>
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="h-8 px-3 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
                  >
                    إعادة ضبط
                  </button>
                </div>

                <button
                  onClick={() => setIsOutlineMode(!isOutlineMode)}
                  className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isOutlineMode
                      ? "bg-[#4F46E5] text-white"
                      : "border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{isOutlineMode ? "عرض الخريطة" : "عرض نصي"}</span>
                </button>
              </div>

              {/* Map Canvas or Outline */}
              <div className="p-6 min-h-[400px] overflow-auto">
                {!isOutlineMode ? (
                  <div
                    className="transition-transform duration-200 origin-top-right"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    {/* Hierarchical Tree Layout */}
                    <div className="flex flex-col items-center gap-6 min-w-[600px]">
                      {/* Root Node */}
                      {(() => {
                        const mindNodes = (lesson.mindMap?.nodes as MindNode[]) || [];
                        const rootNodes = mindNodes.filter((n) => n.level === 0);
                        const l1Children = mindNodes.filter((n) => n.level === 1);
                        const l2Children = mindNodes.filter((n) => n.level === 2);
                        return rootNodes.map((root) => {
                          return (
                            <div key={root.id} className="flex flex-col items-center gap-4 w-full">
                              <div
                                onClick={() => setSelectedMindNode(selectedMindNode === root.id ? null : root.id)}
                                className="px-6 py-3 rounded-lg bg-[#4F46E5] text-white text-sm font-bold cursor-pointer hover:bg-[#4338CA] transition-colors shadow-sm"
                              >
                                {root.label}
                              </div>

                              {l1Children.length > 0 && (
                                <>
                                  <div className="w-0.5 h-6 bg-[#E2E8F0] dark:bg-slate-700" />
                                  <div className="flex flex-wrap justify-center gap-4">
                                    {l1Children.map((l1) => {
                                      return (
                                        <div key={l1.id} className="flex flex-col items-center gap-3">
                                          <div
                                            onClick={() => setSelectedMindNode(selectedMindNode === l1.id ? null : l1.id)}
                                            className="px-4 py-2.5 rounded-lg bg-[#059669] text-white text-xs font-bold cursor-pointer hover:bg-[#047857] transition-colors text-center min-w-[120px]"
                                          >
                                            {l1.label}
                                          </div>

                                  {l2Children.length > 0 && (
                                    <>
                                      <div className="w-0.5 h-4 bg-[#E2E8F0] dark:bg-slate-700" />
                                      <div className="w-full space-y-2">
                                        {l2Children.map((l2) => (
                                          <div
                                            key={l2.id}
                                            className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-center text-xs font-medium text-[#0F172A] dark:text-slate-200"
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
                      )}
                    </div>
                  );
                });
              })()}
                </div>
              </div>
            ) : (
              /* Outline View */
              <div className="p-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 space-y-3">
                {(lesson.mindMap.nodes as MindNode[]).map((n) => (
                  <div
                    key={n.id}
                    style={{ paddingRight: `${n.level * 24}px` }}
                    className="flex items-start gap-2.5"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        n.level === 0
                          ? "bg-[#4F46E5]"
                          : n.level === 1
                          ? "bg-[#059669]"
                          : "bg-[#D97706]"
                      }`}
                    />
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          n.level === 0
                            ? "text-[#4F46E5] text-base"
                            : "text-[#0F172A] dark:text-white"
                        }`}
                      >
                        {n.label}
                      </h4>
                      {n.description && (
                        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 font-content">
                          {n.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-[#64748B] rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700">
            خريطة المفاهيم قيد الإعداد...
          </div>
        )}
      </div>
    )}

      {/* TAB 4: CHECKPOINT QUESTIONS (الأسئلة والتدريب) */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                أسئلة التدريب والتحقق من الفهم
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-content">
                اختر الإجابة لتظهر لك النتيجة والشرح التفصيلي فوراً
              </p>
            </div>
            <Link
              href={`/exams/builder?subjectId=${lesson.unit.subject.id}&unitId=${lesson.unit.id}`}
              className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>امتحان شامل</span>
              <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
            </Link>
          </div>

          <div className="space-y-5">
            {lesson.questions.map(({ question }, qIndex) => {
              const state = questionAnswers[question.id];

              return (
                <div
                  key={question.id}
                  className="p-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-slate-700 pb-3">
                    <span className="text-xs font-bold text-[#4F46E5]">
                      السؤال رقم {qIndex + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#F8FAFC] dark:bg-slate-800 text-[#64748B] dark:text-slate-300">
                      {question.difficulty === "EASY"
                        ? "سهل"
                        : question.difficulty === "MEDIUM"
                        ? "متوسط"
                        : "متقدم"}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed font-content">
                    {question.statement}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {question.options.map((opt) => {
                      const isSelected =
                        state?.selectedOptionId === opt.id;
                      const isRevealed = state?.revealed;
                      let btnStyle =
                        "bg-[#F8FAFC] dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 hover:border-[#4F46E5]/50";

                      if (isRevealed) {
                        if (opt.isCorrect) {
                          btnStyle =
                            "bg-[#059669]/10 border-[#059669]/30 text-[#059669] font-bold";
                        } else if (isSelected && !opt.isCorrect) {
                          btnStyle =
                            "bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626] font-bold";
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
                          className={`w-full p-4 rounded-lg border text-right text-xs sm:text-sm font-medium flex items-center justify-between gap-3 transition-colors font-content ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-[#E2E8F0] dark:bg-slate-800 text-[#64748B] dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                              {opt.order}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {isRevealed && (
                            <div>
                              {opt.isCorrect ? (
                                <span className="text-[#059669] text-xs font-bold flex items-center gap-1">
                                  <Check className="w-4 h-4" weight="bold" />
                                  <span>الإجابة الصحيحة</span>
                                </span>
                              ) : isSelected ? (
                                <span className="text-[#DC2626] text-xs font-bold">
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
                    <div className="p-4 rounded-lg bg-[#4F46E5]/5 border border-[#4F46E5]/15 space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#4F46E5]">
                        <Lightbulb className="w-4 h-4" weight="fill" />
                        <span>
                          المفهوم: {question.explanation.concept}
                        </span>
                      </div>
                      <p className="text-xs text-[#0F172A] dark:text-slate-200 leading-relaxed font-content">
                        {question.explanation.correctReason}
                      </p>

                      {/* Per-option explanations if available */}
                      <div className="pt-2 border-t border-[#4F46E5]/15 space-y-1.5">
                        <span className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 block">
                          تفسير الخيارات:
                        </span>
                        {question.options.map((opt) => (
                          <div
                            key={opt.id}
                            className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-start gap-1.5 font-content"
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
      <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between gap-4 mt-8">
        {prevLesson ? (
          <Link
            href={`/lessons/${prevLesson.id}`}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#64748B] dark:text-slate-400 hover:text-[#4F46E5] transition-colors"
          >
            <CaretRight className="w-4 h-4" weight="bold" />
            <div className="text-right">
              <span className="block text-[10px] text-[#64748B] dark:text-slate-500">
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
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
          >
            <div className="text-left">
              <span className="block text-[10px] text-[#4F46E5]/70">
                الدرس التالي
              </span>
              <span className="truncate max-w-[150px] sm:max-w-xs block">
                {nextLesson.title}
              </span>
            </div>
            <CaretLeft className="w-4 h-4" weight="bold" />
          </Link>
        ) : (
          <Link
            href={`/subjects/${lesson.unit.subject.id}`}
            className="h-10 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>تم إنهاء الوحدة! عودة للمادة</span>
            <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
          </Link>
        )}
      </div>
    </div>
  );
}