"use client";

import Link from "next/link";
import {
  ChartLineUp,
  Target,
  ArrowRight,
  TrendUp,
  CheckCircle,
  WarningCircle,
  BookOpen,
  ArrowSquareOut,
} from "@phosphor-icons/react";

export interface StudentMasteryMapProps {
  data: {
    overallMasteryPercentage: number;
    totalCurriculumQuestions: number;
    totalMasteredQuestions: number;
    subjects: {
      id: string;
      name: string;
      color: string | null;
      icon: string | null;
      totalQuestions: number;
      masteredCount: number;
      masteryPercentage: number;
      units: {
        id: string;
        title: string;
        order: number;
        totalQuestions: number;
        masteredCount: number;
        masteryPercentage: number;
        lessons: {
          id: string;
          title: string;
          durationMinutes: number;
          totalQuestions: number;
          masteredCount: number;
          masteryPercentage: number;
          unresolvedMistakesCount: number;
        }[];
      }[];
    }[];
    focusRecommendation: {
      lessonId: string;
      lessonTitle: string;
      unitTitle: string;
      subjectId: string;
      subjectName: string;
      subjectColor: string | null;
      masteryPercentage: number;
      unresolvedMistakesCount: number;
      reason: string;
    } | null;
    scoreProgression: {
      id: string;
      title: string;
      percentage: number;
      dateFormatted: string;
      completedAt: string;
    }[];
  };
}

