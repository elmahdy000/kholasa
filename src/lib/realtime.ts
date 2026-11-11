import { EventEmitter } from "events";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export type RealtimeTopic =
  | "notifications"
  | "curriculum"
  | "users"
  | "exams"
  | "analytics"
  | "structure";

export type RealtimeAudience = "all" | "staff" | "students" | "user";

export interface RealtimeEvent {
  id: string;
  topic: RealtimeTopic;
  action: string;
  timestamp: number;
  audience: RealtimeAudience;
  targetUserId?: string | null;
  targetGradeId?: string | null;
  targetCategory?: string | null;
  entityId?: string | null;
  meta?: Record<string, unknown>;
}

export type RealtimeEventInput = Omit<RealtimeEvent, "id" | "timestamp">;

export interface RealtimeViewer {
  id: string;
  role: string;
  gradeId?: string | null;
  schoolCategory?: string | null;
}

const GLOBAL_EMITTER_KEY = "__kholasaRealtimeEmitter";
const REALTIME_EVENT_NAME = "kholasa:event";

function getRealtimeEmitter(): EventEmitter {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_EMITTER_KEY]?: EventEmitter;
  };
  if (!g[GLOBAL_EMITTER_KEY]) {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(1000);
    g[GLOBAL_EMITTER_KEY] = emitter;
  }
  return g[GLOBAL_EMITTER_KEY];
}

export function emitRealtimeEvent(input: RealtimeEventInput): RealtimeEvent {
  const event: RealtimeEvent = {
    ...input,
    id: randomUUID(),
    timestamp: Date.now(),
  };

  try {
    getRealtimeEmitter().emit(REALTIME_EVENT_NAME, event);
  } catch (err) {
    console.error("[Realtime] Failed to emit event:", err);
  }

  return event;
}

export function subscribeRealtimeEvents(
  listener: (event: RealtimeEvent) => void
): () => void {
  const emitter = getRealtimeEmitter();
  emitter.on(REALTIME_EVENT_NAME, listener);
  return () => {
    emitter.off(REALTIME_EVENT_NAME, listener);
  };
}

export function isStaffRole(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER";
}

function matchesStudentTarget(
  event: RealtimeEvent,
  viewer: RealtimeViewer
): boolean {
  if (event.targetGradeId && event.targetGradeId !== viewer.gradeId) {
    return false;
  }
  if (
    event.targetCategory &&
    event.targetCategory !== "ALL" &&
    event.targetCategory !== viewer.schoolCategory
  ) {
    return false;
  }
  return true;
}

export function shouldDeliverRealtimeEvent(
  event: RealtimeEvent,
  viewer: RealtimeViewer
): boolean {
  if (event.audience === "user") {
    return Boolean(event.targetUserId && event.targetUserId === viewer.id);
  }

  const staff = isStaffRole(viewer.role);

  if (event.audience === "staff") {
    return staff;
  }

  if (event.audience === "students") {
    if (staff) return false;
    return matchesStudentTarget(event, viewer);
  }

  // audience === "all"
  if (staff) return true;
  return matchesStudentTarget(event, viewer);
}

const DEFAULT_REVALIDATE_PATHS = [
  "/",
  "/dashboard",
  "/subjects",
  "/exams",
  "/exams/builder",
  "/mistakes",
  "/profile",
  "/leaderboard",
  "/subscription",
  "/admin",
  "/admin/users",
  "/admin/curriculum",
  "/admin/curriculum/arabic",
  "/admin/structure",
  "/admin/exams",
  "/admin/questions",
  "/admin/notifications",
  "/admin/reports",
  "/admin/analytics",
  "/admin/attempts",
  "/admin/media",
] as const;

const DYNAMIC_PAGE_PATTERNS = [
  "/subjects/[id]",
  "/lessons/[id]",
  "/exams/[id]",
  "/exams/[id]/results",
  "/admin/curriculum/lessons/[id]",
] as const;

export function revalidatePlatformPaths(extraPaths: string[] = []): void {
  const uniquePaths = new Set<string>([...DEFAULT_REVALIDATE_PATHS, ...extraPaths]);

  for (const p of uniquePaths) {
    try {
      revalidatePath(p);
    } catch {
      // Safe no-op outside Next.js request context (e.g. unit tests)
    }
  }

  for (const pattern of DYNAMIC_PAGE_PATTERNS) {
    try {
      revalidatePath(pattern, "page");
    } catch {
      // Safe no-op outside Next.js request context
    }
  }
}

