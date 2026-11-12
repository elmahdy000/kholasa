import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  session: {
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    findUnique: vi.fn(),
  },
}));

const mockCookiesStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));

const mockGetLandingCurriculumData = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    grades: [
      { id: "g10", name: "أولى بكالوريا", code: "bacc_g10", order: 1 },
      { id: "g11", name: "تانية بكالوريا", code: "bacc_g11", order: 2 },
    ],
    subjects: [],
    sampleQuestionsByBucket: [],
    heroQuestions: { arabic: null, languages: null },
    sampleProofs: { questionExample: null, definitionExample: null, mindMapExample: null },
  }),
);

const mockGetStudentContinueStudying = vi.hoisted(() => vi.fn().mockResolvedValue([]));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockImplementation(async () => mockCookiesStore),
}));
vi.mock("@/lib/landing-curriculum", () => ({
  getLandingCurriculumData: mockGetLandingCurriculumData,
  getStudentContinueStudying: mockGetStudentContinueStudying,
}));

import { createSession, getCurrentUser } from "@/lib/auth";
import {
  resolveInitialStudyPreferences,
  serializeStudyPreferences,
} from "@/lib/study-preferences";
import LandingPage from "@/app/page";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_DAY_SEC = 24 * 60 * 60;

describe("Persistent sessions & unified landing study preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.session.create.mockResolvedValue({ id: "sess-1" });
    mockPrisma.session.update.mockResolvedValue({ id: "sess-1" });
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
    mockGetStudentContinueStudying.mockResolvedValue([]);
  });

  it("issues a 365-day persistent cookie (with both expires and maxAge) for real users", async () => {
    const before = Date.now();
    await createSession("student-1", "dev-abc");

    expect(mockPrisma.session.create).toHaveBeenCalledTimes(1);
    const createCall = mockPrisma.session.create.mock.calls[0][0];
    const dbExpiresAt = (createCall.data.expires as Date).getTime();
    expect(dbExpiresAt - before).toBeGreaterThanOrEqual(364 * ONE_DAY_MS);

    expect(mockCookiesStore.set).toHaveBeenCalledTimes(1);
    const [cookieName, token, opts] = mockCookiesStore.set.mock.calls[0];
    expect(cookieName).toBe("kholasa_session");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe("lax");
    expect(opts.path).toBe("/");
    expect(opts.maxAge).toBeGreaterThanOrEqual(364 * ONE_DAY_SEC);
    expect((opts.expires as Date).getTime() - before).toBeGreaterThanOrEqual(364 * ONE_DAY_MS);
  });

  it("honors explicit short ttlMs override for ephemeral demo sessions", async () => {
    const before = Date.now();
    await createSession("demo-1", undefined, { ttlMs: ONE_DAY_MS });

    const [, , opts] = mockCookiesStore.set.mock.calls[0];
    expect(opts.maxAge).toBeGreaterThanOrEqual(ONE_DAY_SEC - 5);
    expect(opts.maxAge).toBeLessThanOrEqual(ONE_DAY_SEC);
    expect((opts.expires as Date).getTime() - before).toBeLessThanOrEqual(ONE_DAY_MS + 5000);
  });

  it("keeps student session active after months away and renews cookie + DB expiry on return", async () => {
    mockCookiesStore.get.mockImplementation((name: string) =>
      name === "kholasa_session" ? { value: "raw-session-token" } : undefined,
    );

    const remainingMs = 165 * ONE_DAY_MS;
    mockPrisma.session.findUnique.mockResolvedValue({
      id: "sess-keep",
      sessionToken: "hashed-token",
      userId: "student-1",
      deviceId: "dev-abc",
      expires: new Date(Date.now() + remainingMs),
      user: {
        id: "student-1",
        name: "عمر محمد",
        email: null,
        phone: "01000000001",
        loginCode: "STD777",
        role: Role.STUDENT,
        schoolCategory: "ARABIC",
        studyMode: "ONLINE",
        centerName: null,
        gradeId: "g10",
        isActive: true,
        maxDevices: 1,
        boundDevices: ["dev-abc"],
        mustChangePassword: false,
      },
    });

    const user = await getCurrentUser();
    expect(user?.id).toBe("student-1");
    expect(mockPrisma.session.update).toHaveBeenCalledTimes(1);
    expect(mockCookiesStore.set).toHaveBeenCalledTimes(1);
    const [, , renewedOpts] = mockCookiesStore.set.mock.calls[0];
    expect(renewedOpts.maxAge).toBeGreaterThanOrEqual(364 * ONE_DAY_SEC);
  });

  it("does NOT silently preselect grade or track for a brand-new guest visitor", () => {
    const grades = [
      { id: "g10", code: "bacc_g10", name: "أولى بكالوريا" },
      { id: "g11", code: "bacc_g11", name: "تانية بكالوريا" },
    ];

    const guestPrefs = resolveInitialStudyPreferences({ grades });
    expect(guestPrefs).toEqual({
      gradeId: null,
      gradeCode: null,
      schoolCategory: null,
    });
  });

  it("unifies preferences from URL query, cookie, or logged-in student profile", () => {
    const grades = [
      { id: "g10", code: "bacc_g10", name: "أولى بكالوريا" },
      { id: "g11", code: "bacc_g11", name: "تانية بكالوريا" },
    ];

    const fromCookie = resolveInitialStudyPreferences({
      grades,
      cookieRaw: serializeStudyPreferences({
        gradeId: "g10",
        gradeCode: "bacc_g10",
        schoolCategory: "LANGUAGES",
      }),
    });
    expect(fromCookie).toEqual({
      gradeId: "g10",
      gradeCode: "bacc_g10",
      schoolCategory: "LANGUAGES",
    });

    const fromQueryOverridesCookie = resolveInitialStudyPreferences({
      grades,
      queryGrade: "bacc_g11",
      queryCategory: "ARABIC",
      cookieRaw: serializeStudyPreferences({
        gradeId: "g10",
        gradeCode: "bacc_g10",
        schoolCategory: "LANGUAGES",
      }),
    });
    expect(fromQueryOverridesCookie).toEqual({
      gradeId: "g11",
      gradeCode: "bacc_g11",
      schoolCategory: "ARABIC",
    });
  });

  it("loads continue-studying progress on / only for signed-in non-demo users", async () => {
    // 1. Guest: never calls getStudentContinueStudying
    mockCookiesStore.get.mockReturnValue(undefined);
    await LandingPage();
    expect(mockGetStudentContinueStudying).not.toHaveBeenCalled();

    // 2. Demo student: never calls getStudentContinueStudying
    mockCookiesStore.get.mockImplementation((name: string) =>
      name === "kholasa_session" ? { value: "demo-token" } : undefined,
    );
    mockPrisma.session.findUnique.mockResolvedValue({
      id: "sess-demo",
      sessionToken: "hashed",
      userId: "demo-1",
      deviceId: null,
      expires: new Date(Date.now() + ONE_DAY_MS),
      user: {
        id: "demo-1",
        name: "طالب تجريبي",
        email: null,
        phone: null,
        loginCode: "DEMO-AR-999",
        role: Role.STUDENT,
        schoolCategory: "ARABIC",
        studyMode: "ONLINE",
        centerName: null,
        gradeId: "g10",
        isActive: true,
        maxDevices: 5,
        boundDevices: [],
        mustChangePassword: false,
      },
    });
    await LandingPage();
    expect(mockGetStudentContinueStudying).not.toHaveBeenCalled();

    // 3. Real signed-in student: queries their saved progress
    mockPrisma.session.findUnique.mockResolvedValue({
      id: "sess-real",
      sessionToken: "hashed",
      userId: "student-real",
      deviceId: null,
      expires: new Date(Date.now() + 360 * ONE_DAY_MS),
      user: {
        id: "student-real",
        name: "يوسف",
        email: null,
        phone: null,
        loginCode: "STD991",
        role: Role.STUDENT,
        schoolCategory: "LANGUAGES",
        studyMode: "ONLINE",
        centerName: null,
        gradeId: "g10",
        isActive: true,
        maxDevices: 1,
        boundDevices: [],
        mustChangePassword: false,
      },
    });
    await LandingPage();
    expect(mockGetStudentContinueStudying).toHaveBeenCalledWith("student-real", {
      systemId: null,
      gradeId: "g10",
      schoolCategory: "LANGUAGES",
      trackId: null,
    });
  });
});
