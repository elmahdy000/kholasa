import { type ReactNode, type ElementType } from "react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: ElementType;
  exact?: boolean;
  badge?: string | null;
  badgeColor?: string;
  allowedRoles: string[];
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export interface AdminUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

export interface AdminShellProps {
  children: ReactNode;
  user: AdminUser;
}
