"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Plus,
  Filter,
  CheckCircle2,
  X,
  Lightbulb,
  Sparkles,
  Loader2,
  AlertCircle,
  BookOpen,
  Upload,
  Search,
  Edit2,
  Trash2,
  Check,
  FileText,
  Layers,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionWordImporter } from "@/components/admin/QuestionWordImporter";

interface QuestionOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
  explanation?: string | null;
}

interface QuestionExplanation {
  concept: string;
  correctReason: string;
}

interface EssayRubric {
  modelAnswer: string;
  maxScore: number;
}

interface Grade {
  id: string;
  name: string;
  code: string;
  tracks?: { id: string; name: string; code: string }[];
}

interface Question {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  schoolCategory?: "ARABIC" | "LANGUAGES";
  subject: {
    id: string;
    name: string;
    gradeId?: string;
    schoolCategory?: "ARABIC" | "LANGUAGES";
  };
  unit?: { id: string; title: string } | null;
  lessons?: { lesson: { id: string; title: string } }[] | null;
  options: QuestionOption[];
  explanation?: QuestionExplanation | null;
  rubric?: EssayRubric | null;
  batch?: { id: string; fileName: string; fileType: string } | null;
}

interface Subject {
  id: string;
  name: string;
  gradeId?: string;
  schoolCategory?: "ARABIC" | "LANGUAGES";
  grade?: { id: string; name: string; code: string };
  track?: { id: string; name: string; code: string } | null;
  units: {
    id: string;
    title: string;
    lessons?: { id: string; title: string }[];
  }[];
}

interface QuestionBankManagerClientProps {
  initialQuestions: Question[];
  subjects: Subject[];
  grades?: Grade[];
}

