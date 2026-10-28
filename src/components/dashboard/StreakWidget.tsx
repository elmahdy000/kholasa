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
  const [checkInError, setCheckInError] = useState<string | null>(null);

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
    setCheckInError(null);
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
      setCheckInError(err instanceof Error ? err.message : "تعذر تسجيل الحضور، تأكد من الاتصال وجرب مرة أخرى");
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

  const getStreakGrammar = () => {
    if (streakDays === 0) return { numberText: "0", labelText: "أيام متتالية", fullText: "لا توجد شعلة نشطة اليوم" };
    if (streakDays === 1) return { numberText: "1", labelText: "يوم واحد متتالي", fullText: "يوم واحد متتالي" };
    if (streakDays === 2) return { numberText: "2", labelText: "يومان متتاليان", fullText: "يومان متتاليان" };
    if (streakDays >= 3 && streakDays <= 10) return { numberText: String(streakDays), labelText: "أيام متتالية", fullText: `${streakDays} أيام متتالية` };
    return { numberText: String(streakDays), labelText: "يوماً متتالياً", fullText: `${streakDays} يوماً متتالياً` };
  };

  const getNextMilestone = () => {
    if (streakDays === 0) return "الهدف القادم: إشعال أول يوم";
    if (streakDays < 3) return "الهدف القادم: 3 أيام متتالية";
    if (streakDays < 7) return "الهدف القادم: أسبوع كامل (7 أيام)";
    if (streakDays < 14) return "الهدف القادم: أسبوعان (14 يوماً)";
    if (streakDays < 30) return "الهدف القادم: شهر كامل (30 يوماً)";
    return "الهدف القادم: 60 يوماً من التميز";
  };

  const streakGrammar = getStreakGrammar();
  const todayDay = weekDays.find((d) => d.isToday);
  const todayKey = todayDay?.dayKey || "";

  return (
    <div className="relative rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-5 sm:p-6 shadow-sm overflow-hidden text-right">
      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Right Side: Flame Counter & Motivation */}
        <div className="flex items-start gap-4 sm:gap-5 min-w-0">
          {/* Solid Flame Icon Container */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Fire className="w-8 h-8 sm:w-9 sm:h-9 text-white shrink-0" weight="fill" />
            </div>
            {isTodayCompleted && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center shadow-sm border-2 border-white dark:border-[#0F172A]">
                <CheckCircle className="w-4 h-4 shrink-0" weight="fill" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] sm:text-[12px] font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 dark:bg-[#1E293B] px-2.5 py-0.5 rounded-full border border-[#D97706]/20 dark:border-[#D97706]/30">
                شعلة الاستمرارية اليومية
              </span>
              <span className="text-[11px] sm:text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#1E293B] px-2.5 py-0.5 rounded-full border border-[#E2E8F0] dark:border-[#334155]">
                {getNextMilestone()}
              </span>
              {isTodayCompleted ? (
                <span className="text-[11px] sm:text-[12px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#1E293B] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#059669]/20">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" weight="fill" />
                  <span>حضور اليوم مسجّل</span>
                </span>
              ) : (
                <span className="text-[11px] sm:text-[12px] font-bold text-[#DC2626] dark:text-[#F87171] bg-[#DC2626]/10 dark:bg-[#1E293B] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#DC2626]/20 animate-pulse">
                  <Lightning className="w-3.5 h-3.5 shrink-0" weight="fill" />
                  <span>تحدي اليوم متاح</span>
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                {streakGrammar.numberText}
              </span>
              <span className="text-sm sm:text-base font-bold text-[#D97706] dark:text-[#FBBF24]">
                {streakGrammar.labelText}
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
          <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-2 sm:p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-1 sm:gap-1.5">
            {weekDays.map((day) => {
              const rawName = day.dayName || "";
              // Full vs short clean labels - never broken to "ال"
              const shortName = rawName.startsWith("ال") ? rawName.slice(2) : rawName;
              const fullName = rawName.startsWith("ال") ? rawName : `ال${rawName}`;

              // Determine state: completed, today, missed, upcoming
              const isPast = day.dayKey < todayKey;
              const isFuture = day.dayKey > todayKey;

              let stateStyle = "bg-white/60 dark:bg-[#0F172A]/40 text-[#94A3B8]";
              let iconElement = <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1] dark:bg-[#475569]" />;
              let stateTitle = "قادم";

              if (day.isCompleted) {
                stateStyle = "bg-[#059669]/15 dark:bg-[#059669]/25 text-[#059669] dark:text-[#34D399] font-bold border border-[#059669]/30";
                iconElement = <CheckCircle className="w-4 h-4 fill-current text-[#059669] dark:text-[#34D399] shrink-0" weight="fill" />;
                stateTitle = "مكتمل";
              } else if (day.isToday) {
                stateStyle = "bg-white dark:bg-[#0F172A] border-2 border-dashed border-[#D97706] text-[#D97706] dark:text-[#FBBF24] font-bold";
                iconElement = <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping shrink-0" />;
                stateTitle = "اليوم (في انتظار الإكمال)";
              } else if (isPast) {
                stateStyle = "bg-[#F1F5F9] dark:bg-[#1E293B] text-[#94A3B8] border border-[#E2E8F0]/60 dark:border-[#334155]/60";
                iconElement = <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] shrink-0" />;
                stateTitle = "لم يُسجّل";
              } else if (isFuture) {
                stateStyle = "bg-transparent text-[#CBD5E1] dark:text-[#475569] border border-dashed border-[#E2E8F0] dark:border-[#334155]";
                iconElement = <span className="w-1 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#475569] shrink-0" />;
                stateTitle = "قادم";
              }

              return (
                <div
                  key={day.dayKey}
                  className={`flex flex-col items-center justify-center min-w-[38px] sm:min-w-[44px] px-1 py-1.5 rounded-lg text-center transition-all ${stateStyle}`}
                  title={`${fullName}: ${stateTitle}`}
                >
                  <span className="text-[11px] font-bold leading-none mb-1.5 whitespace-nowrap">
                    <span className="hidden sm:inline">{fullName}</span>
                    <span className="sm:hidden">{shortName}</span>
                  </span>
                  {iconElement}
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
                  className="flex-1 sm:flex-initial h-11 px-4 sm:px-5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all interactive-tap cursor-pointer"
                >
                  <Lightning className="w-4 h-4 shrink-0" weight="fill" />
                  <span>حل تحدي اليوم</span>
                </button>
                <button
                  type="button"
                  disabled={isCheckingIn}
                  onClick={handleQuickCheckin}
                  className="h-11 px-3.5 rounded-xl border border-[#D97706]/40 dark:border-[#FBBF24]/40 bg-white dark:bg-[#1E293B] hover:bg-[#D97706]/10 text-[#D97706] dark:text-[#FBBF24] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all interactive-tap disabled:opacity-50 cursor-pointer"
                  title="تسجيل الحضور اليومي واستمرار الشعلة بنقرة واحدة"
                >
                  <CalendarCheck className="w-4 h-4 shrink-0" weight="bold" />
                  <span>{isCheckingIn ? "جارٍ الحفظ..." : "تسجيل فوري"}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("kholasa_open_entrance_exam"));
                }}
                className="flex-1 sm:flex-initial h-11 px-4 sm:px-5 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] border border-[#059669]/30 text-[#059669] dark:text-[#34D399] text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:bg-[#059669]/15 cursor-pointer"
              >
                <Trophy className="w-4 h-4 shrink-0" weight="fill" />
                <span>شعلتك آمنة اليوم! تحدي إضافي؟</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Error Notice */}
      {checkInError && (
        <div className="mt-3 p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] dark:text-[#F87171] text-xs font-bold flex items-center justify-between gap-2">
          <span>{checkInError}</span>
          <button
            type="button"
            onClick={() => setCheckInError(null)}
            className="text-[11px] underline hover:no-underline"
          >
            إغلاق
          </button>
        </div>
      )}

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
