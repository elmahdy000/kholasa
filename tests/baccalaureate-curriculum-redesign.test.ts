import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getCurriculumScope,
  subjectScopeWhere,
  isSubjectInScope,
} from "@/lib/curriculum";
import { CurriculumService } from "@/services/curriculum.service";

describe("EL KHOLASA — Complete Educational Curriculum Management Redesign Tests", () => {
  it("Requirement 1: Platform supports strictly Egyptian Baccalaureate grades G10 and G11", async () => {
    const system = await prisma.educationalSystem.findFirst({
      where: { code: "baccalaureate" },
      include: {
        grades: {
          orderBy: { order: "asc" },
          include: { tracks: true },
        },
      },
    });

    expect(system).toBeDefined();
    expect(system!.name).toContain("البكالوريا");

    const grades = system!.grades.filter((g) =>
      ["bacc_g10", "bacc_g11", "G10", "G11"].includes(g.code)
    );
    expect(grades.length).toBe(2);

    const g10 = grades.find((g) => g.code === "bacc_g10" || g.code === "G10");
    const g11 = grades.find((g) => g.code === "bacc_g11" || g.code === "G11");

    expect(g10).toBeDefined();
    expect(g11).toBeDefined();

    // G10 does not require academic track selection
    expect(g10!.tracks.length).toBe(0);

    // G11 supports academic tracks
    expect(g11!.tracks.length).toBeGreaterThanOrEqual(4);
  });

  it("Requirement 2: The 4 official Egyptian Baccalaureate academic tracks are present in G11", async () => {
    const g11 = await prisma.grade.findFirst({
      where: { code: "bacc_g11" },
      include: {
        tracks: { orderBy: { order: "asc" } },
      },
    });
    expect(g11).toBeDefined();

    const trackCodes = g11!.tracks.map((t) => t.code);
    expect(trackCodes).toContain("medical"); // مسار الطب وعلوم الحياة
    expect(trackCodes).toContain("engineering"); // مسار الهندسة وعلوم الحاسب
    expect(trackCodes).toContain("business"); // مسار الأعمال
    expect(trackCodes).toContain("arts"); // مسار الآداب والفنون

    const medicalTrack = g11!.tracks.find((t) => t.code === "medical");
    expect(medicalTrack!.name).toContain("الطب");
    expect(medicalTrack!.isActive).toBe(true);

    const engTrack = g11!.tracks.find((t) => t.code === "engineering");
    expect(engTrack!.name).toContain("الهندسة");
    expect(engTrack!.isActive).toBe(true);
  });

  it("Requirement 3: Strict isolation between Arabic (ARABIC) and Languages (LANGUAGES)", async () => {
    const g11 = await prisma.grade.findFirst({ where: { code: "bacc_g11" } });
    expect(g11).toBeDefined();

    // Ensure at least one Arabic and one Languages subject exist for isolation testing
    let tempAr = null;
    let tempEn = null;

    let arSubjects = await prisma.subject.findMany({
      where: { gradeId: g11!.id, schoolCategory: "ARABIC" },
    });
    if (arSubjects.length === 0) {
      tempAr = await CurriculumService.createSubject({
        name: "مادة عربية تجريبية للعزل",
        code: `iso_test_ar_${Date.now()}`,
        systemId: g11!.systemId,
        gradeId: g11!.id,
        schoolCategory: "ARABIC",
      });
      arSubjects = [tempAr as any];
    }

    let enSubjects = await prisma.subject.findMany({
      where: { gradeId: g11!.id, schoolCategory: "LANGUAGES" },
    });
    if (enSubjects.length === 0) {
      tempEn = await CurriculumService.createSubject({
        name: "Languages Test Subject for Isolation",
        code: `iso_test_en_${Date.now()}`,
        systemId: g11!.systemId,
        gradeId: g11!.id,
        schoolCategory: "LANGUAGES",
      });
      enSubjects = [tempEn as any];
    }

    expect(arSubjects.length).toBeGreaterThan(0);
    expect(enSubjects.length).toBeGreaterThan(0);

    // IDs must never overlap
    const arIds = new Set(arSubjects.map((s) => s.id));
    for (const enSub of enSubjects) {
      expect(arIds.has(enSub.id)).toBe(false);
      expect(enSub.schoolCategory).toBe("LANGUAGES");
    }

    // Student scope for ARABIC never sees LANGUAGES subjects
    const arScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g11!.id,
      schoolCategory: "ARABIC",
    });
    for (const enSub of enSubjects) {
      expect(isSubjectInScope(arScope, enSub)).toBe(false);
    }

    // Student scope for LANGUAGES never sees ARABIC subjects
    const enScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g11!.id,
      schoolCategory: "LANGUAGES",
    });
    for (const arSub of arSubjects) {
      expect(isSubjectInScope(enScope, arSub)).toBe(false);
    }

    // Clean up temporary subjects if created
    if (tempAr) await CurriculumService.deleteSubject(tempAr.id);
    if (tempEn) await CurriculumService.deleteSubject(tempEn.id);
  });

  it("Requirement 4: Common vs Track-Specific Subjects and Elective Groups", async () => {
    const g11 = await prisma.grade.findFirst({
      where: { code: "bacc_g11" },
      include: { tracks: true },
    });
    expect(g11).toBeDefined();

    const engTrack = g11!.tracks.find((t) => t.code === "engineering");
    expect(engTrack).toBeDefined();

    // Create a temporary common subject in G11
    const commonSub = await CurriculumService.createSubject({
      name: "اللغة العربية العامة للتجربة",
      code: `test_common_ar_${Date.now()}`,
      systemId: g11!.systemId,
      gradeId: g11!.id,
      trackId: null, // Common to all tracks
      schoolCategory: "ARABIC",
      isElective: false,
    });
    expect(commonSub.trackId).toBeNull();
    expect(commonSub.isElective).toBe(false);

    // Create a temporary track-specific elective subject in G11
    const electiveSub = await CurriculumService.createSubject({
      name: "مادة اختيارية هندسية",
      code: `test_elective_eng_${Date.now()}`,
      systemId: g11!.systemId,
      gradeId: g11!.id,
      trackId: engTrack!.id,
      schoolCategory: "ARABIC",
      isElective: true,
      electiveGroup: "المجموعة الأولى",
    });
    expect(electiveSub.trackId).toBe(engTrack!.id);
    expect(electiveSub.isElective).toBe(true);
    expect(electiveSub.electiveGroup).toBe("المجموعة الأولى");

    // Student enrolled in engineering track should see both common and this track subject
    const engStudentScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g11!.id,
      trackId: engTrack!.id,
      schoolCategory: "ARABIC",
    });
    expect(isSubjectInScope(engStudentScope, commonSub)).toBe(true);
    expect(isSubjectInScope(engStudentScope, electiveSub)).toBe(true);

    // Student enrolled in a different track (medical) should see commonSub, but NOT electiveSub!
    const medTrack = g11!.tracks.find((t) => t.code === "medical");
    expect(medTrack).toBeDefined();
    const medStudentScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g11!.id,
      trackId: medTrack!.id,
      schoolCategory: "ARABIC",
    });
    expect(isSubjectInScope(medStudentScope, commonSub)).toBe(true);
    expect(isSubjectInScope(medStudentScope, electiveSub)).toBe(false);

    // Cleanup temporary test subjects
    await CurriculumService.deleteSubject(commonSub.id);
    await CurriculumService.deleteSubject(electiveSub.id);
  });

  it("Requirement 5: Dynamic Track Management and Deletion Guard", async () => {
    const g11 = await prisma.grade.findFirst({ where: { code: "bacc_g11" } });
    expect(g11).toBeDefined();

    // 1. Create a new custom track
    const testTrack = await CurriculumService.createTrack({
      name: "مسار التكنولوجيا المتقدمة التجريبي",
      nameEn: "Advanced Technology Test Track",
      code: `test_track_${Date.now()}`,
      gradeId: g11!.id,
      categoryScope: "BOTH",
      isActive: true,
    });
    expect(testTrack.id).toBeDefined();
    expect(testTrack.name).toBe("مسار التكنولوجيا المتقدمة التجريبي");

    // 2. Attach a subject to this track
    const testSub = await CurriculumService.createSubject({
      name: "مادة مرتبطة بالمسار التجريبي",
      code: `test_sub_track_${Date.now()}`,
      systemId: g11!.systemId,
      gradeId: g11!.id,
      trackId: testTrack.id,
      schoolCategory: "ARABIC",
    });

    // 3. Attempt to delete track with active subjects must fail
    await expect(CurriculumService.deleteTrack(testTrack.id)).rejects.toThrow(
      "لا يمكن حذف هذا المسار"
    );

    // 4. Remove the subject, then delete track must succeed
    await CurriculumService.deleteSubject(testSub.id);
    const deleteResult = await CurriculumService.deleteTrack(testTrack.id);
    expect(deleteResult.id).toBe(testTrack.id);
  });

  it("Requirement 6: Unit and Lesson Hierarchical Management under a Subject", async () => {
    const g10 = await prisma.grade.findFirst({ where: { code: "bacc_g10" } });
    expect(g10).toBeDefined();

    // Create a temporary subject
    const subject = await CurriculumService.createSubject({
      name: "مادة اختبار الهيكل التعليمي",
      code: `hierarchy_test_${Date.now()}`,
      systemId: g10!.systemId,
      gradeId: g10!.id,
      schoolCategory: "ARABIC",
    });

    // Create Unit
    const unit = await CurriculumService.createUnit({
      subjectId: subject.id,
      title: "الوحدة الأولى: المفاهيم الأساسية",
      description: "وصف الوحدة",
      order: 1,
    });
    expect(unit.id).toBeDefined();
    expect(unit.title).toBe("الوحدة الأولى: المفاهيم الأساسية");

    // Create Lesson inside Unit
    const lesson = await CurriculumService.createLesson({
      unitId: unit.id,
      title: "الدرس الأول: مدخل تمهيدي",
      order: 1,
      durationMinutes: 45,
    });
    expect(lesson.id).toBeDefined();
    expect(lesson.title).toBe("الدرس الأول: مدخل تمهيدي");

    // Verify retrieval of hierarchy
    const details = await CurriculumService.getSubjectDetails(subject.id);
    expect(details).toBeDefined();
    expect(details!.units.length).toBe(1);
    expect(details!.units[0].lessons.length).toBe(1);
    expect(details!.units[0].lessons[0].id).toBe(lesson.id);

    // Cleanup
    await CurriculumService.deleteSubject(subject.id);
  });
});
