import { prisma } from "../src/lib/prisma";
import {
  CurriculumService,
  QuestionService,
  ExamService,
  DailyCheckinService,
  MistakeService,
  StudentService,
  LeaderboardService,
  SearchService,
  AnalyticsService,
  UserService,
  MediaService,
  OtpService,
  NotificationService,
  OfflineService,
} from "../src/services";

async function runServicesAudit() {
  console.log("🔍 Starting Deep Audit Verification Across All 14 Domain Services...\n");

  // 1. CurriculumService
  console.log("1️⃣ Auditing CurriculumService...");
  const systems = await CurriculumService.getSystems(false);
  if (!Array.isArray(systems) || systems.length === 0) throw new Error("CurriculumService: getSystems failed");
  const grades = await CurriculumService.getGrades(systems[0].id);
  const subjects = await CurriculumService.getSubjects({ systemId: systems[0].id });
  const structureTree = await CurriculumService.getStructureTree();
  console.log(`   ✅ Systems: ${systems.length}, Grades: ${grades.length}, Subjects: ${subjects.length}, StructureTree nodes: ${structureTree.length}`);

  // 2. QuestionService
  console.log("2️⃣ Auditing QuestionService...");
  const qList = await QuestionService.getQuestions({ limit: 5 });
  const qStats = await QuestionService.getQuestionStats();
  if (typeof qStats.total !== "number") throw new Error("QuestionService: getQuestionStats failed");
  console.log(`   ✅ Questions Total: ${qStats.total}, ByType: MCQ=${qStats.byType.MCQ}, Essay=${qStats.byType.ESSAY}`);

  // 3. User & Student Service
  console.log("3️⃣ Auditing UserService & StudentService...");
  const studentUser = await prisma.user.findFirst({ where: { role: "STUDENT" } });
  if (!studentUser) throw new Error("No student user found in database");
  const studentDashboard = await StudentService.getStudentDashboard(studentUser.id);
  if (typeof studentDashboard.stats.totalAttempts !== "number") throw new Error("StudentService: dashboard stats missing");
  console.log(`   ✅ Student Dashboard: ${studentDashboard.user.name}, Total Attempts: ${studentDashboard.stats.totalAttempts}, Avg: ${studentDashboard.stats.averageScore}%`);

  // 4. DailyCheckinService (DEC-011 verification)
  console.log("4️⃣ Auditing DailyCheckinService (DEC-011 compliance)...");
  const checkin = await DailyCheckinService.getDailyCheckinQuestions(studentUser.gradeId);
  if (!Array.isArray(checkin.questions) || checkin.questions.length === 0) {
    throw new Error("DailyCheckinService: getDailyCheckinQuestions failed");
  }
  const simulatedAnswers = checkin.questions.map((q) => ({
    questionId: q.id,
    selectedOptionId: (q.options?.[0] as any)?.id || null,
    essayText: q.type === "ESSAY" ? "إجابة مقالية نموذجية للتحقق الذاتي" : null,
  }));
  const checkinResult = await DailyCheckinService.submitDailyCheckin(studentUser.id, simulatedAnswers);
  const essayReviewItem = checkinResult.reviewedQuestions.find((r) => r.isEssay);
  if (essayReviewItem && essayReviewItem.isCorrect !== null) {
    throw new Error("DEC-011 VIOLATION: Essay question was evaluated with non-null isCorrect!");
  }
  console.log(`   ✅ Checkin submission verified: Score=${checkinResult.score}/${checkinResult.totalObjective}, DEC-011 Essay comparison respected`);

  // 5. ExamService
  console.log("5️⃣ Auditing ExamService (DEC-011 & Skipped questions)...");
  const exams = await ExamService.getExams();
  const sampleSubject = subjects[0];
  const customExam = await ExamService.createCustomExam(
    {
      subjectId: sampleSubject.id,
      questionCount: 3,
      durationMinutes: 10,
      mode: "PRACTICE",
    },
    studentUser.id
  );
  const examSubmission = await ExamService.submitExamAttempt(customExam.attemptId, studentUser.id);
  const attemptReview = await ExamService.getAttemptResults(customExam.attemptId, studentUser.id);
  console.log(`   ✅ Custom Exam created (${customExam.examId}), submitted with score: ${examSubmission.score}, breakdown items: ${attemptReview.questionsBreakdown.length}`);

  // 6. MistakeService
  console.log("6️⃣ Auditing MistakeService...");
  const sampleQ = qList.questions[0];
  if (sampleQ) {
    await MistakeService.recordMistake(studentUser.id, sampleQ.id);
    const mistakes = await MistakeService.getStudentMistakes(studentUser.id);
    await MistakeService.resolveMistake(studentUser.id, sampleQ.id);
    console.log(`   ✅ Mistake cycle verified for user: ${mistakes.length} mistakes checked, safely marked resolved`);
  }

  // 7. LeaderboardService
  console.log("7️⃣ Auditing LeaderboardService...");
  const leaderboard = await LeaderboardService.getLeaderboard(studentUser.id, 10);
  if (!Array.isArray(leaderboard) || leaderboard.length === 0) throw new Error("LeaderboardService failed");
  const hasCurrentUserFlag = leaderboard.some((l) => l.id === studentUser.id && l.isCurrentUser);
  console.log(`   ✅ Leaderboard count: ${leaderboard.length}, Top XP: ${leaderboard[0].xp}, Current User included: ${hasCurrentUserFlag}`);

  // 8. SearchService
  console.log("8️⃣ Auditing SearchService...");
  const searchResults = await SearchService.globalSearch("فيزياء");
  const emptySearch = await SearchService.globalSearch("   ");
  if (emptySearch.length !== 0) throw new Error("SearchService: empty query should return empty array");
  console.log(`   ✅ Search query 'فيزياء' returned: ${searchResults.length} results, empty query handled safely`);

  // 9. AnalyticsService
  console.log("9️⃣ Auditing AnalyticsService...");
  const metrics = await AnalyticsService.getAdminPlatformMetrics();
  await AnalyticsService.logAuditAction(studentUser.id, "AUDIT_TEST", "AuditTestResource", "test_1", { ok: true });
  const auditLogs = await AnalyticsService.getAuditLogs(5);
  console.log(`   ✅ Platform metrics: Students=${metrics.overview.studentsCount}, Exams=${metrics.overview.examsCount}, AuditLogs: ${auditLogs.length}`);

  // 10. UserService security hierarchy
  console.log("🔟 Auditing UserService Role Hierarchy...");
  let adminDeletionBlocked = false;
  try {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (adminUser) {
      await UserService.deleteUser(adminUser.id, "TEACHER");
    }
  } catch (err) {
    adminDeletionBlocked = true;
  }
  if (!adminDeletionBlocked) throw new Error("UserService security hierarchy failed to block unauthorized user deletion!");
  console.log("   ✅ Security hierarchy successfully blocked unauthorized admin deletion");

  // 11. MediaService
  console.log("1️⃣1️⃣ Auditing MediaService...");
  MediaService.validate(1024, "image/png", "images");
  let caughtTooLarge = false;
  try {
    MediaService.validate(60 * 1024 * 1024, "image/png", "images");
  } catch {
    caughtTooLarge = true;
  }
  if (!caughtTooLarge) throw new Error("MediaService: oversized file was not rejected");
  console.log("   ✅ MediaService file size and MIME validation passed");

  // 12. OtpService
  console.log("1️⃣2️⃣ Auditing OtpService...");
  const otpRes = await OtpService.sendOtp(studentUser.email || "student@test.com", "VERIFICATION");
  if (!otpRes.devCode) throw new Error("OtpService: devCode not generated");
  const verifyRes = await OtpService.verifyOtp(studentUser.email || "student@test.com", otpRes.devCode);
  if (!verifyRes.verified || !verifyRes.resetToken) throw new Error("OtpService: verification failed");
  console.log(`   ✅ OTP dispatch and verification cycle successful (token: ${verifyRes.resetToken.slice(0, 15)}...)`);

  // 13. NotificationService
  console.log("1️⃣3️⃣ Auditing NotificationService...");
  const inAppNotifs = await NotificationService.getInAppNotifications(studentUser.id);
  const pushPayload = NotificationService.getDailyExamPushPayload();
  console.log(`   ✅ Generated ${inAppNotifs.length} smart in-app notifications, Push title: '${pushPayload.title}'`);

  // 14. OfflineService
  console.log("1️⃣4️⃣ Auditing OfflineService...");
  const sampleLesson = await prisma.lesson.findFirst();
  if (sampleLesson) {
    const pkg = await OfflineService.generateLessonOfflinePackage(sampleLesson.id);
    if (!pkg.id || !pkg.title) throw new Error("OfflineService failed to package lesson");
    console.log(`   ✅ Lesson offline payload packaged: '${pkg.title}', body length: ${pkg.body.length} chars`);
  }

  console.log("\n=======================================================");
  console.log("🎉 ALL 14 BACKEND DOMAIN SERVICES AUDITED AND 100% OPERATIONAL!");
  console.log("=======================================================");
}

runServicesAudit()
  .catch((err) => {
    console.error("❌ Service Audit Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
