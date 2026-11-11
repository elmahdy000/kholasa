import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  examAttempt: {
    findFirst: vi.fn(),
  },
  dailyChallenge: {
    findUnique: vi.fn(),
  },
  mistakeReview: {
    count: vi.fn(),
  },
  studentProgress: {
    findFirst: vi.fn(),
  },
  announcement: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  notificationRead: {
    upsert: vi.fn(),
    createMany: vi.fn(),
  },
  pushSubscription: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
}));

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockCanManageAnnouncements = vi.hoisted(() => vi.fn());
const mockRevalidatePath = vi.hoisted(() => vi.fn());
const mockWebPushSend = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  canManageAnnouncements: mockCanManageAnnouncements,
}));
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));
vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: mockWebPushSend,
  },
}));

import {
  emitRealtimeEvent,
  subscribeRealtimeEvents,
  shouldDeliverRealtimeEvent,
  revalidatePlatformPaths,
} from "@/lib/realtime";
import { NotificationService } from "@/services/notification.service";
import { GET as getNotificationsRoute, PATCH as patchNotificationsRoute } from "@/app/api/notifications/route";
import { POST as createAdminNotificationRoute } from "@/app/api/admin/notifications/route";
import { DELETE as deleteAdminNotificationRoute } from "@/app/api/admin/notifications/[id]/route";
import { GET as getRealtimeSseRoute } from "@/app/api/realtime/events/route";

