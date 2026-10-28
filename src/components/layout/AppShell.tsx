"use client";

import { usePathname } from "next/navigation";
import { StudentShell } from "./StudentShell";
import type { StudentShellUser } from "./student/types";

interface AppShellProps {
  children: React.ReactNode;
  user?: StudentShellUser | null;
}

const STANDALONE_PREFIXES = [
  "/admin",
  "/login",
  "/register",
  "/forgot-password",
  "/offline",
  "/setup",
  "/privacy",
  "/terms",
];

/**
 * Persistent root application shell.
 * Wraps student routes in a single, stable StudentShell instance that stays
 * mounted across client navigations, eliminating navbar flickering/unmounting.
 */
export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();

  // Root landing page, admin portal, authentication pages, setup, and offline
  // render their own dedicated layouts/shells without wrapping with StudentShell.
  if (
    pathname === "/" ||
    STANDALONE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return <>{children}</>;
  }

  // All student routes: persistent StudentShell that remains mounted during navigation
  return <StudentShell user={user}>{children}</StudentShell>;
}
