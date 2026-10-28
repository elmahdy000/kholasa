import type { ComponentType, ReactNode } from "react";

export interface StudentShellUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string;
}

export interface StudentShellProps {
  children: ReactNode;
  user?: StudentShellUser | null;
}

export interface SearchResult {
  type: "LESSON" | "SUBJECT" | "QUESTION";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{
    className?: string;
    weight?: "bold" | "fill" | "regular" | "light" | "thin" | "duotone";
  }>;
  isCenter?: boolean;
}
