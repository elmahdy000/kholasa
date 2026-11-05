"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  WifiSlash,
  ArrowsClockwise,
  BookOpen,
  BookmarkSimple,
  ArrowRight,
  Clock,
  Trash,
  CheckCircle,
  FolderOpen,
} from "@phosphor-icons/react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { offlineStorage, type OfflineLessonData } from "@/lib/offline-db";
import { OfflineLessonViewerModal } from "@/components/offline/OfflineLessonViewerModal";

export default function OfflinePage() {
  const [savedLessons, setSavedLessons] = useState<OfflineLessonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<OfflineLessonData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const loadSavedLessons = async () => {
    setIsLoading(true);
    try {
      const lessons = await offlineStorage.listLessons();
      setSavedLessons(lessons);
    } catch (err) {
      console.error("Failed to list offline lessons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedLessons();

    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await offlineStorage.deleteLesson(lessonId);
      setSavedLessons((prev) => prev.filter((l) => l.id !== lessonId));
      if (selectedLesson?.id === lessonId) {
        setIsModalOpen(false);
        setSelectedLesson(null);
      }
    } catch (err) {
      console.error("Failed to delete offline lesson:", err);
    }
  };

  const handleOpenLesson = (lesson: OfflineLessonData) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 text-right font-sans relative"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full pt-2 flex items-center justify-between relative z-10 flex-wrap gap-3">
        <BrandLogo
          href="/"
          variant="combined"
          size="sm"
          subtitleText="وضع عدم الاتصال (PWA)"
        />

        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] dark:text-[#34D399] border border-[#059669]/30 text-[12px] font-bold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" weight="bold" />
              <span>عادت الشبكة للعمل</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-amber-500/10 dark:bg-[#1E293B] border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[12px] font-bold flex items-center gap-1.5">
              <WifiSlash className="w-3.5 h-3.5" weight="bold" />
              <span>وضع المذاكرة أوفلاين</span>
            </span>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto w-full py-8 space-y-6 relative z-10">
        {/* Banner */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[12px] font-bold">
              <FolderOpen className="w-4 h-4" weight="bold" />
              <span>مكتبة الدروس المحفوظة محلياً</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
              ذاكر بدون إنترنت في أي وقت ومكان
            </h1>
            <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-xl">
              جميع الدروس والملخصات والبطاقات التي قمت بحفظها تعمل بالكامل بدون اتصال بالإنترنت مع تجربة قراءة ومراجعة سلسة.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-11 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowsClockwise className="w-4 h-4" weight="bold" />
              <span>إعادة فحص الاتصال</span>
            </button>

            {isOnline && (
              <Link
                href="/dashboard"
                className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#F8FAFC] transition-colors"
              >
                <span>الرئيسية</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
            )}
          </div>
        </section>

        {/* Saved Lessons List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#4F46E5]" weight="bold" />
              <span>دروسك المتاحة للمذاكرة الآن ({savedLessons.length})</span>
            </h2>

            <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              مخزنة في ذاكرة المتصفح (IndexedDB)
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-[#64748B] dark:text-[#94A3B8] text-sm">
              جاري فحص الدروس المحفوظة في جهازك...
            </div>
          ) : savedLessons.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center mx-auto text-[#64748B] dark:text-[#94A3B8]">
                <FolderOpen className="w-7 h-7" weight="duotone" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                  لم تقم بحفظ أي دروس للمذاكرة أوفلاين بعد
                </h3>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  عند اتصالك بالإنترنت، افتح أي درس واضغط على زر **«حفظ أوفلاين»** في أعلى الصفحة وسيتم حفظ الدرس بملخصه وبطاقاته هنا فوراً لتذاكره في أي وقت بدون إنترنت.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedLessons.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-4 hover:border-[#4F46E5]/40 transition-colors shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-bold text-[#800020] dark:text-[#FB7185]">
                        {item.subjectName}
                      </span>
                      <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                        {item.unitTitle}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{item.durationMinutes} دقيقة</span>
                      </span>
                      <span>•</span>
                      <span className="text-[#059669] dark:text-[#34D399] font-bold">
                        متاح أوفلاين 100%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]/60">
                    <button
                      type="button"
                      onClick={() => handleOpenLesson(item)}
                      className="flex-1 h-10 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" weight="bold" />
                      <span>مذاكرة الدرس الآن</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(item.id)}
                      className="w-10 h-10 rounded-xl border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="حذف من ذاكرة الجهاز"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Offline Modal Viewer */}
      <OfflineLessonViewerModal
        lesson={selectedLesson}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLesson(null);
        }}
        onDelete={(lessonId) => handleDeleteLesson(lessonId)}
      />

      {/* Footer */}
      <footer className="text-center text-[13px] text-[#64748B] dark:text-[#94A3B8] py-4 relative z-10">
        الخلاصة • افهمها صح.. هتفضل معاك
      </footer>
    </div>
  );
}
