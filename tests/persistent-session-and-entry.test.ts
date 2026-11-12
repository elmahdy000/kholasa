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

const mockRedirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
);

const mockGetLandingCurriculumData = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    grades: [],
    subjects: [],
    heroQuestions: { arabic: null, languages: null },
    sampleProofs: [],
  }),
);

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockImplementation(async () => mockCookiesStore),
}));
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));
vi.mock("@/lib/landing-curriculum", () => ({
  getLandingCurriculumData: mockGetLandingCurriculumData,
}));

import { createSession, getCurrentUser } from "@/lib/auth";
import LandingPage from "@/app/page";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_DAY_SEC = 24 * 60 * 60;

describe("Persistent sessions & automatic student entry from /", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.session.create.mockResolvedValue({ id: "sess-1" });
    mockPrisma.session.update.mockResolvedValue({ id: "sess-1" });
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
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
    expect(opts.maxAge).toBe(ONE_DAY_SEC);
    expect((opts.expires as Date).getTime() - before).toBeLessThanOrEqual(ONE_DAY_MS + 5000);
  });

  it("keeps student session active after months away and renews cookie + DB expiry on return", async () => {
    mockCookiesStore.get.mockImplementation((name: string) =>
      name === "kholasa_session" ? { value: "raw-session-token" } : undefined,
    );

    const remainingMs = 165 * ONE_DAY_MS; // 200 days elapsed out of 365
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
        gradeId: "g1",
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

  it("redirects logged-in real students directly from / to /dashboard", async () => {
    mockCookiesStore.get.mockImplementation((name: string) =>
      name === "kholasa_session" ? { value: "raw-session-token" } : undefined,
    );
    mockPrisma.session.findUnique.mockResolvedValue({
      id: "sess-std",
      sessionToken: "hashed",
      userId: "student-1",
      deviceId: null,
      expires: new Date(Date.now() + 360 * ONE_DAY_MS),
      user: {
        id: "student-1",
        name: "طالب",
        email: null,
        phone: null,
        loginCode: "ABC123",
        role: Role.STUDENT,
        schoolCategory: "ARABIC",
        studyMode: "ONLINE",
        centerName: null,
        gradeId: "g1",
        isActive: true,
        maxDevices: 1,
        boundDevices: [],
        mustChangePassword: false,
      },
    });

    await expect(LandingPage()).rejects.toThrow("NEXT_REDIRECT:/dashboard");
    expect(mockGetLandingCurriculumData).not.toHaveBeenCalled();
  });

  it("redirects logged-in staff (ADMIN / ASSISTANT) from / to /admin", async () => {
    mockCookiesStore.get.mockImplementation((name: string) =>
      name === "kholasa_session" ? { value: "raw-session-token" } : undefined,
    );
    mockPrisma.session.findUnique.mockResolvedValue({
      id: "sess-staff",
      sessionToken: "hashed",
      userId: "assistant-1",
      deviceId: null,
      expires: new Date(Date.now() + 360 * ONE_DAY_MS),
      user: {
        id: "assistant-1",
        name: "مساعد",
        email: "assistant@kholasa.online",
        phone: null,
        loginCode: null,
        role: Role.ASSISTANT,
        schoolCategory: "ARABIC",
        studyMode: "ONLINE",
        centerName: null,
        gradeId: null,
        isActive: true,
        maxDevices: 5,
        boundDevices: [],
        mustChangePassword: false,
      },
    });

    await expect(LandingPage()).rejects.toThrow("NEXT_REDIRECT:/admin");
  });

  it("renders landing page when unauthenticated or using a DEMO-* sandbox session", async () => {
    mockCookiesStore.get.mockReturnValue(undefined);
    const guestEl = await LandingPage();
    expect(guestEl).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();

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
        gradeId: "g1",
        isActive: true,
        maxDevices: 5,
        boundDevices: [],
        mustChangePassword: false,
      },
    });

    const demoEl = await LandingPage();
    expect(demoEl).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
