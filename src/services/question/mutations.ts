import { prisma } from "@/lib/prisma";
import { QuestionType, Difficulty, PublishStatus, Prisma } from "@prisma/client";
import type { QuestionCreateInput, QuestionUpdateInput, ParsedQuestionImportItem, BulkImportMeta } from "./types";
import { QuestionQueriesService } from "./queries";
import {
  QuestionValidationError,
  assertCurriculumLinks,
  isDifficulty,
  isQuestionType,
  normalizeStatement,
  validateQuestionShape,
} from "./validation";

/** Maximum questions accepted by a single bulk import request. */
const MAX_BULK_QUESTIONS = 1000;

/**
 * Prisma interactive transactions time out after 5s by default, which is not
 * enough for large imports with nested creates.
 */
const BULK_TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 120_000 } as const;

interface ExistingOption {
  id: string;
  text: string;
}

interface IncomingOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  order?: number;
  explanation?: string | null;
}

/**
 * Synchronizes question options in place so existing option ids are preserved.
 * StudentAnswer.selectedOptionId has no foreign key, so recreating options with
 * new ids would silently orphan every previous student answer.
 * Matching order: explicit id, identical normalized text, then leftover position.
 */
async function syncOptions(
  tx: Prisma.TransactionClient,
  questionId: string,
  existing: ExistingOption[],
  incoming: IncomingOption[]
): Promise<void> {
  const unmatched = [...existing];
  const matchedIds: (string | null)[] = incoming.map(() => null);

  incoming.forEach((opt, i) => {
    if (!opt.id) return;
    const idx = unmatched.findIndex((e) => e.id === opt.id);
    if (idx >= 0) matchedIds[i] = unmatched.splice(idx, 1)[0].id;
  });

  incoming.forEach((opt, i) => {
    if (matchedIds[i]) return;
    const key = normalizeStatement(opt.text);
    const idx = unmatched.findIndex((e) => normalizeStatement(e.text) === key);
    if (idx >= 0) matchedIds[i] = unmatched.splice(idx, 1)[0].id;
  });

  incoming.forEach((_, i) => {
    if (matchedIds[i]) return;
    const leftover = unmatched.shift();
    if (leftover) matchedIds[i] = leftover.id;
  });

  for (let i = 0; i < incoming.length; i++) {
    const opt = incoming[i];
    const data = {
      text: opt.text.trim(),
      isCorrect: Boolean(opt.isCorrect),
      order: opt.order ?? i + 1,
      explanation: opt.explanation?.trim() || null,
    };
    const matchedId = matchedIds[i];
    if (matchedId) {
      await tx.questionOption.update({ where: { id: matchedId }, data });
    } else {
      await tx.questionOption.create({ data: { ...data, questionId } });
    }
  }

  if (unmatched.length > 0) {
    await tx.questionOption.deleteMany({ where: { id: { in: unmatched.map((o) => o.id) } } });
  }
}

function filledOptions<T extends { text: string }>(options: T[] | undefined | null): T[] {
  return (options ?? []).filter((o) => typeof o?.text === "string" && o.text.trim().length > 0);
}

