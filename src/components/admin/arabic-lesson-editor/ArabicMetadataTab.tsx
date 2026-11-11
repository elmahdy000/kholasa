"use client";

import { useState, useRef } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileAudio,
  FileText,
  History,
  Loader2,
  Rocket,
  Save,
  Upload,
  Video,
  X,
} from "lucide-react";
import type {
  ArabicEditorLessonMeta,
  ArabicEditorQuestionRecord,
  ArabicNormalizedSection,
  ArabicVisualAsset,
  ArabicVocabularyItem,
} from "./types";
import type { ArabicLessonPayloadV1 } from "@/lib/arabic-curriculum";
import { ArabicLessonViewer } from "@/components/lessons/arabic/ArabicLessonViewer";

interface ArabicMetadataTabProps {
  lessonMeta: ArabicEditorLessonMeta;
  structured: ArabicLessonPayloadV1 | null;
  sections: ArabicNormalizedSection[];
  visualAssets: ArabicVisualAsset[];
  vocabularyItems: ArabicVocabularyItem[];
  questions: ArabicEditorQuestionRecord[];
  title: string;
  setTitle: (val: string) => void;
  order: number;
  setOrder: (val: number) => void;
  durationMinutes: number;
  setDurationMinutes: (val: number) => void;
  isPublished: boolean;
  setIsPublished: (val: boolean) => void;
  isTrial: boolean;
  setIsTrial: (val: boolean) => void;
  videoUrl: string;
  setVideoUrl: (val: string) => void;
  audioUrl: string;
  setAudioUrl: (val: string) => void;
  pdfUrl: string;
  setPdfUrl: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  isSaving: boolean;
  onSaveMode: (mode: "draft" | "publish") => Promise<void>;
}

