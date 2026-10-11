"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface AdminShellProps {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
    { label: "إدارة المناهج والدروس", href: "/admin/curriculum", icon: BookOpen },
    { label: "بنك الأسئلة", href: "/admin/questions", icon: HelpCircle },
    { label: "الطلاب والمستخدمون", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] text-right font-sans flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-[#0B0F19] text-white flex flex-col justify-between shrink-0 p-5 md:min-h-screen border-l border-slate-800">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-2xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight block">
                لوحة الإدارة
              </span>
              <span className="text-[10px] font-mono text-[#4F46E5] dark:text-indigo-400 block tracking-wider">
                EL KHOLASA ADMIN
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full h-10 px-3 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors interactive-tap ${
                    isActive
                      ? "bg-[#4F46E5] text-white shadow-2xs"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer in Sidebar */}
        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <div className="px-2">
            <span className="text-xs font-bold text-white block">
              {user.name || "مسؤول النظام"}
            </span>
            <span className="text-[11px] text-slate-400 block truncate font-mono">
              {user.email || "admin@kholasa.app"}
            </span>
          </div>

          <Link
            href="/dashboard"
            className="w-full h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-between transition-colors border border-slate-800 interactive-tap"
          >
            <span>العودة لتطبيق الطالب</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
