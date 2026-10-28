import {
  LayoutDashboard,
  Activity,
  BookOpen,
  Layers,
  HardDrive,
  HelpCircle,
  Upload,
  Award,
  CheckCircle2,
  Users,
} from "lucide-react";
import type { AdminNavGroup } from "./types";

export const rawNavigationGroups: AdminNavGroup[] = [
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
        badgeColor: "bg-[#059669]/10 text-[#059669] border-[#059669]/20",
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
        badgeColor: "bg-[#800020]/10 text-[#800020] border-[#800020]/20",
        allowedRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "مركز الوسائط والملفات",
        href: "/admin/media",
        icon: HardDrive,
        badge: "Uploads",
        badgeColor: "bg-[#64748B] text-[#64748B] border-[#94A3B8]/20",
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
        badgeColor: "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20",
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
        badgeColor: "bg-[#800020]/10 text-[#800020] border-[#800020]/20",
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

export function getRoleArabicLabel(role: string): string {
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
}
