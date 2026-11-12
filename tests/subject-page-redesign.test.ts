import { describe, expect, it } from "vitest";
import {
  formatLessonBadgeNumber,
  getLessonIconKind,
  getLessonStateMeta,
  resolveLessonAccessState,
} from "@/components/subjects/lesson-helpers";
import { STUDENT_NAV_ITEMS } from "@/components/layout/student/navigation";
import { shouldShowFloatingMistakesCounter } from "@/components/layout/student/FloatingMistakesCounter";

describe("Subject Page Redesign Helpers & Mobile Navigation", () => {
  it("resolves all four lesson states cleanly without conflicting labels", () => {
    const locked = resolveLessonAccessState({
      isLocked: true,
      isCompleted: true,
      progressPercent: 100,
    });
    expect(locked).toBe("LOCKED");
    expect(getLessonStateMeta(locked)).toEqual({
      state: "LOCKED",
      statusLabel: "مقفول للمشتركين",
      actionLabel: "اشترك لفتح الدرس",
    });

    const available = resolveLessonAccessState({
      isLocked: false,
      isCompleted: false,
      progressPercent: 0,
    });
    expect(available).toBe("AVAILABLE");
    expect(getLessonStateMeta(available)).toEqual({
      state: "AVAILABLE",
      statusLabel: "متاح",
      actionLabel: "ابدأ المذاكرة",
    });

    const inProgress = resolveLessonAccessState({
      isLocked: false,
      isCompleted: false,
      progressPercent: 45,
    });
    expect(inProgress).toBe("IN_PROGRESS");
    expect(getLessonStateMeta(inProgress)).toEqual({
      state: "IN_PROGRESS",
      statusLabel: "جاري المذاكرة",
      actionLabel: "كمّل المذاكرة",
    });

    const completed = resolveLessonAccessState({
      isLocked: false,
      isCompleted: true,
      progressPercent: 100,
    });
    expect(completed).toBe("COMPLETED");
    expect(getLessonStateMeta(completed)).toEqual({
      state: "COMPLETED",
      statusLabel: "مكتمل",
      actionLabel: "راجع الدرس",
    });
  });

  it("formats zero-padded lesson numbers and assigns domain-relevant icons", () => {
    expect(formatLessonBadgeNumber(1)).toBe("01");
    expect(formatLessonBadgeNumber(14)).toBe("14");

    expect(getLessonIconKind("كيف يعمل الذكاء الاصطناعي")).toBe("brain");
    expect(getLessonIconKind("الذكاء الاصطناعي في الحياة اليومية والصناعة")).toBe("monitor");
    expect(getLessonIconKind("القضايا الأخلاقية للذكاء الاصطناعي")).toBe("scale");
    expect(getLessonIconKind("عملية التحسين التكراري للمواقع")).toBe("trending");
    expect(getLessonIconKind("تقنيات التشفير والمصادقة")).toBe("shield");
    expect(getLessonIconKind("حل المشكلات والخوارزميات")).toBe("workflow");
    expect(getLessonIconKind("مقدمة في البرمجة")).toBe("code");
    expect(getLessonIconKind("تطبيقات الويب التفاعلية")).toBe("globe");
    expect(getLessonIconKind("درس غير مصنف")).toBe("book");
  });

  it("preserves restored 5-item student bottom navigation and floating mistakes counter visibility on subject pages", () => {
    expect(STUDENT_NAV_ITEMS.map((i) => i.label)).toEqual([
      "الرئيسية",
      "المواد",
      "اختبر نفسك",
      "مراجعة لأخطائي",
      "حسابي",
    ]);
    expect(STUDENT_NAV_ITEMS.map((i) => i.href)).toEqual([
      "/dashboard",
      "/subjects",
      "/exams/builder",
      "/mistakes",
      "/profile",
    ]);

    expect(shouldShowFloatingMistakesCounter("/subjects")).toBe(true);
    expect(shouldShowFloatingMistakesCounter("/subjects/cmvuucwc30007r02cp3zn3fya")).toBe(true);
  });
});

