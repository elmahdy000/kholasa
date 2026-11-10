import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  sanitizeArabicPayloadForStudent,
  validateAndAdaptArabicLessonJson,
} from "../src/lib/arabic-curriculum";
import {
  isSubjectInScope,
  subjectScopeWhere,
  type CurriculumScope,
} from "../src/lib/curriculum";

function loadRealArabicLessonJson() {
  const booksDir = path.resolve(process.cwd(), "books");
  const fileName = fs
    .readdirSync(booksDir)
    .find((f) => f.endsWith(".json") && !f.startsWith("Kholasa"));
  if (!fileName) throw new Error("Missing Arabic lesson JSON in books/");
  return JSON.parse(fs.readFileSync(path.join(booksDir, fileName), "utf8"));
}

describe("Arabic Curriculum JSON Adapter & Validation", () => {
  it("validates and adapts the full Grade 2 Unit 1 Lesson 1 JSON accurately", () => {
    const raw = loadRealArabicLessonJson();
    const { payload, report } = validateAndAdaptArabicLessonJson(raw);

    expect(report.valid).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.duplicateQuestionIds).toEqual([]);
    expect(report.duplicateStatements).toEqual([]);
    expect(report.duplicateSectionIds).toEqual([]);

    expect(payload).not.toBeNull();
    expect(report.summary.stagesCount).toBe(4);
    expect(report.summary.sectionsCount).toBe(17);
    expect(report.summary.questionsCount).toBe(58);
    expect(report.summary.blocksCount).toBeGreaterThan(40);

    // Ensure key specialized content block types are produced
    const counts = report.summary.blockTypeCounts;
    expect(counts.teacher_explanation).toBeGreaterThan(0);
    expect(counts.vocabulary).toBe(1);
    expect(counts.grammar_rule).toBe(1);
    expect(counts.grammar_table).toBe(1);
    expect(counts.worked_example).toBe(1);
    expect(counts.writing_task).toBe(1);
    expect(counts.reading_passage).toBe(1);
    expect(counts.listening_activity).toBe(1);
    expect(counts.speaking_activity).toBe(1);
    expect(counts.mind_map).toBe(1);
    expect(counts.practice_question).toBeGreaterThan(10);

    // Ensure honest source limit warning for missing Digital Identity audio
    expect(report.missingMediaWarnings.length).toBeGreaterThan(0);
  });

  it("strips answer secrets for student rendering", () => {
    const raw = loadRealArabicLessonJson();
    const { payload } = validateAndAdaptArabicLessonJson(raw);
    expect(payload).not.toBeNull();

    const safe = sanitizeArabicPayloadForStudent(payload!);
    expect(safe.questions).toBeUndefined();
    const firstMeta = safe.questionMetaByJsonId["L1Q001"];
    expect(firstMeta).toBeDefined();
    expect(firstMeta.modelAnswer).toBeUndefined();
    expect(firstMeta.explanation).toBeUndefined();
    expect(firstMeta.examTrick).toBeUndefined();
    expect(firstMeta.skillCategory).toBe("comprehension");
    expect(firstMeta.originEnum).toBe("KHOLASA_ORIGINAL");
  });

  it("detects duplicate question IDs and normalized Arabic duplicate statements", () => {
    const raw = loadRealArabicLessonJson();
    const cloned = structuredClone(raw);
    const q1 = structuredClone(cloned.questionBank[0]);
    const q2 = structuredClone(cloned.questionBank[0]);

    // Case 1: Duplicate ID
    cloned.questionBank.push(q1);
    const resDupId = validateAndAdaptArabicLessonJson(cloned);
    expect(resDupId.report.valid).toBe(false);
    expect(resDupId.report.duplicateQuestionIds).toContain(q1.id);

    // Case 2: Different ID but Arabic-normalized duplicate statement (hamza/punctuation variants)
    const cloned2 = structuredClone(raw);
    q2.id = "L1Q999";
    q2.statement = q2.statement.replace("أ", "ا").replace("؟", "");
    cloned2.questionBank.push(q2);
    const resDupStmt = validateAndAdaptArabicLessonJson(cloned2);
    expect(resDupStmt.report.valid).toBe(false);
    expect(resDupStmt.report.duplicateStatements.length).toBe(1);
  });

  it("rejects invalid MCQ without correct answer, broken sectionId links, and unsafe scripts", () => {
    const raw = loadRealArabicLessonJson();

    const noCorrect = structuredClone(raw);
    noCorrect.questionBank[0].options.forEach((o: { isCorrect: boolean }) => {
      o.isCorrect = false;
    });
    expect(validateAndAdaptArabicLessonJson(noCorrect).report.valid).toBe(false);

    const brokenSec = structuredClone(raw);
    brokenSec.questionBank[0].sectionId = "non-existent-sec";
    expect(validateAndAdaptArabicLessonJson(brokenSec).report.valid).toBe(false);

    const unsafe = structuredClone(raw);
    unsafe.sections[0].summary = '<script>alert("xss")</script>';
    const unsafeRes = validateAndAdaptArabicLessonJson(unsafe);
    expect(unsafeRes.report.valid).toBe(false);
    expect(unsafeRes.payload).toBeNull();
  });
});

describe("Arabic Common Subject Scope & Programming Non-Regression", () => {
  const g11ArabicMedical: CurriculumScope = {
    gradeId: "bacc_g11",
    systemId: "baccalaureate",
    trackId: "medical",
    schoolCategory: "ARABIC",
  };

  const g11LangEng: CurriculumScope = {
    gradeId: "bacc_g11",
    systemId: "baccalaureate",
    trackId: "engineering",
    schoolCategory: "LANGUAGES",
  };

  const g10Arabic: CurriculumScope = {
    gradeId: "bacc_g10",
    systemId: "baccalaureate",
    trackId: null,
    schoolCategory: "ARABIC",
  };

  const commonArabicSubject = {
    gradeId: "bacc_g11",
    systemId: "baccalaureate",
    trackId: null,
    schoolCategory: "ARABIC" as const,
    isCommonCategory: true,
  };

  const progArabicSubject = {
    gradeId: "bacc_g11",
    systemId: "baccalaureate",
    trackId: null,
    schoolCategory: "ARABIC" as const,
    isCommonCategory: false,
  };

  it("shares Common Arabic Subject across all Grade 2 tracks & school categories while blocking Grade 1", () => {
    expect(isSubjectInScope(g11ArabicMedical, commonArabicSubject)).toBe(true);
    expect(isSubjectInScope(g11LangEng, commonArabicSubject)).toBe(true);
    expect(isSubjectInScope(g10Arabic, commonArabicSubject)).toBe(false);
  });

  it("keeps Programming subjects strictly separated by schoolCategory", () => {
    expect(isSubjectInScope(g11ArabicMedical, progArabicSubject)).toBe(true);
    expect(isSubjectInScope(g11LangEng, progArabicSubject)).toBe(false);
  });

  it("builds subjectScopeWhere with AND/OR including isCommonCategory cleanly", () => {
    const where = subjectScopeWhere(g11LangEng);
    expect(where.gradeId).toBe("bacc_g11");
    expect(Array.isArray(where.AND)).toBe(true);
  });
});
