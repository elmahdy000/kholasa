import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role, SchoolCategory, StudyMode, SubscriptionStatus } from "@prisma/client";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  grade: {
    findUnique: vi.fn(),
  },
  academicTrack: {
    findUnique: vi.fn(),
  },
}));

const mockCookiesStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));

const mockCreateSession = vi.hoisted(() => vi.fn().mockResolvedValue("sess-tok"));
const mockDestroySession = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGenerateUniqueLoginCode = vi.hoisted(() => vi.fn().mockResolvedValue("NEW99X"));
const mockHashPassword = vi.hoisted(() => vi.fn().mockResolvedValue("hashed_pw"));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookiesStore),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  createSession: mockCreateSession,
  destroySession: mockDestroySession,
  generateUniqueLoginCode: mockGenerateUniqueLoginCode,
  hashPassword: mockHashPassword,
}));

vi.mock("@/lib/rate-limit", () => ({
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
  rateLimit: vi.fn(),
  assertRateLimitAvailable: vi.fn(),
  recordRateLimitAttempt: vi.fn(),
}));

vi.mock("@/services/analytics.service", () => ({
  AnalyticsService: {
    logAuditAction: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/realtime", () => ({
  emitRealtimeEvent: vi.fn(),
  revalidatePlatformPaths: vi.fn(),
}));

import {
  PATCH as registerForSubscriptionPatch,
  POST as registerForSubscriptionPost,
} from "@/app/api/student/subscription/register/route";

describe("Subscription Onboarding: New Student Registration (/api/student/subscription/register)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(null);
    mockCookiesStore.get.mockReturnValue(undefined);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.grade.findUnique.mockResolvedValue({
      id: "bacc_g11",
      systemId: "sys_bacc",
      system: { isActive: true },
    });
  });

  it("rejects short student names and invalid Egyptian phone numbers with 400", async () => {
    const badPhoneReq = new Request("http://localhost/api/student/subscription/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "أحمد محمود علي",
        phone: "02012345678",
        schoolCategory: "ARABIC",
        gradeId: "bacc_g11",
      }),
    });

    const badPhoneRes = await registerForSubscriptionPost(badPhoneReq);
    const badPhoneJson = await badPhoneRes.json();
    expect(badPhoneRes.status).toBe(400);
    expect(badPhoneJson.error).toContain("11 رقماً");

    const shortNameReq = new Request("http://localhost/api/student/subscription/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "أح",
        phone: "01025131212",
        schoolCategory: "ARABIC",
        gradeId: "bacc_g11",
      }),
    });
    const shortNameRes = await registerForSubscriptionPost(shortNameReq);
    expect(shortNameRes.status).toBe(400);
  });

  it("returns 409 Conflict when the phone number is already registered", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing-student" });

    const req = new Request("http://localhost/api/student/subscription/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "عمر حسن إبراهيم",
        phone: "٠١٠-٢٥١٣-١٢١٢",
        schoolCategory: "ARABIC",
        gradeId: "bacc_g11",
      }),
    });

    const res = await registerForSubscriptionPost(req);
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toContain("متسجل قبل كده");
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects already signed-in permanent students with 400 and staff with 403", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "stu-real",
      role: Role.STUDENT,
      loginCode: "REAL88",
    });

    const req = new Request("http://localhost/api/student/subscription/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "سارة خالد محمد",
        phone: "01112223334",
        schoolCategory: "LANGUAGES",
        gradeId: "bacc_g11",
      }),
    });

    const studentRes = await registerForSubscriptionPost(req);
    expect(studentRes.status).toBe(400);

    mockGetCurrentUser.mockResolvedValue({
      id: "admin-1",
      role: Role.ADMIN,
      loginCode: null,
    });
    const adminRes = await registerForSubscriptionPost(
      new Request("http://localhost/api/student/subscription/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "سارة خالد محمد",
          phone: "01112223334",
          schoolCategory: "LANGUAGES",
          gradeId: "bacc_g11",
        }),
      })
    );
    expect(adminRes.status).toBe(403);
  });

  it("upgrades an ephemeral demo session or unauthenticated visitor into a permanent TRIAL student with loginCode and active session", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "demo-1",
      role: Role.STUDENT,
      loginCode: "DEMO-AR-9911",
    });

    mockPrisma.user.create.mockResolvedValue({
      id: "stu-new-1",
      name: "يوسف طارق حسن",
      phone: "01012345678",
      loginCode: "NEW99X",
      schoolCategory: SchoolCategory.LANGUAGES,
      gradeId: "bacc_g11",
      systemId: "sys_bacc",
      trackId: null,
      studyMode: StudyMode.ONLINE,
      centerName: null,
      subscriptionStatus: SubscriptionStatus.TRIAL,
    });

    const req = new Request("http://localhost/api/student/subscription/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "يوسف طارق حسن",
        phone: "٠١٠١٢٣٤٥٦٧٨",
        schoolCategory: "LANGUAGES",
        gradeId: "bacc_g11",
        studyMode: "ONLINE",
        deviceId: "dev_abc12345678",
      }),
    });

    const res = await registerForSubscriptionPost(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.user.loginCode).toBe("NEW99X");
    expect(json.user.subscriptionStatus).toBe(SubscriptionStatus.TRIAL);
    expect(mockDestroySession).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "يوسف طارق حسن",
          phone: "01012345678",
          loginCode: "NEW99X",
          role: Role.STUDENT,
          isActive: true,
          subscriptionStatus: SubscriptionStatus.TRIAL,
          schoolCategory: SchoolCategory.LANGUAGES,
          gradeId: "bacc_g11",
          systemId: "sys_bacc",
          boundDevices: ["dev_abc12345678"],
        }),
      })
    );
    expect(mockCreateSession).toHaveBeenCalledWith("stu-new-1", "dev_abc12345678");
  });

  it("allows pre-activation registered student returning from payment step to update their saved registration via PATCH", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "stu-new-1",
      role: Role.STUDENT,
      loginCode: "NEW99X",
      subscriptionStatus: SubscriptionStatus.TRIAL,
    });
    mockPrisma.academicTrack.findUnique.mockResolvedValue({
      id: "trk-eng",
      gradeId: "bacc_g11",
    });
    mockPrisma.user.update.mockResolvedValue({
      id: "stu-new-1",
      name: "يوسف طارق حسن",
      phone: "01012345678",
      loginCode: "NEW99X",
      schoolCategory: SchoolCategory.ARABIC,
      gradeId: "bacc_g11",
      systemId: "sys_bacc",
      trackId: "trk-eng",
      studyMode: StudyMode.OFFLINE,
      centerName: "سنتر رافال عربي",
      subscriptionStatus: SubscriptionStatus.TRIAL,
    });

    const req = new Request("http://localhost/api/student/subscription/register", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "يوسف طارق حسن",
        phone: "01012345678",
        schoolCategory: "ARABIC",
        gradeId: "bacc_g11",
        trackId: "trk-eng",
        studyMode: "OFFLINE",
        centerName: "سنتر رافال عربي",
      }),
    });

    const res = await registerForSubscriptionPatch(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user.loginCode).toBe("NEW99X");
    expect(json.user.trackId).toBe("trk-eng");
    expect(json.user.centerName).toBe("سنتر رافال عربي");
  });
});