describe("Realtime Event Hub, SSE Filtering & Notifications Remediation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Realtime Hub & Audience Filtering", () => {
    it("delivers emitted events to subscribers and stops delivery after unsubscribe", () => {
      const received: string[] = [];
      const unsubscribe = subscribeRealtimeEvents((ev) => {
        received.push(`${ev.topic}:${ev.action}`);
      });

      const emitted = emitRealtimeEvent({
        topic: "curriculum",
        action: "lesson_updated",
        audience: "all",
        entityId: "lesson-1",
      });

      expect(emitted.id).toBeTruthy();
      expect(typeof emitted.timestamp).toBe("number");
      expect(received).toEqual(["curriculum:lesson_updated"]);

      unsubscribe();
      emitRealtimeEvent({
        topic: "curriculum",
        action: "ignored_after_unsub",
        audience: "all",
      });

      expect(received).toEqual(["curriculum:lesson_updated"]);
    });

    it("enforces role, user, grade, and category access boundaries in SSE filtering", () => {
      const studentArabicG11 = {
        id: "stu-ar-11",
        role: "STUDENT",
        gradeId: "g11",
        schoolCategory: "ARABIC",
      };
      const studentLangG10 = {
        id: "stu-en-10",
        role: "STUDENT",
        gradeId: "g10",
        schoolCategory: "LANGUAGES",
      };
      const adminViewer = {
        id: "adm-1",
        role: "ADMIN",
        gradeId: null,
        schoolCategory: null,
      };

      const staffOnly = emitRealtimeEvent({
        topic: "users",
        action: "receipt_uploaded",
        audience: "staff",
        entityId: "stu-ar-11",
      });
      expect(shouldDeliverRealtimeEvent(staffOnly, adminViewer)).toBe(true);
      expect(shouldDeliverRealtimeEvent(staffOnly, studentArabicG11)).toBe(false);

      const userSpecific = emitRealtimeEvent({
        topic: "users",
        action: "user_toggled",
        audience: "user",
        targetUserId: "stu-ar-11",
      });
      expect(shouldDeliverRealtimeEvent(userSpecific, studentArabicG11)).toBe(true);
      expect(shouldDeliverRealtimeEvent(userSpecific, studentLangG10)).toBe(false);
      expect(shouldDeliverRealtimeEvent(userSpecific, adminViewer)).toBe(false);

      const gradeTargeted = emitRealtimeEvent({
        topic: "notifications",
        action: "created",
        audience: "all",
        targetGradeId: "g11",
        targetCategory: "ARABIC",
      });
      expect(shouldDeliverRealtimeEvent(gradeTargeted, adminViewer)).toBe(true);
      expect(shouldDeliverRealtimeEvent(gradeTargeted, studentArabicG11)).toBe(true);
      expect(shouldDeliverRealtimeEvent(gradeTargeted, studentLangG10)).toBe(false);
    });

    it("revalidates platform paths without failing when Next context throws", () => {
      mockRevalidatePath.mockImplementationOnce(() => {
        throw new Error("no static generation store");
      });
      expect(() => revalidatePlatformPaths(["/custom-path"])).not.toThrow();
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/custom-path");
    });
  });

  describe("PATCH & GET /api/notifications", () => {
    it("accepts both { all: true } and { markAll: true } and marks all announcements read", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "stu-1",
        role: "STUDENT",
        gradeId: "g11",
        schoolCategory: "ARABIC",
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        role: "STUDENT",
        gradeId: "g11",
        schoolCategory: "ARABIC",
      });
      mockPrisma.announcement.findMany.mockResolvedValue([{ id: "ann-1" }, { id: "ann-2" }]);
      mockPrisma.notificationRead.createMany.mockResolvedValue({ count: 2 });

      const reqLegacy = new NextRequest("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ all: true }),
      });
      const resLegacy = await patchNotificationsRoute(reqLegacy);
      expect(resLegacy.status).toBe(200);
      expect(resLegacy.headers.get("Cache-Control")).toContain("no-store");
      await expect(resLegacy.json()).resolves.toEqual({ success: true, count: 2 });

      const reqCanonical = new NextRequest("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAll: true }),
      });
      const resCanonical = await patchNotificationsRoute(reqCanonical);
      expect(resCanonical.status).toBe(200);
      await expect(resCanonical.json()).resolves.toEqual({ success: true, count: 2 });
    });

    it("accepts both { id } and { notificationId } and emits realtime read_receipt", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "stu-1",
        role: "STUDENT",
      });
      mockPrisma.announcement.findUnique.mockResolvedValue({ id: "ann-99" });
      mockPrisma.notificationRead.upsert.mockResolvedValue({ id: "read-1" });

      const events: string[] = [];
      const unsub = subscribeRealtimeEvents((ev) => events.push(`${ev.topic}:${ev.action}:${ev.audience}`));

      const reqById = new NextRequest("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id: "ann-99" }),
      });
      const res1 = await patchNotificationsRoute(reqById);
      expect(res1.status).toBe(200);
      await expect(res1.json()).resolves.toEqual({ success: true });

      const reqByNotifId = new NextRequest("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId: "ann-99" }),
      });
      const res2 = await patchNotificationsRoute(reqByNotifId);
      expect(res2.status).toBe(200);
      await expect(res2.json()).resolves.toEqual({ success: true });

      unsub();
      expect(events).toContain("notifications:mark_read:user");
      expect(events).toContain("notifications:read_receipt:staff");
    });

    it("returns 400 for empty payload and 401 when unauthenticated, and sets no-store on GET", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const getRes = await getNotificationsRoute();
      expect(getRes.status).toBe(200);
      expect(getRes.headers.get("Cache-Control")).toContain("no-store");

      const unauthPatch = new NextRequest("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAll: true }),
      });
      const unauthRes = await patchNotificationsRoute(unauthPatch);
      expect(unauthRes.status).toBe(401);

      mockGetCurrentUser.mockResolvedValue({ id: "stu-1", role: "STUDENT" });
      const badPatch = new NextRequest("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({}),
      });
      const badRes = await patchNotificationsRoute(badPatch);
      expect(badRes.status).toBe(400);
    });

    it("serializes GET /api/notifications as an object { notifications, unreadCount } rather than stripping own array properties", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "stu-1",
        role: "STUDENT",
        gradeId: "g11",
        schoolCategory: "ARABIC",
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "stu-1",
        role: "STUDENT",
        gradeId: "g11",
        schoolCategory: "ARABIC",
      });
      mockPrisma.examAttempt.findFirst.mockResolvedValue(null);
      mockPrisma.dailyChallenge.findUnique.mockResolvedValue(null);
      mockPrisma.mistakeReview.count.mockResolvedValue(0);
      mockPrisma.studentProgress.findFirst.mockResolvedValue(null);
      mockPrisma.announcement.findMany.mockResolvedValue([
        {
          id: "ann-http",
          type: "ANNOUNCEMENT",
          title: "إشعار اختبار HTTP",
          message: "يجب أن يصل للعميل ككائن كامل",
          link: "/dashboard",
          createdAt: new Date("2026-11-11T09:00:00Z"),
          isUrgent: true,
          reads: [],
        },
      ]);

      const res = await getNotificationsRoute();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json)).toBe(false);
      expect(Array.isArray(json.notifications)).toBe(true);
      expect(json.notifications.some((n: { id: string }) => n.id === "ann-http")).toBe(true);
      expect(json.unreadCount).toBe(json.notifications.length);
    });
  });

  describe("NotificationService Scope, Admin Alerts & Web Push Assets", () => {
    it("excludes isUnderConstruction subjects from student mistake and progress queries", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "stu-1",
        role: "STUDENT",
        gradeId: "g11",
        schoolCategory: "ARABIC",
      });
      mockPrisma.examAttempt.findFirst.mockResolvedValue({ id: "att-1" });
      mockPrisma.dailyChallenge.findUnique.mockResolvedValue({ completedAt: new Date() });
      mockPrisma.mistakeReview.count.mockResolvedValue(0);
      mockPrisma.studentProgress.findFirst.mockResolvedValue(null);
      mockPrisma.announcement.findMany.mockResolvedValue([]);

      await NotificationService.getInAppNotifications("stu-1");

      expect(mockPrisma.mistakeReview.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            question: expect.objectContaining({
              subject: expect.objectContaining({
                isPublished: true,
                isUnderConstruction: false,
              }),
            }),
          }),
        })
      );

      expect(mockPrisma.studentProgress.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            lesson: expect.objectContaining({
              unit: expect.objectContaining({
                subject: expect.objectContaining({
                  isPublished: true,
                  isUnderConstruction: false,
                }),
              }),
            }),
          }),
        })
      );
    });

    it("returns Admin operational notifications instead of student daily challenge for staff users", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "adm-1",
        role: "ADMIN",
        gradeId: null,
        schoolCategory: null,
      });
      mockPrisma.user.count.mockResolvedValue(3);
      mockPrisma.announcement.findMany.mockResolvedValue([
        {
          id: "ann-adm",
          type: "ANNOUNCEMENT",
          title: "إعلان عام",
          message: "تفاصيل الإعلان",
          link: null,
          createdAt: new Date("2026-11-11T08:00:00Z"),
          isUrgent: false,
          reads: [],
        },
      ]);

      const feed = await NotificationService.getInAppNotifications("adm-1");
      expect(feed.some((n) => n.type === "DAILY_EXAM")).toBe(false);
      expect(feed[0]).toMatchObject({
        id: "admin_pending_receipts_3",
        type: "SYSTEM",
        link: "/admin/users",
        isUrgent: true,
      });
      expect(feed[1]).toMatchObject({
        id: "ann-adm",
        link: "/admin/notifications",
      });
    });

    it("uses existing /icon-192.png asset paths in push notifications", async () => {
      const daily = NotificationService.getDailyExamPushPayload();
      expect(daily.icon).toBe("/icon-192.png");
      expect(daily.badge).toBe("/icon-192.png");

      mockWebPushSend.mockResolvedValue({});
      await NotificationService.sendPushToSubscription(
        { endpoint: "https://push.example/1", p256dh: "k", auth: "a" },
        { title: "Test", body: "Body" }
      );
      const sentPayload = JSON.parse(mockWebPushSend.mock.calls[0][1] as string);
      expect(sentPayload.icon).toBe("/icon-192.png");
      expect(sentPayload.badge).toBe("/icon-192.png");
    });
  });

  describe("Admin Announcements API & Realtime Emission", () => {
    it("validates payload, awaits push delivery, and emits realtime event on POST /api/admin/notifications", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "adm-1", role: "ADMIN" });
      mockCanManageAnnouncements.mockReturnValue(true);

      const badUrlReq = new NextRequest("http://localhost/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({
          title: "تنبيه",
          message: "محتوى",
          link: "javascript:alert(1)",
        }),
      });
      const badRes = await createAdminNotificationRoute(badUrlReq);
      expect(badRes.status).toBe(400);

      mockPrisma.announcement.create.mockResolvedValue({
        id: "ann-new",
        title: "بث مباشر",
        message: "تفاصيل فورية",
        type: "ANNOUNCEMENT",
        targetGradeId: null,
        targetSchoolCategory: null,
        link: "/dashboard",
        isUrgent: true,
        expiresAt: null,
        createdById: "adm-1",
        createdAt: new Date(),
      });
      mockPrisma.pushSubscription.findMany.mockResolvedValue([
        { id: "sub-1", endpoint: "https://push.example/sub1", p256dh: "p", auth: "a" },
      ]);
      mockWebPushSend.mockResolvedValue({});

      const seen: string[] = [];
      const unsub = subscribeRealtimeEvents((ev) => seen.push(`${ev.topic}:${ev.action}:${ev.entityId}`));

      const validReq = new NextRequest("http://localhost/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({
          title: "بث مباشر",
          message: "تفاصيل فورية",
          link: "/dashboard",
          isUrgent: true,
          sendPush: true,
        }),
      });

      const res = await createAdminNotificationRoute(validReq);
      unsub();

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.announcement.id).toBe("ann-new");
      expect(data.pushResult).toEqual({ sentCount: 1, total: 1 });
      expect(seen).toContain("notifications:created:ann-new");
    });

    it("emits deleted realtime event on DELETE /api/admin/notifications/[id]", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "adm-1", role: "ADMIN" });
      mockCanManageAnnouncements.mockReturnValue(true);
      mockPrisma.announcement.delete.mockResolvedValue({ id: "ann-del" });

      const seen: string[] = [];
      const unsub = subscribeRealtimeEvents((ev) => seen.push(`${ev.topic}:${ev.action}:${ev.entityId}`));

      const req = new NextRequest("http://localhost/api/admin/notifications/ann-del", {
        method: "DELETE",
      });
      const res = await deleteAdminNotificationRoute(req, {
        params: Promise.resolve({ id: "ann-del" }),
      });
      unsub();

      expect(res.status).toBe(200);
      expect(seen).toContain("notifications:deleted:ann-del");
    });
  });

  describe("SSE Endpoint /api/realtime/events", () => {
    it("rejects unauthenticated listeners with 401 and opens filtered stream for authenticated users", async () => {
      mockGetCurrentUser.mockResolvedValueOnce(null);
      const unauthReq = new NextRequest("http://localhost/api/realtime/events");
      const unauthRes = await getRealtimeSseRoute(unauthReq);
      expect(unauthRes.status).toBe(401);

      const abortController = new AbortController();
      mockGetCurrentUser.mockResolvedValueOnce({
        id: "stu-stream",
        role: "STUDENT",
        gradeId: "g11",
        schoolCategory: "ARABIC",
      });
      const authReq = new NextRequest("http://localhost/api/realtime/events", {
        signal: abortController.signal,
      });
      const sseRes = await getRealtimeSseRoute(authReq);

      expect(sseRes.status).toBe(200);
      expect(sseRes.headers.get("Content-Type")).toContain("text/event-stream");
      expect(sseRes.headers.get("X-Accel-Buffering")).toBe("no");
      expect(sseRes.headers.get("Cache-Control")).toContain("no-store");

      const reader = sseRes.body!.getReader();
      const firstChunk = await reader.read();
      const firstText = new TextDecoder().decode(firstChunk.value);
      expect(firstText).toContain('"type":"connected"');
      expect(firstText).toContain('"userId":"stu-stream"');

      // Staff-only event should be filtered out; student-visible event should stream immediately
      emitRealtimeEvent({ topic: "users", action: "secret_staff", audience: "staff" });
      emitRealtimeEvent({
        topic: "notifications",
        action: "created",
        audience: "all",
        targetGradeId: "g11",
        targetCategory: "ARABIC",
        entityId: "live-ann-1",
      });

      const nextChunk = await reader.read();
      const nextText = new TextDecoder().decode(nextChunk.value);
      expect(nextText).toContain('"entityId":"live-ann-1"');
      expect(nextText).not.toContain("secret_staff");

      abortController.abort();
      await reader.cancel();
    });
  });
});

