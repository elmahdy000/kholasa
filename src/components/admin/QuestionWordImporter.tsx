"use client";

import { useState, useRef } from "react";
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
  Layers,
  GraduationCap,
  Loader2,
  HelpCircle,
  Eye,
  FileCheck2,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import {
  ParsedQuestion,
  QuestionType,
  QuestionDifficulty,
  parseQuestionsFromText,
} from "@/lib/question-parser";

export interface TrackItem {
  id: string;
  name: string;
  code: string;
}

export interface GradeItem {
  id: string;
  name: string;
  code: string;
  tracks?: TrackItem[];
}

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
  code?: string;
  gradeId?: string;
  schoolCategory?: "ARABIC" | "LANGUAGES";
  trackId?: string | null;
  grade?: GradeItem;
  track?: TrackItem;
  units: UnitItem[];
}

interface QuestionWordImporterProps {
  subjects: SubjectItem[];
  grades?: GradeItem[];
  initialGradeId?: string;
  initialSchoolCategory?: "ARABIC" | "LANGUAGES";
  initialSubjectId?: string;
  initialUnitId?: string;
  initialLessonId?: string;
  onSuccess?: () => void;
  isModal?: boolean;
}

export function QuestionWordImporter({
  subjects,
  grades,
  initialGradeId,
  initialSchoolCategory,
  initialSubjectId,
  initialUnitId,
  initialLessonId,
  onSuccess,
  isModal = false,
}: QuestionWordImporterProps) {
  const router = useRouter();

  // 1. Grade selection
  const defaultGradeId =
    initialGradeId ||
    subjects.find((s) => s.id === initialSubjectId)?.gradeId ||
    grades?.[0]?.id ||
    subjects[0]?.gradeId ||
    "";
  const [selectedGradeId, setSelectedGradeId] = useState<string>(defaultGradeId);

  // 2. School Category selection
  const defaultCategory =
    initialSchoolCategory ||
    subjects.find((s) => s.id === initialSubjectId)?.schoolCategory ||
    "ARABIC";
  const [selectedSchoolCategory, setSelectedSchoolCategory] = useState<"ARABIC" | "LANGUAGES">(
    defaultCategory
  );

  // 3. Track selection (if applicable)
  const activeGrade = grades?.find((g) => g.id === selectedGradeId);
  const availableTracks = activeGrade?.tracks || [];
  const requiresTrack = Boolean(availableTracks.length > 0);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");

  // 4. Eligible Subjects (filtered strictly by grade & school category & track)
  const eligibleSubjects = subjects.filter((s) => {
    if (selectedGradeId && s.gradeId && s.gradeId !== selectedGradeId) return false;
    if (s.schoolCategory && s.schoolCategory !== selectedSchoolCategory) return false;
    if (requiresTrack && selectedTrackId && s.trackId && s.trackId !== selectedTrackId) return false;
    return true;
  });

  const defaultSubjectId =
    (initialSubjectId && eligibleSubjects.some((s) => s.id === initialSubjectId))
      ? initialSubjectId
      : eligibleSubjects[0]?.id || "";
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(defaultSubjectId);

  // 5. Unit selection
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId || "");
  const activeUnit = activeSubject?.units.find((u) => u.id === selectedUnitId);

  // 6. Scope selection: "LESSON" or "UNIT"
  const [selectedScope, setSelectedScope] = useState<"LESSON" | "UNIT">("LESSON");
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLessonId || "");

  // 7. Question Type (MCQ / TRUE_FALSE / ESSAY)
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>("MCQ");

  // 8. Difficulty (EASY / MEDIUM / HARD / MIXED)
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | "MIXED">("MEDIUM");

  // Handlers for Curriculum Changes
  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedTrackId("");
    const nextSubjects = subjects.filter(
      (s) => (!gradeId || s.gradeId === gradeId) && (!s.schoolCategory || s.schoolCategory === selectedSchoolCategory)
    );
    setSelectedSubjectId(nextSubjects[0]?.id || "");
    setSelectedUnitId("");
    setSelectedLessonId("");
  };

  const handleCategoryChange = (cat: "ARABIC" | "LANGUAGES") => {
    setSelectedSchoolCategory(cat);
    const nextSubjects = subjects.filter(
      (s) => (!selectedGradeId || s.gradeId === selectedGradeId) && (!s.schoolCategory || s.schoolCategory === cat)
    );
    setSelectedSubjectId(nextSubjects[0]?.id || "");
    setSelectedUnitId("");
    setSelectedLessonId("");
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedUnitId("");
    setSelectedLessonId("");
  };

  // Input Mode: File, Direct Paste, CSV
  const [inputMode, setInputMode] = useState<"file" | "paste" | "csv">("file");
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"DOCX" | "PDF" | "MANUAL" | "CSV">("DOCX");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parsed Questions State
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Filtering & Search in Preview
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "valid" | "invalid">("all");
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

  // Upload & Parse Word/PDF File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isDocx = lowerName.endsWith(".docx");
    const isPdf = lowerName.endsWith(".pdf");

    if (!isDocx && !isPdf) {
      setParseError("يرجى رفع ملف بصيغة Word (.docx) أو PDF (.pdf)");
      return;
    }

    setFileName(file.name);
    setFileType(isDocx ? "DOCX" : "PDF");
    setParseError(null);
    setSubmitError(null);
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", selectedQuestionType);
      formData.append("difficulty", selectedDifficulty);
      formData.append("schoolCategory", selectedSchoolCategory);

      const res = await fetch("/api/admin/questions/parse-docx", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل قراءة وتحليل المستند");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error(
          "لم يتم العثور على أي أسئلة صالحة في المستند. تأكد من ترقيم الأسئلة أو وضوح العبارات."
        );
      }

      setQuestions(data.questions);
      setSelectedQuestionIds(new Set(data.questions.map((q: ParsedQuestion) => q.id)));
    } catch (err: any) {
      setParseError(err.message || "حدث خطأ أثناء معالجة المستند");
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
      const parsed = parseQuestionsFromText(pastedText, {
        forcedType: selectedQuestionType,
        forcedDifficulty: selectedDifficulty,
        schoolCategory: selectedSchoolCategory,
      });

      if (parsed.length === 0) {
        throw new Error(
          "لم يتم استخراج أي أسئلة من النص المدخل. تأكد من ترقيم الأسئلة والخيارات."
        );
      }
      setFileName("نص مباشر");
      setFileType("MANUAL");
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
    setFileType("CSV");
    setParseError(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (content) {
          const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            throw new Error("ملف CSV فارغ أو لا يحتوي على أسطر بيانات كافية");
          }
          const dataLines = lines.slice(1);
          const parsed: ParsedQuestion[] = [];

          dataLines.forEach((line) => {
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

            if (cells.length < 2 || !cells[0]) return;

            const statement = cells[0];
            const type = selectedQuestionType;
            const options: { text: string; isCorrect: boolean }[] = [];

            if (type === "MCQ") {
              if (cells[1]) options.push({ text: cells[1], isCorrect: cells[2] === "1" || cells[2]?.toLowerCase() === "true" });
              if (cells[3]) options.push({ text: cells[3], isCorrect: cells[4] === "1" || cells[4]?.toLowerCase() === "true" });
              if (cells[5]) options.push({ text: cells[5], isCorrect: cells[6] === "1" || cells[6]?.toLowerCase() === "true" });
              if (cells[7]) options.push({ text: cells[7], isCorrect: cells[8] === "1" || cells[8]?.toLowerCase() === "true" });
            } else if (type === "TRUE_FALSE") {
              const isLang = selectedSchoolCategory === "LANGUAGES";
              const correctIsFirst = cells[1]?.toLowerCase() === "true" || cells[1] === "صح" || cells[1] === "1";
              options.push(
                { text: isLang ? "True" : "صواب", isCorrect: correctIsFirst },
                { text: isLang ? "False" : "خطأ", isCorrect: !correctIsFirst }
              );
            }

            parsed.push({
              id: "pq_" + Math.random().toString(36).substring(2, 9),
              statement,
              type,
              difficulty: selectedDifficulty !== "MIXED" ? (selectedDifficulty as QuestionDifficulty) : "MEDIUM",
              options,
              modelAnswer: type === "ESSAY" ? cells[1] : undefined,
              isValid: statement.length > 3,
              validationNotes: [],
            });
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
    reader.readAsText(file);
  };

  // Download Sample Guidance
  const handleDownloadSample = () => {
    const isLang = selectedSchoolCategory === "LANGUAGES";
    const sampleText = isLang
      ? `EL KHOLASA - Question Bank Sample Template (${selectedQuestionType})

Subject: ${activeSubject?.name || "Programming, Computational Thinking & AI"}
Category: Language Schools (English Curriculum)

Q1: What is the smallest unit of digital data in computer science?
A) Bit*
B) Byte
C) Kilobyte
D) Megahertz
Answer: A
Explanation: A bit (binary digit) is the fundamental unit of data in binary computation.

Q2: Which operator is used in C++ to access the memory address of an existing variable?
A) *
B) &*
C) ->
D) ::
Answer: B
Explanation: The ampersand operator (&) returns the actual physical memory address.`
      : `منصة الخلاصة - نموذج استرشادي لاستيراد الأسئلة (${selectedQuestionType})

المادة: ${activeSubject?.name || "البرمجة والتفكير الحاسوبي والذكاء الاصطناعي"}
الفئة التعليمية: مدارس عربي

س1: ما هي أصغر وحدة لقياس البيانات الرقمية في الحاسوب؟
أ) البايت (Byte)
ب) البت (Bit)*
ج) الكيلوبايت (KB)
د) الميغاهرتز (MHz)
الإجابة: ب
التفسير: البت (Bit) هو أصغر وحدة تخزين رقمية ويحمل إما القيمة 0 أو 1.

س2: تسمى عملية تجزئة المشكلة الكبيرة المعقدة إلى مشكلات فرعية أصغر وأسهل في الحل:
أ) التجريد (Abstraction)
ب) التعرف على الأنماط (Pattern Recognition)
ج) التفكيك (Decomposition)*
د) الخوارزميات (Algorithms)
الإجابة: ج
التفسير: التفكيك (Decomposition) هو الركن الأساسي الذي يتيح تقسيم المشكلة المعقدة.`;

    const blob = new Blob([sampleText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kholasa_${selectedSchoolCategory.toLowerCase()}_${selectedQuestionType.toLowerCase()}_sample.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle selection
  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
      const matchOption = q.options.some((o) => o.text.toLowerCase().includes(query));
      const matchConcept = q.concept?.toLowerCase().includes(query);
      if (!matchStatement && !matchOption && !matchConcept) return false;
    }
    return true;
  });

  const readyToImportQuestions = questions.filter(
    (q) => selectedQuestionIds.has(q.id) && q.isValid
  );
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
        type: q.type || selectedQuestionType,
        difficulty: q.difficulty || (selectedDifficulty !== "MIXED" ? selectedDifficulty : "MEDIUM"),
        schoolCategory: selectedSchoolCategory,
        subjectId: selectedSubjectId,
        unitId: selectedUnitId || undefined,
        lessonId: selectedScope === "LESSON" ? selectedLessonId || undefined : undefined,
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
        body: JSON.stringify({
          questions: payload,
          batchMeta: {
            fileName: fileName || (inputMode === "paste" ? "نص مباشر" : "مستند أسئلة"),
            fileType: fileName?.toLowerCase().endsWith(".pdf")
              ? "PDF"
              : fileName?.toLowerCase().endsWith(".docx")
              ? "DOCX"
              : inputMode === "csv"
              ? "CSV"
              : "MANUAL",
            questionType: selectedQuestionType,
            difficulty: selectedDifficulty !== "MIXED" ? selectedDifficulty : undefined,
            schoolCategory: selectedSchoolCategory,
            gradeId: selectedGradeId,
            subjectId: selectedSubjectId,
            unitId: selectedUnitId || null,
            lessonId: selectedScope === "LESSON" ? selectedLessonId || null : null,
            trackId: selectedTrackId || null,
          },
        }),
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

  const isLanguageSchool = selectedSchoolCategory === "LANGUAGES";

  return (
    <div className="space-y-6">
      {/* Header section (if not in compact modal) */}
      {!isModal && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <div>
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-[#64748B] hover:text-[#800020] mb-2 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لبنك الأسئلة</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-3">
              <span>استيراد الأسئلة من ملفات Word و PDF</span>
              <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] border border-[#E2E8F0]/50 dark:border-[#E11D48]/50">
                Word (.docx) & PDF (.pdf)
              </span>
            </h1>
            <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
              اتبع المسار الهرمي المنضبط: الصف الدراسي ← فئة المدرسة (عربي / لغات) ← المسار ← المادة ← الوحدة ← الدرس/نطاق الوحدة ← نوع السؤال والصعوبة ← رفع الملف والمعاينة
            </p>
          </div>

          <button
            onClick={handleDownloadSample}
            type="button"
            className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white hover:border-[#800020] flex items-center gap-2 transition-all shrink-0 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#800020]" />
            <span>تحميل نموذج استرشادي ({isLanguageSchool ? "English" : "عربي"})</span>
          </button>
        </div>
      )}

      {/* Success View */}
      {submitSuccess !== null ? (
        <div className="p-8 sm:p-10 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#34D399]/60 text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-xl bg-[#059669] text-white flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#059669] dark:text-[#34D399]">
              تم استيراد وحفظ {submitSuccess} سؤال بنجاح!
            </h2>
            <div className="text-[13px] sm:text-sm text-[#0F172A] dark:text-[#E2E8F0] max-w-lg mx-auto mt-3 p-4 rounded-xl bg-white/70 dark:bg-[#0F172A]/70 border border-[#E2E8F0] dark:border-[#334155] space-y-1">
              <div>
                <span className="text-[#64748B]">الفئة التعليمية: </span>
                <span className="font-bold text-[#800020]">
                  {selectedSchoolCategory === "ARABIC" ? "مدارس عربي" : "مدارس لغات (Language Schools)"}
                </span>
              </div>
              <div>
                <span className="text-[#64748B]">المادة: </span>
                <span className="font-bold underline">{activeSubject?.name || "المادة المحددة"}</span>
              </div>
              {activeUnit && (
                <div>
                  <span className="text-[#64748B]">الوحدة: </span>
                  <span className="font-medium">{activeUnit.title}</span>
                </div>
              )}
              {selectedScope === "LESSON" && selectedLessonId ? (
                <div>
                  <span className="text-[#64748B]">الدرس: </span>
                  <span className="font-medium">
                    {activeUnit?.lessons?.find((l) => l.id === selectedLessonId)?.title || "الدرس المحدد"}
                  </span>
                </div>
              ) : (
                <div className="text-[#059669] font-bold">
                  ✓ حفظ على نطاق الوحدة كاملة بدون درس تعسفي
                </div>
              )}
              <div className="text-[12px] text-[#64748B] pt-1">
                نوع السؤال: {selectedQuestionType === "MCQ" ? "اختيار من متعدد" : selectedQuestionType === "TRUE_FALSE" ? "صواب أو خطأ" : "أسئلة مقالية"}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/admin/questions"
              className="h-11 px-6 rounded-xl bg-[#800020] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm hover:bg-[#66001A] transition-all"
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
              className="h-11 px-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
            >
              استيراد ملف آخر
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* STEP 1: Strict Curriculum Hierarchy Destination */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0]/90 dark:border-[#334155]/90 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#800020] text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
                  1
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#0F172A] dark:text-white">
                    تحديد المسار الهرمي للمنهج الدراسي
                  </h3>
                  <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                    الصف الدراسي ← فئة المدرسة ← المسار التخصصي ← المادة المقررة ← الوحدة ← الدرس
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-steps 1, 2: Grade and School Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Grade Selector */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#0F172A] dark:text-white block">
                  1. الصف الدراسي *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const g10 = grades?.find((g) => g.code === "bacc_g10");
                      if (g10) handleGradeChange(g10.id);
                    }}
                    className={`h-11 px-3 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                      activeGrade?.code === "bacc_g10" || (!activeGrade && selectedGradeId.includes("g10"))
                        ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                        : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020]"
                    }`}
                  >
                    <span>أولى بكالوريا</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const g11 = grades?.find((g) => g.code === "bacc_g11");
                      if (g11) handleGradeChange(g11.id);
                    }}
                    className={`h-11 px-3 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                      activeGrade?.code === "bacc_g11" || selectedGradeId.includes("g11")
                        ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                        : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020]"
                    }`}
                  >
                    <span>تانية بكالوريا</span>
                  </button>
                </div>
              </div>

              {/* 2. School Category Selector */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#0F172A] dark:text-white block">
                  2. فئة المدرسة التعليمية *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("ARABIC")}
                    className={`h-11 px-3 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedSchoolCategory === "ARABIC"
                        ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                        : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#059669]"
                    }`}
                  >
                    <span>مدارس عربي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange("LANGUAGES")}
                    className={`h-11 px-3 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedSchoolCategory === "LANGUAGES"
                        ? "bg-[#0284C7] text-white border-[#0284C7] shadow-sm"
                        : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#0284C7]"
                    }`}
                  >
                    <span>مدارس لغات (Language)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-steps 3, 4: Track (if applicable) and Eligible Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* 3. Academic Track (Conditional) */}
              {requiresTrack && (
                <div>
                  <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-2">
                    3. المسار التخصصي (اختياري / حسب الشعبة)
                  </label>
                  <select
                    value={selectedTrackId}
                    onChange={(e) => {
                      const trackId = e.target.value;
                      setSelectedTrackId(trackId);
                      const next = subjects.filter(
                        (s) =>
                          s.gradeId === selectedGradeId &&
                          s.schoolCategory === selectedSchoolCategory &&
                          (!trackId || !s.trackId || s.trackId === trackId)
                      );
                      setSelectedSubjectId(next[0]?.id || "");
                      setSelectedUnitId("");
                      setSelectedLessonId("");
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                  >
                    <option value="">كافة المسارات / المسار المشترك</option>
                    {availableTracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4. Eligible Subject Dropdown */}
              <div className={!requiresTrack ? "md:col-span-2" : ""}>
                <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-2">
                  4. المادة المقررة للفئة المحددة *
                </label>
                <div className="relative">
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                  >
                    {eligibleSubjects.length === 0 ? (
                      <option value="">لا توجد مواد مهيأة لهذه الفئة حالياً</option>
                    ) : (
                      eligibleSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.schoolCategory === "ARABIC" ? "عربي" : "لغات / English"})
                        </option>
                      ))
                    )}
                  </select>
                  <BookOpen className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Sub-steps 5, 6: Unit and Scope */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* 5. Unit Selector */}
              <div>
                <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-2">
                  5. الوحدة الدراسية *
                </label>
                <div className="relative">
                  <select
                    value={selectedUnitId}
                    onChange={(e) => {
                      setSelectedUnitId(e.target.value);
                      setSelectedLessonId("");
                    }}
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                  >
                    <option value="">-- اختر الوحدة الدراسية --</option>
                    {activeSubject?.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                  <Layers className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 6. Scope Selector (Lesson vs Unit-level) */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
                  6. نطاق ربط الأسئلة *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedScope("LESSON")}
                    className={`h-11 px-3 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedScope === "LESSON"
                        ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                        : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] border-[#E2E8F0] dark:border-[#334155]"
                    }`}
                  >
                    <span>درس محدد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedScope("UNIT");
                      setSelectedLessonId("");
                    }}
                    className={`h-11 px-3 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedScope === "UNIT"
                        ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                        : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] border-[#E2E8F0] dark:border-[#334155]"
                    }`}
                  >
                    <span>نطاق الوحدة ككل</span>
                  </button>
                </div>

                {selectedScope === "LESSON" && (
                  <div className="pt-1">
                    <select
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(e.target.value)}
                      disabled={!selectedUnitId || !activeUnit?.lessons?.length}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white disabled:opacity-50 focus:outline-none focus:border-[#800020]"
                    >
                      <option value="">-- اختر الدرس المستهدف للتراكم --</option>
                      {activeUnit?.lessons?.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: Strict Question Type & Difficulty Configuration */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0]/90 dark:border-[#334155]/90 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#800020] text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
                  2
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#0F172A] dark:text-white">
                    نوع الأسئلة ومستوى الصعوبة للمستند
                  </h3>
                  <span className="text-[12px] font-bold text-[#D97706] dark:text-[#FBBF24]">
                    ⚠ قاعدة المنصة: كل مستند يحتوي على نوع واحد فقط من الأسئلة
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 7. Question Type Selector */}
              <div>
                <label className="text-[13px] font-bold text-[#0F172A] dark:text-white block mb-2">
                  7. نوع الأسئلة في هذا الملف *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionType("MCQ")}
                    className={`h-11 px-2 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center ${
                      selectedQuestionType === "MCQ"
                        ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                        : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155]"
                    }`}
                  >
                    <span>اختيار من متعدد (MCQ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedQuestionType("TRUE_FALSE")}
                    className={`h-11 px-2 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center ${
                      selectedQuestionType === "TRUE_FALSE"
                        ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                        : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155]"
                    }`}
                  >
                    <span>صواب أو خطأ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedQuestionType("ESSAY")}
                    className={`h-11 px-2 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center ${
                      selectedQuestionType === "ESSAY"
                        ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                        : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155]"
                    }`}
                  >
                    <span>أسئلة مقالية (Essay)</span>
                  </button>
                </div>
              </div>

              {/* 8. Difficulty Selector */}
              <div>
                <label className="text-[13px] font-bold text-[#0F172A] dark:text-white block mb-2">
                  8. مستوى الصعوبة *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "EASY", label: "سهل" },
                    { id: "MEDIUM", label: "متوسط" },
                    { id: "HARD", label: "متقدم" },
                    { id: "MIXED", label: "متنوع" },
                  ].map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff.id as any)}
                      className={`h-11 px-1 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center ${
                        selectedDifficulty === diff.id
                          ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] border-[#0F172A] dark:border-white shadow-sm"
                          : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] border-[#E2E8F0] dark:border-[#334155]"
                      }`}
                    >
                      <span>{diff.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Document Upload (Word or PDF) */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0]/90 dark:border-[#334155]/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#800020] text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
                  3
                </div>
                <h3 className="text-[14px] font-bold text-[#0F172A] dark:text-white">
                  9. رفع ملف Word (.docx) أو PDF (.pdf)
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#0F172A] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInputMode("file")}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 ${
                    inputMode === "file"
                      ? "bg-white dark:bg-[#1E293B] text-[#800020] shadow-sm"
                      : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-[#800020]" />
                  <span>ملف Word / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 ${
                    inputMode === "paste"
                      ? "bg-white dark:bg-[#1E293B] text-[#800020] shadow-sm"
                      : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#800020]" />
                  <span>لصق نصوص</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("csv")}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 ${
                    inputMode === "csv"
                      ? "bg-white dark:bg-[#1E293B] text-[#059669] shadow-sm"
                      : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#059669]" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {parseError && (
              <div className="p-4 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#DC2626]/20 text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Word & PDF Upload Zone */}
            {inputMode === "file" && (
              <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020] dark:hover:border-[#E11D48] rounded-xl p-8 sm:p-10 text-center transition-all bg-[#F8FAFC] dark:bg-[#0F172A]/40">
                <input
                  type="file"
                  id="document-file-input"
                  ref={fileInputRef}
                  accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="document-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-16 h-16 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center shadow-sm">
                    {isParsing ? (
                      <Loader2 className="w-9 h-9 animate-spin text-[#800020]" />
                    ) : (
                      <Upload className="w-9 h-9" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#0F172A] dark:text-white block">
                      {isParsing
                        ? "جاري تحليل واستخراج الأسئلة من المستند..."
                        : fileName
                        ? `تم اختيار الملف: ${fileName} (اضغط للتغيير)`
                        : "اسحب ملف Word (.docx) أو PDF (.pdf) هنا أو اضغط للتصفح"}
                    </span>
                    <span className="text-[12px] text-[#94A3B8] mt-1 block">
                      {isLanguageSchool
                        ? "Language Schools: Preserves original English phrasing, formatting, choices, and explanations."
                        : "مدارس عربي: يحافظ على النصوص والتفسيرات العربية مع عزل المصطلحات الإنجليزية تلقائياً."}
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
                  dir={isLanguageSchool ? "ltr" : "rtl"}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={
                    isLanguageSchool
                      ? "Paste question text here in English...\n\nExample:\nQ1: What is a Bit?\nA) Binary Digit*\nB) Byte\nC) Gigahertz\nAnswer: A\nExplanation: Basic binary storage unit."
                      : "انسخ نصوص الأسئلة والصقها هنا...\n\nمثال:\nس1: ما هو البت؟\nأ) وحدة ثنائية*\nب) بايت\nج) جيجاهرتز\nالإجابة: أ\nالتفسير: أصغر وحدة تخزين في الحاسوب."
                  }
                  className="w-full p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[13px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                />
                <button
                  type="button"
                  onClick={handleDirectTextParse}
                  disabled={!pastedText.trim() || isParsing}
                  className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] disabled:opacity-50 text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التحليل...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>استخراج الأسئلة من النص</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CSV Zone */}
            {inputMode === "csv" && (
              <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] hover:border-[#059669] rounded-xl p-8 text-center transition-all bg-[#F8FAFC] dark:bg-[#0F172A]/40">
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#0F172A] dark:text-white block">
                      {fileName ? fileName : "اضغط لاختيار ملف CSV"}
                    </span>
                    <span className="text-[12px] text-[#94A3B8] mt-1 block">
                      يقبل ملفات CSV بتنسيق UTF-8
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* STEP 4 & 5: Interactive Review & Bulk Commit */}
          {questions.length > 0 && (
            <div className="space-y-4 pt-2">
              {/* Summary Bar */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0]/90 dark:border-[#334155]/90 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#059669] text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
                        4
                      </div>
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                        <span>10. مراجعة وتعديل الأسئلة المستخرجة ({questions.length})</span>
                        <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#FB7185]">
                          {isLanguageSchool ? "English LTR" : "عربي RTL"}
                        </span>
                      </h3>
                    </div>
                    <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                      تأكد من صياغة كل سؤال وخياراته وإجابته النموذجية قبل تأكيد الحفظ التراكمي في البنك
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={handleCommitQuestions}
                      disabled={readyToImportQuestions.length === 0 || isSubmitting}
                      className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري الحفظ التراكمي...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#D97706]" />
                          <span>11. استيراد {readyToImportQuestions.length} سؤال معتمد</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Validation Counts and Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-[12px] font-bold border border-[#059669]/20 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>جاهز للاستيراد: {validCount}</span>
                    </div>

                    {invalidCount > 0 && (
                      <div className="px-3 py-1 rounded-full bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171] text-[12px] font-bold border border-[#DC2626]/20 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>يتطلب تدقيق: {invalidCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-[12px] font-bold text-[#800020] hover:underline"
                    >
                      تحديد الكل ({questions.length})
                    </button>
                    <span className="text-[#94A3B8]">•</span>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions Cards List */}
              <div className="space-y-4">
                {filteredQuestions.map((q, idx) => {
                  const isSelected = selectedQuestionIds.has(q.id);
                  return (
                    <div
                      key={q.id}
                      dir={isLanguageSchool ? "ltr" : "rtl"}
                      className={`p-5 rounded-xl bg-white dark:bg-[#1E293B] border transition-all ${
                        !q.isValid
                          ? "border-[#DC2626]/60 bg-[#DC2626]/5"
                          : isSelected
                          ? "border-[#800020]/40 shadow-sm"
                          : "border-[#E2E8F0] dark:border-[#334155] opacity-75"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3 mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectQuestion(q.id)}
                            className="w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
                          />
                          <span className="font-bold text-[13px] text-[#800020]">
                            #{idx + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] border border-[#E2E8F0] dark:border-[#334155]">
                            {q.type}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#059669]/10 text-[#059669]">
                            {q.difficulty}
                          </span>
                        </div>

                        {!q.isValid && (
                          <span className="text-[11px] font-bold text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded">
                            {q.validationNotes.join(" • ")}
                          </span>
                        )}
                      </div>

                      {/* Question Statement */}
                      <div className="text-[14px] font-bold text-[#0F172A] dark:text-white mb-3">
                        {isLanguageSchool ? (
                          q.statement
                        ) : (
                          <BidiStatement text={q.statement} />
                        )}
                      </div>

                      {/* Options or Model Answer */}
                      {q.type !== "ESSAY" && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {q.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                // Toggle correct option directly in preview!
                                const updatedOpts = q.options.map((o, oIdx) => ({
                                  ...o,
                                  isCorrect: q.type === "TRUE_FALSE" ? oIdx === optIdx : oIdx === optIdx ? !o.isCorrect : o.isCorrect,
                                }));
                                const updatedQ = revalidateQuestion({ ...q, options: updatedOpts });
                                setQuestions((prev) => prev.map((item) => (item.id === q.id ? updatedQ : item)));
                              }}
                              className={`p-3 rounded-xl border text-[13px] font-medium text-left flex items-center justify-between transition-all ${
                                opt.isCorrect
                                  ? "bg-[#059669]/10 border-[#059669] text-[#059669] font-bold"
                                  : "bg-[#F8FAFC] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white"
                              }`}
                            >
                              <span>{opt.text}</span>
                              {opt.isCorrect && <Check className="w-4 h-4 text-[#059669] shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {q.type === "ESSAY" && q.modelAnswer && (
                        <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[12px] space-y-1 mb-3">
                          <span className="font-bold text-[#800020] block">
                            {isLanguageSchool ? "Model Answer:" : "الإجابة النموذجية:"}
                          </span>
                          <p className="text-[#64748B] dark:text-[#94A3B8]">{q.modelAnswer}</p>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.correctReason && (
                        <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2 pt-1 border-t border-[#E2E8F0]/60 dark:border-[#334155]/60">
                          <span className="font-bold text-[#800020]">
                            {isLanguageSchool ? "Explanation:" : "التفسير العلمي:"}
                          </span>
                          <span>{q.correctReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
