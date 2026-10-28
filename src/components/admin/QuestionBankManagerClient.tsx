"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { QuestionWordImporter } from "@/components/admin/QuestionWordImporter";
import {
  Question,
  Subject,
  Grade,
  QuestionBankManagerClientProps,
} from "./questions/types";
import { QuestionFilterBar } from "./questions/QuestionFilterBar";
import { QuestionCard } from "./questions/QuestionCard";
import { QuestionFormModal } from "./questions/QuestionFormModal";

export type {
  Question,
  Subject,
  Grade,
  QuestionBankManagerClientProps,
} from "./questions/types";

export function QuestionBankManagerClient({
  initialQuestions,
  subjects,
  grades,
}: QuestionBankManagerClientProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  // Grade & School Category Primary Hierarchy Filters
  const [selectedGradeCode, setSelectedGradeCode] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isWordImportOpen, setIsWordImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Helper to determine subject school category
  const getSubjectCategory = (subjectId: string): "ARABIC" | "LANGUAGES" => {
    const s = subjects.find((sub) => sub.id === subjectId);
    return s?.schoolCategory === "LANGUAGES" ? "LANGUAGES" : "ARABIC";
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

  const handleQuestionSaved = (savedQuestion: Question) => {
    setQuestions((prev) => {
      const exists = prev.some((q) => q.id === savedQuestion.id);
      if (exists) {
        return prev.map((q) => (q.id === savedQuestion.id ? savedQuestion : q));
      }
      return [savedQuestion, ...prev];
    });
  };

  // Filter available subjects based on active grade & category selection
  const availableSubjects = subjects.filter((s) => {
    if (selectedGradeCode !== "all") {
      const grade = grades?.find((g) => g.code === selectedGradeCode);
      if (grade && s.gradeId !== grade.id) return false;
    }
    if (selectedCategory !== "all") {
      if (s.schoolCategory !== selectedCategory) return false;
    }
    return true;
  });

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (selectedGradeCode !== "all") {
      const grade = grades?.find((g) => g.code === selectedGradeCode);
      if (grade && q.subject?.gradeId !== grade.id) return false;
    }
    if (selectedCategory !== "all") {
      const effectiveCategory =
        q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id);
      if (effectiveCategory !== selectedCategory) return false;
    }
    if (selectedSubjectId !== "all" && q.subject.id !== selectedSubjectId)
      return false;
    if (selectedType !== "all" && q.type !== selectedType) return false;
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty)
      return false;
    if (searchQuery.trim()) {
      const qText = searchQuery.toLowerCase();
      const matchStatement = q.statement.toLowerCase().includes(qText);
      const matchConcept = q.explanation?.concept?.toLowerCase().includes(qText);
      if (!matchStatement && !matchConcept) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <QuestionFilterBar
        selectedGradeCode={selectedGradeCode}
        setSelectedGradeCode={setSelectedGradeCode}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        availableSubjects={availableSubjects}
        totalQuestions={questions.length}
        filteredCount={filteredQuestions.length}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] text-[#94A3B8] flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#0F172A] dark:text-white">
              لا توجد أسئلة تطابق معايير التصفية المحددة
            </h4>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
              جرب تغيير كلمات البحث أو اختيار مادة أو مرحلة دراسية مختلفة، أو أضف سؤالاً جديداً.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              getSubjectCategory={getSubjectCategory}
              onEdit={(question) => setEditingQuestion(question)}
              onDelete={handleDeleteQuestion}
            />
          ))
        )}
      </div>

      {/* Create Question Modal */}
      {isCreateOpen && (
        <QuestionFormModal
          isOpen={isCreateOpen}
          mode="create"
          subjects={subjects}
          grades={grades}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handleQuestionSaved}
        />
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <QuestionFormModal
          isOpen={Boolean(editingQuestion)}
          mode="edit"
          editingQuestion={editingQuestion}
          subjects={subjects}
          grades={grades}
          onClose={() => setEditingQuestion(null)}
          onSuccess={handleQuestionSaved}
        />
      )}

      {/* Word / PDF Import Modal */}
      {isWordImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 space-y-6 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155] max-h-[92vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                استيراد أسئلة ذكي من ملفات Word / PDF
              </h3>
              <button
                type="button"
                onClick={() => setIsWordImportOpen(false)}
                className="w-10 h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] cursor-pointer"
              >
                ×
              </button>
            </div>
            <QuestionWordImporter
              subjects={subjects as any}
              onImportSuccess={() => {
                setIsWordImportOpen(false);
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
