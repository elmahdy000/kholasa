"use client";

import Link from "next/link";
import {
  Clock,
  HelpCircle,
  Users,
  ExternalLink,
  Trash2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { ExamItem } from "./types";

interface ExamCardProps {
  exam: ExamItem;
  onTogglePractice: (examId: string, currentIsPractice: boolean) => void;
  onDeleteExam: (examId: string, title: string) => void;
  onSimulate?: (exam: ExamItem) => void;
}

export function ExamCard({
  exam,
  onTogglePractice,
  onDeleteExam,
  onSimulate,
}: ExamCardProps) {
  const now = new Date();
  const startsAtDate = exam.startsAt ? new Date(exam.startsAt) : null;
  const endsAtDate = exam.endsAt ? new Date(exam.endsAt) : null;

  const isFutureScheduled = startsAtDate && startsAtDate > now;
  const isExpired = endsAtDate && endsAtDate < now;
  const isDraft = exam.isPublished === false;

  const formatSchedule = (d: Date) => {
    return d.toLocaleString("ar-EG", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between space-y-4 transition-all hover:border-[#800020]/40 shadow-xs">
      <div className="space-y-3">
        {/* Badges Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className="text-[12px] font-bold px-2.5 py-1 rounded-lg text-white"
            style={{ backgroundColor: exam.subject.color || "#800020" }}
          >
            {exam.subject.name}
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                exam.isPractice
                  ? "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30"
                  : "bg-[#059669]/10 text-[#059669] border-[#059669]/30"
              }`}
            >
              {exam.isPractice ? "تدريب بشرح فوري" : "امتحان بوقت"}
            </span>

            {isDraft ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                مسودة
              </span>
            ) : isFutureScheduled ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>مجدول: {formatSchedule(startsAtDate)}</span>
              </span>
            ) : isExpired ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200">
                منتهي
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                نشط ومتاح
              </span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white leading-snug">
            {exam.title}
          </h3>
          {exam.description && (
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1 line-clamp-2">
              {exam.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]/60 text-center">
        <div>
          <span className="text-[12px] text-[#94A3B8] font-bold block">
            المدة
          </span>
          <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center gap-1 mt-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
            {exam.durationMinutes} د
          </span>
        </div>

        <div>
          <span className="text-[12px] text-[#94A3B8] font-bold block">
            الأسئلة
          </span>
          <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center gap-1 mt-1 font-mono">
            <HelpCircle className="w-3.5 h-3.5 text-[#94A3B8]" />
            {exam.questionsCount}
          </span>
        </div>

        <div>
          <span className="text-[12px] text-[#94A3B8] font-bold block">
            المحاولات
          </span>
          <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center gap-1 mt-1 font-mono">
            <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
            {exam.attemptsCount}
          </span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#334155]/80 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {onSimulate && (
            <button
              type="button"
              onClick={() => onSimulate(exam)}
              className="h-9 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="اختبار وضع وحل الامتحان في وضع المحاكاة بدون التأثير على الإحصائيات"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>محاكاة الامتحان</span>
            </button>
          )}

          <Link
            href={`/exams/${exam.id}`}
            target="_blank"
            className="h-9 px-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-[12px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5 transition-colors"
            title="فتح صفحة الامتحان كما تظهر للطالب"
          >
            <ExternalLink className="w-3 h-3 text-[#800020]" />
            <span>عرض الطالب</span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTogglePractice(exam.id, exam.isPractice)}
            className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#800020] cursor-pointer"
            title="التبديل بين وضع الامتحان والتدريب"
          >
            تبديل الوضع
          </button>
          <button
            type="button"
            onClick={() => onDeleteExam(exam.id, exam.title)}
            className="p-2 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            title="حذف الامتحان"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
