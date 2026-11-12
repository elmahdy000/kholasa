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
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  subject: {
    findFirst: vi.fn(),
  },
  exam: {
    deleteMany: vi.fn(),
  },
  session: {
    create: vi.fn(),
    deleteMany: vi.fn(),
    findUnique: vi.fn(),
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
import { POST as logoutRoute } from "@/app/api/auth/logout/route";

describe("Authorized Centers & Per-Visitor Isolated Demo Sandbox Specification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookiesStore.get.mockReturnValue(undefined);
    mockPrisma.user.findMany.mockResolvedValue([]);
  });

  describe("1. Authorized Centers Registry (centers.ts)", () => {
    it("contains the 7 authorized centers plus custom fallback option", () => {
      expect(AUTHORIZED_CENTERS).toHaveLength(7);
      expect(ALL_CENTER_NAMES).toContain("سنتر إديوفيرس لغات");
      expect(ALL_CENTER_NAMES).toContain("سنتر المجد لغات");
      expect(ALL_CENTER_NAMES).toContain("سنتر الحناوي لغات");
      expect(ALL_CENTER_NAMES).toContain("سنتر رافال عربي");
      expect(ALL_CENTER_NAMES).toContain("سنتر زاج عربي");
      expect(ALL_CENTER_NAMES).toContain("سنتر فيوتشر عربي");
      expect(ALL_CENTER_NAMES).toContain("سنتر القنايات عربي");
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

      expect(ARABIC_CENTERS).toHaveLength(4);
      expect(ARABIC_CENTERS.map((c) => c.name)).toEqual([
        "سنتر رافال عربي",
        "سنتر زاج عربي",
        "سنتر فيوتشر عربي",
        "سنتر القنايات عربي",
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
      expect(arabCenters).toHaveLength(4);
      expect(arabCenters.every((c) => c.category === SchoolCategory.ARABIC)).toBe(true);

      const allCenters = getCentersForCategory(null);
      expect(allCenters).toHaveLength(7);
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

    it("returns template preview metadata for official demo entry codes (DEMO-EN)", async () => {
      const req = new Request("http://localhost/api/auth/lookup-code?code=DEMO-EN");
      const res = await lookupCodeRoute(req);
      const data = await res.json();

      expect(data.found).toBe(true);
      expect(data.user.name).toBe("طالب تجريبي (لغات)");
      expect(data.user.schoolCategory).toBe("LANGUAGES");
    });

    it("never exposes ephemeral sandbox user codes (DEMO-EN-XXXXXXXX)", async () => {
      const req = new Request("http://localhost/api/auth/lookup-code?code=DEMO-EN-A1B2C3D4");
      const res = await lookupCodeRoute(req);
      const data = await res.json();

      expect(data.found).toBe(false);
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("returns real student details for a valid personal student code", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "student-123",
        name: "يوسف أحمد",
        schoolCategory: SchoolCategory.LANGUAGES,
        studyMode: StudyMode.OFFLINE,
        centerName: "سنتر إديوفيرس لغات",
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        role: Role.STUDENT,
        grade: { name: "تانية بكالوريا" },
      });

      const req = new Request("http://localhost/api/auth/lookup-code?code=REAL8821");
      const res = await lookupCodeRoute(req);
      const data = await res.json();

      expect(data.found).toBe(true);
      expect(data.user.name).toBe("يوسف أحمد");
      expect(data.user.schoolCategory).toBe("LANGUAGES");
      expect(data.user.gradeName).toBe("تانية بكالوريا");
    });

    it("returns found: false if code does not match any student", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const req = new Request("http://localhost/api/auth/lookup-code?code=NONEXISTENT");
      const res = await lookupCodeRoute(req);
      const data = await res.json();

      expect(data.found).toBe(false);
    });
  });

  describe("3. Strict Per-Visitor Demo Sandbox Isolation", () => {
    it("creates two completely separate sandbox users with distinct IDs for two visitors logging in with DEMO-EN", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "template-demo-en",
        name: "Demo Student",
        loginCode: "DEMO-EN",
        role: Role.STUDENT,
        schoolCategory: SchoolCategory.LANGUAGES,
        gradeId: "grade-g11",
        systemId: "sys-bacc",
        trackId: "track-eng",
      });
      mockPrisma.subject.findFirst.mockResolvedValue({
        gradeId: "grade-g11",
        systemId: "sys-bacc",
        trackId: "track-eng",
      });

      let createCounter = 0;
      mockPrisma.user.create.mockImplementation(async ({ data }) => {
        createCounter++;
        return {
          id: `sandbox-en-${createCounter}`,
          ...data,
        };
      });
      mockPrisma.session.create.mockResolvedValue({ id: "sess-sandbox" });

      const req1 = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
        body: JSON.stringify({
          code: "DEMO-EN",
          deviceId: "visitor-device-1",
          studyMode: "OFFLINE",
          centerName: "سنتر إديوفيرس لغات",
        }),
      });
      const res1 = await loginRoute(req1);
      const data1 = await res1.json();

      const req2 = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.2" },
        body: JSON.stringify({
          code: "DEMO-EN",
          deviceId: "visitor-device-2",
          studyMode: "ONLINE",
        }),
      });
      const res2 = await loginRoute(req2);
      const data2 = await res2.json();

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(data1.isDemoSandbox).toBe(true);
      expect(data2.isDemoSandbox).toBe(true);

      // Must NOT share the template ID or each other's ID/loginCode
      expect(data1.user.id).not.toBe("template-demo-en");
      expect(data2.user.id).not.toBe("template-demo-en");
      expect(data1.user.id).not.toBe(data2.user.id);
      expect(data1.user.loginCode).toMatch(/^DEMO-EN-[0-9A-F]{8}$/);
      expect(data2.user.loginCode).toMatch(/^DEMO-EN-[0-9A-F]{8}$/);
      expect(data1.user.loginCode).not.toBe(data2.user.loginCode);
      expect(data1.user.schoolCategory).toBe("LANGUAGES");
      expect(data1.user.centerName).toBe("سنتر إديوفيرس لغات");
      expect(data2.user.studyMode).toBe("ONLINE");
    });

    it("successfully creates isolated TRIAL sandbox with Arabic curriculum for DEMO-AR and rejects removed DEMO-PRO", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.subject.findFirst.mockResolvedValue({
        gradeId: "grade-g11",
        systemId: "sys-bacc",
        trackId: "track-eng",
      });
      mockPrisma.user.create.mockImplementation(async ({ data }) => ({
        id: `sandbox-${data.loginCode}`,
        ...data,
      }));
      mockPrisma.session.create.mockResolvedValue({ id: "sess-ar" });

      const reqAr = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.3" },
        body: JSON.stringify({
          code: "DEMO-AR",
          deviceId: "device-ar",
          studyMode: "OFFLINE",
          centerName: "سنتر رافال عربي",
        }),
      });
      const resAr = await loginRoute(reqAr);
      const dataAr = await resAr.json();

      expect(resAr.status).toBe(200);
      expect(dataAr.user.loginCode).toMatch(/^DEMO-AR-[0-9A-F]{8}$/);
      expect(dataAr.user.schoolCategory).toBe("ARABIC");
      expect(dataAr.user.subscriptionStatus).toBe("TRIAL");
      expect(dataAr.user.centerName).toBe("سنتر رافال عربي");

      const reqPro = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.4" },
        body: JSON.stringify({
          code: "DEMO-PRO",
          deviceId: "device-pro",
          studyMode: "ONLINE",
        }),
      });
      const resPro = await loginRoute(reqPro);
      expect(resPro.status).toBe(401);
    });

    it("rejects direct login attempts using another visitor's sandbox code (DEMO-AR-XXXXXXXX)", async () => {
      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.5" },
        body: JSON.stringify({
          code: "DEMO-AR-A1B2C3D4",
          deviceId: "attacker-device",
        }),
      });

      const res = await loginRoute(req);
      expect(res.status).toBe(401);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it("purges ephemeral sandbox user and custom exams upon explicit logout", async () => {
      mockCookiesStore.get.mockReturnValue({ value: "sandbox-sess-token" });
      mockPrisma.session.findUnique.mockResolvedValue({
        userId: "sandbox-user-99",
        user: { loginCode: "DEMO-AR-99AABBCC" },
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "sandbox-user-99",
        role: Role.STUDENT,
        loginCode: "DEMO-AR-99AABBCC",
      });
      mockPrisma.exam.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.user.delete.mockResolvedValue({ id: "sandbox-user-99" });
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 1 });

      const res = await logoutRoute();
      expect(res.status).toBe(200);
      expect(mockPrisma.exam.deleteMany).toHaveBeenCalledWith({
        where: { isCustom: true, createdById: "sandbox-user-99" },
      });
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: "sandbox-user-99" },
      });
    });

    it("never signs directly into shared DEMO template row via email/password credentials", async () => {
      const { hashPassword } = await import("@/lib/auth");
      const hashed = await hashPassword("demo-pass-123");
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "demo-student-ar",
        name: "طالب تجريبي (عربي)",
        email: "demo-ar@kholasa.app",
        password: hashed,
        loginCode: "DEMO-AR",
        role: Role.STUDENT,
        schoolCategory: SchoolCategory.ARABIC,
        gradeId: "grade-bacc-g11",
        systemId: "sys-bacc",
        trackId: null,
        studyMode: StudyMode.ONLINE,
        centerName: null,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        isActive: true,
        maxDevices: 10,
        boundDevices: [],
      });
      mockPrisma.subject.findFirst.mockResolvedValue({
        gradeId: "grade-bacc-g11",
        systemId: "sys-bacc",
        trackId: null,
      });
      mockPrisma.user.create.mockResolvedValue({
        id: "sandbox-from-creds",
        name: "طالب تجريبي (عربي)",
        email: null,
        phone: null,
        loginCode: "DEMO-AR-C0ED0001",
        role: Role.STUDENT,
        systemId: "sys-bacc",
        gradeId: "grade-bacc-g11",
        schoolCategory: SchoolCategory.ARABIC,
        studyMode: StudyMode.ONLINE,
        centerName: null,
        subscriptionStatus: SubscriptionStatus.TRIAL,
      });
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.session.create.mockResolvedValue({ id: "sess-cred" });

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.6" },
        body: JSON.stringify({
          identifier: "demo-ar@kholasa.app",
          password: "demo-pass-123",
          deviceId: "device-cred",
        }),
      });
      const res = await loginRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.isDemoSandbox).toBe(true);
      expect(data.user.id).not.toBe("demo-student-ar");
      expect(data.user.loginCode).toMatch(/^DEMO-AR-[0-9A-F]{8}$/);
    });
  });
});
