import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
const mockPrisma = vi.hoisted(() => ({
  question: {
    findMany: vi.fn(),
  },
  educationalSystem: {
    findMany: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  exam: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  lesson: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  unit: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  session: {
    deleteMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock Auth
const mockCurrentUser = vi.hoisted(() => ({
  id: "admin-1",
  name: "المسؤول العام",
  role: "ADMIN",
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(async () => mockCurrentUser),
  canManageQuestions: vi.fn((role: string) => role === "ADMIN" || role === "SUPER_ADMIN"),
  canManageCurriculum: vi.fn((role: string) => role === "ADMIN" || role === "SUPER_ADMIN"),
  canManageExams: vi.fn((role: string) => role === "ADMIN" || role === "SUPER_ADMIN"),
  canManageUsers: vi.fn((role: string) => role === "ADMIN" || role === "SUPER_ADMIN"),
  isStaff: vi.fn((role: string) => role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER"),
}));

describe("Admin Full CRUD & JSON Export Verifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Question Bank JSON Export", () => {
    it("should export questions with full metadata, bilingual fields, options, and explanations", async () => {
      mockPrisma.question.findMany.mockResolvedValueOnce([
        {
          id: "q-1",
          type: "MCQ",
          difficulty: "MEDIUM",
          schoolCategory: "ARABIC",
          statement: "ما هو العضي المسؤول عن إنتاج الطاقة في الخلية؟",
          translation: "What organelle produces energy in the cell?",
          imageUrl: null,
          createdAt: new Date("2026-11-01T10:00:00Z"),
          updatedAt: new Date("2026-11-01T10:00:00Z"),
          subject: {
            id: "sub-bio",
            name: "الأحياء",
            schoolCategory: "ARABIC",
            grade: { id: "g10", name: "أولى بكالوريا", code: "bacc_g10" },
          },
          unit: { id: "u-1", title: "الخلية والحياة", order: 1 },
          lessons: [{ lesson: { id: "l-1", title: "النظرية الخلوية", order: 1 } }],
          options: [
            { order: 0, text: "الميتوكوندريا", translation: "Mitochondria", isCorrect: true, explanation: "بيت طاقة الخلية" },
            { order: 1, text: "الريبوسوم", translation: "Ribosome", isCorrect: false, explanation: "تصنيع البروتين" },
          ],
          explanation: {
            concept: "عضيات الخلية",
            correctReason: "الميتوكوندريا هي المسؤولة عن التنفس الخلوي وإنتاج ATP",
          },
          rubric: null,
        },
      ]);

      const { GET } = await import("@/app/api/admin/questions/export/route");
      const req = new Request("http://localhost:3000/api/admin/questions/export?schoolCategory=ARABIC");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.exportMetadata.totalQuestions).toBe(1);
      expect(json.data.exportMetadata.counts.MCQ).toBe(1);
      expect(json.data.questions[0].statement).toContain("المسؤول عن إنتاج الطاقة");
      expect(json.data.questions[0].options[0].isCorrect).toBe(true);
      expect(json.data.questions[0].explanation.concept).toBe("عضيات الخلية");
    });
  });

  describe("2. Curriculum Structure JSON Export", () => {
    it("should export full curriculum hierarchy with systems, grades, tracks, subjects, units, and lessons", async () => {
      mockPrisma.educationalSystem.findMany.mockResolvedValueOnce([
        {
          id: "sys-bacc",
          name: "شهادة البكالوريا المصرية",
          code: "baccalaureate",
          grades: [
            {
              id: "g10",
              name: "الصف الأول البكالوريا",
              code: "bacc_g10",
              tracks: [],
              subjects: [
                {
                  id: "sub-1",
                  name: "الأحياء",
                  code: "BIO",
                  schoolCategory: "ARABIC",
                  trackId: null,
                  _count: { units: 1, questions: 10, exams: 2 },
                  units: [
                    {
                      id: "u-1",
                      title: "الخلية",
                      order: 1,
                      lessons: [
                        {
                          id: "l-1",
                          title: "النظرية الخلوية",
                          order: 1,
                          durationMinutes: 15,
                          isPublished: true,
                          isTrial: true,
                          viewsCount: 150,
                          _count: { questions: 10 },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);

      const { GET } = await import("@/app/api/admin/curriculum/export/route");
      const req = new Request("http://localhost:3000/api/admin/curriculum/export");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.systems[0].name).toBe("شهادة البكالوريا المصرية");
      expect(json.data.systems[0].grades[0].subjects[0].units[0].lessons[0].isTrial).toBe(true);
    });
  });

  describe("3. Users JSON Export", () => {
    it("should export students with study mode, center name, and subscription details in JSON", async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([
        {
          id: "std-1",
          name: "طالب الأوفلاين التجريبي",
          loginCode: "KHO-999",
          phone: "01011112222",
          email: "student@kholasa.test",
          role: "STUDENT",
          schoolCategory: "ARABIC",
          studyMode: "OFFLINE",
          centerName: "سنتر النخبة - الدقي",
          subscriptionStatus: "TRIAL",
          subscriptionExpiresAt: null,
          maxDevices: 1,
          boundDevices: ["device-hash-1"],
          isActive: true,
          createdAt: new Date("2026-11-01T08:00:00Z"),
          system: { name: "البكالوريا المصرية" },
          grade: { name: "الصف الأول الثانوي" },
          track: null,
          _count: {
            attempts: 5,
            progress: 3,
            mistakes: 2,
          },
        },
      ]);

      const { GET } = await import("@/app/api/admin/users/export/route");
      const req = new Request("http://localhost:3000/api/admin/users/export?format=json");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const text = await res.text();
      const parsed = JSON.parse(text);
      expect(parsed.students[0].studyMode).toBe("OFFLINE");
      expect(parsed.students[0].centerName).toBe("سنتر النخبة - الدقي");
      expect(parsed.students[0].subscriptionStatus).toBe("TRIAL");
      expect(parsed.students[0].loginCode).toBe("KHO-999");
    });
  });

  describe("4. Lesson isTrial CRUD Support", () => {
    it("should allow creating and updating a lesson with isTrial true", async () => {
      mockPrisma.unit.findUnique.mockResolvedValueOnce({ id: "unit-1" });
      mockPrisma.lesson.findFirst.mockResolvedValueOnce({ order: 0 });
      mockPrisma.lesson.create.mockResolvedValueOnce({
        id: "lesson-trial-1",
        title: "الدرس التجريبي المجاني",
        unitId: "unit-1",
        order: 1,
        durationMinutes: 20,
        isPublished: true,
        isTrial: true,
      });

      const { CurriculumLessonsService } = await import("@/services/curriculum/lessons");
      const created = await CurriculumLessonsService.createLesson({
        unitId: "unit-1",
        title: "الدرس التجريبي المجاني",
        durationMinutes: 20,
        isPublished: true,
        isTrial: true,
      });

      expect(mockPrisma.lesson.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isTrial: true,
          }),
        })
      );
      expect(created.isTrial).toBe(true);
    });
  });
});
