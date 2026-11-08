"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import {
  Activity,
  Users,
  Clock,
  BookOpen,
  Award,
  Search,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Sparkles,
  KeyRound,
  Check,
  Copy,
  Send,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Calendar,
  Zap,
  Globe,
  GraduationCap,
  FileText,
  ChevronDown,
} from "lucide-react";
import type {
  RealtimeStudentItem,
  RealtimeMetrics,
  RealtimeActivityEvent,
} from "@/services/realtime-analytics.service";
import { StudentDetailsDrawer } from "@/components/admin/users/StudentDetailsDrawer";
import type { EducationalSystem, Grade } from "@/components/admin/users/types";

interface RealtimeObservatoryProps {
  initialMetrics?: RealtimeMetrics;
  initialStudents?: RealtimeStudentItem[];
  initialLiveFeed?: RealtimeActivityEvent[];
  systems?: EducationalSystem[];
  grades?: Grade[];
}

export function RealtimeObservatoryClient({
  initialMetrics,
  initialStudents = [],
  initialLiveFeed = [],
  systems = [],
  grades = [],
}: RealtimeObservatoryProps) {
  // Category Segment: Strict segregation between Arabic and Languages
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "ARABIC" | "LANGUAGES">("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ONLINE" | "TODAY" | "ACTIVE_EXAMS" | "ACTIVE_LESSONS"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"lastActive" | "exams" | "time" | "name" | "score">(
    "lastActive"
  );

  // Auto-refresh timer interval (seconds: 0 = off)
  const [refreshInterval, setRefreshInterval] = useState<number>(15);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [secondsSinceLastRefresh, setSecondsSinceLastRefresh] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Realtime state
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(initialMetrics || null);
  const [students, setStudents] = useState<RealtimeStudentItem[]>(initialStudents);
  const [liveFeed, setLiveFeed] = useState<RealtimeActivityEvent[]>(initialLiveFeed);

  // Student Drawer state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Copied code feedback
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Show live ticker
  const [showLiveTicker, setShowLiveTicker] = useState<boolean>(true);

  // Fetch data from API
  const fetchData = async (silent = false) => {
    if (!silent) setIsFetching(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (sortBy !== "lastActive") params.set("sortBy", sortBy);

      const res = await fetch(`/api/admin/analytics/realtime?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setMetrics(json.metrics);
          setStudents(json.students);
          setLiveFeed(json.liveFeed);
          setLastRefreshedAt(new Date());
          setSecondsSinceLastRefresh(0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch realtime observatory data:", err);
    } finally {
      if (!silent) setIsFetching(false);
    }
  };

  // Trigger fetch on filter changes
  useEffect(() => {
    fetchData();
  }, [selectedCategory, statusFilter, sortBy]);

  // Handle debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval, selectedCategory, statusFilter, sortBy, searchQuery]);

  // Tick seconds since last refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceLastRefresh((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (loginCode: string) => {
    navigator.clipboard.writeText(loginCode);
    setCopiedCodeId(loginCode);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleWhatsApp = (student: RealtimeStudentItem) => {
    let phoneNum = (student.phone || "").replace(/\D/g, "");
    if (phoneNum.startsWith("0")) phoneNum = "2" + phoneNum;
    else if (!phoneNum.startsWith("20") && phoneNum.length === 10) phoneNum = "20" + phoneNum;

    const text = `مرحباً بك يا ${student.name} في منصة الخلاصة التعليمية! 🚀\nكود الدخول الخاص بك هو: *${student.loginCode}*\nرابط المنصة: https://el-kholasa.online/login\n\nتابع مذاكرتك وحل امتحاناتك أولاً بأول! بالتوفيق يا بطل! 🌟`;
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Category-scoped metrics
  const activeCategory = selectedCategory;
  const displayOnline =
    activeCategory === "ARABIC"
      ? metrics?.onlineArabic ?? 0
      : activeCategory === "LANGUAGES"
      ? metrics?.onlineLanguages ?? 0
      : metrics?.onlineTotal ?? 0;

  const displayToday =
    activeCategory === "ARABIC"
      ? metrics?.todayArabic ?? 0
      : activeCategory === "LANGUAGES"
      ? metrics?.todayLanguages ?? 0
      : metrics?.todayTotal ?? 0;

  const displayTotalRegistered =
    activeCategory === "ARABIC"
      ? metrics?.registeredArabic ?? 0
      : activeCategory === "LANGUAGES"
      ? metrics?.registeredLanguages ?? 0
      : metrics?.registeredTotal ?? 0;

  return (
    <div className="space-y-6">
      {/* 1. Header with Live Telemetry Pulse & Control Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/20 flex items-center justify-center text-[#800020] dark:text-[#FB7185]">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                    المرصد الفوري المباشر (Realtime Student Observatory)
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>مباشر الآن</span>
                  </span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  متابعة حضور الطلاب لحظة بلحظة، امتحاناتهم المحلولة، الدروس التي راجعوها، والوقت الفعلي داخل الخلاصة بدون تداخل بين العربي واللغات.
                </p>
              </div>
            </div>
          </div>

          {/* Refresh & Timer Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Auto Refresh Interval Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs text-[#64748B] dark:text-[#94A3B8]">
              <Clock className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
              <span className="font-medium">التحديث التلقائي:</span>
              <select
                aria-label="معدل التحديث التلقائي"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                <option value={10}>كل 10 ثوانٍ</option>
                <option value={15}>كل 15 ثانية (موصى به)</option>
                <option value={30}>كل 30 ثانية</option>
                <option value={60}>كل دقيقة</option>
                <option value={0}>إيقاف التلقائي</option>
              </select>
            </div>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={() => fetchData()}
              disabled={isFetching}
              className="h-9 px-3.5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "جاري التحديث..." : "تحديث فوري"}</span>
            </button>

            {/* Sync Timestamp indicator */}
            <span className="text-[11px] text-[#94A3B8] font-mono whitespace-nowrap">
              {secondsSinceLastRefresh === 0
                ? "تم التحديث الآن"
                : `منذ ${secondsSinceLastRefresh} ثانية`}
            </span>
          </div>
        </div>

        {/* 2. STRICT CATEGORY SEGMENT TABS (عربي vs لغات - لا يتعارضان أبداً) */}
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] w-fit">
            {/* Tab: ALL */}
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCategory === "ALL"
                  ? "bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>جميع الطلاب ({metrics?.registeredTotal ?? 0})</span>
            </button>

            {/* Tab: ARABIC (Signature Crimson Theme) */}
            <button
              type="button"
              onClick={() => setSelectedCategory("ARABIC")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCategory === "ARABIC"
                  ? "bg-[#800020] text-white shadow-xs"
                  : "text-[#800020] dark:text-[#FB7185] hover:bg-[#800020]/10"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>طلاب عام عربي ({metrics?.registeredArabic ?? 0})</span>
              {metrics && metrics.onlineArabic > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-[#800020] font-mono font-bold">
                  {metrics.onlineArabic} متصل الآن
                </span>
              )}
            </button>

            {/* Tab: LANGUAGES (Signature Indigo Theme) */}
            <button
              type="button"
              onClick={() => setSelectedCategory("LANGUAGES")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCategory === "LANGUAGES"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "text-[#4F46E5] dark:text-indigo-400 hover:bg-[#4F46E5]/10"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>طلاب لغات ({metrics?.registeredLanguages ?? 0})</span>
              {metrics && metrics.onlineLanguages > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-[#4F46E5] font-mono font-bold">
                  {metrics.onlineLanguages} متصل الآن
                </span>
              )}
            </button>
          </div>

          {/* Quick Notice Badge about Strict Separation */}
          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#800020]" />
            <span>عربي: {metrics?.onlineArabic ?? 0} متصل</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
            <span>لغات: {metrics?.onlineLanguages ?? 0} متصل</span>
          </div>
        </div>
      </div>

      {/* 3. 5 High-Density Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Online Pulse */}
        <div
          className={`p-4 rounded-xl border bg-white dark:bg-[#0F172A] shadow-xs flex flex-col justify-between transition-colors ${
            displayOnline > 0
              ? "border-emerald-300 dark:border-emerald-800"
              : "border-[#E2E8F0] dark:border-[#334155]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">المتصلون الآن</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {displayOnline}
            </span>
            <span className="text-xs text-[#64748B]">طالب نشط</span>
          </div>
          <div className="text-[11px] text-[#64748B] font-mono pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>عربي: {metrics?.onlineArabic ?? 0}</span>
            <span>لغات: {metrics?.onlineLanguages ?? 0}</span>
          </div>
        </div>

        {/* Card 2: Today's Attendees */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">حضور اليوم</span>
            <Calendar className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-[#0F172A] dark:text-white">
              {displayToday}
            </span>
            <span className="text-xs text-[#64748B]">
              من أصل {displayTotalRegistered} طالب
            </span>
          </div>
          <div className="text-[11px] text-[#64748B] font-mono pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>
              نسبة الحضور:{" "}
              {displayTotalRegistered > 0
                ? Math.round((displayToday / displayTotalRegistered) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Card 3: Actual Time Spent inside El-Kholasa */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">
              إجمالي وقت المذاكرة الفعلي
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-bold text-[#800020] dark:text-[#FB7185] block truncate">
              {metrics?.totalActualTimeFormatted || "0 دقيقة"}
            </span>
          </div>
          <div className="text-[11px] text-[#64748B] font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>تفاعل حقيقي داخل المنصة</span>
          </div>
        </div>

        {/* Card 4: Exams Solved */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">
              الامتحانات المنجزة
            </span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400">
              {metrics?.totalExamsSolved ?? 0}
            </span>
            <span className="text-xs text-[#64748B]">اختبار تم تسليمه</span>
          </div>
          <div className="text-[11px] text-[#64748B] font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>معدل حل الاختبارات</span>
          </div>
        </div>

        {/* Card 5: Completed Lessons */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">
              الدروس المكتملة
            </span>
            <BookOpen className="w-4 h-4 text-purple-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-purple-600 dark:text-purple-400">
              {metrics?.totalLessonsCompleted ?? 0}
            </span>
            <span className="text-xs text-[#64748B]">درس تم إنجازه</span>
          </div>
          <div className="text-[11px] text-[#64748B] font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>متابعة إتمام المنهج</span>
          </div>
        </div>
      </div>

      {/* 4. Live Event Activity Feed (Collapsible Ticker) */}
      {showLiveTicker && liveFeed.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#1E293B]/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                شريط التفاعل المباشر (آخر تحركات الطلاب في المنصة الآن)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLiveTicker(false)}
              className="text-[11px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            >
              إخفاء الشريط
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {liveFeed.map((ev) => (
              <div
                key={ev.id}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shrink-0 flex items-center gap-2 shadow-2xs"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    ev.schoolCategory === "LANGUAGES" ? "bg-indigo-500" : "bg-[#800020]"
                  }`}
                />
                <span className="font-bold text-[#0F172A] dark:text-white">{ev.studentName}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    ev.schoolCategory === "LANGUAGES"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "bg-rose-50 text-[#800020] dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {ev.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}
                </span>
                <span className="text-slate-600 dark:text-slate-400">{ev.title}</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ({ev.detail})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{ev.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Realtime Student Directory Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
        {/* Table Filters & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الطالب، كود الدخول، أو رقم الموبايل..."
              className="w-full h-9 pr-9 pl-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#800020] dark:focus:border-[#FB7185]"
            />
          </div>

          {/* Quick Status Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === "ALL"
                  ? "bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A]"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              الكل ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ONLINE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                statusFilter === "ONLINE"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>المتصلون الآن فقط</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("TODAY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === "TODAY"
                  ? "bg-[#800020] text-white"
                  : "bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] hover:bg-[#800020]/20"
              }`}
            >
              دخلوا اليوم 📅
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ACTIVE_EXAMS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === "ACTIVE_EXAMS"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100"
              }`}
            >
              حلوا امتحانات 📝
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ACTIVE_LESSONS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === "ACTIVE_LESSONS"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 hover:bg-purple-100"
              }`}
            >
              راجعوا دروساً 📖
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#64748B] whitespace-nowrap">الترتيب:</span>
            <select
              aria-label="ترتيب قائمة الطلاب"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none"
            >
              <option value="lastActive">الأحدث نشاطاً (الافتراضي)</option>
              <option value="exams">الأكثر حلاً للامتحانات</option>
              <option value="time">الأطول وقتاً بالمنصة</option>
              <option value="score">الأعلى درجات</option>
              <option value="name">أبجدياً بالاسم</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        {students.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Users className="w-10 h-10 mx-auto text-[#94A3B8]" />
            <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
              لا يوجد طلاب يطابقون خيارات البحث الحالية
            </h3>
            <p className="text-xs text-[#64748B]">
              جرّب تغيير فئة المنهج (عربي / لغات) أو مسح كلمة البحث.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                  <th className="pb-3 font-bold pr-2">الطالب والمنهج</th>
                  <th className="pb-3 font-bold">الحالة والاتصال</th>
                  <th className="pb-3 font-bold">الامتحانات المحلولة</th>
                  <th className="pb-3 font-bold">الدروس المذاكرة والمراجعة</th>
                  <th className="pb-3 font-bold">الوقت الفعلي داخل الخلاصة</th>
                  <th className="pb-3 font-bold text-center pl-2">الملف والإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {students.map((student) => {
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#1E293B]/40 transition-colors"
                    >
                      {/* Column 1: Student Identity */}
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-[#800020] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {student.name.charAt(0)}
                            </div>
                            {student.isOnline && (
                              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0F172A] absolute -bottom-0.5 -right-0.5 animate-pulse" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0F172A] dark:text-white text-xs">
                                {student.name}
                              </span>
                              {/* Category Badge: Strict visual indicator */}
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  student.schoolCategory === "LANGUAGES"
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                                    : "bg-rose-50 text-[#800020] border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                                }`}
                              >
                                {student.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-[#64748B] font-mono">
                              <span className="text-[#800020] dark:text-[#FB7185] font-bold">
                                كود: {student.loginCode}
                              </span>
                              <span>• {student.gradeName}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Status & Last Active */}
                      <td className="py-3.5">
                        <div className="space-y-1">
                          {student.isOnline ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              <span>متصل الآن</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{student.lastActiveHuman}</span>
                            </span>
                          )}

                          <div className="text-[10px] text-[#94A3B8] font-mono">
                            {student.boundDevicesCount > 0
                              ? `جهاز معتمد (${student.boundDevicesCount})`
                              : "لم يسجل أجهزة بعد"}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Exams Solved */}
                      <td className="py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0F172A] dark:text-white font-mono text-xs">
                              {student.examsSolvedCount} امتحان
                            </span>
                            {student.examsSolvedCount > 0 && (
                              <span
                                className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                                  student.avgScore >= 85
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    : student.avgScore >= 50
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                    : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                }`}
                              >
                                {student.avgScore}%
                              </span>
                            )}
                          </div>

                          {student.latestExam ? (
                            <span className="text-[10px] text-[#64748B] block truncate max-w-[180px]">
                              آخر اختبار: {student.latestExam.title} ({student.latestExam.percentage}%)
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#94A3B8]">لم يحل اختبارات بعد</span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Lessons Reviewed */}
                      <td className="py-3.5">
                        <div className="space-y-1 max-w-[240px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0F172A] dark:text-white font-mono text-xs">
                              {student.lessonsReviewedCount} درس
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              ({student.lessonsCompletedCount} مكتمل)
                            </span>
                          </div>

                          {student.recentLessons.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {student.recentLessons.slice(0, 2).map((l) => (
                                <span
                                  key={l.id}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate max-w-[110px]"
                                  title={`${l.title} (${l.progressPercent}%)`}
                                >
                                  {l.title}
                                </span>
                              ))}
                              {student.recentLessons.length > 2 && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  +{student.recentLessons.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#94A3B8]">لم يراجع دروساً بعد</span>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Actual Time Spent inside El-Kholasa */}
                      <td className="py-3.5">
                        <div className="space-y-1">
                          <span className="font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-1.5 text-xs">
                            <Clock className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
                            <span>{student.actualTimeSpentFormatted}</span>
                          </span>
                          <span className="text-[10px] text-[#94A3B8] font-mono block">
                            (وقت الامتحانات + الدروس)
                          </span>
                        </div>
                      </td>

                      {/* Column 6: Action Buttons */}
                      <td className="py-3.5 pl-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Full Profile Drawer Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(student.id)}
                            className="h-8 px-2.5 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                            title="عرض الملف الشامل للطالب وتاريخه الأكاديمي"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>الملف الشامل</span>
                          </button>

                          {/* WhatsApp 1-Click Button */}
                          {student.phone && student.phone !== "—" && (
                            <button
                              type="button"
                              onClick={() => handleWhatsApp(student)}
                              className="p-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                              title="إرسال رسالة واتساب للطالب بالكود والتشجيع"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Copy Login Code Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyCode(student.loginCode)}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="نسخ كود الدخول"
                          >
                            {copiedCodeId === student.loginCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Comprehensive Student Drawer (360° Profile) */}
      {selectedStudentId && (
        <StudentDetailsDrawer
          userId={selectedStudentId}
          systems={systems}
          grades={grades}
          onClose={() => setSelectedStudentId(null)}
          onUserUpdated={() => fetchData(true)}
        />
      )}
    </div>
  );
}
