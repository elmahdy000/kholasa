"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
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
  WarningCircle,
  XCircle,
  ArrowsOut,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsCounterClockwise,
  Image as ImageIcon,
  X,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface LessonContent {
  id: string;
  body: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
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
  images?: string[];
  description?: string | null;
  nodes: MindNode[];
  edges: MindEdge[];
}

interface QuestionOption {
  id: string;
  text: string;
  order: number;
}

interface QuestionExplanation {
  id: string;
  concept: string;
  correctReason: string;
  sectionId?: string | null;
}

interface RevealedOption {
  id: string;
  isCorrect?: boolean;
  explanation?: string | null;
}

interface RevealedQuestion {
  isCorrect?: boolean;
  correctOptionId?: string;
  explanation?: QuestionExplanation | null;
  options?: RevealedOption[];
}

interface Question {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  options: QuestionOption[];
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
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  // Interactive Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    (lesson.summary?.checklist as ChecklistItem[]) || []
  );

  // Mind map state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isOutlineMode, setIsOutlineMode] = useState(false);
  const [selectedMindNode, setSelectedMindNode] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  // Practice questions state
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<
      string,
      {
        selectedOptionId: string;
        revealed: boolean;
        isCorrect: boolean;
        reveal?: RevealedQuestion;
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
        body: JSON.stringify({ isCompleted: newStatus, progressPercent: newStatus ? 100 : 0 }),
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
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] mb-2 flex-wrap">
            <Link
              href="/subjects"
              className="hover:text-[#800020] transition-colors"
            >
              المواد
            </Link>
            <span>/</span>
            <Link
              href={`/subjects/${lesson.unit.subject.id}`}
              className="hover:text-[#800020] transition-colors"
            >
              {lesson.unit.subject.name}
            </Link>
            <span>/</span>
            <span className="text-[#0F172A] dark:text-white">
              {lesson.unit.title}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white leading-tight flex items-center gap-3">
            <span>{lesson.title}</span>
          </h1>

          <div className="flex items-center gap-3 text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-2">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#800020]" weight="bold" />
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
            className={`h-11 px-4 rounded-lg border text-[13px] font-bold flex items-center gap-2 transition-colors ${
              isBookmarked
                ? "bg-[#D97706]/10 border-[#D97706]/30 text-[#D97706]"
                : "border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#64748B] dark:text-[#94A3B8]"
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
            className={`h-11 px-4 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-colors ${
              isCompleted
                ? "bg-[#059669] text-white"
                : "bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#059669]/10 hover:text-[#059669] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155]"
            }`}
          >
            <CheckCircle
              className={`w-4 h-4 ${isCompleted ? "fill-white/20" : ""}`}
              weight={isCompleted ? "fill" : "bold"}
            />
            <span>{isCompleted ? "تم إكمال الدرس" : "تحديد كمكتمل"}</span>
          </button>
        </div>
      </div>

      {/* Smart Audio Companion Bar (الخلاصة الصوتية) */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="w-11 h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white flex items-center justify-center transition-transform active:opacity-80 shrink-0 "
          >
            {isPlayingAudio ? (
              <Pause className="w-4 h-4 fill-current" weight="fill" />
            ) : (
              <Play className="w-4 h-4 fill-current mr-1" weight="fill" />
            )}
          </button>
          <div>
            <h4 className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <span>الخلاصة الصوتية الذكية (بودكاست الدرس)</span>
              <span className="px-2 py-1 rounded text-[13px] font-mono font-bold bg-[#059669] text-white">
                LIVE
              </span>
            </h4>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              استمع إلى ملخص مركز للدرس أثناء المشي أو الاسترخاء
            </p>
          </div>
        </div>

        {/* Progress Bar & Speed */}
        <div className="flex items-center gap-3 w-full sm:w-64">
          <div className="flex-1 h-1.5 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden">
            <div
              className="h-full bg-[#800020] transition-all duration-300"
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
            className="px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#334155] font-mono text-[13px] font-bold text-[#0F172A] dark:text-white bg-[#F8FAFC] dark:bg-[#1E293B] hover:border-[#E2E8F0] transition-colors"
          >
            {playbackSpeed}x
          </button>
        </div>

        {/* Real Audio Player Tag */}
        {lesson.content?.audioUrl && (
          <audio
            ref={audioElemRef}
            src={lesson.content.audioUrl}
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              if (el.duration) {
                setAudioProgress((el.currentTime / el.duration) * 100);
              }
            }}
            onEnded={() => {
              setIsPlayingAudio(false);
              setAudioProgress(0);
            }}
            className="hidden"
          />
        )}
      </div>

      {/* 4 Interactive Tabs (Vercel / Replit Segmented Tabs) */}
      <div className="p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/80 border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: "content", label: "الشرح والتفكيك", icon: BookOpen },
          { id: "summary", label: "كبسولة الزتونة", icon: BookmarkSimple, badge: "مركز" },
          { id: "mindmap", label: "خريطة المفاهيم", icon: Graph },
          { id: "questions", label: `الأسئلة (${lesson.questions.length})`, icon: Question },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[110px] h-11 px-3 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
                isSelected
                  ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white  border border-[#E2E8F0]/80 dark:border-[#334155]/80 font-bold"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white font-medium"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#800020]" : ""}`} weight={isSelected ? "fill" : "bold"} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-2 py-0.2 rounded text-[13px] font-bold bg-[#D97706] text-white">
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
          {/* Video Player if videoUrl exists */}
          {lesson.content?.videoUrl && (
            <div className="rounded-xl overflow-hidden bg-black border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
              {getEmbedUrl(lesson.content.videoUrl) ? (
                <div className="aspect-video w-full">
                  <iframe
                    src={getEmbedUrl(lesson.content.videoUrl)!}
                    title={lesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="p-4 text-center">
                  <video
                    src={lesson.content.videoUrl}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full max-h-[460px] rounded-xl mx-auto"
                  />
                </div>
              )}
            </div>
          )}

          {/* Objectives Card */}
          {lesson.content?.objectives &&
            lesson.content.objectives.length > 0 && (
              <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
                <h3 className="text-[13px] font-bold uppercase text-[#800020] mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" weight="fill" />
                  <span>الأهداف التعليمية ومخرجات التعلم</span>
                </h3>
                <ul className="space-y-2">
                  {lesson.content.objectives.map((obj, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[13px] sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] font-content"
                    >
                      <div className="w-4 h-4 rounded bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0 mt-1 text-[13px] font-bold">
                        {i + 1}
                      </div>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Structured Rich Body */}
          <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
            <div className="prose dark:prose-invert max-w-none text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-content space-y-4">
              {lesson.content?.body ? (
                lesson.content.body.split("\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2
                        key={index}
                        className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white pt-4 pb-2 border-b border-[#E2E8F0] dark:border-[#334155]"
                      >
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h3
                        key={index}
                        className="text-base sm:text-lg font-bold text-[#800020] pt-2"
                      >
                        {paragraph.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith("* ") || paragraph.startsWith("- ")) {
                    const items = paragraph.split("\n");
                    return (
                      <ul key={index} className="space-y-2 list-disc pr-5">
                        {items.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            className="text-[13px] sm:text-sm leading-relaxed"
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
                        className="p-4 rounded-lg bg-[#0F172A] text-[#059669] font-mono text-[13px] sm:text-sm overflow-x-auto dir-ltr text-left"
                      >
                        <pre>{paragraph.replace(/```[a-z]*/g, "")}</pre>
                      </div>
                    );
                  }
                  return (
                    <p
                      key={index}
                      className="text-[13px] sm:text-sm leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  );
                })
              ) : (
                <p className="text-[#64748B] dark:text-[#94A3B8]">محتوى الدرس قيد التحديث...</p>
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
                    <Lightbulb className="w-6 h-6" weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                      كبسولة الزتونة — ملخص الدرس المركز
                    </h3>
                    <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                      كل ما تحتاجه للمراجعة السريعة قبل الامتحان في دقائق معدودة
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Concepts Grid */}
              {lesson.summary.keyConcepts &&
                lesson.summary.keyConcepts.length > 0 && (
                  <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                    <h3 className="text-sm font-bold text-[#800020] flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" weight="fill" />
                      <span>أهم المفاهيم الأساسية</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(lesson.summary.keyConcepts as string[]).map(
                        (concept, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg bg-[#800020]/5 border border-[#800020]/15 text-[13px] sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-start gap-3 font-content"
                          >
                            <span className="w-5 h-5 rounded bg-[#800020] text-white flex items-center justify-center text-[13px] shrink-0 font-bold">
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
                  <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                    <h3 className="text-sm font-bold text-[#059669] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" weight="bold" />
                      <span>المصطلحات والتعريفات الهامة</span>
                    </h3>
                    <div className="space-y-3">
                      {(lesson.summary.definitions as Definition[]).map(
                        (item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-baseline gap-2 font-content"
                          >
                            <span className="font-bold text-[13px] sm:text-sm text-[#059669] shrink-0 font-mono">
                              {item.term}
                            </span>
                            <span className="text-[#E2E8F0] dark:text-[#64748B] hidden sm:inline">
                              :
                            </span>
                            <span className="text-[13px] sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] font-medium">
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
                  <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                    <h3 className="text-sm font-bold text-[#800020] flex items-center gap-2">
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
                            <span className="text-[13px] font-bold text-[#94A3B8] block uppercase tracking-wider">
                              {formula.title}
                            </span>
                            <code className="text-sm font-mono text-[#059669] block">
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
                  <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                    <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2">
                      <span className="text-base">⇄</span>
                      <span>المقارنات الهامة</span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px] sm:text-sm text-right font-content">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] dark:border-[#334155]">
                            <th className="py-2 px-3 font-bold text-[#64748B]">وجه المقارنة</th>
                            <th className="py-2 px-3 font-bold text-[#800020]">العنصر الأول</th>
                            <th className="py-2 px-3 font-bold text-[#059669]">العنصر الثاني</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(lesson.summary.comparisons as Comparison[]).map(
                            (comp, idx) => (
                              <tr key={idx} className="border-b border-[#E2E8F0]/50 dark:border-[#334155]/50 last:border-0">
                                <td className="py-3 px-3 font-bold text-[#0F172A] dark:text-white">{comp.aspect}</td>
                                <td className="py-3 px-3 text-[#64748B] dark:text-[#F8FAFC]">{comp.first}</td>
                                <td className="py-3 px-3 text-[#64748B] dark:text-[#F8FAFC]">{comp.second}</td>
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
                      <WarningCircle className="w-4 h-4 text-[#D97706]" weight="fill" />
                      <span>تنبيهات وتكات امتحانية هامة</span>
                    </h3>
                    <ul className="space-y-2">
                      {lesson.summary.examTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[13px] sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] font-content">
                          <span className="text-[#D97706] shrink-0 mt-1">•</span>
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
                      <XCircle className="w-4 h-4 text-[#DC2626]" weight="fill" />
                      <span>أخطاء شائعة يجب تجنبها</span>
                    </h3>
                    <div className="space-y-3">
                      {(lesson.summary.commonMistakes as Mistake[]).map(
                        (mistake, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-white dark:bg-[#0F172A] border border-[#DC2626]/15 font-content">
                            <div className="flex items-start gap-2">
                              <span className="text-[#DC2626] font-bold text-[13px] shrink-0 mt-1">خطأ:</span>
                              <span className="text-[13px] text-[#DC2626] line-through">{mistake.mistake}</span>
                            </div>
                            <div className="flex items-start gap-2 mt-2">
                              <span className="text-[#059669] font-bold text-[13px] shrink-0 mt-1">صح:</span>
                              <span className="text-[13px] text-[#059669] font-medium">{mistake.correction}</span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Interactive Checklist */}
              {checklist.length > 0 && (
                <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                  <h3 className="text-sm font-bold text-[#059669] flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" weight="bold" />
                    <span>قائمة مراجعة إتقان الدرس</span>
                  </h3>
                  <div className="space-y-2">
                    {checklist.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleChecklistItem(idx)}
                        className={`w-full p-3 rounded-lg border text-right flex items-center gap-3 transition-colors text-[13px] sm:text-sm font-medium font-content ${
                          item.completed
                            ? "bg-[#059669]/10 border-[#059669]/30 text-[#059669]"
                            : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#059669]/50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            item.completed
                              ? "bg-[#059669] border-[#059669] text-white"
                              : "border-[#E2E8F0] dark:border-[#334155]"
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
            <div className="p-8 text-center text-[#64748B] rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              كبسولة الزتونة قيد الإعداد...
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MIND MAP (الخرائط الذهنية المصورة) */}
      {activeTab === "mindmap" && (
        <div className="space-y-6">
          {lesson.mindMap ? (
            lesson.mindMap.images && lesson.mindMap.images.length > 0 ? (
              <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  overflow-hidden space-y-4 p-4 sm:p-6">
                {/* Header & Image Selector Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" weight="bold" />
                      <span>{lesson.mindMap.title || "الخرائط الذهنية للدرس"}</span>
                    </h3>
                    <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                      خرائط مرئية عالية الدقة لتثبيت الروابط والمفاهيم بين أجزاء الدرس
                    </p>
                  </div>

                  {/* Image Selector Pills (if multiple images) */}
                  {lesson.mindMap.images.length > 1 && (
                    <div className="flex items-center gap-2 p-1 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-x-auto">
                      {lesson.mindMap.images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedImageIndex(idx);
                            setImageZoom(1);
                          }}
                          className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all shrink-0 ${
                            selectedImageIndex === idx
                              ? "bg-[#800020] text-white "
                              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                          }`}
                        >
                          خريطة {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Toolbar */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setImageZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
                      className="w-11 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] "
                      title="تصغير"
                    >
                      <MagnifyingGlassMinus className="w-4 h-4" weight="bold" />
                    </button>
                    <span className="font-mono font-bold text-[13px] px-2 min-w-[3.5rem] text-center text-[#0F172A] dark:text-white" dir="ltr">
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100))}
                      className="w-11 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] "
                      title="تكبير"
                    >
                      <MagnifyingGlassPlus className="w-4 h-4" weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageZoom(1)}
                      className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] flex items-center gap-1 "
                      title="إعادة ضبط الحجم"
                    >
                      <ArrowsCounterClockwise className="w-3.5 h-3.5" weight="bold" />
                      <span className="hidden sm:inline">100%</span>
                    </button>
                  </div>

                  {/* Action: Fullscreen */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFullscreenImage(true)}
                      className="h-11 px-3 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2  transition-colors interactive-tap"
                    >
                      <ArrowsOut className="w-3.5 h-3.5" weight="bold" />
                      <span>عرض ملء الشاشة</span>
                    </button>
                  </div>
                </div>

                {/* Main Image Container */}
                <div className="relative rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#0F172A]/5 dark:bg-black/40 min-h-[420px] max-h-[700px] overflow-auto flex items-center justify-center p-4">
                  <img
                    src={lesson.mindMap.images[selectedImageIndex]}
                    alt={`${lesson.mindMap.title} - خريطة ${selectedImageIndex + 1}`}
                    style={{
                      transform: `scale(${imageZoom})`,
                      transformOrigin: "center center",
                    }}
                    className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-150 select-none shadow-sm cursor-zoom-in"
                    onClick={() => setIsFullscreenImage(true)}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                </div>

                {/* Thumbnails Row if multiple */}
                {lesson.mindMap.images.length > 1 && (
                  <div className="flex items-center gap-3 pt-2 overflow-x-auto pb-1">
                    {lesson.mindMap.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedImageIndex(idx);
                          setImageZoom(1);
                        }}
                        className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                          selectedImageIndex === idx
                            ? "border-[#800020] shadow-sm "
                            : "border-[#E2E8F0] dark:border-[#334155] opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`خريطة ${idx + 1}`}
                          className="w-full h-full object-cover select-none pointer-events-none"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Fallback: Interactive Outline or Tree for lessons with textual nodes */
              <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
                {/* Toolbar */}
                <div className="p-3 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                      className="w-11 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
                    >
                      <span className="text-sm font-bold">−</span>
                    </button>
                    <span className="text-[13px] font-bold text-[#64748B] min-w-[3rem] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                      className="w-11 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
                    >
                      <span className="text-sm font-bold">+</span>
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
                    >
                      إعادة ضبط
                    </button>
                  </div>

                  <button
                    onClick={() => setIsOutlineMode(!isOutlineMode)}
                    className={`h-11 px-3 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-colors ${
                      isOutlineMode
                        ? "bg-[#800020] text-white"
                        : "border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155]"
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
                      <div className="flex flex-col items-center gap-6 min-w-[600px]">
                        {(() => {
                          const mindNodes = (lesson.mindMap?.nodes as MindNode[]) || [];
                          const rootNodes = mindNodes.filter((n) => n.level === 0);
                          const l1Children = mindNodes.filter((n) => n.level === 1);
                          const l2Children = mindNodes.filter((n) => n.level === 2);
                          return rootNodes.map((root) => (
                            <div key={root.id} className="flex flex-col items-center gap-4 w-full">
                              <div
                                onClick={() => setSelectedMindNode(selectedMindNode === root.id ? null : root.id)}
                                className="px-6 py-3 rounded-lg bg-[#800020] text-white text-sm font-bold cursor-pointer hover:bg-[#66001A] transition-colors shadow-sm"
                              >
                                {root.label}
                              </div>

                              {l1Children.length > 0 && (
                                <>
                                  <div className="w-0.5 h-6 bg-[#E2E8F0] dark:bg-[#334155]" />
                                  <div className="flex flex-wrap justify-center gap-4">
                                    {l1Children.map((l1) => (
                                      <div key={l1.id} className="flex flex-col items-center gap-3">
                                        <div
                                          onClick={() => setSelectedMindNode(selectedMindNode === l1.id ? null : l1.id)}
                                          className="px-4 py-3 rounded-lg bg-[#059669] text-white text-[13px] font-bold cursor-pointer hover:bg-[#047857] transition-colors text-center min-w-[120px]"
                                        >
                                          {l1.label}
                                        </div>

                                        {l2Children.length > 0 && (
                                          <>
                                            <div className="w-0.5 h-4 bg-[#E2E8F0] dark:bg-[#334155]" />
                                            <div className="w-full space-y-2">
                                              {l2Children.map((l2) => (
                                                <div
                                                  key={l2.id}
                                                  className="p-3 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-center text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                                                >
                                                  {l2.label}
                                                </div>
                                              ))}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                      {((lesson.mindMap?.nodes as MindNode[]) || []).map((n) => (
                        <div
                          key={n.id}
                          style={{ paddingRight: `${n.level * 24}px` }}
                          className="flex items-start gap-3"
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                              n.level === 0
                                ? "bg-[#800020]"
                                : n.level === 1
                                ? "bg-[#059669]"
                                : "bg-[#D97706]"
                            }`}
                          />
                          <div>
                            <h4
                              className={`text-[13px] sm:text-sm font-bold ${
                                n.level === 0
                                  ? "text-[#800020] text-base"
                                  : "text-[#0F172A] dark:text-white"
                              }`}
                            >
                              {n.label}
                            </h4>
                            {n.description && (
                              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-content">
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
            )
          ) : (
            <div className="p-8 text-center text-[#64748B] rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              خريطة المفاهيم قيد الإعداد...
            </div>
          )}

          {/* Fullscreen Lightbox Modal */}
          {isFullscreenImage && lesson.mindMap?.images && lesson.mindMap.images.length > 0 && (
            <div className="fixed inset-0 z-50 bg-black/90  flex flex-col p-4 sm:p-6 text-white animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{lesson.mindMap.title || "الخريطة الذهنية"}</span>
                  {lesson.mindMap.images.length > 1 && (
                    <span className="text-[13px] text-white/60">
                      (خريطة {selectedImageIndex + 1} من {lesson.mindMap.images.length})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFullscreenImage(false)}
                    className="w-11 h-11 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" weight="bold" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                <img
                  src={lesson.mindMap.images[selectedImageIndex]}
                  alt={lesson.mindMap.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm select-none"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CHECKPOINT QUESTIONS (الأسئلة والتدريب) */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                أسئلة التدريب والتحقق من الفهم
              </h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-content">
                اختر الإجابة لتظهر لك النتيجة والشرح التفصيلي فوراً
              </p>
            </div>
            <Link
              href={`/exams/builder?subjectId=${lesson.unit.subject.id}&unitId=${lesson.unit.id}`}
              className="h-11 px-4 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-colors"
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
                  className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                    <span className="text-[13px] font-bold text-[#800020]">
                      السؤال رقم {qIndex + 1}
                    </span>
                    <span className="px-3 py-1 rounded-md text-[13px] font-bold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC]">
                      {question.difficulty === "EASY"
                        ? "سهل"
                        : question.difficulty === "MEDIUM"
                        ? "متوسط"
                        : "متقدم"}
                    </span>
                  </div>

                  <BidiStatement
                    as="h4"
                    text={question.statement}
                    className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed font-content"
                  />

                  {/* Options */}
                  <div className="space-y-3">
                    {question.options.map((opt, optIdx) => {
                      const isSelected =
                        state?.selectedOptionId === opt.id;
                      const isRevealed = state?.revealed;
                      const isOptionCorrect =
                        state?.reveal?.correctOptionId === opt.id;
                      let btnStyle =
                        "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#800020]/50";

                      if (isRevealed) {
                        if (isOptionCorrect) {
                          btnStyle =
                            "bg-[#059669]/10 border-[#059669]/30 text-[#059669] font-bold";
                        } else if (isSelected && !isOptionCorrect) {
                          btnStyle =
                            "bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626] font-bold";
                        }
                      }

                      const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={isRevealed}
                          onClick={() =>
                            handleSelectOption(question.id, opt.id)
                          }
                          className={`w-full p-4 sm:p-4 rounded-xl border text-right text-[13px] sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 transition-colors font-content ${btnStyle}`}
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                            <span className="w-7 h-7 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] flex items-center justify-center text-[13px] font-mono font-bold shrink-0 mt-1 sm:mt-0 border border-[#E2E8F0]/60 dark:border-[#334155]/60">
                              {arabicLetters[optIdx] || opt.order}
                            </span>
                            <div className="min-w-0 flex-1 leading-relaxed">
                              <BidiStatement as="span" text={opt.text} />
                            </div>
                          </div>

                          {isRevealed && (
                            <div className="shrink-0">
                              {isOptionCorrect ? (
                                <span className="text-[#059669] text-[13px] font-bold flex items-center gap-1">
                                  <Check className="w-4 h-4" weight="bold" />
                                  <span>صح! برافو</span>
                                </span>
                              ) : isSelected ? (
                                <span className="text-[#DC2626] text-[13px] font-bold">
                                  مش صحيحة
                                </span>
                              ) : null}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation Reveal */}
                  {state?.revealed && state.reveal?.explanation && (
                    <div className="p-4 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/60 dark:border-[#E11D48]/60 space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#800020] dark:text-[#FB7185]">
                        <Lightbulb className="w-4 h-4" weight="fill" />
                        <span>
                          الفكرة الأساسية: {state.reveal.explanation.concept}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-content">
                        {state.reveal.explanation.correctReason}
                      </p>

                      {/* Per-option explanations if available */}
                      <div className="pt-2 border-t border-[#E2E8F0]/40 dark:border-[#E11D48]/40 space-y-2">
                        <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                          ليه ده صح وده غلط؟
                        </span>
                        {question.options.map((opt) => {
                          const revealedOpt = state.reveal?.options?.find(
                            (o) => o.id === opt.id
                          );
                          return (
                            <div
                              key={opt.id}
                              className="text-[13px] text-[#64748B] dark:text-[#94A3B8] flex items-start gap-2 font-content"
                            >
                              <span className="font-bold shrink-0">
                                • <BidiStatement as="span" text={opt.text} />:
                              </span>
                              <span>
                                {revealedOpt?.explanation ||
                                  (revealedOpt?.isCorrect
                                    ? "ده الخيار الدقيق والمظبوط"
                                    : "مش مظبوط في الحالة دي")}
                              </span>
                            </div>
                          );
                        })}
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
      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4 mt-8">
        {prevLesson ? (
          <Link
            href={`/lessons/${prevLesson.id}`}
            className="flex items-center gap-2 text-[13px] sm:text-sm font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#800020] transition-colors"
          >
            <CaretRight className="w-4 h-4 shrink-0" weight="bold" />
            <div className="text-right">
              <span className="block text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                الدرس السابق
              </span>
              <span className="block break-words max-w-xs leading-snug">
                <bdi>{prevLesson.title}</bdi>
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="flex items-center gap-2 text-[13px] sm:text-sm font-bold text-[#800020] hover:text-[#66001A] transition-colors"
          >
            <div className="text-left">
              <span className="block text-[13px] text-[#800020]/70">
                الدرس التالي
              </span>
              <span className="block break-words max-w-xs leading-snug">
                <bdi>{nextLesson.title}</bdi>
              </span>
            </div>
            <CaretLeft className="w-4 h-4 shrink-0" weight="bold" />
          </Link>
        ) : (
          <Link
            href={`/subjects/${lesson.unit.subject.id}`}
            className="h-11 px-4 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-colors"
          >
            <span>تم إنهاء الوحدة! عودة للمادة</span>
            <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
          </Link>
        )}
      </div>
    </div>
  );
}