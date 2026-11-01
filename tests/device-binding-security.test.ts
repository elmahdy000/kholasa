import { describe, expect, it, vi, beforeEach } from "vitest";
import { Role } from "@prisma/client";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  session: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_pass"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

const mockCookiesStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockImplementation(async () => mockCookiesStore),
}));

import { POST as loginRoute } from "@/app/api/auth/login/route";
import { UserMutationsService } from "@/services/user/mutations";
import { getCurrentUser } from "@/lib/auth";

describe("Device Binding & Student Account Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Login Device Enforcement (/api/auth/login)", () => {
    it("allows login and registers 1st device for student", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-1",
        name: "طالب تجريبي",
        phone: "01011112222",
        password: "hashed_pass",
        role: Role.STUDENT,
        maxDevices: 2,
        boundDevices: [],
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: "sess-1" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: "01011112222",
          password: "SecretPassword123!",
          deviceId: "dev_device_1",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "student-1" },
        data: { boundDevices: { push: "dev_device_1" } },
      });
    });

    it("allows login without update if device is already registered", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-1",
        name: "طالب تجريبي",
        phone: "01011112222",
        password: "hashed_pass",
        role: Role.STUDENT,
        maxDevices: 2,
        boundDevices: ["dev_device_1"],
      });
      mockPrisma.session.create.mockResolvedValue({ id: "sess-1" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: "01011112222",
          password: "SecretPassword123!",
          deviceId: "dev_device_1",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it("allows registering a 2nd device up to maxDevices (2)", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-1",
        name: "طالب تجريبي",
        phone: "01011112222",
        password: "hashed_pass",
        role: Role.STUDENT,
        maxDevices: 2,
        boundDevices: ["dev_device_1"],
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: "sess-2" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: "01011112222",
          password: "SecretPassword123!",
          deviceId: "dev_device_2",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "student-1" },
        data: { boundDevices: { push: "dev_device_2" } },
      });
    });

    it("strictly blocks a 3rd new device with HTTP 403 Forbidden", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-1",
        name: "طالب تجريبي",
        phone: "01011112222",
        password: "hashed_pass",
        role: Role.STUDENT,
        maxDevices: 2,
        boundDevices: ["dev_device_1", "dev_device_2"],
      });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: "01011112222",
          password: "SecretPassword123!",
          deviceId: "dev_device_3_attacker",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain("الحد الأقصى من الأجهزة");
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockPrisma.session.create).not.toHaveBeenCalled();
    });

    it("exempts staff/teachers/admins from device count restrictions", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "teacher-1",
        name: "أستاذ المادة",
        phone: "01099998888",
        password: "hashed_pass",
        role: Role.TEACHER,
        maxDevices: 2,
        boundDevices: ["dev_1", "dev_2"],
      });
      mockPrisma.session.create.mockResolvedValue({ id: "sess-teacher" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: "01099998888",
          password: "SecretPassword123!",
          deviceId: "dev_3_unrestricted",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.session.create).toHaveBeenCalled();
    });
  });

  describe("Admin Device Reset (UserMutationsService.resetUserDevices)", () => {
    it("resets boundDevices and invalidates active sessions", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "student-1",
        role: Role.STUDENT,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "student-1",
        name: "طالب تجريبي",
        maxDevices: 2,
        boundDevices: [],
      });
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 2 });

      const result = await UserMutationsService.resetUserDevices("student-1", Role.ADMIN);

      expect(result.boundDevices).toEqual([]);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "student-1" },
        data: { boundDevices: [] },
        select: expect.any(Object),
      });
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: "student-1" },
      });
    });

    it("rejects non-admin actor from resetting devices", async () => {
      await expect(
        UserMutationsService.resetUserDevices("student-1", Role.STUDENT)
      ).rejects.toThrow("غير مصرح لك بالوصول");
    });
  });

  describe("Session Device Verification (getCurrentUser)", () => {
    it("invalidates student session if deviceId is not in user boundDevices", async () => {
      mockCookiesStore.get.mockReturnValue({ value: "token-123" });
      mockPrisma.session.findUnique.mockResolvedValue({
        id: "sess-abc",
        sessionToken: "token-123",
        deviceId: "dev_old_purged",
        expires: new Date(Date.now() + 10 * 86400000),
        user: {
          id: "student-1",
          role: Role.STUDENT,
          maxDevices: 2,
          boundDevices: ["dev_new_phone"],
        },
      });
      mockPrisma.session.delete.mockResolvedValue({});

      const user = await getCurrentUser();

      expect(user).toBeNull();
      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { id: "sess-abc" },
      });
    });

    it("allows student session if deviceId matches authorized boundDevices", async () => {
      mockCookiesStore.get.mockReturnValue({ value: "token-123" });
      mockPrisma.session.findUnique.mockResolvedValue({
        id: "sess-abc",
        sessionToken: "token-123",
        deviceId: "dev_approved",
        expires: new Date(Date.now() + 10 * 86400000),
        user: {
          id: "student-1",
          name: "طالب معتمد",
          role: Role.STUDENT,
          maxDevices: 2,
          boundDevices: ["dev_approved"],
        },
      });

      const user = await getCurrentUser();

      expect(user).not.toBeNull();
      expect(user?.id).toBe("student-1");
      expect(mockPrisma.session.delete).not.toHaveBeenCalled();
    });
  });
});
