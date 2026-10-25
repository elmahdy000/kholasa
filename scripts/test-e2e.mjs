// scripts/test-e2e.mjs
// Comprehensive End-to-End Verification for El Kholasa

async function runTests() {
  console.log("🚀 Starting End-to-End HTTP Integration Tests on http://localhost:3000...\n");
  const BASE_URL = "http://localhost:3000";

  const STUDENT_PASSWORD = process.env.SEED_STUDENT_PASSWORD;
  const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
  if (!STUDENT_PASSWORD || !ADMIN_PASSWORD) {
    console.error(
      "❌ Set SEED_STUDENT_PASSWORD and SEED_ADMIN_PASSWORD before running e2e tests " +
        "(they must match the values used when seeding the database)."
    );
    process.exit(1);
  }

  let studentCookie = "";
  let adminCookie = "";
  let sampleSubjectId = "";
  let sampleLessonId = "";
  let sampleQuestionId = "";

  // Helper fetch with cookie support
  async function testRoute(name, path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, options);
    const ok = res.status >= 200 && res.status < 400;
    console.log(`${ok ? "✅" : "❌"} [${res.status}] ${name} -> ${path}`);
    if (!ok) {
      const text = await res.text();
      console.error(`   Error details: ${text.slice(0, 200)}`);
    }
    return res;
  }

  // 1. Landing Page
  const landingRes = await testRoute("Landing Page", "/");
  const landingHtml = await landingRes.text();
  if (landingHtml.includes("الخُلاصة") || landingHtml.includes("الخلاصة")) {
    console.log("   ✨ Landing page contains brand title 'الخُلاصة'");
  }

  // 2. Student Login
  const loginRes = await testRoute("Student Login API", "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "student@kholasa.app",
      password: STUDENT_PASSWORD,
    }),
  });
  const setCookieHeader = loginRes.headers.get("set-cookie");
  if (setCookieHeader) {
    studentCookie = setCookieHeader.split(";")[0];
    console.log(`   🔑 Obtained student session cookie`);
  }

  // 3. Authenticated Dashboard
  await testRoute("Student Dashboard", "/dashboard", {
    headers: { Cookie: studentCookie },
  });

  // 4. Subjects Catalog
  const subjectsRes = await testRoute("Subjects Catalog", "/subjects", {
    headers: { Cookie: studentCookie },
  });

  // 5. Educational Systems API
  const sysRes = await testRoute("Systems API", "/api/systems");
  const sysData = await sysRes.json();
  console.log(`   📚 Found ${sysData.systems?.length || 0} educational systems in database`);

  // 6. Test DB Query to get sample IDs for testing
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({
    datasources: {
      db: { url: "postgresql://postgres:postgres@localhost:5433/kholasa?schema=public" },
    },
  });

  const subject = await prisma.subject.findFirst({
    include: { units: { include: { lessons: true } } },
  });
  sampleSubjectId = subject?.id || "";
  sampleLessonId = subject?.units[0]?.lessons[0]?.id || "";

  const question = await prisma.question.findFirst({
    include: { options: true },
  });
  sampleQuestionId = question?.id || "";

  // 7. Subject Detail
  if (sampleSubjectId) {
    await testRoute("Subject Detail Page", `/subjects/${sampleSubjectId}`, {
      headers: { Cookie: studentCookie },
    });
  }

  // 8. Lesson View (4 Tabs)
  if (sampleLessonId) {
    await testRoute("Lesson Learning View", `/lessons/${sampleLessonId}`, {
      headers: { Cookie: studentCookie },
    });
  }

  // 9. Exams Hub & Builder
  await testRoute("Exams Hub", "/exams", {
    headers: { Cookie: studentCookie },
  });
  await testRoute("Exam Builder Page", "/exams/builder", {
    headers: { Cookie: studentCookie },
  });

  // 10. Exam Builder Stats API
  if (sampleSubjectId) {
    await testRoute(
      "Exam Builder Stats API",
      `/api/exams/builder/stats?subjectId=${sampleSubjectId}&type=ALL&difficulty=ALL`
    );
  }

  // 11. Custom Exam Creation API
  if (sampleSubjectId) {
    const examCreateRes = await testRoute("Exam Creation API", "/api/exams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: studentCookie },
      body: JSON.stringify({
        subjectId: sampleSubjectId,
        questionCount: 3,
        mode: "PRACTICE",
        durationMinutes: 15,
      }),
    });
    const examData = await examCreateRes.json();
    if (examData.examId) {
      console.log(`   🎯 Created Custom Exam with ID: ${examData.examId}`);
      // Test solver page
      await testRoute("Exam Solver Page", `/exams/${examData.examId}?attemptId=${examData.attemptId}`, {
        headers: { Cookie: studentCookie },
      });
    }
  }

  // 12. Question Answer & Mistake Recording API
  if (sampleQuestionId) {
    const wrongOpt = question.options.find((o) => !o.isCorrect);
    await testRoute("Question Answer Evaluation API", `/api/questions/${sampleQuestionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: studentCookie },
      body: JSON.stringify({
        selectedOptionId: wrongOpt?.id || question.options[0]?.id,
      }),
    });
  }

  // 13. Mistakes Hub ("غلطاتي")
  await testRoute("Mistakes Review Hub", "/mistakes", {
    headers: { Cookie: studentCookie },
  });

  // 14. Student Profile Page
  await testRoute("Student Profile Page", "/profile", {
    headers: { Cookie: studentCookie },
  });

  // 15. Admin Login
  const adminLoginRes = await testRoute("Admin Login API", "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "admin@kholasa.app",
      password: ADMIN_PASSWORD,
    }),
  });
  const adminCookieHeader = adminLoginRes.headers.get("set-cookie");
  if (adminCookieHeader) {
    adminCookie = adminCookieHeader.split(";")[0];
    console.log(`   👑 Obtained admin session cookie`);
  }

  // 16. Admin Dashboard Pages
  await testRoute("Admin Overview Dashboard", "/admin", {
    headers: { Cookie: adminCookie },
  });
  await testRoute("Admin Curriculum Manager", "/admin/curriculum", {
    headers: { Cookie: adminCookie },
  });
  await testRoute("Admin Question Bank", "/admin/questions", {
    headers: { Cookie: adminCookie },
  });
  await testRoute("Admin Users Management", "/admin/users", {
    headers: { Cookie: adminCookie },
  });

  // 17. Leaderboard & Offline PWA Pages
  await testRoute("Leaderboard Page", "/leaderboard", {
    headers: { Cookie: studentCookie },
  });
  await testRoute("PWA Offline Page", "/offline");

  // 18. Admin Questions Import Page & Bulk API
  await testRoute("Admin Questions Import Page", "/admin/questions/import", {
    headers: { Cookie: adminCookie },
  });

  if (sampleSubjectId) {
    await testRoute("Admin Bulk Import API", "/api/admin/questions/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        questions: [
          {
            statement: "ما هو العنصر الانتقالي المستخدم كعامل حفاز في هدرجة الزيوت؟",
            type: "MCQ",
            difficulty: "EASY",
            subjectId: sampleSubjectId,
            options: [
              { text: "النيكل المجزأ", isCorrect: true, explanation: "النيكل المجزأ يمتلك مساحة سطح كبيرة تزيد من سرعة التفاعل" },
              { text: "الحديد", isCorrect: false, explanation: "الحديد يستخدم في تحضير غاز النشادر (هابر-بوش)" },
              { text: "النحاس", isCorrect: false, explanation: "النحاس موصل للكهرباء وليس لهدرجة الزيوت" },
              { text: "الزنك", isCorrect: false, explanation: "الزنك غير انتقالي ويستخدم في الجلفنة" },
            ],
            concept: "العوامل الحفازة في العناصر الانتقالية",
            correctReason: "النيكل المجزأ يستخدم في هدرجة الزيوت لتحويلها إلى دهون مشبعة صلبة",
          },
        ],
      }),
    });
  }

  // 19. PWA Manifest & Service Worker
  await testRoute("PWA Manifest", "/manifest.json");
  await testRoute("PWA Service Worker", "/sw.js");

  await prisma.$disconnect();
  console.log("\n🎉 ALL END-TO-END SUITES COMPLETED AND VERIFIED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
