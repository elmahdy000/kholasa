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
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4 shadow-xs">
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
        <KeyRound className="w-5 h-5 text-[#800B34] dark:text-[#FB7185]" />
        <h2 className="text-sm sm:text-base font-bold text-[#091B40] dark:text-white">
          تغيير كلمة المرور
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label
              htmlFor="current-password"
              className="block text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#F8FAFC] mb-1.5"
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
              className="w-full min-h-[44px] h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-[#091B40] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800B34]"
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#F8FAFC] mb-1.5"
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
              className="w-full min-h-[44px] h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-[#091B40] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800B34]"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#F8FAFC] mb-1.5"
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
              className="w-full min-h-[44px] h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-[#091B40] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800B34]"
            />
          </div>
        </div>

        {passwordStatus && (
          <div
            className={`p-3 rounded-xl text-xs sm:text-[13px] font-bold ${
              passwordStatus.type === "error"
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            }`}
          >
            {passwordStatus.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isChangingPassword}
          className="w-full sm:w-auto min-h-[44px] h-11 px-6 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 shadow-xs"
        >
          {isChangingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>تحديث كلمة المرور</span>
        </button>
      </form>
    </div>
  );
}
