"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { SubjectItem, UnitItem } from "./types";
import { QuestionType } from "@/lib/question-parser";

interface ImportSuccessViewProps {
  importedCount: number;
  schoolCategory: "ARABIC" | "LANGUAGES";
  activeSubject?: SubjectItem;
  activeUnit?: UnitItem;
  selectedScope: "LESSON" | "UNIT";
  selectedLessonId: string;
  selectedQuestionType: QuestionType;
  onReset: () => void;
}

export function ImportSuccessView({
  importedCount,
  schoolCategory,
  activeSubject,
  activeUnit,
  selectedScope,
  selectedLessonId,
  selectedQuestionType,
  onReset,
}: ImportSuccessViewProps) {
  const isLanguageSchool = schoolCategory === "LANGUAGES";

  return (
    <div className="p-8 sm:p-10 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#34D399]/60 text-center space-y-5 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-xl bg-[#059669] text-white flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#059669] dark:text-[#34D399]">
          تم استيراد وحفظ {importedCount} سؤال بنجاح!
        </h2>
        <div className="text-[13px] sm:text-sm text-[#0F172A] dark:text-[#E2E8F0] max-w-lg mx-auto mt-3 p-4 rounded-xl bg-white/70 dark:bg-[#0F172A]/70 border border-[#E2E8F0] dark:border-[#334155] space-y-1">
          <div>
            <span className="text-[#64748B]">الفئة التعليمية: </span>
            <span className="font-bold text-[#800020]">
              {isLanguageSchool ? "مدارس لغات (Language Schools)" : "مدارس عربي"}
            </span>
          </div>
          <div>
            <span className="text-[#64748B]">المادة: </span>
            <span className="font-bold underline">{activeSubject?.name || "المادة المحددة"}</span>
          </div>
          {activeUnit && (
            <div>
              <span className="text-[#64748B]">الوحدة: </span>
              <span className="font-medium">{activeUnit.title}</span>
            </div>
          )}
          {selectedScope === "LESSON" && selectedLessonId ? (
            <div>
              <span className="text-[#64748B]">الدرس: </span>
              <span className="font-medium">
                {activeUnit?.lessons?.find((l) => l.id === selectedLessonId)?.title || "الدرس المحدد"}
              </span>
            </div>
          ) : (
            <div className="text-[#059669] font-bold">
              ✓ حفظ على نطاق الوحدة كاملة بدون درس تعسفي
            </div>
          )}
          <div className="text-[12px] text-[#64748B] pt-1">
            نوع السؤال: {selectedQuestionType === "MCQ" ? "اختيار من متعدد" : selectedQuestionType === "TRUE_FALSE" ? "صواب أو خطأ" : "أسئلة مقالية"}
          </div>
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/admin/questions"
          className="h-11 px-6 rounded-xl bg-[#800020] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm hover:bg-[#66001A] transition-all"
        >
          <span>الانتقال لبنك الأسئلة</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </Link>
        <button
          onClick={onReset}
          className="h-11 px-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
        >
          استيراد ملف آخر
        </button>
      </div>
    </div>
  );
}
