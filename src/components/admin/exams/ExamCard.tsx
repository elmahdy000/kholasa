"use client";

import Link from "next/link";
import { Clock, HelpCircle, Users, ExternalLink, Trash2 } from "lucide-react";
import { ExamItem } from "./types";

interface ExamCardProps {
  exam: ExamItem;
  onTogglePractice: (examId: string, currentIsPractice: boolean) => void;
  onDeleteExam: (examId: string, title: string) => void;
}

export function ExamCard({
  exam,
  onTogglePractice,
  onDeleteExam,
}: ExamCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between space-y-4 transition-all hover:border-[#800020]/40">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[13px] font-bold px-2.5 py-1 rounded-lg text-white"
            style={{ backgroundColor: exam.subject.color || "#800020" }}
          >
            {exam.subject.name}
          </span>

          <span
            className={`text-[13px] font-bold px-2 py-0.5 rounded-md border ${
              exam.isPractice
                ? "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30"
                : "bg-[#059669]/10 text-[#059669] border-[#059669]/30"
            }`}
          >
            {exam.isPractice ? "تدريب بشرح فوري" : "امتحان حقيقي بوقت"}
          </span>
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
          <span className="text-[13px] text-[#94A3B8] font-bold block">
            المدة
          </span>
          <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center gap-1 mt-1 font-mono">
            <Clock className="w-3 h-3 text-[#94A3B8]" />
            {exam.durationMinutes} د
          </span>
        </div>

        <div>
          <span className="text-[13px] text-[#94A3B8] font-bold block">
            الأسئلة
          </span>
          <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center gap-1 mt-1">
            <HelpCircle className="w-3 h-3 text-[#94A3B8]" />
            {exam.questionsCount}
          </span>
        </div>

        <div>
          <span className="text-[13px] text-[#94A3B8] font-bold block">
            المحاولات
          </span>
          <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center gap-1 mt-1">
            <Users className="w-3 h-3 text-[#94A3B8]" />
            {exam.attemptsCount}
          </span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#334155]/80">
        <Link
          href={`/exams/${exam.id}`}
          target="_blank"
          className="h-11 px-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2 transition-colors"
        >
          <ExternalLink className="w-3 h-3 text-[#800020]" />
          <span>معاينة كطالب</span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTogglePractice(exam.id, exam.isPractice)}
            className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#800020] cursor-pointer"
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
