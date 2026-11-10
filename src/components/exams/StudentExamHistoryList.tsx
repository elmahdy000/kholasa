"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { History, ArrowLeft, Clock, Target, CheckCircle2, BookOpen, Layers } from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";

export interface StudentExamAttemptItem {
  id: string;
  examId: string | null;
  title: string;
  percentage: number;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  completedAt: Date | string | null;
  startedAt: Date | string;
  exam?: {
    id: string;
    subject?: {
      id: string;
      name: string;
      color?: string | null;
    } | null;
  } | null;
}

interface StudentExamHistoryListProps {
  attempts: StudentExamAttemptItem[];
}

type TabType = "all" | "lessons" | "units" | "comprehensive";

export function StudentExamHistoryList({ attempts }: StudentExamHistoryListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const filteredAttempts = useMemo(() => {
    if (activeTab === "all") return attempts;
    if (activeTab === "lessons") {
      return attempts.filter((a) => a.title.includes("درس") || a.title.includes("الدرس"));
    }
    if (activeTab === "units") {
      return attempts.filter((a) => a.title.includes("وحدة") || a.title.includes("الوحدة"));
    }
    if (activeTab === "comprehensive") {
      return attempts.filter(
        (a) =>
          !a.title.includes("درس") &&
          !a.title.includes("الدرس") &&
          !a.title.includes("وحدة") &&
          !a.title.includes("الوحدة")
      );
    }
    return attempts;
  }, [attempts, activeTab]);

  const counts = useMemo(() => {
    return {
      all: attempts.length,
      lessons: attempts.filter((a) => a.title.includes("درس") || a.title.includes("الدرس")).length,
      units: attempts.filter((a) => a.title.includes("وحدة") || a.title.includes("الوحدة")).length,
      comprehensive: attempts.filter(
        (a) =>
          !a.title.includes("درس") &&
          !a.title.includes("الدرس") &&
          !a.title.includes("وحدة") &&
          !a.title.includes("الوحدة")
      ).length,
    };
  }, [attempts]);

  if (attempts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-[#800B34] dark:text-[#FB7185]" />
          <span>سجل امتحاناتك السابقة (محفوظة بالكامل للمراجعة)</span>
        </h2>
        <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
          إجمالي الامتحانات المنجزة: {attempts.length} امتحان
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`h-9 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            activeTab === "all"
              ? "bg-[#800B34] text-white shadow-xs"
              : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34]/40"
          }`}
        >
          <span>الكل</span>
          <span className="text-[11px] font-mono opacity-80 font-normal">({counts.all})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("lessons")}
          className={`h-9 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            activeTab === "lessons"
              ? "bg-[#800B34] text-white shadow-xs"
              : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34]/40"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>امتحانات الدروس</span>
          <span className="text-[11px] font-mono opacity-80 font-normal">({counts.lessons})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("units")}
          className={`h-9 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            activeTab === "units"
              ? "bg-[#800B34] text-white shadow-xs"
              : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34]/40"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>امتحانات الوحدات</span>
          <span className="text-[11px] font-mono opacity-80 font-normal">({counts.units})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comprehensive")}
          className={`h-9 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            activeTab === "comprehensive"
              ? "bg-[#800B34] text-white shadow-xs"
              : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34]/40"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>شاملة ومخصصة</span>
          <span className="text-[11px] font-mono opacity-80 font-normal">({counts.comprehensive})</span>
        </button>
      </div>

      {/* Attempts List */}
      <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] divide-y divide-[#E2E8F0] dark:divide-[#334155] overflow-hidden shadow-xs">
        {filteredAttempts.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
            لا توجد امتحانات مسجلة في هذا القسم بعد.
          </div>
        ) : (
          filteredAttempts.map((attempt) => {
            const isGood = attempt.percentage >= 70;
            const isPass = attempt.percentage >= 50;

            const scoreColor = isGood
              ? "bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] border-[#E2E8F0] dark:border-[#34D399]/50"
              : isPass
              ? "bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] border-[#E2E8F0] dark:border-[#FBBF24]/50"
              : "bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] border-[#E2E8F0] dark:border-[#F87171]/50";

            const dateValue = attempt.completedAt || attempt.startedAt;
            const dateStr = new Date(dateValue).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const durationMinutes = Math.max(1, Math.round(attempt.timeSpentSeconds / 60));

            return (
              <div
                key={attempt.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 border ${scoreColor}`}
                  >
                    <span>{Math.round(attempt.percentage)}%</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white leading-normal">
                      <BidiStatement as="span" text={attempt.title} />
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
                      <span className="font-bold text-[#0F172A] dark:text-slate-200">
                        {attempt.score} من {attempt.totalQuestions} أسئلة صحيحة
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{durationMinutes} دقيقة</span>
                      </span>
                      <span>•</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={
                    attempt.examId
                      ? `/exams/${attempt.examId}/results?attemptId=${attempt.id}`
                      : `/exams/${attempt.id}/results`
                  }
                  className="h-10 px-4 rounded-xl border border-[#800B34]/30 hover:border-[#800B34] bg-white dark:bg-[#1E293B] hover:bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 self-stretch sm:self-center"
                >
                  <span>مراجعة الامتحان والحل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

