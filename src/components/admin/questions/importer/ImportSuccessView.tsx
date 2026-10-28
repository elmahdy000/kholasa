"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, BookOpen, Layers, PlusCircle } from "lucide-react";
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
    <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-sm animate-in fade-in duration-300 max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          تم حفظ {importedCount} سؤال بنجاح في بنك الأسئلة!
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          تم إلحاق الأسئلة بنجاح بالهيكل الأكاديمي المعتمد وباتت جاهزة للامتحانات والتدريبات
        </p>

        <div className="text-[13px] text-slate-700 dark:text-slate-300 max-w-md mx-auto mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-right">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">الفئة التعليمية:</span>
            <span className="font-bold text-[#800020] dark:text-[#FB7185]">
              {isLanguageSchool ? "مدارس لغات (Language Schools)" : "مدارس عربي"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">المادة:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {activeSubject?.name || "المادة المحددة"}
            </span>
          </div>

          {activeUnit && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">الوحدة:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {activeUnit.title}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">النطاق:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {selectedScope === "LESSON" && selectedLessonId
                ? activeUnit?.lessons?.find((l) => l.id === selectedLessonId)?.title || "درس محدد"
                : "الوحدة كاملة"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800 text-[12px]">
            <span className="text-slate-500 dark:text-slate-400">نوع الأسئلة:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {selectedQuestionType === "MCQ"
                ? "اختيار من متعدد"
                : selectedQuestionType === "TRUE_FALSE"
                ? "صواب أو خطأ"
                : "أسئلة مقالية"}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/admin/questions"
          className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <span>الانتقال لبنك الأسئلة</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="h-11 px-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[13px] font-bold text-slate-700 dark:text-slate-200 hover:border-[#800020] transition-colors cursor-pointer flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>استيراد ملف جديد</span>
        </button>
      </div>
    </div>
  );
}
