import { prisma } from "@/lib/prisma";
import { subjectScopeWhere, type CurriculumScope } from "@/lib/curriculum";
import type {
  LandingContinueItem,
  LandingCurriculumPayload,
  LandingDefinitionItem,
  LandingHeroHighlight,
  LandingLessonItem,
  LandingMindMapData,
  LandingSampleQuestionBucket,
  LandingPreviewQuestionPublic,
  LandingSubjectItem,
  LandingUnitItem,
} from "@/components/landing/types";

export type {
  LandingContinueItem,
  LandingCurriculumPayload,
  LandingDefinitionItem,
  LandingHeroHighlight,
  LandingLessonItem,
  LandingMindMapData,
  LandingSampleQuestionBucket,
  LandingPreviewQuestionPublic,
  LandingSubjectItem,
  LandingUnitItem,
};

const GENERIC_CONCEPTS = new Set([
  "تفسير الحل",
  "تفسير",
  "التفسير",
  "شرح",
  "شرح الحل",
  "الفكرة",
  "الإجابة",
  "عام",
  "explanation",
  "reason",
  "concept",
  "answer",
]);

function sanitizeDefinitions(raw: unknown): LandingDefinitionItem[] {
  if (!Array.isArray(raw)) return [];
  const out: LandingDefinitionItem[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).term === "string" &&
      typeof (item as Record<string, unknown>).meaning === "string"
    ) {
      const rec = item as Record<string, unknown>;
      const term = String(rec.term).trim();
      const meaning = String(rec.meaning).trim();
      const translation =
        typeof rec.translation === "string" && rec.translation.trim()
          ? rec.translation.trim()
          : undefined;
      if (term && meaning) {
        out.push({ term, meaning, translation });
      }
    }
  }
  return out;
}

function sanitizeMindMap(
  raw: {
    title: string;
    description: string | null;
    images: string[];
    nodes: unknown;
    edges: unknown;
  } | null
): LandingMindMapData | null {
  if (!raw) return null;
  const images = Array.isArray(raw.images)
    ? raw.images.filter((img): img is string => typeof img === "string" && img.trim().length > 0)
    : [];
  const nodes = Array.isArray(raw.nodes)
    ? raw.nodes
        .filter(
          (n): n is Record<string, unknown> =>
            Boolean(n && typeof n === "object" && typeof (n as Record<string, unknown>).id === "string" && typeof (n as Record<string, unknown>).label === "string")
        )
        .map((n, index) => ({
          id: String(n.id),
          label: String(n.label),
          level: typeof n.level === "number" ? n.level : index === 0 ? 0 : 1,
          description: typeof n.description === "string" ? n.description : undefined,
        }))
    : [];
  const edges = Array.isArray(raw.edges)
    ? (raw.edges as Array<{ id: string; source: string; target: string }>)
    : [];

  if (images.length === 0 && nodes.length === 0) return null;

  return {
    title: raw.title,
    description: raw.description,
    images,
    nodes,
    edges,
  };
}

/**
 * Deterministically picks ONE verified published MCQ with an explanation and valid options
 * for a given published lesson. Reused by both page loader and answer check Server Action.
 */
export async function pickDeterministicPreviewMcq(lessonId: string) {
  const candidates = await prisma.questionLesson.findMany({
    where: {
      lessonId,
      lesson: {
        isPublished: true,
        unit: {
          isPublished: true,
          subject: { isPublished: true, isUnderConstruction: false },
        },
      },
      question: {
        status: "PUBLISHED",
        type: "MCQ",
        explanation: { isNot: null },
      },
    },
    orderBy: { question: { id: "asc" } },
    take: 15,
    select: {
      question: {
        select: {
          id: true,
          statement: true,
          translation: true,
          difficulty: true,
          options: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              text: true,
              translation: true,
              order: true,
              isCorrect: true,
            },
          },
          explanation: {
            select: {
              concept: true,
              correctReason: true,
            },
          },
        },
      },
    },
  });

  const valid = candidates
    .map((c) => c.question)
    .filter(
      (q) =>
        q.options.length >= 2 &&
        q.options.some((o) => o.isCorrect) &&
        Boolean(q.explanation?.correctReason?.trim())
    );

  if (valid.length === 0) return null;

  const preferred = valid.find(
    (q) =>
      q.explanation?.concept &&
      !GENERIC_CONCEPTS.has(q.explanation.concept.trim().toLowerCase())
  );

  return preferred ?? valid[0];
}

