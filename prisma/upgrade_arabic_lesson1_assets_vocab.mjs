import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  sanitizeArabicPayloadForStudent,
  validateAndAdaptArabicLessonJson,
} from "../src/lib/arabic-curriculum.ts";

const prisma = new PrismaClient();

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

  const lesson = await prisma.lesson.findFirst({
    where: {
      order: 1,
      unit: {
        order: 1,
        subject: {
          learningEngine: "ARABIC_GUIDED",
        },
      },
    },
    include: {
      content: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!lesson) {
    throw new Error("Target ARABIC_GUIDED Unit 1 Lesson 1 not found in database.");
  }

  const questionsBefore = await prisma.questionLesson.findMany({
    where: { lessonId: lesson.id },
    select: { questionId: true },
    orderBy: { questionId: "asc" },
  });

  const existingStructured =
    (lesson.versions[0]?.structuredData &&
    typeof lesson.versions[0].structuredData === "object"
      ? lesson.versions[0].structuredData
      : lesson.content?.structuredData &&
        typeof lesson.content.structuredData === "object"
      ? lesson.content.structuredData
      : {}) || {};

  const existingAssets = Array.isArray(existingStructured.visualAssets)
    ? existingStructured.visualAssets
    : [];

  const mergedVisualAssets = payload.visualAssets.map((incoming) => {
    const match = existingAssets.find((a) => a.assetKey === incoming.assetKey);
    return match && match.imageUrl
      ? { ...incoming, imageUrl: match.imageUrl, status: "uploaded" }
      : incoming;
  });

  const mergedVocab = payload.vocabularyItems;

  const existingSections = Array.isArray(existingStructured.sections)
    ? existingStructured.sections
    : payload.sections;

  const patchedSections = existingSections.map((sec) => {
    if (sec.id !== "u1-l1-s05") return sec;
    const adaptedS05 = payload.sections.find((s) => s.id === "u1-l1-s05");
    if (!adaptedS05) return sec;
    return {
      ...sec,
      visualization: adaptedS05.visualization,
      blocks: sec.blocks.map((b) =>
        b.type === "vocabulary"
          ? {
              ...b,
              payload: {
                ...b.payload,
                cards: mergedVocab,
              },
            }
          : b
      ),
    };
  });

  const upgradedAdminPayload = {
    ...payload,
    ...existingStructured,
    sections: patchedSections,
    visualAssets: mergedVisualAssets,
    vocabularyItems: mergedVocab,
  };

  const upgradedStudentPayload = sanitizeArabicPayloadForStudent(upgradedAdminPayload);

  await prisma.$transaction(async (tx) => {
    await tx.lessonContent.update({
      where: { lessonId: lesson.id },
      data: {
        structuredData: upgradedStudentPayload,
      },
    });

    if (lesson.versions[0]) {
      await tx.lessonContentVersion.update({
        where: { id: lesson.versions[0].id },
        data: {
          structuredData: upgradedAdminPayload,
        },
      });
    }
  });

  const questionsAfter = await prisma.questionLesson.findMany({
    where: { lessonId: lesson.id },
    select: { questionId: true },
    orderBy: { questionId: "asc" },
  });

  const beforeIds = questionsBefore.map((q) => q.questionId).join(",");
  const afterIds = questionsAfter.map((q) => q.questionId).join(",");

  if (beforeIds !== afterIds) {
    throw new Error("Question IDs changed unexpectedly during non-destructive upgrade!");
  }

  console.log(
    JSON.stringify(
      {
        status: "upgraded_non_destructively",
        lessonId: lesson.id,
        title: lesson.title,
        preservedQuestionCount: questionsAfter.length,
        sectionsCount: patchedSections.length,
        visualAssetsCount: mergedVisualAssets.length,
        vocabularyCount: mergedVocab.length,
        latestVersionId: lesson.versions[0]?.id || null,
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

