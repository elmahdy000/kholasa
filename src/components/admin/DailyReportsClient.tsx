"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRealtimeTopic } from "@/lib/realtime-client";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  ClipboardCheck,
  AlertTriangle,
  Smartphone,
  CreditCard,
  ShieldOff,
  TrendingDown,
  Search,
  Download,
  Printer,
  RefreshCw,
  Building2,
  Globe,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  UserCheck,
  BarChart3,
  Clock,
} from "lucide-react";
import type {
  DailyReportData,
  ReportCategoryFilter,
  ReportStudyModeFilter,
} from "@/services/daily-reports.service";
import type { EducationalSystem, Grade } from "./users/types";
import { StudentDetailsDrawer } from "./users/StudentDetailsDrawer";
import { shiftDayKey } from "@/lib/date";

interface DailyReportsClientProps {
  initialReport: DailyReportData;
  systems: EducationalSystem[];
  grades: Grade[];
  canManageStudents: boolean;
}

type RadarTab = "payments" | "devices" | "struggling" | "suspended" | "inactive";

function formatTimeCairo(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("ar-EG", {
      timeZone: "Africa/Cairo",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function escapeCsvCell(value: unknown): string {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export function DailyReportsClient({
  initialReport,
  systems,
  grades,
  canManageStudents,
}: DailyReportsClientProps) {
  const [report, setReport] = useState<DailyReportData>(initialReport);
  useEffect(() => {
    setReport(initialReport);
  }, [initialReport]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [radarTab, setRadarTab] = useState<RadarTab>(() => {
    if (initialReport.radar.pendingPaymentsCount > 0) return "payments";
    if (initialReport.radar.deviceLimitCount > 0) return "devices";
    if (initialReport.radar.strugglingCount > 0) return "struggling";
    return "payments";
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const fetchReport = async (params: {
    dateKey?: string;
    category?: ReportCategoryFilter;
    studyMode?: ReportStudyModeFilter;
    centerName?: string;
  }) => {
    const nextDate = params.dateKey ?? report.dateKey;
    const nextCategory = params.category ?? report.filters.category;
    const nextStudyMode = params.studyMode ?? report.filters.studyMode;
    const nextCenter =
      params.centerName !== undefined ? params.centerName : report.filters.centerName;

    setIsLoading(true);
    setLoadError(null);
    try {
      const qs = new URLSearchParams();
      if (nextDate) qs.set("date", nextDate);
      if (nextCategory !== "ALL") qs.set("category", nextCategory);
      if (nextStudyMode !== "ALL") qs.set("studyMode", nextStudyMode);
      if (nextCenter) qs.set("center", nextCenter);

      const res = await fetch(`/api/admin/reports?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "تعذر تحميل التقرير اليومي");
      }
      const nextReport: DailyReportData = await res.json();
      setReport(nextReport);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "حدث خطأ أثناء تحميل التقرير"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useRealtimeTopic(["analytics", "users", "exams"], () => {
    void fetchReport({});
  });

  const filteredActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return report.studentActivities;
    return report.studentActivities.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        (row.loginCode && row.loginCode.toLowerCase().includes(q)) ||
        (row.phone && row.phone.toLowerCase().includes(q)) ||
        (row.centerName && row.centerName.toLowerCase().includes(q))
    );
  }, [report.studentActivities, searchQuery]);

  const maxTrendActive = Math.max(
    1,
    ...report.trend14Days.map((item) => item.activeStudents)
  );

  const handleExportCsv = () => {
    const headers = [
      "التاريخ (القاهرة)",
      "الاسم",
      "كود الدخول",
      "الهاتف",
      "المسار",
      "نمط الحضور",
      "السنتر",
      "الصف",
      "الاشتراك",
      "تسجيل اليوم",
      "الجلسات اليوم",
      "الاختبارات المكتملة",
      "أفضل درجة (%)",
      "الدروس المتصفحة",
      "الدروس المكتملة",
      "أخطاء اليوم",
      "أخطاء محلولة",
      "التحدي اليومي",
      "آخر نشاط (القاهرة)",
    ];

    const rows = filteredActivities.map((r) => [
      report.dateKey,
      r.name,
      r.loginCode || "",
      r.phone || "",
      r.schoolCategory === "LANGUAGES" ? "لغات" : "عربي",
      r.studyMode === "OFFLINE" ? "سنتر" : "أونلاين",
      r.centerName || "",
      r.gradeName || "",
      r.subscriptionStatus,
      r.isNewToday ? "نعم" : "لا",
      r.sessionsToday,
      r.examsCompletedToday,
      r.bestExamScoreToday ?? "",
      r.lessonsAccessedToday,
      r.lessonsCompletedToday,
      r.mistakesToday,
      r.resolvedMistakesToday,
      r.dailyChallengeStatus === "COMPLETED"
        ? "مكتمل"
        : r.dailyChallengeStatus === "STARTED"
          ? "قيد التنفيذ"
          : "لم يبدأ",
      formatTimeCairo(r.lastActivityAt),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.map(escapeCsvCell).join(","), ...rows.map((row) => row.map(escapeCsvCell).join(","))].join(
        "\n"
      );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `elkholasa-daily-report-${report.dateKey}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const { summary, radar } = report;
  const totalIssuesCount =
    radar.pendingPaymentsCount +
    radar.deviceLimitCount +
    radar.strugglingCount +
    radar.suspendedCount;

  const canGoNextDay = report.dateKey < report.todayKey;

  return (
    <div className="space-y-6 pb-16 text-right font-sans" dir="rtl">
      {/* Top Toolbar: Date Controls + Filters + Export */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] text-xs font-bold">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>توقيت القاهرة (Africa/Cairo)</span>
              </span>
              {report.isToday && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                  تقرير اليوم المباشر
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[#091B40] dark:text-white">
              التقرير اليومي الشامل —{" "}
              <span dir="ltr" className="tabular-nums inline-block">
                {report.dateKey}
              </span>
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              رصد الحضور الفعلي، المذاكرة والاختبارات، أداء السناتر، ورادار المشاكل التشغيلية (بدون حسابات التجربة المؤقتة).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Link
              href="/admin/analytics"
              className="min-h-[42px] px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#091B40] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] inline-flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-[#800B34]" />
              <span>لوحة التحليلات الكاملة</span>
            </Link>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredActivities.length === 0}
              className="min-h-[42px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[42px] px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] text-xs font-bold text-[#091B40] dark:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </button>

            <button
              type="button"
              onClick={() => fetchReport({})}
              disabled={isLoading}
              className="min-h-[42px] px-3.5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>تحديث</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
          {/* Cairo Date Navigator */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              اليوم (بتوقيت القاهرة)
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  fetchReport({ dateKey: shiftDayKey(report.dateKey, -1) })
                }
                disabled={isLoading}
                className="min-h-[42px] w-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer"
                title="اليوم السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={report.dateKey}
                max={report.todayKey}
                onChange={(e) => {
                  if (e.target.value) fetchReport({ dateKey: e.target.value });
                }}
                className="flex-1 min-h-[42px] px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#091B40] dark:text-white font-sans tabular-nums"
              />
              <button
                type="button"
                onClick={() =>
                  canGoNextDay &&
                  fetchReport({ dateKey: shiftDayKey(report.dateKey, 1) })
                }
                disabled={isLoading || !canGoNextDay}
                className="min-h-[42px] w-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] disabled:opacity-40 cursor-pointer"
                title="اليوم التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* School Category Filter */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              مسار المدرسة
            </label>
            <select
              value={report.filters.category}
              disabled={isLoading}
              onChange={(e) =>
                fetchReport({ category: e.target.value as ReportCategoryFilter })
              }
              className="w-full min-h-[42px] px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#091B40] dark:text-white"
            >
              <option value="ALL">جميع المسارات (عربي + لغات)</option>
              <option value="ARABIC">مدارس عربي فقط 🇪🇬</option>
              <option value="LANGUAGES">مدارس لغات فقط 🇬🇧</option>
            </select>
          </div>

          {/* Study Mode Filter */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              نظام الدراسة
            </label>
            <select
              value={report.filters.studyMode}
              disabled={isLoading}
              onChange={(e) => {
                const mode = e.target.value as ReportStudyModeFilter;
                fetchReport({
                  studyMode: mode,
                  centerName: mode === "ONLINE" ? "" : report.filters.centerName,
                });
              }}
              className="w-full min-h-[42px] px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#091B40] dark:text-white"
            >
              <option value="ALL">الكل (أونلاين + سناتر)</option>
              <option value="ONLINE">طلاب أونلاين</option>
              <option value="OFFLINE">طلاب السناتر</option>
            </select>
          </div>

          {/* Center Filter */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              تصفية حسب السنتر
            </label>
            <select
              value={report.filters.centerName}
              disabled={isLoading || report.filters.studyMode === "ONLINE"}
              onChange={(e) =>
                fetchReport({
                  studyMode: e.target.value ? "OFFLINE" : report.filters.studyMode,
                  centerName: e.target.value,
                })
              }
              className="w-full min-h-[42px] px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#091B40] dark:text-white disabled:opacity-50"
            >
              <option value="">كل السناتر والمراكز</option>
              {report.availableCenters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-700 dark:text-rose-300">
            {loadError}
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>الطلاب النشطون</span>
            <Users className="w-4 h-4 text-[#800B34]" />
          </div>
          <p className="text-2xl font-black text-[#091B40] dark:text-white tabular-nums">
            {summary.activeStudentsToday}
          </p>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
            من إجمالي {summary.totalMatchingStudents} • جديد اليوم: {summary.newRegistrationsToday}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>توزيع المسار</span>
            <Globe className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-black text-[#091B40] dark:text-white tabular-nums">
            {summary.activeArabicCount} عربي / {summary.activeLanguagesCount} لغات
          </p>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
            أونلاين {summary.activeOnlineCount} • سناتر {summary.activeOfflineCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>الاختبارات</span>
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-[#091B40] dark:text-white tabular-nums">
            {summary.examsCompleted}
          </p>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
            متوسط الدرجة:{" "}
            {summary.averageExamScore !== null ? `${summary.averageExamScore}%` : "لا يوجد"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>تقدم الدروس</span>
            <BookOpen className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-[#091B40] dark:text-white tabular-nums">
            {summary.lessonsAccessed}
          </p>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
            دروس مكتملة اليوم: {summary.lessonsCompleted}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>التحدي والأخطاء</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-[#091B40] dark:text-white tabular-nums">
            {summary.dailyChallengesCompleted} تحدي مكتمل
          </p>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
            أخطاء جديدة {summary.newMistakesToday} • محلولة {summary.resolvedMistakesToday}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-rose-200 dark:border-rose-900/50 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 font-bold">
            <span>تنبيهات للمتابعة</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-300 tabular-nums">
            {totalIssuesCount}
          </p>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400 tabular-nums">
            إيصالات {radar.pendingPaymentsCount} • أجهزة {radar.deviceLimitCount} • متوقف {radar.suspendedCount} • متعثر {radar.strugglingCount}
          </p>
        </div>
      </div>

      {/* 14-Day Interactive Cairo Trend + Center Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 14-day Bar Selector */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#091B40] dark:text-white">
                سجل الحضور اليومي (آخر 14 يوماً بتوقيت القاهرة)
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                اضغط على أي يوم لعرض تقريره التفصيلي فوراً
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                عربي
              </span>
              <span className="inline-flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block" />
                لغات
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5 items-end pt-3">
            {report.trend14Days.map((day) => {
              const heightPercent = Math.max(
                8,
                Math.round((day.activeStudents / maxTrendActive) * 100)
              );
              const total = Math.max(1, day.activeStudents);
              const arabicShare = Math.round((day.arabicActive / total) * 100);
              const languagesShare = Math.max(0, 100 - arabicShare);
              const isSelected = day.dateKey === report.dateKey;
              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => fetchReport({ dateKey: day.dateKey })}
                  title={`${day.dateKey}: ${day.activeStudents} طالب نشط (${day.arabicActive} عربي / ${day.languagesActive} لغات) — ${day.examsCompleted} اختبار`}
                  className={`flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all cursor-pointer ${isSelected
                    ? "bg-[#800B34]/10 ring-2 ring-[#800B34]"
                    : "hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                    }`}
                >
                  <span className="text-[10px] font-black text-[#091B40] dark:text-white tabular-nums">
                    {day.activeStudents}
                  </span>
                  <div className="w-full h-24 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg flex flex-col justify-end overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full transition-all flex flex-col justify-end overflow-hidden"
                    >
                      {day.activeStudents > 0 ? (
                        <>
                          {day.languagesActive > 0 && (
                            <div
                              style={{ height: `${languagesShare}%` }}
                              className="w-full bg-indigo-500"
                            />
                          )}
                          {day.arabicActive > 0 && (
                            <div
                              style={{ height: `${arabicShare}%` }}
                              className="w-full bg-emerald-500"
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-[#CBD5E1] dark:bg-[#334155]" />
                      )}
                    </div>
                  </div>
                  <span
                    dir="ltr"
                    className={`text-[9px] font-bold whitespace-nowrap tabular-nums ${isSelected
                      ? "text-[#800B34] dark:text-[#FB7185]"
                      : "text-[#64748B] dark:text-[#94A3B8]"
                      }`}
                  >
                    {day.dateKey.slice(5)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Breakdown */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-[#091B40] dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#800B34]" />
              <span>حضور السناتر اليوم</span>
            </h2>
            <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] tabular-nums">
              {report.centerBreakdown.length} مراكز
            </span>
          </div>

          {report.centerBreakdown.length === 0 ? (
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-8 text-center">
              لا يوجد طلاب سناتر ضمن الفلتر الحالي.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {report.centerBreakdown.map((c) => {
                const rate =
                  c.totalStudents > 0
                    ? Math.round((c.activeToday / c.totalStudents) * 100)
                    : 0;
                return (
                  <button
                    key={c.centerName}
                    type="button"
                    onClick={() =>
                      fetchReport({
                        studyMode: "OFFLINE",
                        centerName:
                          report.filters.centerName === c.centerName ? "" : c.centerName,
                      })
                    }
                    className={`w-full text-right p-2.5 rounded-xl border transition-colors cursor-pointer ${report.filters.centerName === c.centerName
                      ? "border-[#800B34] bg-[#800B34]/5"
                      : "border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-bold">
                      <span
                        dir="auto"
                        className="text-[#091B40] dark:text-white min-w-0 flex-1 text-right leading-snug"
                      >
                        {c.centerName}
                      </span>
                      <span
                        dir="ltr"
                        className="text-[#800B34] dark:text-[#FB7185] tabular-nums shrink-0"
                      >
                        {c.activeToday} / {c.totalStudents} ({rate}%)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Operational Problem Radar */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#091B40] dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>رادار مشاكل الطلاب ومتابعة الإدارة</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              مشاكل تحتاج تدخلاً سريعاً: إيصالات الدفع المعلقة، قيود الأجهزة، التعثر الدراسي، والحسابات المتوقفة.
            </p>
          </div>
        </div>

        {/* Radar Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <button
            type="button"
            onClick={() => setRadarTab("payments")}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${radarTab === "payments"
              ? "bg-[#800B34] text-white"
              : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#091B40] dark:text-white"
              }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>إيصالات معلقة ({radar.pendingPaymentsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setRadarTab("devices")}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${radarTab === "devices"
              ? "bg-[#800B34] text-white"
              : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#091B40] dark:text-white"
              }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>الحد الأقصى للأجهزة ({radar.deviceLimitCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setRadarTab("struggling")}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${radarTab === "struggling"
              ? "bg-[#800B34] text-white"
              : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#091B40] dark:text-white"
              }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>طلاب متعثرون اليوم ({radar.strugglingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setRadarTab("suspended")}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${radarTab === "suspended"
              ? "bg-[#800B34] text-white"
              : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#091B40] dark:text-white"
              }`}
          >
            <ShieldOff className="w-4 h-4" />
            <span>حسابات غير مفعلة/معلقة ({radar.suspendedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setRadarTab("inactive")}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${radarTab === "inactive"
              ? "bg-[#800B34] text-white"
              : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#091B40] dark:text-white"
              }`}
          >
            <Clock className="w-4 h-4" />
            <span>مشتركون خاملون 7 أيام ({radar.inactiveActiveCount})</span>
          </button>
        </div>

        {/* Radar Tab Panels */}
        <div className="overflow-x-auto">
          {radarTab === "payments" && (
            radar.pendingPayments.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-6 text-center">
                لا توجد إيصالات دفع بانتظار المراجعة حالياً.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                    <th className="py-2.5 px-3 text-right font-bold">الطالب</th>
                    <th className="py-2.5 px-3 text-right font-bold">الكود</th>
                    <th className="py-2.5 px-3 text-right font-bold">رقم التحويل / المرجع</th>
                    <th className="py-2.5 px-3 text-right font-bold">الإيصال</th>
                    {canManageStudents && (
                      <th className="py-2.5 px-3 text-right font-bold">إجراء</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                  {radar.pendingPayments.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-bold text-[#091B40] dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">{item.loginCode || "—"}</td>
                      <td className="py-2.5 px-3 tabular-nums">
                        {item.paymentSenderPhone || "—"} {item.paymentReference ? `• ${item.paymentReference}` : ""}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.paymentReceiptUrl ? (
                          <a
                            href={item.paymentReceiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#800B34] dark:text-[#FB7185] font-bold hover:underline"
                          >
                            <span>عرض الإيصال</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      {canManageStudents && (
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] font-bold hover:bg-[#800B34]/20 cursor-pointer"
                          >
                            فحص وتفعيل
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {radarTab === "devices" && (
            radar.deviceLimitStudents.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-6 text-center">
                لا يوجد طلاب بلغوا الحد الأقصى للأجهزة ضمن هذا الفلتر.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                    <th className="py-2.5 px-3 text-right font-bold">الطالب</th>
                    <th className="py-2.5 px-3 text-right font-bold">الكود</th>
                    <th className="py-2.5 px-3 text-right font-bold">المسار / السنتر</th>
                    <th className="py-2.5 px-3 text-right font-bold">الأجهزة المربوطة</th>
                    {canManageStudents && (
                      <th className="py-2.5 px-3 text-right font-bold">إدارة</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                  {radar.deviceLimitStudents.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-bold text-[#091B40] dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">{item.loginCode || "—"}</td>
                      <td className="py-2.5 px-3">
                        {item.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}
                        {item.centerName ? ` • ${item.centerName}` : ""}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                        {item.boundCount} / {item.maxDevices}
                      </td>
                      {canManageStudents && (
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] font-bold hover:bg-[#800B34]/20 cursor-pointer"
                          >
                            فحص / فك الارتباط
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {radarTab === "struggling" && (
            radar.strugglingStudents.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-6 text-center">
                لا توجد حالات تعثر دراسي مسجلة في يوم {report.dateKey}.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                    <th className="py-2.5 px-3 text-right font-bold">الطالب</th>
                    <th className="py-2.5 px-3 text-right font-bold">الكود والصف</th>
                    <th className="py-2.5 px-3 text-right font-bold">السبب</th>
                    <th className="py-2.5 px-3 text-right font-bold">إجمالي أخطاء غير محلولة</th>
                    {canManageStudents && (
                      <th className="py-2.5 px-3 text-right font-bold">متابعة</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                  {radar.strugglingStudents.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-bold text-[#091B40] dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.loginCode || "—"} {item.gradeName ? `• ${item.gradeName}` : ""}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-rose-700 dark:text-rose-300">
                        {item.reason}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">
                        {item.unresolvedMistakesTotal}
                      </td>
                      {canManageStudents && (
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] font-bold hover:bg-[#800B34]/20 cursor-pointer"
                          >
                            ملف الطالب
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {radarTab === "suspended" && (
            radar.suspendedStudents.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-6 text-center">
                لا توجد حسابات معلقة أو غير مفعلة.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                    <th className="py-2.5 px-3 text-right font-bold">الطالب</th>
                    <th className="py-2.5 px-3 text-right font-bold">الكود</th>
                    <th className="py-2.5 px-3 text-right font-bold">الهاتف</th>
                    <th className="py-2.5 px-3 text-right font-bold">الاشتراك</th>
                    {canManageStudents && (
                      <th className="py-2.5 px-3 text-right font-bold">إدارة</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                  {radar.suspendedStudents.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-bold text-[#091B40] dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">{item.loginCode || "—"}</td>
                      <td className="py-2.5 px-3 tabular-nums" dir="ltr">
                        {item.phone || "—"}
                      </td>
                      <td className="py-2.5 px-3">{item.subscriptionStatus}</td>
                      {canManageStudents && (
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] font-bold hover:bg-[#800B34]/20 cursor-pointer"
                          >
                            عرض وتعديل
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {radarTab === "inactive" && (
            radar.inactiveActiveStudents.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-6 text-center">
                جميع المشتركين المفعلين سجلوا نشاطاً خلال آخر 7 أيام.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                    <th className="py-2.5 px-3 text-right font-bold">الطالب</th>
                    <th className="py-2.5 px-3 text-right font-bold">الكود</th>
                    <th className="py-2.5 px-3 text-right font-bold">الهاتف</th>
                    <th className="py-2.5 px-3 text-right font-bold">المسار والسنتر</th>
                    {canManageStudents && (
                      <th className="py-2.5 px-3 text-right font-bold">متابعة</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                  {radar.inactiveActiveStudents.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-bold text-[#091B40] dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">{item.loginCode || "—"}</td>
                      <td className="py-2.5 px-3 tabular-nums" dir="ltr">
                        {item.phone || "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}
                        {item.centerName ? ` • ${item.centerName}` : " • أونلاين"}
                      </td>
                      {canManageStudents && (
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] font-bold hover:bg-[#800B34]/20 cursor-pointer"
                          >
                            ملف الطالب
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* Daily Student Activity Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#091B40] dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>سجل نشاط الطلاب ليوم {report.dateKey}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] text-[#091B40] dark:text-white tabular-nums">
                {filteredActivities.length}
              </span>
            </h2>
          </div>

          <div className="relative w-full sm:w-72 print:hidden">
            <Search className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الكود، الهاتف، أو السنتر..."
              className="w-full min-h-[42px] pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-medium text-[#091B40] dark:text-white"
            />
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="py-10 text-center space-y-1.5">
            <CheckCircle2 className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="text-sm font-bold text-[#091B40] dark:text-white">
              لا يوجد نشاط طلابي مسجل لهذا اليوم وفق الفلتر المحدد
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              جرّب اختيار يوم آخر من الشريط أعلاه أو توسيع الفلتر ليشمل جميع المسارات.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                  <th className="py-3 px-3 text-right font-bold">الطالب</th>
                  <th className="py-3 px-3 text-right font-bold">المسار / السنتر</th>
                  <th className="py-3 px-3 text-right font-bold">الملخص اليومي</th>
                  <th className="py-3 px-3 text-right font-bold">الاختبارات والدرجة</th>
                  <th className="py-3 px-3 text-right font-bold">الدروس والأخطاء</th>
                  <th className="py-3 px-3 text-right font-bold">آخر وقت (القاهرة)</th>
                  {canManageStudents && (
                    <th className="py-3 px-3 text-right font-bold print:hidden">تفاصيل</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {filteredActivities.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#091B40] dark:text-white">
                        {row.name}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                        {row.loginCode || "بدون كود"}{" "}
                        {row.gradeName ? `• ${row.gradeName}` : ""}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${row.schoolCategory === "LANGUAGES"
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          }`}
                      >
                        {row.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}
                      </span>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                        {row.studyMode === "OFFLINE"
                          ? row.centerName || "سنتر"
                          : "أونلاين"}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {row.highlights.length > 0 ? (
                          row.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[10px] font-bold text-[#091B40] dark:text-white"
                            >
                              {h}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#94A3B8]">دخول فقط</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 tabular-nums">
                      {row.examsCompletedToday > 0 ? (
                        <span className="font-bold text-[#091B40] dark:text-white">
                          {row.examsCompletedToday} (أفضل: {row.bestExamScoreToday}%)
                        </span>
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 tabular-nums">
                      <div>
                        دروس: {row.lessonsAccessedToday} (مكتمل {row.lessonsCompletedToday})
                      </div>
                      {(row.mistakesToday > 0 || row.resolvedMistakesToday > 0) && (
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          أخطاء: {row.mistakesToday} • محلولة: {row.resolvedMistakesToday}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 tabular-nums font-bold text-[#091B40] dark:text-white">
                      {formatTimeCairo(row.lastActivityAt)}
                    </td>
                    {canManageStudents && (
                      <td className="py-3 px-3 print:hidden">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentId(row.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] font-bold hover:bg-[#800B34]/20 cursor-pointer"
                        >
                          ملف الطالب
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManageStudents && (
        <StudentDetailsDrawer
          userId={selectedStudentId}
          systems={systems}
          grades={grades}
          onClose={() => setSelectedStudentId(null)}
          onUserUpdated={() => fetchReport({})}
        />
      )}
    </div>
  );
}
