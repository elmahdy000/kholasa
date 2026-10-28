"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { Subject, ExamItem } from "./exams/types";
import { ExamFilterBar } from "./exams/ExamFilterBar";
import { ExamCard } from "./exams/ExamCard";
import { ExamCreateForm } from "./exams/ExamCreateForm";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
    if (
      !confirm(
        `هل أنت متأكد من رغبتك في حذف امتحان "${examTitle}"؟ لا يمكن التراجع عن هذا الإجراء.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExams((prev) => prev.filter((e) => e.id !== examId));
      } else {
        const data = await res.json();
        alert(data.error || "فشل حذف الامتحان");
      }
    } catch {
      alert("حدث خطأ أثناء محاولة حذف الامتحان");
    }
  };

  const handleExamCreated = (newExam: ExamItem) => {
    setExams((prev) => [newExam, ...prev]);
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
    </div>
  );
}
