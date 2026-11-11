"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Rocket,
  Save,
  Settings2,
  UploadCloud,
  X,
} from "lucide-react";
import type { LessonData } from "../lesson-editor/types";
import type {
  ArabicEditorLessonMeta,
  ArabicEditorQuestionRecord,
  ArabicEditorTabId,
  ArabicLessonEditorPayload,
  ArabicNormalizedSection,
  ArabicVisualAsset,
  ArabicVocabularyItem,
} from "./types";
import type { ArabicLessonPayloadV1 } from "@/lib/arabic-curriculum";
import { ArabicSectionsTab } from "./ArabicSectionsTab";
import { ArabicVisualAssetsTab } from "./ArabicVisualAssetsTab";
import { ArabicVocabularyTab } from "./ArabicVocabularyTab";
import { ArabicQuestionsTab } from "./ArabicQuestionsTab";
import { ArabicMetadataTab } from "./ArabicMetadataTab";

export interface ArabicLessonEditorFormProps {
  lessonId: string;
  isStandaloneRoute?: boolean;
  onClose?: () => void;
  onLessonUpdated?: (updatedLesson: LessonData) => void;
}

export function ArabicLessonEditorForm({
  lessonId,
  isStandaloneRoute = false,
  onClose,
  onLessonUpdated,
}: ArabicLessonEditorFormProps) {
  const [activeTab, setActiveTab] = useState<ArabicEditorTabId>("content");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [lessonMeta, setLessonMeta] = useState<ArabicEditorLessonMeta | null>(null);
  const [structured, setStructured] = useState<ArabicLessonPayloadV1 | null>(null);
  const [sections, setSections] = useState<ArabicNormalizedSection[]>([]);
  const [visualAssets, setVisualAssets] = useState<ArabicVisualAsset[]>([]);
  const [vocabularyItems, setVocabularyItems] = useState<ArabicVocabularyItem[]>([]);
  const vocabSaveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [questions, setQuestions] = useState<ArabicEditorQuestionRecord[]>([]);

  const [practiceQuestionIds, setPracticeQuestionIds] = useState<string[]>([]);
  const [finalQuestionIds, setFinalQuestionIds] = useState<string[]>([]);

  // Metadata fields
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [isPublished, setIsPublished] = useState(true);
  const [isTrial, setIsTrial] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [notes, setNotes] = useState("");

  const applyPayload = useCallback((data: ArabicLessonEditorPayload) => {
    setLessonMeta(data.lesson);
    setStructured(data.structured);
    setSections(data.structured?.sections || []);
    setVisualAssets(data.structured?.visualAssets || []);
    setVocabularyItems(data.structured?.vocabularyItems || []);
    setQuestions(data.questions || []);
    setPracticeQuestionIds(data.structured?.practiceStage?.questionIds || []);
    setFinalQuestionIds(data.structured?.finalAssessment?.questionIds || []);

    setTitle(data.lesson.title);
    setOrder(data.lesson.order);
    setDurationMinutes(data.lesson.durationMinutes);
    setIsPublished(data.lesson.isPublished);
    setIsTrial(data.lesson.isTrial);
    setVideoUrl(data.lesson.videoUrl || "");
    setAudioUrl(data.lesson.audioUrl || "");
    setPdfUrl(data.lesson.pdfUrl || "");
  }, []);

  const loadEditorData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/arabic-lessons/${lessonId}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as ArabicLessonEditorPayload & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحميل بيانات درس اللغة العربية");
      }
      applyPayload(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "خطأ غير متوقع أثناء التحميل");
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, applyPayload]);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/arabic-lessons/${lessonId}`, { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json()) as ArabicLessonEditorPayload & { error?: string };
        if (!res.ok) throw new Error(data.error || "تعذر تحميل بيانات درس اللغة العربية");
        return data;
      })
      .then((data) => {
        if (!active) return;
        applyPayload(data);
        setLoadError(null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "خطأ غير متوقع أثناء التحميل");
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lessonId, applyPayload]);

  const handleSaveMode = async (mode: "draft" | "publish") => {
    if (!lessonMeta) return;
    setIsSaving(true);
    setStatusMessage(null);
    await vocabSaveQueueRef.current.catch(() => {});
    try {
      const res = await fetch(`/api/admin/arabic-lessons/${lessonId}`, {
        method: "PUT",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || lessonMeta.title,
          order,
          durationMinutes,
          isPublished,
          isTrial,
          videoUrl: videoUrl.trim() || null,
          audioUrl: audioUrl.trim() || null,
          pdfUrl: pdfUrl.trim() || null,
          sections,
          visualAssets,
          vocabularyItems,
          practiceStage: {
            ...(structured?.practiceStage || { id: "practice", order: 3, title: "حل واتعلم" }),
            questionIds: practiceQuestionIds,
          },
          finalAssessment: {
            ...(structured?.finalAssessment || {}),
            questionIds: finalQuestionIds,
          },
          publishMode: mode,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ تعديلات درس اللغة العربية");
      }

      setStatusMessage({
        type: "success",
        text:
          mode === "publish"
            ? `تم حفظ ونشر التعديلات بنجاح (الإصدار v${data.version?.versionNumber || ""})`
            : `تم حفظ المسودة بنجاح (الإصدار v${data.version?.versionNumber || ""})`,
      });
      setNotes("");

      await loadEditorData();

      if (mode === "publish" && onLessonUpdated) {
        onLessonUpdated({
          id: lessonMeta.id,
          title: title.trim() || lessonMeta.title,
          order,
          durationMinutes,
          isPublished,
          isTrial,
          unitId: lessonMeta.unit.id,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "تعذر حفظ التعديلات",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="p-12 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] flex flex-col items-center justify-center gap-3 text-center"
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#800B34] dark:text-[#E9AD32]" />
        <p className="text-xs sm:text-sm font-black text-[#800B34] dark:text-white">
          جاري تحميل محرر اللغة العربية المتخصص...
        </p>
      </div>
    );
  }

  if (loadError || !lessonMeta) {
    return (
      <div
        dir="rtl"
        className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-3"
      >
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 text-sm font-black">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{loadError || "تعذر تحميل الدرس"}</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-800"
          >
            إغلاق
          </button>
        )}
      </div>
    );
  }

  const tabs: Array<{
    id: ArabicEditorTabId;
    label: string;
    countLabel?: string;
    icon: typeof BookOpen;
  }> = [
    {
      id: "content",
      label: "الشرح والمحتوى",
      countLabel: `${sections.length} قسم`,
      icon: BookOpen,
    },
    {
      id: "assets",
      label: "الخرائط الذهنية والوسائط",
      countLabel: `${visualAssets.filter((a) => Boolean(a.imageUrl)).length}/${visualAssets.length}`,
      icon: ImageIcon,
    },
    {
      id: "vocabulary",
      label: "المفردات والدلالة السياقية",
      countLabel: `${vocabularyItems.length}`,
      icon: BookOpenCheck,
    },
    {
      id: "questions",
      label: "أسئلة وتدريبات الدرس",
      countLabel: `${questions.length}`,
      icon: HelpCircle,
    },
    {
      id: "publish",
      label: "بيانات الدرس والنشر",
      icon: Settings2,
    },
  ];

  return (
    <div
      dir="rtl"
      className={`bg-[#F7F9FC] dark:bg-[#081426] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-xl overflow-hidden flex flex-col ${
        isStandaloneRoute ? "min-h-[75vh]" : "max-h-[90vh]"
      }`}
    >
      {/* Dedicated Arabic Identity Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-l from-[#800B34] to-[#091B40] text-white space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-white/80">
              {isStandaloneRoute && (
                <Link
                  href="/admin/curriculum"
                  className="inline-flex items-center gap-1 hover:text-white underline-offset-2 hover:underline"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>الهيكل الدراسي</span>
                </Link>
              )}
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-[#E9AD32]">
                محرر اللغة العربية المتخصص
              </span>
              <span>
                {lessonMeta.unit.subject.grade?.name || "تانية بكالوريا"} • {lessonMeta.unit.title}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black truncate">{title || lessonMeta.title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href={`/lessons/${lessonId}`}
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>صفحة الطالب</span>
            </Link>

            <Link
              href="/admin/curriculum/arabic"
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-300/30 text-[#E9AD32] text-xs font-extrabold inline-flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>استوديو JSON</span>
            </Link>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 5 Arabic Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  active
                    ? "bg-white text-[#800B34] shadow-xs"
                    : "bg-white/10 text-white/90 hover:bg-white/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.countLabel && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] tabular-nums ${
                      active ? "bg-[#800B34]/10 text-[#800B34]" : "bg-black/20 text-white"
                    }`}
                  >
                    {tab.countLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {activeTab === "content" && (
          <ArabicSectionsTab
            sections={sections}
            onChangeSections={setSections}
            practiceQuestionIds={practiceQuestionIds}
            finalAssessmentQuestionIds={finalQuestionIds}
            questions={questions}
          />
        )}

        {activeTab === "assets" && (
          <ArabicVisualAssetsTab
            assets={visualAssets}
            sections={sections}
            onChangeAssets={setVisualAssets}
          />
        )}

        {activeTab === "vocabulary" && (
          <ArabicVocabularyTab
            items={vocabularyItems}
            questions={questions}
            onChangeItems={setVocabularyItems}
            onDeleteItem={(_id, nextItems) => {
              setVocabularyItems(nextItems);
              if (!lessonMeta) return;
              vocabSaveQueueRef.current = vocabSaveQueueRef.current
                .catch(() => {})
                .then(async () => {
                  const res = await fetch(`/api/admin/arabic-lessons/${lessonId}`, {
                    method: "PUT",
                    cache: "no-store",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      vocabularyItems: nextItems,
                      publishMode: "publish",
                      notes: "حذف مفردة من محرر اللغة العربية",
                    }),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setStatusMessage({
                      type: "error",
                      text: data.error || "تعذر حذف المفردة من قاعدة البيانات",
                    });
                    return;
                  }
                  setStatusMessage({
                    type: "success",
                    text: `تم حذف المفردة وحفظ الدرس في قاعدة البيانات (v${data.version?.versionNumber || ""})`,
                  });
                })
                .catch((err) => {
                  setStatusMessage({
                    type: "error",
                    text: err instanceof Error ? err.message : "تعذر حفظ حذف المفردة",
                  });
                });
            }}
          />
        )}

        {activeTab === "questions" && (
          <ArabicQuestionsTab
            lessonId={lessonId}
            sections={sections}
            questions={questions}
            practiceQuestionIds={practiceQuestionIds}
            finalQuestionIds={finalQuestionIds}
            onQuestionSaved={(saved, membership) => {
              setQuestions((prev) => {
                const idx = prev.findIndex((q) => q.id === saved.id);
                if (idx >= 0) {
                  return prev.map((q) => (q.id === saved.id ? saved : q));
                }
                return [...prev, saved];
              });

              if (membership) {
                const { externalKey, inPractice, inFinal } = membership;
                setPracticeQuestionIds((prev) => {
                  const set = new Set(prev);
                  if (inPractice) set.add(externalKey);
                  else set.delete(externalKey);
                  return Array.from(set);
                });
                setFinalQuestionIds((prev) => {
                  const set = new Set(prev);
                  if (inFinal) set.add(externalKey);
                  else set.delete(externalKey);
                  return Array.from(set);
                });
              }
            }}
            onQuestionDeleted={(deletedId, externalKey) => {
              setQuestions((prev) => prev.filter((q) => q.id !== deletedId));
              if (externalKey) {
                setPracticeQuestionIds((prev) => prev.filter((k) => k !== externalKey));
                setFinalQuestionIds((prev) => prev.filter((k) => k !== externalKey));
              }
            }}
          />
        )}

        {activeTab === "publish" && (
          <ArabicMetadataTab
            lessonMeta={lessonMeta}
            structured={structured}
            sections={sections}
            visualAssets={visualAssets}
            vocabularyItems={vocabularyItems}
            questions={questions}
            title={title}
            setTitle={setTitle}
            order={order}
            setOrder={setOrder}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            isPublished={isPublished}
            setIsPublished={setIsPublished}
            isTrial={isTrial}
            setIsTrial={setIsTrial}
            videoUrl={videoUrl}
            setVideoUrl={setVideoUrl}
            audioUrl={audioUrl}
            setAudioUrl={setAudioUrl}
            pdfUrl={pdfUrl}
            setPdfUrl={setPdfUrl}
            notes={notes}
            setNotes={setNotes}
            isSaving={isSaving}
            onSaveMode={handleSaveMode}
          />
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="p-3.5 sm:px-5 bg-white dark:bg-[#0D214D] border-t border-[#E2E8F0] dark:border-[#1E3A6E] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
          <span>المسار: بكالوريا تانية • اللغة العربية (مشترك لجميع المسارات)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSaveMode("draft")}
            className="px-3.5 py-2 rounded-xl border border-[#800B34]/30 dark:border-[#1E3A6E] text-[#800B34] dark:text-[#E9AD32] text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-[#800B34]/5"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>حفظ مسودة</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSaveMode("publish")}
            className="px-4 py-2 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-extrabold inline-flex items-center gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Rocket className="w-3.5 h-3.5 text-[#E9AD32]" />
            )}
            <span>حفظ ونشر</span>
          </button>
        </div>
      </div>
    </div>
  );
}
