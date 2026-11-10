"use client";

import { useState, useMemo } from "react";
import {
  CheckSquare,
  Eye,
  EyeOff,
  FileText,
  PenTool,
  Save,
  Square,
} from "lucide-react";
import type {
  ArabicWritingModel,
  ArabicWritingTaskItem,
} from "@/lib/arabic-curriculum";

const KIND_LABELS: Record<string, string> = {
  summary: "التلخيص",
  argumentative_paragraph: "الفقرة الحجاجية",
  critical_article: "المقال النقدي",
  interview: "كتابة المقابلة",
};

interface ArabicWritingLabProps {
  tasks: ArabicWritingTaskItem[];
  writingModels?: ArabicWritingModel[];
  initialDrafts?: Record<string, string>;
  initialChecklist?: Record<string, boolean>;
  onSaveDraftState?: (drafts: Record<string, string>, checklist: Record<string, boolean>) => Promise<void> | void;
}

export function ArabicWritingLab({
  tasks,
  writingModels = [],
  initialDrafts = {},
  initialChecklist = {},
  onSaveDraftState,
}: ArabicWritingLabProps) {
  const [selectedTaskIdx, setSelectedTaskIdx] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>(initialDrafts);
  const [checklistState, setChecklistState] =
    useState<Record<string, boolean>>(initialChecklist);
  const [showModel, setShowModel] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const activeTask = tasks[selectedTaskIdx] || tasks[0];
  const matchedModel = useMemo(() => {
    if (!activeTask) return null;
    if (activeTask.kind === "summary") {
      return writingModels.find((m) => m.id.includes("summary"));
    }
    if (activeTask.kind === "argumentative_paragraph") {
      return writingModels.find((m) => m.id.includes("paragraph") || m.id.includes("arg"));
    }
    if (activeTask.kind === "critical_article") {
      return writingModels.find((m) => m.id.includes("article") || m.id.includes("critical"));
    }
    if (activeTask.kind === "interview") {
      return writingModels.find((m) => m.id.includes("interview"));
    }
    return writingModels[selectedTaskIdx] || null;
  }, [activeTask, writingModels, selectedTaskIdx]);

  if (!activeTask) return null;

  const taskKey = activeTask.kind;
  const currentDraft = drafts[taskKey] || "";
  const wordCount = currentDraft.trim()
    ? currentDraft.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const lineCount = currentDraft.trim()
    ? currentDraft.split(/\n/).filter((l) => l.trim().length > 0).length
    : 0;

  const handleSave = async () => {
    if (!onSaveDraftState) return;
    setIsSaving(true);
    try {
      await onSaveDraftState(drafts, checklistState);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="text-xs sm:text-sm font-black text-[#091B40] dark:text-white flex items-center gap-2">
          <PenTool className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32] shrink-0" />
          <span>ورشة التعبير والكتابة الموجّهة</span>
        </h4>
        <div className="flex items-center gap-1.5 flex-wrap">
          {tasks.map((t, i) => (
            <button
              key={t.kind}
              type="button"
              onClick={() => setSelectedTaskIdx(i)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors min-h-[38px] ${
                selectedTaskIdx === i
                  ? "bg-[#800B34] text-white"
                  : "bg-white dark:bg-[#0D214D] text-[#091B40] dark:text-white border border-[#E2E8F0] dark:border-[#1E3A6E]"
              }`}
            >
              {KIND_LABELS[t.kind] || t.kind}
            </button>
          ))}
        </div>
      </div>

      {/* Task structure requirements */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-black text-[#091B40] dark:text-white">
            {KIND_LABELS[activeTask.kind] || activeTask.kind}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
            المطلوب: {activeTask.requirement}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeTask.structure.map((part, pIdx) => (
            <span
              key={pIdx}
              className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] dark:bg-[#132C60] text-[#1E40AF] dark:text-[#93C5FD] text-[11px] font-bold"
            >
              {pIdx + 1}. {part}
            </span>
          ))}
        </div>
      </div>

      {/* Student Writing Workspace */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-xs font-black text-[#091B40] dark:text-white">
            مسودتك التطبيقية (التقييم يتم وفق قائمة المعايير ولا يصحح آليًا تقييمًا شكليًا):
          </label>
          <div className="flex items-center gap-2 text-[11px] font-black text-[#64748B] dark:text-[#94A3B8] tabular-nums">
            <span>عدد الكلمات: {wordCount}</span>
            <span>•</span>
            <span>الأسطر: {lineCount}</span>
          </div>
        </div>

        <textarea
          rows={5}
          value={currentDraft}
          onChange={(e) =>
            setDrafts((prev) => ({ ...prev, [taskKey]: e.target.value }))
          }
          placeholder={`اكتب مسودتك في ${KIND_LABELS[activeTask.kind] || "التعبير"} مع الالتزام بالهيكل المطلوب...`}
          className="w-full p-3.5 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs sm:text-sm font-medium text-[#091B40] dark:text-white leading-[1.85] focus:outline-none focus:ring-2 focus:ring-[#800B34]"
        />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          {onSaveDraftState && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-3.5 py-2 rounded-xl bg-[#091B40] hover:bg-[#132C60] text-white text-xs font-extrabold flex items-center gap-1.5 min-h-[40px] disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedNotice ? "تم حفظ مسودتك ✓" : isSaving ? "جاري الحفظ..." : "حفظ المسودة في حسابي"}</span>
            </button>
          )}

          {matchedModel && (
            <button
              type="button"
              onClick={() =>
                setShowModel((p) => ({ ...p, [taskKey]: !p[taskKey] }))
              }
              className="px-3.5 py-2 rounded-xl border border-[#800B34]/30 text-[#800B34] dark:border-[#E9AD32]/40 dark:text-[#E9AD32] text-xs font-extrabold flex items-center gap-1.5 min-h-[40px]"
            >
              {showModel[taskKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showModel[taskKey] ? "إخفاء النموذج الاسترشادي" : "عرض النموذج الاسترشادي"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Rubric self-evaluation checklist */}
      {(matchedModel?.evaluationChecklist || matchedModel?.howToUse) && (
        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
          <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
            قائمة التقييم الذاتي قبل اعتماد كتابتك:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {(matchedModel.evaluationChecklist || matchedModel.howToUse || []).map(
              (criterion, cIdx) => {
                const key = `${taskKey}-${cIdx}`;
                const checked = Boolean(checklistState[key]);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setChecklistState((p) => ({ ...p, [key]: !p[key] }))
                    }
                    className={`flex items-center gap-2 text-right px-2.5 py-2 rounded-lg text-xs font-bold transition-colors min-h-[38px] ${
                      checked
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-[#0D214D] text-[#091B40] dark:text-white border border-emerald-200/80 dark:border-emerald-900/50"
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 shrink-0 text-[#94A3B8]" />
                    )}
                    <span className="break-words">{criterion}</span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Optional writing model */}
      {matchedModel && showModel[taskKey] && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D214D] border border-amber-300 dark:border-amber-800 space-y-2.5">
          <p className="text-xs font-black text-[#800B34] dark:text-[#E9AD32] flex items-center gap-1.5">
            <FileText className="w-4 h-4 shrink-0" />
            <span>{matchedModel.title} ({matchedModel.task})</span>
          </p>
          {matchedModel.teacherIntro && (
            <p className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
              {matchedModel.teacherIntro}
            </p>
          )}
          {matchedModel.model && (
            <p className="text-xs sm:text-sm font-medium text-[#091B40] dark:text-white leading-[1.9] whitespace-pre-wrap bg-[#F8FAFC] dark:bg-[#081633] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E]">
              {matchedModel.model}
            </p>
          )}
          {matchedModel.outline && (
            <ul className="space-y-1 text-xs font-medium text-[#091B40] dark:text-white list-decimal pr-5 leading-relaxed">
              {matchedModel.outline.map((line, lIdx) => (
                <li key={lIdx}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
