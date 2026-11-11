"use client";

import { useCallback, useEffect, useState } from "react";
import {
  KHOLASA_MISTAKES_UPDATED_EVENT,
  useRealtimeTopic,
} from "@/lib/realtime-client";
import type { StudentMistakeDiagnosisSummary } from "@/lib/mistake-diagnosis";

const EMPTY_SUMMARY: StudentMistakeDiagnosisSummary = {
  unresolvedCount: 0,
  resolvedCount: 0,
  topWeakness: null,
  breakdown: [],
};

export function useStudentMistakesSummary(enabled: boolean) {
  const [summary, setSummary] = useState<StudentMistakeDiagnosisSummary>(EMPTY_SUMMARY);
  const [hasLoaded, setHasLoaded] = useState(false);

  const refreshSummary = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch("/api/student/mistakes-summary", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as StudentMistakeDiagnosisSummary;
      if (typeof data?.unresolvedCount === "number") {
        setSummary(data);
        setHasLoaded(true);
      }
    } catch {
      // Keep last known summary on transient network blip
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const initTimer = setTimeout(() => {
      void refreshSummary();
    }, 0);

    const handleLocalUpdate = () => {
      void refreshSummary();
    };
    const handleResume = () => {
      if (document.visibilityState === "visible") {
        void refreshSummary();
      }
    };

    window.addEventListener(KHOLASA_MISTAKES_UPDATED_EVENT, handleLocalUpdate);
    document.addEventListener("visibilitychange", handleResume);
    window.addEventListener("focus", handleLocalUpdate);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener(KHOLASA_MISTAKES_UPDATED_EVENT, handleLocalUpdate);
      document.removeEventListener("visibilitychange", handleResume);
      window.removeEventListener("focus", handleLocalUpdate);
    };
  }, [enabled, refreshSummary]);

  useRealtimeTopic(["analytics", "notifications"], () => {
    void refreshSummary();
  });

  return { summary, hasLoaded, refreshSummary };
}
