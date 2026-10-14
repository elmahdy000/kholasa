"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Flame,
  Zap,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Crown,
  GraduationCap,
  Filter,
} from "lucide-react";

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string | null;
  role: string;
  systemName: string;
  gradeName: string;
  completedLessons: number;
  completedExams: number;
  xp: number;
  streak: number;
  isCurrentUser: boolean;
}

interface LeaderboardClientProps {
  initialUsers: LeaderboardUser[];
  currentUserId?: string;
}

export function LeaderboardClient({
  initialUsers,
  currentUserId,
}: LeaderboardClientProps) {
  const [systemFilter, setSystemFilter] = useState<string>("ALL");
  const [metricFilter, setMetricFilter] = useState<"xp" | "exams" | "lessons">(
    "xp"
  );

  // Filter and sort
  const filteredUsers = initialUsers
    .filter((u) => {
      if (systemFilter === "ALL") return true;
      return u.systemName.includes(systemFilter);
    })
    .sort((a, b) => {
      if (metricFilter === "xp") return b.xp - a.xp;
      if (metricFilter === "exams") return b.completedExams - a.completedExams;
      return b.completedLessons - a.completedLessons;
    });

  const top3 = filteredUsers.slice(0, 3);
  const remaining = filteredUsers.slice(3);

  const currentUserRank =
    filteredUsers.findIndex((u) => u.id === currentUserId) + 1;
  const currentUser = filteredUsers.find((u) => u.id === currentUserId);

  return (
    <div className="space-y-8 font-sans text-right">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-6 sm:p-8 text-white shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Trophy className="w-3.5 h-3.5" />
              <span>لوحة الشرف وتصنيف الدفعة 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              متصدرو دفعة الخلاصة
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
              نافس زملاءك، حل الامتحانات، واجمع نقاط الخبرة لتصعد إلى قمة الترتيب وتحصل على أوسمة التميز التعليمية.
            </p>
          </div>

          {/* Quick CTA */}
          <Link
            href="/exams/builder"
            className="h-11 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors shrink-0"
          >
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>حل امتحان لزيادة ترتيبك</span>
          </Link>
        </div>
      </div>

      {/* Current User Standing Card */}
      {currentUser && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-bold text-lg shadow-2xs">
              #{currentUserRank || "-"}
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 block">
                موقعك الحالي في التصنيف
              </span>
              <h3 className="text-base font-black text-[#0F172A] dark:text-white">
                {currentUser.name} (أنت)
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {currentUser.systemName} • {currentUser.gradeName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-[#4F46E5]/20 text-[#4F46E5] dark:text-indigo-400 font-mono flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{currentUser.xp} XP</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 flex items-center gap-1 font-mono">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{currentUser.streak} أيام</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-mono">
              {currentUser.completedExams} امتحان
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* System tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl">
          <button
            onClick={() => setSystemFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              systemFilter === "ALL"
                ? "bg-white dark:bg-zinc-950 text-[#4F46E5] dark:text-indigo-400 shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            كل الأنظمة
          </button>
          <button
            onClick={() => setSystemFilter("الثانوية")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              systemFilter === "الثانوية"
                ? "bg-white dark:bg-zinc-950 text-[#4F46E5] dark:text-indigo-400 shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            الثانوية العامة
          </button>
          <button
            onClick={() => setSystemFilter("البكالوريا")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              systemFilter === "البكالوريا"
                ? "bg-white dark:bg-zinc-950 text-[#4F46E5] dark:text-indigo-400 shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            البكالوريا المصرية
          </button>
        </div>

        {/* Metric Sorting */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            الترتيب بحسب:
          </span>
          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          >
            <option value="xp">نقاط الخبرة (XP)</option>
            <option value="exams">الامتحانات المكتملة</option>
            <option value="lessons">الدروس المذاكرة</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium (Visual Showcase) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className="order-2 md:order-1 p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col items-center text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                <Medal className="w-6 h-6 text-slate-400 dark:text-slate-300" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                المركز الثاني
              </span>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                {top3[1].name}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {top3[1].systemName}
              </p>
              <div className="pt-2 w-full flex items-center justify-around border-t border-slate-100 dark:border-slate-800 text-xs font-bold font-mono">
                <span className="text-[#4F46E5] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{top3[1].xp} XP</span>
                </span>
                <span className="text-amber-500 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{top3[1].streak} أيام</span>
                </span>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold - Elevated) */}
          {top3[0] && (
            <div className="order-1 md:order-2 p-6 rounded-2xl bg-amber-50/40 dark:bg-zinc-950 border-2 border-amber-300 dark:border-amber-600 shadow-md flex flex-col items-center text-center space-y-3 relative md:-mt-4">
              <div className="absolute -top-3 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-2xs flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>متصدر الدفعة الأول</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                <Crown className="w-8 h-8 fill-current" />
              </div>
              <span className="text-xs font-bold text-[#D97706] dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-3 py-0.5 rounded-full">
                المركز الأول
              </span>
              <h3 className="text-lg font-black text-[#0F172A] dark:text-white">
                {top3[0].name}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {top3[0].systemName} • {top3[0].gradeName}
              </p>
              <div className="pt-2 w-full flex items-center justify-around border-t border-amber-200/50 dark:border-amber-900/40 text-xs font-bold">
                <span className="text-[#4F46E5] text-sm font-black flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{top3[0].xp} XP</span>
                </span>
                <span className="text-amber-600 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{top3[0].streak} أيام</span>
                </span>
                <span className="text-emerald-600">
                  {top3[0].completedExams} امتحان
                </span>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className="order-3 md:order-3 p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col items-center text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center shadow-2xs">
                <Medal className="w-6 h-6 text-amber-700 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-bold text-[#D97706] dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
                المركز الثالث
              </span>
              <h3 className="text-base font-black text-[#0F172A] dark:text-white">
                {top3[2].name}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {top3[2].systemName}
              </p>
              <div className="pt-2 w-full flex items-center justify-around border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                <span className="text-[#4F46E5] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{top3[2].xp} XP</span>
                </span>
                <span className="text-amber-500 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{top3[2].streak} أيام</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranks 4+ Table List */}
      <div className="space-y-3">
        <h2 className="text-base font-black text-[#14243D] dark:text-white">
          باقي المتنافسين
        </h2>

        {remaining.length === 0 && top3.length <= 3 && (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#111A2B] border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            أنت من أوائل المنضمين للتصنيف! شارك وحل الامتحانات لتثبيت صدارتك.
          </div>
        )}

        {remaining.map((user, idx) => {
          const rank = idx + 4;
          return (
            <div
              key={user.id}
              className={`p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${
                user.isCurrentUser
                  ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-[#4F46E5]"
                  : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="w-8 text-center font-bold text-sm text-[#64748B] dark:text-[#94A3B8]">
                  #{rank}
                </span>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white flex items-center justify-center font-bold text-xs">
                  {user.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">
                    {user.name} {user.isCurrentUser ? "(أنت)" : ""}
                  </h4>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {user.systemName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-[#4F46E5] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{user.xp} XP</span>
                </span>
                <span className="hidden sm:inline text-amber-500 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{user.streak} أيام</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {user.completedExams} امتحانات
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
