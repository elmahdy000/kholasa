export const STUDY_PREFS_COOKIE = "kholasa_study_prefs";
export const STUDY_PREFS_STORAGE_KEY = "kholasa_study_prefs";

export type StudySchoolCategory = "ARABIC" | "LANGUAGES";

export interface StudyPreferences {
  gradeId: string | null;
  gradeCode: string | null;
  schoolCategory: StudySchoolCategory | null;
}

export interface GradeOptionRef {
  id: string;
  code: string;
  name: string;
}

const VALID_CATEGORIES = new Set<StudySchoolCategory>(["ARABIC", "LANGUAGES"]);
const MAX_COOKIE_AGE_SEC = 365 * 24 * 60 * 60;

export function formatGradeShortLabel(code?: string | null, fallbackName?: string | null): string {
  if (code === "bacc_g10") return "أولى بكالوريا";
  if (code === "bacc_g11") return "تانية بكالوريا";
  return fallbackName?.trim() || "";
}

export function normalizeSchoolCategory(value?: string | null): StudySchoolCategory | null {
  if (!value) return null;
  const upper = value.trim().toUpperCase();
  if (upper === "ARABIC" || upper === "LANGUAGES") {
    return upper as StudySchoolCategory;
  }
  return null;
}

export function parseStudyPreferences(raw?: string | null): StudyPreferences {
  if (!raw || typeof raw !== "string") {
    return { gradeId: null, gradeCode: null, schoolCategory: null };
  }
  try {
    const decoded = raw.startsWith("%7B") ? decodeURIComponent(raw) : raw;
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    const gradeId =
      typeof parsed.gradeId === "string" && parsed.gradeId.trim().length > 0 && parsed.gradeId.length <= 64
        ? parsed.gradeId.trim()
        : null;
    const gradeCode =
      typeof parsed.gradeCode === "string" && parsed.gradeCode.trim().length > 0 && parsed.gradeCode.length <= 32
        ? parsed.gradeCode.trim()
        : null;
    const schoolCategory =
      typeof parsed.schoolCategory === "string"
        ? normalizeSchoolCategory(parsed.schoolCategory)
        : null;

    return { gradeId, gradeCode, schoolCategory };
  } catch {
    return { gradeId: null, gradeCode: null, schoolCategory: null };
  }
}

export function serializeStudyPreferences(prefs: StudyPreferences): string {
  return JSON.stringify({
    gradeId: prefs.gradeId || null,
    gradeCode: prefs.gradeCode || null,
    schoolCategory:
      prefs.schoolCategory && VALID_CATEGORIES.has(prefs.schoolCategory)
        ? prefs.schoolCategory
        : null,
  });
}

/**
 * Resolves unified grade + school category across URL params, logged-in profile, and saved prefs.
 * NEVER auto-selects a grade or school category for a brand-new visitor.
 */
export function resolveInitialStudyPreferences({
  grades,
  queryGrade,
  queryCategory,
  cookieRaw,
  userGradeId,
  userCategory,
}: {
  grades: GradeOptionRef[];
  queryGrade?: string | null;
  queryCategory?: string | null;
  cookieRaw?: string | null;
  userGradeId?: string | null;
  userCategory?: string | null;
}): StudyPreferences {
  const fromCookie = parseStudyPreferences(cookieRaw);

  const matchGrade = (candidate?: string | null): GradeOptionRef | undefined => {
    if (!candidate) return undefined;
    const clean = candidate.trim();
    return grades.find((g) => g.id === clean || g.code === clean);
  };

  // 1. Explicit URL query params win
  const qGrade = matchGrade(queryGrade);
  const qCategory = normalizeSchoolCategory(queryCategory);
  if (qGrade || qCategory) {
    const fallbackGrade = qGrade ?? matchGrade(userGradeId) ?? matchGrade(fromCookie.gradeId || fromCookie.gradeCode);
    const resolvedCategory = qCategory ?? normalizeSchoolCategory(userCategory) ?? fromCookie.schoolCategory;
    return {
      gradeId: fallbackGrade?.id ?? null,
      gradeCode: fallbackGrade?.code ?? null,
      schoolCategory: resolvedCategory ?? null,
    };
  }

  // 2. Logged-in user's actual enrolled profile
  const uGrade = matchGrade(userGradeId);
  const uCategory = normalizeSchoolCategory(userCategory);
  if (uGrade && uCategory) {
    return {
      gradeId: uGrade.id,
      gradeCode: uGrade.code,
      schoolCategory: uCategory,
    };
  }

  // 3. Previously saved cookie from an earlier selection
  const cGrade = matchGrade(fromCookie.gradeId || fromCookie.gradeCode);
  if (cGrade || fromCookie.schoolCategory) {
    return {
      gradeId: cGrade?.id ?? uGrade?.id ?? null,
      gradeCode: cGrade?.code ?? uGrade?.code ?? null,
      schoolCategory: fromCookie.schoolCategory ?? uCategory ?? null,
    };
  }

  // 4. Brand-new visitor: leave unselected intentionally
  return {
    gradeId: uGrade?.id ?? null,
    gradeCode: uGrade?.code ?? null,
    schoolCategory: uCategory ?? null,
  };
}

export function saveStudyPreferencesClient(
  prefs: StudyPreferences,
  { syncUrl = true }: { syncUrl?: boolean } = {}
): void {
  if (typeof window === "undefined") return;
  const serialized = serializeStudyPreferences(prefs);

  try {
    localStorage.setItem(STUDY_PREFS_STORAGE_KEY, serialized);
  } catch {
    // Ignore storage quota / private mode failures
  }

  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${STUDY_PREFS_COOKIE}=${encodeURIComponent(serialized)}; Path=/; Max-Age=${MAX_COOKIE_AGE_SEC}; SameSite=Lax${secure}`;
  } catch {
    // Ignore cookie write failures
  }

  if (syncUrl) {
    try {
      const url = new URL(window.location.href);
      if (prefs.gradeCode) {
        url.searchParams.set("grade", prefs.gradeCode);
      } else if (prefs.gradeId) {
        url.searchParams.set("grade", prefs.gradeId);
      } else {
        url.searchParams.delete("grade");
      }

      if (prefs.schoolCategory) {
        url.searchParams.set("category", prefs.schoolCategory);
      } else {
        url.searchParams.delete("category");
      }

      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    } catch {
      // Ignore history API issues
    }
  }
}

export function readStudyPreferencesClient(): StudyPreferences {
  if (typeof window === "undefined") {
    return { gradeId: null, gradeCode: null, schoolCategory: null };
  }
  try {
    const raw = localStorage.getItem(STUDY_PREFS_STORAGE_KEY);
    if (raw) {
      const parsed = parseStudyPreferences(raw);
      if (parsed.gradeId || parsed.gradeCode || parsed.schoolCategory) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage read failure
  }

  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${STUDY_PREFS_COOKIE}=([^;]+)`)
    );
    if (match?.[1]) {
      return parseStudyPreferences(match[1]);
    }
  } catch {
    // Ignore cookie read failure
  }

  return { gradeId: null, gradeCode: null, schoolCategory: null };
}

