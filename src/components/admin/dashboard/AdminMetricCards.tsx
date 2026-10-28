import { Users, BookOpen, Layers, HelpCircle, Award, Trophy, TrendingUp } from "lucide-react";
import type { AdminDashboardMetrics } from "./types";

interface AdminMetricCardsProps {
  metrics: AdminDashboardMetrics;
}

export function AdminMetricCards({ metrics }: AdminMetricCardsProps) {
  const {
    studentsCount,
    subjectsCount,
    unitsCount,
    lessonsCount,
    questionsCount,
    examsCount,
    attemptsCount,
    avgScore,
  } = metrics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
            الطلاب النشطون
          </span>
          <Users className="w-3.5 h-3.5 text-[#64748B]" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            {studentsCount}
          </span>
        </div>
        <span className="text-[13px] text-[#059669] font-mono mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>حسابات نشطة</span>
        </span>
      </div>

      <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
            المواد الدراسية
          </span>
          <BookOpen className="w-3.5 h-3.5 text-[#64748B]" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            {subjectsCount}
          </span>
        </div>
        <span className="text-[13px] text-[#64748B] font-mono mt-2">
          في {unitsCount} وحدة تعليمية
        </span>
      </div>

      <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
            الدروس المنشورة
          </span>
          <Layers className="w-3.5 h-3.5 text-[#64748B]" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            {lessonsCount}
          </span>
        </div>
        <span className="text-[13px] text-[#64748B] font-mono mt-2">
          بودكاست وفيديو وخرائط
        </span>
      </div>

      <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
            بنك الأسئلة
          </span>
          <HelpCircle className="w-3.5 h-3.5 text-[#64748B]" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            {questionsCount}
          </span>
        </div>
        <span className="text-[13px] text-[#64748B] font-mono mt-2">
          مع التفسير والمفاهيم
        </span>
      </div>

      <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
            الامتحانات
          </span>
          <Award className="w-3.5 h-3.5 text-[#64748B]" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            {examsCount}
          </span>
        </div>
        <span className="text-[13px] text-[#64748B] font-mono mt-2">
          رسمية وتدريبية
        </span>
      </div>

      <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
            متوسط التحصيل
          </span>
          <Trophy className="w-3.5 h-3.5 text-[#64748B]" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            {avgScore}%
          </span>
        </div>
        <span className="text-[13px] text-[#64748B] font-mono mt-2">
          من {attemptsCount} محاولة
        </span>
      </div>
    </div>
  );
}
