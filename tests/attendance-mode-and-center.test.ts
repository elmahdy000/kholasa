import { describe, expect, it, vi, beforeEach } from "vitest";
import { Role, StudyMode } from "@prisma/client";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  session: {
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockCookiesStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockImplementation(async () => mockCookiesStore),
}));

import { POST as loginRoute } from "@/app/api/auth/login/route";

describe("Attendance Mode (Online vs Offline/Center) & Center Persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Center Selection on Student Login", () => {
    it("successfully sets studyMode to OFFLINE and records the selected center", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-center-1",
        name: "عمر خالد",
        loginCode: "OK-1234",
        role: Role.STUDENT,
        studyMode: StudyMode.ONLINE,
        centerName: null,
        maxDevices: 1,
        boundDevices: ["device-100"],
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: "sess-1" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "OK-1234",
          deviceId: "device-100",
          studyMode: "OFFLINE",
          centerName: "سنتر النخبة",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.studyMode).toBe("OFFLINE");
      expect(data.user.centerName).toBe("سنتر النخبة");

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "student-center-1" },
        data: {
          studyMode: "OFFLINE",
          centerName: "سنتر النخبة",
        },
      });
    });

    it("successfully sets custom center name when student enters a custom center", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-center-2",
        name: "سارة محمد",
        loginCode: "SM-5678",
        role: Role.STUDENT,
        studyMode: StudyMode.ONLINE,
        centerName: null,
        maxDevices: 1,
        boundDevices: ["device-200"],
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: "sess-2" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "SM-5678",
          deviceId: "device-200",
          studyMode: "OFFLINE",
          centerName: "سنتر الأقصى التعليمي",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.studyMode).toBe("OFFLINE");
      expect(data.user.centerName).toBe("سنتر الأقصى التعليمي");
    });

    it("sets studyMode to ONLINE and clears centerName when student chooses online", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-online-1",
        name: "كريم يحيى",
        loginCode: "KY-9999",
        role: Role.STUDENT,
        studyMode: StudyMode.OFFLINE,
        centerName: "سنتر الأوائل",
        maxDevices: 1,
        boundDevices: ["device-300"],
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: "sess-3" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "KY-9999",
          deviceId: "device-300",
          studyMode: "ONLINE",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.studyMode).toBe("ONLINE");
      expect(data.user.centerName).toBeNull();

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "student-online-1" },
        data: {
          studyMode: "ONLINE",
          centerName: null,
        },
      });
    });

    it("preserves existing centerName if an OFFLINE student logs in with OFFLINE without typing centerName", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-persist",
        name: "محمود حسن",
        loginCode: "MH-4321",
        role: Role.STUDENT,
        studyMode: StudyMode.OFFLINE,
        centerName: "سنتر رويال",
        maxDevices: 1,
        boundDevices: ["device-400"],
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: "sess-4" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "MH-4321",
          deviceId: "device-400",
          studyMode: "OFFLINE",
          // centerName omitted
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.studyMode).toBe("OFFLINE");
      expect(data.user.centerName).toBe("سنتر رويال");
    });
  });
});
