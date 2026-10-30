"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  LessonData,
  LessonEditorTabType,
  UnitInfo,
  DefinitionItem,
  LessonQuestionItem,
  CommonMistakeItem,
} from "./types";

interface UseLessonEditorProps {
  lessonId: string;
  isStandaloneRoute?: boolean;
  onClose?: () => void;
  onLessonUpdated?: (updatedLesson: LessonData) => void;
  onLessonDeleted?: (deletedId: string) => void;
}

export function useLessonEditor({
  lessonId,
  isStandaloneRoute,
  onClose,
  onLessonUpdated,
  onLessonDeleted,
}: UseLessonEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LessonEditorTabType>("mindmap");

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
  const [unitInfo, setUnitInfo] = useState<UnitInfo>({
    unitTitle: "",
    subjectName: "",
  });

  // Media & Video State
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [contentPdfUrl, setContentPdfUrl] = useState("");
  const [showPairUploadModal, setShowPairUploadModal] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState<
    "video" | "audio" | "mindmap" | "summary_pdf" | "summary_image" | "content_pdf" | null
  >(null);

  // Mind Map State
  const [mindMapTitle, setMindMapTitle] = useState("");
  const [mindMapDescription, setMindMapDescription] = useState("");
  const [mindMapImages, setMindMapImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [previewLightboxImage, setPreviewLightboxImage] = useState<string | null>(null);

  // Definitions State (المصطلحات والتعريفات)
  const [definitions, setDefinitions] = useState<DefinitionItem[]>([]);

  // Questions State (أسئلة الدرس)
  const [questions, setQuestions] = useState<LessonQuestionItem[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Content & Objectives State
  const [bodyText, setBodyText] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState("");

  // Summary State (الزتونة)
  const [summaryPdfUrl, setSummaryPdfUrl] = useState("");
  const [summaryImages, setSummaryImages] = useState<string[]>([]);
  const [newSummaryImageUrl, setNewSummaryImageUrl] = useState("");
  const [keyConcepts, setKeyConcepts] = useState<string[]>([]);
  const [newConcept, setNewConcept] = useState("");
  const [examTips, setExamTips] = useState<string[]>([]);
  const [newExamTip, setNewExamTip] = useState("");
  const [commonMistakes, setCommonMistakes] = useState<CommonMistakeItem[]>([]);
  const [newMistake, setNewMistake] = useState("");
  const [newCorrection, setNewCorrection] = useState("");

  // Fetch Questions for this lesson
  const fetchLessonQuestions = useCallback(() => {
    if (!lessonId) return;
    setIsLoadingQuestions(true);
    fetch(`/api/admin/questions?lessonId=${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.questions)) {
          setQuestions(
            data.questions.map((q: any) => ({
              id: q.id,
              statement: q.statement,
              type: q.type,
              difficulty: q.difficulty,
              options: q.options || [],
              explanation: q.explanation || null,
              rubric: q.rubric || null,
            }))
          );
        }
      })
      .catch((err) => console.error("Error fetching lesson questions:", err))
      .finally(() => setIsLoadingQuestions(false));
  }, [lessonId]);

  // Load complete lesson data on mount
  useEffect(() => {
    if (!lessonId) return;

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
            unitId: data.unit.id || data.unitId,
            unitTitle: data.unit.title || "الوحدة",
            subjectId: data.unit.subject?.id,
            subjectName: data.unit.subject?.name || "المادة",
            subjectColor: data.unit.subject?.color,
            schoolCategory: data.unit.subject?.schoolCategory,
            gradeId: data.unit.subject?.grade?.id,
            gradeName: data.unit.subject?.grade?.name,
            trackId: data.unit.subject?.track?.id,
            trackName: data.unit.subject?.track?.name,
          });
        }

        setVideoUrl(data.content?.videoUrl || "");
        setAudioUrl(data.content?.audioUrl || "");
        setContentPdfUrl(data.content?.pdfUrl || "");
        setBodyText(data.content?.body || "");
        setObjectives(Array.isArray(data.content?.objectives) ? data.content.objectives : []);

        setMindMapTitle(data.mindMap?.title || `خريطة: ${data.title}`);
        setMindMapDescription(data.mindMap?.description || "");
        setMindMapImages(Array.isArray(data.mindMap?.images) ? data.mindMap.images : []);

        // Load Definitions from summary
        if (data.summary) {
          setSummaryPdfUrl(data.summary.pdfUrl || "");
          setSummaryImages(Array.isArray(data.summary.images) ? data.summary.images : []);
          setKeyConcepts(Array.isArray(data.summary.keyConcepts) ? data.summary.keyConcepts : []);
          setExamTips(Array.isArray(data.summary.examTips) ? data.summary.examTips : []);
          setCommonMistakes(
            Array.isArray(data.summary.commonMistakes) ? data.summary.commonMistakes : []
          );

          if (Array.isArray(data.summary.definitions)) {
            const formatted = data.summary.definitions
              .map((d: any) => {
                if (typeof d === "string") {
                  const parts = d.split(":");
                  return { term: parts[0]?.trim() || "", meaning: parts.slice(1).join(":")?.trim() || "" };
                }
                if (d && (d.term || d.meaning)) {
                  return { term: String(d.term || "").trim(), meaning: String(d.meaning || "").trim() };
                }
                return null;
              })
              .filter(Boolean) as DefinitionItem[];
            setDefinitions(formatted);
          }
        }

        // Load Questions from lesson include or via fetch
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(
            data.questions
              .map((ql: any) => ql.question)
              .filter(Boolean)
              .map((q: any) => ({
                id: q.id,
                statement: q.statement,
                type: q.type,
                difficulty: q.difficulty,
                options: q.options || [],
                explanation: q.explanation || null,
                rubric: q.rubric || null,
              }))
          );
        } else {
          fetchLessonQuestions();
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
  }, [lessonId, fetchLessonQuestions]);

  const handleMediaUpload = async (
    file: File,
    target: "video" | "audio" | "mindmap" | "summary_pdf" | "summary_image" | "content_pdf"
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
      } else if (target === "content_pdf") {
        setContentPdfUrl(data.url);
      } else if (target === "mindmap") {
        setMindMapImages((prev) => [...prev, data.url]);
      } else if (target === "summary_pdf") {
        setSummaryPdfUrl(data.url);
      } else if (target === "summary_image") {
        setSummaryImages((prev) => [...prev, data.url]);
      }
      setStatusMessage({ type: "success", text: "تم رفع الملف بنجاح وتعيينه" });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "تعذر رفع الملف");
    } finally {
      setUploadingMedia(null);
    }
  };

  // Mindmap Handlers
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

  // Definitions Handlers
  const handleAddDefinition = (newTerm: string, newMeaning: string) => {
    if (!newTerm.trim() || !newMeaning.trim()) return;
    setDefinitions((prev) => [...prev, { term: newTerm.trim(), meaning: newMeaning.trim() }]);
  };

  const handleRemoveDefinition = (index: number) => {
    setDefinitions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDefinition = (index: number, updatedTerm: string, updatedMeaning: string) => {
    setDefinitions((prev) =>
      prev.map((item, i) => (i === index ? { term: updatedTerm, meaning: updatedMeaning } : item))
    );
  };

  // Content Objectives Handlers
  const handleAddObjective = () => {
    const trimmed = newObjective.trim();
    if (!trimmed) return;
    setObjectives((prev) => [...prev, trimmed]);
    setNewObjective("");
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives((prev) => prev.filter((_, i) => i !== index));
  };

  // Summary Handlers
  const handleAddSummaryImage = () => {
    const trimmed = newSummaryImageUrl.trim();
    if (!trimmed) return;
    setSummaryImages((prev) => [...prev, trimmed]);
    setNewSummaryImageUrl("");
  };

  const handleRemoveSummaryImage = (index: number) => {
    setSummaryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveSummaryImage = (index: number, direction: "up" | "down") => {
    setSummaryImages((prev) => {
      const copy = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
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

  // Main Save Handler
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
        pdfUrl: contentPdfUrl.trim() || null,
        objectives,
      },
      mindMap: {
        title: mindMapTitle.trim() || title.trim(),
        description: mindMapDescription.trim() || null,
        images: mindMapImages,
      },
      summary: {
        pdfUrl: summaryPdfUrl.trim() || null,
        images: summaryImages,
        keyConcepts,
        definitions, // Saved directly to database
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

      setStatusMessage({ type: "success", text: "تم حفظ الخريطة الذهنية والتعريفات ومحتوى الدرس بنجاح! ✨" });
      if (data.lesson && onLessonUpdated) {
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

  // Delete Lesson Handler
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "تعذر حذف الدرس");
      }

      if (onLessonDeleted) {
        onLessonDeleted(lessonId);
      }

      if (isStandaloneRoute) {
        router.push("/admin/curriculum");
      } else if (onClose) {
        onClose();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل حذف الدرس");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isLoading,
    isSaving,
    isDeleting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    statusMessage,
    setStatusMessage,
    title,
    setTitle,
    order,
    setOrder,
    durationMinutes,
    setDurationMinutes,
    isPublished,
    setIsPublished,
    unitInfo,
    videoUrl,
    setVideoUrl,
    audioUrl,
    setAudioUrl,
    showPairUploadModal,
    setShowPairUploadModal,
    uploadingMedia,
    mindMapTitle,
    setMindMapTitle,
    mindMapDescription,
    setMindMapDescription,
    mindMapImages,
    setMindMapImages,
    newImageUrl,
    setNewImageUrl,
    previewLightboxImage,
    setPreviewLightboxImage,
    definitions,
    setDefinitions,
    questions,
    setQuestions,
    isLoadingQuestions,
    fetchLessonQuestions,
    bodyText,
    setBodyText,
    objectives,
    newObjective,
    setNewObjective,
    keyConcepts,
    newConcept,
    setNewConcept,
    examTips,
    newExamTip,
    setNewExamTip,
    commonMistakes,
    newMistake,
    setNewMistake,
    newCorrection,
    setNewCorrection,
    contentPdfUrl,
    setContentPdfUrl,
    summaryPdfUrl,
    setSummaryPdfUrl,
    summaryImages,
    setSummaryImages,
    newSummaryImageUrl,
    setNewSummaryImageUrl,
    handleAddSummaryImage,
    handleRemoveSummaryImage,
    handleMoveSummaryImage,
    handleMediaUpload,
    handleAddImage,
    handleRemoveImage,
    handleMoveImage,
    handleAddDefinition,
    handleRemoveDefinition,
    handleUpdateDefinition,
    handleAddObjective,
    handleRemoveObjective,
    handleAddKeyConcept,
    handleRemoveKeyConcept,
    handleAddExamTip,
    handleRemoveExamTip,
    handleAddMistake,
    handleRemoveMistake,
    handleSave,
    handleDelete,
  };
}