export function QuestionBankManagerClient({
  initialQuestions,
  subjects,
  grades,
}: QuestionBankManagerClientProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  // Grade & School Category Primary Hierarchy Filters
  const [selectedGradeCode, setSelectedGradeCode] = useState<string>("all"); // "all" | "bacc_g10" | "bacc_g11"
  const [selectedCategory, setSelectedCategory] = useState<string>("all"); // "all" | "ARABIC" | "LANGUAGES"
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Word/PDF Import Modal State
  const [isWordImportOpen, setIsWordImportOpen] = useState(false);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Baccalaureate grades helpers
  const g10Grade = grades?.find((g) => g.code === "bacc_g10");
  const g11Grade = grades?.find((g) => g.code === "bacc_g11");

  // New Question Form State (Curriculum Hierarchy: Grade -> Category -> Subject -> Unit -> Lesson)
  const [newGradeId, setNewGradeId] = useState<string>(g10Grade?.id || "");
  const [newSchoolCategory, setNewSchoolCategory] = useState<"ARABIC" | "LANGUAGES">("ARABIC");
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || "");
  const [newUnitId, setNewUnitId] = useState<string>("");
  const [newLessonId, setNewLessonId] = useState<string>("");
  const [newStatement, setNewStatement] = useState("");
  const [newType, setNewType] = useState<"MCQ" | "TRUE_FALSE" | "ESSAY">("MCQ");
  const [newDifficulty, setNewDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [newConcept, setNewConcept] = useState("");
  const [newCorrectReason, setNewCorrectReason] = useState("");
  const [newModelAnswer, setNewModelAnswer] = useState("");
  const [newOptions, setNewOptions] = useState([
    { text: "", isCorrect: true, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
  ]);

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editUnitId, setEditUnitId] = useState("");
  const [editLessonId, setEditLessonId] = useState("");
  const [editStatement, setEditStatement] = useState("");
  const [editType, setEditType] = useState<"MCQ" | "TRUE_FALSE" | "ESSAY">("MCQ");
  const [editDifficulty, setEditDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [editConcept, setEditConcept] = useState("");
  const [editCorrectReason, setEditCorrectReason] = useState("");
  const [editModelAnswer, setEditModelAnswer] = useState("");
  const [editOptions, setEditOptions] = useState<
    { text: string; isCorrect: boolean; explanation?: string }[]
  >([]);

  const activeNewSubject = subjects.find((s) => s.id === newSubjectId);
  const activeEditSubject = subjects.find((s) => s.id === editSubjectId);

  // Open Edit Modal
  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setEditSubjectId(q.subject.id);
    setEditUnitId(q.unit?.id || "");
    setEditLessonId(q.lessons?.[0]?.lesson?.id || "");
    setEditStatement(q.statement);
    setEditType(q.type as any);
    setEditDifficulty(q.difficulty as any);
    setEditConcept(q.explanation?.concept || "");
    setEditCorrectReason(q.explanation?.correctReason || "");
    setEditModelAnswer(q.rubric?.modelAnswer || "");
    setEditOptions(
      q.options.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
        explanation: o.explanation || "",
      }))
    );
  };

  // Delete Question
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال نهائياً من بنك الأسئلة؟")) return;

    try {
      const res = await fetch(`/api/admin/questions/${qId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
      } else {
        alert("تعذر حذف السؤال");
      }
    } catch {
      alert("حدث خطأ أثناء حذف السؤال");
    }
  };

  // Handle Update Question
  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: editStatement.trim(),
          subjectId: editSubjectId,
          unitId: editUnitId || undefined,
          lessonId: editLessonId || undefined,
          type: editType,
          difficulty: editDifficulty,
          concept: editConcept.trim() || undefined,
          correctReason: editCorrectReason.trim() || undefined,
          modelAnswer: editType === "ESSAY" ? editModelAnswer.trim() : undefined,
          options: editType !== "ESSAY" ? editOptions : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحديث السؤال");
      }

      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestion.id ? data.question : q))
      );
      setEditingQuestion(null);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء التحديث");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create Question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let optionsPayload: any[] = [];
      if (newType === "MCQ") {
        optionsPayload = newOptions.map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          explanation: o.explanation,
        }));
      } else if (newType === "TRUE_FALSE") {
        optionsPayload = [
          {
            text: "صواب",
            isCorrect: newOptions[0].isCorrect,
            explanation: newOptions[0].explanation,
          },
          {
            text: "خطأ",
            isCorrect: !newOptions[0].isCorrect,
            explanation: newOptions[1].explanation,
          },
        ];
      }

      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: newStatement,
          subjectId: newSubjectId,
          unitId: newUnitId || undefined,
          lessonId: newLessonId || undefined,
          type: newType,
          difficulty: newDifficulty,
          concept: newConcept || undefined,
          correctReason: newCorrectReason || undefined,
          modelAnswer: newType === "ESSAY" ? newModelAnswer : undefined,
          options: optionsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر إضافة السؤال");
      }

      const createdQ: Question = {
        ...data.question,
        subject: { id: newSubjectId, name: activeNewSubject?.name || "" },
        unit: activeNewSubject?.units.find((u) => u.id === newUnitId),
      };

      setQuestions([createdQ, ...questions]);
      setIsCreateOpen(false);

      // Reset
      setNewStatement("");
      setNewLessonId("");
      setNewConcept("");
      setNewCorrectReason("");
      setNewModelAnswer("");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء السؤال");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subject resolution helpers
  const getSubjectGradeCode = (subjectId: string) => {
    const sub = subjects.find((s) => s.id === subjectId);
    if (sub?.grade?.code) return sub.grade.code;
    if (sub?.gradeId && sub.gradeId === g10Grade?.id) return "bacc_g10";
    if (sub?.gradeId && sub.gradeId === g11Grade?.id) return "bacc_g11";
    return "";
  };

  const getSubjectCategory = (subjectId: string): "ARABIC" | "LANGUAGES" => {
    const sub = subjects.find((s) => s.id === subjectId);
    return sub?.schoolCategory || "ARABIC";
  };

  // Filter available subjects based on selected Grade & School Category
  const availableSubjects = subjects.filter((s) => {
    if (selectedGradeCode !== "all") {
      const gCode = s.grade?.code || (s.gradeId === g10Grade?.id ? "bacc_g10" : s.gradeId === g11Grade?.id ? "bacc_g11" : "");
      if (gCode && gCode !== selectedGradeCode) return false;
    }
    if (selectedCategory !== "all") {
      const cat = s.schoolCategory || "ARABIC";
      if (cat !== selectedCategory) return false;
    }
    return true;
  });

  // 4 Primary Curriculum Groupings Question Counts
  const stats = {
    g10Arabic: questions.filter((q) => {
      const gCode = q.subject?.gradeId === g10Grade?.id ? "bacc_g10" : getSubjectGradeCode(q.subject.id);
      const cat = q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id);
      return gCode === "bacc_g10" && cat === "ARABIC";
    }).length,
    g10Languages: questions.filter((q) => {
      const gCode = q.subject?.gradeId === g10Grade?.id ? "bacc_g10" : getSubjectGradeCode(q.subject.id);
      const cat = q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id);
      return gCode === "bacc_g10" && cat === "LANGUAGES";
    }).length,
    g11Arabic: questions.filter((q) => {
      const gCode = q.subject?.gradeId === g11Grade?.id ? "bacc_g11" : getSubjectGradeCode(q.subject.id);
      const cat = q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id);
      return gCode === "bacc_g11" && cat === "ARABIC";
    }).length,
    g11Languages: questions.filter((q) => {
      const gCode = q.subject?.gradeId === g11Grade?.id ? "bacc_g11" : getSubjectGradeCode(q.subject.id);
      const cat = q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id);
      return gCode === "bacc_g11" && cat === "LANGUAGES";
    }).length,
  };

  // Filtered list strictly adhering to Curriculum Hierarchy
  const filteredQuestions = questions.filter((q) => {
    const gCode = q.subject?.gradeId === g10Grade?.id ? "bacc_g10" : (q.subject?.gradeId === g11Grade?.id ? "bacc_g11" : getSubjectGradeCode(q.subject.id));
    const cat = q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id);

    if (selectedGradeCode !== "all" && gCode !== selectedGradeCode) return false;
    if (selectedCategory !== "all" && cat !== selectedCategory) return false;
    if (selectedSubjectId !== "all" && q.subject.id !== selectedSubjectId) return false;
    if (selectedType !== "all" && q.type !== selectedType) return false;
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchStatement = q.statement.toLowerCase().includes(query);
      const matchConcept = q.explanation?.concept?.toLowerCase().includes(query);
      if (!matchStatement && !matchConcept) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 4 PRIMARY CURRICULUM GROUPINGS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: G10 Arabic */}
        <button
          type="button"
          onClick={() => {
            if (selectedGradeCode === "bacc_g10" && selectedCategory === "ARABIC") {
              setSelectedGradeCode("all");
              setSelectedCategory("all");
            } else {
              setSelectedGradeCode("bacc_g10");
              setSelectedCategory("ARABIC");
              setSelectedSubjectId("all");
            }
          }}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            selectedGradeCode === "bacc_g10" && selectedCategory === "ARABIC"
              ? "bg-[#800020]/10 border-[#800020] dark:bg-[#800020]/20 dark:border-[#FB7185] shadow-sm"
              : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20">
              مدارس عربي
            </span>
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              أولى ثانوي
            </span>
          </div>
          <div className="mt-2.5">
            <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-white">
              أولى بكالوريا — عربي
            </h4>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-[#800020] dark:text-[#FB7185]">
                {stats.g10Arabic}
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">سؤال معتمد</span>
            </div>
          </div>
        </button>

        {/* Card 2: G10 Languages */}
        <button
          type="button"
          onClick={() => {
            if (selectedGradeCode === "bacc_g10" && selectedCategory === "LANGUAGES") {
              setSelectedGradeCode("all");
              setSelectedCategory("all");
            } else {
              setSelectedGradeCode("bacc_g10");
              setSelectedCategory("LANGUAGES");
              setSelectedSubjectId("all");
            }
          }}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            selectedGradeCode === "bacc_g10" && selectedCategory === "LANGUAGES"
              ? "bg-[#2563EB]/10 border-[#2563EB] dark:bg-[#2563EB]/20 dark:border-[#60A5FA] shadow-sm"
              : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-[#2563EB]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#60A5FA]">
              Language Schools
            </span>
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              Grade 10
            </span>
          </div>
          <div className="mt-2.5">
            <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-white">
              أولى بكالوريا — لغات
            </h4>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-[#2563EB] dark:text-[#60A5FA]">
                {stats.g10Languages}
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">سؤال معتمد</span>
            </div>
          </div>
        </button>

        {/* Card 3: G11 Arabic */}
        <button
          type="button"
          onClick={() => {
            if (selectedGradeCode === "bacc_g11" && selectedCategory === "ARABIC") {
              setSelectedGradeCode("all");
              setSelectedCategory("all");
            } else {
              setSelectedGradeCode("bacc_g11");
              setSelectedCategory("ARABIC");
              setSelectedSubjectId("all");
            }
          }}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            selectedGradeCode === "bacc_g11" && selectedCategory === "ARABIC"
              ? "bg-[#D97706]/10 border-[#D97706] dark:bg-[#D97706]/20 dark:border-[#FBBF24] shadow-sm"
              : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-[#D97706]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20">
              مدارس عربي
            </span>
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              تانية ثانوي
            </span>
          </div>
          <div className="mt-2.5">
            <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-white">
              تانية بكالوريا — عربي
            </h4>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-[#D97706] dark:text-[#FBBF24]">
                {stats.g11Arabic}
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">سؤال معتمد</span>
            </div>
          </div>
        </button>

        {/* Card 4: G11 Languages */}
        <button
          type="button"
          onClick={() => {
            if (selectedGradeCode === "bacc_g11" && selectedCategory === "LANGUAGES") {
              setSelectedGradeCode("all");
              setSelectedCategory("all");
            } else {
              setSelectedGradeCode("bacc_g11");
              setSelectedCategory("LANGUAGES");
              setSelectedSubjectId("all");
            }
          }}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            selectedGradeCode === "bacc_g11" && selectedCategory === "LANGUAGES"
              ? "bg-[#7C3AED]/10 border-[#7C3AED] dark:bg-[#7C3AED]/20 dark:border-[#A78BFA] shadow-sm"
              : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-[#7C3AED]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:text-[#A78BFA]">
              Language Schools
            </span>
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              Grade 11
            </span>
          </div>
          <div className="mt-2.5">
            <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-white">
              تانية بكالوريا — لغات
            </h4>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-[#7C3AED] dark:text-[#A78BFA]">
                {stats.g11Languages}
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">سؤال معتمد</span>
            </div>
          </div>
        </button>
      </div>

      {/* Top Action & Filters */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex flex-col gap-4">
        {/* Curriculum Hierarchy Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                الصف الدراسي:
              </span>
              <div className="flex items-center bg-[#F8FAFC] dark:bg-[#1E293B] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCode("all");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                    selectedGradeCode === "all"
                      ? "bg-[#800020] text-white"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCode("bacc_g10");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                    selectedGradeCode === "bacc_g10"
                      ? "bg-[#800020] text-white"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  أولى بكالوريا
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCode("bacc_g11");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                    selectedGradeCode === "bacc_g11"
                      ? "bg-[#800020] text-white"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  تانية بكالوريا
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                نوع المدرسة:
              </span>
              <div className="flex items-center bg-[#F8FAFC] dark:bg-[#1E293B] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                    selectedCategory === "all"
                      ? "bg-[#800020] text-white"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("ARABIC");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                    selectedCategory === "ARABIC"
                      ? "bg-[#059669] text-white"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  مدارس عربي
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("LANGUAGES");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                    selectedCategory === "LANGUAGES"
                      ? "bg-[#2563EB] text-white"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  مدارس لغات
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsWordImportOpen(true)}
              className="h-10 px-3.5 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] hover:bg-[#800020]/20 text-[#800020] dark:text-[#FB7185] text-[12px] font-bold flex items-center justify-center gap-2 border border-[#800020]/20 dark:border-[#FB7185]/30 transition-colors"
            >
              <FileText className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
              <span>استيراد Word / PDF</span>
            </button>

            <Link
              href="/admin/questions/import"
              className="h-10 px-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-white text-[12px] font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-[#800020]" />
              <span>استيراد شامل / CSV</span>
            </Link>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="h-10 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[12px] font-bold flex items-center justify-center gap-2 shadow-sm transition-colors active:opacity-80"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سؤال جديد</span>
            </button>
          </div>
        </div>

        {/* Detailed Search & Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث في نص السؤال أو المفهوم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800020]"
            />
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل المواد المؤهلة ({availableSubjects.length})</option>
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.schoolCategory === "LANGUAGES" ? "— لغات" : "— عربي"}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل أنواع الأسئلة</option>
            <option value="MCQ">اختيار من متعدد (MCQ)</option>
            <option value="TRUE_FALSE">صح أو خطأ</option>
            <option value="ESSAY">سؤال مقالي</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل الصعوبات</option>
            <option value="EASY">سهل</option>
            <option value="MEDIUM">متوسط</option>
            <option value="HARD">متقدم</option>
          </select>
        </div>
      </div>

      {/* Questions Counter Header */}
      <div className="flex items-center justify-between text-[13px] font-bold text-[#64748B] px-1">
        <span>عرض {filteredQuestions.length} سؤال من إجمالي {questions.length}</span>
        {selectedGradeCode !== "all" || selectedCategory !== "all" ? (
          <span className="text-[12px] font-bold text-[#800020] dark:text-[#FB7185]">
            تطبيق فلتر: {selectedGradeCode === "bacc_g10" ? "أولى بكالوريا" : selectedGradeCode === "bacc_g11" ? "تانية بكالوريا" : ""}{" "}
            {selectedCategory === "ARABIC" ? "• مدارس عربي" : selectedCategory === "LANGUAGES" ? "• مدارس لغات" : ""}
          </span>
        ) : null}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80  space-y-4"
          >
            {/* Top Bar with Badges and Edit/Delete Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-[#800020]">
                  #{idx + 1}
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold">
                  {q.subject.name}
                </span>
                {/* School Category Badge */}
                {((q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id)) === "LANGUAGES") ? (
                  <span className="px-2.5 py-1 rounded-lg bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#60A5FA] text-[12px] font-bold">
                    مدارس لغات (Language)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20 text-[12px] font-bold">
                    مدارس عربي
                  </span>
                )}
                {/* Batch Badge if imported */}
                {q.batch && (
                  <span className="px-2 py-0.5 rounded-lg bg-[#64748B]/10 text-[#64748B] dark:bg-[#334155] dark:text-[#94A3B8] text-[11px] font-medium" title={q.batch.fileName}>
                    ملف: {q.batch.fileName.length > 22 ? q.batch.fileName.slice(0, 20) + "..." : q.batch.fileName}
                  </span>
                )}
                {q.unit && (
                  <span className="px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] text-[13px] font-bold">
                    {q.unit.title}
                  </span>
                )}
                {q.lessons && q.lessons.length > 0 && q.lessons[0].lesson && (
                  <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#E11D48]/50">
                    درس: {q.lessons[0].lesson.title}
                  </span>
                )}
                <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#64748B]">
                  {q.type === "MCQ"
                    ? "اختيار من متعدد"
                    : q.type === "TRUE_FALSE"
                    ? "صح أو خطأ"
                    : "مقالي"}
                </span>
                <span
                  className={`px-2 py-1 rounded-lg text-[13px] font-bold ${
                    q.difficulty === "EASY"
                      ? "bg-[#059669]/10 text-[#059669]"
                      : q.difficulty === "MEDIUM"
                      ? "bg-[#D97706]/10 text-[#D97706]"
                      : "bg-[#DC2626]/10 text-[#DC2626]"
                  }`}
                >
                  {q.difficulty === "EASY"
                    ? "سهل"
                    : q.difficulty === "MEDIUM"
                    ? "متوسط"
                    : "متقدم"}
                </span>
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(q)}
                  className="h-11 px-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-bold flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#800020]" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="h-11 px-3 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors"
                  title="حذف السؤال"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Question Statement (LTR for Language Schools, RTL with Bidi for Arabic) */}
            {((q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id)) === "LANGUAGES") ? (
              <div dir="ltr" className="text-left font-sans text-sm sm:text-base font-semibold text-[#0F172A] dark:text-white leading-relaxed">
                {q.statement}
              </div>
            ) : (
              <div dir="rtl" className="text-right text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed">
                <BidiStatement as="div" text={q.statement} />
              </div>
            )}

            {/* Options */}
            {q.options && q.options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={opt.id || oIdx}
                    className={`p-3 rounded-xl border text-[13px] font-bold flex items-center justify-between gap-2 ${
                      opt.isCorrect
                        ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#059669]/50 text-[#059669] dark:text-[#34D399] font-bold"
                        : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#F8FAFC]"
                    }`}
                  >
                    {((q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id)) === "LANGUAGES") ? (
                      <span dir="ltr" className="text-left font-sans">{opt.text}</span>
                    ) : (
                      <BidiStatement as="span" text={opt.text} />
                    )}
                    {opt.isCorrect && (
                      <span className="text-[13px] font-bold text-[#059669] flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" />
                        الإجابة الصحيحة
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Rubric for Essay */}
            {q.type === "ESSAY" && q.rubric && (
              <div className="p-4 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/50 text-[13px] space-y-1">
                <span className="font-bold text-[#800020] block">
                  نموذج الإجابة الاسترشادي (Rubric):
                </span>
                <p className="font-medium text-[13px] leading-relaxed text-[#0F172A] dark:text-[#F8FAFC]">
                  {q.rubric.modelAnswer}
                </p>
              </div>
            )}

            {/* Explanation Preview */}
            {q.explanation && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0]/60 dark:border-[#334155]/60 text-[13px] text-[#0F172A] dark:text-[#F8FAFC] space-y-1">
                <span className="font-bold text-[#800020] dark:text-[#FB7185] block">
                  المفهوم الأساسي: {q.explanation.concept}
                </span>
                <p className="font-medium text-[13px] leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                  {q.explanation.correctReason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CREATE QUESTION MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 space-y-5 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#800020]" />
                <span>إضافة سؤال جديد لبنك الأسئلة</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] text-[13px] font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              {/* Grade and School Category Hierarchy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155]">
                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                    1. الصف الدراسي *
                  </label>
                  <select
                    value={newGradeId}
                    onChange={(e) => {
                      const nextGradeId = e.target.value;
                      setNewGradeId(nextGradeId);
                      const nextSubs = subjects.filter((s) => {
                        if (s.gradeId && s.gradeId !== nextGradeId) return false;
                        const targetGrade = grades?.find((g) => g.id === nextGradeId);
                        if (targetGrade && s.grade?.code && s.grade.code !== targetGrade.code) return false;
                        return (s.schoolCategory || "ARABIC") === newSchoolCategory;
                      });
                      const firstSub = nextSubs[0];
                      setNewSubjectId(firstSub?.id || "");
                      setNewUnitId(firstSub?.units[0]?.id || "");
                      setNewLessonId("");
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold"
                  >
                    {grades && grades.length > 0 ? (
                      grades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="bacc_g10">أولى بكالوريا (الصف العاشر)</option>
                        <option value="bacc_g11">تانية بكالوريا (الصف الحادي عشر)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                    2. نوع المدرسة (فصل المنهج) *
                  </label>
                  <select
                    value={newSchoolCategory}
                    onChange={(e) => {
                      const nextCat = e.target.value as "ARABIC" | "LANGUAGES";
                      setNewSchoolCategory(nextCat);
                      const nextSubs = subjects.filter((s) => {
                        if (newGradeId && s.gradeId && s.gradeId !== newGradeId) return false;
                        const targetGrade = grades?.find((g) => g.id === newGradeId);
                        if (targetGrade && s.grade?.code && s.grade.code !== targetGrade.code) return false;
                        return (s.schoolCategory || "ARABIC") === nextCat;
                      });
                      const firstSub = nextSubs[0];
                      setNewSubjectId(firstSub?.id || "");
                      setNewUnitId(firstSub?.units[0]?.id || "");
                      setNewLessonId("");
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold"
                  >
                    <option value="ARABIC">مدارس عربي (Arabic Schools)</option>
                    <option value="LANGUAGES">مدارس لغات (Language Schools)</option>
                  </select>
                </div>
              </div>

              {/* Subject, Unit, Lesson */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    المادة الدراسية المؤهلة *
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => {
                      setNewSubjectId(e.target.value);
                      const target = subjects.find((s) => s.id === e.target.value);
                      setNewUnitId(target?.units[0]?.id || "");
                      setNewLessonId("");
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    {subjects
                      .filter((s) => {
                        if (newGradeId) {
                          if (s.gradeId && s.gradeId !== newGradeId) return false;
                          const targetGrade = grades?.find((g) => g.id === newGradeId);
                          if (targetGrade && s.grade?.code && s.grade.code !== targetGrade.code) return false;
                        }
                        const cat = s.schoolCategory || "ARABIC";
                        return cat === newSchoolCategory;
                      })
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    الوحدة الدراسية
                  </label>
                  <select
                    value={newUnitId}
                    onChange={(e) => {
                      setNewUnitId(e.target.value);
                      setNewLessonId("");
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="">بدون وحدة محددة</option>
                    {activeNewSubject?.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    الدرس المستهدف (اختياري)
                  </label>
                  <select
                    value={newLessonId}
                    onChange={(e) => setNewLessonId(e.target.value)}
                    disabled={!newUnitId}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold disabled:opacity-50"
                  >
                    <option value="">بدون درس محدد (عام للوحدة)</option>
                    {activeNewSubject?.units
                      .find((u) => u.id === newUnitId)
                      ?.lessons?.map((l) => (
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
                    نوع السؤال
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="MCQ">اختيار من متعدد (MCQ)</option>
                    <option value="TRUE_FALSE">صح أو خطأ</option>
                    <option value="ESSAY">سؤال مقالي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="EASY">سهل</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HARD">متقدم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                  نص السؤال *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="اكتب نص السؤال بدقة هنا..."
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium"
                />
              </div>

              {/* Options Form for MCQ */}
              {newType === "MCQ" && (
                <div className="space-y-3">
                  <label className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    خيارات الإجابة (حدد الإجابة الصحيحة بالدائرة الخضراء):
                  </label>
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newOptions.map((o, idx) => ({
                            ...o,
                            isCorrect: idx === i,
                          }));
                          setNewOptions(updated);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          opt.isCorrect
                            ? "bg-[#059669] border-[#059669] text-white"
                            : "border-[#E2E8F0] hover:border-[#E2E8F0]"
                        }`}
                      >
                        {opt.isCorrect && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <input
                        type="text"
                        required
                        placeholder={`الخيار ${i + 1}`}
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[i].text = e.target.value;
                          setNewOptions(updated);
                        }}
                        className="flex-1 h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Options Form for True/False */}
              {newType === "TRUE_FALSE" && (
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    الإجابة الصحيحة:
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] font-bold">
                      <input
                        type="radio"
                        name="tf_new"
                        checked={newOptions[0].isCorrect}
                        onChange={() => {
                          const updated = [...newOptions];
                          updated[0].isCorrect = true;
                          setNewOptions(updated);
                        }}
                      />
                      <span>صواب (صح)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] font-bold">
                      <input
                        type="radio"
                        name="tf_new"
                        checked={!newOptions[0].isCorrect}
                        onChange={() => {
                          const updated = [...newOptions];
                          updated[0].isCorrect = false;
                          setNewOptions(updated);
                        }}
                      />
                      <span>خطأ</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Essay Model Answer */}
              {newType === "ESSAY" && (
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    نموذج الإجابة الاسترشادي (Rubric Model Answer)
                  </label>
                  <textarea
                    rows={3}
                    value={newModelAnswer}
                    onChange={(e) => setNewModelAnswer(e.target.value)}
                    placeholder="اكتب الإجابة النموذجية المعتمدة لتقييم إجابة الطالب..."
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium"
                  />
                </div>
              )}

              {/* Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    المفهوم الأساسي للسؤال
                  </label>
                  <input
                    type="text"
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    placeholder="مثال: قانون أوم للدوائر المغلقة"
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    تفسير الإجابة الصحيحة
                  </label>
                  <input
                    type="text"
                    value={newCorrectReason}
                    onChange={(e) => setNewCorrectReason(e.target.value)}
                    placeholder="سبب اختيار هذه الإجابة وتوضيح الفكرة..."
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الإضافة..." : "حفظ السؤال"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 space-y-5 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#800020]" />
                <span>تعديل بيانات السؤال</span>
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] text-[13px] font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    المادة الدراسية
                  </label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => {
                      setEditSubjectId(e.target.value);
                      const target = subjects.find((s) => s.id === e.target.value);
                      setEditUnitId(target?.units[0]?.id || "");
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
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
                    الوحدة الدراسية
                  </label>
                  <select
                    value={editUnitId}
                    onChange={(e) => {
                      setEditUnitId(e.target.value);
                      setEditLessonId("");
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="">بدون وحدة محددة</option>
                    {activeEditSubject?.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    الدرس المستهدف (اختياري)
                  </label>
                  <select
                    value={editLessonId}
                    onChange={(e) => setEditLessonId(e.target.value)}
                    disabled={!editUnitId}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold disabled:opacity-50"
                  >
                    <option value="">بدون درس محدد (عام للوحدة)</option>
                    {activeEditSubject?.units
                      .find((u) => u.id === editUnitId)
                      ?.lessons?.map((l) => (
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
                    نوع السؤال
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="MCQ">اختيار من متعدد (MCQ)</option>
                    <option value="TRUE_FALSE">صح أو خطأ</option>
                    <option value="ESSAY">سؤال مقالي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="EASY">سهل</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HARD">متقدم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                  نص السؤال *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editStatement}
                  onChange={(e) => setEditStatement(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium"
                />
              </div>

              {/* Edit Options */}
              {editType === "MCQ" && (
                <div className="space-y-3">
                  <label className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    خيارات الإجابة:
                  </label>
                  {editOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editOptions.map((o, idx) => ({
                            ...o,
                            isCorrect: idx === i,
                          }));
                          setEditOptions(updated);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          opt.isCorrect
                            ? "bg-[#059669] border-[#059669] text-white"
                            : "border-[#E2E8F0] hover:border-[#E2E8F0]"
                        }`}
                      >
                        {opt.isCorrect && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...editOptions];
                          updated[i].text = e.target.value;
                          setEditOptions(updated);
                        }}
                        className="flex-1 h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Edit Essay Model Answer */}
              {editType === "ESSAY" && (
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    نموذج الإجابة الاسترشادي (Rubric)
                  </label>
                  <textarea
                    rows={3}
                    value={editModelAnswer}
                    onChange={(e) => setEditModelAnswer(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium"
                  />
                </div>
              )}

              {/* Edit Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    المفهوم الأساسي للسؤال
                  </label>
                  <input
                    type="text"
                    value={editConcept}
                    onChange={(e) => setEditConcept(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    تفسير الإجابة الصحيحة
                  </label>
                  <input
                    type="text"
                    value={editCorrectReason}
                    onChange={(e) => setEditCorrectReason(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "تحديث السؤال"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORD IMPORT MODAL */}
      {isWordImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-5 shadow-sm relative">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center ">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                    استيراد بنك الأسئلة (Word / PDF)
                  </h2>
                  <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                    استيراد فوري للأسئلة مع الفصل الكامل بين المدارس العربي واللغات وربط الدروس
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWordImportOpen(false)}
                className="w-11 h-11 rounded-full bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#334155] dark:hover:bg-[#1E293B] flex items-center justify-center text-[#64748B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <QuestionWordImporter
              subjects={subjects as any}
              grades={grades as any}
              initialGradeId={
                selectedGradeCode === "bacc_g10"
                  ? g10Grade?.id
                  : selectedGradeCode === "bacc_g11"
                  ? g11Grade?.id
                  : undefined
              }
              initialSchoolCategory={
                selectedCategory !== "all"
                  ? (selectedCategory as "ARABIC" | "LANGUAGES")
                  : undefined
              }
              isModal={true}
              onSuccess={() => {
                setIsWordImportOpen(false);
                router.refresh();
                fetch("/api/admin/questions")
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.questions) setQuestions(data.questions);
                  })
                  .catch(() => {});
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
