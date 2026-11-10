import fs from "node:fs";
import path from "node:path";
import { PrismaClient, PublishStatus, QuestionOrigin } from "@prisma/client";
import {
  buildArabicLessonBodyAndObjectives,
  normalizeArabicForDuplicateCheck,
  sanitizeArabicPayloadForStudent,
  validateAndAdaptArabicLessonJson,
} from "../src/lib/arabic-curriculum.ts";

const prisma = new PrismaClient();

async function syncOptions(tx, questionId, incomingOptions) {
  const existing = await tx.questionOption.findMany({
    where: { questionId },
    orderBy: { order: "asc" },
  });

  for (let i = 0; i < incomingOptions.length; i++) {
    const opt = incomingOptions[i];
    const current = existing[i];
    if (current) {
      await tx.questionOption.update({
        where: { id: current.id },
        data: { text: opt.text, isCorrect: opt.isCorrect, order: i + 1 },
      });
    } else {
      await tx.questionOption.create({
        data: { questionId, text: opt.text, isCorrect: opt.isCorrect, order: i + 1 },
      });
    }
  }

  if (existing.length > incomingOptions.length) {
    await tx.questionOption.deleteMany({
      where: { id: { in: existing.slice(incomingOptions.length).map((o) => o.id) } },
    });
  }
}

