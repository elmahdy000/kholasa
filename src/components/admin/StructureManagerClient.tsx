"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  BookOpen,
  FolderTree,
  ChevronDown,
  ChevronLeft,
  X,
  Sparkles,
  Palette,
  ExternalLink,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code: string;
  color?: string | null;
  isPublished: boolean;
  order: number;
  _count?: {
    units: number;
    questions: number;
    exams: number;
  };
}

interface Grade {
  id: string;
  name: string;
  code: string;
  order: number;
  systemId: string;
  subjects: Subject[];
}

interface System {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  order: number;
  grades: Grade[];
}

interface StructureManagerClientProps {
  initialSystems: System[];
}

export function StructureManagerClient({
  initialSystems,
}: StructureManagerClientProps) {
  const [systems, setSystems] = useState<System[]>(initialSystems);
  const [selectedSystemId, setSelectedSystemId] = useState<string>(
    initialSystems[0]?.id || ""
  );

  // Modals
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

  const handleDeleteSystem = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا النظام التعليمي وجميع صفوفه ومواده؟"))
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/structure?type=system&id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refreshData();
    } catch (err: any) {
      alert(err.message || "فشل الحذف");
    } finally {
      setLoading(false);
    }
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

  const handleDeleteGrade = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الصف الدراسي؟")) return;
    try {
      const res = await fetch(`/api/admin/structure?type=grade&id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refreshData();
    } catch (err: any) {
      alert(err.message || "فشل الحذف");
    }
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

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المادة؟")) return;
    try {
      const res = await fetch(`/api/admin/structure?type=subject&id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refreshData();
    } catch (err: any) {
      alert(err.message || "فشل الحذف");
    }
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
          className="h-11 px-4 rounded-lg bg-[#334155] hover:bg-[#334155] dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#1E293B] text-[13px] font-semibold flex items-center gap-2 transition-all  cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة نظام تعليمي جديد</span>
        </button>
      </div>

      {/* Systems Segmented Tabs (Vercel Style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        {systems.map((system) => {
          const isSelected = system.id === selectedSystemId;
          return (
            <button
              key={system.id}
              onClick={() => setSelectedSystemId(system.id)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-[#334155] text-white dark:bg-[#F8FAFC] dark:text-[#1E293B] font-semibold "
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
        <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] p-5 space-y-6 ">
          {/* System Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0]/80 dark:border-[#334155]/80">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {activeSystem.name}
                </h2>
                <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC]">
                  {activeSystem.code}
                </span>
                {activeSystem.isActive ? (
                  <span className="px-2 py-1 rounded text-[13px] bg-[#059669]/10 text-[#059669] font-semibold">
                    مفعل
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded text-[13px] bg-[#64748B] text-[#64748B]">
                    معطل
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                {activeSystem.description || "لا يوجد وصف مدخل لهذا النظام"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSystemModal({ isOpen: true, mode: "edit", system: activeSystem })
                }
                className="h-11 px-3 rounded-md border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>تعديل النظام</span>
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
                  <div
                    key={grade.id}
                    className="rounded-lg border border-[#E2E8F0] dark:border-[#334155]/80 bg-[#F8FAFC]/50 dark:bg-[#1E293B]/20 p-4 space-y-3"
                  >
                    {/* Grade Header */}
                    <div className="flex items-center justify-between border-b border-[#E2E8F0]/60 dark:border-[#334155]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                          {grade.name}
                        </span>
                        <span className="text-[13px] font-mono text-[#64748B] px-2 py-1 rounded bg-[#E2E8F0] dark:bg-[#334155]">
                          {grade.code}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setSubjectModal({
                              isOpen: true,
                              systemId: activeSystem.id,
                              gradeId: grade.id,
                            })
                          }
                          className="h-7 px-3 rounded text-[13px] font-semibold bg-[#334155] dark:bg-[#F8FAFC] text-white dark:text-[#1E293B] hover:opacity-90 flex items-center gap-1 transition-opacity cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>إضافة مادة</span>
                        </button>
                        <button
                          onClick={() =>
                            setGradeModal({
                              isOpen: true,
                              systemId: activeSystem.id,
                              grade,
                            })
                          }
                          className="p-1 rounded text-[#64748B] hover:text-[#64748B] dark:hover:text-[#F8FAFC]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGrade(grade.id)}
                          className="p-1 rounded text-[#64748B] hover:text-[#DC2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subjects Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                      {grade.subjects.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]/80 hover:border-[#E2E8F0] dark:hover:border-[#E11D48]/60 transition-colors flex flex-col justify-between space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: sub.color || "#800020" }}
                              />
                              <span className="font-bold text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">
                                {sub.name}
                              </span>
                            </div>
                            <span className="text-[13px] font-mono text-[#64748B]">
                              {sub.code}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[13px] text-[#64748B] pt-1 border-t border-[#E2E8F0] dark:border-[#334155]">
                            <span className="font-mono">
                              {sub._count?.units || 0} وحدات · {sub._count?.exams || 0} امتحانات
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setSubjectModal({
                                    isOpen: true,
                                    systemId: activeSystem.id,
                                    gradeId: grade.id,
                                    subject: sub,
                                  })
                                }
                                className="p-1 rounded text-[#64748B] hover:text-[#64748B]"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(sub.id)}
                                className="p-1 rounded text-[#64748B] hover:text-[#DC2626]"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {grade.subjects.length === 0 && (
                        <div className="col-span-full py-4 text-center text-[13px] text-[#64748B] border border-dashed border-[#E2E8F0] dark:border-[#334155] rounded">
                          لا توجد مواد دراسية مضافة لهذا الصف بعد.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* System Modal */}
      {systemModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                {systemModal.mode === "create"
                  ? "إضافة نظام تعليمي جديد"
                  : "تعديل النظام التعليمي"}
              </h3>
              <button
                onClick={() => setSystemModal({ isOpen: false, mode: "create" })}
                className="p-1 rounded text-[#64748B] hover:text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-[13px]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveSystem} className="space-y-3">
              <div>
                <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                  اسم النظام التعليمي
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={systemModal.system?.name || ""}
                  placeholder="مثال: الثانوية العامة المصرية"
                  className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                  رمز النظام (Code)
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={systemModal.system?.code || ""}
                  placeholder="مثال: EGY_GEN_SEC"
                  className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                  الوصف
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={systemModal.system?.description || ""}
                  placeholder="وصف مختصر للنظام والمسارات التابعة له..."
                  className="w-full p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  name="isActive"
                  id="sysActive"
                  defaultChecked={systemModal.system?.isActive ?? true}
                  className="rounded border-[#94A3B8] text-[#800020] focus:ring-0"
                />
                <label
                  htmlFor="sysActive"
                  className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  النظام مفعل ومتاح للطلاب
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setSystemModal({ isOpen: false, mode: "create" })}
                  className="h-11 px-3 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-4 rounded-md bg-[#334155] dark:bg-[#F8FAFC] text-white dark:text-[#1E293B] text-[13px] font-semibold hover:opacity-90 transition-opacity"
                >
                  {loading ? "جاري الحفظ..." : "حفظ النظام"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {gradeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                {gradeModal.grade ? "تعديل الصف الدراسي" : "إضافة صف دراسي جديد"}
              </h3>
              <button
                onClick={() => setGradeModal({ isOpen: false, systemId: "" })}
                className="p-1 rounded text-[#64748B] hover:text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div>
                <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                  اسم الصف
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={gradeModal.grade?.name || ""}
                  placeholder="مثال: الصف الثالث الثانوي"
                  className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                  رمز الصف (Code)
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={gradeModal.grade?.code || ""}
                  placeholder="مثال: G12"
                  className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-mono outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setGradeModal({ isOpen: false, systemId: "" })}
                  className="h-11 px-3 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-4 rounded-md bg-[#334155] dark:bg-[#F8FAFC] text-white dark:text-[#1E293B] text-[13px] font-semibold hover:opacity-90 transition-opacity"
                >
                  {loading ? "جاري الحفظ..." : "حفظ الصف"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {subjectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                {subjectModal.subject ? "تعديل المادة الدراسية" : "إضافة مادة دراسية جديدة"}
              </h3>
              <button
                onClick={() =>
                  setSubjectModal({ isOpen: false, systemId: "", gradeId: "" })
                }
                className="p-1 rounded text-[#64748B] hover:text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3">
              <div>
                <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                  اسم المادة
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={subjectModal.subject?.name || ""}
                  placeholder="مثال: الفيزياء الحديثة"
                  className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                  رمز المادة (Code)
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={subjectModal.subject?.code || ""}
                  placeholder="مثال: PHYS_G12"
                  className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                  لون الهوية للمادة
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="color"
                    defaultValue={subjectModal.subject?.color || "#800020"}
                    className="w-11 h-11 rounded border border-[#E2E8F0] dark:border-[#334155] p-1 cursor-pointer bg-transparent"
                  />
                  <span className="text-[13px] font-mono text-[#64748B]">
                    رمز اللون المستخدم في الواجهة
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  name="isPublished"
                  id="subPublished"
                  defaultChecked={subjectModal.subject?.isPublished ?? true}
                  className="rounded border-[#94A3B8] text-[#800020] focus:ring-0"
                />
                <label
                  htmlFor="subPublished"
                  className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  نشر المادة وإتاحتها للطلاب
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() =>
                    setSubjectModal({ isOpen: false, systemId: "", gradeId: "" })
                  }
                  className="h-11 px-3 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-4 rounded-md bg-[#334155] dark:bg-[#F8FAFC] text-white dark:text-[#1E293B] text-[13px] font-semibold hover:opacity-90 transition-opacity"
                >
                  {loading ? "جاري الحفظ..." : "حفظ المادة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
