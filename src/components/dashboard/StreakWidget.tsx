"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fire,
  CheckCircle,
  Lightning,
  Sparkle,
  Trophy,
  CalendarCheck,
} from "@phosphor-icons/react";
import { formatArabicDays } from "@/lib/utils";

export interface WeekDayProgress {
  dayKey: string;
  dayName: string;
  isCompleted: boolean;
  isToday: boolean;
}

interface StreakWidgetProps {
  initialStreakDays: number;
  initialIsTodayCompleted: boolean;
  initialWeekDays: WeekDayProgress[];
  onOpenDailyChallenge?: () => void;
}

export function StreakWidget({
  initialStreakDays,
  initialIsTodayCompleted,
  initialWeekDays,
  onOpenDailyChallenge,
}: StreakWidgetProps) {
  const [streakDays, setStreakDays] = useState(initialStreakDays);
  const [isTodayCompleted, setIsTodayCompleted] = useState(initialIsTodayCompleted);
  const [weekDays, setWeekDays] = useState<WeekDayProgress[]>(initialWeekDays);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Listen to cross-component streak updates (e.g. from DailyChallengeCard or Entrance Exam)
  useEffect(() => {
    const handleStreakUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ streakDays: number; isTodayCompleted: boolean }>;
      if (customEvent.detail) {
        if (typeof customEvent.detail.streakDays === "number") {
          setStreakDays(customEvent.detail.streakDays);
        }
        if (customEvent.detail.isTodayCompleted) {
          setIsTodayCompleted(true);
          setWeekDays((prev) =>
            prev.map((d) => (d.isToday ? { ...d, isCompleted: true } : d))
          );
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 4000);
        }
      }
    };

    window.addEventListener("kholasa_streak_updated", handleStreakUpdate);
    return () => window.removeEventListener("kholasa_streak_updated", handleStreakUpdate);
  }, []);

  const handleQuickCheckin = async () => {
    if (isTodayCompleted || isCheckingIn) return;

    setIsCheckingIn(true);
    try {
      const res = await fetch("/api/student/daily-checkin/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تسجيل الحضور اليومي");
      }

      setStreakDays(data.streakDays);
      setIsTodayCompleted(true);
      setWeekDays((prev) =>
        prev.map((d) => (d.isToday ? { ...d, isCompleted: true } : d))
      );
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4500);

      window.dispatchEvent(
        new CustomEvent("kholasa_streak_updated", {
          detail: { streakDays: data.streakDays, isTodayCompleted: true },
        })
      );
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "تعذر تسجيل الحضور، تأكد من الاتصال");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const getMotivationalMessage = () => {
    if (streakDays === 0) {
      return "ابدأ شعلتك اليوم! حل سؤال التحدي وسجل حضورك لتضيء شعلة الاستمرارية لأول مرة.";
    }
    if (streakDays === 1) {
      return "بداية قوية! أنجزت يوماً كاملاً، حافظ على توهج الشعلة غداً واستمر في التقدم.";
    }
    if (streakDays < 7) {
      return `شعلتك مشتعلة منذ ${formatArabicDays(streakDays)}! أنت في طريقك لإتمام أسبوع كامل من التميز.`;
    }
    return `مستوى أسطوري! ${formatArabicDays(streakDays)} من الالتزام اليومي والتعلم المستمر، شعلتك لا تنطفئ!`;
  };

  const getStreakUnitLabel = () => {
    if (streakDays === 0) return "يوم • ابدأ شعلتك";
    if (streakDays === 1) return "يوم من الالتزام";
    if (streakDays === 2) return "يومان متتاليان";
    if (streakDays <= 10) return "أيام متتالية";
    return "يوماً متتالياً";
  };

  return (
    <div className="relative rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-5 sm:p-6 shadow-sm overflow-hidden text-right">
      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Right Side: Flame Counter & Motivation */}
        <div className="flex items-start gap-4 sm:gap-5 min-w-0">
          {/* Solid Flame Icon Container (No Gradients) */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shadow-sm">
              <Fire className="w-8 h-8 sm:w-9 sm:h-9 text-white" weight="fill" />
            </div>
            {isTodayCompleted && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center shadow-sm border-2 border-white dark:border-[#0F172A]">
                <CheckCircle className="w-4 h-4" weight="fill" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] sm:text-[12px] font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 dark:bg-[#1E293B] px-2.5 py-0.5 rounded-full border border-[#D97706]/20 dark:border-[#D97706]/30">
                ويدجت التحدي اليومي والـ Streak
              </span>
              {isTodayCompleted ? (
                <span className="text-[11px] sm:text-[12px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#1E293B] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#059669]/20">
                  <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                  <span>حضور اليوم مسجّل</span>
                </span>
              ) : (
                <span className="text-[11px] sm:text-[12px] font-bold text-[#DC2626] dark:text-[#F87171] bg-[#DC2626]/10 dark:bg-[#1E293B] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#DC2626]/20 animate-pulse">
                  <Lightning className="w-3.5 h-3.5" weight="fill" />
                  <span>تحدي اليوم متاح الآن</span>
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                {streakDays}
              </span>
              <span className="text-sm sm:text-base font-bold text-[#D97706] dark:text-[#FBBF24]">
                {getStreakUnitLabel()}
              </span>
            </div>

            <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-xl leading-relaxed">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>

        {/* Center/Left Side: 7-Day Week Calendar & Quick Action */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-4 shrink-0">
          {/* 7-Day Mini Calendar */}
          <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-2.5 sm:p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-1.5 sm:gap-2">
            {weekDays.map((day) => {
              const cleanDayLabel = day.dayName.replace(/^ال/, "");
              return (
                <div
                  key={day.dayKey}
                  className={`flex flex-col items-center justify-center min-w-[36px] sm:min-w-[42px] px-1 py-1.5 rounded-lg text-center transition-all ${
                    day.isCompleted
                      ? "bg-[#D97706]/15 dark:bg-[#D97706]/25 text-[#D97706] dark:text-[#FBBF24] font-bold border border-[#D97706]/30"
                      : day.isToday
                      ? "bg-white dark:bg-[#0F172A] border-2 border-dashed border-[#D97706] text-[#D97706] dark:text-[#FBBF24] font-bold"
                      : "bg-white/60 dark:bg-[#0F172A]/40 text-[#94A3B8]"
                  }`}
                  title={`${day.dayName}: ${day.isCompleted ? "مكتمل" : day.isToday ? "اليوم" : "لم يكتمل"}`}
                >
                  <span className="text-[11px] font-bold leading-none mb-1">
                    {cleanDayLabel}
                  </span>
                  {day.isCompleted ? (
                    <Fire className="w-4 h-4 fill-current text-[#D97706] dark:text-[#FBBF24]" weight="fill" />
                  ) : day.isToday ? (
                    <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1] dark:bg-[#475569]" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons (Solid Clean Styling) */}
          <div className="flex items-center gap-2">
            {!isTodayCompleted ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDailyChallenge) {
                      onOpenDailyChallenge();
                    } else {
                      const el = document.getElementById("daily-challenge-card");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      } else {
                        window.dispatchEvent(new CustomEvent("kholasa_open_entrance_exam"));
                      }
                    }
                  }}
                  className="flex-1 sm:flex-initial h-11 px-4 sm:px-5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all interactive-tap"
                >
                  <Lightning className="w-4 h-4" weight="fill" />
                  <span>حل تحدي اليوم</span>
                </button>
                <button
                  type="button"
                  disabled={isCheckingIn}
                  onClick={handleQuickCheckin}
                  className="h-11 px-3.5 rounded-xl border border-[#D97706]/40 dark:border-[#FBBF24]/40 bg-white dark:bg-[#1E293B] hover:bg-[#D97706]/10 text-[#D97706] dark:text-[#FBBF24] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all interactive-tap disabled:opacity-50"
                  title="تسجيل الحضور اليومي واستمرار الشعلة بنقرة واحدة"
                >
                  <CalendarCheck className="w-4 h-4" weight="bold" />
                  <span>{isCheckingIn ? "جارٍ الحفظ..." : "تسجيل فوري"}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("kholasa_open_entrance_exam"));
                }}
                className="flex-1 sm:flex-initial h-11 px-4 sm:px-5 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] border border-[#059669]/30 text-[#059669] dark:text-[#34D399] text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:bg-[#059669]/15"
              >
                <Trophy className="w-4 h-4" weight="fill" />
                <span>شعلتك آمنة اليوم! تحدي إضافي؟</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Celebration Banner (Solid Clean Green) */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-xl bg-[#059669] text-white text-[13px] font-bold flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkle className="w-5 h-5 fill-current animate-spin-slow" weight="fill" />
              <span>
                عاش يا بطل! تم تسجيل حضورك اليوم وحماية شعلتك (+1 يوم في الـ Streak) 🔥
              </span>
            </div>
            <span className="text-[11px] font-mono opacity-90">شعلة مستمرة</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
