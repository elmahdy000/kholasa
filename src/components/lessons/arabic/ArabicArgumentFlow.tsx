"use client";

import { useState } from "react";
import { ArrowLeft, GitCommitHorizontal, Layers } from "lucide-react";

interface ArabicArgumentFlowProps {
  steps: string[];
  title?: string;
}

const CANONICAL_ARGUMENT_STAGE_NOTES: Array<{
  keyword: string;
  role: string;
  guide: string;
}> = [
  {
    keyword: "إنجازات",
    role: "الفكرة التمهيدية وبداية العرض",
    guide: "تثبت الاعتراف بفضل العلم وأهميته قبل طرح أي تقييد أخلاقي.",
  },
  {
    keyword: "سؤال",
    role: "محور الإشكالية (السؤال الحجاجي)",
    guide: "ينقل القارئ من مجرد الإعجاب بالإنجاز إلى التفكير في المسئولية.",
  },
  {
    keyword: "منافع",
    role: "الأفكار الداعمة والأدلة الواقعية",
    guide: "أدلة متوازنة من الطب والطاقة والذكاء الاصطناعي وتطبيقاتها ومخاطرها.",
  },
  {
    keyword: "مخالف",
    role: "عرض الرأي المخالف ومناقشته",
    guide: "يعرض رأي الاكتفاء بالقانون ثم يرد عليه ببيان ثغرات القانون ودور الضمير.",
  },
  {
    keyword: "تكامل",
    role: "النتيجة والخاتمة الحجاجية",
    guide: "تجمع بين القانون (الحد الأدنى الملزم) والضمير (الرقابة الداخلية).",
  },
];

export function ArabicArgumentFlow({
  steps,
  title = "مسار البنية الحجاجية وتسلسل الإقناع",
}: ArabicArgumentFlowProps) {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  if (!steps || steps.length === 0) return null;

  const activeText = steps[selectedStepIndex] || steps[0];
  const matchedNote = CANONICAL_ARGUMENT_STAGE_NOTES.find((n) =>
    activeText.includes(n.keyword)
  );

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs sm:text-sm font-black text-[#091B40] dark:text-white flex items-center gap-2">
          <GitCommitHorizontal className="w-4 h-4 text-[#1E40AF] dark:text-[#60A5FA] shrink-0" />
          <span>{title}</span>
        </p>
        <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
          اضغط على أي خطوة لمعرفة دورها في بناء الحجة
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 flex-wrap">
        {steps.map((step, idx) => {
          const isActive = idx === selectedStepIndex;
          return (
            <div key={idx} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedStepIndex(idx)}
                className={`w-full sm:w-auto text-right px-3.5 py-2.5 rounded-xl border text-xs font-extrabold transition-all flex items-center gap-2 min-h-[44px] ${
                  isActive
                    ? "bg-[#1E40AF] text-white border-[#1E40AF] shadow-xs"
                    : "bg-white dark:bg-[#0D214D] text-[#091B40] dark:text-white border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#1E40AF]"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 tabular-nums ${
                    isActive
                      ? "bg-white text-[#1E40AF]"
                      : "bg-[#EFF6FF] dark:bg-[#132C60] text-[#1E40AF] dark:text-[#93C5FD]"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="break-words">{step}</span>
              </button>
              {idx < steps.length - 1 && (
                <ArrowLeft className="hidden sm:block w-4 h-4 text-[#94A3B8] shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0D214D] border border-[#DBEAFE] dark:border-[#1E3A6E] space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-black text-[#1E40AF] dark:text-[#93C5FD]">
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span>
            الخطوة {selectedStepIndex + 1}: {activeText}
          </span>
        </div>
        {matchedNote ? (
          <>
            <p className="text-xs font-extrabold text-[#091B40] dark:text-white">
              الدور التحليلي: {matchedNote.role}
            </p>
            <p className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              {matchedNote.guide}
            </p>
          </>
        ) : (
          <p className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
            تمثل هذه المرحلة جزءًا مترابطًا من تسلسل عرض القضية وبناء الإقناع داخل الدرس.
          </p>
        )}
      </div>
    </div>
  );
}
