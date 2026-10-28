"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LessonData, LessonEditorTabType, UnitInfo, CommonMistakeItem } from "./types";

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
  const [activeTab, setActiveTab] = useState<LessonEditorTabType>("media");

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
  const [unitInfo, setUnitInfo] = useState<UnitInfo>({ unitTitle: "", subjectName: "" });

  // Media State
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
            unitTitle: data.unit.title || "الوحدة",
            subjectName: data.unit.subject?.name || "المادة",
            subjectColor: data.unit.subject?.color,
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

        if (data.summary) {
          setSummaryPdfUrl(data.summary.pdfUrl || "");
          setSummaryImages(Array.isArray(data.summary.images) ? data.summary.images : []);
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
  }, [lessonId]);

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

      if (onLessonDeleted) {
        onLessonDeleted(lessonId);
      }

      if (isStandaloneRoute) {
        router.push("/admin/curriculum");
      } else if (onClose) {
        onClose();
      }
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
