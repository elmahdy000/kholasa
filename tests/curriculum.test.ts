import { describe, expect, it } from "vitest";
import {
  examScopeWhere,
  getCurriculumScope,
  isSubjectInScope,
  subjectScopeWhere,
} from "@/lib/curriculum";

describe("curriculum scoping", () => {
  it("only scopes students who have a grade", () => {
    expect(
      getCurriculumScope({ role: "STUDENT", systemId: "s", gradeId: "g", trackId: "t" })
    ).toEqual({ systemId: "s", gradeId: "g", schoolCategory: "ARABIC", trackId: "t" });

    expect(
      getCurriculumScope({ role: "STUDENT", systemId: "s", gradeId: "g", schoolCategory: "LANGUAGES", trackId: "t" })
    ).toEqual({ systemId: "s", gradeId: "g", schoolCategory: "LANGUAGES", trackId: "t" });

    expect(getCurriculumScope({ role: "TEACHER", gradeId: "g" })).toBeNull();
    expect(getCurriculumScope({ role: "STUDENT", gradeId: null })).toEqual({
      systemId: null,
      gradeId: null,
      schoolCategory: "ARABIC",
      trackId: null,
    });
    expect(getCurriculumScope(null)).toBeNull();
  });

  it("builds a subject filter for grade, schoolCategory, system, common subjects, and track", () => {
    expect(
      subjectScopeWhere({ systemId: "s1", gradeId: "g1", schoolCategory: "ARABIC", trackId: "t1" })
    ).toEqual({
      gradeId: "g1",
      systemId: "s1",
      AND: [
        { OR: [{ schoolCategory: "ARABIC" }, { isCommonCategory: true }] },
        { OR: [{ trackId: null }, { trackId: "t1" }] },
      ],
    });

    expect(
      subjectScopeWhere({ systemId: "s1", gradeId: "g1", schoolCategory: "LANGUAGES", trackId: null })
    ).toEqual({
      gradeId: "g1",
      systemId: "s1",
      OR: [{ schoolCategory: "LANGUAGES" }, { isCommonCategory: true }],
    });

    expect(subjectScopeWhere(null)).toEqual({});
  });

  it("limits exams to official exams for the scoped or common-category subject", () => {
    expect(
      examScopeWhere({ systemId: "s1", gradeId: "g1", schoolCategory: "ARABIC", trackId: null })
    ).toEqual({
      isCustom: false,
      isPublished: true,
      subject: {
        is: {
          gradeId: "g1",
          systemId: "s1",
          OR: [{ schoolCategory: "ARABIC" }, { isCommonCategory: true }],
        },
      },
      OR: [{ schoolCategory: "ARABIC" }, { subject: { isCommonCategory: true } }],
    });

    expect(examScopeWhere(null)).toEqual({ isCustom: false, isPublished: true });
  });

  it("checks subject visibility including track-neutral and common-category material", () => {
    const scope = { systemId: "s1", gradeId: "g1", schoolCategory: "LANGUAGES" as const, trackId: "t1" };

    expect(
      isSubjectInScope(scope, {
        gradeId: "g1",
        systemId: "s1",
        schoolCategory: "ARABIC",
        isCommonCategory: true,
        trackId: null,
      })
    ).toBe(true);
    expect(
      isSubjectInScope(scope, {
        gradeId: "g1",
        systemId: "s1",
        schoolCategory: "ARABIC",
        isCommonCategory: false,
        trackId: null,
      })
    ).toBe(false);
    expect(
      isSubjectInScope(scope, { gradeId: "g1", systemId: "s1", schoolCategory: "LANGUAGES", trackId: null })
    ).toBe(true);
    expect(
      isSubjectInScope(scope, { gradeId: "g1", systemId: "s1", schoolCategory: "LANGUAGES", trackId: "t1" })
    ).toBe(true);
    expect(
      isSubjectInScope(scope, { gradeId: "g1", systemId: "s1", schoolCategory: "LANGUAGES", trackId: "t2" })
    ).toBe(false);
    expect(
      isSubjectInScope(scope, { gradeId: "g2", systemId: "s1", schoolCategory: "LANGUAGES", trackId: "t1" })
    ).toBe(false);
    expect(isSubjectInScope(null, { gradeId: "anything" })).toBe(true);
    expect(isSubjectInScope(scope, null)).toBe(false);
  });
});
