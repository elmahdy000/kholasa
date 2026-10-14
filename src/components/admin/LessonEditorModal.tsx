"use client";

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Trash2,
  ExternalLink,
  Video,
  Headphones,
  Image as ImageIcon,
  BookOpen,
  Sparkles,
  Plus,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Layers,
  HelpCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface LessonData {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  isPublished: boolean;
  unitId: string;
  unit?: {
    id: string;
    title: string;
    subject?: {
      id: string;
      name: string;
      color?: string | null;
    };
  };
  content?: {
    id?: string;
    body: string;
    videoUrl?: string | null;
    audioUrl?: string | null;
    objectives: string[];
  } | null;
  mindMap?: {
    id?: string;
    title: string;
    description?: string | null;
    images: string[];
    nodes?: any;
    edges?: any;
  } | null;
  summary?: {
    id?: string;
    keyConcepts?: any;
    definitions?: any;
    formulas?: any;
    comparisons?: any;
    examTips?: any;
    commonMistakes?: any;
    checklist?: any;
  } | null;
}

interface LessonEditorModalProps {
  lessonId: string;
  isOpen: boolean;
  onClose: () => void;
  onLessonUpdated: (updatedLesson: LessonData) => void;
  onLessonDeleted: (deletedId: string) => void;
}

export function LessonEditorModal({
  lessonId,
  isOpen,
  onClose,
  onLessonUpdated,
  onLessonDeleted,
}: LessonEditorModalProps) {
  const [activeTab, setActiveTab] = useState<
    "media" | "mindmap" | "content" | "summary"
  >("media");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Lesson Core Form State
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [isPublished, setIsPublished] = useState(true);
  const [unitInfo, setUnitInfo] = useState<{
    unitTitle: string;
    subjectName: string;
    subjectColor?: string | null;
  }>({ unitTitle: "", subjectName: "" });

  // Media State
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  // Mind Map State
  const [mindMapTitle, setMindMapTitle] = useState("");
  const [mindMapDescription, setMindMapDescription] = useState("");
  const [mindMapImages, setMindMapImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [previewLightboxImage, setPreviewLightboxImage] = useState<string | null>(null);

  // Content & Objectives State
  const [bodyText, setBodyText] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState("");

  // Summary State
  const [keyConcepts, setKeyConcepts] = useState<string[]>([]);
  const [newConcept, setNewConcept] = useState("");
  const [examTips, setExamTips] = useState<string[]>([]);
  const [newExamTip, setNewExamTip] = useState("");
  const [commonMistakes, setCommonMistakes] = useState<
    { mistake: string; correction: string }[]
  >([]);
  const [newMistake, setNewMistake] = useState("");
  const [newCorrection, setNewCorrection] = useState("");

  useEffect(() => {
    if (!isOpen || !lessonId) return;

    let isMounted = true;
    setIsLoading(true);
    setStatusMessage(null);
    setShowDeleteConfirm(false);

    fetch(`/api/admin/lessons/${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.error) {
          setStatusMessage({ type: "error", text: data.error });
          setIsLoading(false);
          return;
        }

        setTitle(data.title || "");
        setOrder(data.order ?? 0);
        setDurationMinutes(data.durationMinutes ?? 15);
        setIsPublished(data.isPublished ?? true);

        if (data.unit) {
          setUnitInfo({
            unitTitle: data.unit.title || "الوحدة",
            subjectName: data.unit.subject?.name || "المادة",
            subjectColor: data.unit.subject?.color,
          });
        }

        setVideoUrl(data.content?.videoUrl || "");
        setAudioUrl(data.content?.audioUrl || "");
        setBodyText(data.content?.body || "");
        setObjectives(Array.isArray(data.content?.objectives) ? data.content.objectives : []);

        setMindMapTitle(data.mindMap?.title || `خريطة: ${data.title}`);
        setMindMapDescription(data.mindMap?.description || "");
        setMindMapImages(Array.isArray(data.mindMap?.images) ? data.mindMap.images : []);

        if (data.summary) {
          setKeyConcepts(Array.isArray(data.summary.keyConcepts) ? data.summary.keyConcepts : []);
          setExamTips(Array.isArray(data.summary.examTips) ? data.summary.examTips : []);
          setCommonMistakes(
            Array.isArray(data.summary.commonMistakes) ? data.summary.commonMistakes : []
          );
        }

        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error loading lesson:", err);
        setStatusMessage({ type: "error", text: "تعذر جلب تفاصيل الدرس" });
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lessonId, isOpen]);

  if (!isOpen) return null;

  // YouTube Embed helper
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    setMindMapImages((prev) => [...prev, trimmed]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setMindMapImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    setMindMapImages((prev) => {
      const copy = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleAddObjective = () => {
    const trimmed = newObjective.trim();
    if (!trimmed) return;
    setObjectives((prev) => [...prev, trimmed]);
    setNewObjective("");
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddKeyConcept = () => {
    const trimmed = newConcept.trim();
    if (!trimmed) return;
    setKeyConcepts((prev) => [...prev, trimmed]);
    setNewConcept("");
  };

  const handleRemoveKeyConcept = (index: number) => {
    setKeyConcepts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddExamTip = () => {
    const trimmed = newExamTip.trim();
    if (!trimmed) return;
    setExamTips((prev) => [...prev, trimmed]);
    setNewExamTip("");
  };

  const handleRemoveExamTip = (index: number) => {
    setExamTips((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMistake = () => {
    if (!newMistake.trim() || !newCorrection.trim()) return;
    setCommonMistakes((prev) => [
      ...prev,
      { mistake: newMistake.trim(), correction: newCorrection.trim() },
    ]);
    setNewMistake("");
    setNewCorrection("");
  };

  const handleRemoveMistake = (index: number) => {
    setCommonMistakes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setStatusMessage({ type: "error", text: "عنوان الدرس مطلوب" });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const payload = {
      title: title.trim(),
      order: Number(order),
      durationMinutes: Number(durationMinutes),
      isPublished: Boolean(isPublished),
      content: {
        body: bodyText,
        videoUrl: videoUrl.trim() || null,
        audioUrl: audioUrl.trim() || null,
        objectives,
      },
      mindMap: {
        title: mindMapTitle.trim() || title.trim(),
        description: mindMapDescription.trim() || null,
        images: mindMapImages,
      },
      summary: {
        keyConcepts,
        examTips,
        commonMistakes,
      },
    };

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "فشل حفظ الدرس");
      }

      setStatusMessage({ type: "success", text: "تم حفظ كافة التعديلات بنجاح" });
      if (data.lesson) {
        onLessonUpdated(data.lesson);
      }
      setTimeout(() => {
        setStatusMessage(null);
      }, 3500);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "تعذر حفظ التعديلات",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "فشل حذف الدرس");
      }

      onLessonDeleted(lessonId);
      onClose();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "حدث خطأ أثناء حذف الدرس",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: unitInfo.subjectColor || "#4F46E5" }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-bold mb-0.5">
                <span>{unitInfo.subjectName}</span>
                <span>/</span>
                <span>{unitInfo.unitTitle}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#14243D] dark:text-white leading-tight">
                {title ? `تعديل: ${title}` : "تعديل محتوى الدرس"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/lessons/${lessonId}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold items-center gap-1.5 transition-colors"
            >
              <span>معاينة الطالب</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="h-9 sm:h-10 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جارٍ الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 border-b transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: "media", label: "الوسائط والبيانات", icon: Video },
            {
              id: "mindmap",
              label: `الخرائط الذهنية (${mindMapImages.length})`,
              icon: ImageIcon,
            },
            { id: "content", label: "الشرح ومخرجات التعلم", icon: BookOpen },
            { id: "summary", label: "الزتونة ونقاط الامتحان", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isSelected
                    ? "border-[#4F46E5] text-[#4F46E5]"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#4F46E5]/30 border-t-[#4F46E5] rounded-full animate-spin" />
              <span className="text-xs font-bold text-slate-400">
                جارٍ تحميل بيانات الدرس...
              </span>
            </div>
          ) : (
            <>
              {/* TAB 1: MEDIA & BASIC INFO */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  {/* Basic Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        عنوان الدرس *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثال: الخلية الحية ووظائف العضيات"
                        className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        المدة التقديرية (بالدقائق)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={durationMinutes}
                        onChange={(e) =>
                          setDurationMinutes(Number(e.target.value))
                        }
                        className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        ترتيب الدرس داخل الوحدة
                      </label>
                      <input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                        className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        حالة نشر الدرس للطلاب
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsPublished(!isPublished)}
                        className={`w-full h-10 px-4 rounded-xl text-xs font-black flex items-center justify-between border transition-colors ${
                          isPublished
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isPublished ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                          <span>
                            {isPublished
                              ? "منشور ومتاح للطلاب في التطبيق"
                              : "مسودة مخفية (غير مرئي للطلاب)"}
                          </span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-white dark:bg-slate-800">
                          {isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Video URL Section */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-[#14243D] dark:text-white">
                      <Video className="w-4 h-4 text-[#4F46E5]" />
                      <span>فيديو الدرس (YouTube / Vimeo / MP4)</span>
                    </div>

                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      dir="ltr"
                    />

                    {embedUrl ? (
                      <div className="aspect-video w-full max-w-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black mt-2">
                        <iframe
                          src={embedUrl}
                          title="معاينة الفيديو"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : videoUrl ? (
                      <p className="text-[11px] text-amber-600 font-bold">
                        تنبيه: تأكد من صحة الرابط ليعمل المشغل المضمن للطالب.
                      </p>
                    ) : null}
                  </div>

                  {/* Podcast / Audio URL Section */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-black text-[#14243D] dark:text-white">
                        <Headphones className="w-4 h-4 text-emerald-500" />
                        <span>بودكاست الدرس / التسجيل الصوتي (audioUrl)</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        الخلاصة الصوتية
                      </span>
                    </div>

                    <input
                      type="url"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://example.com/audio/lesson-summary.mp3"
                      className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      dir="ltr"
                    />

                    {audioUrl && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                          معاينة الاستماع المباشر:
                        </span>
                        <audio
                          src={audioUrl}
                          controls
                          className="w-full h-9 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MIND MAP IMAGES */}
              {activeTab === "mindmap" && (
                <div className="space-y-6">
                  {/* Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        عنوان الخريطة الذهنية
                      </label>
                      <input
                        type="text"
                        value={mindMapTitle}
                        onChange={(e) => setMindMapTitle(e.target.value)}
                        placeholder="مثال: خريطة مفاهيم الوراثة والجينات"
                        className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        إرشادات أو وصف للخريطة (اختياري)
                      </label>
                      <input
                        type="text"
                        value={mindMapDescription}
                        onChange={(e) => setMindMapDescription(e.target.value)}
                        placeholder="مثال: ركّز على الفروق في الجزء الأيمن قبل الامتحان"
                        className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  {/* Add New Image Input */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#4F46E5] dark:text-indigo-400 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>إضافة صورة خريطة ذهنية جديدة (MindMap Image URL)</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-bold">
                        تدعم JPG, PNG, WebP, SVG
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... أو رابط مباشر للصورة"
                        className="flex-1 h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                        dir="ltr"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImage();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        disabled={!newImageUrl.trim()}
                        className="h-10 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة الصورة</span>
                      </button>
                    </div>
                  </div>

                  {/* Images Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">
                        معرض الخرائط المرفوعة لهذا الدرس ({mindMapImages.length})
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        يمكنك تغيير ترتيب الصور أو حذفها في أي وقت
                      </span>
                    </div>

                    {mindMapImages.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                        <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          لم يتم رفع أي صور خرائط ذهنية بعد.
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                          أضف روابط الصور عالية الدقة بالأعلى لتظهر للطالب في تبويب
                          "خريطة المفاهيم" مع أدوات التكبير ومعرض الصور الكامل.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {mindMapImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="group relative rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs flex flex-col justify-between"
                          >
                            <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <img
                                src={imgUrl}
                                alt={`خريطة ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLElement).setAttribute(
                                    "data-failed",
                                    "true"
                                  );
                                }}
                              />
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                                خريطة {idx + 1}
                              </div>

                              <button
                                type="button"
                                onClick={() => setPreviewLightboxImage(imgUrl)}
                                className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                                title="تكبير ومعاينة"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="p-2.5 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]" dir="ltr">
                                {imgUrl.split("/").pop() || "image"}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, "up")}
                                  disabled={idx === 0}
                                  className="p-1 rounded-md text-slate-400 hover:text-[#4F46E5] disabled:opacity-30 transition-colors"
                                  title="تقديم الترتيب"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, "down")}
                                  disabled={idx === mindMapImages.length - 1}
                                  className="p-1 rounded-md text-slate-400 hover:text-[#4F46E5] disabled:opacity-30 transition-colors"
                                  title="تأخير الترتيب"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                  title="حذف الصورة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CONTENT & OBJECTIVES */}
              {activeTab === "content" && (
                <div className="space-y-6">
                  {/* Objectives */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                        <span>الأهداف التعليمية ومخرجات التعلم ({objectives.length})</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        تظهر أعلى الدرس للطالب
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        placeholder="مثال: التمييز بين الانقسام الميتوزي والميوزي بدقة"
                        className="flex-1 h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddObjective();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddObjective}
                        disabled={!newObjective.trim()}
                        className="h-10 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة هدف</span>
                      </button>
                    </div>

                    {objectives.length > 0 && (
                      <ul className="space-y-2 pt-2">
                        {objectives.map((obj, i) => (
                          <li
                            key={i}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs font-bold text-slate-800 dark:text-slate-200"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] text-[10px] flex items-center justify-center font-bold">
                                {i + 1}
                              </span>
                              <span>{obj}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveObjective(i)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Body Textarea */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        الشرح التفصيلي للدرس (Body Text)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        يدعم الترويسات (## عنوان رئيسي، ### عنوان فرعي، * قائمة)
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="اكتب أو الصق شرح الدرس هنا..."
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-sans leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: SUMMARY & EXAM TIPS */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  {/* Key Concepts */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>المفاهيم والنقاط الجوهرية (الزتونة الذهبية)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newConcept}
                        onChange={(e) => setNewConcept(e.target.value)}
                        placeholder="أضف مفهوماً جوهرياً..."
                        className="flex-1 h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeyConcept();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyConcept}
                        disabled={!newConcept.trim()}
                        className="h-10 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة</span>
                      </button>
                    </div>

                    {keyConcepts.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {keyConcepts.map((item, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyConcept(i)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Exam Tips */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span>نصائح الامتحان الذهبية (Exam Tips)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newExamTip}
                        onChange={(e) => setNewExamTip(e.target.value)}
                        placeholder="مثال: ركّز على كلمة (فقط) في صيغة السؤال فإنها تنفي..."
                        className="flex-1 h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddExamTip();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddExamTip}
                        disabled={!newExamTip.trim()}
                        className="h-10 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة</span>
                      </button>
                    </div>

                    {examTips.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {examTips.map((tip, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                          >
                            <span>{tip}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveExamTip(i)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Common Mistakes */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 space-y-3">
                    <label className="text-xs font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>الأخطاء الشائعة وتحذيرات الامتحان</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newMistake}
                        onChange={(e) => setNewMistake(e.target.value)}
                        placeholder="الخطأ الشائع لدى الطلاب..."
                        className="h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={newCorrection}
                        onChange={(e) => setNewCorrection(e.target.value)}
                        placeholder="التصحيح العلمي الدقيق..."
                        className="h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMistake}
                      disabled={!newMistake.trim() || !newCorrection.trim()}
                      className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة الخطأ والتصحيح</span>
                    </button>

                    {commonMistakes.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {commonMistakes.map((item, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1 text-xs font-bold">
                              <p className="text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                <span>❌ خطأ:</span>
                                <span>{item.mistake}</span>
                              </p>
                              <p className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <span>✅ الصواب:</span>
                                <span>{item.correction}</span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMistake(i)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-red-600">
                  هل أنت متأكد من الحذف؟
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors"
                >
                  {isDeleting ? "جارٍ الحذف..." : "نعم، احذف نهائياً"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-8 px-3 rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-8 px-3 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف هذا الدرس</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              إغلاق النافذة
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="h-9 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>حفظ كافة التعديلات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox for Previewing Mind Map Images */}
      {previewLightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewLightboxImage(null)}
              className="absolute -top-10 left-0 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewLightboxImage}
              alt="معاينة الخريطة الذهنية"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
