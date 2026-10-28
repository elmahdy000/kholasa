"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  FolderTree,
} from "lucide-react";
import {
  System,
  Grade,
  Subject,
  StructureManagerClientProps,
} from "./structure/types";
import { GradeCard } from "./structure/GradeCard";
import { SystemModal } from "./structure/SystemModal";
import { GradeModal } from "./structure/GradeModal";
import { SubjectModal } from "./structure/SubjectModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export type {
  System,
  Grade,
  Subject,
  StructureManagerClientProps,
} from "./structure/types";

export function StructureManagerClient({
  initialSystems,
}: StructureManagerClientProps) {
  const [systems, setSystems] = useState<System[]>(initialSystems);
  const [selectedSystemId, setSelectedSystemId] = useState<string>(
    initialSystems[0]?.id || ""
  );

  // Confirmation modal state
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

  // Modals state
  const [systemModal, setSystemModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    system?: System;
  }>({ isOpen: false, mode: "create" });

  const [gradeModal, setGradeModal] = useState<{
    isOpen: boolean;
    systemId: string;
    grade?: Grade;
  }>({ isOpen: false, systemId: "" });

  const [subjectModal, setSubjectModal] = useState<{
    isOpen: boolean;
    systemId: string;
    gradeId: string;
    subject?: Subject;
  }>({ isOpen: false, systemId: "", gradeId: "" });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const activeSystem = systems.find((s) => s.id === selectedSystemId) || systems[0];

  const refreshData = async () => {
    try {
      const res = await fetch("/api/admin/structure");
      const data = await res.json();
      if (data.systems) {
        setSystems(data.systems);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for System
  const handleSaveSystem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "on";

    try {
      if (systemModal.mode === "create") {
        const res = await fetch("/api/admin/structure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "system",
            data: { name, code, description, isActive },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch("/api/admin/structure", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "system",
            id: systemModal.system?.id,
            data: { name, code, description, isActive },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setSystemModal({ isOpen: false, mode: "create" });
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSystem = (id: string) => {
    const sys = systems.find((s) => s.id === id);
    const sysName = sys ? `"${sys.name}"` : "هذا النظام التعليمي";
    setConfirmModal({
      isOpen: true,
      title: "حذف النظام التعليمي",
      description: `هل أنت متأكد من حذف ${sysName} وجميع صفوفه ومواده؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.`,
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/structure?type=system&id=${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          await refreshData();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          setErrorMsg(err.message || "فشل الحذف");
          throw err;
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Handlers for Grade
  const handleSaveGrade = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const order = Number(formData.get("order") || 0);

    try {
      if (!gradeModal.grade) {
        const res = await fetch("/api/admin/structure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "grade",
            data: { name, code, systemId: gradeModal.systemId, order },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch("/api/admin/structure", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "grade",
            id: gradeModal.grade.id,
            data: { name, code, order },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setGradeModal({ isOpen: false, systemId: "" });
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGrade = (id: string) => {
    const grade = systems.flatMap((s) => s.grades).find((g) => g.id === id);
    const gradeName = grade ? `"${grade.name}"` : "هذا الصف الدراسي";
    setConfirmModal({
      isOpen: true,
      title: "حذف الصف الدراسي",
      description: `هل أنت متأكد من حذف ${gradeName} وجميع مواده ومحتوياته؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/structure?type=grade&id=${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          await refreshData();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          setErrorMsg(err.message || "فشل الحذف");
          throw err;
        }
      },
    });
  };

  // Handlers for Subject
  const handleSaveSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const color = formData.get("color") as string;
    const isPublished = formData.get("isPublished") === "on";

    try {
      if (!subjectModal.subject) {
        const res = await fetch("/api/admin/structure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subject",
            data: {
              name,
              code,
              color,
              systemId: subjectModal.systemId,
              gradeId: subjectModal.gradeId,
              isPublished,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch("/api/admin/structure", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subject",
            id: subjectModal.subject.id,
            data: { name, code, color, isPublished },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setSubjectModal({ isOpen: false, systemId: "", gradeId: "" });
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = (id: string) => {
    const subject = systems
      .flatMap((s) => s.grades)
      .flatMap((g) => g.subjects)
      .find((sub) => sub.id === id);
    const subjectName = subject ? `"${subject.name}"` : "هذه المادة";
    setConfirmModal({
      isOpen: true,
      title: "حذف المادة الدراسية",
      description: `هل أنت متأكد من حذف ${subjectName} وجميع وحداتها ودروسها؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/structure?type=subject&id=${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          await refreshData();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          setErrorMsg(err.message || "فشل الحذف");
          throw err;
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0F172A] dark:text-[#F8FAFC]" />
            <span>الهيكل الأكاديمي والأنظمة والصفوف</span>
          </h1>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            إدارة الأنظمة التعليمية (عام، لغات، أزهر)، الصفوف الدراسية، وتوزيع المواد
          </p>
        </div>

        <button
          onClick={() => setSystemModal({ isOpen: true, mode: "create" })}
          className="h-11 px-4 rounded-lg bg-[#334155] hover:bg-[#334155] dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#1E293B] text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة نظام تعليمي جديد</span>
        </button>
      </div>

      {/* Systems Segmented Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        {systems.map((system) => {
          const isSelected = system.id === selectedSystemId;
          return (
            <button
              key={system.id}
              onClick={() => setSelectedSystemId(system.id)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-[#334155] text-white dark:bg-[#F8FAFC] dark:text-[#1E293B] font-semibold"
                  : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              <span>{system.name}</span>
              <span className="text-[13px] font-mono opacity-60">
                ({system.grades.length} صفوف)
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected System Content Card */}
      {activeSystem ? (
        <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] p-5 space-y-6">
          {/* System Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0]/80 dark:border-[#334155]/80">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {activeSystem.name}
                </h2>
                <span className="text-[13px] font-mono text-[#64748B] px-2 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#334155]">
                  {activeSystem.code}
                </span>
                <span
                  className={`text-[12px] font-semibold px-2 py-0.5 rounded ${
                    activeSystem.isActive
                      ? "bg-[#059669]/10 text-[#059669]"
                      : "bg-[#DC2626]/10 text-[#DC2626]"
                  }`}
                >
                  {activeSystem.isActive ? "نشط" : "معطل"}
                </span>
              </div>
              {activeSystem.description && (
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                  {activeSystem.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSystemModal({
                    isOpen: true,
                    mode: "edit",
                    system: activeSystem,
                  })
                }
                className="h-11 px-3 rounded-md border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>تعديل</span>
              </button>
              <button
                onClick={() => handleDeleteSystem(activeSystem.id)}
                className="h-11 px-3 rounded-md border border-[#E2E8F0] dark:border-[#F87171]/50 hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] text-[13px] font-medium text-[#DC2626] dark:text-[#F87171] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
              <button
                onClick={() =>
                  setGradeModal({ isOpen: true, systemId: activeSystem.id })
                }
                className="h-11 px-3 rounded-md bg-[#334155] hover:bg-[#334155] dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#1E293B] text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة صف دراسي</span>
              </button>
            </div>
          </div>

          {/* Grades and Subjects Grid */}
          <div className="space-y-6">
            <h3 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
              الصفوف الدراسية والمواد التابعة ({activeSystem.grades.length})
            </h3>

            {activeSystem.grades.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E2E8F0] dark:border-[#334155] rounded-lg">
                <FolderTree className="w-11 h-11 text-[#64748B] mx-auto mb-2 opacity-50" />
                <p className="text-[13px] text-[#64748B]">
                  لا توجد صفوف دراسية مسجلة في هذا النظام حالياً
                </p>
                <button
                  onClick={() =>
                    setGradeModal({ isOpen: true, systemId: activeSystem.id })
                  }
                  className="mt-3 text-[13px] text-[#800020] font-semibold hover:underline"
                >
                  + إضافة الصف الأول الآن
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSystem.grades.map((grade) => (
                  <GradeCard
                    key={grade.id}
                    grade={grade}
                    onAddSubject={(gradeId) =>
                      setSubjectModal({
                        isOpen: true,
                        systemId: activeSystem.id,
                        gradeId,
                      })
                    }
                    onEditGrade={(g) =>
                      setGradeModal({
                        isOpen: true,
                        systemId: activeSystem.id,
                        grade: g,
                      })
                    }
                    onDeleteGrade={handleDeleteGrade}
                    onEditSubject={(gradeId, sub) =>
                      setSubjectModal({
                        isOpen: true,
                        systemId: activeSystem.id,
                        gradeId,
                        subject: sub,
                      })
                    }
                    onDeleteSubject={handleDeleteSubject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* System Modal */}
      <SystemModal
        isOpen={systemModal.isOpen}
        mode={systemModal.mode}
        system={systemModal.system}
        loading={loading}
        errorMsg={errorMsg}
        onClose={() => setSystemModal({ isOpen: false, mode: "create" })}
        onSubmit={handleSaveSystem}
      />

      {/* Grade Modal */}
      <GradeModal
        isOpen={gradeModal.isOpen}
        grade={gradeModal.grade}
        loading={loading}
        onClose={() => setGradeModal({ isOpen: false, systemId: "" })}
        onSubmit={handleSaveGrade}
      />

      {/* Subject Modal */}
      <SubjectModal
        isOpen={subjectModal.isOpen}
        subject={subjectModal.subject}
        loading={loading}
        onClose={() => setSubjectModal({ isOpen: false, systemId: "", gradeId: "" })}
        onSubmit={handleSaveSubject}
      />

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
