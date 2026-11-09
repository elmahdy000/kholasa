"use client";

import { useState } from "react";
import { X, Save, Clock, Calendar, AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import type { ExamItem } from "./types";

interface ExamEditModalProps {
  isOpen: boolean;
  exam: ExamItem | null;
  onClose: () => void;
  onSaved: (updated: ExamItem) => void;
}

export function ExamEditModal({
  isOpen,
  exam,
  onClose,
  onSaved,
}: ExamEditModalProps) {
  if (!isOpen || !exam) return null;

  const [title, setTitle] = useState(exam.title);
  const [description, setDescription] = useState(exam.description || "");
  const [durationMinutes, setDurationMinutes] = useState(exam.durationMinutes || 30);
  const [isPractice, setIsPractice] = useState(exam.isPractice);
  const [isPublished, setIsPublished] = useState(exam.isPublished !== false);

  const toInputDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    } catch {
      return "";
    }
  };

  const [startsAt, setStartsAt] = useState(toInputDate(exam.startsAt));
  const [endsAt, setEndsAt] = useState(toInputDate(exam.endsAt));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("يرجى إدخال عنوان الامتحان");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          durationMinutes: Number(durationMinutes) || 30,
          isPractice,
          isPublished,
          startsAt: startsAt ? new Date(startsAt).toISOString() : null,
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر حفظ تعديلات الامتحان");
      }

      onSaved({
        ...exam,
        title: title.trim(),
        description: description.trim() || null,
        durationMinutes: Number(durationMinutes) || 30,
        isPractice,
        isPublished,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 font-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: exam.subject.color || "#800020" }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                تعديل بيانات الامتحان
              </h3>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                {exam.subject.name} • {exam.questionsCount} سؤال
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="px-5 py-3 text-[13px] font-bold bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#1E293B] dark:text-[#F87171] border-b border-[#E2E8F0] dark:border-[#F87171] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-white">
              عنوان الامتحان *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-white">
              وصف أو تعليمات الامتحان
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="تعليمات تظهر للطالب قبل بدء الامتحان..."
              className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                <span>المدة (بالدقائق)</span>
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#0F172A] dark:text-white">
                نوع الاختبار
              </label>
              <button
                type="button"
                onClick={() => setIsPractice(!isPractice)}
                className={`w-full h-11 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center border transition-colors cursor-pointer ${
                  isPractice
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                }`}
              >
                {isPractice ? "تدريب بشرح فوري" : "امتحان رسمي بوقت"}
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#0F172A] dark:text-white">
                حالة النشر
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full h-11 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center border transition-colors cursor-pointer ${
                  isPublished
                    ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399] border-[#059669]/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                {isPublished ? "منشور ومتاح" : "مسودة غير ظاهرة"}
              </button>
            </div>
          </div>

          {/* Schedule Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>تاريخ ووقت بدء الإتاحة (اختياري)</span>
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>تاريخ ووقت انتهاء الإتاحة (اختياري)</span>
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                dir="ltr"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl text-[13px] font-bold text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
