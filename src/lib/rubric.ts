export interface NormalizedRubricCriterion {
  text: string;
  marks?: number;
}

/**
 * Normalizes essay rubric criteria stored in JSON across all legacy/new schemas:
 * - string
 * - { point: string, marks?: number }
 * - { title: string, marks?: number }
 * - { criterion: string, points?: number }
 */
export function normalizeRubricCriteria(raw: unknown): NormalizedRubricCriterion[] {
  if (!Array.isArray(raw)) return [];

  const out: NormalizedRubricCriterion[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const text = item.trim();
      if (text) out.push({ text });
      continue;
    }

    if (item && typeof item === "object") {
      const rec = item as Record<string, unknown>;
      const rawText = rec.point ?? rec.title ?? rec.criterion ?? rec.text ?? rec.label;
      const rawMarks = rec.marks ?? rec.points ?? rec.score;
      const text = typeof rawText === "string" ? rawText.trim() : "";
      const marks =
        typeof rawMarks === "number" && Number.isFinite(rawMarks)
          ? rawMarks
          : undefined;

      if (text) {
        out.push({ text, marks });
      }
    }
  }

  return out;
}
