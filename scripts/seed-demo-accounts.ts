import { PrismaClient, Role, SchoolCategory, StudyMode, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Demo/Trial accounts for El Kholasa Platform...");

  const defaultPassword = "Student@Kholasa2026!";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // Find grade and system hosting the active curriculum
  const publishedSubject = await prisma.subject.findFirst({
    where: { isPublished: true },
    include: { grade: true, system: true },
  });

  const gradeId =
    publishedSubject?.gradeId ||
    (
      await prisma.grade.findFirst({
        where: {
          OR: [
            { name: { contains: "الثاني" } },
            { name: { contains: "تانية" } },
            { code: { contains: "g11" } },
          ],
        },
      })
    )?.id ||
    null;

  const systemId =
    publishedSubject?.systemId ||
    (await prisma.educationalSystem.findFirst())?.id ||
    null;

  const demoAccounts = [
    {
      id: "demo-student-ar",
      name: "طالب تجريبي (عربي)",
      loginCode: "DEMO-AR",
      phone: "01099999991",
      email: "demo-ar@kholasa.app",
      role: Role.STUDENT,
      schoolCategory: SchoolCategory.ARABIC,
      studyMode: StudyMode.OFFLINE,
      centerName: "سنتر رافال عربي",
      subscriptionStatus: SubscriptionStatus.TRIAL,
      maxDevices: 10,
      boundDevices: [],
      isActive: true,
      gradeId,
      systemId,
    },
    {
      id: "demo-student-en",
      name: "طالب لغات",
      loginCode: "DEMO-EN",
      phone: "01099999992",
      email: "demo-en@kholasa.app",
      role: Role.STUDENT,
      schoolCategory: SchoolCategory.LANGUAGES,
      studyMode: StudyMode.OFFLINE,
      centerName: "سنتر إديوفيرس لغات",
      subscriptionStatus: SubscriptionStatus.TRIAL,
      maxDevices: 10,
      boundDevices: [],
      isActive: true,
      gradeId,
      systemId,
    },
    {
      id: "demo-student-pro",
      name: "طالب مفعل (اشتراك كامل)",
      loginCode: "DEMO-PRO",
      phone: "01099999993",
      email: "demo-pro@kholasa.app",
      role: Role.STUDENT,
      schoolCategory: SchoolCategory.LANGUAGES,
      studyMode: StudyMode.ONLINE,
      centerName: null,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      maxDevices: 10,
      boundDevices: [],
      isActive: true,
      gradeId,
      systemId,
    },
  ];

  for (const acc of demoAccounts) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { loginCode: acc.loginCode },
          { phone: acc.phone },
          { email: acc.email },
        ],
      },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: acc.name,
          loginCode: acc.loginCode,
          schoolCategory: acc.schoolCategory,
          studyMode: acc.studyMode,
          centerName: acc.centerName,
          subscriptionStatus: acc.subscriptionStatus,
          maxDevices: acc.maxDevices,
          boundDevices: [],
          isActive: true,
          password: passwordHash,
          gradeId: acc.gradeId,
          systemId: acc.systemId,
        },
      });
      console.log(`Updated existing account -> ${acc.loginCode} (${acc.name})`);
    } else {
      await prisma.user.create({
        data: {
          ...acc,
          password: passwordHash,
        },
      });
      console.log(`Created new demo account -> ${acc.loginCode} (${acc.name})`);
    }
  }

  console.log("Demo accounts seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

