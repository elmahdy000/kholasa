import { Difficulty, Prisma, QuestionType } from "@prisma/client";

/**
 * Error raised for invalid client input. Routes map it to its HTTP status
 * (400 by default, 404 for missing records) instead of a generic 500.
 */
export class QuestionValidationError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "QuestionValidationError";
    this.status = status;
  }
}

const QUESTION_TYPES = new Set<string>(Object.values(QuestionType));
const DIFFICULTIES = new Set<string>(Object.values(Difficulty));

export function isQuestionType(value: unknown): value is QuestionType {
  return typeof value === "string" && QUESTION_TYPES.has(value);
}

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && DIFFICULTIES.has(value);
}

/**
 * Normalizes a statement for duplicate detection: Unicode NFKC, removes Arabic
 * diacritics and tatweel, unifies alef/ya/ta-marbuta variants, collapses
 * whitespace and lowercases Latin text.
 */
export function normalizeStatement(statement: string): string {
  return statement
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export interface OptionShape {
  text: string;
  isCorrect: boolean;
}

export interface QuestionShape {
  statement?: string | null;
  type?: string | null;
  difficulty?: string | null;
  options?: OptionShape[] | null;
}

/**
 * Pure structural validation shared by create, update and bulk import.
 * Returns a list of human readable (Arabic) problems; empty means valid.
 */
export function validateQuestionShape(q: QuestionShape): string[] {
  const errors: string[] = [];

  if (!q.statement || !q.statement.trim()) {
    errors.push("نص السؤال مطلوب");
  }

  if (q.type != null && !isQuestionType(q.type)) {
    errors.push(`نوع السؤال غير صالح: ${String(q.type)}`);
    return errors;
  }

  if (q.difficulty != null && !isDifficulty(q.difficulty)) {
    errors.push(`مستوى الصعوبة غير صالح: ${String(q.difficulty)}`);
  }

  const type: QuestionType = (q.type as QuestionType | null | undefined) ?? QuestionType.MCQ;
  const options = (q.options ?? []).filter((o) => o && typeof o.text === "string" && o.text.trim());
  const correctCount = options.filter((o) => o.isCorrect).length;

  if (type === QuestionType.MCQ) {
    if (options.length < 2) errors.push("سؤال الاختيار من متعدد يحتاج خيارين على الأقل");
    if (correctCount !== 1) errors.push("يجب تحديد إجابة صحيحة واحدة بالضبط");
  } else if (type === QuestionType.TRUE_FALSE) {
    if (options.length !== 2) errors.push("سؤال صح/خطأ يحتاج خيارين بالضبط");
    if (correctCount !== 1) errors.push("يجب تحديد إجابة صحيحة واحدة بالضبط");
  }

  return errors;
}

type CurriculumDb = Pick<Prisma.TransactionClient, "unit" | "lesson">;

/**
 * Guarantees that the unit and lessons belong to the given subject. Subjects are
 * unique per grade + school category, so this also preserves the strict
 * Arabic / Languages isolation regardless of what the client sends.
 */
export async function assertCurriculumLinks(
  db: CurriculumDb,
  subjectId: string,
  unitId: string | null | undefined,
  lessonIds: string[] | undefined
): Promise<void> {
  if (unitId) {
    const unit = await db.unit.findFirst({ where: { id: unitId, subjectId }, select: { id: true } });
    if (!unit) throw new QuestionValidationError("الوحدة المختارة لا تتبع هذه المادة الدراسية");
  }

  const uniqueLessonIds = [...new Set((lessonIds ?? []).filter(Boolean))];
  if (uniqueLessonIds.length === 0) return;

  const lessons = await db.lesson.findMany({
    where: { id: { in: uniqueLessonIds }, unit: { subjectId } },
    select: { id: true, unitId: true },
  });
  if (lessons.length !== uniqueLessonIds.length) {
    throw new QuestionValidationError("الدرس المختار لا يتبع هذه المادة الدراسية");
  }
  if (unitId && lessons.some((l) => l.unitId !== unitId)) {
    throw new QuestionValidationError("الدرس المختار لا ينتمي للوحدة المحددة");
  }
}
