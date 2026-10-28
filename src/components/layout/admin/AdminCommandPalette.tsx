"use client";

import { useRouter } from "next/navigation";
import { Search, X, ArrowUpRight, Award, HelpCircle, HardDrive, Upload, Layers, Compass } from "lucide-react";
import type { AdminNavItem } from "./types";

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commandQuery: string;
  setCommandQuery: (q: string) => void;
  filteredCommands: AdminNavItem[];
}

export function AdminCommandPalette({
  isOpen,
  onClose,
  commandQuery,
  setCommandQuery,
  filteredCommands,
}: AdminCommandPaletteProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const quickActions = [
    { label: "إنشاء امتحان رسمي جديد", href: "/admin/exams?action=create", icon: Award },
    { label: "إضافة سؤال لبنك الأسئلة", href: "/admin/questions?action=create", icon: HelpCircle },
    { label: "رفع ملفات وسائط وبودكاست", href: "/admin/media", icon: HardDrive },
    { label: "استيراد بنك أسئلة CSV/JSON", href: "/admin/questions/import", icon: Upload },
    { label: "إضافة نظام تعليمي أو صف", href: "/admin/structure", icon: Layers },
    { label: "معاينة واجهة الطالب الحية", href: "/dashboard", icon: Compass, external: true },
  ].filter((a) => a.label.includes(commandQuery));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-sm overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E2E8F0] dark:border-[#334155]">
          <Search className="w-4 h-4 text-[#64748B] shrink-0" />
          <input
            type="text"
            autoFocus
            value={commandQuery}
            onChange={(e) => setCommandQuery(e.target.value)}
            placeholder="ابحث عن صفحة، خدمة، مادة أو إجراء سريع..."
            className="w-full bg-transparent text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-[#64748B] dark:hover:text-[#F8FAFC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Navigation Services */}
          <div>
            <span className="px-3 text-[13px] font-mono uppercase tracking-wider text-[#64748B] block pb-1">
              الخدمات والصفحات الإدارية
            </span>
            <div className="space-y-1">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        onClose();
                        router.push(item.href);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#64748B]" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[13px] font-mono text-[#64748B]">
                        {item.href}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-2 text-[13px] text-[#64748B]">
                  لا توجد خدمات مطابقة للبحث
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2">
              <span className="px-3 text-[13px] font-mono uppercase tracking-wider text-[#64748B] block pb-1">
                إجراءات سريعة
              </span>
              <div className="space-y-1">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onClose();
                        router.push(action.href);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#64748B]" />
                        <span>{action.label}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50 flex items-center justify-between text-[13px] font-mono text-[#64748B]">
          <div className="flex items-center gap-2">
            <span>للتنقل:</span>
            <kbd className="px-1 bg-[#E2E8F0] dark:bg-[#334155] rounded">↵</kbd>
            <span>للإغلاق:</span>
            <kbd className="px-1 bg-[#E2E8F0] dark:bg-[#334155] rounded">ESC</kbd>
          </div>
          <span>EL KHOLASA ADMIN ENGINE</span>
        </div>
      </div>
    </div>
  );
}
