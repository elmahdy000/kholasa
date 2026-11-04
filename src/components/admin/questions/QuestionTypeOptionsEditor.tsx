"use client";

import type { Dispatch, SetStateAction } from "react";

export interface FormOption {
  text: string;
  translation?: string;
  isCorrect: boolean;
  explanation: string;
}

interface QuestionTypeOptionsEditorProps {
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  options: FormOption[];
  setOptions: Dispatch<SetStateAction<FormOption[]>>;
  modelAnswer: string;
  setModelAnswer: (val: string) => void;
  modelAnswerTranslation?: string;
  setModelAnswerTranslation?: (val: string) => void;
}

export function QuestionTypeOptionsEditor({
  type,
  options,
  setOptions,
  modelAnswer,
  setModelAnswer,
  modelAnswerTranslation,
  setModelAnswerTranslation,
}: QuestionTypeOptionsEditorProps) {
  return (
    <>
      {/* Options for MCQ */}
      {type === "MCQ" && (
        <div className="space-y-3 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
          <span className="text-[13px] font-bold text-[#64748B] block">
            خيارات الإجابة وتحديد الإجابة الصحيحة:
          </span>
          {options.map((opt, oIdx) => (
            <div
              key={oIdx}
              className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] space-y-2"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct-option"
                  checked={opt.isCorrect}
                  onChange={() =>
                    setOptions((prev) =>
                      prev.map((o, i) => ({ ...o, isCorrect: i === oIdx }))
                    )
                  }
                  className="w-4 h-4 accent-[#800020] cursor-pointer"
                />
                <input
                  type="text"
                  required
                  value={opt.text}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o, i) =>
                        i === oIdx ? { ...o, text: e.target.value } : o
                      )
                    )
                  }
                  placeholder={`الخيار ${oIdx + 1}`}
                  className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-medium text-[#0F172A] dark:text-white"
                />
                <input
                  type="text"
                  value={opt.explanation || ""}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o, i) =>
                        i === oIdx ? { ...o, explanation: e.target.value } : o
                      )
                    )
                  }
                  placeholder="تفسير الخيار (اختياري)"
                  className="w-1/3 h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[12px] font-medium text-[#64748B] dark:text-white"
                />
              </div>

              {/* Translation field for option */}
              <div className="pr-7">
                <input
                  type="text"
                  dir="rtl"
                  value={opt.translation || ""}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o, i) =>
                        i === oIdx ? { ...o, translation: e.target.value } : o
                      )
                    )
                  }
                  placeholder={`الترجمة العربية للخيار ${oIdx + 1} (اختياري لمدارس اللغات)...`}
                  className="w-full h-8 px-3 rounded-lg border border-dashed border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-[#0F172A] text-[12px] text-slate-700 dark:text-slate-200 outline-none focus:border-[#800020]"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TRUE_FALSE Toggle */}
      {type === "TRUE_FALSE" && (
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] space-y-2">
          <span className="text-[13px] font-bold text-[#64748B] block">
            الإجابة الصحيحة لهذا السؤال:
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setOptions((prev) =>
                  prev.map((o, i) => ({ ...o, isCorrect: i === 0 }))
                )
              }
              className={`h-11 rounded-xl border text-[13px] font-bold transition-colors cursor-pointer ${
                options[0]?.isCorrect
                  ? "bg-[#059669] text-white border-[#059669]"
                  : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white"
              }`}
            >
              صواب (True)
            </button>
            <button
              type="button"
              onClick={() =>
                setOptions((prev) =>
                  prev.map((o, i) => ({ ...o, isCorrect: i === 1 }))
                )
              }
              className={`h-11 rounded-xl border text-[13px] font-bold transition-colors cursor-pointer ${
                !options[0]?.isCorrect
                  ? "bg-[#DC2626] text-white border-[#DC2626]"
                  : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white"
              }`}
            >
              خطأ (False)
            </button>
          </div>
        </div>
      )}

      {/* ESSAY Model Answer */}
      {type === "ESSAY" && (
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] space-y-3">
          <div className="space-y-1">
            <label className="block text-[13px] font-bold text-[#64748B]">
              نموذج الإجابة المقالية ومعايير التقييم (Rubric) *
            </label>
            <textarea
              required
              rows={3}
              value={modelAnswer}
              onChange={(e) => setModelAnswer(e.target.value)}
              placeholder="اكتب الإجابة النموذجية مع توزيع الدرجات..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            />
          </div>

          {setModelAnswerTranslation && (
            <div className="space-y-1">
              <label className="block text-[12px] font-bold text-slate-600 dark:text-slate-400">
                الترجمة العربية لنموذج الإجابة (اختياري - لمدارس اللغات):
              </label>
              <textarea
                rows={2}
                dir="rtl"
                value={modelAnswerTranslation || ""}
                onChange={(e) => setModelAnswerTranslation(e.target.value)}
                placeholder="الترجمة العربية لخطوات الحل أو الإجابة النموذجية..."
                className="w-full p-2.5 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#475569] bg-[#F8FAFC] dark:bg-[#1E293B] text-[12px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
