"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";

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

export function SetupForm({ systems, userId }: SetupFormProps) {
  const router = useRouter();
  const [systemId, setSystemId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [trackId, setTrackId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedSystem = systems.find((s) => s.id === systemId);
  const availableGrades = selectedSystem?.grades || [];
  const selectedGrade = availableGrades.find((g) => g.id === gradeId);
  const availableTracks = selectedGrade?.tracks || [];
  const requiresTrack = availableTracks.length > 0;

  const canSubmit =
    systemId && gradeId && (!requiresTrack || trackId);

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
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((step) => {
          const isActive =
            step === 1
              ? !!systemId
              : step === 2
              ? !!gradeId
              : !requiresTrack || !!trackId;

          return (
            <div
              key={step}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 border border-[#4F46E5]/30"
                  : "bg-slate-100 dark:bg-zinc-900 text-slate-400 border border-transparent"
              }`}
            >
              {isActive ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] font-mono">
                  {step}
                </span>
              )}
              <span>
                {step === 1
                  ? "النظام الدراسي"
                  : step === 2
                  ? "الصف الدراسي"
                  : "الشعبة / المسار"}
              </span>
            </div>
          );
        })}
      </div>

      {/* System Selection */}
      <div className="space-y-3">
        <label className="block text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
          اختر نظامك الدراسي
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {systems.map((sys) => (
            <button
              key={sys.id}
              onClick={() => {
                setSystemId(sys.id);
                setGradeId("");
                setTrackId("");
              }}
              className={`p-4 rounded-xl border text-right transition-all interactive-tap ${
                systemId === sys.id
                  ? "border-[#4F46E5] bg-indigo-50/50 dark:bg-indigo-950/30 text-[#4F46E5] dark:text-indigo-400 shadow-2xs"
                  : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 text-[#0F172A] dark:text-white"
              }`}
            >
              <span className="text-xs sm:text-sm font-bold block">
                {sys.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grade Selection */}
      {availableGrades.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="block text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
            اختر صفك الدراسي
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableGrades.map((grade) => (
              <button
                key={grade.id}
                onClick={() => {
                  setGradeId(grade.id);
                  setTrackId("");
                }}
                className={`p-4 rounded-xl border text-right transition-all interactive-tap ${
                  gradeId === grade.id
                    ? "border-[#4F46E5] bg-indigo-50/50 dark:bg-indigo-950/30 text-[#4F46E5] dark:text-indigo-400 shadow-2xs"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 text-[#0F172A] dark:text-white"
                }`}
              >
                <span className="text-xs sm:text-sm font-bold block">
                  {grade.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Track Selection (if applicable) */}
      {requiresTrack && gradeId && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="block text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
            اختر شعبتك أو مسارك الدراسي
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => setTrackId(track.id)}
                className={`p-4 rounded-xl border text-right transition-all interactive-tap ${
                  trackId === track.id
                    ? "border-[#4F46E5] bg-indigo-50/50 dark:bg-indigo-950/30 text-[#4F46E5] dark:text-indigo-400 shadow-2xs"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 text-[#0F172A] dark:text-white"
                }`}
              >
                <span className="text-xs sm:text-sm font-bold block">
                  {track.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs font-bold text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full h-11 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs sm:text-sm shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 interactive-tap"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جارٍ إعداد حسابك...</span>
          </>
        ) : (
          <>
            <span>ابدأ رحلة التعلم</span>
            <ChevronLeft className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}