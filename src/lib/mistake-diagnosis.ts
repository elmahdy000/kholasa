export interface MistakeWeaknessBucket {
  key: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string | null;
  unitTitle: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
  count: number;
  totalWrongs: number;
}

export interface StudentMistakeDiagnosisSummary {
  unresolvedCount: number;
  resolvedCount: number;
  topWeakness: MistakeWeaknessBucket | null;
  breakdown: MistakeWeaknessBucket[];
}

export interface RawMistakeDiagnosisRow {
  wrongCount?: number | null;
  question: {
    subject: { id: string; name: string; color?: string | null };
    unit?: { title: string } | null;
    lessons?: Array<{ lesson: { id: string; title: string } }>;
  };
}

/**
 * Pure aggregation grouping unresolved mistake rows by primary lesson, unit, or subject,
 * sorted descending by active mistake count then cumulative wrong attempts.
 */
export function buildMistakeDiagnosisBreakdown(
  rows: RawMistakeDiagnosisRow[]
): MistakeWeaknessBucket[] {
  const buckets = new Map<string, MistakeWeaknessBucket>();

  for (const row of rows) {
    const subj = row.question?.subject;
    if (!subj) continue;

    const primaryLesson = row.question.lessons?.[0]?.lesson ?? null;
    const unitTitle = row.question.unit?.title ?? null;
    const key = primaryLesson?.id
      ? `lesson:${primaryLesson.id}`
      : unitTitle
      ? `unit:${subj.id}:${unitTitle}`
      : `subject:${subj.id}`;

    const existing = buckets.get(key);
    const wrongInc = Math.max(1, row.wrongCount ?? 1);
    if (existing) {
      existing.count += 1;
      existing.totalWrongs += wrongInc;
    } else {
      buckets.set(key, {
        key,
        subjectId: subj.id,
        subjectName: subj.name,
        subjectColor: subj.color ?? null,
        unitTitle,
        lessonId: primaryLesson?.id ?? null,
        lessonTitle: primaryLesson?.title ?? null,
        count: 1,
        totalWrongs: wrongInc,
      });
    }
  }

  return Array.from(buckets.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.totalWrongs - a.totalWrongs;
  });
}