export function StudentMasteryMapCard({ data }: StudentMasteryMapProps) {
  const {
    overallMasteryPercentage,
    totalCurriculumQuestions,
    totalMasteredQuestions,
    subjects,
    focusRecommendation,
    scoreProgression,
  } = data;

  // Render SVG Sparkline / Line Chart
  const renderSparkline = () => {
    if (!scoreProgression || scoreProgression.length < 2) {
      return (
        <div className="py-6 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] text-center space-y-2">
          <ChartLineUp className="w-6 h-6 mx-auto text-[#64748B] dark:text-[#94A3B8]" weight="duotone" />
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed">
            امتحن امتحانات وتدريبات أكتر، وهيظهر هنا فوراً مسار تطور درجاتك الزمني ونسبة تقدمك.
          </p>
        </div>
      );
    }

    const width = 600;
    const height = 120;
    const padding = 28;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    const points = scoreProgression.map((item, idx) => {
      const x = padding + (idx / (scoreProgression.length - 1)) * innerWidth;
      const y = height - padding - (item.percentage / 100) * innerHeight;
      return { x, y, percentage: item.percentage, date: item.dateFormatted, title: item.title };
    });

    const pathD = points.reduce(
      (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
      ""
    );

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${
      height - padding
    } Z`;

    const firstScore = scoreProgression[0].percentage;
    const lastScore = scoreProgression[scoreProgression.length - 1].percentage;
    const diff = lastScore - firstScore;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[13px] font-bold">
          <span className="flex items-center gap-1.5 text-[#0F172A] dark:text-[#F8FAFC]">
            <TrendUp className="w-4 h-4 text-[#059669]" weight="bold" />
            <span>مسار نتائج آخر {scoreProgression.length} امتحانات:</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-md font-mono text-[12px] font-bold ${
              diff > 0
                ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399]"
                : diff < 0
                ? "bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171]"
                : "bg-[#64748B]/10 text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            {diff > 0
              ? `+${diff}% تقدم في المستوى`
              : diff < 0
              ? `${diff}% بحاجة للمراجعة`
              : `مستوى مستقر (${lastScore}%)`}
          </span>
        </div>

        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <div className="min-w-[420px] p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#142747]/70 border border-[#E2E8F0] dark:border-[#1E3352]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
              <defs>
                <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2C70BF" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2C70BF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line
                x1={padding}
                y1={padding}
                x2={width - padding}
                y2={padding}
                stroke="currentColor"
                className="text-[#E2E8F0] dark:text-[#1E3352]"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={padding}
                y1={height - padding}
                x2={width - padding}
                y2={height - padding}
                stroke="currentColor"
                className="text-[#E2E8F0] dark:text-[#1E3352]"
                strokeWidth="1"
              />

              {/* Shaded Area */}
              <path d={areaD} fill="url(#scoreAreaGradient)" />

              {/* Path Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#2C70BF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    className="fill-white dark:fill-[#0F1E36] stroke-[#2C70BF] stroke-[2.5]"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-[#0F172A] dark:fill-white font-mono"
                  >
                    {pt.percentage}%
                  </text>
                  <text
                    x={pt.x}
                    y={height - 8}
                    textAnchor="middle"
                    className="text-[10px] font-medium fill-[#64748B] dark:fill-[#94A3B8]"
                  >
                    {pt.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="rounded-xl bg-white dark:bg-[#0F1E36] border border-[#E2E8F0] dark:border-[#1E3352] p-5 sm:p-6 space-y-6 text-right">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#1E3352] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2C70BF]/10 dark:bg-[#2C70BF]/20 flex items-center justify-center text-[#1D4ED8] dark:text-[#60A5FA]">
              <ChartLineUp className="w-4 h-4" weight="bold" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              خريطة مستواك ونقاط قوتك
            </h2>
          </div>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium">
            متابعة واضحة لمستواك في الأسئلة في كل مادة ودرجاتك أول بأول
          </p>
        </div>

        {/* Overall Mastery Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8FAFC] dark:bg-[#142747] border border-[#E2E8F0] dark:border-[#1E3352] self-start sm:self-center">
          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium">
            مستواك العام في المنهج:
          </span>
          <span className="text-[13px] font-mono font-bold text-[#1D4ED8] dark:text-[#60A5FA]">
            {overallMasteryPercentage}%
          </span>
          <span className="text-[11px] text-[#64748B] font-mono">
            ({totalMasteredQuestions} من {totalCurriculumQuestions} سؤال)
          </span>
        </div>
      </div>

      {/* 2. Focus Recommendation Banner */}
      {focusRecommendation && (
        <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                <Target className="w-3.5 h-3.5" weight="bold" />
                <span>درس يفضل تراجعه النهاردة</span>
              </span>
              <span className="text-[12px] font-bold text-amber-900 dark:text-amber-200">
                {focusRecommendation.subjectName} • {focusRecommendation.unitTitle}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
              {focusRecommendation.lessonTitle}
            </h3>
            <p className="text-[12px] text-amber-900/80 dark:text-amber-200/80 font-medium">
              {focusRecommendation.reason}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/exams/builder?subjectId=${focusRecommendation.subjectId}&lessonId=${focusRecommendation.lessonId}`}
              className="h-10 px-4 rounded-lg bg-[#091B40] hover:bg-[#12263F] dark:bg-[#2C70BF] dark:hover:bg-[#1D4ED8] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Target className="w-4 h-4" weight="bold" />
              <span>ابدأ امتحان الدرس</span>
            </Link>
            <Link
              href={`/lessons/${focusRecommendation.lessonId}`}
              className="h-10 px-3.5 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#F8FAFC] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" weight="bold" />
              <span className="hidden sm:inline">مذاكرة</span>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Progression Sparkline */}
      {renderSparkline()}

      {/* 4. Subject Mastery Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          مستواك في كل مادة:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((subj) => {
            const isHigh = subj.masteryPercentage >= 80;
            const isMedium = subj.masteryPercentage >= 50 && subj.masteryPercentage < 80;

            const badgeBg = isHigh
              ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399]"
              : isMedium
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "bg-[#64748B]/10 text-[#64748B] dark:text-[#94A3B8]";

            const badgeText = isHigh
              ? "ممتاز"
              : isMedium
              ? "كويس"
              : "محتاج تركيز";

            return (
              <div
                key={subj.id}
                className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#142747]/70 border border-[#E2E8F0] dark:border-[#1E3352] flex flex-col justify-between gap-3 hover:border-[#2C70BF]/45 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <Link
                      href={`/subjects/${subj.id}`}
                      className="text-sm font-bold text-[#0F172A] dark:text-white hover:text-[#2C70BF] dark:hover:text-[#60A5FA] flex items-center gap-1.5 transition-colors"
                    >
                      <span>{subj.name}</span>
                      <ArrowSquareOut className="w-3.5 h-3.5 text-[#64748B]" />
                    </Link>
                    <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                      {subj.masteredCount} من {subj.totalQuestions} سؤال خلصتهم
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">نسبة الحل الصح</span>
                    <span
                      className={
                        isHigh
                          ? "text-[#059669] dark:text-[#34D399]"
                          : isMedium
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-[#64748B] dark:text-[#94A3B8]"
                      }
                    >
                      {subj.masteryPercentage}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh
                          ? "bg-[#059669] dark:bg-[#34D399]"
                          : isMedium
                          ? "bg-[#B45309] dark:bg-[#F0B843]"
                          : "bg-[#2C70BF] dark:bg-[#60A5FA]"
                      }`}
                      style={{ width: `${Math.max(4, subj.masteryPercentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

