import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [systems, grades, subjects, units, lessons, summaries, questions, exams, users] =
    await Promise.all([
      prisma.educationalSystem.count(),
      prisma.grade.count(),
      prisma.subject.count(),
      prisma.unit.count(),
      prisma.lesson.count(),
      prisma.lessonSummary.count(),
      prisma.question.count(),
      prisma.exam.count(),
      prisma.user.count(),
    ]);

  console.log("📊 El Kholasa Database Stats:");
  console.log(`- Educational Systems: ${systems}`);
  console.log(`- Grades: ${grades}`);
  console.log(`- Subjects: ${subjects}`);
  console.log(`- Units: ${units}`);
  console.log(`- Lessons: ${lessons}`);
  console.log(`- Golden Summaries (الزتونة): ${summaries}`);
  console.log(`- Question Bank: ${questions}`);
  console.log(`- Pre-built Exams: ${exams}`);
  console.log(`- Users: ${users}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
