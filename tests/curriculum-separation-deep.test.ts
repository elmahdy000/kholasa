import { describe, expect, it, vi, beforeEach } from "vitest";
import { SchoolCategory } from "@prisma/client";
import {
  getCurriculumScope,
  subjectScopeWhere,
  questionScopeWhere,
  examScopeWhere,
  isSubjectInScope,
} from "@/lib/curriculum";

const mockPrisma = vi.hoisted(() => ({
  lesson: { findMany: vi.fn() },
  subject: { findMany: vi.fn() },
  question: { findMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { SearchService } from "@/services/search.service";

describe("Strict Curriculum Segregation: Arabic vs Languages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Automatic Curriculum Scope Resolution", () => {
    it("resolves ARABIC scope automatically for Egyptian General students", () => {
      const arabicStudent = {
        id: "stu-ar",
        role: "STUDENT",
        gradeId: "grade-g10",
        systemId: "sys-bacc",
        schoolCategory: SchoolCategory.ARABIC,
        trackId: null,
      };

      const scope = getCurriculumScope(arabicStudent);

      expect(scope).not.toBeNull();
      expect(scope?.schoolCategory).toBe("ARABIC");
      expect(scope?.gradeId).toBe("grade-g10");
    });

    it("resolves LANGUAGES scope automatically for Language & Experimental students", () => {
      const langStudent = {
        id: "stu-lang",
        role: "STUDENT",
        gradeId: "grade-g10",
        systemId: "sys-bacc",
        schoolCategory: SchoolCategory.LANGUAGES,
        trackId: null,
      };

      const scope = getCurriculumScope(langStudent);

      expect(scope).not.toBeNull();
      expect(scope?.schoolCategory).toBe("LANGUAGES");
      expect(scope?.gradeId).toBe("grade-g10");
    });

    it("defaults to ARABIC if schoolCategory is somehow omitted for a student", () => {
      const legacyStudent = {
        id: "stu-legacy",
        role: "STUDENT",
        gradeId: "grade-g10",
        systemId: "sys-bacc",
        trackId: null,
      };

      const scope = getCurriculumScope(legacyStudent);

      expect(scope?.schoolCategory).toBe("ARABIC");
    });
  });

  describe("Prisma Query Scope Isolation", () => {
    it("generates strict subject filter containing schoolCategory: ARABIC for Arabic student", () => {
      const scope = {
        systemId: "sys-bacc",
        gradeId: "grade-g10",
        schoolCategory: "ARABIC" as const,
        trackId: null,
      };

      const filter = subjectScopeWhere(scope);

      expect(filter.schoolCategory).toBe("ARABIC");
      expect(filter.gradeId).toBe("grade-g10");
      expect(filter.systemId).toBe("sys-bacc");
    });

    it("generates strict subject filter containing schoolCategory: LANGUAGES for Languages student", () => {
      const scope = {
        systemId: "sys-bacc",
        gradeId: "grade-g10",
        schoolCategory: "LANGUAGES" as const,
        trackId: null,
      };

      const filter = subjectScopeWhere(scope);

      expect(filter.schoolCategory).toBe("LANGUAGES");
      expect(filter.gradeId).toBe("grade-g10");
      expect(filter.systemId).toBe("sys-bacc");
    });

    it("generates question filter scoped strictly to student schoolCategory", () => {
      const arScope = {
        systemId: "sys-bacc",
        gradeId: "grade-g10",
        schoolCategory: "ARABIC" as const,
        trackId: null,
      };

      const qFilter = questionScopeWhere(arScope);

      expect(qFilter.schoolCategory).toBe("ARABIC");
      expect(qFilter.subject?.is).toEqual(subjectScopeWhere(arScope));
    });

    it("generates exam filter scoped strictly to student schoolCategory", () => {
      const langScope = {
        systemId: "sys-bacc",
        gradeId: "grade-g10",
        schoolCategory: "LANGUAGES" as const,
        trackId: null,
      };

      const examFilter = examScopeWhere(langScope);

      expect(examFilter.isCustom).toBe(false);
      expect(examFilter.isPublished).toBe(true);
      expect(examFilter.schoolCategory).toBe("LANGUAGES");
    });
  });

  describe("Route Access & Guard Predicate (isSubjectInScope)", () => {
    const arSubject = {
      id: "sub-cs-ar",
      gradeId: "grade-g10",
      systemId: "sys-bacc",
      schoolCategory: "ARABIC",
      trackId: null,
    };

    const langSubject = {
      id: "sub-cs-lang",
      gradeId: "grade-g10",
      systemId: "sys-bacc",
      schoolCategory: "LANGUAGES",
      trackId: null,
    };

    it("allows Arabic student to access Arabic subject and blocks Languages subject", () => {
      const arScope = {
        systemId: "sys-bacc",
        gradeId: "grade-g10",
        schoolCategory: "ARABIC" as const,
        trackId: null,
      };

      expect(isSubjectInScope(arScope, arSubject)).toBe(true);
      expect(isSubjectInScope(arScope, langSubject)).toBe(false);
    });

    it("allows Languages student to access Languages subject and blocks Arabic subject", () => {
      const langScope = {
        systemId: "sys-bacc",
        gradeId: "grade-g10",
        schoolCategory: "LANGUAGES" as const,
        trackId: null,
      };

      expect(isSubjectInScope(langScope, langSubject)).toBe(true);
      expect(isSubjectInScope(langScope, arSubject)).toBe(false);
    });

    it("blocks access if student is from a different grade regardless of category", () => {
      const g11Scope = {
        systemId: "sys-bacc",
        gradeId: "grade-g11",
        schoolCategory: "ARABIC" as const,
        trackId: null,
      };

      expect(isSubjectInScope(g11Scope, arSubject)).toBe(false);
    });
  });

  describe("Global Search Scope Isolation (SearchService.globalSearch)", () => {
    it("passes subjectFilter with schoolCategory when searching for an Arabic student", async () => {
      mockPrisma.lesson.findMany.mockResolvedValue([]);
      mockPrisma.subject.findMany.mockResolvedValue([]);
      mockPrisma.question.findMany.mockResolvedValue([]);

      const arScope = {
        systemId: "sys-bacc",
        gradeId: "grade-g10",
        schoolCategory: "ARABIC" as const,
        trackId: null,
      };

      await SearchService.globalSearch("برمجة", arScope);

      // Verify that lessons query filtered by Arabic subject scope
      expect(mockPrisma.lesson.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            unit: {
              subject: {
                is: expect.objectContaining({
                  schoolCategory: "ARABIC",
                }),
              },
            },
          }),
        })
      );

      // Verify that subjects query filtered by Arabic
      expect(mockPrisma.subject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            schoolCategory: "ARABIC",
          }),
        })
      );
    });

    it("passes subjectFilter with schoolCategory: LANGUAGES when searching for a Languages student", async () => {
      mockPrisma.lesson.findMany.mockResolvedValue([]);
      mockPrisma.subject.findMany.mockResolvedValue([]);
      mockPrisma.question.findMany.mockResolvedValue([]);

      const langScope = {
        systemId: "sys-bacc",
        gradeId: "grade-g10",
        schoolCategory: "LANGUAGES" as const,
        trackId: null,
      };

      await SearchService.globalSearch("Python", langScope);

      expect(mockPrisma.subject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            schoolCategory: "LANGUAGES",
          }),
        })
      );
    });
  });
});

