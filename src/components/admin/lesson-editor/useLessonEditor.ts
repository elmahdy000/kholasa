"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
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
  const { toast } = useToast();
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
  const [isTrial, setIsTrial] = useState(false);
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
  const [mindMapImages, setMindMapImagesState] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [previewLightboxImage, setPreviewLightboxImage] = useState<string | null>(null);

  // Definitions State (المصطلحات والتعريفات)
  const [definitions, setDefinitionsState] = useState<DefinitionItem[]>([]);

  // Questions State (أسئلة الدرس)
  const [questions, setQuestions] = useState<LessonQuestionItem[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Content & Objectives State
  const [bodyText, setBodyText] = useState("");
  const [objectives, setObjectivesState] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState("");

  // Summary State (الزتونة)
  const [summaryPdfUrl, setSummaryPdfUrl] = useState("");
  const [summaryImages, setSummaryImagesState] = useState<string[]>([]);
  const [newSummaryImageUrl, setNewSummaryImageUrl] = useState("");
  const [keyConcepts, setKeyConceptsState] = useState<string[]>([]);
  const [newConcept, setNewConcept] = useState("");
  const [examTips, setExamTipsState] = useState<string[]>([]);
  const [newExamTip, setNewExamTip] = useState("");
  const [commonMistakes, setCommonMistakesState] = useState<CommonMistakeItem[]>([]);
  const [newMistake, setNewMistake] = useState("");
  const [newCorrection, setNewCorrection] = useState("");

  // Live Refs + Serialized DB Save Queue so clicking Trash never loses rapid edits
  const definitionsRef = useRef<DefinitionItem[]>([]);
  const mindMapImagesRef = useRef<string[]>([]);
  const objectivesRef = useRef<string[]>([]);
  const summaryImagesRef = useRef<string[]>([]);
  const keyConceptsRef = useRef<string[]>([]);
  const examTipsRef = useRef<string[]>([]);
  const commonMistakesRef = useRef<CommonMistakeItem[]>([]);
  const patchQueueRef = useRef<Promise<void>>(Promise.resolve());

  const queueLessonPatch = useCallback(
    (partialPayload: Record<string, unknown>, successToast?: string) => {
      patchQueueRef.current = patchQueueRef.current
        .catch(() => {})
        .then(async () => {
          const res = await fetch(`/api/admin/lessons/${lessonId}`, {
            method: "PUT",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(partialPayload),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data.error) {
            const msg = data.error || "فشل حفظ التعديل في قاعدة البيانات";
            toast.error(msg);
            setStatusMessage({ type: "error", text: msg });
            return;
          }
          if (data.lesson && onLessonUpdated) {
            onLessonUpdated(data.lesson);
          }
          if (successToast) {
            toast.success(successToast);
          }
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : "تعذر الاتصال بقاعدة البيانات";
          toast.error(msg);
          setStatusMessage({ type: "error", text: msg });
        });
    },
    [lessonId, onLessonUpdated, toast]
  );

  const setDefinitions: React.Dispatch<React.SetStateAction<DefinitionItem[]>> = useCallback(
    (action) => {
      const nextDefs =
        typeof action === "function" ? action(definitionsRef.current) : action;
      definitionsRef.current = nextDefs;
      setDefinitionsState(nextDefs);
      const toastMsg =
        nextDefs.length === 0
          ? "تم حذف جميع المصطلحات من قاعدة البيانات"
          : "تم حفظ قائمة المصطلحات في قاعدة البيانات";
      queueLessonPatch({ summary: { definitions: nextDefs } }, toastMsg);
    },
    [queueLessonPatch]
  );

  const setMindMapImages: React.Dispatch<React.SetStateAction<string[]>> = useCallback(
    (action) => {
      const next =
        typeof action === "function" ? action(mindMapImagesRef.current) : action;
      mindMapImagesRef.current = next;
      setMindMapImagesState(next);
    },
    []
  );

  const setSummaryImages: React.Dispatch<React.SetStateAction<string[]>> = useCallback(
    (action) => {
      const next =
        typeof action === "function" ? action(summaryImagesRef.current) : action;
      summaryImagesRef.current = next;
      setSummaryImagesState(next);
    },
    []
  );

  // Fetch Questions for this lesson (full relation without pagination limits)
  const fetchLessonQuestions = useCallback(() => {
    if (!lessonId) return;
    setIsLoadingQuestions(true);
    fetch(`/api/admin/lessons/${lessonId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.questions)) {
          const mapped = data.questions
            .map((item: any) => item.question || item)
            .filter(Boolean)
            .map((q: any) => ({
              id: q.id,
              statement: q.statement,
              translation: q.translation || null,
              type: q.type,
              difficulty: q.difficulty,
              options: q.options || [],
              explanation: q.explanation || null,
              rubric: q.rubric || null,
            }));
          setQuestions(mapped);
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

    fetch(`/api/admin/lessons/${lessonId}`, { cache: "no-store" })
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
        setIsTrial(Boolean(data.isTrial));

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

        const loadedObjectives = Array.isArray(data.content?.objectives)
          ? data.content.objectives
          : [];
        objectivesRef.current = loadedObjectives;
        setObjectivesState(loadedObjectives);

        setMindMapTitle(data.mindMap?.title || `خريطة: ${data.title}`);
        setMindMapDescription(data.mindMap?.description || "");
        const loadedMindMapImages = Array.isArray(data.mindMap?.images)
          ? data.mindMap.images
          : [];
        mindMapImagesRef.current = loadedMindMapImages;
        setMindMapImagesState(loadedMindMapImages);

        // Load Definitions from summary (supporting legacy keys as well)
        if (data.summary) {
          setSummaryPdfUrl(data.summary.pdfUrl || "");
          const loadedSummaryImages = Array.isArray(data.summary.images)
            ? data.summary.images
            : [];
          summaryImagesRef.current = loadedSummaryImages;
          setSummaryImagesState(loadedSummaryImages);

          const loadedKeyConcepts = Array.isArray(data.summary.keyConcepts)
            ? data.summary.keyConcepts
            : [];
          keyConceptsRef.current = loadedKeyConcepts;
          setKeyConceptsState(loadedKeyConcepts);

          const loadedExamTips = Array.isArray(data.summary.examTips)
            ? data.summary.examTips
            : [];
          examTipsRef.current = loadedExamTips;
          setExamTipsState(loadedExamTips);

          const loadedMistakes = Array.isArray(data.summary.commonMistakes)
            ? data.summary.commonMistakes
            : [];
          commonMistakesRef.current = loadedMistakes;
          setCommonMistakesState(loadedMistakes);

          if (Array.isArray(data.summary.definitions)) {
            const formatted = data.summary.definitions
              .map((d: any) => {
                if (typeof d === "string") {
                  const parts = d.split(":");
                  return {
                    term: parts[0]?.trim() || "",
                    meaning: parts.slice(1).join(":")?.trim() || "",
                  };
                }
                const resolvedTerm = String(
                  d?.term ?? d?.name ?? d?.word ?? d?.title ?? d?.concept ?? ""
                ).trim();
                const resolvedMeaning = String(
                  d?.meaning ?? d?.definition ?? d?.desc ?? d?.description ?? ""
                ).trim();
                if (d && (resolvedTerm || resolvedMeaning)) {
                  return {
                    term: resolvedTerm,
                    meaning: resolvedMeaning,
                    translation: d.translation ? String(d.translation).trim() : undefined,
                  };
                }
                return null;
              })
              .filter(Boolean) as DefinitionItem[];
            definitionsRef.current = formatted;
            setDefinitionsState(formatted);
          } else {
            definitionsRef.current = [];
            setDefinitionsState([]);
          }
        } else {
          definitionsRef.current = [];
          setDefinitionsState([]);
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
                translation: q.translation || null,
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
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "فشل رفع الملف");

      if (target === "video") setVideoUrl(data.url);
      else if (target === "audio") setAudioUrl(data.url);
      else if (target === "content_pdf") setContentPdfUrl(data.url);
      else if (target === "summary_pdf") setSummaryPdfUrl(data.url);
      else if (target === "summary_image") {
        setSummaryImages((prev) => [...prev, data.url]);
      } else if (target === "mindmap") {
        setMindMapImages((prev) => [...prev, data.url]);
      }
      toast.success("تم رفع الملف بنجاح");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطأ أثناء الرفع";
      setStatusMessage({ type: "error", text: msg });
      toast.error(msg);
    } finally {
      setUploadingMedia(null);
    }
  };

  // Mindmap Handlers
  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    const next = [...mindMapImagesRef.current, trimmed];
    mindMapImagesRef.current = next;
    setMindMapImagesState(next);
    setNewImageUrl("");
    queueLessonPatch({ mindMap: { images: next } }, "تم حفظ صورة الخريطة الذهنية في قاعدة البيانات");
  };

  const handleRemoveImage = (index: number) => {
    const next = mindMapImagesRef.current.filter((_, i) => i !== index);
    mindMapImagesRef.current = next;
    setMindMapImagesState(next);
    queueLessonPatch({ mindMap: { images: next } }, "تم حذف صورة الخريطة الذهنية من قاعدة البيانات");
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const copy = [...mindMapImagesRef.current];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= copy.length) return;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    mindMapImagesRef.current = copy;
    setMindMapImagesState(copy);
    queueLessonPatch({ mindMap: { images: copy } });
  };

  // Definitions Handlers (each commits cleanly to DB)
  const handleAddDefinition = (newTerm: string, newMeaning: string, newTranslation?: string) => {
    if (!newTerm.trim() || !newMeaning.trim()) return;
    setDefinitions((prev) => [
      ...prev,
      {
        term: newTerm.trim(),
        meaning: newMeaning.trim(),
        translation: newTranslation && newTranslation.trim() ? newTranslation.trim() : undefined,
      },
    ]);
  };

  const handleRemoveDefinition = (index: number) => {
    const nextDefs = definitionsRef.current.filter((_, i) => i !== index);
    definitionsRef.current = nextDefs;
    setDefinitionsState(nextDefs);
    queueLessonPatch({ summary: { definitions: nextDefs } }, "تم حذف المصطلح من قاعدة البيانات");
  };

  const handleUpdateDefinition = (
    index: number,
    updatedTerm: string,
    updatedMeaning: string,
    updatedTranslation?: string
  ) => {
    setDefinitions((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              term: updatedTerm,
              meaning: updatedMeaning,
              translation: updatedTranslation && updatedTranslation.trim() ? updatedTranslation.trim() : undefined,
            }
          : item
      )
    );
  };

  // Content Objectives Handlers
  const handleAddObjective = () => {
    const trimmed = newObjective.trim();
    if (!trimmed) return;
    const next = [...objectivesRef.current, trimmed];
    objectivesRef.current = next;
    setObjectivesState(next);
    setNewObjective("");
    queueLessonPatch({ content: { objectives: next } });
  };

  const handleRemoveObjective = (index: number) => {
    const next = objectivesRef.current.filter((_, i) => i !== index);
    objectivesRef.current = next;
    setObjectivesState(next);
    queueLessonPatch({ content: { objectives: next } }, "تم حذف الهدف من قاعدة البيانات");
  };

  // Summary Handlers
  const handleAddSummaryImage = () => {
    const trimmed = newSummaryImageUrl.trim();
    if (!trimmed) return;
    const next = [...summaryImagesRef.current, trimmed];
    summaryImagesRef.current = next;
    setSummaryImagesState(next);
    setNewSummaryImageUrl("");
    queueLessonPatch({ summary: { images: next } });
  };

  const handleRemoveSummaryImage = (index: number) => {
    const next = summaryImagesRef.current.filter((_, i) => i !== index);
    summaryImagesRef.current = next;
    setSummaryImagesState(next);
    queueLessonPatch({ summary: { images: next } }, "تم حذف الصورة من قاعدة البيانات");
  };

  const handleMoveSummaryImage = (index: number, direction: "up" | "down") => {
    const copy = [...summaryImagesRef.current];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= copy.length) return;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    summaryImagesRef.current = copy;
    setSummaryImagesState(copy);
    queueLessonPatch({ summary: { images: copy } });
  };

  const handleAddKeyConcept = () => {
    const trimmed = newConcept.trim();
    if (!trimmed) return;
    const next = [...keyConceptsRef.current, trimmed];
    keyConceptsRef.current = next;
    setKeyConceptsState(next);
    setNewConcept("");
    queueLessonPatch({ summary: { keyConcepts: next } });
  };

  const handleRemoveKeyConcept = (index: number) => {
    const next = keyConceptsRef.current.filter((_, i) => i !== index);
    keyConceptsRef.current = next;
    setKeyConceptsState(next);
    queueLessonPatch({ summary: { keyConcepts: next } }, "تم حذف الفكرة من قاعدة البيانات");
  };

  const handleAddExamTip = () => {
    const trimmed = newExamTip.trim();
    if (!trimmed) return;
    const next = [...examTipsRef.current, trimmed];
    examTipsRef.current = next;
    setExamTipsState(next);
    setNewExamTip("");
    queueLessonPatch({ summary: { examTips: next } });
  };

  const handleRemoveExamTip = (index: number) => {
    const next = examTipsRef.current.filter((_, i) => i !== index);
    examTipsRef.current = next;
    setExamTipsState(next);
    queueLessonPatch({ summary: { examTips: next } }, "تم حذف التنبيه من قاعدة البيانات");
  };

  const handleAddMistake = () => {
    if (!newMistake.trim() || !newCorrection.trim()) return;
    const next = [
      ...commonMistakesRef.current,
      { mistake: newMistake.trim(), correction: newCorrection.trim() },
    ];
    commonMistakesRef.current = next;
    setCommonMistakesState(next);
    setNewMistake("");
    setNewCorrection("");
    queueLessonPatch({ summary: { commonMistakes: next } });
  };

  const handleRemoveMistake = (index: number) => {
    const next = commonMistakesRef.current.filter((_, i) => i !== index);
    commonMistakesRef.current = next;
    setCommonMistakesState(next);
    queueLessonPatch({ summary: { commonMistakes: next } }, "تم حذف الخطأ الشائع من قاعدة البيانات");
  };

  // Main Save Handler
  const handleSave = async () => {
    if (!title.trim()) {
      setStatusMessage({ type: "error", text: "عنوان الدرس مطلوب" });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    await patchQueueRef.current.catch(() => {});

    const payload = {
      title: title.trim(),
      order: Number(order),
      durationMinutes: Number(durationMinutes),
      isPublished: Boolean(isPublished),
      isTrial: Boolean(isTrial),
      content: {
        body: bodyText,
        videoUrl: videoUrl.trim() || null,
        audioUrl: audioUrl.trim() || null,
        pdfUrl: contentPdfUrl.trim() || null,
        objectives: objectivesRef.current,
      },
      mindMap: {
        title: mindMapTitle.trim() || title.trim(),
        description: mindMapDescription.trim() || null,
        images: mindMapImagesRef.current,
      },
      summary: {
        pdfUrl: summaryPdfUrl.trim() || null,
        images: summaryImagesRef.current,
        keyConcepts: keyConceptsRef.current,
        definitions: definitionsRef.current,
        examTips: examTipsRef.current,
        commonMistakes: commonMistakesRef.current,
      },
    };

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PUT",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "فشل حفظ الدرس");
      }

      setStatusMessage({
        type: "success",
        text: "تم حفظ الخريطة الذهنية والتعريفات ومحتوى الدرس بنجاح! ✨",
      });
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
        cache: "no-store",
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
      const msg = err instanceof Error ? err.message : "فشل حذف الدرس";
      setStatusMessage({ type: "error", text: msg });
      toast.error(msg);
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
