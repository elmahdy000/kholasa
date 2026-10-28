"use client";

interface QuestionExplanationEditorProps {
  concept: string;
  setConcept: (val: string) => void;
  correctReason: string;
  setCorrectReason: (val: string) => void;
}

export function QuestionExplanationEditor({
  concept,
  setConcept,
  correctReason,
  setCorrectReason,
}: QuestionExplanationEditorProps) {
  return (
    <div className="space-y-3 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
      <span className="text-[13px] font-bold text-[#800020] block">
        التفسير العلمي والفكرة التعليمية (تظهر للطالب):
      </span>
      <input
        type="text"
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
        placeholder="الفكرة الأساسية (مثال: قانون أوم وتناسب الجهد مع التيار)"
        className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium text-[#0F172A] dark:text-white"
      />
      <textarea
        rows={2}
        value={correctReason}
        onChange={(e) => setCorrectReason(e.target.value)}
        placeholder="سبب صحة الإجابة بالتفصيل (الشرح والتبرير العلمي)..."
        className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium text-[#0F172A] dark:text-white"
      />
    </div>
  );
}
