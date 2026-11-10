import { prisma } from "@/lib/prisma";
import { Prisma, PublishStatus, QuestionOrigin } from "@prisma/client";
import { badRequest, forbidden, notFound } from "@/lib/http";
import { canUserAccessLesson, type LessonAccessUser } from "@/lib/lesson-access";
import { AnalyticsService } from "@/services/analytics.service";
import {
  buildArabicLessonBodyAndObjectives,
  normalizeArabicForDuplicateCheck,
  sanitizeArabicPayloadForStudent,
  validateAndAdaptArabicLessonJson,
  type ArabicLessonPayloadV1,
  type ArabicNormalizedQuestion,
} from "@/lib/arabic-curriculum";

function toJsonValue(val: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(val)) as Prisma.InputJsonValue;
}

async function assertArabicLessonTarget(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      unit: {
        include: {
          subject: true,
        },
      },
      content: true,
    },
  });
  if (!lesson) {
    throw notFound("الدرس المحدد غير موجود");
  }
  if (lesson.unit.subject.learningEngine !== "ARABIC_GUIDED") {
    throw badRequest(
      "هذا الدرس لا ينتمي لمادة اللغة العربية المفعّلة بمحرك العربية المتخصص (ARABIC_GUIDED)."
    );
  }
  return lesson;
}

async function syncQuestionOptionsInTx(
  tx: Prisma.TransactionClient,
  questionId: string,
  incomingOptions: Array<{ text: string; isCorrect: boolean }>
) {
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
        data: {
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: i + 1,
        },
      });
    } else {
      await tx.questionOption.create({
        data: {
          questionId,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: i + 1,
        },
      });
    }
  }

  if (existing.length > incomingOptions.length) {
    const extraIds = existing.slice(incomingOptions.length).map((o) => o.id);
    await tx.questionOption.deleteMany({
      where: { id: { in: extraIds } },
    });
  }
}

export class ArabicCurriculumService {
  /**
   * Fetch student's per-section Arabic learning progress & last visited section for Resume Learning.
   */
  static async getStudentSectionProgress(userId: string, lessonId: string) {
    return prisma.studentSectionProgress.findMany({
      where: { userId, lessonId },
      orderBy: { lastVisitedAt: "desc" },
    });
  }

