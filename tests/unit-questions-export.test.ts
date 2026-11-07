import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth before importing route
vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
  isStaff: vi.fn((role) => role === "ADMIN" || role === "STAFF" || role === "SUPER_ADMIN"),
  canManageQuestions: vi.fn((role) => role === "ADMIN" || role === "SUPER_ADMIN"),
  canManageCurriculum: vi.fn((role) => role === "ADMIN" || role === "SUPER_ADMIN"),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    unit: {
      findUnique: vi.fn(),
    },
    question: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/admin/units/[id]/export-questions/route";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("Unit Questions Export API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized non-staff users with 403", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/admin/units/u1/export-questions");
    const res = await GET(req, { params: Promise.resolve({ id: "u1" }) });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("غير مصرح");
  });

  it("returns 404 if unit is not found", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin1",
      role: "ADMIN",
    } as any);

    vi.mocked(prisma.unit.findUnique).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/admin/units/u1/export-questions");
    const res = await GET(req, { params: Promise.resolve({ id: "u1" }) });

    expect(res.status).toBe(404);
  });

  it("exports all questions with proper breakdown and clean formatted structure", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin1",
      role: "ADMIN",
    } as any);

    vi.mocked(prisma.unit.findUnique).mockResolvedValue({
      id: "u1",
      title: "الوحدة الأولى: الشبكات والأمن",
      order: 1,
      subject: {
        id: "s1",
        name: "تكنولوجيا المعلومات",
        grade: { id: "g10", name: "الصف العاشر", code: "bacc_g10" },
        system: { id: "sys1", name: "البكالوريا", code: "baccalaureate" },
      },
      lessons: [
        { id: "l1", title: "مفاهيم الشبكات", order: 1 },
      ],
    } as any);

    vi.mocked(prisma.question.groupBy).mockResolvedValue([
      { type: "MCQ", _count: { _all: 3 } },
      { type: "TRUE_FALSE", _count: { _all: 2 } },
      { type: "ESSAY", _count: { _all: 1 } },
    ] as any);

    vi.mocked(prisma.question.findMany).mockResolvedValue([
      {
        id: "q1",
        type: "MCQ",
        difficulty: "EASY",
        schoolCategory: "LANGUAGES",
        status: "PUBLISHED",
        statement: "What is a firewall?",
        translation: "ما هو الجدار الناري؟",
        imageUrl: null,
        createdAt: new Date("2026-11-01T10:00:00Z"),
        updatedAt: new Date("2026-11-01T10:00:00Z"),
        lessons: [{ lesson: { id: "l1", title: "مفاهيم الشبكات", order: 1 } }],
        options: [
          { id: "opt1", order: 1, text: "Security barrier", translation: "حاجز أمني", isCorrect: true, explanation: "Primary defense" },
          { id: "opt2", order: 2, text: "Storage unit", translation: "وحدة تخزين", isCorrect: false, explanation: "Incorrect" },
        ],
        explanation: {
          concept: "Firewall definition",
          correctReason: "A firewall blocks unauthorized incoming traffic.",
        },
        rubric: null,
      },
      {
        id: "q2",
        type: "ESSAY",
        difficulty: "HARD",
        schoolCategory: "LANGUAGES",
        status: "PUBLISHED",
        statement: "Explain the Zero Trust model.",
        translation: "اشرح نموذج انعدام الثقة.",
        imageUrl: null,
        createdAt: new Date("2026-11-02T10:00:00Z"),
        updatedAt: new Date("2026-11-02T10:00:00Z"),
        lessons: [{ lesson: { id: "l1", title: "مفاهيم الشبكات", order: 1 } }],
        options: [],
        explanation: {
          concept: "Zero Trust Architecture",
          correctReason: "Never trust, always verify.",
        },
        rubric: {
          maxScore: 10,
          modelAnswer: "Never trust, always verify every request.",
          modelAnswerTranslation: "عدم الوثوق بأي اتصال والتحقق الدائم.",
          criteria: [{ description: "Definition", score: 5 }, { description: "Principles", score: 5 }],
        },
      },
    ] as any);

    const req = new Request("http://localhost:3000/api/admin/units/u1/export-questions?type=ALL");
    const res = await GET(req, { params: Promise.resolve({ id: "u1" }) });

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.data.exportMetadata.unit.title).toBe("الوحدة الأولى: الشبكات والأمن");
    expect(body.data.exportMetadata.subject.name).toBe("تكنولوجيا المعلومات");
    expect(body.data.exportMetadata.counts.breakdown).toEqual({
      ALL: 6,
      MCQ: 3,
      TRUE_FALSE: 2,
      ESSAY: 1,
    });
    expect(body.data.questions).toHaveLength(2);
    expect(body.data.questions[0].type).toBe("MCQ");
    expect(body.data.questions[0].options).toHaveLength(2);
    expect(body.data.questions[1].type).toBe("ESSAY");
    expect(body.data.questions[1].rubric?.maxScore).toBe(10);
  });

  it("attaches download headers when download=true", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin1",
      role: "ADMIN",
    } as any);

    vi.mocked(prisma.unit.findUnique).mockResolvedValue({
      id: "u1",
      title: "Unit 1",
      order: 1,
      subject: { id: "s1", name: "Computer Science" },
      lessons: [],
    } as any);

    vi.mocked(prisma.question.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.question.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost:3000/api/admin/units/u1/export-questions?type=MCQ&download=true");
    const res = await GET(req, { params: Promise.resolve({ id: "u1" }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(res.headers.get("Content-Disposition")).toContain("attachment;");
    expect(res.headers.get("Content-Disposition")).toContain("questions.json");
  });
});