function toPublicQuestion(
  lessonId: string,
  q: NonNullable<Awaited<ReturnType<typeof pickDeterministicPreviewMcq>>>
): LandingPreviewQuestionPublic {
  return {
    id: q.id,
    lessonId,
    statement: q.statement,
    translation: q.translation,
    difficulty: q.difficulty,
    options: q.options.map((o) => ({
      id: o.id,
      text: o.text,
      translation: o.translation,
      order: o.order,
    })),
  };
}

/**
 * Loads strictly verified, published Baccalaureate curriculum metadata for the landing page.
 * Does NOT load the full question bank or full lesson payloads: fetches at most ONE deterministic
 * preview MCQ per (gradeId, schoolCategory) bucket and never exposes isCorrect/explanation before submit.
 */
export async function getLandingCurriculumData(): Promise<LandingCurriculumPayload> {
  try {
    const rawGrades = await prisma.grade.findMany({
      where: {
        system: { code: "baccalaureate", isActive: true },
        code: { in: ["bacc_g10", "bacc_g11"] },
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        order: true,
      },
    });

    const gradeIds = rawGrades.map((g) => g.id);
    const rawSubjects =
      gradeIds.length > 0
        ? await prisma.subject.findMany({
            where: {
              isPublished: true,
              isUnderConstruction: false,
              gradeId: { in: gradeIds },
              units: {
                some: {
                  isPublished: true,
                  lessons: { some: { isPublished: true } },
                },
              },
            },
            orderBy: [{ schoolCategory: "asc" }, { order: "asc" }],
            include: {
              grade: { select: { id: true, name: true, code: true } },
              track: { select: { name: true } },
              units: {
                where: { isPublished: true },
                orderBy: { order: "asc" },
                include: {
                  lessons: {
                    where: { isPublished: true },
                    orderBy: { order: "asc" },
                    select: {
                      id: true,
                      title: true,
                      order: true,
                      durationMinutes: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  units: { where: { isPublished: true } },
                  questions: { where: { status: "PUBLISHED" } },
                },
              },
            },
          })
        : [];

    // Pick at most ONE sample lesson candidate per (gradeId, schoolCategory) bucket — never bulk-loads bank
    const bucketCandidates = new Map<
      string,
      {
        gradeId: string;
        schoolCategory: "ARABIC" | "LANGUAGES";
        subjectName: string;
        unitTitle: string;
        lessonId: string;
        lessonTitle: string;
      }
    >();

    for (const s of rawSubjects) {
      const bucketKey = `${s.grade.id}:${s.schoolCategory}`;
      if (bucketCandidates.has(bucketKey)) continue;
      for (const u of s.units) {
        const firstLesson = u.lessons[0];
        if (firstLesson) {
          bucketCandidates.set(bucketKey, {
            gradeId: s.grade.id,
            schoolCategory: s.schoolCategory,
            subjectName: s.name,
            unitTitle: u.title,
            lessonId: firstLesson.id,
            lessonTitle: firstLesson.title,
          });
          break;
        }
      }
    }

    const mcqEntries = await Promise.all(
      Array.from(bucketCandidates.entries()).map(async ([bucketKey, candidate]) => ({
        bucketKey,
        candidate,
        mcq: await pickDeterministicPreviewMcq(candidate.lessonId),
      }))
    );

    const mcqByLessonId = new Map<
      string,
      NonNullable<Awaited<ReturnType<typeof pickDeterministicPreviewMcq>>>
    >();
    const sampleQuestionsByBucket: LandingSampleQuestionBucket[] = [];
    let heroArabic: LandingHeroHighlight | null = null;
    let heroLanguages: LandingHeroHighlight | null = null;
    let proofQuestion: LandingCurriculumPayload["sampleProofs"]["questionExample"] = null;

    for (const { candidate, mcq } of mcqEntries) {
      if (!mcq) continue;
      mcqByLessonId.set(candidate.lessonId, mcq);
      const publicMcq = toPublicQuestion(candidate.lessonId, mcq);
      const highlight: LandingHeroHighlight = {
        schoolCategory: candidate.schoolCategory,
        subjectName: candidate.subjectName,
        unitTitle: candidate.unitTitle,
        lessonId: candidate.lessonId,
        lessonTitle: candidate.lessonTitle,
        question: publicMcq,
      };
      sampleQuestionsByBucket.push({
        gradeId: candidate.gradeId,
        schoolCategory: candidate.schoolCategory,
        highlight,
      });

      if (candidate.schoolCategory === "ARABIC" && !heroArabic) {
        heroArabic = highlight;
      }
      if (candidate.schoolCategory === "LANGUAGES" && !heroLanguages) {
        heroLanguages = highlight;
      }

      if (mcq.explanation) {
        const correctOpt = mcq.options.find((o) => o.isCorrect);
        const hasNonGeneric =
          mcq.explanation.concept &&
          !GENERIC_CONCEPTS.has(mcq.explanation.concept.trim().toLowerCase());
        if (correctOpt && (!proofQuestion || (candidate.schoolCategory === "ARABIC" && hasNonGeneric))) {
          proofQuestion = {
            subjectName: candidate.subjectName,
            lessonTitle: candidate.lessonTitle,
            statement: mcq.statement,
            correctAnswerText: correctOpt.text,
            concept: mcq.explanation.concept,
            correctReason: mcq.explanation.correctReason,
          };
        }
      }
    }

    const subjects: LandingSubjectItem[] = [];
    for (const s of rawSubjects) {
      let publishedLessonsCount = 0;
      const units: LandingUnitItem[] = [];

      for (const u of s.units) {
        const lessons: LandingLessonItem[] = u.lessons.map((l) => {
          publishedLessonsCount++;
          const rawMcq = mcqByLessonId.get(l.id) ?? null;
          return {
            id: l.id,
            title: l.title,
            order: l.order,
            durationMinutes: l.durationMinutes,
            publishedQuestionsCount: 0,
            definitions: [],
            mindMap: null,
            previewMcq: rawMcq ? toPublicQuestion(l.id, rawMcq) : null,
          };
        });

        units.push({
          id: u.id,
          title: u.title,
          description: u.description,
          order: u.order,
          lessonsCount: u.lessons.length,
          lessons,
        });
      }

      subjects.push({
        id: s.id,
        name: s.name,
        code: s.code,
        description: s.description,
        color: s.color,
        schoolCategory: s.schoolCategory,
        isCommonCategory: Boolean((s as { isCommonCategory?: boolean }).isCommonCategory),
        gradeId: s.grade.id,
        gradeName: s.grade.name,
        gradeCode: s.grade.code,
        trackName: s.track?.name || null,
        publishedUnitsCount: s._count.units,
        publishedLessonsCount,
        publishedQuestionsCount: s._count.questions,
        units,
      });
    }

    // Fetch at most ONE definition & ONE mindMap sample safely for footer feature cards
    let proofDefinition: LandingCurriculumPayload["sampleProofs"]["definitionExample"] = null;
    let proofMindMap: LandingCurriculumPayload["sampleProofs"]["mindMapExample"] = null;

    const lessonSummaryDelegate = (prisma as unknown as {
      lessonSummary?: {
        findFirst: (args: unknown) => Promise<{
          definitions: unknown;
          lesson: { title: string; unit: { subject: { name: string; schoolCategory: "ARABIC" | "LANGUAGES" } } };
        } | null>;
      };
    }).lessonSummary;

    if (lessonSummaryDelegate && gradeIds.length > 0) {
      const sampleSummary = await lessonSummaryDelegate.findFirst({
        where: {
          lesson: {
            isPublished: true,
            unit: {
              isPublished: true,
              subject: {
                isPublished: true,
                isUnderConstruction: false,
                gradeId: { in: gradeIds },
              },
            },
          },
        },
        select: {
          definitions: true,
          lesson: {
            select: {
              title: true,
              unit: {
                select: {
                  subject: { select: { name: true, schoolCategory: true } },
                },
              },
            },
          },
        },
      });

      if (sampleSummary) {
        const defs = sanitizeDefinitions(sampleSummary.definitions);
        if (defs.length > 0) {
          const picked = defs.find((d) => Boolean(d.translation)) ?? defs[0];
          proofDefinition = {
            subjectName: sampleSummary.lesson.unit.subject.name,
            lessonTitle: sampleSummary.lesson.title,
            term: picked.term,
            meaning: picked.meaning,
            translation: picked.translation ?? null,
            isLanguages: sampleSummary.lesson.unit.subject.schoolCategory === "LANGUAGES",
          };
        }
      }
    }

    const mindMapDelegate = (prisma as unknown as {
      mindMap?: {
        findFirst: (args: unknown) => Promise<{
          title: string;
          description: string | null;
          images: string[];
          nodes: unknown;
          edges: unknown;
          lesson: { title: string; unit: { subject: { name: string } } };
        } | null>;
      };
    }).mindMap;

    if (mindMapDelegate && gradeIds.length > 0) {
      const sampleMap = await mindMapDelegate.findFirst({
        where: {
          lesson: {
            isPublished: true,
            unit: {
              isPublished: true,
              subject: {
                isPublished: true,
                isUnderConstruction: false,
                gradeId: { in: gradeIds },
              },
            },
          },
        },
        select: {
          title: true,
          description: true,
          images: true,
          nodes: true,
          edges: true,
          lesson: {
            select: {
              title: true,
              unit: { select: { subject: { select: { name: true } } } },
            },
          },
        },
      });

      const cleanMap = sampleMap ? sanitizeMindMap(sampleMap) : null;
      if (sampleMap && cleanMap && cleanMap.images.length > 0) {
        proofMindMap = {
          subjectName: sampleMap.lesson.unit.subject.name,
          lessonTitle: sampleMap.lesson.title,
          title: cleanMap.title,
          imageUrl: cleanMap.images[0],
          boardsCount: cleanMap.images.length,
        };
      }
    }

    return {
      grades: rawGrades,
      subjects,
      sampleQuestionsByBucket,
      heroQuestions: {
        arabic: heroArabic,
        languages: heroLanguages,
      },
      sampleProofs: {
        questionExample: proofQuestion,
        definitionExample: proofDefinition,
        mindMapExample: proofMindMap,
      },
    };
  } catch (err) {
    console.error("Failed to load landing curriculum data:", err);
    return {
      grades: [],
      subjects: [],
      sampleQuestionsByBucket: [],
      heroQuestions: { arabic: null, languages: null },
      sampleProofs: {
        questionExample: null,
        definitionExample: null,
        mindMapExample: null,
      },
    };
  }
}

/**
 * Loads the signed-in student's latest real saved lesson progress for the optional
 * "كمّل مذاكرتك" landing block. Returns [] when user has no saved progress.
 */
export async function getStudentContinueStudying(
  userId: string,
  scope: CurriculumScope | null
): Promise<LandingContinueItem[]> {
  try {
    const progressRows = await prisma.studentProgress.findMany({
      where: {
        userId,
        lesson: {
          isPublished: true,
          unit: {
            isPublished: true,
            subject: {
              isPublished: true,
              isUnderConstruction: false,
              ...subjectScopeWhere(scope),
            },
          },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
      take: 2,
      select: {
        progressPercent: true,
        isCompleted: true,
        lastAccessedAt: true,
        lesson: {
          select: {
            id: true,
            title: true,
            unit: {
              select: {
                title: true,
                subject: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    return progressRows.map((row) => ({
      lessonId: row.lesson.id,
      lessonTitle: row.lesson.title,
      unitTitle: row.lesson.unit.title,
      subjectId: row.lesson.unit.subject.id,
      subjectName: row.lesson.unit.subject.name,
      progressPercent: row.progressPercent,
      isCompleted: row.isCompleted,
      lastAccessedAt: row.lastAccessedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}