  /**
   * Persist per-section completion, current stage, or interactive scratch state,
   * and sync aggregate lesson progress without duplicating Progress tables.
   */
  static async upsertStudentSectionProgress(
    user: LessonAccessUser & { id: string },
    lessonId: string,
    input: {
      sectionAnchorId: string;
      stageId: string;
      isCompleted?: boolean;
      state?: Record<string, unknown> | null;
    }
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: {
          include: {
            subject: {
              select: {
                id: true,
                gradeId: true,
                trackId: true,
                schoolCategory: true,
                isCommonCategory: true,
                learningEngine: true,
                isPublished: true,
              },
            },
          },
        },
        sections: { select: { anchorId: true } },
      },
    });

    if (!lesson || !lesson.isPublished || !lesson.unit.isPublished || !lesson.unit.subject.isPublished) {
      throw notFound("الدرس غير موجود");
    }

    const access = canUserAccessLesson(user, lesson);
    if (!access.allowed) {
      if (access.reason === "OUT_OF_SCOPE") {
        throw notFound("الدرس غير متاح في مسارك الدراسي");
      }
      throw forbidden("يلزم تفعيل الاشتراك للوصول إلى هذا الدرس");
    }

    const saved = await prisma.studentSectionProgress.upsert({
      where: {
        userId_lessonId_sectionAnchorId: {
          userId: user.id,
          lessonId,
          sectionAnchorId: input.sectionAnchorId,
        },
      },
      update: {
        stageId: input.stageId,
        lastVisitedAt: new Date(),
        ...(input.isCompleted !== undefined ? { isCompleted: Boolean(input.isCompleted) } : {}),
        ...(input.state !== undefined
          ? { state: input.state === null ? Prisma.DbNull : toJsonValue(input.state) }
          : {}),
      },
      create: {
        userId: user.id,
        lessonId,
        sectionAnchorId: input.sectionAnchorId,
        stageId: input.stageId,
        isCompleted: Boolean(input.isCompleted),
        lastVisitedAt: new Date(),
        ...(input.state !== undefined && input.state !== null
          ? { state: toJsonValue(input.state) }
          : {}),
      },
    });

    // Recompute aggregate lesson progress cleanly from section completions
    const totalSections = Math.max(1, lesson.sections.length);
    const completedSections = await prisma.studentSectionProgress.count({
      where: { userId: user.id, lessonId, isCompleted: true },
    });
    const computedPercent = Math.min(100, Math.round((completedSections / totalSections) * 100));

    const existingLessonProgress = await prisma.studentProgress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId } },
    });

    const isLessonCompleted = existingLessonProgress?.isCompleted || computedPercent >= 100;
    const finalPercent = isLessonCompleted
      ? 100
      : Math.max(existingLessonProgress?.progressPercent || 0, computedPercent);

    await prisma.studentProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: {
        progressPercent: finalPercent,
        isCompleted: isLessonCompleted,
        lastAccessedAt: new Date(),
      },
      create: {
        userId: user.id,
        lessonId,
        progressPercent: finalPercent,
        isCompleted: isLessonCompleted,
      },
    });

    return { sectionProgress: saved, progressPercent: finalPercent, isLessonCompleted };
  }

  /**
   * Admin Workspace: Fetch all Arabic-guided subjects with units, lessons, and version history.
   */
  static async getAdminArabicWorkspace() {
    const subjects = await prisma.subject.findMany({
      where: { learningEngine: "ARABIC_GUIDED" },
      orderBy: [{ grade: { order: "asc" } }, { order: "asc" }],
      include: {
        grade: { select: { id: true, name: true, code: true } },
        system: { select: { id: true, name: true, code: true } },
        units: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                content: { select: { id: true, structuredData: true } },
                versions: {
                  orderBy: { versionNumber: "desc" },
                  select: {
                    id: true,
                    versionNumber: true,
                    status: true,
                    notes: true,
                    createdAt: true,
                    publishedAt: true,
                    validationReport: true,
                    structuredData: true,
                    createdBy: { select: { id: true, name: true } },
                  },
                },
                _count: { select: { sections: true, questions: true } },
              },
            },
          },
        },
      },
    });

    return { subjects };
  }

  /**
   * Preview + validate an Arabic lesson JSON without modifying the database.
   * Checks duplicate question IDs/statements both inside the JSON and against existing DB rows.
   */
  static async previewJsonImport(rawJson: unknown, targetLessonId?: string) {
    const { payload, report } = validateAndAdaptArabicLessonJson(rawJson);

    const dbCheck: {
      targetLessonTitle: string | null;
      existingMatchedByKey: number;
      duplicateStatementsInOtherLessons: Array<{ jsonId: string; existingQuestionId: string; statement: string }>;
      newQuestionsCount: number;
    } = {
      targetLessonTitle: null,
      existingMatchedByKey: 0,
      duplicateStatementsInOtherLessons: [],
      newQuestionsCount: payload?.questions?.length || 0,
    };

    if (targetLessonId) {
      const lesson = await assertArabicLessonTarget(targetLessonId);
      dbCheck.targetLessonTitle = lesson.title;

      if (payload?.questions && payload.questions.length > 0) {
        const subjectId = lesson.unit.subjectId;
        const existingQuestions = await prisma.question.findMany({
          where: { subjectId },
          select: {
            id: true,
            externalKey: true,
            statement: true,
            lessons: { select: { lessonId: true } },
          },
        });

        const byExternalKey = new Map(
          existingQuestions.filter((q) => q.externalKey).map((q) => [q.externalKey!, q])
        );
        const byNormStmt = new Map(
          existingQuestions.map((q) => [normalizeArabicForDuplicateCheck(q.statement), q])
        );

        let matched = 0;
        for (const inc of payload.questions) {
          const matchedKey = byExternalKey.get(inc.jsonId);
          if (matchedKey) {
            matched++;
            continue;
          }
          const matchedStmt = byNormStmt.get(normalizeArabicForDuplicateCheck(inc.statement));
          if (matchedStmt) {
            const belongsToSameLesson = matchedStmt.lessons.some((l) => l.lessonId === targetLessonId);
            if (belongsToSameLesson) {
              matched++;
            } else {
              dbCheck.duplicateStatementsInOtherLessons.push({
                jsonId: inc.jsonId,
                existingQuestionId: matchedStmt.id,
                statement: inc.statement.slice(0, 80),
              });
              report.warnings.push(
                `السؤال ${inc.jsonId} متكرر نصًا في درس آخر داخل نفس المادة (ID: ${matchedStmt.id}).`
              );
            }
          }
        }
        dbCheck.existingMatchedByKey = matched;
        dbCheck.newQuestionsCount = Math.max(0, payload.questions.length - matched);
      }
    }

    return { payload, report, dbCheck };
  }

  /**
   * Save a validated JSON payload as a non-destructive DRAFT version on LessonContentVersion.
   * Does not alter live published LessonContent or student views.
   */
  static async saveDraftVersion(
    adminUserId: string,
    lessonId: string,
    rawJson: unknown,
    notes?: string
  ) {
    await assertArabicLessonTarget(lessonId);

    const { payload, report } = validateAndAdaptArabicLessonJson(rawJson);
    if (!report.valid || !payload) {
      throw badRequest(
        `فشل التحقق من ملف JSON: ${report.errors.slice(0, 4).join(" | ")}`
      );
    }

    const { body, objectives } = buildArabicLessonBodyAndObjectives(payload);

    const draft = await prisma.$transaction(async (tx) => {
      const agg = await tx.lessonContentVersion.aggregate({
        where: { lessonId },
        _max: { versionNumber: true },
      });
      const nextVersionNumber = (agg._max.versionNumber || 0) + 1;

      return tx.lessonContentVersion.create({
        data: {
          lessonId,
          versionNumber: nextVersionNumber,
          status: PublishStatus.DRAFT,
          body,
          objectives,
          structuredData: toJsonValue(payload),
          validationReport: toJsonValue(report),
          notes: notes?.trim() || null,
          createdById: adminUserId,
        },
      });
    });

    await AnalyticsService.logAuditAction(adminUserId, "CREATE_DRAFT", "LessonContentVersion", draft.id, {
      lessonId,
      versionNumber: draft.versionNumber,
      questionsCount: report.summary.questionsCount,
    });

    return { version: draft, report };
  }

  /**
   * Promote an existing LessonContentVersion (Draft or Archived) to PUBLISHED inside a transaction.
   * Updates live LessonContent (sanitized against answer leakage), MindMap, LessonSummary,
   * LessonSections, and syncs Question bank entries without creating duplicates.
   */
  static async publishLessonVersion(adminUserId: string, lessonId: string, versionId: string) {
    const lesson = await assertArabicLessonTarget(lessonId);

    const targetVersion = await prisma.lessonContentVersion.findFirst({
      where: { id: versionId, lessonId },
    });
    if (!targetVersion) {
      throw notFound("الإصدار المحدد غير موجود لهذا الدرس");
    }

    const { payload, report } = validateAndAdaptArabicLessonJson(targetVersion.structuredData);
    if (!report.valid || !payload) {
      throw badRequest(
        `لا يمكن نشر هذا الإصدار لوجود أخطاء هيكلية: ${report.errors.slice(0, 4).join(" | ")}`
      );
    }

    const { body, objectives, mindMapNodes, mindMapEdges } =
      buildArabicLessonBodyAndObjectives(payload);
    const studentSafePayload = sanitizeArabicPayloadForStudent(payload);

    const result = await prisma.$transaction(
      async (tx) => {
        await tx.lessonContentVersion.updateMany({
          where: { lessonId, status: PublishStatus.PUBLISHED },
          data: { status: PublishStatus.ARCHIVED },
        });

        const publishedVersion = await tx.lessonContentVersion.update({
          where: { id: targetVersion.id },
          data: {
            status: PublishStatus.PUBLISHED,
            publishedAt: new Date(),
            body,
            objectives,
            validationReport: toJsonValue(report),
          },
        });

        await tx.lesson.update({
          where: { id: lessonId },
          data: { title: payload.education.lesson.title },
        });

        await tx.lessonContent.upsert({
          where: { lessonId },
          update: {
            body,
            objectives,
            structuredData: toJsonValue(studentSafePayload),
          },
          create: {
            lessonId,
            body,
            objectives,
            structuredData: toJsonValue(studentSafePayload),
          },
        });

        await tx.mindMap.upsert({
          where: { lessonId },
          update: {
            title: `خريطة ${payload.education.lesson.title}`,
            nodes: toJsonValue(mindMapNodes),
            edges: toJsonValue(mindMapEdges),
          },
          create: {
            lessonId,
            title: `خريطة ${payload.education.lesson.title}`,
            nodes: toJsonValue(mindMapNodes),
            edges: toJsonValue(mindMapEdges),
          },
        });

        const allKeywords = Array.from(
          new Set(payload.sections.flatMap((s) => s.keywords || []))
        );
        const allTips = Array.from(
          new Set(payload.sections.flatMap((s) => s.examSolvingMethod || []))
        );
        const allTraps = Array.from(
          new Set(payload.sections.flatMap((s) => s.commonTraps || []))
        );

        await tx.lessonSummary.upsert({
          where: { lessonId },
          update: {
            keyConcepts: toJsonValue(allKeywords),
            examTips: toJsonValue(allTips),
            commonMistakes: toJsonValue(allTraps),
            checklist: toJsonValue(payload.studentQuickReference?.fiveRules || []),
          },
          create: {
            lessonId,
            keyConcepts: toJsonValue(allKeywords),
            examTips: toJsonValue(allTips),
            commonMistakes: toJsonValue(allTraps),
            checklist: toJsonValue(payload.studentQuickReference?.fiveRules || []),
          },
        });

        // Upsert LessonSections and collect DB section map
        const sectionIdMap = new Map<string, string>();
        for (const sec of payload.sections) {
          const upsertedSection = await tx.lessonSection.upsert({
            where: { lessonId_anchorId: { lessonId, anchorId: sec.id } },
            update: { title: sec.title, order: sec.order },
            create: {
              lessonId,
              anchorId: sec.id,
              title: sec.title,
              order: sec.order,
            },
          });
          sectionIdMap.set(sec.id, upsertedSection.id);
        }

        // Sync Questions safely without duplicates
        const subjectId = lesson.unit.subjectId;
        const schoolCategory = lesson.unit.subject.schoolCategory;
        const unitId = lesson.unitId;

        const existingQuestions = await tx.question.findMany({
          where: { subjectId },
          select: { id: true, externalKey: true, statement: true },
        });
        const existingByKey = new Map(
          existingQuestions.filter((q) => q.externalKey).map((q) => [q.externalKey!, q.id])
        );
        const existingByStmt = new Map(
          existingQuestions.map((q) => [normalizeArabicForDuplicateCheck(q.statement), q.id])
        );

        let syncedQuestionsCount = 0;
        const incomingQuestions: ArabicNormalizedQuestion[] = payload.questions || [];

        for (const q of incomingQuestions) {
          const dbSectionId = sectionIdMap.get(q.sectionId) || null;
          const existingId =
            existingByKey.get(q.jsonId) ||
            existingByStmt.get(normalizeArabicForDuplicateCheck(q.statement));

          let questionId: string;
          const originEnum = q.originEnum as QuestionOrigin;

          if (existingId) {
            await tx.question.update({
              where: { id: existingId },
              data: {
                statement: q.statement,
                type: q.type || "MCQ",
                difficulty: q.difficulty || "MEDIUM",
                status: PublishStatus.PUBLISHED,
                unitId,
                schoolCategory,
                externalKey: q.jsonId,
                origin: originEnum,
                skillCategory: q.skillCategory,
                sourceReferences: q.sourceReferences
                  ? toJsonValue(q.sourceReferences)
                  : Prisma.DbNull,
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
                subjectId,
                unitId,
                schoolCategory,
                externalKey: q.jsonId,
                origin: originEnum,
                skillCategory: q.skillCategory,
                sourceReferences: q.sourceReferences
                  ? toJsonValue(q.sourceReferences)
                  : undefined,
              },
            });
            questionId = created.id;
            existingByKey.set(q.jsonId, questionId);
          }

          await tx.questionLesson.upsert({
            where: { questionId_lessonId: { questionId, lessonId } },
            update: {},
            create: { questionId, lessonId },
          });

          if ((q.type === "MCQ" || q.type === "TRUE_FALSE") && q.options) {
            await syncQuestionOptionsInTx(tx, questionId, q.options);
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
              update: {
                modelAnswer: q.modelAnswer,
                maxScore: q.points || 10,
              },
              create: {
                questionId,
                modelAnswer: q.modelAnswer,
                maxScore: q.points || 10,
              },
            });
          }

          syncedQuestionsCount++;
        }

        return {
          publishedVersion,
          syncedSectionsCount: payload.sections.length,
          syncedQuestionsCount,
        };
      },
      { maxWait: 15000, timeout: 60000 }
    );

    await AnalyticsService.logAuditAction(adminUserId, "PUBLISH_VERSION", "LessonContentVersion", versionId, {
      lessonId,
      versionNumber: result.publishedVersion.versionNumber,
      syncedSections: result.syncedSectionsCount,
      syncedQuestions: result.syncedQuestionsCount,
    });

    return result;
  }

  /**
   * Rollback to a previous LessonContentVersion cleanly via the same verified publish pipeline.
   */
  static async rollbackLessonVersion(
    adminUserId: string,
    lessonId: string,
    targetVersionId: string
  ) {
    const version = await prisma.lessonContentVersion.findFirst({
      where: { id: targetVersionId, lessonId },
    });
    if (!version) {
      throw notFound("الإصدار المستهدف للاسترجاع غير موجود");
    }
    const published = await this.publishLessonVersion(adminUserId, lessonId, targetVersionId);
    await AnalyticsService.logAuditAction(adminUserId, "ROLLBACK_VERSION", "LessonContentVersion", targetVersionId, {
      lessonId,
      restoredVersionNumber: version.versionNumber,
    });
    return published;
  }
}