async function main() {
  const booksDir = path.resolve(process.cwd(), "books");
  const jsonFileName = fs
    .readdirSync(booksDir)
    .find((f) => f.endsWith(".json") && !f.startsWith("Kholasa"));
  if (!jsonFileName) {
    throw new Error("Arabic lesson JSON file not found in books/ directory.");
  }

  const rawJson = JSON.parse(
    fs.readFileSync(path.join(booksDir, jsonFileName), "utf8")
  );
  const { payload, report } = validateAndAdaptArabicLessonJson(rawJson);

  if (!report.valid || !payload) {
    throw new Error(`Invalid Arabic curriculum JSON: ${report.errors.join(" | ")}`);
  }

  const system = await prisma.educationalSystem.findUnique({
    where: { code: "baccalaureate" },
  });
  if (!system) {
    throw new Error("EducationalSystem 'baccalaureate' not found.");
  }

  const grade = await prisma.grade.findFirst({
    where: { systemId: system.id, code: "bacc_g11" },
  });
  if (!grade) {
    throw new Error("Grade 'bacc_g11' (Second Baccalaureate) not found.");
  }

  // Idempotently upsert the dedicated common Arabic subject (ZERO touch on Programming subjects)
  const subject = await prisma.subject.upsert({
    where: {
      gradeId_schoolCategory_code: {
        gradeId: grade.id,
        schoolCategory: "ARABIC",
        code: "ARABIC_G11",
      },
    },
    update: {
      name: payload.education.subject,
      isCommonCategory: true,
      isUnderConstruction: true,
      learningEngine: "ARABIC_GUIDED",
      trackId: null,
      isPublished: true,
      description:
        "منهج اللغة العربية للثاني الثانوي (تانية بكالوريا) — مادة عامة لجميع المسارات (تحت الإنشاء: الدرس الأول متاح للمراجعة).",
    },
    create: {
      id: "bacc_g11_arabic",
      name: payload.education.subject,
      code: "ARABIC_G11",
      icon: "BookOpen",
      color: "#800B34",
      description:
        "منهج اللغة العربية للثاني الثانوي (تانية بكالوريا) — مادة عامة لجميع المسارات (تحت الإنشاء: الدرس الأول متاح للمراجعة).",
      systemId: system.id,
      gradeId: grade.id,
      trackId: null,
      schoolCategory: "ARABIC",
      isCommonCategory: true,
      isUnderConstruction: true,
      learningEngine: "ARABIC_GUIDED",
      isElective: false,
      order: 99,
      isPublished: true,
    },
  });

  // Upsert Unit 1
  let unit = await prisma.unit.findFirst({
    where: { subjectId: subject.id, order: payload.education.unit.number },
  });
  if (unit) {
    unit = await prisma.unit.update({
      where: { id: unit.id },
      data: { title: payload.education.unit.title, isPublished: true },
    });
  } else {
    unit = await prisma.unit.create({
      data: {
        subjectId: subject.id,
        order: payload.education.unit.number,
        title: payload.education.unit.title,
        description: "الوحدة الأولى: العلم والضمير — النصوص المعلوماتية والقواعد والأساليب",
        isPublished: true,
      },
    });
  }

  // Upsert Lesson 1
  let lesson = await prisma.lesson.findFirst({
    where: { unitId: unit.id, order: payload.education.lesson.number },
  });
  if (lesson) {
    lesson = await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        title: payload.education.lesson.title,
        isPublished: true,
        isTrial: true,
      },
    });
  } else {
    lesson = await prisma.lesson.create({
      data: {
        unitId: unit.id,
        order: payload.education.lesson.number,
        title: payload.education.lesson.title,
        durationMinutes: 35,
        isPublished: true,
        isTrial: true,
      },
    });
  }

  // Skip overwriting if admin already published version > 1
  const existingPublishedVersion = await prisma.lessonContentVersion.findFirst({
    where: { lessonId: lesson.id, status: PublishStatus.PUBLISHED },
    orderBy: { versionNumber: "desc" },
  });
  if (existingPublishedVersion && existingPublishedVersion.versionNumber > 1) {
    console.log(
      JSON.stringify({
        status: "skipped_content_newer_version_published",
        subjectId: subject.id,
        lessonId: lesson.id,
        publishedVersionNumber: existingPublishedVersion.versionNumber,
      })
    );
    return;
  }

  const { body, objectives, mindMapNodes, mindMapEdges } =
    buildArabicLessonBodyAndObjectives(payload);
  const studentSafePayload = sanitizeArabicPayloadForStudent(payload);

  const summaryStats = await prisma.$transaction(
    async (tx) => {
      await tx.lessonContentVersion.upsert({
        where: {
          lessonId_versionNumber: { lessonId: lesson.id, versionNumber: 1 },
        },
        update: {
          status: PublishStatus.PUBLISHED,
          body,
          objectives,
          structuredData: payload,
          validationReport: report,
          publishedAt: new Date(),
        },
        create: {
          lessonId: lesson.id,
          versionNumber: 1,
          status: PublishStatus.PUBLISHED,
          body,
          objectives,
          structuredData: payload,
          validationReport: report,
          notes: "الاستيراد الرسمي الأول للوحدة الأولى - الدرس الأول (العلم بين القانون والضمير)",
          publishedAt: new Date(),
        },
      });

      await tx.lessonContent.upsert({
        where: { lessonId: lesson.id },
        update: { body, objectives, structuredData: studentSafePayload },
        create: { lessonId: lesson.id, body, objectives, structuredData: studentSafePayload },
      });

      await tx.mindMap.upsert({
        where: { lessonId: lesson.id },
        update: {
          title: `خريطة ${payload.education.lesson.title}`,
          nodes: mindMapNodes,
          edges: mindMapEdges,
        },
        create: {
          lessonId: lesson.id,
          title: `خريطة ${payload.education.lesson.title}`,
          nodes: mindMapNodes,
          edges: mindMapEdges,
        },
      });

      const allKeywords = Array.from(new Set(payload.sections.flatMap((s) => s.keywords || [])));
      const allTips = Array.from(
        new Set(payload.sections.flatMap((s) => s.examSolvingMethod || []))
      );
      const allTraps = Array.from(new Set(payload.sections.flatMap((s) => s.commonTraps || [])));

      await tx.lessonSummary.upsert({
        where: { lessonId: lesson.id },
        update: {
          keyConcepts: allKeywords,
          examTips: allTips,
          commonMistakes: allTraps,
          checklist: payload.studentQuickReference?.fiveRules || [],
        },
        create: {
          lessonId: lesson.id,
          keyConcepts: allKeywords,
          examTips: allTips,
          commonMistakes: allTraps,
          checklist: payload.studentQuickReference?.fiveRules || [],
        },
      });

      const sectionIdMap = new Map();
      for (const sec of payload.sections) {
        const savedSec = await tx.lessonSection.upsert({
          where: { lessonId_anchorId: { lessonId: lesson.id, anchorId: sec.id } },
          update: { title: sec.title, order: sec.order },
          create: {
            lessonId: lesson.id,
            anchorId: sec.id,
            title: sec.title,
            order: sec.order,
          },
        });
        sectionIdMap.set(sec.id, savedSec.id);
      }

      const existingQuestions = await tx.question.findMany({
        where: { subjectId: subject.id },
        select: { id: true, externalKey: true, statement: true },
      });
      const existingByKey = new Map(
        existingQuestions.filter((q) => q.externalKey).map((q) => [q.externalKey, q.id])
      );
      const existingByStmt = new Map(
        existingQuestions.map((q) => [normalizeArabicForDuplicateCheck(q.statement), q.id])
      );

      let syncedQuestions = 0;
      for (const q of payload.questions || []) {
        const dbSectionId = sectionIdMap.get(q.sectionId) || null;
        const existingId =
          existingByKey.get(q.jsonId) ||
          existingByStmt.get(normalizeArabicForDuplicateCheck(q.statement));
        const originEnum = QuestionOrigin[q.originEnum] || QuestionOrigin.KHOLASA_ORIGINAL;

        let questionId;
        if (existingId) {
          await tx.question.update({
            where: { id: existingId },
            data: {
              statement: q.statement,
              type: q.type || "MCQ",
              difficulty: q.difficulty || "MEDIUM",
              status: PublishStatus.PUBLISHED,
              unitId: unit.id,
              schoolCategory: "ARABIC",
              externalKey: q.jsonId,
              origin: originEnum,
              skillCategory: q.skillCategory,
              sourceReferences: q.sourceReferences || undefined,
            },
          });
          questionId = existingId;
        } else {
          const created = await tx.question.create({
            data: {
              statement: q.statement,
              type: q.type || "MCQ",
              difficulty: q.difficulty || "MEDIUM",
              status: PublishStatus.PUBLISHED,
              subjectId: subject.id,
              unitId: unit.id,
              schoolCategory: "ARABIC",
              externalKey: q.jsonId,
              origin: originEnum,
              skillCategory: q.skillCategory,
              sourceReferences: q.sourceReferences || undefined,
            },
          });
          questionId = created.id;
          existingByKey.set(q.jsonId, questionId);
        }

        await tx.questionLesson.upsert({
          where: { questionId_lessonId: { questionId, lessonId: lesson.id } },
          update: {},
          create: { questionId, lessonId: lesson.id },
        });

        if ((q.type === "MCQ" || q.type === "TRUE_FALSE") && q.options) {
          await syncOptions(tx, questionId, q.options);
        }

        if (q.explanation || q.examTrick || q.concept) {
          await tx.questionExplanation.upsert({
            where: { questionId },
            update: {
              concept: q.concept || "تحليل السؤال",
              correctReason: q.explanation || "",
              examTrick: q.examTrick || null,
              origin: q.rawOrigin || null,
              sectionId: dbSectionId,
            },
            create: {
              questionId,
              concept: q.concept || "تحليل السؤال",
              correctReason: q.explanation || "",
              examTrick: q.examTrick || null,
              origin: q.rawOrigin || null,
              sectionId: dbSectionId,
            },
          });
        }

        if (q.type === "ESSAY" && q.modelAnswer) {
          await tx.essayRubric.upsert({
            where: { questionId },
            update: { modelAnswer: q.modelAnswer, maxScore: q.points || 10 },
            create: { questionId, modelAnswer: q.modelAnswer, maxScore: q.points || 10 },
          });
        }

        syncedQuestions++;
      }

      return {
        sectionsSynced: payload.sections.length,
        questionsSynced,
      };
    },
    { maxWait: 15000, timeout: 60000 }
  );

  console.log(
    JSON.stringify({
      status: "ok",
      subjectId: subject.id,
      unitId: unit.id,
      lessonId: lesson.id,
      ...summaryStats,
    })
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
