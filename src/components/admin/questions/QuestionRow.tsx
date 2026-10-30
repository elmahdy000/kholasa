"use client";

import { useState } from "react";
import {
  Edit2,
  Trash2,
  Check,
  CheckSquare,
  Square,
  ImageIcon,
  ZoomIn,
  X,
  ChevronDown,
  BookOpen,
  FileText,
  Lightbulb,
  FileCheck2,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";
import { Question } from "./types";

interface QuestionRowProps {
  question: Question;
  index: number;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  getSubjectCategory: (subjectId: string) => "ARABIC" | "LANGUAGES";
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
}

export function QuestionRow({
  question: q,
  index: idx,
  isSelected = false,
  onToggleSelect,
  isExpanded = false,
  onToggleExpand,
  getSubjectCategory,
  onEdit,
  onDelete,
}: QuestionRowProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const isLanguageSchool =
    (q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id)) ===
    "LANGUAGES";

  const optionLetters = isLanguageSchool
    ? ["A", "B", "C", "D", "E"]
    : ["أ", "ب", "ج", "د", "هـ"];

  return (
    <div
      className={`rounded-xl border transition-all text-right font-sans ${
        isSelected
          ? "border-[#800020] bg-[#800020]/[0.02] shadow-sm"
          : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-[#CBD5E1] dark:hover:border-[#475569]"
      }`}
    >
      {/* Main Compact Row */}
      <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Leading: Checkbox + Number + Statement */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              className="mt-0.5 cursor-pointer text-[#94A3B8] hover:text-[#800020] transition-colors p-0.5 shrink-0"
              title={isSelected ? "إلغاء تحديد السؤال" : "تحديد السؤال"}
              aria-label="تحديد السؤال"
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-[#800020]" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Sequential Question Number */}
          <span className="mt-0.5 px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[12px] font-bold text-[#0F172A] dark:text-[#E2E8F0] shrink-0 border border-[#E2E8F0] dark:border-[#334155]">
            #{idx}
          </span>

          {/* Question Text */}
          <div
            onClick={onToggleExpand}
            className="flex-1 min-w-0 cursor-pointer select-text group"
          >
            {isLanguageSchool ? (
              <div
                dir="ltr"
                className="text-left font-sans text-[13px] sm:text-sm font-semibold text-[#0F172A] dark:text-white leading-relaxed break-words"
              >
                {q.statement}
              </div>
            ) : (
              <div
                dir="rtl"
                className="text-right text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white leading-relaxed break-words"
              >
                <BidiStatement as="div" text={q.statement} />
              </div>
            )}
          </div>
        </div>

        {/* Trailing: Metadata Badges & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F1F5F9] dark:border-[#1E293B]">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Image Indicator */}
            {q.imageUrl && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageModalOpen(true);
                }}
                className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#312E81]/30 dark:text-[#A5B4FC] text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:underline"
                title="يحتوي على رسم توضيحي"
              >
                <ImageIcon className="w-3 h-3" />
                <span>صورة</span>
              </span>
            )}

            {/* Question Type */}
            <span className="px-2.5 py-0.5 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]">
              {q.type === "MCQ"
                ? "اختيار من متعدد"
                : q.type === "TRUE_FALSE"
                ? "صح أو خطأ"
                : "سؤال مقالي"}
            </span>

            {/* Difficulty Badge */}
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                q.difficulty === "EASY"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                  : q.difficulty === "MEDIUM"
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
              }`}
            >
              {q.difficulty === "EASY"
                ? "سهل"
                : q.difficulty === "MEDIUM"
                ? "متوسط"
                : "متقدم"}
            </span>

            {/* School Track Tag */}
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                isLanguageSchool
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {isLanguageSchool ? "لغات" : "عربي"}
            </span>
          </div>

          {/* Action Buttons: Expand Toggle, Edit, Delete */}
          <div className="flex items-center gap-1">
            {onToggleExpand && (
              <button
                type="button"
                onClick={onToggleExpand}
                className={`h-8 px-2 rounded-lg border text-[12px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isExpanded
                    ? "bg-[#800020] text-white border-[#800020]"
                    : "border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white bg-[#F8FAFC] dark:bg-[#1E293B]"
                }`}
                title={isExpanded ? "طي التفاصيل" : "عرض الخيارات والتفسير"}
              >
                <span>{isExpanded ? "طي" : "عرض"}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit(q)}
              className="h-8 w-8 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#0F172A] dark:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="تعديل السؤال"
              aria-label="تعديل السؤال"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#800020]" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(q.id)}
              className="h-8 w-8 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 text-[#94A3B8] flex items-center justify-center transition-colors cursor-pointer"
              title="حذف السؤال"
              aria-label="حذف السؤال"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details Area */}
      {isExpanded && (
        <div className="border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/90 dark:bg-[#0B1120]/60 p-4 sm:p-5 rounded-b-xl space-y-4">
          {/* Secondary Academic Hierarchy & Source Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#64748B] dark:text-[#94A3B8] pb-3 border-b border-[#E2E8F0]/70 dark:border-[#334155]/70">
            <span className="flex items-center gap-1 font-bold text-[#0F172A] dark:text-white">
              <BookOpen className="w-3.5 h-3.5 text-[#800020]" />
              <span>المادة: {q.subject.name}</span>
            </span>

            {q.unit && (
              <>
                <span className="text-[#CBD5E1] dark:text-[#475569]">•</span>
                <span>{q.unit.title}</span>
              </>
            )}

            {q.lessons && q.lessons.length > 0 && q.lessons[0].lesson && (
              <>
                <span className="text-[#CBD5E1] dark:text-[#475569]">•</span>
                <span className="font-medium text-[#0F172A] dark:text-[#E2E8F0]">
                  الدرس: {q.lessons[0].lesson.title}
                </span>
              </>
            )}

            {q.batch && (
              <>
                <span className="text-[#CBD5E1] dark:text-[#475569]">•</span>
                <span className="flex items-center gap-1 bg-white dark:bg-[#1E293B] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#334155] text-[11px]">
                  <FileText className="w-3 h-3 text-[#64748B]" />
                  <span>المصدر: {q.batch.fileName}</span>
                </span>
              </>
            )}
          </div>

          {/* Attached Diagram / Image */}
          {q.imageUrl && (
            <div className="space-y-1.5">
              <span className="text-[12px] font-bold text-[#64748B] block">
                الرسم التوضيحي المرفق:
              </span>
              <div
                onClick={() => setIsImageModalOpen(true)}
                className="group relative inline-flex max-w-sm rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-2 cursor-pointer hover:border-[#800020] transition-colors"
                title="اضغط لتكبير الصورة"
              >
                <img
                  src={q.imageUrl}
                  alt="رسم توضيحي للسؤال"
                  className="max-h-48 max-w-full object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[12px] font-bold rounded-xl backdrop-blur-[2px]">
                  <ZoomIn className="w-4 h-4" />
                  <span>تكبير الرسم</span>
                </div>
              </div>
            </div>
          )}

          {/* Options Section for MCQ & True/False */}
          {q.options && q.options.length > 0 && (
            <div className="space-y-2">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                خيارات الإجابة:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => {
                  const letter = optionLetters[oIdx] || oIdx + 1;
                  return (
                    <div
                      key={opt.id || oIdx}
                      className={`p-3 rounded-xl border text-[13px] flex items-start justify-between gap-3 transition-colors ${
                        opt.isCorrect
                          ? "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-200 font-bold"
                          : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1]"
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[12px] font-bold shrink-0 ${
                            opt.isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-[#F1F5F9] dark:bg-[#334155] text-[#475569] dark:text-[#E2E8F0]"
                          }`}
                        >
                          {letter}
                        </span>
                        <div className="flex-1 break-words leading-relaxed">
                          {isLanguageSchool ? (
                            <span dir="ltr" className="text-left font-sans block">
                              {opt.text}
                            </span>
                          ) : (
                            <BidiStatement as="span" text={opt.text} />
                          )}
                        </div>
                      </div>

                      {opt.isCorrect && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" />
                          <span>صحيحة</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Model Answer / Rubric for Essay */}
          {q.type === "ESSAY" && q.rubric && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2">
              <div className="flex items-center justify-between text-[12px] font-bold text-[#800020] dark:text-[#FB7185]">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4" />
                  <span>نموذج الإجابة الاسترشادي (Model Answer)</span>
                </span>
                <span className="text-[#64748B] dark:text-[#94A3B8]">
                  الدرجة القصوى: {q.rubric.maxScore || 10} درجات
                </span>
              </div>
              <FormattedAnswerView
                text={q.rubric.modelAnswer}
                colorScheme="burgundy"
              />
            </div>
          )}

          {/* Explanation Section */}
          {q.explanation && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#800020] dark:text-[#FB7185]">
                <Lightbulb className="w-4 h-4" />
                <span>
                  {q.explanation.concept
                    ? `المفهوم التعليمي: ${q.explanation.concept}`
                    : "تفسير الإجابة الصحيحة:"}
                </span>
              </div>
              <FormattedAnswerView
                text={q.explanation.correctReason}
                colorScheme="blue"
              />
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal for Diagram Zoom */}
      {isImageModalOpen && q.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] bg-white dark:bg-[#0F172A] rounded-2xl p-4 shadow-2xl border border-[#334155] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#334155] mb-3">
              <span className="text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#800020]" />
                معاينة الرسم التوضيحي للسؤال
              </span>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={q.imageUrl}
              alt="رسم توضيحي للسؤال"
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
