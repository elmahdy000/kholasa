import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=================================================");
  console.log("🧹 تنظيف المواد والوحدات والدروس والأسئلة مع الحفاظ على المسارات");
  console.log("=================================================");

  // 1. عرض الإحصائيات قبل الحذف
  const prevTracks = await prisma.academicTrack.findMany({
    select: { id: true, name: true, nameEn: true, code: true },
  });
  const prevGrades = await prisma.grade.findMany({ select: { id: true, name: true, code: true } });
  const prevSystems = await prisma.educationalSystem.findMany({ select: { id: true, name: true, code: true } });
  const prevUsers = await prisma.user.count();
  const prevSubjects = await prisma.subject.count();
  const prevUnits = await prisma.unit.count();
  const prevLessons = await prisma.lesson.count();
  const prevQuestions = await prisma.question.count();
  const prevExams = await prisma.exam.count();

  console.log(`📊 الحالة قبل التنظيف:`);
  console.log(`- الأنظمة التعليمية: ${prevSystems.length}`);
  console.log(`- الصفوف: ${prevGrades.length}`);
  console.log(`- المسارات الدراسية: ${prevTracks.length} مسار`);
  prevTracks.forEach((t) => console.log(`   * [${t.code}] ${t.name} (${t.nameEn || ""})`));
  console.log(`- المستخدمين: ${prevUsers}`);
  console.log(`- المواد المراد حذفها: ${prevSubjects}`);
  console.log(`- الوحدات: ${prevUnits}`);
  console.log(`- الدروس: ${prevLessons}`);
  console.log(`- الأسئلة: ${prevQuestions}`);
  console.log(`- الامتحانات: ${prevExams}`);
  console.log("-------------------------------------------------");

  // 2. مسح البيانات التابعة للمواد بالترتيب العكسي
  console.log("🗑️ جارٍ حذف سجلات الأنشطة والامتحانات والأسئلة والدروس...");
  await prisma.auditLog.deleteMany();
  await prisma.dailyChallenge.deleteMany();
  await prisma.mistakeReview.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.studentAnswer.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.essayRubric.deleteMany();
  await prisma.questionExplanation.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.questionLesson.deleteMany();
  await prisma.importBatch.deleteMany();
  await prisma.question.deleteMany();
  await prisma.mindMap.deleteMany();
  await prisma.lessonSummary.deleteMany();
  await prisma.lessonContent.deleteMany();
  await prisma.lessonSection.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.subject.deleteMany();

  console.log("✅ تم حذف كافة المواد وملحقاتها بنجاح!");
  console.log("-------------------------------------------------");

  // 3. التحقق من بقاء الأنظمة والصفوف والمسارات والمستخدمين
  const afterTracks = await prisma.academicTrack.findMany({
    select: { id: true, name: true, nameEn: true, code: true },
  });
  const afterGrades = await prisma.grade.count();
  const afterSystems = await prisma.educationalSystem.count();
  const afterUsers = await prisma.user.count();
  const afterSubjects = await prisma.subject.count();

  console.log(`🎉 الحالة النهائية بعد التنظيف:`);
  console.log(`- المسارات المحفوظة: ${afterTracks.length} مسار`);
  afterTracks.forEach((t) => console.log(`   ✔️ [${t.code}] ${t.name}`));
  console.log(`- الصفوف: ${afterGrades} صف محفوظ`);
  console.log(`- الأنظمة: ${afterSystems} نظام محفوظ`);
  console.log(`- المستخدمين: ${afterUsers} مستخدم محفوظ`);
  console.log(`- المواد الحالية: ${afterSubjects} (قاعدة البيانات جاهزة لإضافة المواد من الصفر)`);
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("❌ فشل التنظيف:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
