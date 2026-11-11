"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export type RealtimeTopic =
  | "notifications"
  | "curriculum"
  | "users"
  | "exams"
  | "analytics"
  | "structure";

export interface ClientRealtimeEvent {
  id: string;
  topic: RealtimeTopic;
  action: string;
  timestamp: number;
  entityId?: string | null;
  meta?: Record<string, unknown>;
}

export const KHOLASA_REALTIME_WINDOW_EVENT = "kholasa:realtime";

let activeEventSource: EventSource | null = null;
let subscriberRefs = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function dispatchRealtimeWindowEvent(event: ClientRealtimeEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ClientRealtimeEvent>(KHOLASA_REALTIME_WINDOW_EVENT, {
      detail: event,
    })
  );
}

function connectSingletonEventSource() {
  if (typeof window === "undefined" || activeEventSource) return;

  const es = new EventSource("/api/realtime/events");
  activeEventSource = es;

  es.onmessage = (messageEvent) => {
    try {
      const parsed = JSON.parse(messageEvent.data) as
        | ClientRealtimeEvent
        | { type?: string };
      if (!parsed || !("topic" in parsed) || !parsed.topic) {
        return;
      }
      dispatchRealtimeWindowEvent(parsed);
    } catch {
      // Ignore malformed/keepalive payloads
    }
  };

  es.onerror = () => {
    if (activeEventSource === es) {
      es.close();
      activeEventSource = null;
    }
    if (subscriberRefs > 0 && !reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (subscriberRefs > 0) {
          connectSingletonEventSource();
        }
      }, 3000);
    }
  };
}

function disconnectSingletonEventSource() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }
}

function isUserActivelyEditing(): boolean {
  if (typeof document === "undefined") return false;
  const active = document.activeElement as HTMLElement | null;
  if (!active) return false;
  const tag = active.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    active.isContentEditable
  );
}

/**
 * Mount once inside root role shells (StudentShell / AdminShell) to keep Server Components
 * and client listeners synchronized in real time via SSE.
 */
export function useRealtimeSync(options?: {
  refreshTopics?: RealtimeTopic[];
  isStaff?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRefreshRef = useRef(false);

  const topicsKey = (
    options?.refreshTopics ?? ["curriculum", "users", "exams", "structure", "analytics"]
  ).join(",");

  useEffect(() => {
    subscriberRefs += 1;
    connectSingletonEventSource();

    const refreshTopics = new Set<string>(topicsKey.split(",").filter(Boolean));

    const scheduleRefresh = () => {
      if (isUserActivelyEditing()) {
        pendingRefreshRef.current = true;
        return;
      }

      // Avoid interrupting an active timed student exam unless user access changed
      if (
        !options?.isStaff &&
        pathname?.startsWith("/exams/") &&
        pathname !== "/exams/builder" &&
        !pathname.endsWith("/results")
      ) {
        pendingRefreshRef.current = true;
        return;
      }

      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        pendingRefreshRef.current = false;
        router.refresh();
      }, 250);
    };

    const handleRealtimeEvent = (e: Event) => {
      const detail = (e as CustomEvent<ClientRealtimeEvent>).detail;
      if (!detail?.topic) return;

      // Always allow access-revocation refreshes immediately during exams
      if (detail.topic === "users") {
        if (!isUserActivelyEditing()) {
          if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = setTimeout(() => {
            refreshTimerRef.current = null;
            pendingRefreshRef.current = false;
            router.refresh();
          }, 150);
          return;
        }
      }

      if (refreshTopics.has(detail.topic)) {
        scheduleRefresh();
      }
    };

    const handleFocusOut = () => {
      if (pendingRefreshRef.current && !isUserActivelyEditing()) {
        scheduleRefresh();
      }
    };

    const handleVisibilityOrOnline = () => {
      if (document.visibilityState === "visible") {
        connectSingletonEventSource();
      }
    };

    window.addEventListener(KHOLASA_REALTIME_WINDOW_EVENT, handleRealtimeEvent);
    document.addEventListener("focusout", handleFocusOut);
    document.addEventListener("visibilitychange", handleVisibilityOrOnline);
    window.addEventListener("online", handleVisibilityOrOnline);

    return () => {
      window.removeEventListener(KHOLASA_REALTIME_WINDOW_EVENT, handleRealtimeEvent);
      document.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("visibilitychange", handleVisibilityOrOnline);
      window.removeEventListener("online", handleVisibilityOrOnline);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      subscriberRefs = Math.max(0, subscriberRefs - 1);
      if (subscriberRefs === 0) {
        disconnectSingletonEventSource();
      }
    };
  }, [router, pathname, topicsKey, options?.isStaff]);
}

/**
 * Subscribe any client component to real-time server events for specific topics.
 */
export function useRealtimeTopic(
  topics: RealtimeTopic | RealtimeTopic[],
  onEvent: (event: ClientRealtimeEvent) => void
) {
  const callbackRef = useRef(onEvent);
  const topicsKey = Array.isArray(topics) ? topics.join(",") : topics;

  useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const allowed = new Set(topicsKey.split(",").filter(Boolean));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ClientRealtimeEvent>).detail;
      if (detail?.topic && allowed.has(detail.topic)) {
        callbackRef.current(detail);
      }
    };
    window.addEventListener(KHOLASA_REALTIME_WINDOW_EVENT, handler);
    return () => {
      window.removeEventListener(KHOLASA_REALTIME_WINDOW_EVENT, handler);
    };
  }, [topicsKey]);
}

export function RealtimeSyncBridge({ isStaff = false }: { isStaff?: boolean }) {
  useRealtimeSync({
    isStaff,
    refreshTopics: isStaff
      ? ["curriculum", "users", "exams", "structure", "analytics", "notifications"]
      : ["curriculum", "users", "exams", "structure"],
  });
  return null;
}

export const KHOLASA_MISTAKES_UPDATED_EVENT = "kholasa:mistakes-updated";

export function dispatchMistakesUpdatedClientEvent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(KHOLASA_MISTAKES_UPDATED_EVENT));
}
