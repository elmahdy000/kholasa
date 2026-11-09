import { describe, expect, it, vi, beforeEach } from "vitest";
import { Role, SchoolCategory, StudyMode, SubscriptionStatus } from "@prisma/client";
import {
  AUTHORIZED_CENTERS,
  LANGUAGES_CENTERS,
  ARABIC_CENTERS,
  OTHER_CENTER_NAME,
  ALL_CENTER_NAMES,
  getCentersForCategory,
} from "@/lib/centers";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  session: {
    create: vi.fn(),
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

import { GET as lookupCodeRoute } from "@/app/api/auth/lookup-code/route";
import { POST as loginRoute } from "@/app/api/auth/login/route";

describe("Authorized Centers & Demo Accounts Specification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Authorized Centers Registry (centers.ts)", () => {
    it("contains exactly the 6 requested centers plus custom fallback option", () => {
      expect(AUTHORIZED_CENTERS).toHaveLength(6);
      expect(ALL_CENTER_NAMES).toContain("سنتر إديوفيرس لغات");
      expect(ALL_CENTER_NAMES).toContain("سنتر المجد لغات");
      expect(ALL_CENTER_NAMES).toContain("سنتر الحناوي لغات");
      expect(ALL_CENTER_NAMES).toContain("سنتر رافال عربي");
      expect(ALL_CENTER_NAMES).toContain("سنتر زاج عربي");
      expect(ALL_CENTER_NAMES).toContain("سنتر فيوتشر عربي");
      expect(ALL_CENTER_NAMES).toContain(OTHER_CENTER_NAME);
    });

    it("correctly segregates Languages centers from Arabic centers", () => {
      expect(LANGUAGES_CENTERS).toHaveLength(3);
      expect(LANGUAGES_CENTERS.map((c) => c.name)).toEqual([
        "سنتر إديوفيرس لغات",
        "سنتر المجد لغات",
        "سنتر الحناوي لغات",
      ]);
      LANGUAGES_CENTERS.forEach((c) => {
        expect(c.category).toBe(SchoolCategory.LANGUAGES);
        expect(c.badge).toContain("لغات");
      });

      expect(ARABIC_CENTERS).toHaveLength(3);
      expect(ARABIC_CENTERS.map((c) => c.name)).toEqual([
        "سنتر رافال عربي",
        "سنتر زاج عربي",
        "سنتر فيوتشر عربي",
      ]);
      ARABIC_CENTERS.forEach((c) => {
        expect(c.category).toBe(SchoolCategory.ARABIC);
        expect(c.badge).toContain("عربي");
      });
    });

    it("returns filtered centers via getCentersForCategory helper", () => {
      const langCenters = getCentersForCategory(SchoolCategory.LANGUAGES);
      expect(langCenters).toHaveLength(3);
      expect(langCenters.every((c) => c.category === SchoolCategory.LANGUAGES)).toBe(true);

      const arabCenters = getCentersForCategory(SchoolCategory.ARABIC);
      expect(arabCenters).toHaveLength(3);
      expect(arabCenters.every((c) => c.category === SchoolCategory.ARABIC)).toBe(true);

      const allCenters = getCentersForCategory(null);
      expect(allCenters).toHaveLength(6);
    });
  });

  describe("2. Student Code Auto-Detection API (/api/auth/lookup-code)", () => {
    it("returns found: false for codes shorter than 3 characters or missing", async () => {
      const req = new Request("http://localhost/api/auth/lookup-code?code=A");
      const res = await lookupCodeRoute(req);
      const data = await res.json();
      expect(data.found).toBe(false);
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("returns student details and detected curriculum for a valid code", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-123",
        name: "يوسف أحمد",
        schoolCategory: SchoolCategory.LANGUAGES,
        studyMode: StudyMode.OFFLINE,
        centerName: "سنتر إديوفيرس لغات",
        subscriptionStatus: SubscriptionStatus.TRIAL,
        role: Role.STUDENT,
        grade: { name: "الصف الأول الثانوي" },
      });

      const req = new Request("http://localhost/api/auth/lookup-code?code=DEMO-EN");
      const res = await lookupCodeRoute(req);
      const data = await res.json();

      expect(data.found).toBe(true);
      expect(data.user.name).toBe("يوسف أحمد");
      expect(data.user.schoolCategory).toBe("LANGUAGES");
      expect(data.user.studyMode).toBe("OFFLINE");
      expect(data.user.centerName).toBe("سنتر إديوفيرس لغات");
      expect(data.user.gradeName).toBe("الصف الأول الثانوي");
    });

    it("returns found: false if code does not match any student", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const req = new Request("http://localhost/api/auth/lookup-code?code=NONEXISTENT");
      const res = await lookupCodeRoute(req);
      const data = await res.json();

      expect(data.found).toBe(false);
    });
  });

  describe("3. Student Login with Authorized Centers & Device Binding", () => {
    it("successfully logs in with DEMO-EN and records 'سنتر إديوفيرس لغات'", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "demo-en-id",
        name: "Demo Student (Languages)",
        loginCode: "DEMO-EN",
        role: Role.STUDENT,
        schoolCategory: SchoolCategory.LANGUAGES,
        studyMode: StudyMode.ONLINE,
        centerName: null,
        maxDevices: 10,
        boundDevices: ["device-1"],
        subscriptionStatus: SubscriptionStatus.TRIAL,
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: "sess-1" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "DEMO-EN",
          deviceId: "device-1",
          studyMode: "OFFLINE",
          centerName: "سنتر إديوفيرس لغات",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.loginCode).toBe("DEMO-EN");
      expect(data.user.schoolCategory).toBe("LANGUAGES");
      expect(data.user.studyMode).toBe("OFFLINE");
      expect(data.user.centerName).toBe("سنتر إديوفيرس لغات");

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "demo-en-id" },
        data: {
          studyMode: "OFFLINE",
          centerName: "سنتر إديوفيرس لغات",
        },
      });
    });

    it("successfully logs in with DEMO-AR and records 'سنتر رافال عربي'", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "demo-ar-id",
        name: "طالب تجريبي (عربي)",
        loginCode: "DEMO-AR",
        role: Role.STUDENT,
        schoolCategory: SchoolCategory.ARABIC,
        studyMode: StudyMode.ONLINE,
        centerName: null,
        maxDevices: 10,
        boundDevices: ["device-1"],
        subscriptionStatus: SubscriptionStatus.TRIAL,
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: "sess-2" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "DEMO-AR",
          deviceId: "device-1",
          studyMode: "OFFLINE",
          centerName: "سنتر رافال عربي",
        }),
      });

      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.loginCode).toBe("DEMO-AR");
      expect(data.user.schoolCategory).toBe("ARABIC");
      expect(data.user.studyMode).toBe("OFFLINE");
      expect(data.user.centerName).toBe("سنتر رافال عربي");
    });
  });
});
