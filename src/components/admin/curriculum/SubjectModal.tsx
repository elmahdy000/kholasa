"use client";

import { useState, useEffect } from "react";
import { X, Save, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import type { Subject, AcademicTrack } from "./types";

interface SubjectModalProps {
  isOpen: boolean;
  systemId: string;
  gradeId: string;
  gradeName?: string;
  gradeCode?: string;
  schoolCategory: "ARABIC" | "LANGUAGES";
  selectedTrackId?: string | null;
  tracks: AcademicTrack[];
  initialSubject?: Subject | null;
  onClose: () => void;
  onSaved: (subject: Subject) => void;
}

const COLOR_OPTIONS = [
  "#800020", // Burgundy (El Kholasa)
  "#12263F", // Navy
  "#2563EB", // Blue
  "#059669", // Emerald
  "#D97706", // Amber
  "#7C3AED", // Purple
  "#DC2626", // Red
  "#0D9488", // Teal
];

export function SubjectModal({
  isOpen,
  systemId,
  gradeId,
  gradeName = "البكالوريا",
  gradeCode = "G11",
  schoolCategory,
  selectedTrackId,
  tracks,
  initialSubject,
  onClose,
  onSaved,
}: SubjectModalProps) {
  const isG11 = gradeCode === "G11";

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#800020");
  const [description, setDescription] = useState("");

  // G11 Subject classification: Common vs Track-Specific
  const [isCommon, setIsCommon] = useState(true);
  const [targetTrackId, setTargetTrackId] = useState<string>("");

  // Elective settings
  const [isElective, setIsElective] = useState(false);
  const [electiveGroup, setElectiveGroup] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialSubject) {
      setName(initialSubject.name);
      setCode(initialSubject.code);
      setColor(initialSubject.color || "#800020");
      setDescription(initialSubject.description || "");
      if (initialSubject.trackId) {
        setIsCommon(false);
        setTargetTrackId(initialSubject.trackId);
      } else {
        setIsCommon(true);
        setTargetTrackId(selectedTrackId || tracks[0]?.id || "");
      }
      setIsElective(Boolean(initialSubject.isElective));
      setElectiveGroup(initialSubject.electiveGroup || "");
    } else {
      setName("");
      setCode("");
      setColor("#800020");
      setDescription("");
      if (selectedTrackId) {
        setIsCommon(false);
        setTargetTrackId(selectedTrackId);
      } else {
        setIsCommon(true);
        setTargetTrackId(tracks[0]?.id || "");
      }
      setIsElective(false);
      setElectiveGroup("");
    }
    setErrorMsg(null);
  }, [isOpen, initialSubject, selectedTrackId, tracks]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialSubject && !code) {
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/مادة\s+/g, "")
        .replace(/\s+/g, "_")
        .slice(0, 20);
      if (generated) {
        setCode(`${generated}_${gradeCode.toLowerCase()}_${schoolCategory === "LANGUAGES" ? "lang" : "ar"}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("اسم المادة مطلوب");
      return;
    }

    const finalCode =
      code.trim() ||
      `sub_${Date.now().toString(36)}_${schoolCategory === "LANGUAGES" ? "lang" : "ar"}`;

    const effectiveTrackId = isG11 && !isCommon ? targetTrackId || null : null;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      if (!initialSubject) {
        // Create
        const res = await fetch("/api/admin/structure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subject",
            data: {
              name: name.trim(),
              code: finalCode,
              color,
              description: description.trim() || null,
              systemId,
              gradeId,
              schoolCategory,
              trackId: effectiveTrackId,
              isElective,
              electiveGroup: isElective ? electiveGroup.trim() || null : null,
              isPublished: true,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "فشل إنشاء المادة الدراسية");

        onSaved({
          ...data.item,
          name: name.trim(),
          code: finalCode,
          color,
          description: description.trim() || null,
          systemId,
          gradeId,
          schoolCategory,
          trackId: effectiveTrackId,
          isElective,
          electiveGroup: isElective ? electiveGroup.trim() || null : null,
          isPublished: true,
          order: 0,
          units: [],
          _count: { units: 0, questions: 0, exams: 0 },
        });
      } else {
        // Update
        const res = await fetch("/api/admin/structure", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subject",
            id: initialSubject.id,
            data: {
              name: name.trim(),
              code: finalCode,
              color,
              description: description.trim() || null,
              trackId: effectiveTrackId,
              schoolCategory,
              isElective,
              electiveGroup: isElective ? electiveGroup.trim() || null : null,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "فشل تحديث بيانات المادة");

        onSaved({
          ...initialSubject,
          name: name.trim(),
          code: finalCode,
          color,
          description: description.trim() || null,
          trackId: effectiveTrackId,
          schoolCategory,
          isElective,
          electiveGroup: isElective ? electiveGroup.trim() || null : null,
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ المادة");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 font-sans" dir="rtl">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                {initialSubject ? "تعديل المادة الدراسية" : "إضافة مادة دراسية جديدة"}
              </h3>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                {gradeName} • {schoolCategory === "LANGUAGES" ? "مدارس لغات" : "مدارس عربي"}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              اسم المادة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder={schoolCategory === "LANGUAGES" ? "e.g. Pure Mathematics" : "مثال: الرياضيات البحتة"}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-sm text-[#0F172A] dark:text-white outline-none focus:border-[#800020]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              كود المادة الفريد (Code)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="pure_math_g11"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-sm font-mono text-[#0F172A] dark:text-white outline-none focus:border-[#800020]"
              dir="ltr"
            />
          </div>

          {/* G11 Classification (Common vs Track-Specific) */}
          {isG11 && (
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
              <span className="text-xs font-bold text-[#0F172A] dark:text-white block">
                تصنيف المادة في تانية بكالوريا
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsCommon(true)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    isCommon
                      ? "border-[#800020] bg-[#800020]/10 text-[#800020] dark:text-[#FB7185]"
                      : "border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                  }`}
                >
                  مادة عامة مشتركة لجميع المسارات
                </button>
                <button
                  type="button"
                  onClick={() => setIsCommon(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    !isCommon
                      ? "border-[#800020] bg-[#800020]/10 text-[#800020] dark:text-[#FB7185]"
                      : "border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                  }`}
                >
                  مادة تخصصية لمسار محدد
                </button>
              </div>

              {!isCommon && (
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">
                    اختر المسار التخصصي لهذه المادة:
                  </label>
                  <select
                    value={targetTrackId}
                    onChange={(e) => setTargetTrackId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-bold text-[#0F172A] dark:text-white outline-none"
                  >
                    {tracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.nameEn ? `(${t.nameEn})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Elective settings */}
              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isElective}
                    onChange={(e) => setIsElective(e.target.checked)}
                    className="w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
                  />
                  <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    مادة اختيارية (يختار الطالب مادة واحدة من مجموعتها)
                  </span>
                </label>

                {isElective && (
                  <input
                    type="text"
                    value={electiveGroup}
                    onChange={(e) => setElectiveGroup(e.target.value)}
                    placeholder="اسم المجموعة الاختيارية (مثال: المجموعة الأولى)"
                    className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-[#0F172A] dark:text-white outline-none"
                  />
                )}
              </div>
            </div>
          )}

          {/* Color Picker */}
          <div>
            <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1.5">
              لون هوية المادة
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? "scale-110 ring-2 ring-offset-2 ring-[#800020]" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              وصف المادة (اختياري)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="وصف مختصر لمحتوى وأهداف المادة..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-xs text-[#0F172A] dark:text-white outline-none focus:border-[#800020]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0] dark:border-[#334155] shrink-0">
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
              <span>{initialSubject ? "حفظ التعديلات" : "حفظ المادة"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
