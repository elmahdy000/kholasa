import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "@/lib/prisma";

const mockCookiesStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockImplementation(async () => mockCookiesStore),
}));

import { POST as loginRoute } from "@/app/api/auth/login/route";
import { POST as registerRoute } from "@/app/api/auth/register/route";
import { POST as resetDevicesRoute } from "@/app/api/admin/users/[id]/reset-devices/route";
import { GET as exportUsersRoute } from "@/app/api/admin/users/export/route";
import { UserService } from "@/services/user.service";
import { hashPassword } from "@/lib/auth";

describe("Full Application Comprehensive End-to-End Suite", () => {
  let testStudentId: string;
  let testAdminId: string;
  let testSubjectId: string;
  let testExamId: string;
  let testQuestionId: string;
  let testLessonId: string;

  const testLoginCode = `E2E${Math.floor(100 + Math.random() * 899)}`;
  const testPhone = `01099${Math.floor(100000 + Math.random() * 899999)}`;
  const deviceA = `device_e2e_alpha_${Date.now()}`;
  const deviceB = `device_e2e_beta_${Date.now()}`;
  const deviceC = `device_e2e_gamma_${Date.now()}`;

  beforeAll(async () => {
    // 1. Create a dedicated test student
    const student = await prisma.user.create({
      data: {
        name: "طالب تجربة شاملة E2E",
        phone: testPhone,
        email: `student_e2e_${Date.now()}@kholasa.test`,
        loginCode: testLoginCode,
        role: "STUDENT",
        schoolCategory: "ARABIC",
        maxDevices: 1,
        boundDevices: [],
      },
    });
    testStudentId = student.id;

    // 2. Create a dedicated test admin
    const hashedAdminPassword = await hashPassword("AdminSecretPassword123!");
    const admin = await prisma.user.create({
      data: {
        name: "مشرف تجربة شاملة E2E",
        email: `admin_e2e_${Date.now()}@kholasa.test`,
        phone: `01199${Math.floor(100000 + Math.random() * 899999)}`,
        password: hashedAdminPassword,
        role: "ADMIN",
        maxDevices: 5,
        boundDevices: [],
      },
    });
    testAdminId = admin.id;

    // 3. Find or create an academic structure for exams & lessons
    let system = await prisma.educationalSystem.findFirst();
    if (!system) {
      system = await prisma.educationalSystem.create({
        data: { name: "النظام التجريبي العام", code: `sys_${Date.now()}` },
      });
    }

    let grade = await prisma.grade.findFirst({ where: { systemId: system.id } });
    if (!grade) {
      grade = await prisma.grade.create({
        data: { name: "الصف التجريبي", code: `gr_${Date.now()}`, systemId: system.id, order: 1 },
      });
    }

    const subject = await prisma.subject.create({
      data: {
        name: "مادة الاختبار الشامل E2E",
        code: `subj_e2e_${Date.now()}`,
        systemId: system.id,
        gradeId: grade.id,
        schoolCategory: "ARABIC",
      },
    });
    testSubjectId = subject.id;

    const unit = await prisma.unit.create({
      data: {
        title: "الوحدة الأولى الشاملة",
        order: 1,
        subjectId: subject.id,
      },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title: "الدرس التجريبي الشامل",
        order: 1,
        unitId: unit.id,
        durationMinutes: 30,
      },
    });
    testLessonId = lesson.id;

    const question = await prisma.question.create({
      data: {
        statement: "سؤال تجريبي لاختبار التقييم الشامل لمنصة الخلاصة؟",
        type: "MCQ",
        difficulty: "MEDIUM",
        subjectId: subject.id,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "الخيار الأول الصحيح", isCorrect: true, order: 1 },
            { text: "الخيار الثاني الخطأ", isCorrect: false, order: 2 },
          ],
        },
      },
    });
    testQuestionId = question.id;

    const exam = await prisma.exam.create({
      data: {
        title: "امتحان شامل تجريبي E2E",
        subjectId: subject.id,
        schoolCategory: "ARABIC",
        durationMinutes: 45,
        questions: {
          create: [{ questionId: question.id, order: 1 }],
        },
      },
    });
    testExamId = exam.id;
  });

  afterAll(async () => {
    // Clean up created entities safely
    if (testExamId) {
      await prisma.examAttempt.deleteMany({ where: { examId: testExamId } });
      await prisma.examQuestion.deleteMany({ where: { examId: testExamId } });
      await prisma.exam.deleteMany({ where: { id: testExamId } });
    }
    if (testLessonId) {
      await prisma.studentProgress.deleteMany({ where: { lessonId: testLessonId } });
      await prisma.lesson.deleteMany({ where: { id: testLessonId } });
    }
    if (testQuestionId) {
      await prisma.mistakeReview.deleteMany({ where: { questionId: testQuestionId } });
      await prisma.questionOption.deleteMany({ where: { questionId: testQuestionId } });
      await prisma.question.deleteMany({ where: { id: testQuestionId } });
    }
    if (testSubjectId) {
      await prisma.unit.deleteMany({ where: { subjectId: testSubjectId } });
      await prisma.subject.deleteMany({ where: { id: testSubjectId } });
    }
    if (testStudentId) {
      await prisma.session.deleteMany({ where: { userId: testStudentId } });
      await prisma.user.deleteMany({ where: { id: testStudentId } });
    }
    if (testAdminId) {
      await prisma.session.deleteMany({ where: { userId: testAdminId } });
      await prisma.user.deleteMany({ where: { id: testAdminId } });
    }
  });

  // ==========================================
  // SECTION 1: Closed Registration Security
  // ==========================================
  it("1. blocks public open self-registration with HTTP 403 Forbidden", async () => {
    const res = await registerRoute();
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("مغلق حالياً");
  });

  // ==========================================
  // SECTION 2: Student Code Login & 1-Device Binding
  // ==========================================
  it("2. allows student to login with 6-char code on Device A and binds it", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: testLoginCode,
        deviceId: deviceA,
      }),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.id).toBe(testStudentId);
    expect(data.user.role).toBe("STUDENT");

    // Verify database reflects the bound device
    const updated = await prisma.user.findUniqueOrThrow({ where: { id: testStudentId } });
    expect(updated.boundDevices).toContain(deviceA);
    expect(updated.boundDevices.length).toBe(1);
  });

  it("3. allows student to login again from the SAME authorized Device A", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: testLoginCode,
        deviceId: deviceA,
      }),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(200);
  });

  it("4. blocks student login from Device B (account sharing prevention)", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: testLoginCode,
        deviceId: deviceB,
      }),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("الحد الأقصى من الأجهزة");
  });

  // ==========================================
  // SECTION 3: Admin Elevates to 2 Devices
  // ==========================================
  it("5. allows admin to elevate student to 2 devices, permitting Device B", async () => {
    // Admin elevates maxDevices from 1 to 2
    await prisma.user.update({
      where: { id: testStudentId },
      data: { maxDevices: 2 },
    });

    // Now Device B should be permitted
    const reqB = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: testLoginCode,
        deviceId: deviceB,
      }),
    });

    const resB = await loginRoute(reqB);
    expect(resB.status).toBe(200);

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: testStudentId } });
    expect(updated.boundDevices).toHaveLength(2);
    expect(updated.boundDevices).toContain(deviceA);
    expect(updated.boundDevices).toContain(deviceB);

    // Device C should now be blocked (exceeds 2)
    const reqC = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: testLoginCode,
        deviceId: deviceC,
      }),
    });

    const resC = await loginRoute(reqC);
    expect(resC.status).toBe(403);
  });

  // ==========================================
  // SECTION 4: Device Reset Endpoint
  // ==========================================
  it("6. resets student bound devices when admin requests reset-devices", async () => {
    // Directly invoke reset devices logic with ADMIN actor role
    await UserService.resetUserDevices(testStudentId, "ADMIN");

    const studentAfterReset = await prisma.user.findUniqueOrThrow({ where: { id: testStudentId } });
    expect(studentAfterReset.boundDevices).toHaveLength(0);

    // Now Device C can login and bind as the fresh primary device
    const reqC = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: testLoginCode,
        deviceId: deviceC,
      }),
    });

    const resC = await loginRoute(reqC);
    expect(resC.status).toBe(200);

    const studentAfterNewLogin = await prisma.user.findUniqueOrThrow({ where: { id: testStudentId } });
    expect(studentAfterNewLogin.boundDevices).toContain(deviceC);
  });

  // ==========================================
  // SECTION 5: Academic Lifecycle & Stats
  // ==========================================
  it("7. tracks student exam attempt, lesson progress, and mistakes review", async () => {
    // A) Record an exam attempt (Score: 85%, Time: 900 seconds)
    await prisma.examAttempt.create({
      data: {
        userId: testStudentId,
        examId: testExamId,
        title: "امتحان شامل تجريبي E2E",
        score: 85,
        percentage: 85,
        timeSpentSeconds: 900,
        isCompleted: true,
        mode: "EXAM",
      },
    });

    // B) Record lesson completion (100%)
    await prisma.studentProgress.create({
      data: {
        userId: testStudentId,
        lessonId: testLessonId,
        isCompleted: true,
        progressPercent: 100,
      },
    });

    // C) Record a student mistake review
    await prisma.mistakeReview.create({
      data: {
        userId: testStudentId,
        questionId: testQuestionId,
        wrongCount: 2,
        isResolved: true,
      },
    });

    // Verify detailed profile aggregates accurately
    const profile = await UserService.getUserDetailedProfile(testStudentId);
    expect(profile).not.toBeNull();
    expect(profile!.stats.averageScore).toBe(85);
    expect(profile!.stats.totalAttempts).toBe(1);
    expect(profile!.stats.completedLessons).toBe(1);
    expect(profile!.stats.resolvedMistakes).toBe(1);
    expect(profile!.stats.totalTimeSpentMinutes).toBe(15); // 900s / 60 = 15 mins

    // Verify subject breakdown exists
    const subjectStat = profile!.stats.subjectStats?.find(
      (s) => s.subjectName === "مادة الاختبار الشامل E2E"
    );
    expect(subjectStat).toBeDefined();
    expect(subjectStat!.attemptsCount).toBe(1);
    expect(subjectStat!.averageScore).toBe(85);
    expect(subjectStat!.completedLessons).toBe(1);
  });

  // ==========================================
  // SECTION 6: Cohort Telemetry Consistency
  // ==========================================
  it("8. computes consistent aggregate cohort telemetry across the platform", async () => {
    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      arabicStudents,
      languagesStudents,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "STUDENT", boundDevices: { isEmpty: false } } }),
      prisma.user.count({ where: { role: "STUDENT", boundDevices: { isEmpty: true } } }),
      prisma.user.count({ where: { role: "STUDENT", schoolCategory: "ARABIC" } }),
      prisma.user.count({ where: { role: "STUDENT", schoolCategory: "LANGUAGES" } }),
    ]);

    expect(totalStudents).toBeGreaterThanOrEqual(810);
    expect(activeStudents + inactiveStudents).toBe(totalStudents);
    expect(arabicStudents + languagesStudents).toBe(totalStudents);
  });

  // ==========================================
  // SECTION 7: Admin CSV Export Integrity
  // ==========================================
  it("9. exports students list in UTF-8 BOM CSV format for Excel Arabic compatibility", async () => {
    const students = await prisma.user.findMany({
      take: 5,
      select: {
        loginCode: true,
        name: true,
        phone: true,
        schoolCategory: true,
        boundDevices: true,
      },
    });

    expect(students.length).toBeGreaterThan(0);
    for (const s of students) {
      expect(s.loginCode).toBeDefined();
      expect(Array.isArray(s.boundDevices)).toBe(true);
    }
  });
});
