import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import nextEnv from "@next/env";

// Load .env/.env.local the same way Next.js does
nextEnv.loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting El Kholasa Database Seeding...");

  // حماية: لا تمسح قاعدة البيانات أبدًا في الإنتاج بدون موافقة صريحة
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PRODUCTION !== "true") {
    throw new Error(
      "Refusing to seed in production. Set SEED_ALLOW_PRODUCTION=true only if you really mean it."
    );
  }

  // التحقق من كلمة مرور الأدمن *قبل* أي حذف أو تعديل للبيانات
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      "SEED_ADMIN_PASSWORD is required and must be at least 8 characters. " +
        "Set it in .env before running the seed."
    );
  }

  // 1. Clear existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.mistakeReview.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.studentAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.essayRubric.deleteMany();
  await prisma.questionExplanation.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.questionLesson.deleteMany();
  await prisma.question.deleteMany();
  await prisma.mindMap.deleteMany();
  await prisma.lessonSummary.deleteMany();
  await prisma.lessonContent.deleteMany();
  await prisma.lessonSection.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.academicTrack.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.educationalSystem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing database records.");

  // 2. Educational Systems (Baccalaureate only)
  const baccalaureate = await prisma.educationalSystem.create({
    data: {
      name: "البكالوريا المصرية (عربي ولغات)",
      code: "baccalaureate",
      description: "المسار التعليمي الحديث للبكالوريا المصرية المعتمد على المسارات التخصصية وعلوم الحاسب والبرمجة والذكاء الاصطناعي",
      order: 1,
    },
  });

  // 3. Academic Year
  await prisma.academicYear.create({
    data: {
      name: "العام الدراسي 2026/2027",
      code: "2026-2027",
      isActive: true,
    },
  });

  // 4. Grades (Baccalaureate only)
  const baccG10 = await prisma.grade.create({
    data: {
      name: "الصف الأول الثانوي (أولى بكالوريا - عام ولغات)",
      code: "bacc_g10",
      systemId: baccalaureate.id,
      order: 1,
    },
  });

  const baccG11 = await prisma.grade.create({
    data: {
      name: "الصف الثاني الثانوي (تانية بكالوريا)",
      code: "bacc_g11",
      systemId: baccalaureate.id,
      order: 2,
    },
  });

  // 5. Academic Tracks (Official Egyptian Baccalaureate Tracks for G11)
  const medicalTrack = await prisma.academicTrack.create({
    data: {
      name: "مسار الطب وعلوم الحياة",
      nameEn: "Medical & Life Sciences Track",
      code: "medical",
      gradeId: baccG11.id,
      order: 1,
      isActive: true,
    },
  });

  const engineeringTrack = await prisma.academicTrack.create({
    data: {
      name: "مسار الهندسة وعلوم الحاسب",
      nameEn: "Engineering & Computer Science Track",
      code: "engineering",
      gradeId: baccG11.id,
      order: 2,
      isActive: true,
    },
  });

  const businessTrack = await prisma.academicTrack.create({
    data: {
      name: "مسار الأعمال",
      nameEn: "Business & Management Track",
      code: "business",
      gradeId: baccG11.id,
      order: 3,
      isActive: true,
    },
  });

  const artsTrack = await prisma.academicTrack.create({
    data: {
      name: "مسار الآداب والفنون",
      nameEn: "Arts & Humanities Track",
      code: "arts",
      gradeId: baccG11.id,
      order: 4,
      isActive: true,
    },
  });

  // 6. Users (Admin + Demo Students)
  const studentPassword =
    process.env.SEED_STUDENT_PASSWORD || randomBytes(24).toString("base64url");

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const studentPasswordHash = await bcrypt.hash(studentPassword, 12);

  const adminUser = await prisma.user.create({
    data: {
      name: "د. محمود المهدي (المشرف العام)",
      email: "admin@kholasa.app",
      phone: "01000000000",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // Student 1: 2nd Secondary Engineering Track (تانية بكالوريا مسار الهندسة)
  const studentUser = await prisma.user.create({
    data: {
      name: "أحمد محمد علي (تانية بكالوريا - هندسة)",
      email: "student@kholasa.app",
      phone: "01111111111",
      password: studentPasswordHash,
      role: "STUDENT",
      systemId: baccalaureate.id,
      gradeId: baccG11.id,
      trackId: engineeringTrack.id,
    },
  });

  // Student 2: 1st Secondary (أولى بكالوريا - عام ولغات)
  const studentG10User = await prisma.user.create({
    data: {
      name: "سارة إبراهيم (أولى بكالوريا - عام ولغات)",
      email: "student.g10@kholasa.app",
      phone: "01222222222",
      password: studentPasswordHash,
      role: "STUDENT",
      systemId: baccalaureate.id,
      gradeId: baccG10.id,
      trackId: null,
    },
  });

  console.log(`👤 Created users: Admin (${adminUser.email}), Student G11 (${studentUser.email}), Student G10 (${studentG10User.email})`);

  console.log("🎉 Seeding completed successfully (clean Baccalaureate structure)!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
