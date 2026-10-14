"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Layers, AlertCircle, CheckCircle2 } from "lucide-react";

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
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ الوحدة");
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "حدث خطأ أثناء حذف الوحدة");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 font-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                {mode === "create" ? "إضافة وحدة تعليمية جديدة" : "تعديل بيانات الوحدة"}
              </h3>
              <p className="text-[11px] text-zinc-500 font-bold">
                المادة: {subjectName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="px-5 py-2.5 text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              عنوان الوحدة *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الوحدة الأولى: التركيب والوظيفة في الكائنات الحية"
              className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              وصف توضيحي للوحدة (اختياري)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لأهداف ومواضيع الوحدة..."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                الترتيب
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                حالة النشر
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full h-10 px-3 rounded-xl text-xs font-bold flex items-center justify-center border transition-colors ${
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {isPublished ? "منشورة للطلاب" : "مسودة مخفية"}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {mode === "edit" && onDeleted ? (
              <div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="h-8 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-black transition-colors"
                    >
                      {isDeleting ? "..." : "تأكيد حذف الوحدة"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="h-8 px-2 rounded-lg bg-slate-200 text-slate-700 text-[11px]"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-8 px-2.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1 transition-colors"
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
                className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-9 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
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
