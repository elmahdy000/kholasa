"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Trash2,
  FileText,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface Subject {
  id: string;
  name: string;
  units: { id: string; title: string }[];
}

interface ParsedQuestion {
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  subjectId: string;
  unitId?: string;
  concept?: string;
  correctReason?: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  isValid: boolean;
  error?: string;
}

interface BulkImportClientProps {
  subjects: Subject[];
}

export function BulkImportClient({ subjects }: BulkImportClientProps) {
  const router = useRouter();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ""
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pastedText, setPastedText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<number | null>(null);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Helper to generate sample CSV
  const handleDownloadSample = () => {
    const csvContent =
      "نص السؤال,نوع السؤال,المستوى,الخيار الأول,صحيح1,تفسير الخيار 1,الخيار الثاني,صحيح2,تفسير الخيار 2,الخيار الثالث,صحيح3,تفسير الخيار 3,الخيار الرابع,صحيح4,تفسير الخيار 4,المفهوم التعليمي,سبب صحة الإجابة\n" +
      '"ما هو ناتج تفاعل حمض الهيدروكلوريك مع هيدروكسيد الصوديوم؟",MCQ,EASY,"كلوريد صوديوم وماء",نعم,"تفاعل تعادل كلاسيكي بين حمض وقاعدة","غاز الهيدروجين فقط",لا,"لا ينتج غاز مفرد","حمض كبريتيك",لا,"لا يحتوي المتفاعلات على كبريت","راسب أبيض",لا,"جميع النواتج ذائبة","تفاعلات التعادل","يتفاعل الحمض مع القلوي ليعطي ملحاً وماء"\n' +
      '"تعتبر الخلية النباتية محاطة بجدار خلوي من مادة السليلوز",TRUE_FALSE,EASY,"صواب",نعم,"السليلوز يمنح النبات دعامة وشكلاً محدداً","خطأ",لا,"الخلية النباتية تمتلك جداراً فعلياً","الجدار الخلوي","الجدار الخلوي الخارجي يميز الخلايا النباتية عن الحيوانية"\n';

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "kholasa_questions_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust CSV Line Parser that handles quotes
  const parseCSV = (content: string) => {
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      return [];
    }

    // Skip header line
    const dataLines = lines.slice(1);
    const result: ParsedQuestion[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      // Regex to split by comma outside quotes
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

      if (cells.length < 4 || !cells[0]) continue;

      const statement = cells[0];
      const rawType = (cells[1] || "MCQ").toUpperCase();
      const type: "MCQ" | "TRUE_FALSE" | "ESSAY" =
        rawType.includes("TRUE") || rawType.includes("صح")
          ? "TRUE_FALSE"
          : rawType.includes("ESSAY") || rawType.includes("مقال")
          ? "ESSAY"
          : "MCQ";

      const rawDiff = (cells[2] || "MEDIUM").toUpperCase();
      const difficulty: "EASY" | "MEDIUM" | "HARD" =
        rawDiff.includes("EASY") || rawDiff.includes("سهل")
          ? "EASY"
          : rawDiff.includes("HARD") || rawDiff.includes("صعب") || rawDiff.includes("متقدم")
          ? "HARD"
          : "MEDIUM";

      // Options
      const options: { text: string; isCorrect: boolean; explanation?: string }[] = [];

      // Check Option 1
      if (cells[3]) {
        const isCorrect =
          cells[4]?.toLowerCase() === "true" ||
          cells[4]?.toLowerCase() === "1" ||
          cells[4] === "نعم" ||
          cells[4] === "صحيح";
        options.push({ text: cells[3], isCorrect, explanation: cells[5] || "" });
      }

      // Check Option 2
      if (cells[6]) {
        const isCorrect =
          cells[7]?.toLowerCase() === "true" ||
          cells[7]?.toLowerCase() === "1" ||
          cells[7] === "نعم" ||
          cells[7] === "صحيح";
        options.push({ text: cells[6], isCorrect, explanation: cells[8] || "" });
      }

      // Check Option 3
      if (cells[9]) {
        const isCorrect =
          cells[10]?.toLowerCase() === "true" ||
          cells[10]?.toLowerCase() === "1" ||
          cells[10] === "نعم" ||
          cells[10] === "صحيح";
        options.push({ text: cells[9], isCorrect, explanation: cells[11] || "" });
      }

      // Check Option 4
      if (cells[12]) {
        const isCorrect =
          cells[13]?.toLowerCase() === "true" ||
          cells[13]?.toLowerCase() === "1" ||
          cells[13] === "نعم" ||
          cells[13] === "صحيح";
        options.push({ text: cells[12], isCorrect, explanation: cells[14] || "" });
      }

      const concept = cells[15] || undefined;
      const correctReason = cells[16] || undefined;

      // Validation check
      let isValid = true;
      let error = undefined;

      if (!statement) {
        isValid = false;
        error = "نص السؤال غير موجود";
      } else if (type === "MCQ" && options.length < 2) {
        isValid = false;
        error = "يجب توفر خيارين على الأقل";
      } else if (
        (type === "MCQ" || type === "TRUE_FALSE") &&
        !options.some((o) => o.isCorrect)
      ) {
        isValid = false;
        error = "لم يتم تحديد أي إجابة صحيحة (ضع 'نعم' في عمود صحيح)";
      }

      result.push({
        statement,
        type,
        difficulty,
        subjectId: selectedSubjectId,
        unitId: selectedUnitId || undefined,
        concept,
        correctReason,
        options,
        isValid,
        error,
      });
    }

    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSubmitError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseCSV(content);
        setParsedQuestions(parsed);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handlePasteParse = () => {
    setSubmitError(null);
    if (!pastedText.trim()) return;
    const parsed = parseCSV(pastedText);
    setParsedQuestions(parsed);
  };

  const validQuestions = parsedQuestions.filter((q) => q.isValid);
  const invalidQuestions = parsedQuestions.filter((q) => !q.isValid);

  const handleCommitImport = async () => {
    if (validQuestions.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Re-assign currently selected subject & unit if not specified
      const payload = validQuestions.map((q) => ({
        ...q,
        subjectId: selectedSubjectId,
        unitId: selectedUnitId || undefined,
      }));

      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل استيراد الأسئلة");
      }

      setSubmitSuccess(data.importedCount);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("حدث خطأ غير متوقع");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
        <div>
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-2 text-[13px] font-bold text-[#64748B] hover:text-[#4F46E5] mb-2 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لبنك الأسئلة</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
            استيراد الأسئلة الجماعي (Bulk Import CSV)
          </h1>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            ارفع ملف CSV يحتوي على مئات الأسئلة دفعة واحدة مع المعاينة والتحقق اللحظي من الأخطاء
          </p>
        </div>

        {/* Download Sample Button */}
        <button
          onClick={handleDownloadSample}
          className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white hover:border-[#4F46E5] flex items-center gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-[#4F46E5]" />
          <span>تحميل قالب CSV الاسترشادي</span>
        </button>
      </div>

      {/* Success Notification */}
      {submitSuccess !== null ? (
        <div className="p-8 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#34D399]/60 text-center space-y-4">
          <div className="w-16 h-16 rounded-xl bg-[#059669] text-white flex items-center justify-center mx-auto shadow-sm shadow-sm">
            <CheckCircle2 className="w-11 h-11" />
          </div>
          <h2 className="text-xl font-bold text-[#059669] dark:text-[#34D399]">
            تم استيراد {submitSuccess} سؤال بنجاح!
          </h2>
          <p className="text-[13px] sm:text-sm text-[#059669] dark:text-[#34D399] max-w-md mx-auto">
            تمت إضافة الأسئلة ونشرها في بنك الأسئلة للمادة المحددة، وأصبحت جاهزة للاختبارات الفورية والتمارين.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/admin/questions"
              className="h-11 px-6 rounded-xl bg-[#4F46E5] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm hover:bg-[#4338CA] transition-all"
            >
              <span>الانتقال لبنك الأسئلة</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
            <button
              onClick={() => {
                setSubmitSuccess(null);
                setParsedQuestions([]);
                setPastedText("");
                setFileName(null);
              }}
              className="h-11 px-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
            >
              استيراد دفعة أخرى
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Target Subject & Unit Selector */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm space-y-3">
            <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
              1. اختر المادة والوحدة المستهدفة للأسئلة المستوردة:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                  المادة المقررة *
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedUnitId("");
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                  الوحدة (اختياري)
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                >
                  <option value="">بدون وحدة محددة (عام للمادة)</option>
                  {activeSubject?.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Import Modes: File Upload or Direct Paste */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                2. إدخال بيانات الملف:
              </span>
              <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#1E293B] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("file")}
                  className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
                    activeTab === "file"
                      ? "bg-white dark:bg-[#334155] text-[#4F46E5] "
                      : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 inline ml-2" />
                  رفع ملف CSV
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("paste")}
                  className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
                    activeTab === "paste"
                      ? "bg-white dark:bg-[#334155] text-[#4F46E5] "
                      : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 inline ml-2" />
                  لصق النص مباشرة
                </button>
              </div>
            </div>

            {activeTab === "file" ? (
              <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] hover:border-[#4F46E5] rounded-xl p-8 text-center transition-colors">
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#0F172A] dark:text-white block">
                      {fileName ? fileName : "اضغط لاختيار ملف CSV أو اسحبه هنا"}
                    </span>
                    <span className="text-[13px] text-[#94A3B8] mt-1 block">
                      يقبل ملفات CSV بترميز UTF-8 مع فواصل عادية
                    </span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="الصق أسطر CSV هنا متضمنة الرأس (Header)..."
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                />
                <button
                  type="button"
                  onClick={handlePasteParse}
                  className="h-11 px-4 rounded-xl bg-[#0F172A] text-white text-[13px] font-bold hover:bg-[#334155] transition-colors"
                >
                  تحليل النص المعروض
                </button>
              </div>
            )}
          </div>

          {/* Parsed Preview Table & Actions */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white">
                    إجمالي الأسئلة المحللة: {parsedQuestions.length}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#059669]/10 dark:bg-[#1E293B] text-[13px] font-bold text-[#059669] dark:text-[#34D399] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>جاهزة للاستيراد: {validQuestions.length}</span>
                  </div>
                  {invalidQuestions.length > 0 && (
                    <div className="px-3 py-1 rounded-full bg-[#DC2626]/10 dark:bg-[#1E293B] text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>غير صالحة: {invalidQuestions.length}</span>
                    </div>
                  )}
                </div>

                {/* Import Confirmation Button */}
                <button
                  onClick={handleCommitImport}
                  disabled={validQuestions.length === 0 || isSubmitting}
                  className="h-11 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ {validQuestions.length} سؤال...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D97706]" />
                      <span>تأكيد استيراد {validQuestions.length} سؤال الآن</span>
                    </>
                  )}
                </button>
              </div>

              {submitError && (
                <div className="p-4 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#F87171] text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Questions Preview Cards */}
              <div className="space-y-3">
                {parsedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      q.isValid
                        ? "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155]"
                        : "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#F87171]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13px] font-bold px-2 py-1 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC]">
                            سؤال #{idx + 1}
                          </span>
                          <span className="text-[13px] font-bold px-2 py-1 rounded-md bg-[#4F46E5]/10 dark:bg-[#1E293B] text-[#4F46E5]">
                            {q.type === "MCQ"
                              ? "اختيار من متعدد"
                              : q.type === "TRUE_FALSE"
                              ? "صح/خطأ"
                              : "مقالي"}
                          </span>
                          <span className="text-[13px] font-bold px-2 py-1 rounded-md bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706]">
                            {q.difficulty === "EASY"
                              ? "سهل"
                              : q.difficulty === "MEDIUM"
                              ? "متوسط"
                              : "متقدم"}
                          </span>
                        </div>

                        <BidiStatement
                          as="h4"
                          text={q.statement}
                          className="text-sm font-bold text-[#0F172A] dark:text-white leading-relaxed"
                        />

                        {/* Options preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-xl text-[13px] flex items-center justify-between border ${
                                opt.isCorrect
                                  ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399] text-[#059669] dark:text-[#34D399] font-bold"
                                  : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
                              }`}
                            >
                              <BidiStatement as="span" text={opt.text} />
                              {opt.isCorrect && (
                                <span className="text-[13px] bg-[#059669] text-white px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>صحيح</span>
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {q.concept && (
                          <div className="pt-2 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                            <span className="font-bold text-[#4F46E5]">
                              المفهوم:{" "}
                            </span>
                            {q.concept} • {q.correctReason}
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {q.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#34D399]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>سليم</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] bg-[#DC2626]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#F87171]">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{q.error || "خطأ"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
