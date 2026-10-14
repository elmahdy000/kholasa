"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  Clock,
  HelpCircle,
  Users,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Eye,
  EyeOff,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color?: string | null;
  questionsCount?: number;
}

interface ExamItem {
  id: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  isPractice: boolean;
  subject: {
    id: string;
    name: string;
    color?: string | null;
  };
  questionsCount: number;
  attemptsCount: number;
  avgPercentage: number;
  createdAt: string | Date;
}

interface ExamManagerClientProps {
  initialExams: ExamItem[];
  subjects: Subject[];
}

export function ExamManagerClient({
  initialExams,
  subjects,
}: ExamManagerClientProps) {
  const [exams, setExams] = useState<ExamItem[]>(initialExams);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [isPractice, setIsPractice] = useState(false);
  const [randomCount, setRandomCount] = useState(10);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Toggle Exam Mode (Official Exam vs Practice)
  const handleTogglePractice = async (examId: string, currentIsPractice: boolean) => {
    try {
      setExams((prev) =>
        prev.map((e) =>
          e.id === examId ? { ...e, isPractice: !currentIsPractice } : e
        )
      );

      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPractice: !currentIsPractice }),
      });

      if (!res.ok) {
        setExams((prev) =>
          prev.map((e) =>
            e.id === examId ? { ...e, isPractice: currentIsPractice } : e
          )
        );
      }
    } catch {
      setExams((prev) =>
        prev.map((e) =>
          e.id === examId ? { ...e, isPractice: currentIsPractice } : e
        )
      );
    }
  };

  // Delete Exam
  const handleDeleteExam = async (examId: string, examTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف الامتحان: "${examTitle}"؟`)) return;

    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExams((prev) => prev.filter((e) => e.id !== examId));
      } else {
        alert("تعذر حذف الامتحان، يرجى المحاولة لاحقاً");
      }
    } catch {
      alert("حدث خطأ أثناء حذف الامتحان");
    }
  };

  // Handle Create
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) {
      setErrorMsg("يرجى إدخال عنوان الامتحان وتحديد المادة");
      return;
    }

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
          isPractice: Boolean(isPractice),
          randomQuestionsCount: Number(randomCount),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر إنشاء الامتحان");
      }

      setExams([data.exam, ...exams]);
      setIsCreateOpen(false);

      // Reset
      setTitle("");
      setDescription("");
      setDurationMinutes(30);
      setIsPractice(false);
      setRandomCount(10);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء الإنشاء");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExams = exams.filter((e) => {
    if (selectedSubjectId !== "all" && e.subject.id !== selectedSubjectId)
      return false;
    if (selectedType === "exam" && e.isPractice) return false;
    if (selectedType === "practice" && !e.isPractice) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchSubject = e.subject.name.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Action Header & Filters */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Bar */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن امتحان أو مادة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-9 pl-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل المواد الدراسية</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل التصنيفات</option>
            <option value="exam">امتحانات رسمية بمؤقت</option>
            <option value="practice">تدريبات تكيفية فورية</option>
          </select>
        </div>

        {/* Create Exam CTA */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء امتحان رسمي جديد</span>
        </button>
      </div>

      {/* Counter */}
      <div className="text-xs font-bold text-slate-500 px-1">
        عرض {filteredExams.length} من أصل {exams.length} امتحان
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-[#0F172A] dark:text-white">
            لا توجد امتحانات مطابقة للبحث
          </h3>
          <p className="text-xs text-slate-400">
            جرّب تغيير فلاتر التصفية أو أنشئ امتحاناً جديداً للطلاب.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-slate-800/80 transition-all shadow-xs flex flex-col justify-between space-y-4"
            >
              {/* Header & Badges */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white"
                    style={{ backgroundColor: exam.subject.color || "#4F46E5" }}
                  >
                    {exam.subject.name}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                      !exam.isPractice
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200/40"
                        : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border border-indigo-200/40"
                    }`}
                  >
                    {!exam.isPractice ? "امتحان تقييمي بمؤقت" : "تدريب تكيفي فوري"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-[#0F172A] dark:text-white leading-snug">
                    {exam.title}
                  </h3>
                  {exam.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    المدة
                  </span>
                  <span className="text-xs font-black text-[#0F172A] dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {exam.durationMinutes} د
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    الأسئلة
                  </span>
                  <span className="text-xs font-black text-[#0F172A] dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                    {exam.questionsCount}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    المحاولات
                  </span>
                  <span className="text-xs font-black text-[#0F172A] dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                    <Users className="w-3 h-3 text-slate-400" />
                    {exam.attemptsCount}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  href={`/exams/${exam.id}`}
                  target="_blank"
                  className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-indigo-500" />
                  <span>معاينة كطالب</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePractice(exam.id, exam.isPractice)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600"
                    title="التبديل بين وضع الامتحان والتدريب"
                  >
                    تبديل الوضع
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam.id, exam.title)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="حذف الامتحان"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-8 space-y-5 text-right shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>إنشاء امتحان رسمي جديد</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  عنوان الامتحان *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: امتحان شامل على الباب الأول - الفيزياء الكهربية"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  وصف الامتحان (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات أو إرشادات للطالب قبل بدء الامتحان..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    المادة الدراسية *
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    مدة الامتحان (بالدقائق) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    نوع الامتحان
                  </label>
                  <select
                    value={isPractice ? "practice" : "exam"}
                    onChange={(e) => setIsPractice(e.target.value === "practice")}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  >
                    <option value="exam">امتحان رسمي تقييمي بمؤقت</option>
                    <option value="practice">تدريب تكيفي فوري مع التفسير</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    عدد الأسئلة (سحب عشوائي من البنك)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={randomCount}
                    onChange={(e) => setRandomCount(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الإنشاء..." : "حفظ وإنشاء الامتحان"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
