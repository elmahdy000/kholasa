"use client";

import { useState, useEffect, useRef } from "react";
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
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  Upload,
  Loader2,
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
    nodes?: unknown;
    edges?: unknown;
  } | null;
  summary?: {
    id?: string;
    keyConcepts?: unknown;
    definitions?: unknown;
    formulas?: unknown;
    comparisons?: unknown;
    examTips?: unknown;
    commonMistakes?: unknown;
    checklist?: unknown;
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
  const [uploadingMedia, setUploadingMedia] = useState<"video" | "audio" | "mindmap" | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mindMapInputRef = useRef<HTMLInputElement>(null);

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
    const timer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(true);
        setStatusMessage(null);
        setShowDeleteConfirm(false);
      }
    }, 0);

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
      clearTimeout(timer);
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

  const handleMediaUpload = async (
    file: File,
    target: "video" | "audio" | "mindmap"
  ) => {
    setUploadingMedia(target);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "فشل رفع الملف إلى الخادم");
      }

      if (target === "video") {
        setVideoUrl(data.url);
      } else if (target === "audio") {
        setAudioUrl(data.url);
      } else if (target === "mindmap") {
        setMindMapImages((prev) => [...prev, data.url]);
      }
      setStatusMessage({ type: "success", text: "تم رفع الملف بنجاح وتعيينه" });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "تعذر رفع الملف");
    } finally {
      setUploadingMedia(null);
    }
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
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "تعذر حفظ التعديلات",
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
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "حدث خطأ أثناء حذف الدرس",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-sm overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#F8FAFC]/80 dark:bg-[#1E293B]/80 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: unitInfo.subjectColor || "#4F46E5" }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap text-[13px] text-[#64748B] font-bold mb-1">
                <span>{unitInfo.subjectName}</span>
                <span>/</span>
                <span>{unitInfo.unitTitle}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-tight">
                {title ? `تعديل: ${title}` : "تعديل محتوى الدرس"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/lessons/${lessonId}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex h-11 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-bold items-center gap-2 transition-colors"
            >
              <span>معاينة الطالب</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="h-11 sm:h-11 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-transform active:opacity-80 disabled:opacity-50"
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
              className="w-11 h-11 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`px-6 py-3 text-[13px] font-bold flex items-center gap-2 border-b transition-all ${
              statusMessage.type === "success"
                ? "bg-[#059669]/10 text-[#059669] dark:bg-[#1E293B] dark:text-[#34D399] border-[#E2E8F0] dark:border-[#34D399]"
                : "bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#1E293B] dark:text-[#F87171] border-[#E2E8F0] dark:border-[#F87171]"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center gap-2 overflow-x-auto shrink-0">
          {([
            { id: "media", label: "الوسائط والبيانات", icon: Video },
            {
              id: "mindmap",
              label: `الخرائط الذهنية (${mindMapImages.length})`,
              icon: ImageIcon,
            },
            { id: "content", label: "الشرح ومخرجات التعلم", icon: BookOpen },
            { id: "summary", label: "الزتونة ونقاط الامتحان", icon: Sparkles },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3 text-[13px] font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isSelected
                    ? "border-[#4F46E5] text-[#4F46E5]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
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
              <div className="w-11 h-11 border-3 border-[#4F46E5]/30 border-t-[#4F46E5] rounded-full animate-spin" />
              <span className="text-[13px] font-bold text-[#94A3B8]">
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
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        عنوان الدرس *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثال: الخلية الحية ووظائف العضيات"
                        className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        المدة التقديرية (بالدقائق)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={durationMinutes}
                        onChange={(e) =>
                          setDurationMinutes(Number(e.target.value))
                        }
                        className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        ترتيب الدرس داخل الوحدة
                      </label>
                      <input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                        className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        حالة نشر الدرس للطلاب
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsPublished(!isPublished)}
                        className={`w-full h-11 px-4 rounded-xl text-[13px] font-bold flex items-center justify-between border transition-colors ${
                          isPublished
                            ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399] border-[#059669]/20"
                            : "bg-[#F8FAFC] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155]"
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
                        <span className="text-[13px] px-2 py-1 rounded-md font-mono bg-white dark:bg-[#1E293B]">
                          {isPublished ? "PUBLISHED" : "DRAFT"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Video URL Section */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#0F172A] dark:text-white">
                        <Video className="w-4 h-4 text-[#4F46E5]" />
                        <span>فيديو الدرس (YouTube / Vimeo / MP4 مباشر)</span>
                      </div>
                      <div>
                        <input
                          type="file"
                          ref={videoInputRef}
                          accept="video/mp4,video/webm,video/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleMediaUpload(e.target.files[0], "video");
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={uploadingMedia === "video"}
                          className="h-7 px-3 rounded-lg bg-[#4F46E5]/10 hover:bg-[#4F46E5]/10 dark:bg-[#1E293B] text-[#4F46E5] dark:text-[#6366F1] text-[13px] font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {uploadingMedia === "video" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{uploadingMedia === "video" ? "جاري الرفع..." : "رفع فيديو MP4"}</span>
                        </button>
                      </div>
                    </div>

                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... أو /uploads/video.mp4"
                      className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      dir="ltr"
                    />

                    {embedUrl ? (
                      <div className="aspect-video w-full max-w-lg rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-black mt-2">
                        <iframe
                          src={embedUrl}
                          title="معاينة الفيديو"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : videoUrl ? (
                      <div className="rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-black mt-2 max-w-lg">
                        <video
                          src={videoUrl}
                          controls
                          className="w-full max-h-[300px]"
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Podcast / Audio URL Section */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#0F172A] dark:text-white">
                        <Headphones className="w-4 h-4 text-[#059669]" />
                        <span>بودكاست الدرس / التسجيل الصوتي (audioUrl)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={audioInputRef}
                          accept="audio/mp3,audio/wav,audio/m4a,audio/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleMediaUpload(e.target.files[0], "audio");
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => audioInputRef.current?.click()}
                          disabled={uploadingMedia === "audio"}
                          className="h-7 px-3 rounded-lg bg-[#059669]/10 hover:bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] text-[13px] font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {uploadingMedia === "audio" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{uploadingMedia === "audio" ? "جاري الرفع..." : "رفع تسجيل صوتي"}</span>
                        </button>
                        <span className="text-[13px] font-bold text-[#059669] bg-[#059669]/10 px-2 py-1 rounded-md">
                          الخلاصة الصوتية
                        </span>
                      </div>
                    </div>

                    <input
                      type="url"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://example.com/audio/lesson-summary.mp3 أو /uploads/podcast.mp3"
                      className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      dir="ltr"
                    />

                    {audioUrl && (
                      <div className="pt-2">
                        <span className="text-[13px] font-bold text-[#64748B] block mb-2">
                          معاينة الاستماع المباشر:
                        </span>
                        <audio
                          src={audioUrl}
                          controls
                          className="w-full h-11 rounded-lg"
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
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        عنوان الخريطة الذهنية
                      </label>
                      <input
                        type="text"
                        value={mindMapTitle}
                        onChange={(e) => setMindMapTitle(e.target.value)}
                        placeholder="مثال: خريطة مفاهيم الوراثة والجينات"
                        className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        إرشادات أو وصف للخريطة (اختياري)
                      </label>
                      <input
                        type="text"
                        value={mindMapDescription}
                        onChange={(e) => setMindMapDescription(e.target.value)}
                        placeholder="مثال: ركّز على الفروق في الجزء الأيمن قبل الامتحان"
                        className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  {/* Add New Image Input */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#4F46E5]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#6366F1]/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#4F46E5] dark:text-[#6366F1] flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>إضافة صورة خريطة ذهنية جديدة (MindMap Image URL)</span>
                      </span>
                      <span className="text-[13px] text-[#64748B] font-bold">
                        تدعم JPG, PNG, WebP, SVG
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... أو رابط مباشر للصورة"
                        className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
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
                        className="h-11 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة بالرابط</span>
                      </button>

                      <input
                        type="file"
                        ref={mindMapInputRef}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleMediaUpload(e.target.files[0], "mindmap");
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => mindMapInputRef.current?.click()}
                        disabled={uploadingMedia === "mindmap"}
                        className="h-11 px-4 rounded-xl bg-[#0F172A] hover:bg-[#0F172A] dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#1E293B] text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
                      >
                        {uploadingMedia === "mindmap" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>{uploadingMedia === "mindmap" ? "جاري الرفع..." : "رفع من الجهاز"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Images Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        معرض الخرائط المرفوعة لهذا الدرس ({mindMapImages.length})
                      </h4>
                      <span className="text-[13px] text-[#94A3B8]">
                        يمكنك تغيير ترتيب الصور أو حذفها في أي وقت
                      </span>
                    </div>

                    {mindMapImages.length === 0 ? (
                      <div className="p-8 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-dashed border-[#E2E8F0] dark:border-[#334155] text-center space-y-2">
                        <div className="w-11 h-11 mx-auto rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] text-[#94A3B8] flex items-center justify-center">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <p className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                          لم يتم رفع أي صور خرائط ذهنية بعد.
                        </p>
                        <p className="text-[13px] text-[#94A3B8] max-w-md mx-auto">
                          أضف روابط الصور عالية الدقة بالأعلى لتظهر للطالب في تبويب
                          "خريطة المفاهيم" مع أدوات التكبير ومعرض الصور الكامل.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {mindMapImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="group relative rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden  flex flex-col justify-between"
                          >
                            <div className="relative aspect-video bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
                              <img
                                src={imgUrl}
                                alt={`خريطة ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform group-"
                                onError={(e) => {
                                  (e.target as HTMLElement).setAttribute(
                                    "data-failed",
                                    "true"
                                  );
                                }}
                              />
                              <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60  text-white text-[13px] font-bold">
                                خريطة {idx + 1}
                              </div>

                              <button
                                type="button"
                                onClick={() => setPreviewLightboxImage(imgUrl)}
                                className="absolute bottom-2 left-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white  transition-colors"
                                title="تكبير ومعاينة"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="p-3 flex items-center justify-between gap-2 border-t border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]">
                              <span className="text-[13px] font-mono text-[#94A3B8] truncate max-w-[120px]" dir="ltr">
                                {imgUrl.split("/").pop() || "image"}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, "up")}
                                  disabled={idx === 0}
                                  className="p-1 rounded-md text-[#94A3B8] hover:text-[#4F46E5] disabled:opacity-30 transition-colors"
                                  title="تقديم الترتيب"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, "down")}
                                  disabled={idx === mindMapImages.length - 1}
                                  className="p-1 rounded-md text-[#94A3B8] hover:text-[#4F46E5] disabled:opacity-30 transition-colors"
                                  title="تأخير الترتيب"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="p-1 rounded-md text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors"
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
                  <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                        <span>الأهداف التعليمية ومخرجات التعلم ({objectives.length})</span>
                      </label>
                      <span className="text-[13px] text-[#94A3B8]">
                        تظهر أعلى الدرس للطالب
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        placeholder="مثال: التمييز بين الانقسام الميتوزي والميوزي بدقة"
                        className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
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
                        className="h-11 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50"
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
                            className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3 text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] text-[13px] flex items-center justify-center font-bold">
                                {i + 1}
                              </span>
                              <span>{obj}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveObjective(i)}
                              className="text-[#DC2626] hover:text-[#DC2626] p-1 rounded-md transition-colors"
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
                      <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        الشرح التفصيلي للدرس (Body Text)
                      </label>
                      <span className="text-[13px] text-[#94A3B8]">
                        يدعم الترويسات (## عنوان رئيسي، ### عنوان فرعي، * قائمة)
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="اكتب أو الصق شرح الدرس هنا..."
                      className="w-full p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm font-sans leading-relaxed text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: SUMMARY & EXAM TIPS */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  {/* Key Concepts */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D97706]" />
                      <span>المفاهيم والنقاط الجوهرية (الزتونة الذهبية)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newConcept}
                        onChange={(e) => setNewConcept(e.target.value)}
                        placeholder="أضف مفهوماً جوهرياً..."
                        className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
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
                        className="h-11 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50"
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
                            className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyConcept(i)}
                              className="text-[#DC2626] hover:text-[#DC2626] p-1 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Exam Tips */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#059669]" />
                      <span>نصائح الامتحان الذهبية (Exam Tips)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newExamTip}
                        onChange={(e) => setNewExamTip(e.target.value)}
                        placeholder="مثال: ركّز على كلمة (فقط) في صيغة السؤال فإنها تنفي..."
                        className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
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
                        className="h-11 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50"
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
                            className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                          >
                            <span>{tip}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveExamTip(i)}
                              className="text-[#DC2626] hover:text-[#DC2626] p-1 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Common Mistakes */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#F87171]/40 space-y-3">
                    <label className="text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>الأخطاء الشائعة وتحذيرات الامتحان</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newMistake}
                        onChange={(e) => setNewMistake(e.target.value)}
                        placeholder="الخطأ الشائع لدى الطلاب..."
                        className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#DC2626]"
                      />
                      <input
                        type="text"
                        value={newCorrection}
                        onChange={(e) => setNewCorrection(e.target.value)}
                        placeholder="التصحيح العلمي الدقيق..."
                        className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMistake}
                      disabled={!newMistake.trim() || !newCorrection.trim()}
                      className="h-11 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold flex items-center gap-2 transition-transform active:opacity-80 disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة الخطأ والتصحيح</span>
                    </button>

                    {commonMistakes.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {commonMistakes.map((item, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1 text-[13px] font-bold">
                              <p className="text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
                                <span>خطأ:</span>
                                <span>{item.mistake}</span>
                              </p>
                              <p className="text-[#059669] dark:text-[#34D399] flex items-center gap-2">
                                <span>الصواب:</span>
                                <span>{item.correction}</span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMistake(i)}
                              className="text-[#DC2626] hover:text-[#DC2626] p-1 rounded-md"
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
        <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/80 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4 shrink-0">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#DC2626]">
                  هل أنت متأكد من الحذف؟
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-11 px-3 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold transition-colors"
                >
                  {isDeleting ? "جارٍ الحذف..." : "نعم، احذف نهائياً"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-11 px-3 rounded-lg bg-[#E2E8F0] text-[#0F172A] dark:bg-[#1E293B] dark:text-[#F8FAFC] text-[13px] font-bold"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-11 px-3 rounded-lg text-[13px] font-bold text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] flex items-center gap-2 transition-colors"
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
              className="h-11 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
            >
              إغلاق النافذة
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="h-11 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-transform active:opacity-80 disabled:opacity-50"
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
          className="fixed inset-0 z-60 bg-black/90  flex items-center justify-center p-4"
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
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
