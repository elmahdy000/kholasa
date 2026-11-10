"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Flame,
  Award,
  Target,
  BookOpen,
  ArrowLeft,
  Crown,
  GraduationCap,
  Filter,
} from "lucide-react";
import { formatArabicDays } from "@/lib/utils";

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
    <div className="space-y-6 sm:space-y-8 font-sans text-right">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#091B40] p-5 sm:p-8 text-white shadow-xs border border-slate-700/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D97706]/10 text-xs sm:text-[13px] font-bold text-[#FBBF24] border border-[#D97706]/30">
              <Trophy className="w-3.5 h-3.5" />
              <span>لوحة الشرف وتصنيف الطلاب</span>
            </div>
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold tracking-tight text-white">
              متصدرو الخلاصة
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] font-medium max-w-xl leading-relaxed">
              نافس زملاءك، حل الامتحانات، واجمع نقاط الخبرة لتصعد إلى قمة الترتيب وتحصل على أوسمة التميز التعليمية.
            </p>
          </div>

          {/* Quick CTA */}
          <Link
            href="/exams/builder"
            className="w-full sm:w-auto min-h-[44px] h-11 px-5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-bold text-xs sm:text-[13px] flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Target className="w-4 h-4 text-[#D97706]" />
            <span>حل امتحان لزيادة ترتيبك</span>
          </Link>
        </div>
      </div>

      {/* Current User Standing Card */}
      {currentUser && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#800B34] text-white flex items-center justify-center font-bold text-base sm:text-lg shrink-0 shadow-xs">
              #{currentUserRank || "-"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-[13px] font-bold text-[#800B34] dark:text-[#FB7185] block">
                موقعك الحالي في التصنيف
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#091B40] dark:text-white truncate">
                {currentUser.name} (أنت)
              </h3>
              <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] truncate">
                {currentUser.systemName} • {currentUser.gradeName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-[13px] font-bold flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-[#800B34]/10 dark:bg-[#1E293B] border border-[#800B34]/20 text-[#800B34] dark:text-[#FB7185] font-sans tabular-nums flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>{currentUser.xp} XP</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1 font-sans tabular-nums">
              <Flame className="w-3.5 h-3.5 fill-[#D97706]" />
              <span>{formatArabicDays(currentUser.streak)}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#059669] dark:text-[#34D399] font-sans tabular-nums">
              {currentUser.completedExams} امتحان
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        {/* System filter pill (Baccalaureate platform) */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#1E293B]/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setSystemFilter("ALL")}
            className={`min-h-[44px] flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-bold transition-all text-center truncate cursor-pointer ${
              systemFilter === "ALL"
                ? "bg-white dark:bg-[#0F172A] text-[#800B34] dark:text-[#FB7185] shadow-xs"
                : "text-[#64748B] hover:text-[#091B40] dark:hover:text-white"
            }`}
          >
            <span className="truncate">كل المتصدرين</span>
          </button>
          <button
            onClick={() => setSystemFilter("البكالوريا")}
            className={`min-h-[44px] flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-bold transition-all text-center truncate cursor-pointer ${
              systemFilter === "البكالوريا"
                ? "bg-white dark:bg-[#0F172A] text-[#800B34] dark:text-[#FB7185] shadow-xs"
                : "text-[#64748B] hover:text-[#091B40] dark:hover:text-white"
            }`}
          >
            <span className="truncate">البكالوريا</span>
          </button>
        </div>

        {/* Metric Sorting */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] shrink-0">
            الترتيب بحسب:
          </span>
          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value as any)}
            className="w-full sm:w-auto min-h-[44px] h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800B34]"
          >
            <option value="xp">نقاط الخبرة (XP)</option>
            <option value="exams">الامتحانات المكتملة</option>
            <option value="lessons">الدروس المذاكرة</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium (Visual Showcase) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 pt-2">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className="order-2 md:order-1 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col items-center text-center space-y-3 relative shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center font-bold text-[#64748B] dark:text-[#F8FAFC]">
                <Medal className="w-6 h-6 text-[#94A3B8] dark:text-[#F8FAFC]" />
              </div>
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#1E293B] px-3 py-1 rounded-full">
                المركز الثاني
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#091B40] dark:text-white">
                {top3[1].name}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                {top3[1].systemName}
              </p>
              <div className="pt-2 w-full flex items-center justify-around border-t border-[#E2E8F0] dark:border-[#334155] text-xs sm:text-[13px] font-bold font-mono">
                <span className="text-[#800B34] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{top3[1].xp} XP</span>
                </span>
                <span className="text-[#D97706] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{formatArabicDays(top3[1].streak)}</span>
                </span>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold - Elevated) */}
          {top3[0] && (
            <div className="order-1 md:order-2 p-5 sm:p-6 rounded-2xl bg-[#D97706]/10 dark:bg-[#0F172A] border-2 border-[#D97706]/30 dark:border-[#FBBF24] shadow-sm flex flex-col items-center text-center space-y-3 relative md:-mt-3">
              <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-[#D97706] text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>متصدر الدفعة الأول</span>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shadow-xs">
                <Crown className="w-9 h-9 sm:w-10 sm:h-10 fill-current" />
              </div>
              <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full">
                المركز الأول
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#091B40] dark:text-white">
                {top3[0].name}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                {top3[0].systemName} • {top3[0].gradeName}
              </p>
              <div className="pt-2 w-full flex items-center justify-around border-t border-[#E2E8F0]/50 dark:border-[#FBBF24]/40 text-xs sm:text-[13px] font-bold">
                <span className="text-[#800B34] text-xs sm:text-sm font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{top3[0].xp} XP</span>
                </span>
                <span className="text-[#D97706] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{formatArabicDays(top3[0].streak)}</span>
                </span>
                <span className="text-[#059669]">
                  {top3[0].completedExams} امتحان
                </span>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className="order-3 md:order-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col items-center text-center space-y-3 relative shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#FBBF24]/60 flex items-center justify-center">
                <Medal className="w-6 h-6 text-[#D97706] dark:text-[#FBBF24]" />
              </div>
              <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full">
                المركز الثالث
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#091B40] dark:text-white">
                {top3[2].name}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                {top3[2].systemName}
              </p>
              <div className="pt-2 w-full flex items-center justify-around border-t border-[#E2E8F0] dark:border-[#334155] text-xs sm:text-[13px] font-bold">
                <span className="text-[#800B34] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{top3[2].xp} XP</span>
                </span>
                <span className="text-[#D97706] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{formatArabicDays(top3[2].streak)}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranks 4+ Table List */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-[#091B40] dark:text-white">
          باقي المتنافسين
        </h2>

        {remaining.length === 0 && top3.length <= 3 && (
          <div className="p-6 text-center rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] text-xs sm:text-[13px]">
            أنت من أوائل المنضمين للتصنيف! شارك وحل الامتحانات لتثبيت صدارتك.
          </div>
        )}

        {remaining.map((user, idx) => {
          const rank = idx + 4;
          return (
            <div
              key={user.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shadow-2xs ${
                user.isCurrentUser
                  ? "bg-[#800B34]/10 dark:bg-[#1E293B] border-[#800B34]"
                  : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="w-7 sm:w-8 text-center font-bold text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                  #{rank}
                </span>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] text-[#091B40] dark:text-white flex items-center justify-center font-bold text-xs sm:text-[13px] shrink-0 border border-[#E2E8F0]/60 dark:border-[#334155]">
                  {user.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#091B40] dark:text-white truncate">
                    {user.name} {user.isCurrentUser ? "(أنت)" : ""}
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                    {user.systemName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-[13px] font-bold self-end sm:self-auto">
                <span className="text-[#800B34] flex items-center gap-1 font-sans tabular-nums">
                  <Award className="w-3.5 h-3.5" />
                  <span>{user.xp} XP</span>
                </span>
                <span className="hidden sm:flex text-[#D97706] items-center gap-1 font-sans tabular-nums">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{formatArabicDays(user.streak)}</span>
                </span>
                <span className="text-[#059669] dark:text-[#34D399] font-sans tabular-nums">
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
