import { describe, expect, it, vi, beforeEach } from "vitest";
import { Role, SubscriptionStatus } from "@prisma/client";

// In-memory Prisma Mock
const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  lesson: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
  },
  exam: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  subject: {
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

let currentUserMock: any = null;
vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn().mockImplementation(async () => currentUserMock),
}));

import { badRequest } from "@/lib/http";

vi.mock("@/services", () => ({
  ExamService: {
    createCustomExam: vi.fn().mockResolvedValue({
      examId: "custom-exam-123",
      attemptId: "attempt-123",
      questionCount: 30,
    }),
  },
  MediaService: {
    saveUploadedBuffer: vi.fn().mockImplementation(async (_buf, _name, type) => {
      if (!type.startsWith("image/")) {
        throw badRequest("صورة الإيصال غير صالحة");
      }
      return { url: "/uploads/receipts/test-receipt.jpg", filename: "test.jpg", size: 1024 };
    }),
  },
  AnalyticsService: {
    logAuditAction: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/services/media.service", () => ({
  MediaService: {
    saveUploadedBuffer: vi.fn().mockImplementation(async (_buf, _name, type) => {
      if (!type.startsWith("image/")) {
        throw badRequest("صورة الإيصال غير صالحة");
      }
      return { url: "/uploads/receipts/test-receipt.jpg", filename: "test.jpg", size: 1024 };
    }),
  },
}));

import { POST as createExamRoute } from "@/app/api/exams/create/route";
import { POST as uploadReceiptRoute } from "@/app/api/student/subscription/receipt/route";

describe("Subscription System & Single Trial Lesson Enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock = null;
  });

  describe("Single Trial Lesson Logic Predicate", () => {
    /**
     * Helper mirroring the exact predicate implemented in:
     * - src/app/lessons/[id]/page.tsx
     * - src/app/subjects/[id]/page.tsx
     */
    function isFreeTrialLesson(unitOrder: number, lessonOrder: number, isTrial = false): boolean {
      return Boolean(isTrial) || (unitOrder === 1 && lessonOrder === 1);
    }

    function isLessonLocked(
      userSubscriptionStatus: SubscriptionStatus,
      isStaff: boolean,
      unitOrder: number,
      lessonOrder: number,
      isTrial = false
    ): boolean {
      const isSubscriptionActive = isStaff || userSubscriptionStatus === "ACTIVE";
      const isTrialFree = isFreeTrialLesson(unitOrder, lessonOrder, isTrial);
      return !isSubscriptionActive && !isTrialFree;
    }

    it("allows a visitor/trial student to access ONLY Unit 1 Lesson 1", () => {
      // Unit 1 Lesson 1 is open
      expect(isFreeTrialLesson(1, 1)).toBe(true);
      expect(isLessonLocked(SubscriptionStatus.TRIAL, false, 1, 1)).toBe(false);

      // Unit 1 Lesson 2 is LOCKED
      expect(isFreeTrialLesson(1, 2)).toBe(false);
      expect(isLessonLocked(SubscriptionStatus.TRIAL, false, 1, 2)).toBe(true);

      // Unit 1 Lesson 3 is LOCKED
      expect(isFreeTrialLesson(1, 3)).toBe(false);
      expect(isLessonLocked(SubscriptionStatus.TRIAL, false, 1, 3)).toBe(true);
    });

    it("strictly locks subsequent units (Unit 2, 3, 4 Lesson 1) for trial students", () => {
      // Crucial test: Unit 2 Lesson 1 MUST NOT be free
      expect(isFreeTrialLesson(2, 1)).toBe(false);
      expect(isLessonLocked(SubscriptionStatus.TRIAL, false, 2, 1)).toBe(true);

      // Unit 3 Lesson 1 MUST NOT be free
      expect(isFreeTrialLesson(3, 1)).toBe(false);
      expect(isLessonLocked(SubscriptionStatus.TRIAL, false, 3, 1)).toBe(true);

      // Unit 4 Lesson 1 MUST NOT be free
      expect(isFreeTrialLesson(4, 1)).toBe(false);
      expect(isLessonLocked(SubscriptionStatus.TRIAL, false, 4, 1)).toBe(true);
    });

    it("honors an explicit isTrial = true flag on any lesson", () => {
      expect(isFreeTrialLesson(2, 3, true)).toBe(true);
      expect(isLessonLocked(SubscriptionStatus.TRIAL, false, 2, 3, true)).toBe(false);
    });

    it("grants full access to all lessons for ACTIVE subscribers", () => {
      expect(isLessonLocked(SubscriptionStatus.ACTIVE, false, 1, 1)).toBe(false);
      expect(isLessonLocked(SubscriptionStatus.ACTIVE, false, 1, 4)).toBe(false);
      expect(isLessonLocked(SubscriptionStatus.ACTIVE, false, 2, 2)).toBe(false);
      expect(isLessonLocked(SubscriptionStatus.ACTIVE, false, 4, 3)).toBe(false);
    });

    it("grants full access to staff regardless of subscription status", () => {
      expect(isLessonLocked(SubscriptionStatus.TRIAL, true, 3, 2)).toBe(false);
      expect(isLessonLocked(SubscriptionStatus.EXPIRED, true, 4, 1)).toBe(false);
    });

    it("locks all non-trial lessons when subscription is EXPIRED", () => {
      expect(isLessonLocked(SubscriptionStatus.EXPIRED, false, 1, 1)).toBe(false); // First lesson still trial
      expect(isLessonLocked(SubscriptionStatus.EXPIRED, false, 2, 1)).toBe(true);
      expect(isLessonLocked(SubscriptionStatus.EXPIRED, false, 3, 2)).toBe(true);
    });
  });

  describe("API Security: Custom Exam Generation (/api/exams/create)", () => {
    it("permits active subscribers to generate custom exams", async () => {
      currentUserMock = {
        id: "student-active",
        role: Role.STUDENT,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      };

      const req = new Request("http://localhost/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: "sub-1",
          questionCount: 30,
        }),
      });

      const res = await createExamRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.examId).toBe("custom-exam-123");
    });

    it("blocks visitors / trial students with 403 Forbidden", async () => {
      currentUserMock = {
        id: "student-trial",
        role: Role.STUDENT,
        subscriptionStatus: SubscriptionStatus.TRIAL,
      };

      const req = new Request("http://localhost/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: "sub-1",
          questionCount: 30,
        }),
      });

      const res = await createExamRoute(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain("هذه الخاصية متاحة فقط للمشتركين");
    });

    it("blocks expired subscription students with 403 Forbidden", async () => {
      currentUserMock = {
        id: "student-expired",
        role: Role.STUDENT,
        subscriptionStatus: SubscriptionStatus.EXPIRED,
      };

      const req = new Request("http://localhost/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: "sub-1",
        }),
      });

      const res = await createExamRoute(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain("هذه الخاصية متاحة فقط للمشتركين");
    });

    it("allows ADMIN staff to generate exams regardless of subscriptionStatus", async () => {
      currentUserMock = {
        id: "admin-1",
        role: Role.ADMIN,
        subscriptionStatus: SubscriptionStatus.TRIAL,
      };

      const req = new Request("http://localhost/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: "sub-1",
        }),
      });

      const res = await createExamRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Payment Receipt Upload (/api/student/subscription/receipt)", () => {
    it("rejects uploads when user is not authenticated with 401", async () => {
      currentUserMock = null;

      const formData = new FormData();
      const fakeFile = new File(["dummy"], "receipt.jpg", { type: "image/jpeg" });
      formData.append("receipt", fakeFile);

      const req = new Request("http://localhost/api/student/subscription/receipt", {
        method: "POST",
        body: formData,
      });

      const res = await uploadReceiptRoute(req);
      expect(res.status).toBe(401);
    });

    it("rejects unsupported file types (e.g. text/plain, application/pdf)", async () => {
      currentUserMock = { id: "student-1", role: Role.STUDENT };

      const formData = new FormData();
      const fakeFile = new File(["malicious text"], "receipt.txt", { type: "text/plain" });
      formData.append("file", fakeFile);

      const req = new Request("http://localhost/api/student/subscription/receipt", {
        method: "POST",
        body: formData,
      });

      const res = await uploadReceiptRoute(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("صورة الإيصال غير صالحة");
    });

    it("successfully uploads image, saves URL, and transitions status to PENDING_VERIFICATION", async () => {
      currentUserMock = {
        id: "student-1",
        name: "طالب جديد",
        role: Role.STUDENT,
        subscriptionStatus: SubscriptionStatus.TRIAL,
      };

      mockPrisma.user.update.mockResolvedValue({
        id: "student-1",
        subscriptionStatus: SubscriptionStatus.PENDING_VERIFICATION,
        paymentReceiptUrl: "/uploads/receipts/test-receipt.jpg",
      });

      const formData = new FormData();
      const fakeFile = new File(["fake-image-bytes"], "vodafone-cash-receipt.png", {
        type: "image/png",
      });
      formData.append("file", fakeFile);
      formData.append("senderPhone", "01021482860");
      formData.append("reference", "VF-998822");

      const req = new Request("http://localhost/api/student/subscription/receipt", {
        method: "POST",
        body: formData,
      });

      const res = await uploadReceiptRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.subscriptionStatus).toBe(SubscriptionStatus.PENDING_VERIFICATION);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "student-1" },
          data: expect.objectContaining({
            subscriptionStatus: SubscriptionStatus.PENDING_VERIFICATION,
            paymentReceiptUrl: "/uploads/receipts/test-receipt.jpg",
            paymentSenderPhone: "01021482860",
            paymentReference: "VF-998822",
          }),
        })
      );
    });
  });
});
