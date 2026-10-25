"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Layers, AlertCircle } from "lucide-react";

interface UnitData {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  isPublished: boolean;
  subjectId?: string;
}

interface UnitEditorModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  subjectId: string;
  subjectName: string;
  initialUnit?: UnitData | null;
  onClose: () => void;
  onSaved: (unit: UnitData) => void;
  onDeleted?: (unitId: string) => void;
}

export function UnitEditorModal({
  isOpen,
  mode,
  subjectId,
  subjectName,
  initialUnit,
  onClose,
  onSaved,
  onDeleted,
}: UnitEditorModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (mode === "edit" && initialUnit) {
        setTitle(initialUnit.title || "");
        setDescription(initialUnit.description || "");
        setOrder(initialUnit.order ?? 0);
        setIsPublished(initialUnit.isPublished ?? true);
      } else {
        setTitle("");
        setDescription("");
        setOrder(0);
        setIsPublished(true);
      }

      setErrorMsg(null);
      setShowDeleteConfirm(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, mode, initialUnit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("عنوان الوحدة مطلوب");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/units", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId,
            title: title.trim(),
            description: description.trim() || null,
            order: Number(order),
            isPublished,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "فشل إنشاء الوحدة");
        }

        onSaved(data.unit);
      } else if (mode === "edit" && initialUnit) {
        const res = await fetch(`/api/admin/units/${initialUnit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            order: Number(order),
            isPublished,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "فشل تحديث بيانات الوحدة");
        }

        onSaved(data.unit);
      }

      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الوحدة");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialUnit?.id) return;
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/units/${initialUnit.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "فشل حذف الوحدة");
      }

      if (onDeleted) {
        onDeleted(initialUnit.id);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ أثناء حذف الوحدة");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-3 font-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#800020]/10 text-[#800020] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {mode === "create" ? "إضافة وحدة تعليمية جديدة" : "تعديل بيانات الوحدة"}
              </h3>
              <p className="text-[13px] text-[#64748B] font-bold">
                المادة: {subjectName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#334155] dark:hover:bg-[#1E293B] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="px-5 py-3 text-[13px] font-bold bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#1E293B] dark:text-[#F87171] border-b border-[#E2E8F0] dark:border-[#F87171] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              عنوان الوحدة *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الوحدة الأولى: التركيب والوظيفة في الكائنات الحية"
              className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              وصف توضيحي للوحدة (اختياري)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لأهداف ومواضيع الوحدة..."
              className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                الترتيب
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                حالة النشر
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full h-11 px-3 rounded-xl text-[13px] font-bold flex items-center justify-center border transition-colors ${
                  isPublished
                    ? "bg-[#059669]/10 text-[#059669] border-[#059669]/20"
                    : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                }`}
              >
                {isPublished ? "منشورة للطلاب" : "مسودة مخفية"}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3">
            {mode === "edit" && onDeleted ? (
              <div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="h-11 px-3 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold transition-colors"
                    >
                      {isDeleting ? "..." : "تأكيد حذف الوحدة"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="h-11 px-2 rounded-lg bg-[#E2E8F0] text-[#0F172A] text-[13px]"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-11 px-3 rounded-lg text-[13px] font-bold text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-transform active:opacity-80 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{mode === "create" ? "إنشاء الوحدة" : "حفظ التعديلات"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
