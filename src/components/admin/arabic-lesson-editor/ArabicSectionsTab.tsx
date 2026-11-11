"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  HelpCircle,
  Lightbulb,
  PenTool,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  ArabicEditorQuestionRecord,
  ArabicNormalizedSection,
} from "./types";

interface ArabicSectionsTabProps {
  sections: ArabicNormalizedSection[];
  onChangeSections: (next: ArabicNormalizedSection[]) => void;
  practiceQuestionIds: string[];
  finalAssessmentQuestionIds: string[];
  questions: ArabicEditorQuestionRecord[];
}

const STAGE_TABS = [
  { id: "understand", label: "١. افهم الدرس", icon: BookOpen },
  { id: "skills", label: "٢. اتقن المهارات", icon: PenTool },
  { id: "practice", label: "٣. حل واتعلم", icon: HelpCircle },
  { id: "assessment", label: "٤. اختبر نفسك", icon: ClipboardCheck },
] as const;

export function ArabicSectionsTab({
  sections,
  onChangeSections,
  practiceQuestionIds,
  finalAssessmentQuestionIds,
  questions,
}: ArabicSectionsTabProps) {
  const [stageFilter, setStageFilter] = useState<string>("understand");
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || ""
  );

  const stageCounts = useMemo(
    () => ({
      understand: sections.filter((s) => s.stageId === "understand").length,
      skills: sections.filter((s) => s.stageId === "skills").length,
      practice: practiceQuestionIds.length,
      assessment: sections.filter((s) => s.stageId === "assessment").length,
    }),
    [sections, practiceQuestionIds]
  );

  const visibleSections = useMemo(
    () =>
      [...sections]
        .filter((s) =>
          stageFilter === "practice" ? false : s.stageId === stageFilter
        )
        .sort((a, b) => a.order - b.order),
    [sections, stageFilter]
  );

  const activeSection = useMemo(
    () =>
      sections.find((s) => s.id === selectedSectionId) ||
      visibleSections[0] ||
      sections[0],
    [sections, selectedSectionId, visibleSections]
  );

  const updateSection = (updated: ArabicNormalizedSection) => {
    onChangeSections(sections.map((s) => (s.id === updated.id ? updated : s)));
  };

  return (
    <div className="space-y-5">
      {/* Stage Switcher */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {STAGE_TABS.map((st) => {
          const Icon = st.icon;
          const active = stageFilter === st.id;
          const cnt = stageCounts[st.id as keyof typeof stageCounts];
          const suffix = st.id === "practice" ? "سؤال" : "أقسام";
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                setStageFilter(st.id);
                const firstInStage = sections.find((s) => s.stageId === st.id);
                if (firstInStage) setSelectedSectionId(firstInStage.id);
              }}
              className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer ${
                active
                  ? "bg-[#800B34] text-white border-[#800B34] shadow-xs"
                  : "bg-[#F7F9FC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white hover:border-[#800B34]"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-black truncate">{st.label}</span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-[#800B34]/10 text-[#800B34] dark:bg-[#800B34]/40 dark:text-[#FB7185]"
                }`}
              >
                {cnt} {suffix}
              </span>
            </button>
          );
        })}
      </div>

      {stageFilter === "practice" ? (
        <div className="p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
          <h3 className="text-sm font-black text-[#0F172A] dark:text-white">
            مرحلة «حل واتعلم» — خريطة ربط أسئلة التدريب بالدرس ({practiceQuestionIds.length} سؤال من أصل {questions.length})
          </h3>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
            كل سؤال في هذه المرحلة مرتبط بقسمه ومهارته الأصلية (أمامك المعرفات المستقرة)، ويمكنك تعديل كل سؤال من تبويب «أسئلة وتدريبات الدرس».
          </p>
          <div className="flex flex-wrap gap-1.5">
            {practiceQuestionIds.map((qid) => (
              <span
                key={qid}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[11px] font-bold text-[#800B34] dark:text-[#E9AD32] tabular-nums"
              >
                {qid}
              </span>
            ))}
          </div>
          {finalAssessmentQuestionIds.length > 0 && (
            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] space-y-2">
              <p className="text-xs font-black text-[#800B34] dark:text-amber-300">
                الاختبار الختامي الشامل للدرس ({finalAssessmentQuestionIds.length} سؤالاً منتقاة دون تكرار):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {finalAssessmentQuestionIds.map((qid) => (
                  <span
                    key={qid}
                    className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 tabular-nums"
                  >
                    {qid}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Ordered Sections List */}
          <div className="lg:col-span-4 space-y-1.5 p-3 rounded-2xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
            <p className="text-xs font-black text-[#800B34] dark:text-[#E9AD32] px-1 pb-1.5 border-b border-[#E2E8F0] dark:border-[#334155]">
              أقسام المرحلة ({visibleSections.length})
            </p>
            {visibleSections.map((sec) => {
              const isSelected = activeSection?.id === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`w-full text-right p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#800B34] text-white"
                      : "bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34]"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-black/15 text-[10px] font-black flex items-center justify-center shrink-0 tabular-nums">
                      {sec.order}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </span>
                  <span className="text-[10px] opacity-80 shrink-0 tabular-nums">
                    {(sec.practiceQuestionIds || []).length} س
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Section Editor */}
          {activeSection && (
            <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-5">
              <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                <div>
                  <span className="text-[11px] font-bold text-[#800B34] dark:text-[#E9AD32]">
                    معرف القسم: <code>{activeSection.id}</code>
                  </span>
                  <h4 className="text-sm font-black text-[#0F172A] dark:text-white mt-0.5">
                    تعديل القسم {activeSection.order}: {activeSection.title}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#800B34]/10 text-[#800B34] text-[11px] font-extrabold">
                  {activeSection.blocks.length} كتل تعليمية
                </span>
              </div>

              {/* Title & Summary */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] mb-1">
                    عنوان القسم
                  </label>
                  <input
                    type="text"
                    value={activeSection.title}
                    onChange={(e) =>
                      updateSection({ ...activeSection, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] mb-1">
                    ملخص الفكرة التمهيدي
                  </label>
                  <textarea
                    rows={2}
                    value={activeSection.summary}
                    onChange={(e) =>
                      updateSection({ ...activeSection, summary: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-medium text-[#0F172A] dark:text-white leading-relaxed"
                  />
                </div>
              </div>

              {/* Teacher Explanation Steps */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-[#0F172A] dark:text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#800B34]" />
                    <span>شرح المعلم بالمصري ونقاط التركيز ({activeSection.teacherExplanation.length})</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() =>
                      updateSection({
                        ...activeSection,
                        teacherExplanation: [
                          ...activeSection.teacherExplanation,
                          { title: "فكرة جديدة", explanationEgyptian: "", keyPoint: "" },
                        ],
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#800B34] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة خطوة شرح</span>
                  </button>
                </div>

                {activeSection.teacherExplanation.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const next = [...activeSection.teacherExplanation];
                          next[idx] = { ...step, title: e.target.value };
                          updateSection({ ...activeSection, teacherExplanation: next });
                        }}
                        placeholder="عنوان الفكرة"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs font-black text-[#0F172A] dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateSection({
                            ...activeSection,
                            teacherExplanation: activeSection.teacherExplanation.filter(
                              (_, i) => i !== idx
                            ),
                          })
                        }
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="حذف خطوة الشرح"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={step.explanationEgyptian}
                      onChange={(e) => {
                        const next = [...activeSection.teacherExplanation];
                        next[idx] = { ...step, explanationEgyptian: e.target.value };
                        updateSection({ ...activeSection, teacherExplanation: next });
                      }}
                      placeholder="الشرح المبسط بالمصري..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#0F172A] dark:text-white leading-relaxed"
                    />
                    <input
                      type="text"
                      value={step.keyPoint || ""}
                      onChange={(e) => {
                        const next = [...activeSection.teacherExplanation];
                        next[idx] = { ...step, keyPoint: e.target.value };
                        updateSection({ ...activeSection, teacherExplanation: next });
                      }}
                      placeholder="الخلاصة / النقطة الجوهرية..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-[#E2E8F0] dark:border-emerald-900 text-xs font-bold text-emerald-900 dark:text-emerald-200"
                    />
                  </div>
                ))}
              </div>

              {/* Exam Solving Method & Common Traps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/50">
                  <label className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" />
                    <span>طريقة الحل في الامتحان (سطر لكل قاعدة)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={(activeSection.examSolvingMethod || []).join("\n")}
                    onChange={(e) =>
                      updateSection({
                        ...activeSection,
                        examSolvingMethod: e.target.value
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-white dark:bg-[#0F172A] border border-amber-200 dark:border-amber-900 text-xs leading-relaxed text-[#0F172A] dark:text-white"
                  />
                </div>

                <div className="space-y-2 p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/15 border border-rose-200 dark:border-rose-900/50">
                  <label className="text-xs font-black text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>الأخطاء الشائعة والتركات (سطر لكل فخ)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={(activeSection.commonTraps || []).join("\n")}
                    onChange={(e) =>
                      updateSection({
                        ...activeSection,
                        commonTraps: e.target.value
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-white dark:bg-[#0F172A] border border-rose-200 dark:border-rose-900 text-xs leading-relaxed text-[#0F172A] dark:text-white"
                  />
                </div>
              </div>

              {/* Keywords & Linked Question IDs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] mb-1">
                    الكلمات المفتاحية (مفصولة بفاصلة «،»)
                  </label>
                  <input
                    type="text"
                    value={(activeSection.keywords || []).join("، ")}
                    onChange={(e) =>
                      updateSection({
                        ...activeSection,
                        keywords: e.target.value
                          .split(/[،,]/)
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] mb-1">
                    معرفات الأسئلة المرتبطة بهذا القسم (مفصولة بفاصلة)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={(activeSection.practiceQuestionIds || []).join(", ")}
                    onChange={(e) =>
                      updateSection({
                        ...activeSection,
                        practiceQuestionIds: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] font-mono text-xs text-[#0F172A] dark:text-white"
                  />
                </div>
              </div>

              {/* Worked examples editor when section has worked_examples visualization */}
              {activeSection.visualization?.type === "worked_examples" &&
                Array.isArray(activeSection.visualization.examples) && (
                  <div className="p-3.5 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2.5">
                    <p className="text-xs font-black text-[#800B34] dark:text-[#E9AD32] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>النماذج التطبيقية المحلولة ({activeSection.visualization.examples.length})</span>
                    </p>
                    {activeSection.visualization.examples.map((ex, eIdx) => (
                      <div key={eIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={ex.sentence}
                          onChange={(e) => {
                            const examples = [...(activeSection.visualization?.examples || [])];
                            examples[eIdx] = { ...ex, sentence: e.target.value };
                            updateSection({
                              ...activeSection,
                              visualization: { ...activeSection.visualization!, examples },
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={ex.answer}
                          onChange={(e) => {
                            const examples = [...(activeSection.visualization?.examples || [])];
                            examples[eIdx] = { ...ex, answer: e.target.value };
                            updateSection({
                              ...activeSection,
                              visualization: { ...activeSection.visualization!, examples },
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-xs font-medium"
                        />
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

