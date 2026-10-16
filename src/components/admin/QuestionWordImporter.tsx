"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Download,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  BookOpen,
  ArrowRight,
  Search,
  Check,
  X,
  FileSpreadsheet,
  Filter,
  Layers,
  GraduationCap,
  Loader2,
  HelpCircle,
  Eye,
  Settings2,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import {
  ParsedQuestion,
  QuestionType,
  QuestionDifficulty,
  parseQuestionsFromText,
} from "@/lib/question-parser";

export interface LessonItem {
  id: string;
  title: string;
}

export interface UnitItem {
  id: string;
  title: string;
  lessons?: LessonItem[];
}

export interface SubjectItem {
  id: string;
  name: string;
  units: UnitItem[];
}

interface QuestionWordImporterProps {
  subjects: SubjectItem[];
  initialSubjectId?: string;
  initialUnitId?: string;
  initialLessonId?: string;
  onSuccess?: () => void;
  isModal?: boolean;
}

export function QuestionWordImporter({
  subjects,
  initialSubjectId,
  initialUnitId,
  initialLessonId,
  onSuccess,
  isModal = false,
}: QuestionWordImporterProps) {
  const router = useRouter();

  // Target Destination
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || ""
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    initialUnitId || ""
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    initialLessonId || ""
  );

  // Active Subject & Unit objects
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
  const activeUnit = activeSubject?.units.find((u) => u.id === selectedUnitId);

  // Input Mode: Word File, Direct Paste, CSV
  const [inputMode, setInputMode] = useState<"word" | "paste" | "csv">("word");
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parsed Questions State
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(
    new Set()
  );

  // Filtering & Search in Preview
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "valid" | "invalid">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to re-evaluate question validity after user edits
  const revalidateQuestion = (q: ParsedQuestion): ParsedQuestion => {
    const notes: string[] = [];
    let isValid = true;

    if (!q.statement || q.statement.trim().length < 3) {
      isValid = false;
      notes.push("نص السؤال قصير جداً أو غير مكتمل");
    }

    if (q.type === "MCQ") {
      if (q.options.length < 2) {
        isValid = false;
        notes.push("السؤال الاختياري يتطلب خيارين على الأقل");
      } else if (!q.options.some((o) => o.isCorrect)) {
        isValid = false;
        notes.push("لم يتم تحديد الإجابة الصحيحة");
      }
    } else if (q.type === "TRUE_FALSE") {
      if (!q.options.some((o) => o.isCorrect)) {
        isValid = false;
        notes.push("يرجى تحديد ما إذا كانت العبارة صواب أو خطأ");
      }
    }

    return {
      ...q,
      isValid,
      validationNotes: notes,
    };
  };

  // Upload & Parse Word File
  const handleWordFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setSubmitError(null);
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/questions/parse-docx", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل قراءة ملف الوورد");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error(
          "لم يتم العثور على أي أسئلة بصيغة مفهومة في الملف. تأكد من أن الأسئلة تبدأ بأرقام أو (س:) والخيارات بأحرف (أ، ب، ج، د)."
        );
      }

      setQuestions(data.questions);
      // Select all by default
      setSelectedQuestionIds(
        new Set(data.questions.map((q: ParsedQuestion) => q.id))
      );
    } catch (err: any) {
      setParseError(err.message || "حدث خطأ أثناء معالجة ملف الوورد");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Direct Text Parse
  const handleDirectTextParse = () => {
    if (!pastedText.trim()) return;

    setParseError(null);
    setSubmitError(null);
    setIsParsing(true);

    try {
      const parsed = parseQuestionsFromText(pastedText);
      if (parsed.length === 0) {
        throw new Error(
          "لم يتم استخراج أي أسئلة من النص المدخل. تأكد من ترقيم الأسئلة والخيارات."
        );
      }
      setQuestions(parsed);
      setSelectedQuestionIds(new Set(parsed.map((q) => q.id)));
    } catch (err: any) {
      setParseError(err.message || "فشل تحليل النص");
    } finally {
      setIsParsing(false);
    }
  };

  // CSV Parsing
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (content) {
          const lines = content
            .split(/\r?\n/)
            .filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            throw new Error("ملف CSV فارغ أو لا يحتوي على أسطر بيانات كافية");
          }
          const dataLines = lines.slice(1);
          const parsed: ParsedQuestion[] = [];

          dataLines.forEach((line, idx) => {
            const cells: string[] = [];
            let cur = "";
            let inQuotes = false;
            for (let j = 0; j < line.length; j++) {
              const char = line[j];
              if (char === '"' && (j === 0 || line[j - 1] !== "\\")) {
                inQuotes = !inQuotes;
              } else if (char === "," && !inQuotes) {
                cells.push(cur.trim().replace(/^"|"$/g, ""));
                cur = "";
              } else {
                cur += char;
              }
            }
            cells.push(cur.trim().replace(/^"|"$/g, ""));

            if (cells.length < 4 || !cells[0]) return;

            const statement = cells[0];
            const rawType = (cells[1] || "MCQ").toUpperCase();
            const type: QuestionType =
              rawType.includes("TRUE") || rawType.includes("صح")
                ? "TRUE_FALSE"
                : rawType.includes("ESSAY") || rawType.includes("مقال")
                ? "ESSAY"
                : "MCQ";

            const options: { text: string; isCorrect: boolean }[] = [];
            if (cells[3]) {
              options.push({
                text: cells[3],
                isCorrect:
                  cells[4]?.toLowerCase() === "true" ||
                  cells[4] === "نعم" ||
                  cells[4] === "1",
              });
            }
            if (cells[6]) {
              options.push({
                text: cells[6],
                isCorrect:
                  cells[7]?.toLowerCase() === "true" ||
                  cells[7] === "نعم" ||
                  cells[7] === "1",
              });
            }
            if (cells[9]) {
              options.push({
                text: cells[9],
                isCorrect:
                  cells[10]?.toLowerCase() === "true" ||
                  cells[10] === "نعم" ||
                  cells[10] === "1",
              });
            }
            if (cells[12]) {
              options.push({
                text: cells[12],
                isCorrect:
                  cells[13]?.toLowerCase() === "true" ||
                  cells[13] === "نعم" ||
                  cells[13] === "1",
              });
            }

            const q: ParsedQuestion = {
              id: "csv_" + idx + "_" + Math.random().toString(36).substring(2, 7),
              statement,
              type,
              difficulty: "MEDIUM",
              options,
              concept: cells[15] || undefined,
              correctReason: cells[16] || undefined,
              isValid: true,
              validationNotes: [],
            };
            parsed.push(revalidateQuestion(q));
          });

          setQuestions(parsed);
          setSelectedQuestionIds(new Set(parsed.map((q) => q.id)));
        }
      } catch (err: any) {
        setParseError(err.message || "حدث خطأ أثناء قراءة ملف CSV");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // Download Sample Word / Text Template
  const handleDownloadSample = () => {
    const sampleText = `نموذج استرشادي لرفع الأسئلة إلى منصة خلاصة
--------------------------------------------------

س1: ما هي عاصمة جمهورية مصر العربية؟
أ) الإسكندرية
ب) القاهرة*
ج) الجيزة
د) أسوان
التفسير: القاهرة هي العاصمة الإدارية والسياسية الرسمية لمصر.
المفهوم: الجغرافيا السياسية

2- تتكون جزيئات الماء من:
(أ) ذرة هيدروجين وذرة أكسجين
(ب) ذرتي هيدروجين وذرة أكسجين
(ج) ذرتي نيتروجين
(د) ثلاث ذرات هيدروجين
الإجابة الصحيحة: ب

س3: الشمس هي أقرب النجوم إلى كوكب الأرض. (صح)

س4: ينتقل الصوت في الفراغ أسرع من الهواء. (خطأ)
التعليل: الصوت موجة ميكانيكية يلزم لانتشارها وجود وسط مادي ولا ينتقل في الفراغ.

س5: علل لما يأتي:
تعتبر الغابات الاستوائية رئة كوكب الأرض.
الإجابة النموذجية: لأنها تمتص كميات هائلة من غاز ثاني أكسيد الكربون من الغلاف الجوي وتنتج غاز الأكسجين أثناء عملية البناء الضوئي.
`;

    const blob = new Blob(["\uFEFF" + sampleText], {
      type: "text/plain;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kholasa_questions_sample.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update a question in state
  const updateQuestion = (
    id: string,
    updater: (prev: ParsedQuestion) => ParsedQuestion
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const updated = updater(q);
          return revalidateQuestion(updated);
        }
        return q;
      })
    );
  };

  // Delete a question from preview
  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Selection handlers
  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedQuestionIds(new Set(questions.map((q) => q.id)));
  };

  const deselectAll = () => {
    setSelectedQuestionIds(new Set());
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    if (filterType !== "all" && q.type !== filterType) return false;
    if (filterStatus === "valid" && !q.isValid) return false;
    if (filterStatus === "invalid" && q.isValid) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchStatement = q.statement.toLowerCase().includes(query);
      const matchOption = q.options.some((o) =>
        o.text.toLowerCase().includes(query)
      );
      const matchConcept = q.concept?.toLowerCase().includes(query);
      if (!matchStatement && !matchOption && !matchConcept) return false;
    }
    return true;
  });

  // Questions selected and valid for commit
  const readyToImportQuestions = questions.filter(
    (q) => selectedQuestionIds.has(q.id) && q.isValid
  );
  const selectedCount = selectedQuestionIds.size;
  const validCount = questions.filter((q) => q.isValid).length;
  const invalidCount = questions.filter((q) => !q.isValid).length;

  // Commit Questions to Database
  const handleCommitQuestions = async () => {
    if (readyToImportQuestions.length === 0) return;

    if (!selectedSubjectId) {
      setSubmitError("يرجى اختيار المادة المستهدفة أولاً");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = readyToImportQuestions.map((q) => ({
        statement: q.statement,
        type: q.type,
        difficulty: q.difficulty,
        subjectId: q.subjectId || selectedSubjectId,
        unitId: q.unitId || selectedUnitId || undefined,
        lessonId: q.lessonId || selectedLessonId || undefined,
        concept: q.concept,
        correctReason: q.correctReason,
        modelAnswer: q.modelAnswer,
        points: q.points || (q.type === "ESSAY" ? 5 : 1),
        options: q.options.map((o, idx) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          explanation: o.explanation,
          order: idx + 1,
        })),
      }));

      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل استيراد الأسئلة في بنك الأسئلة");
      }

      setSubmitSuccess(data.importedCount);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setSubmitError(err.message || "حدث خطأ غير متوقع أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section (if not in compact modal) */}
      {!isModal && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div>
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#4F46E5] mb-2 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لبنك الأسئلة</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-[#14243D] dark:text-white flex items-center gap-2.5">
              <span>استيراد الأسئلة الذكي من ملفات الوورد</span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] border border-indigo-200/50 dark:border-indigo-800/50">
                Word (.docx)
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
              ارفع أي ملف وورد أو الصق الأسئلة ليتم استخراجها وتصنيفها تلقائياً
              مع معاينة تفاعلية وتعديل كامل قبل الحفظ في البنك أو ربطها بالدرس
            </p>
          </div>

          <button
            onClick={handleDownloadSample}
            type="button"
            className="h-10 px-4 rounded-xl bg-white dark:bg-[#111A2B] border border-slate-200 dark:border-zinc-800 text-xs font-bold text-[#14243D] dark:text-white hover:border-[#4F46E5] flex items-center gap-2 shadow-xs transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-[#4F46E5]" />
            <span>تحميل نموذج الأسئلة الاسترشادي</span>
          </button>
        </div>
      )}

      {/* Success Celebration View */}
      {submitSuccess !== null ? (
        <div className="p-8 sm:p-10 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
              تم استيراد وحفظ {submitSuccess} سؤال بنجاح!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto mt-2">
              تم ربط الأسئلة بـ:{" "}
              <span className="font-bold underline">
                {activeSubject?.name || "المادة المحددة"}
              </span>
              {activeUnit && <span> • {activeUnit.title}</span>}
              {selectedLessonId && (
                <span>
                  {" "}
                  •{" "}
                  {
                    activeUnit?.lessons?.find((l) => l.id === selectedLessonId)
                      ?.title
                  }
                </span>
              )}
              ، وأصبحت متوفرة للاختبارات الفورية وتدريبات الطلاب.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/admin/questions"
              className="h-11 px-6 rounded-xl bg-[#4F46E5] text-white text-xs font-black flex items-center gap-2 shadow-md hover:bg-[#4338CA] transition-all"
            >
              <span>الانتقال لبنك الأسئلة</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
            <button
              onClick={() => {
                setSubmitSuccess(null);
                setQuestions([]);
                setPastedText("");
                setFileName(null);
                setSelectedQuestionIds(new Set());
              }}
              className="h-11 px-5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 transition-colors"
            >
              استيراد ملف وورد آخر
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Step 1: Destination Selector (Subject, Unit, Lesson) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#111A2B] border border-slate-200/90 dark:border-zinc-800/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] flex items-center justify-center text-xs font-black">
                  1
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#14243D] dark:text-white">
                  تحديد وجهة الأسئلة (المادة، الوحدة، والدرس)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                يمكن ربط الأسئلة بالمادة ككل أو بوحدة أو بدرس محدد
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Subject */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
                  المادة المقررة *
                </label>
                <div className="relative">
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedUnitId("");
                      setSelectedLessonId("");
                    }}
                    className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#14243D] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Unit */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
                  الوحدة الدراسية (اختياري)
                </label>
                <div className="relative">
                  <select
                    value={selectedUnitId}
                    onChange={(e) => {
                      setSelectedUnitId(e.target.value);
                      setSelectedLessonId("");
                    }}
                    className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#14243D] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="">بدون وحدة (عام للمادة)</option>
                    {activeSubject?.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                  <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Lesson */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
                  الدرس المستهدف (اختياري)
                </label>
                <div className="relative">
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    disabled={!selectedUnitId || !activeUnit?.lessons?.length}
                    className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#14243D] dark:text-white disabled:opacity-50 focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="">بدون درس محدد (لكل الوحدة)</option>
                    {activeUnit?.lessons?.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Upload or Input Mode */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#111A2B] border border-slate-200/90 dark:border-zinc-800/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] flex items-center justify-center text-xs font-black">
                  2
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#14243D] dark:text-white">
                  طريقة إدخال الأسئلة
                </h3>
              </div>

              {/* Input Mode Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInputMode("word")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    inputMode === "word"
                      ? "bg-white dark:bg-zinc-800 text-[#4F46E5] shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>ملف وورد (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    inputMode === "paste"
                      ? "bg-white dark:bg-zinc-800 text-[#4F46E5] shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>لصق نص مباشر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("csv")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    inputMode === "csv"
                      ? "bg-white dark:bg-zinc-800 text-[#4F46E5] shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ملف CSV</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {parseError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Word File Upload Zone */}
            {inputMode === "word" && (
              <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-[#4F46E5] dark:hover:border-[#4F46E5] rounded-3xl p-8 sm:p-10 text-center transition-all bg-slate-50/50 dark:bg-zinc-900/30">
                <input
                  type="file"
                  id="word-file-input"
                  ref={fileInputRef}
                  accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  onChange={handleWordFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="word-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-md">
                    {isParsing ? (
                      <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
                    ) : (
                      <Upload className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#14243D] dark:text-white block">
                      {isParsing
                        ? "جاري قراءة واستخراج الأسئلة من ملف الوورد..."
                        : fileName
                        ? `تم اختيار: ${fileName} (اضغط للتغيير)`
                        : "اسحب ملف الوورد (.docx) هنا أو اضغط للاختيار"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">
                      يدعم ملفات Word (.docx) ويستخرج أسئلة الاختيار من متعدد،
                      الصح والخطأ، والأسئلة المقالية تلقائياً
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Direct Paste Area */}
            {inputMode === "paste" && (
              <div className="space-y-3">
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="انسخ نصوص الأسئلة من ملف الوورد والصقها هنا مباشرة...&#10;&#10;مثال:&#10;س1: ما هي عاصمة جمهورية مصر العربية؟&#10;أ) الإسكندرية&#10;ب) القاهرة*&#10;ج) الجيزة&#10;د) أسوان&#10;الإجابة: ب"
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-sans text-[#14243D] dark:text-white leading-relaxed focus:outline-none focus:border-[#4F46E5]"
                />
                <button
                  type="button"
                  onClick={handleDirectTextParse}
                  disabled={!pastedText.trim() || isParsing}
                  className="h-10 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 transition-all shadow-sm"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التحليل...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>استخراج الأسئلة من النص الآن</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CSV File Upload Zone */}
            {inputMode === "csv" && (
              <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-emerald-500 rounded-3xl p-8 text-center transition-all bg-slate-50/50 dark:bg-zinc-900/30">
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shadow-xs">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#14243D] dark:text-white block">
                      {fileName ? fileName : "اضغط لاختيار ملف CSV أو اسحبه هنا"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">
                      يقبل ملفات CSV بترميز UTF-8
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Step 3: Interactive Live Preview Screen (معاينة شاملة وتفاعلية قبل الحفظ في البنك) */}
          {questions.length > 0 && (
            <div className="space-y-4 pt-2">
              {/* Summary Statistics Card */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#111A2B] border border-slate-200/90 dark:border-zinc-800/90 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xs font-black">
                        3
                      </div>
                      <h3 className="text-sm font-black text-[#14243D] dark:text-white flex items-center gap-2">
                        <span>معاينة وتعديل الأسئلة قبل الحفظ في البنك</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300">
                          {questions.length} سؤال
                        </span>
                      </h3>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                      راجع كل سؤال، تأكد من الإجابة الصحيحة أو حددها بنقرة واحدة،
                      وعدّل الصياغة والخيارات قبل تأكيد الحفظ
                    </p>
                  </div>

                  {/* Commit Action Button */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={handleCommitQuestions}
                      disabled={readyToImportQuestions.length === 0 || isSubmitting}
                      className="h-11 px-6 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#4F46E5]/25 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>
                            جاري حفظ {readyToImportQuestions.length} سؤال...
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>
                            حفظ {readyToImportQuestions.length} سؤال مختار في
                            البنك
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Badges Bar & Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>جاهز للحفظ: {validCount}</span>
                    </div>

                    {invalidCount > 0 && (
                      <div className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>يتطلب مراجعة: {invalidCount}</span>
                      </div>
                    )}

                    <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

                    <span className="text-[11px] font-bold text-slate-400">
                      MCQ:{" "}
                      {questions.filter((q) => q.type === "MCQ").length} • صح/خطأ:{" "}
                      {questions.filter((q) => q.type === "TRUE_FALSE").length}{" "}
                      • مقالي:{" "}
                      {questions.filter((q) => q.type === "ESSAY").length}
                    </span>
                  </div>

                  {/* Bulk Selection Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-xs font-bold text-[#4F46E5] hover:underline"
                    >
                      تحديد الكل ({questions.length})
                    </button>
                    <span className="text-slate-300 dark:text-zinc-700">•</span>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                {/* Filter and Search Toolbar */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <div className="relative min-w-[200px] flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ابحث في نص السؤال أو الخيارات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pr-8 pl-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#14243D] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#14243D] dark:text-white"
                  >
                    <option value="all">كل الأنواع</option>
                    <option value="MCQ">اختيار من متعدد (MCQ)</option>
                    <option value="TRUE_FALSE">صح أو خطأ</option>
                    <option value="ESSAY">سؤال مقالي</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#14243D] dark:text-white"
                  >
                    <option value="all">كل الحالات</option>
                    <option value="valid">السليمة فقط</option>
                    <option value="invalid">التي تتطلب مراجعة</option>
                  </select>
                </div>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Questions Cards List */}
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#111A2B] rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-400 text-xs font-bold">
                    لا توجد أسئلة تطابق معايير البحث والفلترة
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => {
                    const isSelected = selectedQuestionIds.has(q.id);

                    return (
                      <div
                        key={q.id}
                        className={`p-5 rounded-3xl border transition-all ${
                          !isSelected
                            ? "opacity-60 bg-slate-50/60 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800"
                            : q.isValid
                            ? "bg-white dark:bg-[#111A2B] border-slate-200/90 dark:border-zinc-800 shadow-xs"
                            : "bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-xs"
                        }`}
                      >
                        {/* Top Card Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                          <div className="flex items-center gap-2.5">
                            {/* Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectQuestion(q.id)}
                                className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] border-slate-300 dark:border-zinc-700"
                              />
                              <span className="text-xs font-black text-[#14243D] dark:text-white">
                                سؤال #{idx + 1}
                              </span>
                            </label>

                            {/* Type Switcher Pills */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg text-[10px] font-bold">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(q.id, (prev) => ({
                                    ...prev,
                                    type: "MCQ",
                                    options:
                                      prev.options.length >= 2
                                        ? prev.options
                                        : [
                                            { text: "", isCorrect: true },
                                            { text: "", isCorrect: false },
                                            { text: "", isCorrect: false },
                                            { text: "", isCorrect: false },
                                          ],
                                  }))
                                }
                                className={`px-2 py-1 rounded-md transition-all ${
                                  q.type === "MCQ"
                                    ? "bg-white dark:bg-zinc-800 text-[#4F46E5] font-black shadow-2xs"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                }`}
                              >
                                اختيار من متعدد
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(q.id, (prev) => ({
                                    ...prev,
                                    type: "TRUE_FALSE",
                                    options: [
                                      { text: "صواب", isCorrect: true },
                                      { text: "خطأ", isCorrect: false },
                                    ],
                                  }))
                                }
                                className={`px-2 py-1 rounded-md transition-all ${
                                  q.type === "TRUE_FALSE"
                                    ? "bg-white dark:bg-zinc-800 text-[#4F46E5] font-black shadow-2xs"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                }`}
                              >
                                صح أو خطأ
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(q.id, (prev) => ({
                                    ...prev,
                                    type: "ESSAY",
                                  }))
                                }
                                className={`px-2 py-1 rounded-md transition-all ${
                                  q.type === "ESSAY"
                                    ? "bg-white dark:bg-zinc-800 text-[#4F46E5] font-black shadow-2xs"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                }`}
                              >
                                مقالي
                              </button>
                            </div>
                          </div>

                          {/* Difficulty & Delete Button */}
                          <div className="flex items-center gap-2">
                            <select
                              value={q.difficulty}
                              onChange={(e) =>
                                updateQuestion(q.id, (prev) => ({
                                  ...prev,
                                  difficulty: e.target.value as QuestionDifficulty,
                                }))
                              }
                              className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[11px] font-bold text-slate-700 dark:text-zinc-300"
                            >
                              <option value="EASY">سهل</option>
                              <option value="MEDIUM">متوسط</option>
                              <option value="HARD">متقدم</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => removeQuestion(q.id)}
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
                              title="حذف هذا السؤال من قائمة الاستيراد"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Statement Input */}
                        <div className="space-y-3 pt-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                              نص السؤال *
                            </label>
                            <textarea
                              rows={2}
                              value={q.statement}
                              onChange={(e) =>
                                updateQuestion(q.id, (prev) => ({
                                  ...prev,
                                  statement: e.target.value,
                                }))
                              }
                              placeholder="أدخل نص السؤال هنا..."
                              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-xs font-bold text-[#14243D] dark:text-white focus:outline-none focus:border-[#4F46E5] leading-relaxed"
                            />
                          </div>

                          {/* MCQ Options Rendering */}
                          {q.type === "MCQ" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                                  خيارات الإجابة (اضغط على الدائرة لتحديد الإجابة
                                  الصحيحة):
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuestion(q.id, (prev) => ({
                                      ...prev,
                                      options: [
                                        ...prev.options,
                                        { text: "", isCorrect: false },
                                      ],
                                    }))
                                  }
                                  className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>إضافة خيار</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => {
                                  const letters = ["أ", "ب", "ج", "د", "هـ", "و"];
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                                        opt.isCorrect
                                          ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                                          : "bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800"
                                      }`}
                                    >
                                      {/* Correct Answer Radio Button */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateQuestion(q.id, (prev) => ({
                                            ...prev,
                                            options: prev.options.map(
                                              (o, idx) => ({
                                                ...o,
                                                isCorrect: idx === oIdx,
                                              })
                                            ),
                                          }))
                                        }
                                        className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all ${
                                          opt.isCorrect
                                            ? "bg-emerald-500 text-white shadow-xs"
                                            : "border-2 border-slate-300 dark:border-zinc-700 hover:border-emerald-400 text-transparent"
                                        }`}
                                        title={
                                          opt.isCorrect
                                            ? "الإجابة الصحيحة"
                                            : "اضغط لتعيينها كإجابة صحيحة"
                                        }
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>

                                      <span className="text-[11px] font-black text-slate-400 shrink-0">
                                        ({letters[oIdx] || oIdx + 1})
                                      </span>

                                      <input
                                        type="text"
                                        value={opt.text}
                                        onChange={(e) =>
                                          updateQuestion(q.id, (prev) => ({
                                            ...prev,
                                            options: prev.options.map(
                                              (o, idx) =>
                                                idx === oIdx
                                                  ? { ...o, text: e.target.value }
                                                  : o
                                            ),
                                          }))
                                        }
                                        placeholder={`الخيار ${
                                          letters[oIdx] || oIdx + 1
                                        }...`}
                                        className="flex-1 bg-transparent border-0 text-xs font-bold text-[#14243D] dark:text-white focus:outline-none"
                                      />

                                      {/* Delete Option */}
                                      {q.options.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateQuestion(q.id, (prev) => ({
                                              ...prev,
                                              options: prev.options.filter(
                                                (_, idx) => idx !== oIdx
                                              ),
                                            }))
                                          }
                                          className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* TRUE_FALSE Options Rendering */}
                          {q.type === "TRUE_FALSE" && (
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">
                                حدد الإجابة الصحيحة للعبارة بالضغط عليها:
                              </label>
                              <div className="grid grid-cols-2 gap-3 max-w-sm">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuestion(q.id, (prev) => ({
                                      ...prev,
                                      options: [
                                        { text: "صواب", isCorrect: true },
                                        { text: "خطأ", isCorrect: false },
                                      ],
                                    }))
                                  }
                                  className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                                    q.options[0]?.isCorrect
                                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                                      : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-emerald-400"
                                  }`}
                                >
                                  <Check className="w-4 h-4" />
                                  <span>صواب (صح)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuestion(q.id, (prev) => ({
                                      ...prev,
                                      options: [
                                        { text: "صواب", isCorrect: false },
                                        { text: "خطأ", isCorrect: true },
                                      ],
                                    }))
                                  }
                                  className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                                    q.options[1]?.isCorrect
                                      ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"
                                      : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-rose-400"
                                  }`}
                                >
                                  <X className="w-4 h-4" />
                                  <span>خطأ</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ESSAY Model Answer Rendering */}
                          {q.type === "ESSAY" && (
                            <div>
                              <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                                الإجابة النموذجية ومعايير التصحيح:
                              </label>
                              <textarea
                                rows={3}
                                value={q.modelAnswer || ""}
                                onChange={(e) =>
                                  updateQuestion(q.id, (prev) => ({
                                    ...prev,
                                    modelAnswer: e.target.value,
                                  }))
                                }
                                placeholder="أدخل الإجابة النموذجية أو عناصر الإجابة المقالية..."
                                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-xs font-bold text-[#14243D] dark:text-white focus:outline-none focus:border-[#4F46E5] leading-relaxed"
                              />
                            </div>
                          )}

                          {/* Educational Concept & Explanation (Collapsible/Optional) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                المفهوم التعليمي (Concept):
                              </label>
                              <input
                                type="text"
                                value={q.concept || ""}
                                onChange={(e) =>
                                  updateQuestion(q.id, (prev) => ({
                                    ...prev,
                                    concept: e.target.value,
                                  }))
                                }
                                placeholder="مثال: قوانين الحركة، الخلية النباتية..."
                                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-[#14243D] dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                تفسير وسبب صحة الإجابة:
                              </label>
                              <input
                                type="text"
                                value={q.correctReason || ""}
                                onChange={(e) =>
                                  updateQuestion(q.id, (prev) => ({
                                    ...prev,
                                    correctReason: e.target.value,
                                  }))
                                }
                                placeholder="شرح مبسط يظهر للطالب عند المراجعة..."
                                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-[#14243D] dark:text-white"
                              />
                            </div>
                          </div>

                          {/* Validation Warning */}
                          {!q.isValid && (
                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{q.validationNotes.join(" • ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Floating Bottom Commit Bar */}
              <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-white/95 dark:bg-[#111A2B]/95 backdrop-blur-md border border-slate-200/90 dark:border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#14243D] dark:text-white block">
                      جاهز لحفظ {readyToImportQuestions.length} سؤال في بنك
                      الأسئلة
                    </span>
                    <span className="text-[11px] text-slate-400">
                      سيتم حفظ الأسئلة وربطها بالمادة المحددة وإتاحتها للاختبارات
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCommitQuestions}
                    disabled={readyToImportQuestions.length === 0 || isSubmitting}
                    className="h-10 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-[#4F46E5]/25 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          تأكيد حفظ {readyToImportQuestions.length} سؤال الآن
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
