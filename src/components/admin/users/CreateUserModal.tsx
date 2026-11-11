"use client";

import { Plus, RefreshCw, KeyRound } from "lucide-react";
import type { EducationalSystem, Grade, UserSubscriptionStatus } from "./types";
import { isFullAdmin } from "@/lib/roles";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  createName: string;
  setCreateName: (v: string) => void;
  createPhone: string;
  setCreatePhone: (v: string) => void;
  createEmail: string;
  setCreateEmail: (v: string) => void;
  createPassword: string;
  setCreatePassword: (v: string) => void;
  createLoginCode: string;
  setCreateLoginCode: (v: string) => void;
  createSchoolCategory: "ARABIC" | "LANGUAGES";
  setCreateSchoolCategory: (v: "ARABIC" | "LANGUAGES") => void;
  createMaxDevices: number;
  setCreateMaxDevices: (v: number) => void;
  createRole: string;
  setCreateRole: (v: string) => void;
  createSystemId: string;
  setCreateSystemId: (v: string) => void;
  createGradeId: string;
  setCreateGradeId: (v: string) => void;
  createSubscriptionStatus: UserSubscriptionStatus;
  setCreateSubscriptionStatus: (v: UserSubscriptionStatus) => void;
  isCreating: boolean;
  createError: string | null;
  systems: EducationalSystem[];
  grades: Grade[];
  currentUserRole: string;
  onGenerateCode: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateUserModal({
  isOpen,
  onClose,
  createName,
  setCreateName,
  createPhone,
  setCreatePhone,
  createEmail,
  setCreateEmail,
  createPassword,
  setCreatePassword,
  createLoginCode,
  setCreateLoginCode,
  createSchoolCategory,
  setCreateSchoolCategory,
  createMaxDevices,
  setCreateMaxDevices,
  createRole,
  setCreateRole,
  createSystemId,
  setCreateSystemId,
  createGradeId,
  setCreateGradeId,
  createSubscriptionStatus,
  setCreateSubscriptionStatus,
  isCreating,
  createError,
  systems,
  grades,
  currentUserRole,
  onGenerateCode,
  onSubmit,
}: CreateUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-6 space-y-4 shadow-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
              إضافة مستخدم أو مشرف جديد
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"
          >
            ×
          </button>
        </div>

        {createError && (
          <div className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] text-[13px] font-bold">
            {createError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1">
              الاسم الكامل *
            </label>
            <input
              type="text"
              required
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="مثال: أحمد محمد علي"
              className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                رقم الهاتف *
              </label>
              <input
                type="tel"
                required
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                placeholder="01012345678"
                className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1">
              الرتبة / نوع الحساب *
            </label>
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
            >
              <option value="STUDENT">طالب (STUDENT) - حساب طالب اعتيادي (دخول بالكود)</option>{isFullAdmin(currentUserRole) && (<option value="ASSISTANT">مساعد إداري (ASSISTANT) - كل الصلاحيات ماعدا حذف الطلاب</option>)}
              <option value="TEACHER">معلم (TEACHER) - Subadmin لمتابعة وتصحيح الامتحانات</option>
              <option value="EDITOR">محرر محتوى (EDITOR) - Subadmin لإدارة المناهج والأسئلة والوسائط</option>
              {isFullAdmin(currentUserRole) && (<option value="ADMIN">مسؤول (ADMIN) - مشرف كامل الصلاحيات</option>)}
              {currentUserRole === "SUPER_ADMIN" && (
                <option value="SUPER_ADMIN">مشرف عام أعلى (SUPER_ADMIN)</option>
              )}
            </select>
          </div>

          {createRole === "STUDENT" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#800020]/5 dark:bg-[#800020]/10 border border-[#800020]/20">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>كود الدخول المباشر *</span>
                  </label>
                  <button
                    type="button"
                    onClick={onGenerateCode}
                    className="text-[11px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>توليد كود</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={createLoginCode}
                  onChange={(e) => setCreateLoginCode(e.target.value.toUpperCase())}
                  placeholder="مثال: J9KFQY"
                  maxLength={12}
                  className="w-full h-10 px-3 rounded-xl border border-[#800020]/30 bg-white dark:bg-[#0F172A] text-sm font-bold font-mono text-center tracking-widest text-[#800020] dark:text-[#FB7185]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                  نوع المدرسة / المسار
                </label>
                <select
                  value={createSchoolCategory}
                  onChange={(e) => setCreateSchoolCategory(e.target.value as "ARABIC" | "LANGUAGES")}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white"
                >
                  <option value="ARABIC">مدارس عربي (Arabic)</option>
                  <option value="LANGUAGES">مدارس لغات (Languages)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                  حالة الاشتراك للطالب الجديد
                </label>
                <select
                  value={createSubscriptionStatus}
                  onChange={(e) => setCreateSubscriptionStatus(e.target.value as UserSubscriptionStatus)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white"
                >
                  <option value="ACTIVE">🟢 اشتراك كامل مفعل (يفتح كل الدروس والامتحانات فوراً)</option>
                  <option value="TRIAL">⚠️ زائر تجريبي (يفتح أول درس فقط)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                  الحد الأقصى للأجهزة المصرح بها للطالب
                </label>
                <select
                  value={createMaxDevices}
                  onChange={(e) => setCreateMaxDevices(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white"
                >
                  <option value={1}>جهاز واحد فقط (الافتراضي - حظر مشاركة الحساب تماماً)</option>
                  <option value={2}>جهازين (تصريح إضافي مثلاً: موبايل + لابتوب)</option>
                  <option value={3}>3 أجهزة (استثناء خاص)</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1">
              {createRole === "STUDENT"
                ? "كلمة المرور (اختيارية للطالب - يمكنه الدخول بالكود فقط)"
                : "كلمة المرور * (8 أحرف على الأقل)"}
            </label>
            <input
              type="password"
              required={createRole !== "STUDENT"}
              value={createPassword} minLength={createRole !== "STUDENT" ? 8 : undefined}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder={createRole === "STUDENT" ? "اتركها فارغة لاستخدام الكود" : "••••••••"}
              className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                النظام التعليمي
              </label>
              <select
                value={createSystemId}
                onChange={(e) => {
                  setCreateSystemId(e.target.value);
                  setCreateGradeId("");
                }}
                className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
              >
                <option value="">بدون تحديد</option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                الصف الدراسي
              </label>
              <select
                value={createGradeId}
                onChange={(e) => setCreateGradeId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
              >
                <option value="">بدون تحديد</option>
                {grades
                  .filter((g) => !createSystemId || g.systemId === createSystemId)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold disabled:opacity-50"
            >
              {isCreating ? "جاري الإنشاء..." : "إنشاء المستخدم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
