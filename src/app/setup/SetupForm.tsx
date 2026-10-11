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
      <div className="flex items-center justify-center gap-3 mb-6">
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                isActive
                  ? "bg-[#6858EA] text-white shadow-md shadow-[#6858EA]/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
            >
              {isActive ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[8px]">
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
        <label className="block text-sm font-black text-[#14243D] dark:text-white">
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
              className={`p-4 rounded-2xl border text-right transition-all ${
                systemId === sys.id
                  ? "border-[#6858EA] bg-[#6858EA]/10 shadow-md shadow-[#6858EA]/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-[#6858EA]/50 bg-white dark:bg-slate-900"
              }`}
            >
              <span
                className={`text-sm font-black block ${
                  systemId === sys.id
                    ? "text-[#6858EA]"
                    : "text-[#14243D] dark:text-white"
                }`}
              >
                {sys.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grade Selection */}
      {availableGrades.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="block text-sm font-black text-[#14243D] dark:text-white">
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
                className={`p-4 rounded-2xl border text-right transition-all ${
                  gradeId === grade.id
                    ? "border-[#11B7B4] bg-[#11B7B4]/10 shadow-md shadow-[#11B7B4]/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-[#11B7B4]/50 bg-white dark:bg-slate-900"
                }`}
              >
                <span
                  className={`text-sm font-black block ${
                    gradeId === grade.id
                      ? "text-[#11B7B4]"
                      : "text-[#14243D] dark:text-white"
                  }`}
                >
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
          <label className="block text-sm font-black text-[#14243D] dark:text-white">
            اختر شعبتك أو مسارك الدراسي
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => setTrackId(track.id)}
                className={`p-4 rounded-2xl border text-right transition-all ${
                  trackId === track.id
                    ? "border-[#FFBA55] bg-[#FFBA55]/10 shadow-md shadow-[#FFBA55]/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-[#FFBA55]/50 bg-white dark:bg-slate-900"
                }`}
              >
                <span
                  className={`text-sm font-black block ${
                    trackId === track.id
                      ? "text-[#FFBA55]"
                      : "text-[#14243D] dark:text-white"
                  }`}
                >
                  {track.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 text-center">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#6858EA] to-[#5444D8] text-white font-black text-sm shadow-lg shadow-[#6858EA]/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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