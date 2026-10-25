import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import nextEnv from "@next/env";
import { baccG10Subject } from "./data/bacc_g10_curriculum.mjs";
import { baccG11EngineeringSubject } from "./data/bacc_g11_engineering_curriculum.mjs";

// Load .env/.env.local the same way Next.js does
nextEnv.loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

/**
 * Reusable helper to seed a comprehensive curriculum subject
 */
async function seedCurriculumSubject({ subjectData, systemId, gradeId, trackId }) {
  console.log(`📘 Seeding subject: ${subjectData.name}...`);
  const createdSubject = await prisma.subject.create({
    data: {
      name: subjectData.name,
      code: subjectData.code,
      icon: subjectData.icon,
      color: subjectData.color,
      description: subjectData.description,
      systemId,
      gradeId,
      trackId: trackId || null,
      order: subjectData.order,
      isPublished: subjectData.isPublished ?? true,
    },
  });

  const allQuestionIds = [];

  for (const unitData of subjectData.units) {
    const createdUnit = await prisma.unit.create({
      data: {
        title: unitData.title,
        order: unitData.order,
        description: unitData.description,
        subjectId: createdSubject.id,
        isPublished: true,
      },
    });

    for (const lessonData of unitData.lessons) {
      const createdLesson = await prisma.lesson.create({
        data: {
          title: lessonData.title,
          order: lessonData.order,
          unitId: createdUnit.id,
          durationMinutes: lessonData.durationMinutes || 15,
          isPublished: true,
        },
      });

      // 1. Content
      await prisma.lessonContent.create({
        data: {
          lessonId: createdLesson.id,
          objectives: lessonData.objectives || [],
          body: lessonData.body,
        },
      });

      // 2. Sections
      const sectionMap = new Map();
      if (lessonData.sections && lessonData.sections.length > 0) {
        for (const sec of lessonData.sections) {
          const createdSec = await prisma.lessonSection.create({
            data: {
              lessonId: createdLesson.id,
              title: sec.title,
              anchorId: sec.anchorId,
              order: sec.order,
            },
          });
          sectionMap.set(sec.anchorId, createdSec.id);
        }
      }

      // 3. Summary (الزتونة)
      if (lessonData.summary) {
        await prisma.lessonSummary.create({
          data: {
            lessonId: createdLesson.id,
            keyConcepts: lessonData.summary.keyConcepts || [],
            definitions: lessonData.summary.definitions || [],
            formulas: lessonData.summary.formulas || [],
            comparisons: lessonData.summary.comparisons || [],
            examTips: lessonData.summary.examTips || [],
            commonMistakes: lessonData.summary.commonMistakes || [],
            checklist: lessonData.summary.checklist || [],
          },
        });
      }

      // 4. MindMap
      if (lessonData.mindMap) {
        await prisma.mindMap.create({
          data: {
            lessonId: createdLesson.id,
            title: lessonData.mindMap.title,
            nodes: lessonData.mindMap.nodes || [],
            edges: lessonData.mindMap.edges || [],
          },
        });
      }

      // 5. Questions
      if (lessonData.questions && lessonData.questions.length > 0) {
        for (const q of lessonData.questions) {
          const createdQuestion = await prisma.question.create({
            data: {
              statement: q.statement,
              type: q.type,
              difficulty: q.difficulty,
              status: "PUBLISHED",
              subjectId: createdSubject.id,
              unitId: createdUnit.id,
              lessons: {
                create: { lessonId: createdLesson.id },
              },
              ...(q.options && q.options.length > 0
                ? {
                    options: {
                      create: q.options.map((opt, idx) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        order: idx + 1,
                        explanation: opt.explanation || null,
                      })),
                    },
                  }
                : {}),
              ...(q.explanation
                ? {
                    explanation: {
                      create: {
                        concept: q.explanation.concept,
                        correctReason: q.explanation.correctReason,
                        sectionId: q.explanation.sectionAnchor
                          ? sectionMap.get(q.explanation.sectionAnchor)
                          : undefined,
                      },
                    },
                  }
                : {}),
              ...(q.rubric
                ? {
                    rubric: {
                      create: {
                        maxScore: q.rubric.maxScore,
                        modelAnswer: q.rubric.modelAnswer,
                        criteria: q.rubric.criteria || [],
                      },
                    },
                  }
                : {}),
            },
          });
          allQuestionIds.push(createdQuestion.id);
        }
      }
    }
  }

  // Pre-built Exam
  if (allQuestionIds.length > 0) {
    await prisma.exam.create({
      data: {
        title: `امتحان شامل واسترشادي - ${createdSubject.name}`,
        description: `اختبار وزاري تدريبي شامل يغطي جميع وحدات ومفاهيم ${createdSubject.name} وفق معايير ونواتج تعلم وزارة التربية والتعليم لعام 2026.`,
        subjectId: createdSubject.id,
        durationMinutes: 30,
        isPractice: false,
        questions: {
          create: allQuestionIds.slice(0, 15).map((qId, idx) => ({
            questionId: qId,
            order: idx + 1,
          })),
        },
      },
    });
  }

  console.log(`✅ Seeded ${subjectData.name} with ${allQuestionIds.length} questions and pre-built exam.`);
  return createdSubject;
}

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

  // 2. Educational Systems
  const baccalaureate = await prisma.educationalSystem.create({
    data: {
      name: "البكالوريا المصرية (عربي ولغات)",
      code: "baccalaureate",
      description: "المسار التعليمي الحديث للبكالوريا المصرية المعتمد على المسارات التخصصية وعلوم الحاسب والبرمجة والذكاء الاصطناعي",
      order: 1,
    },
  });

  const thanaweya = await prisma.educationalSystem.create({
    data: {
      name: "الثانوية العامة المصرية",
      code: "thanaweya",
      description: "المسار التعليمي الرسمي للثانوية العامة المصرية بجميع شعبها",
      order: 2,
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

  // 4. Grades
  // Baccalaureate Grades
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

  // Thanaweya Grades
  const g10 = await prisma.grade.create({
    data: {
      name: "الصف الأول الثانوي (عام)",
      code: "g10",
      systemId: thanaweya.id,
      order: 1,
    },
  });

  const g11 = await prisma.grade.create({
    data: {
      name: "الصف الثاني الثانوي",
      code: "g11",
      systemId: thanaweya.id,
      order: 2,
    },
  });

  const g12 = await prisma.grade.create({
    data: {
      name: "الصف الثالث الثانوي",
      code: "g12",
      systemId: thanaweya.id,
      order: 3,
    },
  });

  // 5. Academic Tracks
  // Baccalaureate Tracks
  const baccG10GeneralTrack = await prisma.academicTrack.create({
    data: {
      name: "المسار المشترك (عام ولغات)",
      code: "general_track",
      gradeId: baccG10.id,
    },
  });

  const baccG11EngineeringTrack = await prisma.academicTrack.create({
    data: {
      name: "مسار الهندسة وعلوم الحاسب (Engineering & CS Track)",
      code: "engineering_track",
      gradeId: baccG11.id,
    },
  });

  const baccG11GeneralTrack = await prisma.academicTrack.create({
    data: {
      name: "المسار التكنولوجي العام",
      code: "tech_general",
      gradeId: baccG11.id,
    },
  });

  // Thanaweya Tracks
  const scienceTrack = await prisma.academicTrack.create({
    data: {
      name: "علمي (رياضة وعلوم)",
      code: "scientific",
      gradeId: g11.id,
    },
  });

  const literaryTrack = await prisma.academicTrack.create({
    data: {
      name: "أدبي",
      code: "literary",
      gradeId: g11.id,
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
      trackId: baccG11EngineeringTrack.id,
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
      trackId: baccG10GeneralTrack.id,
    },
  });

  console.log(`👤 Created users: Admin (${adminUser.email}), Student G11 (${studentUser.email}), Student G10 (${studentG10User.email})`);

  // 7. Seed Official Grade 10 Curriculum (أولى بكالوريا - عام ولغات)
  await seedCurriculumSubject({
    subjectData: baccG10Subject,
    systemId: baccalaureate.id,
    gradeId: baccG10.id,
    trackId: baccG10GeneralTrack.id,
  });

  // 8. Seed Official Grade 11 Engineering Curriculum (تانية بكالوريا - مسار الهندسة والحاسب)
  await seedCurriculumSubject({
    subjectData: baccG11EngineeringSubject,
    systemId: baccalaureate.id,
    gradeId: baccG11.id,
    trackId: baccG11EngineeringTrack.id,
  });

  // 9. Also seed a secondary track subject for Thanaweya G11
  const subCpp = await prisma.subject.create({
    data: {
      name: "تأسيس البرمجة ولغة C++",
      code: "cpp_programming",
      icon: "Terminal",
      color: "#6858EA",
      description: "مدخل شامل إلى التفكير الخوارزمي، هيكلية البرامج، المتغيرات، الدوال، وحل المشكلات بلغة C++.",
      systemId: thanaweya.id,
      gradeId: g11.id,
      trackId: scienceTrack.id,
      order: 1,
      isPublished: true,
    },
  });

  const unitCpp1 = await prisma.unit.create({
    data: {
      title: "الوحدة الأولى: أساسيات وهيكل لغة C++",
      order: 1,
      description: "المفاهيم التأسيسية، بيئة التطوير، دالة main، وجمل الإدخال والإخراج.",
      subjectId: subCpp.id,
      isPublished: true,
    },
  });

  const lessonCpp1 = await prisma.lesson.create({
    data: {
      title: "1. هيكل برنامج C++ ودالة main وجمل الإخراج",
      order: 1,
      unitId: unitCpp1.id,
      durationMinutes: 15,
      isPublished: true,
    },
  });

  await prisma.lessonContent.create({
    data: {
      lessonId: lessonCpp1.id,
      objectives: [
        "فهم البنية الأساسية لأي برنامج مكتوب بلغة C++.",
        "التعرف على دور المكتبة القياسية iostream واستخدام namespace std.",
        "إتقان استخدام كائن cout مع معامل الإخراج << والرمز endl.",
      ],
      body: `## مقدمة في لغة C++
لغة **C++** هي إحدى أقوى لغات البرمجة وأكثرها انتشاراً في العالم؛ نظراً لسرعتها الفائقة وتحكمها الدقيق في موارد الحاسوب والذاكرة.

### 1. البنية الهيكلية لأي كود C++
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "مرحباً بك في منصة الخلاصة!" << endl;
    return 0;
}
\`\`\`
`,
    },
  });

  await prisma.lessonSummary.create({
    data: {
      lessonId: lessonCpp1.id,
      keyConcepts: [
        "دالة main هي نقطة البداية الإجبارية لأي كود C++.",
        "كل جملة برمجية تنفيذية في C++ يجب أن تنتهي بفاصلة منقوطة (;).",
        "مكتبة iostream مسؤولة عن عمليات cout و cin.",
      ],
      definitions: [
        { term: "iostream", meaning: "مكتبة الإدخال والإخراج القياسية Standard Input / Output Stream." },
        { term: "cout", meaning: "كائن إخراج البيانات القياسي إلى شاشة الكونسول." },
      ],
      formulas: [
        { title: "جملة الطباعة الأساسية", code: "cout << \"النص\" << endl;" },
      ],
      comparisons: [
        {
          aspect: "endl مقابل \\n",
          first: "endl ينزل سطراً ويفصل الـ buffer",
          second: "\\n ينزل سطراً فقط كرمز خاص وأسرع أداءً",
        },
      ],
      examTips: [
        "اسم دالة main يكتب بأحرف صغيرة دائماً (case-sensitive).",
      ],
      commonMistakes: [
        "كتابة علامة الإدخال >> مع cout بدلاً من علامة الإخراج <<.",
      ],
      checklist: [
        "حفظت مكونات القالب الأساسي لملف C++",
      ],
    },
  });

  const qCpp1 = await prisma.question.create({
    data: {
      statement: "ما هي نقطة الانطلاق الإجبارية التي يبدأ منها تنفيذ أي برنامج مكتوب بلغة C++؟",
      type: "MCQ",
      difficulty: "EASY",
      status: "PUBLISHED",
      subjectId: subCpp.id,
      unitId: unitCpp1.id,
      lessons: {
        create: { lessonId: lessonCpp1.id },
      },
      options: {
        create: [
          { text: "الدالة start()", isCorrect: false, order: 1, explanation: "لا توجد دالة قياسية بهذا الاسم في لغة C++." },
          { text: "الدالة main()", isCorrect: true, order: 2, explanation: "صحيح! دالة main هي نقطة البداية المعيارية لتنفيذ الكود." },
          { text: "المكتبة #include <iostream>", isCorrect: false, order: 3, explanation: "هذا أمر معالج مسبق لتضمين المكتبة وليس دالة تنفيذية." },
          { text: "سطر using namespace std;", isCorrect: false, order: 4, explanation: "هذا توجيه لمجال الأسماء وليس نقطة بدء التنفيذ." },
        ],
      },
    },
  });

  await prisma.exam.create({
    data: {
      title: "امتحان تأسيسي - مبادئ لغة C++",
      description: "اختبار قياس الفهم العام لأساسيات وهيكل لغة C++ لطلاب الثانوية العامة.",
      subjectId: subCpp.id,
      durationMinutes: 15,
      isPractice: true,
      questions: {
        create: [{ questionId: qCpp1.id, order: 1 }],
      },
    },
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
