import {
  House,
  Books,
  Target,
  ArrowCounterClockwise,
  User as UserIcon,
  Sparkle,
  SignIn,
} from "@phosphor-icons/react";
import type { NavItem } from "./types";

export const GUEST_NAV_ITEMS: NavItem[] = [
  { label: "الرئيسية", href: "/", icon: House },
  { label: "المواد", href: "/subjects", icon: Books },
  { label: "اختبر نفسك", href: "/exams/builder", icon: Target, isCenter: true },
  { label: "الزتونة", href: "/#demo", icon: Sparkle },
  { label: "دخول", href: "/login", icon: SignIn },
];

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { label: "الرئيسية", href: "/dashboard", icon: House },
  { label: "المواد", href: "/subjects", icon: Books },
  { label: "اختبر نفسك", href: "/exams/builder", icon: Target, isCenter: true },
  { label: "غلطاتي", href: "/mistakes", icon: ArrowCounterClockwise },
  { label: "حسابي", href: "/profile", icon: UserIcon },
];
