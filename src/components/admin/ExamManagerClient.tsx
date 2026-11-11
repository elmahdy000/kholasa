"use client";

import { useState, useRef } from "react";
import { Layers } from "lucide-react";
import { Subject, ExamItem } from "./exams/types";
import { ExamFilterBar } from "./exams/ExamFilterBar";
import { ExamCard } from "./exams/ExamCard";
import { ExamCreateForm } from "./exams/ExamCreateForm";
import { ExamEditModal } from "./exams/ExamEditModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ExamSimulatorModal, SimulatedQuestion } from "./exams/ExamSimulatorModal";

export type { Subject, ExamItem } from "./exams/types";

interface ExamManagerClientProps {
  initialExams: ExamItem[];
  subjects: Subject[];
}

export function ExamManagerClient({
  initialExams,
  subjects,
}: ExamManagerClientProps) {
  const [exams, setExams] = useState<ExamItem[]>(initialExams);
  const [prevInitialExams, setPrevInitialExams] = useState<ExamItem[]>(initialExams);
  if (prevInitialExams !== initialExams) {
    setPrevInitialExams(initialExams);
    setExams(initialExams);
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const pendingToggles = useRef(new Set<string>());

  // Simulator State
  const [simulatingExam, setSimulatingExam] = useState<{
    isOpen: boolean;
    examTitle: string;
    durationMinutes: number;
    subjectName: string;
    questions: SimulatedQuestion[];
    isPractice: boolean;
  } | null>(null);
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false);

  // Confirmation dialog state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: async () => {},
  });

  // Toggle Exam Mode (Official Exam vs Practice)
  const handleTogglePractice = async (examId: string, currentIsPractice: boolean) => {
    if (pendingToggles.current.has(examId)) return;
    pendingToggles.current.add(examId);
    setToggleError(null);
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
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "تعذر تغيير وضع الامتحان");
      }
    } catch (error) {
      setToggleError(error instanceof Error ? error.message : "تعذر تغيير وضع الامتحان. حاول مرة أخرى.");
      setExams((prev) =>
        prev.map((e) =>
          e.id === examId ? { ...e, isPractice: currentIsPractice } : e
        )
      );
    } finally {
      pendingToggles.current.delete(examId);
    }
  };

  // Delete Exam
  const handleDeleteExam = (examId: string, examTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف الامتحان",
      description: `هل أنت متأكد من رغبتك في حذف امتحان "${examTitle}"؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.`,
      onConfirm: async () => {
        const res = await fetch(`/api/admin/exams/${examId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setExams((prev) => prev.filter((e) => e.id !== examId));
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } else {
          const data = await res.json();
          throw new Error(data.error || "فشل حذف الامتحان");
        }
      },
    });
  };

  const handleExamUpdated = (updated: ExamItem) => {
    setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleExamCreated = (newExam: ExamItem) => {
    setExams((prev) => [newExam, ...prev]);
  };

  // Launch Simulator for an existing exam
  const handleSimulateExam = async (exam: ExamItem) => {
    setIsLoadingSimulation(true);
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر تحميل بيانات الامتحان");

      const mappedQuestions: SimulatedQuestion[] = (data.exam.questions || []).map((eq: any) => {
        const q = eq.question;
        return {
          id: q.id,
          statement: q.statement,
          translation: q.translation,
          type: q.type,
          difficulty: q.difficulty,
          unitTitle: q.unit?.title,
          lessonTitle: q.lessons?.[0]?.lesson?.title,
          options: (q.options || []).map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            translation: opt.translation,
            isCorrect: opt.isCorrect,
            order: opt.order,
          })),
          explanation: q.explanation,
          rubric: q.rubric,
        };
      });

      setSimulatingExam({
        isOpen: true,
        examTitle: exam.title,
        durationMinutes: exam.durationMinutes,
        subjectName: exam.subject.name,
        questions: mappedQuestions,
        isPractice: exam.isPractice,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل تحميل محاكاة الامتحان");
    } finally {
      setIsLoadingSimulation(false);
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
      {toggleError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{toggleError}</p>}
      <ExamFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        subjects={subjects}
        totalExams={exams.length}
        filteredCount={filteredExams.length}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Grid of Exams */}
      {filteredExams.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] text-[#94A3B8] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#0F172A] dark:text-white">
            لا توجد امتحانات مطابقة للبحث أو الفلتر
          </h4>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
            جرّب تغيير كلمات البحث أو اختر مادة دراسية أخرى، أو قم بإنشاء امتحان جديد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onTogglePractice={handleTogglePractice}
              onDeleteExam={handleDeleteExam}
              onSimulate={handleSimulateExam}
              onEdit={(e) => setEditingExam(e)}
            />
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <ExamCreateForm
            subjects={subjects}
            isStandaloneRoute={false}
            onClose={() => setIsCreateOpen(false)}
            onExamCreated={handleExamCreated}
          />
        </div>
      )}

      {/* Simulator Modal for Admin Sandbox Test */}
      {simulatingExam && (
        <ExamSimulatorModal
          isOpen={simulatingExam.isOpen}
          onClose={() => setSimulatingExam(null)}
          examTitle={simulatingExam.examTitle}
          durationMinutes={simulatingExam.durationMinutes}
          subjectName={simulatingExam.subjectName}
          questions={simulatingExam.questions}
          isPractice={simulatingExam.isPractice}
        />
      )}

      {/* Loading Overlay when fetching simulation data */}
      {isLoadingSimulation && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] shadow-xl flex items-center gap-3 text-[13px] font-bold text-[#0F172A] dark:text-white">
            <div className="w-5 h-5 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
            <span>جارٍ تجهيز محاكاة الامتحان...</span>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {editingExam && (
        <ExamEditModal
          isOpen={Boolean(editingExam)}
          exam={editingExam}
          onClose={() => setEditingExam(null)}
          onSaved={handleExamUpdated}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmModal
        open={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        confirmText="تأكيد الحذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
}