export function ArabicMetadataTab({
  lessonMeta,
  structured,
  sections,
  visualAssets,
  vocabularyItems,
  questions,
  title,
  setTitle,
  order,
  setOrder,
  durationMinutes,
  setDurationMinutes,
  isPublished,
  setIsPublished,
  isTrial,
  setIsTrial,
  videoUrl,
  setVideoUrl,
  audioUrl,
  setAudioUrl,
  pdfUrl,
  setPdfUrl,
  notes,
  setNotes,
  isSaving,
  onSaveMode,
}: ArabicMetadataTabProps) {
  const [uploadingField, setUploadingField] = useState<"audio" | "pdf" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadMedia = async (field: "audio" | "pdf", file: File) => {
    setUploadingField(field);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل رفع الملف");
      }
      if (field === "audio") {
        setAudioUrl(data.url);
      } else {
        setPdfUrl(data.url);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "حدث خطأ أثناء رفع الملف");
    } finally {
      setUploadingField(null);
    }
  };

  const understandCount = sections.filter((s) => s.stageId === "understand").length;
  const skillsCount = sections.filter((s) => s.stageId === "skills").length;
  const assessmentCount = sections.filter((s) => s.stageId === "assessment").length;
  const uploadedAssetsCount = visualAssets.filter((a) => Boolean(a.imageUrl?.trim())).length;

  const previewStructured: ArabicLessonPayloadV1 = structured
    ? {
        ...structured,
        sections,
        visualAssets,
        vocabularyItems,
      }
    : {
        schemaVersion: "1.0.0",
        contentType: "curriculum_lesson_complete_explanation",
        language: "ar",
        textDirection: "rtl",
        education: {
          system: "البكالوريا المصرية",
          grade: 2,
          schoolLanguage: "العربي",
          subject: "اللغة العربية",
          term: 1,
          unit: { number: 1, title: lessonMeta.unit.title },
          lesson: { number: order, title },
        },
        sources: [],
        stages: [
          { id: "understand", order: 1, title: "افهم الدرس", description: "" },
          { id: "skills", order: 2, title: "اتقن المهارات", description: "" },
          { id: "practice", order: 3, title: "حل واتعلم", description: "" },
          { id: "assessment", order: 4, title: "اختبر نفسك", description: "" },
        ],
        sections,
        visualAssets,
        vocabularyItems,
        writingModels: [],
        sourceLimits: [],
        officialWeeklyAssessmentCoverage: [],
        questionMetaByJsonId: {},
      };

  return (
    <div className="space-y-5">
      {/* Validation Summary Box */}
      <div className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-black text-[#800B34] dark:text-[#E9AD32] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>فحص الجاهزية الأكاديمية للدرس قبل النشر</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#091B40] hover:bg-[#132C60] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 min-h-[38px]"
          >
            <Eye className="w-4 h-4 text-[#E9AD32]" />
            <span>معاينة الدرس كما يراه الطالب</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D214D] border border-slate-200 dark:border-[#1E3A6E]">
            <p className="text-[11px] text-[#64748B]">أقسام الشرح والمهارات</p>
            <p className="font-black text-[#800B34] dark:text-[#E9AD32] mt-0.5">
              {understandCount} فهم • {skillsCount} مهارات • {assessmentCount} تقييم
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D214D] border border-slate-200 dark:border-[#1E3A6E]">
            <p className="text-[11px] text-[#64748B]">بنك أسئلة الدرس</p>
            <p className="font-black text-[#091B40] dark:text-white mt-0.5">
              {questions.length} سؤال محفوظ المعرّف
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D214D] border border-slate-200 dark:border-[#1E3A6E]">
            <p className="text-[11px] text-[#64748B]">المفردات والدلالة</p>
            <p className="font-black text-[#091B40] dark:text-white mt-0.5">
              {vocabularyItems.length} مفردة سياقية
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D214D] border border-slate-200 dark:border-[#1E3A6E]">
            <p className="text-[11px] text-[#64748B]">الخرائط الذهنية المرفوعة</p>
            <p
              className={`font-black mt-0.5 ${
                uploadedAssetsCount === visualAssets.length && visualAssets.length > 0
                  ? "text-[#800B34] dark:text-[#E9AD32]"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {uploadedAssetsCount} من {visualAssets.length} خريطة
            </p>
          </div>
        </div>

        {uploadedAssetsCount < visualAssets.length && (
          <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              تبقّى {visualAssets.length - uploadedAssetsCount} مراجع خرائط ذهنية في تبويب «الخرائط الذهنية والوسائط» بانتظار رفع الصور من الإدارة.
            </span>
          </p>
        )}
      </div>

      {/* Metadata Fields */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-4">
        <h4 className="text-sm font-black text-[#091B40] dark:text-white">بيانات الدرس الأساسية</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="sm:col-span-2 space-y-1">
            <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">عنوان الدرس</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-bold text-[#091B40] dark:text-white"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">الترتيب</span>
              <input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-bold"
              />
            </label>
            <label className="space-y-1">
              <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">المدة (دقيقة)</span>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value) || 30)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-bold"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-1 text-xs font-bold text-[#091B40] dark:text-white">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-[#800B34]"
            />
            <span>الدرس منشور ومتاح للطلاب عند النشر</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isTrial}
              onChange={(e) => setIsTrial(e.target.checked)}
              className="w-4 h-4 accent-[#800B34]"
            />
            <span>درس مجاني مفتوح (معاينة للجميع)</span>
          </label>
        </div>
      </div>

      {/* Optional Video / Audio / PDF Media */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-4">
        <h4 className="text-sm font-black text-[#091B40] dark:text-white">
          الوسائط الاختيارية (فيديو / صوت نص الاستماع / ملف PDF)
        </h4>

        {uploadError && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
            {uploadError}
          </div>
        )}

        <div className="space-y-3 text-xs">
          <label className="block space-y-1">
            <span className="font-bold text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5">
              <Video className="w-4 h-4 text-[#800B34]" />
              <span>رابط الفيديو الاختياري (YouTube أو MP4)</span>
            </span>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737]"
            />
          </label>

          <div className="space-y-1">
            <span className="font-bold text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5">
              <FileAudio className="w-4 h-4 text-[#800B34]" />
              <span>ملف صوتي اختياري (نشاط الاستماع الرسمي أو شرح صوتي)</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="/uploads/... أو رابط صوتي"
                dir="ltr"
                className="flex-1 min-w-[200px] px-3 py-2 rounded-md border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737]"
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUploadMedia("audio", f);
                }}
              />
              <button
                type="button"
                disabled={uploadingField === "audio"}
                onClick={() => audioInputRef.current?.click()}
                className="px-3.5 py-2 rounded-md bg-[#800B34] hover:bg-[#680829] text-white font-extrabold inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                {uploadingField === "audio" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>رفع ملف صوتي</span>
              </button>
            </div>
            {audioUrl && <audio controls src={audioUrl} className="w-full mt-2" />}
          </div>

          <div className="space-y-1">
            <span className="font-bold text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>ملف PDF مرفق (اختياري)</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="/uploads/... أو رابط PDF"
                dir="ltr"
                className="flex-1 min-w-[200px] px-3 py-2 rounded-md border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737]"
              />
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUploadMedia("pdf", f);
                }}
              />
              <button
                type="button"
                disabled={uploadingField === "pdf"}
                onClick={() => pdfInputRef.current?.click()}
                className="px-3.5 py-2 rounded-md bg-[#091B40] hover:bg-[#132C60] text-white font-extrabold inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                {uploadingField === "pdf" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>رفع PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Draft & Publish Action Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
        <label className="block space-y-1 text-xs">
          <span className="font-black text-[#800B34] dark:text-[#E9AD32]">
            ملاحظة التعديل / الإصدار
          </span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: تحديث المفردات ورفع خرائط الفقرات..."
            className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-white dark:bg-[#071737]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void onSaveMode("draft")}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#0D214D] border border-[#800B34]/30 dark:border-[#1E3A6E] text-[#800B34] dark:text-[#E9AD32] text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-[#800B34]/5"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ كمسودة (Draft)</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => void onSaveMode("publish")}
            className="px-5 py-2.5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-extrabold inline-flex items-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4 text-[#E9AD32]" />}
            <span>حفظ ونشر التعديلات للطلاب (Publish)</span>
          </button>
        </div>
      </div>

      {/* Version History */}
      {lessonMeta.versions.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
          <h4 className="text-sm font-black text-[#091B40] dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-[#800B34]" />
            <span>سجل إصدارات الدرس ({lessonMeta.versions.length})</span>
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1E3A6E] text-[#64748B]">
                  <th className="py-2 pl-3">الإصدار</th>
                  <th className="py-2 pl-3">الحالة</th>
                  <th className="py-2 pl-3">الملاحظة</th>
                  <th className="py-2 pl-3">بواسطة</th>
                  <th className="py-2">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {lessonMeta.versions.map((ver) => (
                  <tr key={ver.id} className="border-b border-slate-100 dark:border-[#132C60]">
                    <td className="py-2 pl-3 font-black">v{ver.versionNumber}</td>
                    <td className="py-2 pl-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          ver.status === "PUBLISHED"
                            ? "bg-[#800B34]/10 text-[#800B34]"
                            : ver.status === "DRAFT"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ver.status === "PUBLISHED"
                          ? "منشور"
                          : ver.status === "DRAFT"
                          ? "مسودة"
                          : "مؤرشف"}
                      </span>
                    </td>
                    <td className="py-2 pl-3 font-medium text-[#334155] dark:text-[#CBD5E1]">
                      {ver.notes || "—"}
                    </td>
                    <td className="py-2 pl-3 text-[#64748B]">{ver.createdBy?.name || "الإدارة"}</td>
                    <td className="py-2 text-[#64748B]" dir="ltr">
                      {new Date(ver.createdAt).toLocaleString("ar-EG", {
                        timeZone: "Africa/Cairo",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Student Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          dir="rtl"
        >
          <div className="w-full max-w-5xl bg-[#F7F9FC] dark:bg-[#081426] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-3.5 bg-[#800B34] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black">
                <Eye className="w-4 h-4 text-[#E9AD32]" />
                <span>معاينة حية لواجهة الطالب — {title}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <ArabicLessonViewer
                lesson={{
                  id: lessonMeta.id,
                  title,
                  durationMinutes,
                  unit: {
                    id: lessonMeta.unit.id,
                    title: lessonMeta.unit.title,
                    subject: {
                      id: lessonMeta.unit.subject.id,
                      name: lessonMeta.unit.subject.name,
                      learningEngine: lessonMeta.unit.subject.learningEngine,
                    },
                    lessons: [],
                  },
                  content: {
                    id: lessonMeta.id,
                    body: "",
                    videoUrl: videoUrl || null,
                    audioUrl: audioUrl || null,
                    pdfUrl: pdfUrl || null,
                    objectives: [],
                  },
                  questions: questions.map((q) => ({
                    question: {
                      id: q.id,
                      externalKey: q.externalKey,
                      origin: q.origin,
                      skillCategory: q.skillCategory,
                      sourceReferences: q.sourceReferences,
                      statement: q.statement,
                      type: q.type,
                      difficulty: q.difficulty,
                      options: q.options.map((o) => ({
                        id: o.id,
                        text: o.text,
                        order: o.order,
                        isCorrect: o.isCorrect,
                      })),
                      rubric: q.rubric
                        ? {
                            modelAnswer: q.rubric.modelAnswer,
                            maxScore: q.rubric.maxScore,
                          }
                        : null,
                      explanation: q.explanation
                        ? {
                            id: q.explanation.id,
                            concept: q.explanation.concept,
                            correctReason: q.explanation.correctReason,
                            examTrick: q.explanation.examTrick,
                            origin: q.explanation.origin,
                            sectionId: q.explanation.sectionId,
                          }
                        : null,
                    },
                  })),
                }}
                structured={previewStructured}
                initialIsBookmarked={false}
                initialIsCompleted={false}
                previewMode={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
