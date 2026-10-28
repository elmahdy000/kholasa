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
  ArrowLeft,
} from "@phosphor-icons/react";
import { formatArabicDays, cn } from "@/lib/utils";

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
      return "ابدأ من النهاردة! حل سؤال سريع وسجل حضورك عشان تبدأ تثبت استمرارك.";
    }
    if (streakDays === 1) {
      return "عاش! كملت أول يوم، كمّل بكره عشان تفضل محافظ على استمرارك.";
    }
    if (streakDays === 2) {
      return "يومين ورا بعض! استمرارك ممتاز، قربت تقفل أسبوع كامل.";
    }
    if (streakDays < 7) {
      return `بقالك ${formatArabicDays(streakDays)} ورا بعض مستمر! كمّل عشان تقفل أسبوع كامل، عاش يا بطل.`;
    }
    return `فورمة عالية! ${formatArabicDays(streakDays)} ورا بعض بدون انقطاع، التزامك ممتاز ومكملين بقوة!`;
  };

  const getStreakGrammar = () => {
    if (streakDays === 0) return { numberText: "0", labelText: "أيام ورا بعض", fullText: "ابدأ من النهاردة" };
    if (streakDays === 1) return { numberText: "1", labelText: "يوم متواصل", fullText: "يوم متواصل" };
    if (streakDays === 2) return { numberText: "2", labelText: "يومين ورا بعض", fullText: "يومين ورا بعض" };
    if (streakDays >= 3 && streakDays <= 10) return { numberText: String(streakDays), labelText: "أيام ورا بعض", fullText: `${streakDays} أيام ورا بعض` };
    return { numberText: String(streakDays), labelText: "يوم ورا بعض", fullText: `${streakDays} يوم ورا بعض` };
  };

  const getNextMilestone = () => {
    if (streakDays === 0) return "الهدف: أول خطوة النهاردة";
    if (streakDays < 3) return "الهدف: 3 أيام ورا بعض";
    if (streakDays < 7) return "الهدف: أسبوع كامل";
    if (streakDays < 14) return "الهدف: أسبوعين متواصلين";
    if (streakDays < 30) return "الهدف: شهر كامل";
    return "الهدف: شهرين متواصلين";
  };

  const streakGrammar = getStreakGrammar();
  const todayDay = weekDays.find((d) => d.isToday);
  const todayKey = todayDay?.dayKey || "";

  return (
    <div className="relative rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#22364F] p-5 sm:p-6 shadow-xs overflow-hidden text-right">
      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        {/* Right Side: Flame Counter & Clean Status */}
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          {/* Flame Icon Container */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] dark:from-[#78350F]/40 dark:to-[#451A03]/30 border border-[#FDE68A] dark:border-[#78350F]/50 flex items-center justify-center text-[#D97706] dark:text-[#FBBF24] shadow-xs">
              <Fire className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" weight="fill" />
            </div>
            {isTodayCompleted && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shadow-xs border-2 border-white dark:border-[#0F172A]">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" weight="fill" />
              </div>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            {/* Top Micro-line: Title & Next Milestone */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#64748B] dark:text-[#94A3B8]">استمرارك اليومي</span>
              <span className="text-[#CBD5E1] dark:text-[#475569]">•</span>
              <span className="font-medium text-[#64748B] dark:text-[#94A3B8]">{getNextMilestone()}</span>
            </div>

            {/* Middle Row: Streak Count + Single Status Badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#12263F] dark:text-white font-mono tracking-tight">
                  {streakGrammar.numberText}
                </span>
                <span className="text-sm sm:text-base font-bold text-[#D97706] dark:text-[#FBBF24]">
                  {streakGrammar.labelText}
                </span>
              </div>

              {isTodayCompleted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 border border-[#059669]/20">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" weight="fill" />
                  <span>حضور النهاردة اتسجل</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 border border-[#D97706]/20">
                  <Lightning className="w-3.5 h-3.5 shrink-0" weight="fill" />
                  <span>سجّل حضور النهاردة</span>
                </span>
              )}
            </div>

            {/* Motivational message */}
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed max-w-md line-clamp-1">
              {isTodayCompleted
                ? "حضور النهاردة اتسجل بنجاح، ومكملين بكره إن شاء الله!"
                : getMotivationalMessage()}
            </p>
          </div>
        </div>

        {/* Center/Left Side: 7-Day Week Calendar & Quick Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
          {/* 7-Day Mini Tracker */}
          <div className="bg-[#F8FAFC] dark:bg-[#1E293B]/60 px-3 py-2 rounded-xl border border-[#E8E9ED] dark:border-[#334155] flex items-center justify-between gap-1 sm:gap-1.5">
            {weekDays.map((day) => {
              const rawName = day.dayName || "";
              const shortName = rawName.replace(/^ال/, "");
              const isPast = day.dayKey < todayKey;
              const isFuture = day.dayKey > todayKey;

              return (
                <div
                  key={day.dayKey}
                  className="flex flex-col items-center gap-1 px-1 min-w-[32px] sm:min-w-[36px]"
                  title={`${day.dayName}: ${day.isCompleted ? "مكتمل" : day.isToday ? "النهاردة" : isPast ? "فاتك" : "قادم"}`}
                >
                  <span
                    className={cn(
                      "text-[10px] font-semibold transition-colors",
                      day.isToday ? "text-[#D97706] font-bold" : "text-[#64748B] dark:text-[#94A3B8]"
                    )}
                  >
                    {shortName}
                  </span>
                  <div
                    className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all",
                      day.isCompleted
                        ? "bg-[#059669] text-white shadow-xs"
                        : day.isToday
                        ? "border-2 border-[#D97706] bg-amber-500/10 text-[#D97706]"
                        : isPast
                        ? "bg-[#E2E8F0] dark:bg-[#334155] text-transparent"
                        : "border border-dashed border-[#CBD5E1] dark:border-[#475569] text-transparent"
                    )}
                  >
                    {day.isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" weight="fill" />
                    ) : day.isToday ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
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
                  className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Lightning className="w-4 h-4 shrink-0" weight="fill" />
                  <span>حل سؤال النهاردة</span>
                </button>
                <button
                  type="button"
                  disabled={isCheckingIn}
                  onClick={handleQuickCheckin}
                  className="h-10 px-3 rounded-xl border border-[#D97706]/30 dark:border-[#FBBF24]/30 bg-white dark:bg-[#1E293B] hover:bg-[#D97706]/10 text-[#D97706] dark:text-[#FBBF24] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  title="تسجيل سريع لحضور النهاردة"
                >
                  <CalendarCheck className="w-3.5 h-3.5 shrink-0" weight="bold" />
                  <span>{isCheckingIn ? "ثواني..." : "تسجيل سريع"}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("kholasa_open_entrance_exam"));
                }}
                className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-[#059669]/10 hover:bg-[#059669]/15 border border-[#059669]/25 text-[#059669] dark:text-[#34D399] text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Trophy className="w-4 h-4 shrink-0 text-[#059669] dark:text-[#34D399]" weight="fill" />
                <span>سؤال إضافي</span>
                <ArrowLeft className="w-3 h-3" />
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
                عاش يا بطل! سجلت حضور النهاردة وزودت أيام استمرارك (+1 يوم) 🎉
              </span>
            </div>
            <span className="text-[11px] font-mono opacity-90">مستمر ومكمل</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
