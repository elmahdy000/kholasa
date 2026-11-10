"use client";

import { useState } from "react";
import Link from "next/link";
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
  Smartphone,
  KeyRound,
  GraduationCap,
  Check,
  Copy,
  Send,
  Sparkles,
  ExternalLink,
  Trophy,
  Calendar,
  Radio,
  BarChart3,
} from "lucide-react";
import { RealtimeObservatoryClient } from "./analytics/RealtimeObservatoryClient";
import type {
  RealtimeMetrics,
  RealtimeStudentItem,
  RealtimeActivityEvent,
} from "@/services/realtime-analytics.service";
import type { EducationalSystem, Grade } from "./users/types";

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
  dailyActivity?: {
    todayCount: number;
    yesterdayCount: number;
    past7DaysAverage: number;
    days: Array<{
      dateStr: string;
      dayName: string;
      isToday: boolean;
      isYesterday: boolean;
      uniqueStudentsCount: number;
      students: Array<{
        id: string;
        name: string;
        loginCode: string;
        gradeName: string;
        schoolCategory: "ARABIC" | "LANGUAGES";
        lastActiveTime: string;
        actions: string[];
      }>;
    }>;
  };
  studentCohort?: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    arabicStudents: number;
    languagesStudents: number;
    oneDeviceStudents: number;
    twoDevicesStudents: number;
    completedLessons: number;
    totalMistakes: number;
    resolvedMistakes: number;
    topStudents: {
      id: string;
      name: string;
      phone: string;
      loginCode: string;
      schoolCategory: "ARABIC" | "LANGUAGES";
      attemptsCount: number;
      completedLessons: number;
      averageScore: number;
      boundDevicesCount: number;
    }[];
    pendingStudents: {
      id: string;
      name: string;
      phone: string;
      loginCode: string;
      schoolCategory: "ARABIC" | "LANGUAGES";
      createdAt: string;
    }[];
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
  realtimeInitialData?: {
    metrics: RealtimeMetrics;
    students: RealtimeStudentItem[];
    liveFeed: RealtimeActivityEvent[];
  };
  systems?: EducationalSystem[];
  grades?: Grade[];
}

