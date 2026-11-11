import { describe, expect, it, vi, beforeEach } from "vitest";
import { Role, SubscriptionStatus } from "@prisma/client";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  session: {
    deleteMany: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed_pw") },
}));

let currentUserMock: { id: string; role: Role } | null = null;
vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn().mockImplementation(async () => currentUserMock),
  generateUniqueLoginCode: vi.fn().mockResolvedValue("ABC234"),
}));

vi.mock("@/lib/realtime", () => ({
  emitRealtimeEvent: vi.fn(),
  revalidatePlatformPaths: vi.fn(),
}));

import { POST as toggleStatusRoute } from "@/app/api/admin/users/[id]/toggle-status/route";
import { POST as bulkToggleStatusRoute } from "@/app/api/admin/users/bulk-toggle-status/route";
import { UserMutationsService } from "@/services/user/mutations";

describe("Admin Student Activation & Subscription Synchronization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock = { id: "admin-1", role: Role.ADMIN };
  });

  describe("POST /api/admin/users/[id]/toggle-status", () => {
    it("activates both isActive AND subscriptionStatus=ACTIVE when activating a TRIAL student", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "student-1",
        role: Role.STUDENT,
        isActive: false,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        name: "يحيي محمد",
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "student-1",
        name: "يحيي محمد",
        role: Role.STUDENT,
        isActive: true,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      });

      const req = new Request("http://localhost/api/admin/users/student-1/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      const res = await toggleStatusRoute(req, { params: Promise.resolve({ id: "student-1" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.isActive).toBe(true);
      expect(data.user.subscriptionStatus).toBe(SubscriptionStatus.ACTIVE);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "student-1" },
          data: {
            isActive: true,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
          },
        })
      );
    });

    it("suspends account and purges sessions without overwriting subscriptionStatus when deactivating", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "student-1",
        role: Role.STUDENT,
        isActive: true,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        name: "علي تامر",
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "student-1",
        name: "علي تامر",
        role: Role.STUDENT,
        isActive: false,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      });

      const req = new Request("http://localhost/api/admin/users/student-1/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });

      const res = await toggleStatusRoute(req, { params: Promise.resolve({ id: "student-1" }) });
      expect(res.status).toBe(200);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isActive: false },
        })
      );
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: "student-1" },
      });
    });

    it("respects activateSubscription=false when an admin explicitly wants trial-only activation", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "student-2",
        role: Role.STUDENT,
        isActive: false,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        name: "طالب تجريبي",
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "student-2",
        name: "طالب تجريبي",
        role: Role.STUDENT,
        isActive: true,
        subscriptionStatus: SubscriptionStatus.TRIAL,
      });

      const req = new Request("http://localhost/api/admin/users/student-2/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true, activateSubscription: false }),
      });

      const res = await toggleStatusRoute(req, { params: Promise.resolve({ id: "student-2" }) });
      expect(res.status).toBe(200);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isActive: true },
        })
      );
    });
  });

  describe("POST /api/admin/users/bulk-toggle-status", () => {
    it("filters strictly by role=STUDENT and activates subscriptions when activating students in bulk", async () => {
      mockPrisma.user.count.mockResolvedValue(5);
      mockPrisma.user.updateMany.mockResolvedValue({ count: 5 });

      const req = new Request("http://localhost/api/admin/users/bulk-toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true, role: "STUDENT", activateSubscription: true }),
      });

      const res = await bulkToggleStatusRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.count).toBe(5);
      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          role: "STUDENT",
          id: { not: "admin-1" },
        }),
        data: {
          isActive: true,
          subscriptionStatus: "ACTIVE",
        },
      });
    });
  });

  describe("UserMutationsService.createUser", () => {
    it("defaults newly admin-created active students to subscriptionStatus=ACTIVE", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(async ({ data }) => ({
        id: "stu-new",
        ...data,
        attempts: [],
        progress: [],
      }));

      await UserMutationsService.createUser(
        {
          name: "طالب جديد",
          phone: "01011223344",
          role: Role.STUDENT,
        },
        Role.ADMIN
      );

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: true,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
          }),
        })
      );
    });

    it("honors explicit subscriptionStatus=TRIAL when specified by admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(async ({ data }) => ({
        id: "stu-trial",
        ...data,
        attempts: [],
        progress: [],
      }));

      await UserMutationsService.createUser(
        {
          name: "طالب تجريبي",
          phone: "01055667788",
          role: Role.STUDENT,
          subscriptionStatus: SubscriptionStatus.TRIAL,
        },
        Role.ADMIN
      );

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subscriptionStatus: SubscriptionStatus.TRIAL,
          }),
        })
      );
    });
  });
});
