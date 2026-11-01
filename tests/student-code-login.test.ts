import { describe, expect, it, vi, beforeEach } from "vitest";
import { Role, SchoolCategory } from "@prisma/client";

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

describe("Student Code Login & Device Quota Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Student Access Code Login", () => {
    it("successfully logs in a student using their unique 6-character code", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-100",
        name: "يوسف أحمد",
        phone: "01012345678",
        loginCode: "J9KFQY",
        role: Role.STUDENT,
        maxDevices: 1,
        boundDevices: [],
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: "sess-100" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "j9kfqy", // lowercase input should be matched
          deviceId: "phone_device_1",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.loginCode).toBe("J9KFQY");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "student-100" },
        data: { boundDevices: ["phone_device_1"] },
      });
    });

    it("rejects invalid or non-existent student codes with 401 Unauthorized", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "INVALID_CODE",
          deviceId: "phone_device_1",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toContain("كود الدخول غير صحيح");
    });
  });

  describe("One-Device Enforcement by Default (1 Device Only)", () => {
    it("strictly blocks a 2nd device when maxDevices is 1 (the default)", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-100",
        name: "يوسف أحمد",
        phone: "01012345678",
        loginCode: "J9KFQY",
        role: Role.STUDENT,
        maxDevices: 1, // Default: 1 device only!
        boundDevices: ["phone_device_1"],
      });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "J9KFQY",
          deviceId: "laptop_device_2_blocked",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain("جهاز واحد فقط");
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockPrisma.session.create).not.toHaveBeenCalled();
    });

    it("allows the registered device to log in repeatedly without issues", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-100",
        name: "يوسف أحمد",
        phone: "01012345678",
        loginCode: "J9KFQY",
        role: Role.STUDENT,
        maxDevices: 1,
        boundDevices: ["phone_device_1"],
      });
      mockPrisma.session.create.mockResolvedValue({ id: "sess-new" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "J9KFQY",
          deviceId: "phone_device_1", // Same device
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe("Admin Permitting 2 Devices (Optional Elevation)", () => {
    it("allows 2nd device when admin increases student quota to maxDevices: 2", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-100",
        name: "يوسف أحمد",
        phone: "01012345678",
        loginCode: "J9KFQY",
        role: Role.STUDENT,
        maxDevices: 2, // Admin permitted 2 devices!
        boundDevices: ["phone_device_1"],
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: "sess-2" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "J9KFQY",
          deviceId: "laptop_device_2_allowed",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "student-100" },
        data: { boundDevices: ["phone_device_1", "laptop_device_2_allowed"] },
      });
    });

    it("blocks a 3rd device when maxDevices is set to 2", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-100",
        name: "يوسف أحمد",
        phone: "01012345678",
        loginCode: "J9KFQY",
        role: Role.STUDENT,
        maxDevices: 2,
        boundDevices: ["phone_device_1", "laptop_device_2_allowed"],
      });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "J9KFQY",
          deviceId: "tablet_device_3_blocked",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain("2 أجهزة");
    });
  });

  describe("Admin Account Provisioning for New Students", () => {
    it("creates a student with auto-generated code and default 1 device", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(({ data }) => ({
        id: "new-student-id",
        ...data,
      }));

      const newStudent = await UserMutationsService.createUser(
        {
          name: "طالب جديد من الإدارة",
          phone: "01099887766",
          role: Role.STUDENT,
          schoolCategory: SchoolCategory.ARABIC,
        },
        Role.ADMIN
      );

      expect(newStudent).toBeDefined();
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "طالب جديد من الإدارة",
            phone: "01099887766",
            role: Role.STUDENT,
            maxDevices: 1, // Default 1 device!
            loginCode: expect.any(String), // Auto-generated code
          }),
        })
      );
    });

    it("allows the admin to explicitly provision a student with 2 devices", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(({ data }) => ({
        id: "new-student-id-2",
        ...data,
      }));

      await UserMutationsService.createUser(
        {
          name: "طالب لديه هاتف ولابتوب",
          phone: "01233445566",
          role: Role.STUDENT,
          maxDevices: 2, // Admin grants 2 devices on creation!
        },
        Role.ADMIN
      );

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            maxDevices: 2,
          }),
        })
      );
    });
  });
});

