"use client";

import { Mail, Phone, LogOut, Loader2 } from "lucide-react";

interface ProfileHeaderCardProps {
  user: {
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  isLoggingOut: boolean;
  onLogout: () => void;
}

export function ProfileHeaderCard({ user, isLoggingOut, onLogout }: ProfileHeaderCardProps) {
  return (
    <div className="p-6 sm:p-7 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-[#800020] text-white flex items-center justify-center text-xl font-bold shrink-0">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            {user.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
            {user.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span dir="ltr">{user.email}</span>
              </span>
            )}
            {user.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr">{user.phone}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#F87171]/40 text-[#DC2626] dark:text-[#F87171] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors self-start sm:self-center interactive-tap"
      >
        {isLoggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        <span>تسجيل الخروج</span>
      </button>
    </div>
  );
}
