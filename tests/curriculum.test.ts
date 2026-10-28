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
    expect(getCurriculumScope({ role: "STUDENT", gradeId: null })).toBeNull();
    expect(getCurriculumScope(null)).toBeNull();
  });

  it("builds a subject filter for grade, schoolCategory, system and track", () => {
    expect(
      subjectScopeWhere({ systemId: "s1", gradeId: "g1", schoolCategory: "ARABIC", trackId: "t1" })
    ).toEqual({
      gradeId: "g1",
      schoolCategory: "ARABIC",
      systemId: "s1",
      OR: [{ trackId: null }, { trackId: "t1" }],
    });

    expect(
      subjectScopeWhere({ systemId: "s1", gradeId: "g1", schoolCategory: "LANGUAGES", trackId: null })
    ).toEqual({ gradeId: "g1", schoolCategory: "LANGUAGES", systemId: "s1" });

    expect(subjectScopeWhere(null)).toEqual({});
  });

  it("limits exams to official exams for the scoped subject", () => {
    expect(
      examScopeWhere({ systemId: "s1", gradeId: "g1", schoolCategory: "ARABIC", trackId: null })
    ).toEqual({
      isCustom: false,
      schoolCategory: "ARABIC",
      subject: { is: { gradeId: "g1", schoolCategory: "ARABIC", systemId: "s1" } },
    });

    expect(examScopeWhere(null)).toEqual({ isCustom: false });
  });

  it("checks subject visibility including track-neutral material", () => {
    const scope = { systemId: "s1", gradeId: "g1", trackId: "t1" };

    expect(
      isSubjectInScope(scope, { gradeId: "g1", systemId: "s1", trackId: null })
    ).toBe(true);
    expect(
      isSubjectInScope(scope, { gradeId: "g1", systemId: "s1", trackId: "t1" })
    ).toBe(true);
    expect(
      isSubjectInScope(scope, { gradeId: "g1", systemId: "s1", trackId: "t2" })
    ).toBe(false);
    expect(
      isSubjectInScope(scope, { gradeId: "g2", systemId: "s1", trackId: "t1" })
    ).toBe(false);
    expect(isSubjectInScope(null, { gradeId: "anything" })).toBe(true);
    expect(isSubjectInScope(scope, null)).toBe(false);
  });
});
