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
  Bell,
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
        badge: null,
        allowedRoles: ["TEACHER", "ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "الهيكل والمحتوى الأكاديمي",
    items: [
      {
        label: "المناهج والهيكل الأكاديمي",
        href: "/admin/curriculum",
        icon: BookOpen,
        badge: null,
        allowedRoles: ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "مركز الوسائط والملفات",
        href: "/admin/media",
        icon: HardDrive,
        badge: null,
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
        badge: null,
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
        badge: null,
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
      {
        label: "الإعلانات والإشعارات العامة",
        href: "/admin/notifications",
        icon: Bell,
        badge: null,
        allowedRoles: ["EDITOR", "ADMIN", "SUPER_ADMIN"],
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
