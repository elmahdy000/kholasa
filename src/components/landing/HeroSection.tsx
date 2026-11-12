"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  School,
  UserPlus,
} from "lucide-react";
import type { LandingGradeItem } from "@/components/landing/types";
import {
  formatGradeShortLabel,
  type StudySchoolCategory,
} from "@/lib/study-preferences";
import { isStaffRoleValue } from "@/lib/roles";

interface HeroSectionProps {
  grades: LandingGradeItem[];
  selectedGradeId: string | null;
  selectedCategory: StudySchoolCategory | null;
  onSelectGrade: (grade: LandingGradeItem) => void;
  onSelectCategory: (cat: StudySchoolCategory) => void;
  onShowSubjects: () => void;
  loggedInUser?: {
    name: string;
    role: string;
  } | null;
}

export function HeroSection({
  grades,
  selectedGradeId,
  selectedCategory,
  onSelectGrade,
  onSelectCategory,
  onShowSubjects,
  loggedInUser,
}: HeroSectionProps) {
  const [selectionHint, setSelectionHint] = useState<string | null>(null);

  const isSelectionComplete = Boolean(selectedGradeId && selectedCategory);
  const isStaff = Boolean(loggedInUser && isStaffRoleValue(loggedInUser.role));

  const handlePrimaryAction = () => {
    if (!selectedGradeId) {
      setSelectionHint("اختار سنة دراسية أولاً (أولى أو تانية بكالوريا).");
      return;
    }
    if (!selectedCategory) {
      setSelectionHint("اختار نوع المدرسة (مدارس عربي أو مدارس لغات).");
      return;
    }
    setSelectionHint(null);
    onShowSubjects();
  };

  return (
    <section
      id="hero-selector"
      className="py-5 sm:py-10 lg:py-12 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Short Focused Copy & Direct Platform Entry */}
          <div className="lg:col-span-5 text-right space-y-3 sm:space-y-4">
            {loggedInUser ? (
              <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/40 border border-[#A7F3D0] dark:border-[#059669]/50 text-xs font-bold text-[#065F46] dark:text-[#6EE7B7]">
                <span>أهلاً {loggedInUser.name} • أنت مسجّل دخول بالفعل</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#800B34] dark:text-[#FB7185]">
                <span>الخلاصة للبكالوريا • عربي ولغات</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#091B40] dark:text-white leading-[1.3]">
              جاهز تبدأ{" "}
              <span className="text-[#800B34] dark:text-[#FB7185]">
                مذاكرتك؟
              </span>
            </h1>

            <p className="text-sm sm:text-[15px] text-[#536681] dark:text-[#94A3B8] leading-relaxed font-medium">
              اختار صفك الدراسي، وهنوصّلك لدروسك وأسئلتك على طول.
            </p>

            {/* Desktop Secondary Quick Entry (mirrored compactly under selector on mobile) */}
            <div className="hidden lg:flex flex-wrap items-center gap-3 pt-2">
              {loggedInUser ? (
                <Link
                  href={isStaff ? "/admin" : "/dashboard"}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-[#091B40] hover:bg-[#12263F] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{isStaff ? "فتح لوحة التحكم" : "ادخل لوحة الطالب"}</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="min-h-[44px] px-4 py-2 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34] text-[#091B40] dark:text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />
                    <span>معاك كود طالب؟ ادخل بالكود</span>
                  </Link>

                  <Link
                    href="/subscription"
                    className="min-h-[44px] px-3 py-2 text-sm font-bold text-[#091B40] dark:text-slate-200 hover:text-[#800B34] dark:hover:text-[#FB7185] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>طالب جديد؟ سجل واشترك</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Unified Step-by-Step Grade & Track Selector Card */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] p-4 sm:p-6 space-y-4">
              {/* Step 1: Grade Selection (Unselected for new visitors) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#091B40] dark:text-white">
                    <GraduationCap className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />
                    <span>1. إنت في سنة كام؟</span>
                  </span>
                  {!selectedGradeId && (
                    <span className="text-[11px] font-semibold text-[#800B34] dark:text-[#FB7185]">
                      اختار السنة أولاً
                    </span>
                  )}
                </div>

                <div
                  className="grid grid-cols-2 gap-2.5"
                  role="radiogroup"
                  aria-label="اختيار الصف الدراسي"
                >
                  {grades.map((grade) => {
                    const isSelected = selectedGradeId === grade.id;
                    return (
                      <button
                        key={grade.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          onSelectGrade(grade);
                          setSelectionHint(null);
                        }}
                        className={`min-h-[46px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-[#091B40] border-[#091B40] text-white dark:bg-[#800B34] dark:border-[#800B34]"
                            : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#091B40] dark:text-slate-200 hover:border-[#091B40] dark:hover:border-[#FB7185]"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        <span>{formatGradeShortLabel(grade.code, grade.name)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: School Category Selection (Unselected for new visitors) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#091B40] dark:text-white">
                    <School className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />
                    <span>2. بتدرس فين؟</span>
                  </span>
                  {selectedGradeId && !selectedCategory && (
                    <span className="text-[11px] font-semibold text-[#800B34] dark:text-[#FB7185]">
                      اختار نوع المدرسة
                    </span>
                  )}
                </div>

                <div
                  className="grid grid-cols-2 gap-2.5"
                  role="radiogroup"
                  aria-label="اختيار نوع المدرسة"
                >
                  {(
                    [
                      { id: "ARABIC" as const, label: "مدارس عربي" },
                      { id: "LANGUAGES" as const, label: "مدارس لغات" },
                    ]
                  ).map((option) => {
                    const isSelected = selectedCategory === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          onSelectCategory(option.id);
                          setSelectionHint(null);
                        }}
                        className={`min-h-[46px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-[#091B40] border-[#091B40] text-white dark:bg-[#800B34] dark:border-[#800B34]"
                            : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#091B40] dark:text-slate-200 hover:border-[#091B40] dark:hover:border-[#FB7185]"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Guided Action */}
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  className={`w-full min-h-[48px] px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isSelectionComplete
                      ? "bg-[#800B34] hover:bg-[#680829] text-white shadow-sm"
                      : "bg-[#091B40] hover:bg-[#12263F] text-white"
                  }`}
                >
                  <span>عرض المواد والدروس</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {selectionHint ? (
                  <p className="text-xs font-bold text-[#800B34] dark:text-[#FB7185] text-center">
                    {selectionHint}
                  </p>
                ) : (
                  <p className="text-xs text-[#536681] dark:text-[#94A3B8] text-center">
                    اختار الصف ونوع المدرسة للانتقال إلى المواد المتاحة.
                  </p>
                )}
              </div>

              {/* Mobile Direct Code Entry & Registration Bar (Independent CTA) */}
              <div className="lg:hidden pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-2 text-xs">
                {loggedInUser ? (
                  <Link
                    href={isStaff ? "/admin" : "/dashboard"}
                    className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#091B40] text-white font-bold flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{isStaff ? "فتح لوحة التحكم" : "ادخل لوحة الطالب"}</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="min-h-[44px] px-3 py-2 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] font-bold text-[#800B34] dark:text-[#FB7185] inline-flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>معاك كود طالب؟ ادخل بالكود</span>
                    </Link>

                    <Link
                      href="/subscription"
                      className="min-h-[44px] px-2.5 py-2 font-bold text-[#091B40] dark:text-slate-200 hover:underline inline-flex items-center gap-1"
                    >
                      <span>طالب جديد؟ سجل واشترك</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
