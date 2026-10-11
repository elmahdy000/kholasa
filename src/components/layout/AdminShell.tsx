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
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0E1726] text-right font-sans flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-[#14243D] text-white flex flex-col justify-between shrink-0 p-5 md:min-h-screen">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6858EA] to-[#11B7B4] flex items-center justify-center text-white shadow-md shadow-[#6858EA]/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight block">
                لوحة الإدارة
              </span>
              <span className="text-[11px] font-bold text-[#11B7B4] block">
                الخُلاصة | ADMIN
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-4">
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
                  className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 transition-colors ${
                    isActive
                      ? "bg-[#6858EA] text-white shadow-md shadow-[#6858EA]/30 font-black"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
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
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <span className="text-xs font-bold text-white block">
              {user.name || "مسؤول النظام"}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              {user.email || "مسؤول النظام"}
            </span>
          </div>

          <Link
            href="/dashboard"
            className="w-full h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-between transition-colors"
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
