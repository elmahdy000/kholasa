"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Subject, ExamItem } from "./types";

interface ExamCreateFormProps {
  subjects: Subject[];
  isStandaloneRoute?: boolean;
  onClose?: () => void;
  onExamCreated?: (newExam: ExamItem) => void;
}

export function ExamCreateForm({
  subjects,
  isStandaloneRoute = false,
  onClose,
  onExamCreated,
}: ExamCreateFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [unitId, setUnitId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [isPractice, setIsPractice] = useState(false);
  const [randomCount, setRandomCount] = useState(10);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeSubject = subjects.find((s) => s.id === subjectId);
  const availableUnits = activeSubject?.units || [];
  const activeUnit = availableUnits.find((u) => u.id === unitId);
  const availableLessons = activeUnit?.lessons || [];

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          subjectId,
          durationMinutes: Number(durationMinutes),
          isPractice,
          randomQuestionCount: Number(randomCount),
          unitId: unitId || null,
          lessonId: lessonId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إنشاء الامتحان");
      }

      if (onExamCreated) {
        onExamCreated({
          ...data.exam,
          subject: subjects.find((s) => s.id === subjectId) || {
            id: subjectId,
            name: "المادة",
          },
          questionsCount: Number(randomCount),
          attemptsCount: 0,
          avgPercentage: 0,
        });
      }

      if (isStandaloneRoute) {
        router.push("/admin/exams");
      } else if (onClose) {
        onClose();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ أثناء الإنشاء");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 space-y-5 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155] font-sans">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
        <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          {isStandaloneRoute && (
            <button
              type="button"
              onClick={() => router.push("/admin/exams")}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer ml-1"
              title="العودة لقائمة الامتحانات"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <Award className="w-5 h-5 text-[#800020]" />
          <span>إنشاء امتحان رسمي جديد</span>
        </h3>
        {!isStandaloneRoute && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] text-[13px] font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleCreateExam} className="space-y-4">
        <div>
          <label className="block text-[13px] font-bold text-[#64748B] mb-1">
            عنوان الامتحان *
          </label>
          <input
            type="text"
            required
            placeholder="مثال: امتحان شامل على الباب الأول - الفيزياء الكهربية"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#64748B] mb-1">
            وصف الامتحان (اختياري)
          </label>
          <textarea
            rows={2}
            placeholder="ملاحظات أو إرشادات للطالب قبل بدء الامتحان..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium resize-none text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1">
              المادة الدراسية *
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setUnitId("");
                setLessonId("");
              }}
              className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1">
              مدة الامتحان (بالدقائق) *
            </label>
            <input
              type="number"
              min={5}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            />
          </div>
        </div>

        {/* Scope: Unit & Lesson */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]">
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] mb-1">
              الوحدة الدراسية (اختياري)
            </label>
            <select
              value={unitId}
              onChange={(e) => {
                setUnitId(e.target.value);
                setLessonId("");
              }}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            >
              <option value="">امتحان شامل لكل وحدات المادة</option>
              {availableUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#64748B] mb-1">
              الدرس المستهدف (اختياري)
            </label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              disabled={!unitId}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white disabled:opacity-50 focus:outline-none focus:border-[#800020]"
            >
              <option value="">جميع دروس الوحدة المحددة</option>
              {availableLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1">
              نوع الامتحان
            </label>
            <select
              value={isPractice ? "practice" : "exam"}
              onChange={(e) => setIsPractice(e.target.value === "practice")}
              className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            >
              <option value="exam">امتحان رسمي بوقت محدد</option>
              <option value="practice">وضع تدريب بشرح فوري لكل سؤال</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1">
              عدد الأسئلة العشوائية المبدئية
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={randomCount}
              onChange={(e) => setRandomCount(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            />
            <span className="text-[13px] text-[#94A3B8] mt-1 block">
              يمكنك لاحقاً إضافة أسئلة محددة من بنك الأسئلة
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-end gap-3">
          {!isStandaloneRoute && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
            >
              إلغاء
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/admin/exams")}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
            >
              العودة لقائمة الامتحانات
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جارٍ إنشاء الامتحان...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد الإنشاء</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
