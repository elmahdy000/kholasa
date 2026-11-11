import { beforeEach, describe, expect, it, vi } from "vitest";
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
    delete: vi.fn(),
  },
  session: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockCookieGet = vi.hoisted(() => vi.fn());
const mockCookieSet = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
    set: mockCookieSet,
  })),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_pw"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("@/lib/realtime", () => ({
  emitRealtimeEvent: vi.fn(),
  revalidatePlatformPaths: vi.fn(),
  isStaffRole: vi.fn((r: string) =>
    ["ADMIN", "SUPER_ADMIN", "ASSISTANT", "TEACHER"].includes(r)
  ),
}));

import {
  canDeleteUsers,
  canGradeAttempts,
  canManageAnnouncements,
  canManageCurriculum,
  canManageExams,
  canManageMedia,
  canManageQuestions,
  canManageStructure,
  canManageUsers,
  canViewAnalytics,
  getCurrentUser,
  isAdmin,
  isAdminOrAssistant,
  isStaff,
} from "@/lib/auth";
import {
  canActorAssignUserRole,
  canActorManageTargetUser,
  getRoleArabicLabel,
} from "@/lib/roles";
import { isSubscriptionExemptStaff } from "@/lib/lesson-access";
import { isStaffRole as isRealtimeStaffRole } from "@/lib/realtime";
import { UserMutationsService } from "@/services/user/mutations";
import {
  DELETE as deleteUserRoute,
  GET as getUserRoute,
  PATCH as patchUserRoute,
} from "@/app/api/admin/users/[id]/route";
import { POST as toggleStatusRoute } from "@/app/api/admin/users/[id]/toggle-status/route";
import { POST as bulkToggleStatusRoute } from "@/app/api/admin/users/bulk-toggle-status/route";
import { POST as loginRoute } from "@/app/api/auth/login/route";
import { GET as lookupCodeRoute } from "@/app/api/auth/lookup-code/route";

