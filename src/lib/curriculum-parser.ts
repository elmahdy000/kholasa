export interface ParsedCurriculumLesson {
  title: string;
  order: number;
  durationMinutes?: number;
}

export interface ParsedCurriculumUnit {
  title: string;
  order: number;
  description?: string | null;
  lessons: ParsedCurriculumLesson[];
}

export interface CurriculumParseResult {
  units: ParsedCurriculumUnit[];
  totalUnits: number;
  totalLessons: number;
  warnings: string[];
}

/**
 * Clean up extra punctuation, bullet points, numbers, and common prefixes
 */
export function cleanTitle(raw: string): string {
  let cleaned = raw
    .replace(/^[\s\-_•*+–—#]+\s*/, "") // remove leading bullets/markdown
    .replace(/^[\d]+[\.\)\-–]\s*/, "") // remove leading numbering (e.g. "1. ", "2) ")
    .trim();

  // If title has a lesson prefix like "الدرس الأول: كذا" or "الدرس 1: كذا", extract the meaningful title
  const lessonPrefixMatch = cleaned.match(/^(?:الدرس|درس|Lesson)\s+[\w\d\u0621-\u064A]+[:：\-–]\s*(.+)$/i);
  if (lessonPrefixMatch && lessonPrefixMatch[1]?.trim()) {
    cleaned = lessonPrefixMatch[1].trim();
  }

  return cleaned;
}

/**
 * Check if line signifies a unit / chapter / module header
 */
function isUnitHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Markdown header (e.g. # or ##)
  if (/^#{1,3}\s+/.test(trimmed)) return true;

  // Arabic unit indicators (الوحدة, الفصل, الباب, المحور, المجال) - avoid \b on Arabic characters
  if (/^(?:الوحدة|فصل|الفصل|الباب|باب|المحور|محور|المجال)(?:[\s:：\d]|$)/i.test(trimmed)) {
    return true;
  }

  // English unit indicators (Unit, Chapter, Module, Part)
  if (/^(?:Unit|Chapter|Module|Part)(?:[\s:：\d]|$)/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Check if line signifies a lesson under the current unit
 */
function isLessonLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Leading bullets or tabs/indentation
  if (/^[\t ]+/.test(line)) return true;
  if (/^[\-_•*+–—]\s+/.test(trimmed)) return true;
  if (/^\d+[\.\)\-–]\s+/.test(trimmed)) return true;

  // Lesson keywords (الدرس, درس, محاضرة, Lesson, Topic)
  if (/^(?:الدرس|درس|المحاضرة|محاضرة|Topic|Lesson)(?:[\s:：\d]|$)/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Parse raw text into structured Units and Lessons
 */
export function parseCurriculumText(text: string): CurriculumParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => {
      const t = l.trim();
      return t.length > 0 && !/^[-=_]{3,}$/.test(t);
    });

  const units: ParsedCurriculumUnit[] = [];
  const warnings: string[] = [];

  let currentUnit: ParsedCurriculumUnit | null = null;
  let unitOrderCounter = 1;
  let lessonOrderCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (isUnitHeaderLine(trimmed)) {
      // Clean unit header
      const unitTitle = trimmed
        .replace(/^#{1,3}\s*/, "")
        .replace(/^[\s\-_•*+–—]+\s*/, "")
        .trim();

      if (!unitTitle) continue;

      currentUnit = {
        title: unitTitle,
        order: unitOrderCounter++,
        lessons: [],
      };
      units.push(currentUnit);
      lessonOrderCounter = 1;
      continue;
    }

    if (isLessonLine(rawLine)) {
      const lessonTitle = cleanTitle(trimmed);
      if (!lessonTitle) continue;

      // If no unit defined yet, create a default first unit
      if (!currentUnit) {
        currentUnit = {
          title: "الوحدة الأولى",
          order: unitOrderCounter++,
          lessons: [],
        };
        units.push(currentUnit);
        lessonOrderCounter = 1;
      }

      currentUnit.lessons.push({
        title: lessonTitle,
        order: lessonOrderCounter++,
        durationMinutes: 15,
      });
      continue;
    }

    // Line didn't match explicit unit or lesson pattern:
    // If we have no current unit, treat this line as the unit title
    if (!currentUnit) {
      currentUnit = {
        title: trimmed,
        order: unitOrderCounter++,
        lessons: [],
      };
      units.push(currentUnit);
      lessonOrderCounter = 1;
    } else {
      // If we are inside a unit, treat line as another lesson
      const lessonTitle = cleanTitle(trimmed);
      if (lessonTitle) {
        currentUnit.lessons.push({
          title: lessonTitle,
          order: lessonOrderCounter++,
          durationMinutes: 15,
        });
      }
    }
  }

  // Filter out any empty units
  const validUnits = units.filter((u) => u.title.length > 0);
  const totalLessons = validUnits.reduce((acc, u) => acc + u.lessons.length, 0);

  if (validUnits.length === 0) {
    warnings.push("لم يتم العثور على أي وحدات أو دروس في النص المدخل.");
  }

  return {
    units: validUnits,
    totalUnits: validUnits.length,
    totalLessons,
    warnings,
  };
}
