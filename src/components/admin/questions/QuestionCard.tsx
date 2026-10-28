"use client";

import { useState } from "react";
import { Edit2, Trash2, Check, CheckSquare, Square, ImageIcon, ZoomIn, X } from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { Question } from "./types";

interface QuestionCardProps {
  question: Question;
  index: number;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  getSubjectCategory: (subjectId: string) => "ARABIC" | "LANGUAGES";
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
}

export function QuestionCard({
  question: q,
  index: idx,
  isSelected = false,
  onToggleSelect,
  getSubjectCategory,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const isLanguageSchool =
    (q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id)) ===
    "LANGUAGES";

  return (
    <div
      className={`p-6 rounded-xl bg-white dark:bg-[#0F172A] border transition-colors space-y-4 ${
        isSelected
          ? "border-[#800020] dark:border-[#800020] bg-[#800020]/[0.02] shadow-sm"
          : "border-[#E2E8F0]/80 dark:border-[#334155]/80"
      }`}
    >
      {/* Top Bar with Badges and Edit/Delete Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {onToggleSelect && (
            <button
              type="button"
              onClick={onToggleSelect}
              className="cursor-pointer text-[#94A3B8] hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors p-0.5"
              title={isSelected ? "إلغاء تحديد هذا السؤال" : "تحديد هذا السؤال"}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
          )}

          <span className="text-[13px] font-bold text-[#800020]">
            #{idx + 1}
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold">
            {q.subject.name}
          </span>

          {/* School Category Badge */}
          {isLanguageSchool ? (
            <span className="px-2.5 py-1 rounded-lg bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#60A5FA] text-[12px] font-bold">
              مدارس لغات (Language)
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20 text-[12px] font-bold">
              مدارس عربي
            </span>
          )}

          {/* Batch Badge if imported */}
          {q.batch && (
            <span
              className="px-2 py-0.5 rounded-lg bg-[#64748B]/10 text-[#64748B] dark:bg-[#334155] dark:text-[#94A3B8] text-[11px] font-medium"
              title={q.batch.fileName}
            >
              ملف: {q.batch.fileName.length > 22 ? q.batch.fileName.slice(0, 20) + "..." : q.batch.fileName}
            </span>
          )}

          {q.unit && (
            <span className="px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] text-[13px] font-bold">
              {q.unit.title}
            </span>
          )}

          {q.lessons && q.lessons.length > 0 && q.lessons[0].lesson && (
            <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#E11D48]/50">
              درس: {q.lessons[0].lesson.title}
            </span>
          )}

          <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#64748B]">
            {q.type === "MCQ"
              ? "اختيار من متعدد"
              : q.type === "TRUE_FALSE"
              ? "صح أو خطأ"
              : "مقالي"}
          </span>

          <span
            className={`px-2 py-1 rounded-lg text-[13px] font-bold ${
              q.difficulty === "EASY"
                ? "bg-[#059669]/10 text-[#059669]"
                : q.difficulty === "MEDIUM"
                ? "bg-[#D97706]/10 text-[#D97706]"
                : "bg-[#DC2626]/10 text-[#DC2626]"
            }`}
          >
            {q.difficulty === "EASY"
              ? "سهل"
              : q.difficulty === "MEDIUM"
              ? "متوسط"
              : "متقدم"}
          </span>

          {/* Question Image Badge */}
          {q.imageUrl && (
            <span className="px-2 py-0.5 rounded-lg bg-[#6366F1]/10 text-[#6366F1] dark:bg-[#6366F1]/20 dark:text-[#818CF8] text-[11px] font-bold flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              رسم توضيحي
            </span>
          )}
        </div>

        {/* Action Buttons: Edit and Delete */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(q)}
            className="h-11 px-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#800020]" />
            <span>تعديل</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(q.id)}
            className="h-11 px-3 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            title="حذف السؤال"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Statement */}
      {isLanguageSchool ? (
        <div
          dir="ltr"
          className="text-left font-sans text-sm sm:text-base font-semibold text-[#0F172A] dark:text-white leading-relaxed"
        >
          {q.statement}
        </div>
      ) : (
        <div
          dir="rtl"
          className="text-right text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed"
        >
          <BidiStatement as="div" text={q.statement} />
        </div>
      )}

      {/* Question Attached Diagram/Image if present */}
      {q.imageUrl && (
        <div className="space-y-1.5">
          <div
            onClick={() => setIsImageModalOpen(true)}
            className="group relative inline-flex max-w-full rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] p-2 cursor-pointer hover:border-[#800020] dark:hover:border-[#FB7185] transition-colors"
            title="اضغط لتكبير الصورة"
          >
            <img
              src={q.imageUrl}
              alt="رسم توضيحي للسؤال"
              className="max-h-64 max-w-full object-contain rounded-lg transition-transform group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[12px] font-bold rounded-xl backdrop-blur-[2px]">
              <ZoomIn className="w-4 h-4" />
              <span>تكبير الرسم التوضيحي</span>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Lightbox Modal */}
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
                <ImageIcon className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
                معاينة الرسم التوضيحي للسؤال
              </span>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
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

      {/* Options */}
      {q.options && q.options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map((opt, oIdx) => (
            <div
              key={opt.id || oIdx}
              className={`p-3 rounded-xl border text-[13px] font-bold flex items-center justify-between gap-2 ${
                opt.isCorrect
                  ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#059669]/50 text-[#059669] dark:text-[#34D399] font-bold"
                  : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#F8FAFC]"
              }`}
            >
              {isLanguageSchool ? (
                <span dir="ltr" className="text-left font-sans">
                  {opt.text}
                </span>
              ) : (
                <BidiStatement as="span" text={opt.text} />
              )}
              {opt.isCorrect && (
                <span className="text-[13px] font-bold text-[#059669] flex items-center gap-1 shrink-0">
                  <Check className="w-3 h-3" />
                  الإجابة الصحيحة
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rubric for Essay */}
      {q.type === "ESSAY" && q.rubric && (
        <div className="p-4 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/50 text-[13px] space-y-1">
          <span className="font-bold text-[#800020] block">
            نموذج الإجابة الاسترشادي (Rubric):
          </span>
          <p className="font-medium text-[13px] leading-relaxed text-[#0F172A] dark:text-[#F8FAFC]">
            {q.rubric.modelAnswer}
          </p>
        </div>
      )}

      {/* Explanation Preview */}
      {q.explanation && (
        <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0]/60 dark:border-[#334155]/60 text-[13px] text-[#0F172A] dark:text-[#F8FAFC] space-y-1">
          <span className="font-bold text-[#800020] dark:text-[#FB7185] block">
            المفهوم الأساسي: {q.explanation.concept}
          </span>
          <p className="font-medium text-[13px] leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
            {q.explanation.correctReason}
          </p>
        </div>
      )}
    </div>
  );
}
