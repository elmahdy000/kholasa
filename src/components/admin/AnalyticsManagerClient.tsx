"use client";

import {
  Activity,
  Database,
  Users,
  BookOpen,
  Award,
  HelpCircle,
  TrendingUp,
  Clock,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  HardDrive,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    usersCount: number;
    studentsCount: number;
    teachersCount: number;
    subjectsCount: number;
    lessonsCount: number;
    questionsCount: number;
    examsCount: number;
    attemptsCount: number;
    completedAttemptsCount: number;
    avgScore: number;
    avgDurationMinutes: number;
  };
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionTypes: {
    mcq: number;
    essay: number;
  };
  scoreBrackets: {
    high: number;
    mid: number;
    low: number;
  };
  auditLogs: {
    id: string;
    action: string;
    resource: string;
    resourceId?: string | null;
    createdAt: string;
    user?: {
      name?: string | null;
      role: string;
    } | null;
  }[];
  recentAttempts: {
    id: string;
    title: string;
    startedAt: string;
    score: number;
    percentage: number;
    user: { name?: string | null };
    exam?: { title: string } | null;
  }[];
}

interface AnalyticsManagerClientProps {
  data: AnalyticsData;
}

export function AnalyticsManagerClient({ data }: AnalyticsManagerClientProps) {
  const { overview, difficultyDistribution, questionTypes, scoreBrackets, auditLogs, recentAttempts } =
    data;

  const totalQuestions =
    difficultyDistribution.easy +
    difficultyDistribution.medium +
    difficultyDistribution.hard || 1;

  const easyPercent = Math.round((difficultyDistribution.easy / totalQuestions) * 100);
  const medPercent = Math.round((difficultyDistribution.medium / totalQuestions) * 100);
  const hardPercent = Math.round((difficultyDistribution.hard / totalQuestions) * 100);

  const totalScores = scoreBrackets.high + scoreBrackets.mid + scoreBrackets.low || 1;
  const highPercent = Math.round((scoreBrackets.high / totalScores) * 100);
  const midPercent = Math.round((scoreBrackets.mid / totalScores) * 100);
  const lowPercent = Math.round((scoreBrackets.low / totalScores) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0F172A] dark:text-[#F8FAFC]" />
            <span>التحليلات الشاملة وسجل تدقيق النظام</span>
          </h1>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            مؤشرات الأداء الأكاديمي، توزيع صعوبة بنك الأسئلة، وتدقيق العمليات الإدارية
          </p>
        </div>

        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#64748B] dark:text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <span>Realtime Telemetry Active</span>
        </div>
      </div>

      {/* 4 Vercel-Style Key Metric Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]  flex flex-col justify-between">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
            إجمالي الطلاب والمستخدمين
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              {overview.usersCount}
            </span>
            <span className="text-[13px] font-mono text-[#64748B]">
              ({overview.studentsCount} طالب)
            </span>
          </div>
          <span className="text-[13px] text-[#059669] font-mono mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>حسابات نشطة في النظام</span>
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]  flex flex-col justify-between">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
            متوسط درجات الطلاب
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              {overview.avgScore}%
            </span>
            <span className="text-[13px] font-mono text-[#64748B]">
              من {overview.completedAttemptsCount} اختبار
            </span>
          </div>
          <span className="text-[13px] text-[#64748B] font-mono mt-2">
            معدل التحصيل التراكمي
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]  flex flex-col justify-between">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
            متوسط وقت إتمام الامتحان
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              {overview.avgDurationMinutes}
            </span>
            <span className="text-[13px] font-mono text-[#64748B]">دقيقة</span>
          </div>
          <span className="text-[13px] text-[#64748B] font-mono mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>سرعة الإجابة والتفاعل</span>
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]  flex flex-col justify-between">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
            حجم بنك الأسئلة
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              {overview.questionsCount}
            </span>
            <span className="text-[13px] font-mono text-[#64748B]">
              ({overview.examsCount} امتحانات)
            </span>
          </div>
          <span className="text-[13px] text-[#4F46E5] font-mono mt-2">
            {questionTypes.mcq} اختيار من متعدد · {questionTypes.essay} مقالي
          </span>
        </div>
      </div>

      {/* Two Column Visual Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score Distribution Brackets */}
        <div className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] space-y-4 ">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
            <h3 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
              توزيع نتائج الطلاب (مستويات التحصيل)
            </h3>
            <span className="text-[13px] font-mono text-[#64748B]">
              {overview.completedAttemptsCount} محاولة
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-[13px] font-semibold mb-1">
                <span className="text-[#059669]">ممتاز (85% فأكثر)</span>
                <span className="font-mono">{scoreBrackets.high} ({highPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden">
                <div
                  className="h-full bg-[#059669] rounded-full"
                  style={{ width: `${highPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] font-semibold mb-1">
                <span className="text-[#D97706]">متوسط (50% - 84%)</span>
                <span className="font-mono">{scoreBrackets.mid} ({midPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden">
                <div
                  className="h-full bg-[#D97706] rounded-full"
                  style={{ width: `${midPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] font-semibold mb-1">
                <span className="text-[#DC2626]">يحتاج لتحسين (أقل من 50%)</span>
                <span className="font-mono">{scoreBrackets.low} ({lowPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden">
                <div
                  className="h-full bg-[#DC2626] rounded-full"
                  style={{ width: `${lowPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question Bank Difficulty Distribution */}
        <div className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] space-y-4 ">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
            <h3 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
              توزيع صعوبة بنك الأسئلة
            </h3>
            <span className="text-[13px] font-mono text-[#64748B]">
              {overview.questionsCount} سؤال
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-[13px] font-semibold mb-1">
                <span className="text-[#4F46E5]">مستوى بسيط / تمهيدي (Easy)</span>
                <span className="font-mono">{difficultyDistribution.easy} ({easyPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden">
                <div
                  className="h-full bg-[#4F46E5] rounded-full"
                  style={{ width: `${easyPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] font-semibold mb-1">
                <span className="text-[#4F46E5]">مستوى متوسط / تطبيقي (Medium)</span>
                <span className="font-mono">{difficultyDistribution.medium} ({medPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden">
                <div
                  className="h-full bg-[#4F46E5] rounded-full"
                  style={{ width: `${medPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] font-semibold mb-1">
                <span className="text-[#DC2626]">مستوى متقدم / تفكير عليا (Hard)</span>
                <span className="font-mono">{difficultyDistribution.hard} ({hardPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden">
                <div
                  className="h-full bg-[#DC2626] rounded-full"
                  style={{ width: `${hardPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Objects and Storage Telemetry */}
      <div className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] space-y-4 ">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
          <h3 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#64748B]" />
            <span>سجلات وتخزين قاعدة البيانات (Prisma PostgreSQL Engine)</span>
          </h3>
          <span className="text-[13px] font-mono text-[#059669]">
            All Tables Healthy
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0]/60 dark:border-[#334155]/60">
            <span className="text-[13px] font-mono text-[#64748B] block">المواد الدراسية</span>
            <span className="text-lg font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 block">
              {overview.subjectsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0]/60 dark:border-[#334155]/60">
            <span className="text-[13px] font-mono text-[#64748B] block">الدروس والشروحات</span>
            <span className="text-lg font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 block">
              {overview.lessonsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0]/60 dark:border-[#334155]/60">
            <span className="text-[13px] font-mono text-[#64748B] block">بنك الأسئلة</span>
            <span className="text-lg font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 block">
              {overview.questionsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0]/60 dark:border-[#334155]/60">
            <span className="text-[13px] font-mono text-[#64748B] block">الامتحانات</span>
            <span className="text-lg font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 block">
              {overview.examsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0]/60 dark:border-[#334155]/60">
            <span className="text-[13px] font-mono text-[#64748B] block">محاولات الطلاب</span>
            <span className="text-lg font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 block">
              {overview.attemptsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0]/60 dark:border-[#334155]/60">
            <span className="text-[13px] font-mono text-[#64748B] block">المستخدمين</span>
            <span className="text-lg font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 block">
              {overview.usersCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
