"use client";

import { useState, useEffect } from "react";
import { X, Save, Layers, AlertCircle, Loader2 } from "lucide-react";
import type { AcademicTrack } from "./types";

interface TrackModalProps {
  isOpen: boolean;
  gradeId: string;
  gradeName?: string;
  initialTrack?: AcademicTrack | null;
  onClose: () => void;
  onSaved: (track: AcademicTrack) => void;
}

export function TrackModal({
  isOpen,
  gradeId,
  gradeName = "تانية بكالوريا",
  initialTrack,
  onClose,
  onSaved,
}: TrackModalProps) {
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [code, setCode] = useState("");
  const [categoryScope, setCategoryScope] = useState<string>("BOTH");
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialTrack) {
      setName(initialTrack.name);
      setNameEn(initialTrack.nameEn || "");
      setCode(initialTrack.code);
      setCategoryScope(initialTrack.categoryScope || "BOTH");
      setIsActive(initialTrack.isActive ?? true);
    } else {
      setName("");
      setNameEn("");
      setCode("");
      setCategoryScope("BOTH");
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [isOpen, initialTrack]);

  if (!isOpen) return null;

  // Auto-generate code from english/arabic if creating and code is empty
  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialTrack && !code) {
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/مسار\s+/g, "")
        .replace(/\s+/g, "_")
        .slice(0, 25);
      if (generated) setCode(`track_${generated}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("اسم المسار مطلوب");
      return;
    }

    const finalCode = code.trim() || `track_${Date.now().toString(36)}`;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      if (!initialTrack) {
        // Create
        const res = await fetch("/api/admin/structure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "track",
            data: {
              name: name.trim(),
              nameEn: nameEn.trim() || null,
              code: finalCode,
              gradeId,
              categoryScope,
              isActive,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "فشل إنشاء المسار");
        onSaved(data.item);
      } else {
        // Update
        const res = await fetch("/api/admin/structure", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "track",
            id: initialTrack.id,
            data: {
              name: name.trim(),
              nameEn: nameEn.trim() || null,
              code: finalCode,
              categoryScope,
              isActive,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "فشل تحديث المسار");
        onSaved({
          ...initialTrack,
          name: name.trim(),
          nameEn: nameEn.trim() || null,
          code: finalCode,
          categoryScope,
          isActive,
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ المسار");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 font-sans" dir="rtl">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                {initialTrack ? "تعديل المسار الأكاديمي" : "إضافة مسار أكاديمي جديد"}
              </h3>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                مخصص للصف: <span className="font-bold text-[#800020] dark:text-[#FB7185]">{gradeName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              اسم المسار بالعربية <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="مثال: مسار الطب وعلوم الحياة"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-sm text-[#0F172A] dark:text-white outline-none focus:border-[#800020]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              الاسم بالإنجليزية (اختياري)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Medical & Life Sciences"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-sm text-[#0F172A] dark:text-white outline-none focus:border-[#800020]"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              كود المسار الفريد (Code)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="medical"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-sm font-mono text-[#0F172A] dark:text-white outline-none focus:border-[#800020]"
              dir="ltr"
            />
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-1">
              يُستخدم لربط أسئلة بنك الأسئلة والامتحانات آلياً
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1.5">
              إتاحة المسار لنوع المدارس
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "BOTH", label: "كلاهما (عربي ولغات)" },
                { value: "ARABIC", label: "مدارس عربي فقط" },
                { value: "LANGUAGES", label: "مدارس لغات فقط" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategoryScope(opt.value)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    categoryScope === opt.value
                      ? "border-[#800020] bg-[#800020]/10 text-[#800020] dark:text-[#FB7185]"
                      : "border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:border-[#800020]/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155]">
            <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              حالة المسار
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
              />
              <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {isActive ? "نشط ومتاح للطلاب" : "معطل (مخفي مؤقتاً)"}
              </span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0] dark:border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs font-bold text-[#334155] dark:text-[#E2E8F0]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center gap-2 transition-transform active:opacity-80 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{initialTrack ? "حفظ التعديلات" : "حفظ المسار"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