describe("ASSISTANT role RBAC & Admin control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Permission matrix helpers", () => {
    it("grants ASSISTANT all operational/academic permissions except deleting users", () => {
      expect(isStaff("ASSISTANT")).toBe(true);
      expect(isAdminOrAssistant("ASSISTANT")).toBe(true);
      expect(canManageCurriculum("ASSISTANT")).toBe(true);
      expect(canManageQuestions("ASSISTANT")).toBe(true);
      expect(canManageExams("ASSISTANT")).toBe(true);
      expect(canGradeAttempts("ASSISTANT")).toBe(true);
      expect(canManageMedia("ASSISTANT")).toBe(true);
      expect(canManageStructure("ASSISTANT")).toBe(true);
      expect(canManageAnnouncements("ASSISTANT")).toBe(true);
      expect(canViewAnalytics("ASSISTANT")).toBe(true);
      expect(canManageUsers("ASSISTANT")).toBe(true);
      expect(isSubscriptionExemptStaff("ASSISTANT")).toBe(true);
      expect(isRealtimeStaffRole("ASSISTANT")).toBe(true);

      // Critical restriction
      expect(canDeleteUsers("ASSISTANT")).toBe(false);
      expect(isAdmin("ASSISTANT")).toBe(false);
      expect(canDeleteUsers("ADMIN")).toBe(true);
      expect(canDeleteUsers("SUPER_ADMIN")).toBe(true);
      expect(getRoleArabicLabel("ASSISTANT")).toBe("مساعد إداري");
    });

    it("enforces role hierarchy between SUPER_ADMIN, ADMIN, ASSISTANT, and STUDENT", () => {
      expect(canActorManageTargetUser("ADMIN", "ASSISTANT")).toBe(true);
      expect(canActorAssignUserRole("ADMIN", "ASSISTANT")).toBe(true);
      expect(canActorManageTargetUser("ADMIN", "SUPER_ADMIN")).toBe(false);

      expect(canActorManageTargetUser("ASSISTANT", "STUDENT")).toBe(true);
      expect(canActorManageTargetUser("ASSISTANT", "TEACHER")).toBe(true);
      expect(canActorManageTargetUser("ASSISTANT", "EDITOR")).toBe(true);
      expect(canActorManageTargetUser("ASSISTANT", "ADMIN")).toBe(false);
      expect(canActorManageTargetUser("ASSISTANT", "SUPER_ADMIN")).toBe(false);
      expect(canActorManageTargetUser("ASSISTANT", "ASSISTANT")).toBe(false);

      expect(canActorAssignUserRole("ASSISTANT", "STUDENT")).toBe(true);
      expect(canActorAssignUserRole("ASSISTANT", "ASSISTANT")).toBe(false);
      expect(canActorAssignUserRole("ASSISTANT", "ADMIN")).toBe(false);
      expect(canActorAssignUserRole("ASSISTANT", "SUPER_ADMIN")).toBe(false);
    });
  });

  describe("2. UserMutationsService enforcement", () => {
    it("blocks ASSISTANT from deleting students or any user", async () => {
      await expect(
        UserMutationsService.deleteUser("student-1", Role.ASSISTANT, "assist-1")
      ).rejects.toThrow("غير مصرح للمساعد بحذف الطلاب أو المستخدمين");

      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it("allows ADMIN to delete an ASSISTANT user account", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ role: Role.ASSISTANT });
      mockPrisma.user.delete.mockResolvedValueOnce({ id: "assist-1" });

      await UserMutationsService.deleteUser("assist-1", Role.ADMIN, "admin-1");
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "assist-1" } });
    });

    it("blocks ASSISTANT from creating ADMIN or ASSISTANT or editing ADMIN", async () => {
      await expect(
        UserMutationsService.createUser(
          { name: "محاولة ترقية", phone: "01012345678", role: Role.ADMIN },
          Role.ASSISTANT
        )
      ).rejects.toThrow("غير مصرح");

      await expect(
        UserMutationsService.createUser(
          { name: "مساعد ثاني", phone: "01012345679", role: Role.ASSISTANT },
          Role.ASSISTANT
        )
      ).rejects.toThrow("غير مصرح");

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "admin-1",
        role: Role.ADMIN,
        email: "admin@kholasa.app",
      });

      await expect(
        UserMutationsService.updateUser(
          "admin-1",
          { name: "تغيير اسم الادمن" },
          Role.ASSISTANT,
          "assist-1"
        )
      ).rejects.toThrow("غير مصرح");
    });

    it("allows ASSISTANT to create/update students and reset student devices", async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // phone check
        .mockResolvedValueOnce(null) // generated loginCode check
        .mockResolvedValueOnce({
          id: "stu-1",
          role: Role.STUDENT,
          email: null,
          boundDevices: ["d1"],
        }); // resetUserDevices lookup

      mockPrisma.user.create.mockResolvedValueOnce({
        id: "stu-new",
        name: "طالب جديد",
        role: Role.STUDENT,
      });

      const created = await UserMutationsService.createUser(
        { name: "طالب جديد", phone: "01022334455", role: Role.STUDENT },
        Role.ASSISTANT
      );
      expect(created.id).toBe("stu-new");

      mockPrisma.user.update.mockResolvedValueOnce({
        id: "stu-1",
        name: "طالب",
        maxDevices: 1,
        boundDevices: [],
      });

      await UserMutationsService.resetUserDevices("stu-1", Role.ASSISTANT);
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it("allows ADMIN to update ASSISTANT email & password and revokes active assistant sessions", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "assist-1",
        role: Role.ASSISTANT,
        email: "old@kholasa.app",
        phone: "01000000001",
      });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValueOnce({
        id: "assist-1",
        name: "المساعد الجديد",
        email: "newassist@kholasa.app",
        phone: "01000000002",
        role: Role.ASSISTANT,
        isActive: true,
      });

      const updated = await UserMutationsService.updateUser(
        "assist-1",
        {
          name: "المساعد الجديد",
          email: "newassist@kholasa.app",
          phone: "01000000002",
          password: "NewAssist@2026",
        },
        Role.ADMIN,
        "admin-1"
      );

      expect(updated.email).toBe("newassist@kholasa.app");
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: "assist-1" },
      });
    });

    it("allows ADMIN to update own name/password when role is unchanged, while blocking self-role-change or self-deactivation", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "admin-1",
        role: Role.ADMIN,
        email: "admin@kholasa.app",
        phone: "01000000000",
      });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValueOnce({
        id: "admin-1",
        name: "د. محمود",
        role: Role.ADMIN,
      });

      const okSelf = await UserMutationsService.updateUser(
        "admin-1",
        { name: "د. محمود", role: Role.ADMIN },
        Role.ADMIN,
        "admin-1"
      );
      expect(okSelf.name).toBe("د. محمود");

      await expect(
        UserMutationsService.updateUser(
          "admin-1",
          { role: Role.STUDENT },
          Role.ADMIN,
          "admin-1"
        )
      ).rejects.toThrow("لا يمكنك تغيير رتبتك بنفسك");

      await expect(
        UserMutationsService.updateUser(
          "admin-1",
          { isActive: false },
          Role.ADMIN,
          "admin-1"
        )
      ).rejects.toThrow("لا يمكنك تعطيل حسابك الشخصي");
    });

    it("requires explicit email/phone and >=8 char password when creating an ASSISTANT", async () => {
      await expect(
        UserMutationsService.createUser(
          { name: "مساعد بدون تواصل", role: Role.ASSISTANT, password: "Password@123" },
          Role.ADMIN
        )
      ).rejects.toThrow("البريد الإلكتروني أو رقم الهاتف");

      await expect(
        UserMutationsService.createUser(
          { name: "مساعد بكلمة قصيرة", email: "a@b.c", role: Role.ASSISTANT, password: "123" },
          Role.ADMIN
        )
      ).rejects.toThrow("8 أحرف");
    });

    it("clears loginCode=null when promoting a user to non-STUDENT role (ASSISTANT)", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "stu-promo",
        role: Role.STUDENT,
        email: "assist2@kholasa.app",
        phone: "01077777777",
        loginCode: "STU123",
      });
      mockPrisma.user.update.mockResolvedValueOnce({
        id: "stu-promo",
        role: Role.ASSISTANT,
        loginCode: null,
      });

      await UserMutationsService.updateUser(
        "stu-promo",
        { role: Role.ASSISTANT },
        Role.ADMIN,
        "admin-1"
      );

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: Role.ASSISTANT,
            loginCode: null,
          }),
        })
      );
    });
  });

  describe("3. HTTP route handlers & suspended session revocation", () => {
    function mockSessionUser(id: string, role: Role, isActive = true) {
      mockCookieGet.mockReturnValue({ value: "tok-123" });
      mockPrisma.session.findUnique.mockResolvedValue({
        id: "sess-1",
        expires: new Date(Date.now() + 3600_000),
        deviceId: null,
        user: {
          id,
          name: "User",
          email: "u@kholasa.app",
          phone: "01000000001",
          loginCode: null,
          role,
          gradeId: null,
          systemId: null,
          trackId: null,
          schoolCategory: "ARABIC",
          maxDevices: 1,
          boundDevices: [],
          isActive,
          studyMode: "ONLINE",
          centerName: null,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          paymentReceiptUrl: null,
          paymentSenderPhone: null,
          paymentReference: null,
          paymentUploadedAt: null,
          subscriptionExpiresAt: null,
          system: null,
          grade: null,
          track: null,
        },
      });
    }

    it("returns 403 when ASSISTANT calls DELETE /api/admin/users/[id]", async () => {
      mockSessionUser("assist-1", Role.ASSISTANT);

      const req = new Request("http://localhost/api/admin/users/stu-1", { method: "DELETE" });
      const res = await deleteUserRoute(req, { params: Promise.resolve({ id: "stu-1" }) });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain("غير مصرح للمساعد بحذف الطلاب");
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it("allows ASSISTANT to activate a student via toggle-status, but returns 403 on an ADMIN", async () => {
      mockSessionUser("assist-1", Role.ASSISTANT);
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "stu-1",
        role: Role.STUDENT,
        isActive: false,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        name: "طالب",
      });
      mockPrisma.user.update.mockResolvedValueOnce({
        id: "stu-1",
        name: "طالب",
        role: Role.STUDENT,
        isActive: true,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      });

      const okReq = new Request("http://localhost/api/admin/users/stu-1/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      const okRes = await toggleStatusRoute(okReq, { params: Promise.resolve({ id: "stu-1" }) });
      expect(okRes.status).toBe(200);

      // Attempt toggling an ADMIN
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "admin-1",
        role: Role.ADMIN,
        isActive: true,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        name: "الأدمن",
      });
      const forbiddenReq = new Request("http://localhost/api/admin/users/admin-1/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      const forbiddenRes = await toggleStatusRoute(forbiddenReq, {
        params: Promise.resolve({ id: "admin-1" }),
      });
      expect(forbiddenRes.status).toBe(403);
    });

    it("blocks ASSISTANT from escalating student role via PATCH /api/admin/users/[id]", async () => {
      mockSessionUser("assist-1", Role.ASSISTANT);
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "stu-1",
        role: Role.STUDENT,
        email: null,
        phone: "01055555555",
      });

      const req = new Request("http://localhost/api/admin/users/stu-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: Role.ADMIN }),
      });
      const res = await patchUserRoute(req, { params: Promise.resolve({ id: "stu-1" }) });
      expect(res.status).toBe(403);
    });

    it("forces student-safe filter on bulk-toggle-status when invoked by ASSISTANT", async () => {
      mockSessionUser("assist-1", Role.ASSISTANT);
      mockPrisma.user.count.mockResolvedValueOnce(1);
      mockPrisma.user.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.user.findMany.mockResolvedValueOnce([{ id: "stu-1" }]);

      const req = new Request("http://localhost/api/admin/users/bulk-toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: ["stu-1", "admin-1"],
          isActive: false,
        }),
      });
      const res = await bulkToggleStatusRoute(req);
      expect(res.status).toBe(200);
      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: { notIn: ["SUPER_ADMIN", "ADMIN", "ASSISTANT"] },
          }),
        })
      );
    });

    it("revokes active session in getCurrentUser when an ASSISTANT account is deactivated (isActive=false)", async () => {
      mockSessionUser("assist-1", Role.ASSISTANT, false);

      const user = await getCurrentUser();
      expect(user).toBeNull();
      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { id: "sess-1" },
      });
    });

    it("blocks ASSISTANT from inspecting ADMIN detailed profile via GET /api/admin/users/[id]", async () => {
      mockSessionUser("assist-1", Role.ASSISTANT);
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "admin-1",
        name: "Admin",
        email: "admin@kholasa.app",
        phone: "01000000000",
        loginCode: null,
        role: Role.ADMIN,
        schoolCategory: "ARABIC",
        isActive: true,
        studyMode: "ONLINE",
        centerName: null,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        paymentReceiptUrl: null,
        paymentSenderPhone: null,
        paymentReference: null,
        paymentUploadedAt: null,
        subscriptionExpiresAt: null,
        createdAt: new Date(),
        maxDevices: 1,
        boundDevices: [],
        system: null,
        grade: null,
        _count: { attempts: 0, progress: 0, mistakes: 0 },
        attempts: [],
        progress: [],
        mistakes: [],
        sessions: [],
      });

      const req = new Request("http://localhost/api/admin/users/admin-1");
      const res = await getUserRoute(req, { params: Promise.resolve({ id: "admin-1" }) });
      expect(res.status).toBe(403);
    });

    it("rejects passwordless student-code login and lookup-code for ASSISTANT/staff roles", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "assist-1",
        name: "المساعد",
        email: "assistant@kholasa.app",
        phone: "01000000001",
        loginCode: "ASSIST1",
        role: Role.ASSISTANT,
        isActive: true,
        boundDevices: [],
      });

      const loginReq = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.55" },
        body: JSON.stringify({ code: "ASSIST1" }),
      });
      const loginRes = await loginRoute(loginReq);
      expect(loginRes.status).toBe(401);

      const lookupReq = new Request("http://localhost/api/auth/lookup-code?code=ASSIST1", {
        headers: { "x-forwarded-for": "10.0.0.56" },
      });
      const lookupRes = await lookupCodeRoute(lookupReq);
      const lookupJson = await lookupRes.json();
      expect(lookupRes.status).toBe(200);
      expect(lookupJson.found).toBe(false);
    });
  });
});

