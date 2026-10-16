"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  HelpCircle,
  Upload,
  Award,
  CheckCircle2,
  Users,
  HardDrive,
  Activity,
  Compass,
  LogOut,
  Search,
  ExternalLink,
  Command,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Shield,
  FileText,
  SlidersHorizontal,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Dot,
  Check,
  Plus,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface AdminShellProps {
  children: ReactNode;
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Categorized Navigation Groups for a Standout Sidebar
  const rawNavigationGroups = [
    {
      title: "الرئيسية والتحليلات",
      items: [
        {
          label: "لوحة التحكم الرئيسية",
          href: "/admin",
          icon: LayoutDashboard,
          exact: true,
          badge: null,
          allowedRoles: ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"],
        },
        {
          label: "التحليلات وسجل التدقيق",
          href: "/admin/analytics",
          icon: Activity,
          badge: "مباشر",
          badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          allowedRoles: ["TEACHER", "ADMIN", "SUPER_ADMIN"],
        },
      ],
    },
    {
      title: "الهيكل والمحتوى الأكاديمي",
      items: [
        {
          label: "المناهج والدروس",
          href: "/admin/curriculum",
          icon: BookOpen,
          badge: null,
          allowedRoles: ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"],
        },
        {
          label: "الأنظمة والصفوف الدراسية",
          href: "/admin/structure",
          icon: Layers,
          badge: "جديد",
          badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          allowedRoles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
          label: "مركز الوسائط والملفات",
          href: "/admin/media",
          icon: HardDrive,
          badge: "Uploads",
          badgeColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
          allowedRoles: ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"],
        },
      ],
    },
    {
      title: "الامتحانات والتقييمات",
      items: [
        {
          label: "بنك الأسئلة والمفاهيم",
          href: "/admin/questions",
          icon: HelpCircle,
          exact: true,
          badge: null,
          allowedRoles: ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"],
        },
        {
          label: "استيراد الأسئلة المجمع",
          href: "/admin/questions/import",
          icon: Upload,
          badge: "CSV",
          badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          allowedRoles: ["EDITOR", "ADMIN", "SUPER_ADMIN"],
        },
        {
          label: "إدارة الامتحانات الرسمية",
          href: "/admin/exams",
          icon: Award,
          badge: null,
          allowedRoles: ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"],
        },
        {
          label: "سجل المحاولات والتصحيح",
          href: "/admin/attempts",
          icon: CheckCircle2,
          badge: "تصحيح",
          badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          allowedRoles: ["TEACHER", "ADMIN", "SUPER_ADMIN"],
        },
      ],
    },
    {
      title: "المستخدمون والصلاحيات",
      items: [
        {
          label: "الطلاب والمستخدمون",
          href: "/admin/users",
          icon: Users,
          badge: null,
          allowedRoles: ["ADMIN", "SUPER_ADMIN"],
        },
      ],
    },
  ];

  // Filter groups according to user role
  const navigationGroups = rawNavigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.allowedRoles.includes(user.role)),
    }))
    .filter((group) => group.items.length > 0);

  // Flat items list for Command Palette search
  const allNavItems = navigationGroups.flatMap((g) => g.items);

  const getRoleArabicLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "مشرف عام أعلى";
      case "ADMIN":
        return "مسؤول المنصة";
      case "EDITOR":
        return "محرر محتوى (Subadmin)";
      case "TEACHER":
        return "معلم ومصحح (Subadmin)";
      default:
        return role;
    }
  };

  // Active page title calculation for breadcrumbs
  const getActivePageDetails = () => {
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (item.exact ? pathname === item.href : pathname.startsWith(item.href)) {
          if (item.href === "/admin/questions" && pathname !== "/admin/questions") {
            continue;
          }
          return { title: item.label, group: group.title, icon: item.icon };
        }
      }
    }
    return { title: "لوحة التحكم", group: "الإدارة", icon: LayoutDashboard };
  };

  const activePage = getActivePageDetails();
  const ActiveIcon = activePage.icon;

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  // Filter commands for Command Palette
  const filteredCommands = allNavItems.filter(
    (item) =>
      item.label.includes(commandQuery) ||
      item.href.toLowerCase().includes(commandQuery.toLowerCase())
  );

  const quickActions = [
    { label: "إنشاء امتحان رسمي جديد", href: "/admin/exams?action=create", icon: Award },
    { label: "إضافة سؤال لبنك الأسئلة", href: "/admin/questions?action=create", icon: HelpCircle },
    { label: "رفع ملفات وسائط وبودكاست", href: "/admin/media", icon: HardDrive },
    { label: "استيراد بنك أسئلة CSV/JSON", href: "/admin/questions/import", icon: Upload },
    { label: "إضافة نظام تعليمي أو صف", href: "/admin/structure", icon: Layers },
    { label: "معاينة واجهة الطالب الحية", href: "/dashboard", icon: Compass, external: true },
  ].filter((a) => a.label.includes(commandQuery));

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 font-sans text-right antialiased selection:bg-zinc-800 selection:text-white flex flex-col md:flex-row"
      dir="rtl"
    >
      {/* =========================================================================
          1. MOBILE TOP HEADER
         ========================================================================= */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs">
            ▲
          </div>
          <div>
            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block leading-tight">
              الخلاصة
            </span>
            <span className="text-[10px] font-mono text-zinc-500 leading-none">
              لوحة الإدارة
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle className="h-8 w-8" />
          <button
            onClick={() => setIsCommandOpen(true)}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =========================================================================
          2. STANDOUT VERCEL-STYLE ADMIN SIDEBAR
         ========================================================================= */}
      <aside
        className={`fixed md:sticky top-0 right-0 h-screen shrink-0 z-50 transition-all duration-200 ease-in-out border-l border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#09090b] flex flex-col justify-between overflow-y-auto no-scrollbar ${
          mobileMenuOpen ? "translate-x-0 w-72" : "translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-20" : "md:w-72"}`}
      >
        <div className="p-4 space-y-5">
          {/* Workspace / Brand Header */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-900">
            <Link
              href="/admin"
              className="flex items-center gap-3 group min-w-0"
              title="لوحة الإدارة - منصة الخلاصة"
            >
              {/* Minimalist Monogram Icon */}
              <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0">
                ▲
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight block truncate">
                      منصة الخلاصة
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                      PRO
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>النظام متصل</span>
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse Toggle Button (Desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
            >
              {isCollapsed ? (
                <PanelRightOpen className="w-4 h-4" />
              ) : (
                <PanelRightClose className="w-4 h-4" />
              )}
            </button>

            {/* Close Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search / Command Button in Sidebar */}
          {!isCollapsed ? (
            <button
              onClick={() => setIsCommandOpen(true)}
              className="w-full h-8.5 px-3 rounded-lg bg-zinc-100/80 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                <span>بحث سريع أو أمر...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                ⌘K
              </kbd>
            </button>
          ) : (
            <button
              onClick={() => setIsCommandOpen(true)}
              className="w-full h-8.5 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="بحث سريع (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Navigation Groups */}
          <nav className="space-y-5">
            {navigationGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!isCollapsed && (
                  <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block pb-1">
                    {group.title}
                  </span>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname === item.href ||
                        (item.href !== "/admin" &&
                          pathname.startsWith(item.href) &&
                          (item.href !== "/admin/questions" ||
                            pathname === "/admin/questions"));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        title={isCollapsed ? item.label : undefined}
                        className={`group relative w-full h-9 px-2.5 rounded-lg text-xs font-medium flex items-center transition-all ${
                          isCollapsed ? "justify-center" : "justify-between"
                        } ${
                          isActive
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? "text-white dark:text-zinc-900"
                                : "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
                            }`}
                          />
                          {!isCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>

                        {!isCollapsed && item.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${
                              isActive
                                ? "bg-white/20 text-white dark:bg-black/20 dark:text-black border-transparent"
                                : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Active Accent Dot on Right */}
                        {isActive && !isCollapsed && !item.badge && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-900" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer & Utilities */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2">
          {/* Student Mode Switcher */}
          {!isCollapsed ? (
            <Link
              href="/dashboard"
              className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span>معاينة تطبيق الطالب</span>
              </div>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="w-full h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-indigo-500 transition-colors"
              title="معاينة تطبيق الطالب"
            >
              <Compass className="w-4 h-4" />
            </Link>
          )}

          {/* User Profile Capsule */}
          <div
            className={`flex items-center justify-between p-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {(user.name || "أ").charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 text-right">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate leading-tight">
                    {user.name || "مشرف المنصة"}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 block truncate leading-none mt-0.5">
                    {getRoleArabicLabel(user.role)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <ThemeToggle className="h-7 w-7" />
              {!isCollapsed && (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  title="تسجيل الخروج"
                  className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          3. MAIN CONTENT WORKSPACE & DESKTOP TOPBAR
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 h-14 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 sticky top-0 z-30">
          {/* Breadcrumbs with active section icon */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium">لوحة الإدارة</span>
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 font-medium">{activePage.group}</span>
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
              <ActiveIcon className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              <span>{activePage.title}</span>
            </div>
          </div>

          {/* Top Actions: Search trigger, Theme toggle, DB health, Student link */}
          <div className="flex items-center gap-2.5">
            {/* Quick Command Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs text-zinc-500 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>بحث سريع...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Professional Theme Switcher Dropdown */}
            <ThemeToggle variant="dropdown" />

            {/* PostgreSQL Connection Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>PostgreSQL: متصل</span>
            </div>

            {/* Switch to Student Interface */}
            <Link
              href="/dashboard"
              className="h-8 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>واجهة الطالب</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* =========================================================================
          4. COMMAND PALETTE MODAL (Cmd+K / Ctrl+K)
         ========================================================================= */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="ابحث عن صفحة، خدمة، مادة أو إجراء سريع..."
                className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none"
              />
              <button
                onClick={() => setIsCommandOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-3">
              {/* Navigation Services */}
              <div>
                <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400 block pb-1">
                  الخدمات والصفحات الإدارية
                </span>
                <div className="space-y-0.5">
                  {filteredCommands.length > 0 ? (
                    filteredCommands.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            setIsCommandOpen(false);
                            router.push(item.href);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-zinc-400" />
                            <span>{item.label}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {item.href}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-3 py-2 text-xs text-zinc-400">
                      لا توجد خدمات مطابقة للبحث
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div className="border-t border-zinc-100 dark:border-zinc-900 pt-2">
                  <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400 block pb-1">
                    إجراءات سريعة
                  </span>
                  <div className="space-y-0.5">
                    {quickActions.map((action, idx) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setIsCommandOpen(false);
                            router.push(action.href);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-zinc-400" />
                            <span>{action.label}</span>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Shortcut Hints */}
            <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                <span>للتنقل:</span>
                <kbd className="px-1 bg-zinc-200 dark:bg-zinc-800 rounded">↵</kbd>
                <span>للإغلاق:</span>
                <kbd className="px-1 bg-zinc-200 dark:bg-zinc-800 rounded">ESC</kbd>
              </div>
              <span>EL KHOLASA ADMIN ENGINE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
