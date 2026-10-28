"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, CheckCircle2, Lock } from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface AcademicTrack {
  id: string;
  name: string;
  code: string;
}

interface Grade {
  id: string;
  name: string;
  code: string;
  tracks: AcademicTrack[];
}

interface EducationalSystem {
  id: string;
  name: string;
  code: string;
  grades: Grade[];
}

interface SetupFormProps {
  systems: EducationalSystem[];
  userId: string;
}

export function SetupForm({ systems }: SetupFormProps) {
  const router = useRouter();
  const [systemId, setSystemId] = useState(systems[0]?.id || "");
  const [gradeId, setGradeId] = useState("");
  const [schoolCategory, setSchoolCategory] = useState<"ARABIC" | "LANGUAGES">("ARABIC");
  const [trackId, setTrackId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedSystem = systems.find((s) => s.id === systemId) || systems[0];
  const availableGrades = selectedSystem?.grades || [];
  const selectedGrade = availableGrades.find((g) => g.id === gradeId);
  const availableTracks = selectedGrade?.tracks || [];
  const requiresTrack = Boolean(selectedGrade && availableTracks.length > 0);

  // Active step computation: 1 (Grade), 2 (Category), 3 (Track)
  const currentStep = !gradeId ? 1 : !schoolCategory ? 2 : requiresTrack && !trackId ? 3 : 3;

  const canSubmit =
    Boolean(systemId && gradeId && schoolCategory && (!requiresTrack || trackId));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId,
          gradeId,
          schoolCategory,
          trackId: requiresTrack ? trackId : null,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "تعذر حفظ البيانات، حاول مرة أخرى");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم، تأكد من الاتصال وجرب مجددًا");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    {
      num: 1,
      title: "الصف الدراسي",
      isCompleted: Boolean(gradeId),
      isActive: currentStep === 1,
    },
    {
      num: 2,
      title: "نوع المدرسة",
      isCompleted: Boolean(gradeId && schoolCategory),
      isActive: currentStep === 2,
    },
    {
      num: 3,
      title: "الشعبة / المسار",
      isCompleted: Boolean(gradeId && (!requiresTrack || trackId)),
      isActive: currentStep === 3,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7 text-right">
      {/* 1. Step Progress Indicators */}
      <div className="grid grid-cols-3 gap-2 border-b border-[#E5E7EB] dark:border-[#334155] pb-5">
        {stepsMeta.map((s) => {
          let badgeStyle =
            "bg-[#F3F4F6] dark:bg-[#1E293B] text-[#94A3B8] border-transparent";
          if (s.isCompleted) {
            badgeStyle =
              "bg-[#059669]/10 text-[#059669] dark:text-[#34D399] border-[#059669]/30";
          } else if (s.isActive) {
            badgeStyle =
              "bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] border-[#800020]/30 font-bold";
          }

          return (
            <div
              key={s.num}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-[13px] border transition-all text-center ${badgeStyle}`}
            >
              {s.isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[11px] font-mono shrink-0">
                  {s.num}
                </span>
              )}
              <span className="truncate">{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* 2. Step 1: Grade Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs sm:text-sm font-bold text-[#12263F] dark:text-[#F8FAFC]">
            ١. اختر صفك الدراسي
          </label>
          {gradeId && (
            <span className="text-xs text-[#059669] dark:text-[#34D399] font-bold">
              تم التحديد ✓
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {availableGrades.map((grade) => {
            const isSelected = gradeId === grade.id;
            return (
              <button
                key={grade.id}
                type="button"
                onClick={() => {
                  setGradeId(grade.id);
                  setTrackId("");
                }}
                className={`p-4 rounded-xl border text-right transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "border-[#800020] dark:border-[#FB7185] bg-[#800020]/5 dark:bg-[#800020]/20 text-[#800020] dark:text-[#FB7185] shadow-xs"
                    : "border-[#E5E7EB] dark:border-[#334155] hover:border-[#800020]/40 bg-white dark:bg-[#0F172A] text-[#12263F] dark:text-[#F8FAFC]"
                }`}
              >
                <div className="min-w-0 flex-1 leading-snug">
                  <BidiStatement as="span" text={grade.name} className="text-xs sm:text-[13px] font-bold block" />
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 block">
                    {grade.code === "bacc_g10" ? "الصف العاشر — شهادة البكالوريا" : "الصف الحادي عشر — شهادة البكالوريا"}
                  </span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "border-[#800020] dark:border-[#FB7185] bg-[#800020] dark:bg-[#FB7185]"
                      : "border-[#D1D5DB] dark:border-[#475569]"
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Step 2: School Category Selection (Mandatory Curriculum Separation) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs sm:text-sm font-bold text-[#12263F] dark:text-[#F8FAFC]">
            ٢. اختر نوع مدرستك (فصل المنهج التعليمي)
          </label>
          {gradeId && schoolCategory && (
            <span className="text-xs text-[#059669] dark:text-[#34D399] font-bold">
              تم التحديد ✓
            </span>
          )}
        </div>

        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
          فصل المنهج إلزامي: يتم تحميل المواد الدراسية، بنك الأسئلة، والمصطلحات بدقة تامة لنوع مدرستك.
        </p>

        {!gradeId ? (
          <div className="p-4 rounded-xl border border-dashed border-[#E5E7EB] dark:border-[#334155] bg-[#F9FAFB] dark:bg-[#1E293B]/40 text-center text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>يرجى اختيار الصف الدراسي أولاً لتفعيل نوع المدرسة</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 animate-in fade-in duration-200">
            {/* Arabic Schools */}
            <button
              type="button"
              onClick={() => setSchoolCategory("ARABIC")}
              className={`p-4 rounded-xl border text-right transition-all flex items-start justify-between gap-3 ${
                schoolCategory === "ARABIC"
                  ? "border-[#059669] dark:border-[#34D399] bg-[#059669]/5 dark:bg-[#059669]/20 text-[#059669] dark:text-[#34D399] shadow-xs"
                  : "border-[#E5E7EB] dark:border-[#334155] hover:border-[#059669]/40 bg-white dark:bg-[#0F172A] text-[#12263F] dark:text-[#F8FAFC]"
              }`}
            >
              <div>
                <span className="text-xs sm:text-[13px] font-bold block text-[#0F172A] dark:text-white">
                  مدارس عربي (Arabic Schools)
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
                  المنهج والأسئلة والتفسيرات باللغة العربية مع عزل دقيق للمصطلحات الإنجليزية.
                </span>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  schoolCategory === "ARABIC"
                    ? "border-[#059669] bg-[#059669]"
                    : "border-[#D1D5DB] dark:border-[#475569]"
                }`}
              >
                {schoolCategory === "ARABIC" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>

            {/* Language Schools */}
            <button
              type="button"
              onClick={() => setSchoolCategory("LANGUAGES")}
              className={`p-4 rounded-xl border text-right transition-all flex items-start justify-between gap-3 ${
                schoolCategory === "LANGUAGES"
                  ? "border-[#2563EB] dark:border-[#60A5FA] bg-[#2563EB]/5 dark:bg-[#2563EB]/20 text-[#2563EB] dark:text-[#60A5FA] shadow-xs"
                  : "border-[#E5E7EB] dark:border-[#334155] hover:border-[#2563EB]/40 bg-white dark:bg-[#0F172A] text-[#12263F] dark:text-[#F8FAFC]"
              }`}
            >
              <div>
                <span className="text-xs sm:text-[13px] font-bold block text-[#0F172A] dark:text-white">
                  مدارس لغات (Language Schools)
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
                  Curriculum and questions displayed in English with dedicated language question banks.
                </span>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  schoolCategory === "LANGUAGES"
                    ? "border-[#2563EB] bg-[#2563EB]"
                    : "border-[#D1D5DB] dark:border-[#475569]"
                }`}
              >
                {schoolCategory === "LANGUAGES" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 4. Step 3: Track Selection (or confirmation if no track required) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs sm:text-sm font-bold text-[#12263F] dark:text-[#F8FAFC]">
            ٣. الشعبة أو المسار التخصصي
          </label>
          {requiresTrack && trackId && (
            <span className="text-xs text-[#059669] dark:text-[#34D399] font-bold">
              تم التحديد ✓
            </span>
          )}
        </div>

        {!gradeId ? (
          <div className="p-4 rounded-xl border border-dashed border-[#E5E7EB] dark:border-[#334155] bg-[#F9FAFB] dark:bg-[#1E293B]/40 text-center text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>اختر الصف الدراسي أولاً لتحديد ما إذا كان يتطلب شعبة متخصصة</span>
          </div>
        ) : !requiresTrack ? (
          <div className="p-3.5 rounded-xl border border-[#059669]/30 bg-[#059669]/10 text-xs sm:text-[13px] text-[#059669] dark:text-[#34D399] font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>هذا الصف الدراسي عام وموحد ولا يتطلب اختيار شعبة. يمكنك المتابعة مباشرة.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 animate-in fade-in duration-200">
            {availableTracks.map((track) => {
              const isSelected = trackId === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setTrackId(track.id)}
                  className={`p-3.5 sm:p-4 rounded-xl border text-right transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-[#800020] dark:border-[#E11D48] bg-[#800020]/5 dark:bg-[#800020]/20 text-[#800020] dark:text-[#FB7185] shadow-xs"
                      : "border-[#E5E7EB] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 bg-white dark:bg-[#0F172A] text-[#12263F] dark:text-[#F8FAFC]"
                  }`}
                >
                  <div className="min-w-0 flex-1 leading-snug break-words">
                    <BidiStatement as="span" text={track.name} className="text-xs sm:text-[13px] font-bold block" />
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-[#800020] dark:border-[#E11D48] bg-[#800020] dark:bg-[#E11D48]"
                        : "border-[#D1D5DB] dark:border-[#475569]"
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-xs sm:text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] text-center">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full h-11 sm:h-12 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جارٍ حفظ بياناتك وتجهيز لوحة التحكم...</span>
            </>
          ) : (
            <>
              <span>تأكيد ومتابعة للوحة التحكم</span>
              <ChevronLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}