export class QuestionMutationsService {
  /**
   * Create a new question with attached options, explanation, or ideal essay model answer.
   * The school category is always derived from the subject so the Arabic and
   * Languages banks can never be mixed by a client-supplied value.
   */
  static async createQuestion(data: QuestionCreateInput) {
    const type = data.type ?? QuestionType.MCQ;
    const options = filledOptions(data.options);

    const errors = validateQuestionShape({
      statement: data.statement,
      type,
      difficulty: data.difficulty,
      options,
    });
    if (errors.length > 0) throw new QuestionValidationError(errors.join("، "));

    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { id: true, schoolCategory: true },
    });
    if (!subject) throw new QuestionValidationError("المادة الدراسية غير موجودة", 404);

    await assertCurriculumLinks(prisma, subject.id, data.unitId, data.lessonIds);

    const isEssay = type === QuestionType.ESSAY;

    return prisma.question.create({
      data: {
        statement: data.statement.trim(),
        subjectId: subject.id,
        unitId: data.unitId || null,
        type,
        difficulty: data.difficulty || Difficulty.MEDIUM,
        status: data.status || PublishStatus.PUBLISHED,
        schoolCategory: subject.schoolCategory,
        imageUrl: data.imageUrl?.trim() || null,
        options:
          !isEssay && options.length
            ? {
                create: options.map((opt, idx) => ({
                  text: opt.text.trim(),
                  isCorrect: Boolean(opt.isCorrect),
                  order: opt.order ?? idx + 1,
                  explanation: opt.explanation?.trim() || null,
                })),
              }
            : undefined,
        explanation: data.explanation
          ? {
              create: {
                concept: data.explanation.concept.trim(),
                correctReason: data.explanation.correctReason.trim(),
                sectionId: data.explanation.sectionId || null,
              },
            }
          : undefined,
        rubric:
          isEssay && data.rubric
            ? {
                create: {
                  modelAnswer: data.rubric.modelAnswer.trim(),
                  criteria: data.rubric.criteria || [],
                  maxScore: Number(data.rubric.maxScore || 10),
                },
              }
            : undefined,
        lessons: data.lessonIds?.length
          ? {
              create: [...new Set(data.lessonIds)].map((lessonId) => ({ lessonId })),
            }
          : undefined,
      },
      include: {
        subject: { select: { id: true, name: true, color: true, schoolCategory: true, gradeId: true } },
        unit: { select: { id: true, title: true } },
        options: { orderBy: { order: "asc" } },
        explanation: true,
        rubric: true,
        batch: { select: { id: true, fileName: true, fileType: true } },
        lessons: { include: { lesson: { select: { id: true, title: true } } } },
      },
    });
  }

  /**
   * Update an existing question atomically.
   * - Options are synchronized in place (ids preserved) instead of delete + recreate.
   * - `explanation: null` / `rubric: null` explicitly remove the record.
   * - Changing the subject re-derives the school category and clears unit/lessons
   *   unless valid replacements for the new subject are supplied.
   */
  static async updateQuestion(id: string, data: QuestionUpdateInput) {
    const existing = await prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        subjectId: true,
        unitId: true,
        type: true,
        options: { orderBy: { order: "asc" }, select: { id: true, text: true } },
      },
    });
    if (!existing) throw new QuestionValidationError("السؤال غير موجود", 404);

    if (data.type !== undefined && !isQuestionType(data.type)) {
      throw new QuestionValidationError(`نوع السؤال غير صالح: ${String(data.type)}`);
    }

    const effectiveType = data.type ?? existing.type;
    const typeChanged = effectiveType !== existing.type;
    const incomingOptions = filledOptions(data.options);
    const optionsRequired = effectiveType !== QuestionType.ESSAY && (data.options !== undefined || typeChanged);

    const errors: string[] = [];
    if (data.statement !== undefined && !data.statement.trim()) errors.push("نص السؤال مطلوب");
    if (data.difficulty !== undefined && !isDifficulty(data.difficulty)) {
      errors.push(`مستوى الصعوبة غير صالح: ${String(data.difficulty)}`);
    }
    if (optionsRequired) {
      errors.push(
        ...validateQuestionShape({ statement: "-", type: effectiveType, options: incomingOptions })
      );
    }
    if (errors.length > 0) throw new QuestionValidationError(errors.join("، "));

    const subjectChanged = Boolean(data.subjectId) && data.subjectId !== existing.subjectId;
    const targetSubjectId = subjectChanged ? (data.subjectId as string) : existing.subjectId;
    let nextSchoolCategory: Prisma.QuestionUpdateInput["schoolCategory"];

    if (subjectChanged) {
      const subject = await prisma.subject.findUnique({
        where: { id: targetSubjectId },
        select: { schoolCategory: true },
      });
      if (!subject) throw new QuestionValidationError("المادة الدراسية غير موجودة", 404);
      nextSchoolCategory = subject.schoolCategory;
    }

    const unitProvided = data.unitId !== undefined;
    const nextUnitId = unitProvided ? data.unitId || null : subjectChanged ? null : existing.unitId;
    const nextLessonIds = data.lessonIds !== undefined ? data.lessonIds : subjectChanged ? [] : undefined;

    if (unitProvided || data.lessonIds !== undefined || subjectChanged) {
      await assertCurriculumLinks(prisma, targetSubjectId, nextUnitId, nextLessonIds);
    }

    await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id },
        data: {
          statement: data.statement !== undefined ? data.statement.trim() : undefined,
          subjectId: subjectChanged ? targetSubjectId : undefined,
          schoolCategory: nextSchoolCategory,
          unitId: unitProvided || subjectChanged ? nextUnitId : undefined,
          type: data.type,
          difficulty: data.difficulty,
          status: data.status,
          imageUrl: data.imageUrl !== undefined ? data.imageUrl?.trim() || null : undefined,
        },
      });

      if (effectiveType === QuestionType.ESSAY) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
      } else {
        await tx.essayRubric.deleteMany({ where: { questionId: id } });
        if (optionsRequired) {
          await syncOptions(tx, id, existing.options, incomingOptions);
        }
      }

      if (data.explanation === null) {
        await tx.questionExplanation.deleteMany({ where: { questionId: id } });
      } else if (data.explanation) {
        const explanationData = {
          concept: data.explanation.concept.trim(),
          correctReason: data.explanation.correctReason.trim(),
          sectionId: data.explanation.sectionId || null,
        };
        await tx.questionExplanation.upsert({
          where: { questionId: id },
          create: { questionId: id, ...explanationData },
          update: explanationData,
        });
      }

      if (effectiveType === QuestionType.ESSAY) {
        if (data.rubric === null) {
          await tx.essayRubric.deleteMany({ where: { questionId: id } });
        } else if (data.rubric) {
          await tx.essayRubric.upsert({
            where: { questionId: id },
            create: {
              questionId: id,
              modelAnswer: data.rubric.modelAnswer.trim(),
              criteria: data.rubric.criteria || [],
              maxScore: Number(data.rubric.maxScore || 10),
            },
            update: {
              modelAnswer: data.rubric.modelAnswer.trim(),
              criteria: data.rubric.criteria || undefined,
              maxScore: data.rubric.maxScore ? Number(data.rubric.maxScore) : undefined,
            },
          });
        }
      }

      if (nextLessonIds !== undefined) {
        await tx.questionLesson.deleteMany({ where: { questionId: id } });
        const uniqueLessonIds = [...new Set(nextLessonIds)];
        if (uniqueLessonIds.length > 0) {
          await tx.questionLesson.createMany({
            data: uniqueLessonIds.map((lessonId) => ({ questionId: id, lessonId })),
          });
        }
      }
    });

    return QuestionQueriesService.getQuestionById(id);
  }

  /**
   * Delete question and all related options, rubric, and explanation.
   * If any student has answered this question, or if it is part of student mistakes/bookmarks/exams,
   * it is ARCHIVED instead of hard-deleted to preserve all student attempts, scores, and history.
   */
  static async deleteQuestion(id: string) {
    const [answersCount, mistakesCount, bookmarksCount, examCount] = await Promise.all([
      prisma.studentAnswer.count({ where: { questionId: id } }),
      prisma.mistakeReview.count({ where: { questionId: id } }),
      prisma.bookmark.count({ where: { questionId: id } }),
      prisma.examQuestion.count({ where: { questionId: id } }),
    ]);

    const hasStudentOrExamData = answersCount > 0 || mistakesCount > 0 || bookmarksCount > 0 || examCount > 0;

    if (hasStudentOrExamData) {
      // Soft-delete / Archive: Protects every student's past exam answers, scores, and mistakes!
      return prisma.question.update({
        where: { id },
        data: { status: PublishStatus.ARCHIVED },
      });
    }

    // Question has never been answered or used in any exam; safe to completely purge
    return prisma.question.delete({
      where: { id },
    });
  }

  /**
   * Bulk delete questions by IDs atomically.
   * Questions linked to student answers, mistakes, bookmarks, or exams are archived
   * to protect student data integrity; unlinked questions are purged.
   */
  static async bulkDeleteQuestions(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { count: 0, archivedCount: 0, deletedCount: 0 };
    }

    // Identify which questions have student history or exam links
    const [answeredQIds, mistakeQIds, bookmarkedQIds, examQIds] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { questionId: { in: ids } },
        select: { questionId: true },
        distinct: ["questionId"],
      }),
      prisma.mistakeReview.findMany({
        where: { questionId: { in: ids } },
        select: { questionId: true },
        distinct: ["questionId"],
      }),
      prisma.bookmark.findMany({
        where: { questionId: { in: ids } },
        select: { questionId: true },
        distinct: ["questionId"],
      }),
      prisma.examQuestion.findMany({
        where: { questionId: { in: ids } },
        select: { questionId: true },
        distinct: ["questionId"],
      }),
    ]);

    const protectIds: string[] = [];
    for (const r of answeredQIds) protectIds.push(r.questionId);
    for (const r of mistakeQIds) protectIds.push(r.questionId);
    for (const r of bookmarkedQIds) {
      if (r.questionId) protectIds.push(r.questionId);
    }
    for (const r of examQIds) protectIds.push(r.questionId);

    const protectSet = new Set<string>(protectIds);

    const toArchive = ids.filter((id) => protectSet.has(id));
    const toHardDelete = ids.filter((id) => !protectSet.has(id));

    let archivedCount = 0;
    let deletedCount = 0;

    await prisma.$transaction(async (tx) => {
      if (toArchive.length > 0) {
        const res = await tx.question.updateMany({
          where: { id: { in: toArchive } },
          data: { status: PublishStatus.ARCHIVED },
        });
        archivedCount = res.count;
      }

      if (toHardDelete.length > 0) {
        const res = await tx.question.deleteMany({
          where: { id: { in: toHardDelete } },
        });
        deletedCount = res.count;
      }
    });

    return {
      count: archivedCount + deletedCount,
      archivedCount,
      deletedCount,
    };
  }

  /**
   * Bulk import questions in an atomic database transaction with ImportBatch audit.
   *
   * Server-side guarantees (independent of the client wizard):
   * - every question passes structural validation, otherwise nothing is written;
   * - unit / lesson overrides must belong to the target subject (Arabic / Languages isolation);
   * - statements already present in the subject (or repeated inside the batch) are skipped;
   * - if every question is a duplicate the request fails without creating an empty batch.
   */
  static async bulkCreateQuestions(
    questions: ParsedQuestionImportItem[],
    batchMeta?: BulkImportMeta
  ) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new QuestionValidationError("لم يتم تقديم أي أسئلة صالحة للاستيراد");
    }
    if (questions.length > MAX_BULK_QUESTIONS) {
      throw new QuestionValidationError(
        `الحد الأقصى للاستيراد في المرة الواحدة ${MAX_BULK_QUESTIONS} سؤال`,
        413
      );
    }

    const targetSubjectId = batchMeta?.subjectId || questions[0]?.subjectId;
    if (!targetSubjectId) {
      throw new QuestionValidationError("يجب تحديد المادة الدراسية للاستيراد");
    }

    const subject = await prisma.subject.findUnique({
      where: { id: targetSubjectId },
      include: { grade: true, track: true },
    });

    if (!subject) {
      throw new QuestionValidationError("المادة الدراسية المحددة غير موجودة في قاعدة البيانات", 404);
    }

    // Strict validation: prevent cross-category or cross-grade imports!
    if (batchMeta?.schoolCategory && subject.schoolCategory !== batchMeta.schoolCategory) {
      throw new QuestionValidationError(
        `تعارض في الفئة التعليمية: المادة "${subject.name}" تتبع (${subject.schoolCategory}) بينما الفئة المحددة هي (${batchMeta.schoolCategory})`
      );
    }

    if (batchMeta?.gradeId && subject.gradeId !== batchMeta.gradeId) {
      throw new QuestionValidationError(
        `تعارض في الصف الدراسي: المادة المختارة لا تتبع الصف الدراسي المحدد`
      );
    }

    const effectiveSchoolCategory = subject.schoolCategory;
    const effectiveGradeId = subject.gradeId;
    const effectiveTrackId = subject.trackId;
    const effectiveUnitId = batchMeta?.unitId || null;
    const effectiveLessonId = batchMeta?.lessonId || null;

    // Batch-level unit / lesson must belong to the subject
    await assertCurriculumLinks(
      prisma,
      subject.id,
      effectiveUnitId,
      effectiveLessonId ? [effectiveLessonId] : undefined
    );

    // Structural validation of every question before anything is written
    const problems: string[] = [];
    questions.forEach((q, i) => {
      const type = q.type ?? batchMeta?.questionType;
      const errs = validateQuestionShape({
        statement: q.statement,
        type,
        difficulty: q.difficulty ?? batchMeta?.difficulty,
        options: filledOptions(q.options),
      });
      if (errs.length > 0) problems.push(`سؤال ${i + 1}: ${errs.join("، ")}`);
    });
    if (problems.length > 0) {
      const extra = problems.length > 5 ? ` ... (+${problems.length - 5} أخرى)` : "";
      throw new QuestionValidationError(problems.slice(0, 5).join(" | ") + extra);
    }

    // Per-question unit / lesson overrides are only honored when they belong to the subject
    const overrideUnitIds = new Set<string>();
    const overrideLessonIds = new Set<string>();
    for (const q of questions) {
      if (!effectiveUnitId && q.unitId) overrideUnitIds.add(q.unitId);
      if (!effectiveLessonId && q.lessonId) overrideLessonIds.add(q.lessonId);
    }
    for (const unitId of overrideUnitIds) {
      await assertCurriculumLinks(prisma, subject.id, unitId, undefined);
    }
    for (const lessonId of overrideLessonIds) {
      await assertCurriculumLinks(prisma, subject.id, undefined, [lessonId]);
    }

    // Duplicate detection against the subject bank and inside the batch
    const existingStatements = await prisma.question.findMany({
      where: { subjectId: subject.id },
      select: { statement: true },
    });
    const seen = new Set(existingStatements.map((r) => normalizeStatement(r.statement)));
    const uniqueQuestions: ParsedQuestionImportItem[] = [];
    let skippedDuplicates = 0;
    for (const q of questions) {
      const key = normalizeStatement(q.statement);
      if (seen.has(key)) {
        skippedDuplicates++;
        continue;
      }
      seen.add(key);
      uniqueQuestions.push(q);
    }
    if (uniqueQuestions.length === 0) {
      throw new QuestionValidationError(
        `جميع الأسئلة (${skippedDuplicates}) مكررة وموجودة بالفعل في بنك هذه المادة`,
        409
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create ImportBatch audit record
      const batch = await tx.importBatch.create({
        data: {
          fileName: batchMeta?.fileName || "استيراد مباشر",
          fileType: batchMeta?.fileType || "DOCX",
          questionType: batchMeta?.questionType || (uniqueQuestions[0]?.type as QuestionType) || "MCQ",
          difficulty: batchMeta?.difficulty || (uniqueQuestions[0]?.difficulty as Difficulty) || null,
          schoolCategory: effectiveSchoolCategory,
          gradeId: effectiveGradeId,
          subjectId: subject.id,
          unitId: effectiveUnitId,
          lessonId: effectiveLessonId,
          trackId: effectiveTrackId,
          importedCount: 0,
        },
      });

      let count = 0;
      for (const q of uniqueQuestions) {
        const type: QuestionType = q.type || batchMeta?.questionType || "MCQ";
        const questionUnitId = effectiveUnitId || q.unitId || null;
        const options = type === "ESSAY" ? [] : filledOptions(q.options);

        let lessonIdToAttach = effectiveLessonId || q.lessonId || null;
        if (!lessonIdToAttach && q.questionLesson && questionUnitId) {
          const lessonTitle = q.questionLesson.trim();
          let matchedLesson = await tx.lesson.findFirst({
            where: { unitId: questionUnitId, title: lessonTitle },
          });
          if (!matchedLesson) {
            const lastLesson = await tx.lesson.aggregate({
              where: { unitId: questionUnitId },
              _max: { order: true },
            });
            matchedLesson = await tx.lesson.create({
              data: {
                unitId: questionUnitId,
                title: lessonTitle,
                order: (lastLesson._max.order ?? 0) + 1,
              },
            });
          }
          lessonIdToAttach = matchedLesson.id;
        }

        await tx.question.create({
          data: {
            statement: q.statement.trim(),
            type,
            difficulty: q.difficulty || batchMeta?.difficulty || "MEDIUM",
            status: "PUBLISHED",
            schoolCategory: effectiveSchoolCategory,
            subjectId: subject.id,
            unitId: questionUnitId,
            imageUrl: q.imageUrl?.trim() || null,
            batchId: batch.id,
            options: {
              create: options.map((opt, idx: number) => ({
                text: opt.text.trim(),
                isCorrect: Boolean(opt.isCorrect),
                order: idx + 1,
                explanation: opt.explanation?.trim() || null,
              })),
            },
            ...(lessonIdToAttach
              ? {
                  lessons: {
                    create: {
                      lessonId: lessonIdToAttach,
                    },
                  },
                }
              : {}),
            ...(q.correctReason
              ? {
                  explanation: {
                    create: {
                      concept: q.concept?.trim() || "تفسير الإجابة",
                      correctReason: q.correctReason.trim(),
                    },
                  },
                }
              : {}),
            ...(type === "ESSAY" && q.modelAnswer
              ? {
                  rubric: {
                    create: {
                      modelAnswer: q.modelAnswer.trim(),
                      maxScore: Number(q.points || 10),
                    },
                  },
                }
              : {}),
          },
        });
        count++;
      }

      await tx.importBatch.update({
        where: { id: batch.id },
        data: { importedCount: count },
      });

      return { count, batchId: batch.id };
    }, BULK_TRANSACTION_OPTIONS);

    return { ...result, skippedDuplicates };
  }
}