export function AnalyticsManagerClient({
  data,
  realtimeInitialData,
  systems = [],
  grades = [],
}: AnalyticsManagerClientProps) {
  const {
    overview,
    studentCohort,
    dailyActivity,
    difficultyDistribution,
    questionTypes,
    scoreBrackets,
    auditLogs,
    recentAttempts,
  } = data;

  const [activeView, setActiveView] = useState<
    "realtime" | "dau" | "cohort" | "questions" | "audit" | "all"
  >("realtime");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const handleCopyInvite = (student: { name: string; loginCode: string }) => {
    const text = `مرحباً بك يا ${student.name} في منصة "الخلاصة" التعليمية! 🎉\n\nكود الدخول الحصري الخاص بك هو: ${student.loginCode}\n\n🔗 رابط المنصة للدخول المباشر:\nhttps://kholasa.com/login\n\nيرجى الدخول من جهازك المعتمد لحل الاختبارات ومتابعة دروسك. بالتوفيق والنجاح! 🚀`;
    navigator.clipboard.writeText(text);
    setCopiedCodeId(student.loginCode);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSendWhatsAppInvite = (student: { name: string; loginCode: string; phone: string }) => {
    let phoneNum = (student.phone || "").replace(/\D/g, "");
    if (phoneNum.startsWith("0")) {
      phoneNum = "2" + phoneNum;
    } else if (!phoneNum.startsWith("20") && phoneNum.length === 10) {
      phoneNum = "20" + phoneNum;
    }
    const text = `مرحباً بك يا ${student.name} في منصة "الخلاصة" التعليمية! 🎉\n\nكود الدخول الحصري الخاص بك هو: *${student.loginCode}*\n\n🔗 رابط المنصة للدخول المباشر:\nhttps://kholasa.com/login\n\nيرجى الدخول من جهازك المعتمد لحل الاختبارات ومتابعة دروسك. بالتوفيق والنجاح! 🚀`;
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const cohort = studentCohort || {
    totalStudents: overview.studentsCount,
    activeStudents: 0,
    inactiveStudents: overview.studentsCount,
    arabicStudents: 0,
    languagesStudents: 0,
    oneDeviceStudents: overview.studentsCount,
    twoDevicesStudents: 0,
    completedLessons: 0,
    totalMistakes: 0,
    resolvedMistakes: 0,
    topStudents: [],
    pendingStudents: [],
  };

  const dau = dailyActivity || {
    todayCount: 0,
    yesterdayCount: 0,
    past7DaysAverage: 0,
    days: [],
  };

  const selectedDay = dau.days[selectedDayIndex] || dau.days[0] || null;
  const maxDayCount = Math.max(1, ...dau.days.map((d) => d.uniqueStudentsCount));

  const totalCohort = cohort.totalStudents || 1;
  const activePercent = Math.round((cohort.activeStudents / totalCohort) * 100);
  const inactivePercent = 100 - activePercent;
  const arabicPercent = Math.round((cohort.arabicStudents / totalCohort) * 100);
  const languagesPercent = Math.round((cohort.languagesStudents / totalCohort) * 100);

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

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/reports"
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>التقارير اليومية المنفصلة</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Live Pulse Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span>Realtime Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* Main View Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveView("realtime")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeView === "realtime"
              ? "bg-[#800020] text-white shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>المرصد الفوري المباشر (Realtime)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("dau")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeView === "dau"
              ? "bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>حضور 14 يوماً (DAU)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("cohort")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeView === "cohort"
              ? "bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>إحصائيات الدفعة والأجهزة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("questions")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeView === "questions"
              ? "bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>بنك الأسئلة وصعوبة المحتوى</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("audit")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeView === "audit"
              ? "bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>سجل التدقيق ({auditLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("all")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeView === "all"
              ? "bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>عرض التقرير الكامل</span>
        </button>
      </div>

      {/* 1. Realtime Observatory View */}
      {(activeView === "realtime" || activeView === "all") && (
        <RealtimeObservatoryClient
          initialMetrics={realtimeInitialData?.metrics}
          initialStudents={realtimeInitialData?.students}
          initialLiveFeed={realtimeInitialData?.liveFeed}
          systems={systems}
          grades={grades}
        />
      )}

      {/* 2. Daily Active Students (DAU) & 14-Day Telemetry View */}
      {(activeView === "dau" || activeView === "all") && (
        <>
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
          <span className="text-[13px] text-[#800020] font-mono mt-2">
            {questionTypes.mcq} اختيار من متعدد · {questionTypes.essay} مقالي
          </span>
        </div>
      </div>

      {/* 4.5. Dedicated Daily Active Students (DAU) & Activity Telemetry */}
      <div className="p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
                سجل الحضور والنشاط اليومي للطلاب (Daily Active Students - DAU)
              </h2>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              متابعة دقيقة لعدد الطلاب الذين يدخلون المنصة يوماً بيوم، وتفاصيل ما ذاكروه وتفاعلوا معه
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] border border-[#800020]/20">
              اليوم: {dau.todayCount} طالب
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              أمس: {dau.yesterdayCount} طالب
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              متوسط أسبوعي: {dau.past7DaysAverage} طالب/يوم
            </span>
          </div>
        </div>

        {/* 14-Day Visual Bar Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0F172A] dark:text-white">
              مخطط تفاعل الطلاب لآخر 14 يوماً (انقر على أي يوم لعرض أسماء وتفاصيل نشاط الطلاب)
            </span>
            <span className="text-[11px] text-[#64748B] font-mono">
              الأعلى: {maxDayCount} طلاب
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/30 border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-36 pt-4">
              {dau.days.map((day, idx) => {
                const isSelected = idx === selectedDayIndex;
                const heightPercent =
                  day.uniqueStudentsCount > 0
                    ? Math.max(22, Math.round((day.uniqueStudentsCount / maxDayCount) * 100))
                    : 10;

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer focus:outline-none"
                    title={`${day.dayName} (${day.dateStr}): ${day.uniqueStudentsCount} طالب`}
                  >
                    <span
                      className={`text-[10px] font-mono font-bold mb-1 transition-all ${
                        isSelected
                          ? "text-[#800020] dark:text-[#FB7185] scale-110"
                          : "text-[#64748B] group-hover:text-[#0F172A] dark:group-hover:text-white"
                      }`}
                    >
                      {day.uniqueStudentsCount}
                    </span>

                    <div className="w-full max-w-[32px] h-24 flex items-end justify-center">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isSelected
                            ? "bg-[#800020] dark:bg-[#FB7185] shadow-xs"
                            : day.uniqueStudentsCount > 0
                            ? "bg-slate-300 hover:bg-[#800020]/70 dark:bg-slate-700 dark:hover:bg-[#FB7185]/70"
                            : "bg-slate-200/60 dark:bg-slate-800/60"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <span
                      className={`text-[10px] mt-2 font-mono whitespace-nowrap block truncate max-w-[42px] transition-colors ${
                        isSelected
                          ? "font-bold text-[#800020] dark:text-[#FB7185]"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {day.dayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Details Panel */}
        {selectedDay && (
          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/20 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
                <h3 className="font-bold text-xs text-[#0F172A] dark:text-white">
                  سجل نشاط الطلاب في {selectedDay.dayName} ({selectedDay.dateStr})
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {selectedDay.uniqueStudentsCount} طالب دخل المنصة
              </span>
            </div>

            {selectedDay.students.length === 0 ? (
              <p className="text-xs text-[#64748B] py-6 text-center">
                لم يتم تسجيل دخول أي طالب في هذا اليوم ({selectedDay.dateStr}).
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDay.students.map((student) => (
                  <div
                    key={student.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-[#0F172A] dark:text-white block">
                            {student.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] font-mono mt-0.5">
                            <span className="font-bold text-[#800020] dark:text-[#FB7185]">
                              كود: {student.loginCode}
                            </span>
                            <span>• {student.gradeName}</span>
                            <span>• {student.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}</span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={`/admin/users?search=${encodeURIComponent(student.loginCode)}`}
                        className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-slate-600 hover:text-[#800020] hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-colors"
                        title="فتح ملف الطالب في إدارة المستخدمين"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* What student studied/did that day */}
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-[#94A3B8] font-bold block">
                        النشاط المسجل في هذا اليوم:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {student.actions.map((act, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}

      {/* 3. Dedicated Student Cohort Telemetry Section */}
      {(activeView === "cohort" || activeView === "all") && (
      <div className="p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#800020] animate-ping" />
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
                <span>إحصائيات دفعة الطلاب وحالة الدخول والأجهزة (Student Cohort Telemetry)</span>
              </h2>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              متابعة دقيقة لحالة تفعيل الأكواد، نسبة الطلاب النشطين، الأجهزة المعتمدة، والتواصل الفوري
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/admin/users"
              className="h-9 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>إدارة ملفات الطلاب</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="/api/admin/users/export"
              download
              className="h-9 px-3.5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>تصدير كشف Excel</span>
            </a>
          </div>
        </div>

        {/* 4 Cards Grid for Student Cohort */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Students & School Category Breakdown */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/30 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">إجمالي طلاب الدفعة</span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-[#0F172A] dark:text-white">
                {cohort.totalStudents}
              </span>
              <span className="text-xs text-[#64748B] mr-1">طالب مسجل</span>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                <span>عربي: {cohort.arabicStudents} ({arabicPercent}%)</span>
                <span>لغات: {cohort.languagesStudents} ({languagesPercent}%)</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                <div className="bg-[#800020] h-full" style={{ width: `${arabicPercent}%` }} />
                <div className="bg-amber-500 h-full" style={{ width: `${languagesPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Card 2: Active vs Inactive / Pending Login */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/30 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">حالة تفعيل الأكواد والأجهزة</span>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {cohort.activeStudents}
              </span>
              <span className="text-xs text-[#64748B]">نشط</span>
              <span className="text-xs text-[#94A3B8]">/</span>
              <span className="text-base font-mono font-bold text-amber-600 dark:text-amber-400">
                {cohort.inactiveStudents}
              </span>
              <span className="text-xs text-[#64748B]">قيد الانتظار</span>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                <span className="text-emerald-600 font-bold">نشط {activePercent}%</span>
                <span className="text-amber-600 font-bold">بانتظار الدخول {inactivePercent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${activePercent}%` }} />
                <div className="bg-amber-400 h-full" style={{ width: `${inactivePercent}%` }} />
              </div>
            </div>
          </div>

          {/* Card 3: Device Binding Policy Enforcement */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/30 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">حماية الأجهزة (Device Binding)</span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-[#800020] dark:text-[#FB7185]">
                {cohort.oneDeviceStudents}
              </span>
              <span className="text-xs text-[#64748B] mr-1">طالب (جهاز واحد)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
              <span>استثناء جهازين: <strong className="text-blue-600 font-mono">{cohort.twoDevicesStudents}</strong></span>
              <span className="text-emerald-600 font-bold">أمان 100%</span>
            </div>
          </div>

          {/* Card 4: Academic Progress & Mistakes Mastery */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/30 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">إنجاز المنهج وبنك الأخطاء</span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-[#0F172A] dark:text-white">
                {cohort.completedLessons}
              </span>
              <span className="text-xs text-[#64748B] mr-1">درس مكتمل</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
              <span>أخطاء عولجت: <strong className="text-emerald-600 font-mono">{cohort.resolvedMistakes}</strong></span>
              <span>إجمالي: {cohort.totalMistakes}</span>
            </div>
          </div>
        </div>

        {/* Dual Lists: Top Active Students & Pending Students Outreach */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* List 1: Top Active Students */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/20 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-2.5">
              <h3 className="font-bold text-xs text-[#0F172A] dark:text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>الطلاب الأنشط والمتصدرون للاختبارات</span>
              </h3>
              <span className="text-[11px] text-[#64748B] font-mono">حسب المحاولات</span>
            </div>

            {cohort.topStudents.length === 0 ? (
              <p className="text-xs text-[#64748B] py-6 text-center">
                لم تسجل محاولات مكتملة بعد، بانتظار بدء الطلاب في حل الامتحانات.
              </p>
            ) : (
              <div className="space-y-2">
                {cohort.topStudents.map((s, idx) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] font-bold text-[10px] flex items-center justify-center font-mono">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-[#0F172A] dark:text-white block">
                          {s.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-[#64748B] font-mono">
                          <span>كود: {s.loginCode}</span>
                          <span>• {s.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono font-bold text-[11px]">
                        {s.averageScore}%
                      </span>
                      <span className="text-[11px] text-[#64748B] font-mono">
                        {s.attemptsCount} امتحان
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List 2: Pending Students Outreach with 1-click WhatsApp */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/20 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-2.5">
              <h3 className="font-bold text-xs text-[#0F172A] dark:text-white flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
                <span>متابعة الطلاب قيد الانتظار وتفعيل الأكواد</span>
              </h3>
              <span className="text-[11px] text-amber-600 font-bold font-mono">
                {cohort.inactiveStudents} طالب لم يدخل بعد
              </span>
            </div>

            {cohort.pendingStudents.length === 0 ? (
              <p className="text-xs text-emerald-600 py-6 text-center font-bold">
                جميع الطلاب قاموا بالدخول وتفعيل أجهزتهم بنجاح! 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {cohort.pendingStudents.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F172A] dark:text-white">
                          {s.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                          {s.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#64748B] font-mono mt-0.5">
                        <span className="font-bold text-[#800020] dark:text-[#FB7185]">
                          كود: {s.loginCode}
                        </span>
                        {s.phone && <span>• {s.phone}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyInvite(s)}
                        className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-[#64748B] transition-colors cursor-pointer"
                        title="نسخ رسالة الترحيب والكود للطالب"
                      >
                        {copiedCodeId === s.loginCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {s.phone && (
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppInvite(s)}
                          className="h-7 px-2.5 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="إرسال الكود ورابط المنصة للطالب عبر واتساب فوراً"
                        >
                          <Send className="w-3 h-3" />
                          <span>إرسال</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* 4. Question Bank & Database Objects View */}
      {(activeView === "questions" || activeView === "all") && (
        <>
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
                <span className="text-[#800020]">مستوى بسيط / تمهيدي (Easy)</span>
                <span className="font-mono">{difficultyDistribution.easy} ({easyPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden">
                <div
                  className="h-full bg-[#800020] rounded-full"
                  style={{ width: `${easyPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] font-semibold mb-1">
                <span className="text-[#800020]">مستوى متوسط / تطبيقي (Medium)</span>
                <span className="font-mono">{difficultyDistribution.medium} ({medPercent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden">
                <div
                  className="h-full bg-[#800020] rounded-full"
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
      </>
      )}

      {/* 5. System Audit Logs & Operational Security View */}
      {(activeView === "audit" || activeView === "all") && (
        <div className="p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
                <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
                  سجل تدقيق النظام والعمليات الإدارية (System Audit Logs)
                </h2>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                سجل توثيق شامل للعمليات الإدارية وتعديلات بنك الأسئلة وصلاحيات المستخدمين
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {auditLogs.length} عملية مسجلة
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-[#64748B] py-8 text-center">
              لا توجد سجلات تدقيق مسجلة حتى الآن.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                    <th className="pb-3 font-bold pr-2">العملية الإدارية</th>
                    <th className="pb-3 font-bold">المصدر / المورد</th>
                    <th className="pb-3 font-bold">المسؤول</th>
                    <th className="pb-3 font-bold pl-2">الوقت والتاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors">
                      <td className="py-3 pr-2 font-bold text-[#0F172A] dark:text-white">
                        <span className="px-2 py-0.5 rounded bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] font-mono text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                        {log.resource} {log.resourceId ? `(${log.resourceId.slice(0, 10)})` : ""}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-[#0F172A] dark:text-white">
                          {log.user?.name || "النظام"}
                        </span>
                        <span className="text-[10px] text-slate-400 mr-1.5 font-mono">
                          ({log.user?.role || "ADMIN"})
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString("ar-EG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
