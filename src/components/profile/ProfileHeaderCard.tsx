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
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 shadow-xs">
      <div className="flex items-center gap-3.5 sm:gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#800B34] text-white flex items-center justify-center text-lg sm:text-xl font-bold shrink-0 shadow-xs">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-[#091B40] dark:text-white tracking-tight truncate">
            {user.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
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
        className="w-full sm:w-auto min-h-[44px] h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#F87171]/40 text-[#DC2626] dark:text-[#F87171] text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors cursor-pointer active:scale-[0.98]"
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
