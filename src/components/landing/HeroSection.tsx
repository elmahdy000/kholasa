"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, BookOpen, ArrowLeft } from "lucide-react";
import type { LandingHeroHighlight } from "@/components/landing/types";
import { RealQuestionChallenge } from "@/components/landing/RealQuestionChallenge";

interface HeroSectionProps {
  heroQuestions: {
    arabic: LandingHeroHighlight | null;
    languages: LandingHeroHighlight | null;
  };
}

export function HeroSection({ heroQuestions }: HeroSectionProps) {
  const defaultTrack = heroQuestions.arabic ? "ARABIC" : "LANGUAGES";
  const [selectedTrack, setSelectedTrack] = useState<"ARABIC" | "LANGUAGES">(defaultTrack);

  const activeHighlight =
    selectedTrack === "ARABIC" ? heroQuestions.arabic : heroQuestions.languages;

  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Right Column: Clear Student Value & Focused CTAs */}
          <div className="lg:col-span-6 text-right space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#800B34] dark:text-[#FB7185]">
              <span>منصة الخلاصة للبكالوريا المصرية • عربي ولغات</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-[#091B40] dark:text-white leading-[1.35]">
              ذاكر درسك، اختبر فهمك،{" "}
              <span className="text-[#800B34] dark:text-[#FB7185]">
                واعرف سبب كل إجابة.
              </span>
            </h1>

            <p className="text-[15px] sm:text-base text-[#536681] dark:text-[#94A3B8] leading-[1.7] max-w-xl font-medium">
              من دروس البكالوريا الفعلية، راجع المفاهيم وحل الأسئلة وشوف تفسير إجابتك، وارجع لأخطائك من مكان واحد.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#curriculum-explorer"
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
              >
                <span>جرّب سؤال من المنهج</span>
                <ArrowDownLeft className="w-4 h-4" />
              </a>

              <Link
                href="/subjects"
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#091B40] dark:text-white text-sm font-bold inline-flex items-center gap-2 hover:border-[#800B34] hover:text-[#800B34] dark:hover:border-[#FB7185] dark:hover:text-[#FB7185] transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />
                <span>تصفّح الدروس</span>
              </Link>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
              <Link
                href="/login"
                className="min-h-[44px] py-2 inline-flex items-center gap-1.5 font-bold text-[#091B40] dark:text-[#E2E8F0] hover:text-[#800B34] dark:hover:text-[#FB7185] transition-colors"
              >
                <span>عندك كود طالب أو عايز جلسة تجريبية مستقلة؟ ادخل هنا</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Left Column: Live Verified Question Preview from Approved Question Bank */}
          <div className="lg:col-span-6" data-hero-preview-card="true">
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] p-4 sm:p-5 space-y-4">
              {/* Top Track Selector inside Widget */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
                <span className="text-xs font-bold text-[#091B40] dark:text-white">
                  معاينة مباشرة من بنك الأسئلة المعتمد
                </span>

                <div
                  className="inline-flex p-1 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] gap-1"
                  role="tablist"
                  aria-label="اختيار المسار اللغوي للسؤال"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTrack === "ARABIC"}
                    onClick={() => setSelectedTrack("ARABIC")}
                    className={`min-h-[44px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      selectedTrack === "ARABIC"
                        ? "bg-[#091B40] text-white"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                    }`}
                  >
                    بكالوريا عربي
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTrack === "LANGUAGES"}
                    onClick={() => setSelectedTrack("LANGUAGES")}
                    className={`min-h-[44px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      selectedTrack === "LANGUAGES"
                        ? "bg-[#091B40] text-white"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                    }`}
                  >
                    بكالوريا لغات
                  </button>
                </div>
              </div>

              {/* Real Question Container */}
              <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-4">
                {activeHighlight ? (
                  <RealQuestionChallenge
                    key={`${activeHighlight.lessonId}-${activeHighlight.question.id}`}
                    lessonId={activeHighlight.lessonId}
                    lessonTitle={activeHighlight.lessonTitle}
                    unitTitle={activeHighlight.unitTitle}
                    question={activeHighlight.question}
                    isLanguages={activeHighlight.schoolCategory === "LANGUAGES"}
                    compact
                  />
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-sm font-bold text-[#091B40] dark:text-white">
                      لا يتوفر سؤال معاينة معتمد لهذا المسار حالياً
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      تصفح الدروس المتاحة من قسم استكشاف المنهج بالأسفل.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
