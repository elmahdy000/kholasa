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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            <span>التحليلات الشاملة وسجل تدقيق النظام</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            مؤشرات الأداء الأكاديمي، توزيع صعوبة بنك الأسئلة، وتدقيق العمليات الإدارية
          </p>
        </div>

        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Realtime Telemetry Active</span>
        </div>
      </div>

      {/* 4 Vercel-Style Key Metric Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            إجمالي الطلاب والمستخدمين
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {overview.usersCount}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              ({overview.studentsCount} طالب)
            </span>
          </div>
          <span className="text-[10px] text-emerald-500 font-mono mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>حسابات نشطة في النظام</span>
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            متوسط درجات الطلاب
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {overview.avgScore}%
            </span>
            <span className="text-xs font-mono text-zinc-400">
              من {overview.completedAttemptsCount} اختبار
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-2">
            معدل التحصيل التراكمي
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            متوسط وقت إتمام الامتحان
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {overview.avgDurationMinutes}
            </span>
            <span className="text-xs font-mono text-zinc-400">دقيقة</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>سرعة الإجابة والتفاعل</span>
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            حجم بنك الأسئلة
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {overview.questionsCount}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              ({overview.examsCount} امتحانات)
            </span>
          </div>
          <span className="text-[10px] text-indigo-400 font-mono mt-2">
            {questionTypes.mcq} اختيار من متعدد · {questionTypes.essay} مقالي
          </span>
        </div>
      </div>

      {/* Two Column Visual Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score Distribution Brackets */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              توزيع نتائج الطلاب (مستويات التحصيل)
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              {overview.completedAttemptsCount} محاولة
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-500">ممتاز (85% فأكثر)</span>
                <span className="font-mono">{scoreBrackets.high} ({highPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${highPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-amber-500">متوسط (50% - 84%)</span>
                <span className="font-mono">{scoreBrackets.mid} ({midPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${midPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-red-500">يحتاج لتحسين (أقل من 50%)</span>
                <span className="font-mono">{scoreBrackets.low} ({lowPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${lowPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question Bank Difficulty Distribution */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              توزيع صعوبة بنك الأسئلة
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              {overview.questionsCount} سؤال
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-blue-500">مستوى بسيط / تمهيدي (Easy)</span>
                <span className="font-mono">{difficultyDistribution.easy} ({easyPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${easyPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-purple-500">مستوى متوسط / تطبيقي (Medium)</span>
                <span className="font-mono">{difficultyDistribution.medium} ({medPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${medPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-rose-500">مستوى متقدم / تفكير عليا (Hard)</span>
                <span className="font-mono">{difficultyDistribution.hard} ({hardPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${hardPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Objects and Storage Telemetry */}
      <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-400" />
            <span>سجلات وتخزين قاعدة البيانات (Prisma PostgreSQL Engine)</span>
          </h3>
          <span className="text-[11px] font-mono text-emerald-500">
            All Tables Healthy
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-mono text-zinc-400 block">المواد الدراسية</span>
            <span className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
              {overview.subjectsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-mono text-zinc-400 block">الدروس والشروحات</span>
            <span className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
              {overview.lessonsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-mono text-zinc-400 block">بنك الأسئلة</span>
            <span className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
              {overview.questionsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-mono text-zinc-400 block">الامتحانات</span>
            <span className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
              {overview.examsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-mono text-zinc-400 block">محاولات الطلاب</span>
            <span className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
              {overview.attemptsCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-mono text-zinc-400 block">المستخدمين</span>
            <span className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
              {overview.usersCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
