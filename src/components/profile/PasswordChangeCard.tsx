"use client";

import { KeyRound, Loader2 } from "lucide-react";

interface PasswordChangeCardProps {
  passwordForm: {
    current: string;
    next: string;
    confirm: string;
  };
  setPasswordForm: React.Dispatch<
    React.SetStateAction<{
      current: string;
      next: string;
      confirm: string;
    }>
  >;
  isChangingPassword: boolean;
  passwordStatus: {
    type: "error" | "success";
    text: string;
  } | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function PasswordChangeCard({
  passwordForm,
  setPasswordForm,
  isChangingPassword,
  passwordStatus,
  onSubmit,
}: PasswordChangeCardProps) {
  return (
    <div className="p-6 sm:p-7 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
        <KeyRound className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
        <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
          تغيير كلمة المرور
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="current-password"
              className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2"
            >
              كلمة المرور الحالية
            </label>
            <input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              value={passwordForm.current}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  current: e.target.value,
                }))
              }
              className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2"
            >
              كلمة المرور الجديدة
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={passwordForm.next}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  next: e.target.value,
                }))
              }
              className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2"
            >
              تأكيد كلمة المرور
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={passwordForm.confirm}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirm: e.target.value,
                }))
              }
              className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </div>
        </div>

        {passwordStatus && (
          <p
            role="alert"
            className={`text-[13px] font-bold ${
              passwordStatus.type === "success"
                ? "text-[#059669] dark:text-[#34D399]"
                : "text-[#DC2626] dark:text-[#F87171]"
            }`}
          >
            {passwordStatus.text}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isChangingPassword}
            className="h-11 px-5 rounded-lg bg-[#800020] hover:bg-[#66001A] disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2 transition-colors"
          >
            {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>تحديث كلمة المرور</span>
          </button>
          <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
            سيتم تسجيل الخروج من الأجهزة الأخرى.
          </span>
        </div>
      </form>
    </div>
  );
}
