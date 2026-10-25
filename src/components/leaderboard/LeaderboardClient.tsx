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
    <div className="space-y-8 font-sans text-right">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#0F172A] p-6 sm:p-8 text-white shadow-sm border border-[#94A3B8]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D97706]/10 text-[13px] font-bold text-[#FBBF24] border border-[#D97706]/30">
              <Trophy className="w-3.5 h-3.5" />
              <span>لوحة الشرف وتصنيف الطلاب</span>
            </div>
            <h1 className="text-2xl sm:text-2xl sm:text-3xl font-bold tracking-tight text-white">
              متصدرو الخلاصة
            </h1>
            <p className="text-[13px] sm:text-sm text-[#94A3B8] font-medium max-w-xl leading-relaxed">
              نافس زملاءك، حل الامتحانات، واجمع نقاط الخبرة لتصعد إلى قمة الترتيب وتحصل على أوسمة التميز التعليمية.
            </p>
          </div>

          {/* Quick CTA */}
          <Link
            href="/exams/builder"
            className="h-11 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-[13px] flex items-center gap-2 shadow-sm transition-colors shrink-0"
          >
            <Zap className="w-4 h-4 fill-current text-[#D97706]" />
            <span>حل امتحان لزيادة ترتيبك</span>
          </Link>
        </div>
      </div>

      {/* Current User Standing Card */}
      {currentUser && (
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-bold text-lg ">
              #{currentUserRank || "-"}
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#4F46E5] dark:text-[#6366F1] block">
                موقعك الحالي في التصنيف
              </span>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                {currentUser.name} (أنت)
              </h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                {currentUser.systemName} • {currentUser.gradeName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[13px] font-bold">
            <div className="px-3 py-2 rounded-lg bg-[#4F46E5]/10 dark:bg-[#1E293B] border border-[#4F46E5]/20 text-[#4F46E5] dark:text-[#6366F1] font-mono flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{currentUser.xp} XP</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1 font-mono">
              <Flame className="w-3.5 h-3.5 fill-[#D97706]" />
              <span>{formatArabicDays(currentUser.streak)}</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#059669] dark:text-[#34D399] font-mono">
              {currentUser.completedExams} امتحان
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] ">
        {/* System tabs */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#1E293B]/80 p-1 rounded-xl">
          <button
            onClick={() => setSystemFilter("ALL")}
            className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
              systemFilter === "ALL"
                ? "bg-white dark:bg-[#0F172A] text-[#4F46E5] dark:text-[#6366F1] "
                : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            كل الأنظمة
          </button>
          <button
            onClick={() => setSystemFilter("الثانوية")}
            className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
              systemFilter === "الثانوية"
                ? "bg-white dark:bg-[#0F172A] text-[#4F46E5] dark:text-[#6366F1] "
                : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            الثانوية العامة
          </button>
          <button
            onClick={() => setSystemFilter("البكالوريا")}
            className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
              systemFilter === "البكالوريا"
                ? "bg-white dark:bg-[#0F172A] text-[#4F46E5] dark:text-[#6366F1] "
                : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            البكالوريا المصرية
          </button>
        </div>

        {/* Metric Sorting */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            الترتيب بحسب:
          </span>
          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value as any)}
            className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
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
            <div className="order-2 md:order-1 p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  flex flex-col items-center text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center font-bold text-[#64748B] dark:text-[#F8FAFC] ">
                <Medal className="w-6 h-6 text-[#94A3B8] dark:text-[#F8FAFC]" />
              </div>
              <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#1E293B] px-3 py-1 rounded-full">
                المركز الثاني
              </span>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                {top3[1].name}
              </h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                {top3[1].systemName}
              </p>
              <div className="pt-2 w-full flex items-center justify-around border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold font-mono">
                <span className="text-[#4F46E5] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
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
            <div className="order-1 md:order-2 p-6 rounded-xl bg-[#D97706]/10 dark:bg-[#0F172A] border-2 border-[#E2E8F0] dark:border-[#FBBF24] shadow-sm flex flex-col items-center text-center space-y-3 relative md:-mt-4">
              <div className="absolute -top-3 px-3 py-1 rounded-full bg-[#D97706] text-white text-[13px] font-bold  flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>متصدر الدفعة الأول</span>
              </div>
              <div className="w-16 h-16 rounded-xl bg-[#D97706] text-white flex items-center justify-center ">
                <Crown className="w-11 h-11 fill-current" />
              </div>
              <span className="text-[13px] font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full">
                المركز الأول
              </span>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                {top3[0].name}
              </h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                {top3[0].systemName} • {top3[0].gradeName}
              </p>
              <div className="pt-2 w-full flex items-center justify-around border-t border-[#E2E8F0]/50 dark:border-[#FBBF24]/40 text-[13px] font-bold">
                <span className="text-[#4F46E5] text-sm font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
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
            <div className="order-3 md:order-3 p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  flex flex-col items-center text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-xl bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#FBBF24]/60 flex items-center justify-center ">
                <Medal className="w-6 h-6 text-[#D97706] dark:text-[#FBBF24]" />
              </div>
              <span className="text-[13px] font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full">
                المركز الثالث
              </span>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                {top3[2].name}
              </h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                {top3[2].systemName}
              </p>
              <div className="pt-2 w-full flex items-center justify-around border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold">
                <span className="text-[#4F46E5] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
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
        <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
          باقي المتنافسين
        </h2>

        {remaining.length === 0 && top3.length <= 3 && (
          <div className="p-8 text-center rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] text-[13px]">
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
                  ? "bg-[#4F46E5]/10 dark:bg-[#1E293B] border-[#4F46E5]"
                  : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 text-center font-bold text-sm text-[#64748B] dark:text-[#94A3B8]">
                  #{rank}
                </span>
                <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-white flex items-center justify-center font-bold text-[13px]">
                  {user.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">
                    {user.name} {user.isCurrentUser ? "(أنت)" : ""}
                  </h4>
                  <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                    {user.systemName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[13px] font-bold">
                <span className="text-[#4F46E5] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{user.xp} XP</span>
                </span>
                <span className="hidden sm:inline text-[#D97706] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{formatArabicDays(user.streak)}</span>
                </span>
                <span className="text-[#059669] dark:text-[#34D399]">
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
