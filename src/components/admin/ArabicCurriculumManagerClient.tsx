"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Eye,
  FileJson,
  History,
  Monitor,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import {
  ARABIC_CONTENT_BLOCK_TYPES,
  ARABIC_ORIGIN_LABELS,
  type ArabicImportValidationReport,
  type ArabicLessonPayloadV1,
  type ArabicQuestionOriginEnum,
} from "@/lib/arabic-curriculum";
import { ArabicLessonViewer } from "@/components/lessons/arabic/ArabicLessonViewer";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { Question } from "@/components/lessons/types";

interface VersionItem {
  id: string;
  versionNumber: number;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  notes: string | null;
  createdAt: string;
  publishedAt: string | null;
  validationReport: ArabicImportValidationReport | null;
  structuredData: ArabicLessonPayloadV1 | null;
  createdBy: { id: string; name: string | null } | null;
}

interface ArabicLessonNode {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  versions: VersionItem[];
  _count: { sections: number; questions: number };
}

interface ArabicUnitNode {
  id: string;
  title: string;
  order: number;
  lessons: ArabicLessonNode[];
}

export interface ArabicSubjectWorkspace {
  id: string;
  name: string;
  code: string;
  isCommonCategory: boolean;
  isUnderConstruction: boolean;
  learningEngine: string;
  grade: { id: string; name: string; code: string };
  system: { id: string; name: string; code: string };
  units: ArabicUnitNode[];
}

interface PreviewResponse {
  payload: ArabicLessonPayloadV1 | null;
  report: ArabicImportValidationReport;
  dbCheck: {
    targetLessonTitle: string | null;
    existingMatchedByKey: number;
    duplicateStatementsInOtherLessons: Array<{
      jsonId: string;
      existingQuestionId: string;
      statement: string;
    }>;
    newQuestionsCount: number;
  };
}

interface ArabicCurriculumManagerClientProps {
  initialSubjects: ArabicSubjectWorkspace[];
}

const BLOCK_TYPE_ARABIC: Record<string, string> = {
  teacher_explanation: "شرح المعلم",
  mind_map: "خريطة ذهنية",
  reading_passage: "نص قرائي متحرر",
  vocabulary: "مفردات سياقية",
  comparison: "مقارنة / تسلسل",
  worked_example: "نموذج إعرابي محلول",
  exam_trick: "تركة امتحان",
  common_mistake: "خطأ شائع",
  key_takeaway: "مفاهيم / قائمة مراجعة",
  practice_question: "تطبيق سؤال",
  grammar_rule: "شروط قاعدة نحوية",
  grammar_table: "جدول إعراب",
  writing_task: "ورشة تعبير",
  listening_activity: "نشاط استماع",
  speaking_activity: "نشاط تحدث ومقابلة",
};

const VERSION_STATUS_LABELS: Record<
  string,
  { label: string; cls: string }
