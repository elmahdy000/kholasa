"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Calendar,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface ExamWaitingRoomProps {
  exam: {
    id: string;
    title: string;
    description?: string | null;
    durationMinutes: number;
    startsAt: string | Date;
    endsAt?: string | Date | null;
    subject: {
      name: string;
      color?: string | null;
    };
    questionsCount: number;
  };
}

export function ExamWaitingRoom({ exam }: ExamWaitingRoomProps) {
  const router = useRouter();
  const targetDate = new Date(exam.startsAt).getTime();

  const calculateTimeLeft = () => {
    const diff = targetDate - Date.now();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) {
        clearInterval(interval);
        // Time arrived! Reload to enter exam solver
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const formattedStartTime = new Date(exam.startsAt).toLocaleString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 text-right font-sans space-y-6">
      {/* Return button */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/exams")}
          className="inline-flex items-center gap-2 text-[13px] font-bold text-[#64748B] hover:text-[#800B34] transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة الامتحانات</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E2E8F0] dark:border-[#334155] p-6 sm:p-10 shadow-sm text-center space-y-8">
        {/* Subject Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white text-[13px] font-bold shadow-xs mx-auto"
             style={{ backgroundColor: exam.subject.color || "#800B34" }}>
          <BookOpen className="w-3.5 h-3.5" />
          <span>{exam.subject.name}</span>
        </div>

        {/* Title & Waiting headline */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-[12px] font-bold border border-sky-200 dark:border-sky-800">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>غرفة انتظار الامتحان المجدول</span>
          </span>

          <h1 className="text-xl sm:text-3xl font-black text-[#0F172A] dark:text-white leading-snug">
            <BidiStatement text={exam.title} as="span" />
          </h1>

          {exam.description && (
            <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
              <BidiStatement text={exam.description} as="span" />
            </p>
          )}
        </div>

        {/* Live Countdown Display */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#800B34]/5 via-[#800B34]/10 to-transparent dark:from-[#800B34]/20 border border-[#800B34]/20 space-y-4">
          <span className="text-[13px] font-bold text-[#800B34] dark:text-[#FB7185] flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>يبدأ الامتحان تلقائياً خلال:</span>
          </span>

          {timeLeft ? (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
              {timeLeft.days > 0 && (
                <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
                  <span className="block text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white font-mono">
                    {timeLeft.days}
                  </span>
                  <span className="text-[11px] font-bold text-[#64748B]">أيام</span>
                </div>
              )}

              <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
                <span className="block text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white font-mono">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-bold text-[#64748B]">ساعة</span>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
                <span className="block text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white font-mono">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-bold text-[#64748B]">دقيقة</span>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
                <span className="block text-2xl sm:text-4xl font-black text-[#800B34] dark:text-[#FB7185] font-mono animate-pulse">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-bold text-[#800B34] dark:text-[#FB7185]">ثانية</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-emerald-600 font-bold text-base flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>حان موعد الامتحان! جارٍ فتح الأسئلة الآن...</span>
            </div>
          )}

          <div className="text-[12px] text-[#64748B] flex items-center justify-center gap-1.5 pt-1">
            <Calendar className="w-3.5 h-3.5 text-[#800B34]" />
            <span>الموعد المحدد: {formattedStartTime}</span>
          </div>
        </div>

        {/* Quick Exam Specs */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-center">
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
            <span className="text-[11px] font-bold text-[#94A3B8] block">مدة الاختبار</span>
            <span className="text-[14px] font-bold text-[#0F172A] dark:text-white font-mono flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-[#800B34]" />
              {exam.durationMinutes} دقيقة
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
            <span className="text-[11px] font-bold text-[#94A3B8] block">عدد الأسئلة</span>
            <span className="text-[14px] font-bold text-[#0F172A] dark:text-white font-mono flex items-center justify-center gap-1 mt-0.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#800B34]" />
              {exam.questionsCount} سؤال
            </span>
          </div>
        </div>

        {/* Instructions Alert */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[12px] leading-relaxed flex items-start gap-3 text-right">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">تعليمات هامة قبل بدء الامتحان:</span>
            <p>
              تأكد من استقرار اتصال الإنترنت، واجلس في مكان هادئ. بمجرد بدء الامتحان سيبدأ العدّ التنازلي للوقت ولن يمكنك إيقاف المؤقت.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

