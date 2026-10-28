"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Download, ArrowRight } from "lucide-react";
import {
  ParsedQuestion,
  QuestionType,
  QuestionDifficulty,
  parseQuestionsFromText,
} from "@/lib/question-parser";
import {
  GradeItem,
  SubjectItem,
  QuestionWordImporterProps,
} from "./questions/importer/types";
import { HierarchySelector } from "./questions/importer/HierarchySelector";
import { FileUploadSection } from "./questions/importer/FileUploadSection";
import { QuestionsPreviewList } from "./questions/importer/QuestionsPreviewList";
import { ImportSuccessView } from "./questions/importer/ImportSuccessView";

export type {
  TrackItem,
  GradeItem,
  LessonItem,
  UnitItem,
  SubjectItem,
  QuestionWordImporterProps,
} from "./questions/importer/types";

export function QuestionWordImporter({
  subjects,
  grades,
  initialGradeId,
  initialSchoolCategory,
  initialSubjectId,
  initialUnitId,
  initialLessonId,
  onSuccess,
  onImportSuccess,
  isModal = false,
}: QuestionWordImporterProps) {
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

  // 4. Eligible Subjects
  const eligibleSubjects = subjects.filter((s) => {
    if (selectedGradeId && s.gradeId && s.gradeId !== selectedGradeId) return false;
    if (s.schoolCategory && s.schoolCategory !== selectedSchoolCategory) return false;
    if (requiresTrack && selectedTrackId && s.trackId && s.trackId !== selectedTrackId) return false;
    return true;
  });

  const defaultSubjectId =
    initialSubjectId && eligibleSubjects.some((s) => s.id === initialSubjectId)
      ? initialSubjectId
      : eligibleSubjects[0]?.id || "";
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(defaultSubjectId);

  // 5. Unit & Lesson selection
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId || "");
  const activeUnit = activeSubject?.units.find((u) => u.id === selectedUnitId);

  const [selectedScope, setSelectedScope] = useState<"LESSON" | "UNIT">("LESSON");
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLessonId || "");

  // 6. Question Type & Difficulty
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>("MCQ");
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | "MIXED">("MEDIUM");

  // Input Mode state
  const [inputMode, setInputMode] = useState<"file" | "paste" | "csv">("file");
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parsed Questions State
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Question validation
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

    return { ...q, isValid, validationNotes: notes };
  };

  // Upload Word/PDF
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
        throw new Error("لم يتم العثور على أي أسئلة صالحة في المستند.");
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
        throw new Error("لم يتم استخراج أي أسئلة من النص المدخل.");
      }
      setFileName("نص مباشر");
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

  // Sample Download
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
Explanation: A bit (binary digit) is the fundamental unit of data in binary computation.`
      : `منصة الخلاصة - نموذج استرشادي لاستيراد الأسئلة (${selectedQuestionType})

المادة: ${activeSubject?.name || "البرمجة والتفكير الحاسوبي والذكاء الاصطناعي"}
الفئة التعليمية: مدارس عربي

س1: ما هي أصغر وحدة لقياس البيانات الرقمية في الحاسوب؟
أ) البايت (Byte)
ب) البت (Bit)*
ج) الكيلوبايت (KB)
د) الميغاهرتز (MHz)
الإجابة: ب
التفسير: البت (Bit) هو أصغر وحدة تخزين رقمية ويحمل إما القيمة 0 أو 1.`;

    const blob = new Blob([sampleText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kholasa_${selectedSchoolCategory.toLowerCase()}_${selectedQuestionType.toLowerCase()}_sample.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Commit Questions
  const handleCommitQuestions = async () => {
    const readyQuestions = questions.filter((q) => q.isValid && selectedQuestionIds.has(q.id));
    if (!readyQuestions.length) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = readyQuestions.map((q) => ({
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
      if (onImportSuccess) onImportSuccess();
      else if (onSuccess) onSuccess();
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
        <ImportSuccessView
          importedCount={submitSuccess}
          schoolCategory={selectedSchoolCategory}
          activeSubject={activeSubject}
          activeUnit={activeUnit}
          selectedScope={selectedScope}
          selectedLessonId={selectedLessonId}
          selectedQuestionType={selectedQuestionType}
          onReset={() => {
            setSubmitSuccess(null);
            setQuestions([]);
            setPastedText("");
            setFileName(null);
            setSelectedQuestionIds(new Set());
          }}
        />
      ) : (
        <>
          <HierarchySelector
            grades={grades}
            activeGrade={activeGrade}
            selectedGradeId={selectedGradeId}
            onGradeChange={handleGradeChange}
            selectedSchoolCategory={selectedSchoolCategory}
            onCategoryChange={handleCategoryChange}
            requiresTrack={requiresTrack}
            availableTracks={availableTracks}
            selectedTrackId={selectedTrackId}
            onTrackChange={(trackId) => {
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
            eligibleSubjects={eligibleSubjects}
            selectedSubjectId={selectedSubjectId}
            onSubjectChange={handleSubjectChange}
            activeSubject={activeSubject}
            selectedUnitId={selectedUnitId}
            onUnitChange={(unitId) => {
              setSelectedUnitId(unitId);
              setSelectedLessonId("");
            }}
            activeUnit={activeUnit}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
            selectedLessonId={selectedLessonId}
            onLessonChange={setSelectedLessonId}
            selectedQuestionType={selectedQuestionType}
            onQuestionTypeChange={setSelectedQuestionType}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
          />

          <FileUploadSection
            inputMode={inputMode}
            onInputModeChange={setInputMode}
            isLanguageSchool={isLanguageSchool}
            fileName={fileName}
            isParsing={isParsing}
            parseError={parseError}
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
            pastedText={pastedText}
            onPastedTextChange={setPastedText}
            onDirectTextParse={handleDirectTextParse}
            onCsvFileUpload={handleCsvFileUpload}
          />

          {questions.length > 0 && (
            <QuestionsPreviewList
              questions={questions}
              selectedQuestionIds={selectedQuestionIds}
              isLanguageSchool={isLanguageSchool}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onCommit={handleCommitQuestions}
              onSelectAll={() => setSelectedQuestionIds(new Set(questions.map((q) => q.id)))}
              onDeselectAll={() => setSelectedQuestionIds(new Set())}
              onToggleSelect={(id) => {
                setSelectedQuestionIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
              }}
              onUpdateQuestion={(updated) => {
                setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
              }}
              revalidateQuestion={revalidateQuestion}
            />
          )}
        </>
      )}
    </div>
  );
}
