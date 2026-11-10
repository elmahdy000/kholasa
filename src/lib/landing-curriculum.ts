import { prisma } from "@/lib/prisma";
import type {
  LandingCurriculumPayload,
  LandingDefinitionItem,
  LandingHeroHighlight,
  LandingLessonItem,
  LandingMindMapData,
  LandingPreviewQuestionPublic,
  LandingSubjectItem,
  LandingUnitItem,
} from "@/components/landing/types";

export type {
  LandingCurriculumPayload,
  LandingDefinitionItem,
  LandingHeroHighlight,
  LandingLessonItem,
  LandingMindMapData,
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
          subject: { isPublished: true },
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
 * Loads strictly verified, published Baccalaureate curriculum data for the landing page.
 * Never exposes isCorrect or explanation answers ahead of submission.
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
              gradeId: { in: gradeIds },
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
                    include: {
                      summary: { select: { definitions: true } },
                      mindMap: {
                        select: {
                          title: true,
                          description: true,
                          images: true,
                          nodes: true,
                          edges: true,
                        },
                      },
                      _count: {
                        select: {
                          questions: {
                            where: { question: { status: "PUBLISHED" } },
                          },
                        },
                      },
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

    const subjects: LandingSubjectItem[] = [];
    let heroArabic: LandingHeroHighlight | null = null;
    let heroLanguages: LandingHeroHighlight | null = null;
    let proofQuestion: LandingCurriculumPayload["sampleProofs"]["questionExample"] = null;
    let proofDefinition: LandingCurriculumPayload["sampleProofs"]["definitionExample"] = null;
    let proofMindMap: LandingCurriculumPayload["sampleProofs"]["mindMapExample"] = null;

    const allLessonIds = rawSubjects.flatMap((s) =>
      s.units.flatMap((u) => u.lessons.map((l) => l.id))
    );

    const mcqEntries = await Promise.all(
      allLessonIds.map(async (lessonId) => ({
        lessonId,
        mcq: await pickDeterministicPreviewMcq(lessonId),
      }))
    );

    const mcqMap = new Map(mcqEntries.map((e) => [e.lessonId, e.mcq]));

    for (const s of rawSubjects) {
      let publishedLessonsCount = 0;
      const units: LandingUnitItem[] = [];

      for (const u of s.units) {
        const lessons: LandingLessonItem[] = [];

        for (const l of u.lessons) {
          publishedLessonsCount++;
          const rawMcq = mcqMap.get(l.id) ?? null;
          const publicMcq = rawMcq ? toPublicQuestion(l.id, rawMcq) : null;
          const defs = sanitizeDefinitions(l.summary?.definitions);
          const mindMap = sanitizeMindMap(l.mindMap);

          if (publicMcq) {
            if (s.schoolCategory === "ARABIC" && !heroArabic) {
              heroArabic = {
                schoolCategory: "ARABIC",
                subjectName: s.name,
                unitTitle: u.title,
                lessonId: l.id,
                lessonTitle: l.title,
                question: publicMcq,
              };
            }
            if (s.schoolCategory === "LANGUAGES" && !heroLanguages) {
              heroLanguages = {
                schoolCategory: "LANGUAGES",
                subjectName: s.name,
                unitTitle: u.title,
                lessonId: l.id,
                lessonTitle: l.title,
                question: publicMcq,
              };
            }

            // Pick an example with non-generic concept when possible for Feature Proof #1
            if (rawMcq && rawMcq.explanation && s.schoolCategory === "ARABIC") {
              const hasNonGeneric =
                rawMcq.explanation.concept &&
                !GENERIC_CONCEPTS.has(rawMcq.explanation.concept.trim().toLowerCase());
              if (!proofQuestion || (hasNonGeneric && !GENERIC_CONCEPTS.has(proofQuestion.concept?.trim().toLowerCase() ?? "") === false)) {
                const correctOpt = rawMcq.options.find((o) => o.isCorrect);
                if (correctOpt && (!proofQuestion || hasNonGeneric)) {
                  proofQuestion = {
                    subjectName: s.name,
                    lessonTitle: l.title,
                    statement: rawMcq.statement,
                    correctAnswerText: correctOpt.text,
                    concept: rawMcq.explanation.concept,
                    correctReason: rawMcq.explanation.correctReason,
                  };
                }
              }
            }
          }

          if (!proofDefinition && defs.length > 0 && s.schoolCategory === "LANGUAGES") {
            const firstWithTrans = defs.find((d) => Boolean(d.translation)) ?? defs[0];
            proofDefinition = {
              subjectName: s.name,
              lessonTitle: l.title,
              term: firstWithTrans.term,
              meaning: firstWithTrans.meaning,
              translation: firstWithTrans.translation ?? null,
              isLanguages: true,
            };
          }

          if (!proofMindMap && mindMap && mindMap.images.length > 0) {
            proofMindMap = {
              subjectName: s.name,
              lessonTitle: l.title,
              title: mindMap.title,
              imageUrl: mindMap.images[0],
              boardsCount: mindMap.images.length,
            };
          }

          lessons.push({
            id: l.id,
            title: l.title,
            order: l.order,
            durationMinutes: l.durationMinutes,
            publishedQuestionsCount: l._count.questions,
            definitions: defs,
            mindMap,
            previewMcq: publicMcq,
          });
        }

        units.push({
          id: u.id,
          title: u.title,
          description: u.description,
          order: u.order,
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

    if (!proofDefinition) {
      for (const s of subjects) {
        const lWithDef = s.units.flatMap((u) => u.lessons).find((l) => l.definitions.length > 0);
        if (lWithDef) {
          const d = lWithDef.definitions[0];
          proofDefinition = {
            subjectName: s.name,
            lessonTitle: lWithDef.title,
            term: d.term,
            meaning: d.meaning,
            translation: d.translation ?? null,
            isLanguages: s.schoolCategory === "LANGUAGES",
          };
          break;
        }
      }
    }

    return {
      grades: rawGrades,
      subjects,
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
      heroQuestions: { arabic: null, languages: null },
      sampleProofs: {
        questionExample: null,
        definitionExample: null,
        mindMapExample: null,
      },
    };
  }
}