> = {
  PUBLISHED: {
    label: "منشور ومفعّل",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  DRAFT: {
    label: "مسودة للمراجعة",
    cls: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  ARCHIVED: {
    label: "أرشيف سابق",
    cls: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  },
};

export function ArabicCurriculumManagerClient({
  initialSubjects,
}: ArabicCurriculumManagerClientProps) {
  const [subjects, setSubjects] =
    useState<ArabicSubjectWorkspace[]>(initialSubjects);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjects[0]?.id || ""
  );
  const activeSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) || subjects[0],
    [subjects, selectedSubjectId]
  );

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    initialSubjects[0]?.units[0]?.id || ""
  );
  const activeUnit = useMemo(
    () =>
      activeSubject?.units.find((u) => u.id === selectedUnitId) ||
      activeSubject?.units[0],
    [activeSubject, selectedUnitId]
  );

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    initialSubjects[0]?.units[0]?.lessons[0]?.id || ""
  );
  const activeLesson = useMemo(
    () =>
      activeUnit?.lessons.find((l) => l.id === selectedLessonId) ||
      activeUnit?.lessons[0],
    [activeUnit, selectedLessonId]
  );

  const [rawJsonText, setRawJsonText] = useState<string>("");
  const [draftNotes, setDraftNotes] = useState<string>("");
  const [previewResult, setPreviewResult] = useState<PreviewResponse | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [showStudentPreview, setShowStudentPreview] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action?: () => Promise<void>;
  }>({ isOpen: false, title: "", description: "" });

  const refreshWorkspace = async () => {
    const res = await fetch("/api/admin/arabic-curriculum");
    if (res.ok) {
      const data = await res.json();
      setSubjects(data.subjects || []);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRawJsonText(text);
    setStatusMessage(null);
    setPreviewResult(null);
  };

  const parseJsonSafe = (): unknown | null => {
    try {
      return JSON.parse(rawJsonText);
    } catch {
      setStatusMessage({
        type: "error",
        text: "صيغة JSON غير صالحة نحوياً — تأكد من إغلاق الأقواس والفواصل.",
      });
      return null;
    }
  };

  const handleRunPreview = async () => {
    const parsed = parseJsonSafe();
    if (!parsed) return;
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/arabic-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          lessonId: activeLesson?.id,
          rawJson: parsed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: data.error || "تعذر فحص الملف" });
        return;
      }
      setPreviewResult(data);
      setShowStudentPreview(Boolean(data.payload));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!activeLesson) return;
    const parsed = parseJsonSafe();
    if (!parsed) return;
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/arabic-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_draft",
          lessonId: activeLesson.id,
          notes: draftNotes,
          rawJson: parsed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: data.error || "فشل حفظ المسودة" });
        return;
      }
      await refreshWorkspace();
      setStatusMessage({
        type: "success",
        text: `تم حفظ المسودة v${data.version?.versionNumber} بأمان دون التأثير على المحتوى المنشور.`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerPublish = (version: VersionItem) => {
    if (!activeLesson) return;
    setConfirmModal({
      isOpen: true,
      title: `اعتماد ونشر الإصدار v${version.versionNumber}`,
      description:
        "سيتم تفعيل هذا الإصدار للطلاب وتحديث أقسام الدرس وبنك الأسئلة المرتبط به، وأرشفة الإصدار المنشور السابق.",
      action: async () => {
        setIsProcessing(true);
        try {
          const res = await fetch("/api/admin/arabic-curriculum", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "publish",
              lessonId: activeLesson.id,
              versionId: version.id,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "فشل النشر");
          await refreshWorkspace();
          setConfirmModal((p) => ({ ...p, isOpen: false }));
          setStatusMessage({
            type: "success",
            text: `تم نشر v${version.versionNumber} وتزامن ${data.syncedSectionsCount} قسم و ${data.syncedQuestionsCount} سؤال.`,
          });
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  const triggerRollback = (version: VersionItem) => {
    if (!activeLesson) return;
    setConfirmModal({
      isOpen: true,
      title: `استرجاع الإصدار السابق v${version.versionNumber}`,
      description:
        "هل تريد التراجع إلى هذا الإصدار المؤرشف وإعادة نشره كنسخة معتمدة للدرس؟",
      action: async () => {
        setIsProcessing(true);
        try {
          const res = await fetch("/api/admin/arabic-curriculum", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "rollback",
              lessonId: activeLesson.id,
              versionId: version.id,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "فشل الاسترجاع");
          await refreshWorkspace();
          setConfirmModal((p) => ({ ...p, isOpen: false }));
          setStatusMessage({
            type: "success",
            text: `تم استرجاع v${version.versionNumber} ونشره بنجاح.`,
          });
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  // Build synthetic Question[] for live Admin Preview
  const previewMockLesson = useMemo(() => {
    if (!previewResult?.payload || !activeLesson || !activeSubject || !activeUnit) return null;
    const pl = previewResult.payload;
    const questions: Array<{ question: Question }> = (pl.questions || []).map(
      (q, idx) => ({
        question: {
          id: q.jsonId || `prev-${idx}`,
          externalKey: q.jsonId,
          origin: q.originEnum,
          skillCategory: q.skillCategory,
          sourceReferences: q.sourceReferences || null,
          statement: q.statement,
          type: q.type || "MCQ",
          difficulty: q.difficulty || "MEDIUM",
          options: (q.options || []).map((o, oIdx) => ({
            id: `${q.jsonId}-opt-${oIdx}`,
            text: o.text,
            order: oIdx + 1,
            isCorrect: o.isCorrect,
          })),
          explanation: q.explanation
            ? {
                concept: q.concept || "تحليل",
                correctReason: q.explanation,
                examTrick: q.examTrick || null,
                origin: q.rawOrigin || null,
              }
            : null,
          rubric: q.modelAnswer
            ? {
                modelAnswer: q.modelAnswer,
                maxScore: q.points || 10,
              }
            : null,
        },
      })
    );

    return {
      id: activeLesson.id,
      title: pl.education.lesson.title || activeLesson.title,
      durationMinutes: activeLesson.durationMinutes,
      unit: {
        id: activeUnit.id,
        title: activeUnit.title,
        subject: {
          id: activeSubject.id,
          name: activeSubject.name,
          learningEngine: "ARABIC_GUIDED",
        },
        lessons: activeUnit.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          order: l.order,
        })),
      },
      content: { body: "", objectives: [] },
      summary: null,
      mindMap: null,
      questions,
    };
  }, [previewResult, activeLesson, activeSubject, activeUnit]);

  return (
    <div dir="rtl" className="space-y-6 text-right font-sans">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-[#0F172A] dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#800B34]" />
            <span>استوديو استيراد وإدارة منهج اللغة العربية (JSON)</span>
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            مخصص لمواد اللغة العربية المفعّلة بمحرك <code>ARABIC_GUIDED</code> فقط — يتيح الفحص والمعاينة وحفظ المسودات والنشر التدريجي والتراجع الآمن دون التأثير على أي مادة أخرى.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold self-start sm:self-center">
          لا ينشر تلقائياً قبل موافقتك
        </span>
      </div>

      {subjects.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-dashed border-[#CBD5E1] text-center space-y-2">
          <p className="text-sm font-black text-[#0F172A] dark:text-white">
            لا توجد مواد مفعّلة بمحرك اللغة العربية (ARABIC_GUIDED) حتى الآن
          </p>
          <p className="text-xs text-[#64748B]">
            قم بتشغيل سكريبت التأسيس أو تفعيل خاصية learningEngine = ARABIC_GUIDED للمادة من هيكل المنهج.
          </p>
        </div>
      ) : (
        <>
          {/* Step 1: Select Subject -> Unit -> Lesson */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
            <h2 className="text-sm font-black text-[#0F172A] dark:text-white">
              ١. حدد الدرس المستهدف داخل منهج اللغة العربية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1">المادة</label>
                <select
                  value={activeSubject?.id || ""}
                  onChange={(e) => {
                    const s = subjects.find((x) => x.id === e.target.value);
                    setSelectedSubjectId(e.target.value);
                    setSelectedUnitId(s?.units[0]?.id || "");
                    setSelectedLessonId(s?.units[0]?.lessons[0]?.id || "");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.grade.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1">الوحدة</label>
                <select
                  value={activeUnit?.id || ""}
                  onChange={(e) => {
                    const u = activeSubject?.units.find((x) => x.id === e.target.value);
                    setSelectedUnitId(e.target.value);
                    setSelectedLessonId(u?.lessons[0]?.id || "");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-white"
                >
                  {(activeSubject?.units || []).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1">الدرس</label>
                <select
                  value={activeLesson?.id || ""}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-white"
                >
                  {(activeUnit?.lessons || []).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l._count.sections} قسم • {l._count.questions} سؤال)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Upload / Paste & Validate JSON */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <FileJson className="w-4 h-4 text-[#800B34]" />
                <span>٢. رفع أو لصق ملف JSON الخاص بالدرس</span>
              </h2>
              <label className="px-3.5 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] text-xs font-extrabold text-[#0F172A] dark:text-white cursor-pointer inline-flex items-center gap-1.5 self-start">
                <Upload className="w-3.5 h-3.5 text-[#800B34]" />
                <span>اختر ملف .json</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <textarea
              rows={8}
              dir="ltr"
              value={rawJsonText}
              onChange={(e) => setRawJsonText(e.target.value)}
              placeholder='{"schemaVersion": "...", "education": {...}, "sections": [...], "questionBank": [...]}'
              className="w-full p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] font-mono text-xs text-[#0F172A] dark:text-white"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <input
                type="text"
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="ملاحظة اختيارية للإصدار (مثلاً: تحديث أسئلة التقييمات الأسبوعية)"
                className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#0F172A] dark:text-white"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isProcessing || !rawJsonText.trim()}
                  onClick={handleRunPreview}
                  className="px-4 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs font-extrabold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  <span>فحص ومعاينة المحتوى</span>
                </button>
                <button
                  type="button"
                  disabled={
                    isProcessing ||
                    !activeLesson ||
                    !previewResult?.report.valid
                  }
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 rounded-xl bg-[#800B34] hover:bg-[#6A082A] text-white text-xs font-extrabold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ كمسودة (Draft)</span>
                </button>
              </div>
            </div>

            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>

          {/* Step 3: Validation Report + Interactive Preview */}
          {previewResult && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#800B34]" />
                    <span>تقرير الفحص الهيكلي وفحص التكرار والمصادر</span>
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      previewResult.report.valid
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {previewResult.report.valid
                      ? "صالح للحفظ كمسودة ✓"
                      : "يحتوي على أخطاء تمنع النشر ✕"}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]">
                    <p className="text-[#64748B]">المراحل / الأقسام</p>
                    <p className="text-lg font-black text-[#0F172A] dark:text-white tabular-nums">
                      {previewResult.report.summary.stagesCount} /{" "}
                      {previewResult.report.summary.sectionsCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]">
                    <p className="text-[#64748B]">الكتل التعليمية (Blocks)</p>
                    <p className="text-lg font-black text-[#0F172A] dark:text-white tabular-nums">
                      {previewResult.report.summary.blocksCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]">
                    <p className="text-[#64748B]">الأسئلة (جديد / مطابقة)</p>
                    <p className="text-lg font-black text-[#0F172A] dark:text-white tabular-nums">
                      {previewResult.report.summary.questionsCount} (
                      {previewResult.dbCheck.newQuestionsCount} جديد)
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]">
                    <p className="text-[#64748B]">التوزيع (MCQ/TF/ESSAY)</p>
                    <p className="text-sm font-black text-[#0F172A] dark:text-white tabular-nums mt-1">
                      {previewResult.report.summary.mcqCount} /{" "}
                      {previewResult.report.summary.tfCount} /{" "}
                      {previewResult.report.summary.essayCount}
                    </p>
                  </div>
                </div>

                {/* Block Type Breakdown */}
                <div className="flex flex-wrap gap-1.5">
                  {ARABIC_CONTENT_BLOCK_TYPES.map((bt) => {
                    const cnt = previewResult.report.summary.blockTypeCounts[bt];
                    if (!cnt) return null;
                    return (
                      <span
                        key={bt}
                        className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#1E40AF] text-[11px] font-bold"
                      >
                        {BLOCK_TYPE_ARABIC[bt] || bt}: {cnt}
                      </span>
                    );
                  })}
                </div>

                {/* Provenance Breakdown */}
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(
                    previewResult.report.summary.originBreakdown || {}
                  ).map(([orig, cnt]) => (
                    <span
                      key={orig}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-[11px] font-bold"
                    >
                      {ARABIC_ORIGIN_LABELS[orig as ArabicQuestionOriginEnum] || orig}:{" "}
                      {cnt}
                    </span>
                  ))}
                </div>

                {/* Errors & Warnings */}
                {previewResult.report.errors.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1 text-xs text-rose-900">
                    <p className="font-black">أخطاء يجب إصلاحها:</p>
                    <ul className="list-disc pr-5 space-y-0.5">
                      {previewResult.report.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewResult.report.warnings.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-xs text-amber-900">
                    <p className="font-black flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>تنبيهات المصادر والوسائط:</span>
                    </p>
                    <ul className="list-disc pr-5 space-y-0.5">
                      {previewResult.report.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Mobile vs Desktop Live Preview */}
              {previewMockLesson && previewResult.payload && (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowStudentPreview((v) => !v)}
                      className="text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4 text-[#1E40AF]" />
                      <span>
                        {showStudentPreview
                          ? "إخفاء المعاينة التفاعلية"
                          : "عرض المعاينة التفاعلية للدرس"}
                      </span>
                    </button>

                    {showStudentPreview && (
                      <div className="flex items-center gap-1.5 bg-[#F1F5F9] dark:bg-[#1E293B] p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("desktop")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 ${
                            previewDevice === "desktop"
                              ? "bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-2xs"
                              : "text-[#64748B]"
                          }`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>سطح المكتب</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("mobile")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 ${
                            previewDevice === "mobile"
                              ? "bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-2xs"
                              : "text-[#64748B]"
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>موبايل (375px)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {showStudentPreview && (
                    <div
                      className={`mx-auto border border-[#CBD5E1] dark:border-[#334155] rounded-2xl p-4 bg-[#F7F9FC] dark:bg-[#041028] transition-all ${
                        previewDevice === "mobile"
                          ? "max-w-[390px] overflow-y-auto max-h-[75vh]"
                          : "w-full"
                      }`}
                    >
                      <ArabicLessonViewer
                        lesson={previewMockLesson as any}
                        structured={previewResult.payload}
                        initialIsBookmarked={false}
                        initialIsCompleted={false}
                        previewMode
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Version History, Publish & Rollback */}
          {activeLesson && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
              <h2 className="text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#800B34]" />
                <span>سجل إصدارات الدرس: {activeLesson.title}</span>
              </h2>

              {activeLesson.versions.length === 0 ? (
                <p className="text-xs text-[#64748B]">
                  لا توجد إصدارات محفوظة لهذا الدرس بعد.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {activeLesson.versions.map((ver) => {
                    const st =
                      VERSION_STATUS_LABELS[ver.status] ||
                      VERSION_STATUS_LABELS.DRAFT;
                    return (
                      <div
                        key={ver.id}
                        className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-[#0F172A] dark:text-white tabular-nums">
                              الإصدار v{ver.versionNumber}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${st.cls}`}
                            >
                              {st.label}
                            </span>
                            {ver.validationReport?.summary && (
                              <span className="text-[11px] font-bold text-[#64748B]">
                                {ver.validationReport.summary.sectionsCount} قسم •{" "}
                                {ver.validationReport.summary.questionsCount} سؤال
                              </span>
                            )}
                          </div>
                          {ver.notes && (
                            <p className="text-xs text-[#475569] dark:text-[#CBD5E1]">
                              {ver.notes}
                            </p>
                          )}
                          <p className="text-[10px] text-[#64748B]">
                            أُنشئ في{" "}
                            {new Date(ver.createdAt).toLocaleString("ar-EG")}
                            {ver.createdBy?.name
                              ? ` بواسطة ${ver.createdBy.name}`
                              : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {ver.status === "DRAFT" && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => triggerPublish(ver)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold"
                            >
                              اعتماد ونشر
                            </button>
                          )}
                          {ver.status === "ARCHIVED" && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => triggerRollback(ver)}
                              className="px-3.5 py-2 rounded-xl border border-[#800B34]/40 text-[#800B34] hover:bg-[#800B34]/10 text-xs font-extrabold flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>استعادة (Rollback)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}
        onConfirm={() => confirmModal.action?.()}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText="نعم، نفّذ الإجراء"
        cancelText="إلغاء"
        variant="warning"
        isLoading={isProcessing}
      />
    </div>
  );
}
