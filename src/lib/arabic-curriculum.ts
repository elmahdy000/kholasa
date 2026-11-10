import { z } from "zod";

export const ARABIC_CONTENT_BLOCK_TYPES = [
  "teacher_explanation",
  "mind_map",
  "reading_passage",
  "vocabulary",
  "comparison",
  "worked_example",
  "exam_trick",
  "common_mistake",
  "key_takeaway",
  "practice_question",
  "grammar_rule",
  "grammar_table",
  "writing_task",
  "listening_activity",
  "speaking_activity",
] as const;

export type ArabicContentBlockType = (typeof ARABIC_CONTENT_BLOCK_TYPES)[number];

export type ArabicQuestionOriginEnum =
  | "OFFICIAL_TEXTBOOK"
  | "OFFICIAL_TEXTBOOK_ADAPTED"
  | "OFFICIAL_CLASSROOM_ASSESSMENT"
  | "OFFICIAL_HOME_ASSESSMENT"
  | "OFFICIAL_WEEKLY_ASSESSMENT"
  | "OFFICIAL_ASSESSMENTS_ADAPTED"
  | "KHOLASA_ORIGINAL";

export type ArabicSkillCategory =
  | "comprehension"
  | "vocabulary"
  | "argumentation"
  | "reading_unseen"
  | "grammar"
  | "rhetoric"
  | "spelling"
  | "writing"
  | "listening"
  | "general";

export const ARABIC_ORIGIN_LABELS: Record<ArabicQuestionOriginEnum, string> = {
  OFFICIAL_TEXTBOOK: "كتاب الوزارة",
  OFFICIAL_TEXTBOOK_ADAPTED: "مقتبس من كتاب الوزارة",
  OFFICIAL_CLASSROOM_ASSESSMENT: "تقييم صفي رسمي",
  OFFICIAL_HOME_ASSESSMENT: "أداء منزلي رسمي",
  OFFICIAL_WEEKLY_ASSESSMENT: "تقييم أسبوعي رسمي",
  OFFICIAL_ASSESSMENTS_ADAPTED: "التقييمات والأداءات الرسمية",
  KHOLASA_ORIGINAL: "تدريبات الخلاصة",
};

export const ARABIC_SKILL_LABELS: Record<ArabicSkillCategory, string> = {
  comprehension: "الفهم والتحليل",
  vocabulary: "المفردات والدلالة السياقية",
  argumentation: "البنية الحجاجية والإقناع",
  reading_unseen: "النصوص المتحررة",
  grammar: "النحو: الأسماء الخمسة",
  rhetoric: "الأساليب والتذوق البلاغي",
  spelling: "الإملاء والكتابة الصحيحة",
  writing: "التعبير والكتابة",
  listening: "الاستماع والتحدث والمقابلة",
  general: "مراجعة شاملة",
};

export interface ArabicSource {
  id: string;
  fileName: string;
  publisher: string;
  relevantPages?: number[];
}

export interface ArabicSourceReference {
  sourceId: string;
  pages: number[];
}

export interface ArabicStage {
  id: "understand" | "skills" | "practice" | "assessment" | string;
  order: number;
  title: string;
  description: string;
  sectionIds?: string[];
  questionIds?: string[];
  questionCount?: number;
}

export interface ArabicTeacherStep {
  title: string;
  explanationEgyptian: string;
  keyPoint?: string;
}

export interface ArabicWordCard {
  word: string;
  meaning: string;
  source?: string;
  contextSentence?: string;
  explanationEgyptian?: string;
  examTrick?: string;
  linkedQuestionId?: string;
}

export interface ArabicWorkedQuestionItem {
  question: string;
  answer: string;
  steps?: string[];
}

export interface ArabicSectionActivity {
  id?: string;
  type?: string;
  title: string;
  origin?: string;
  sourceReferences?: ArabicSourceReference[];
  sourceScope?: string;
  steps?: string[];
  teacherTip?: string;
  passageSummary?: string;
  workedQuestions?: ArabicWorkedQuestionItem[];
  officialAudioAvailable?: boolean;
  textAvailableInProvidedFiles?: boolean;
  questionsFromBook?: string[];
  answerPolicy?: string;
}

export interface ArabicGrammarCaseRow {
  case: string;
  mark: string;
  example: string;
  note?: string;
}

export interface ArabicWorkedExampleItem {
  sentence: string;
  answer: string;
  highlightWord?: string;
  role?: string;
  caseMark?: string;
  reason?: string;
}

export interface ArabicWritingTaskItem {
  kind: string;
  requirement: string;
  structure: string[];
  modelId?: string;
}

export interface ArabicVisualization {
  type:
    | "timeline"
    | "comparison"
    | "two_cards"
    | "three_cards"
    | "word_cards"
    | "mind_map"
    | "flow"
    | "strategy_cards"
    | "worked_examples"
    | "writing_recipe"
    | "workflow"
    | "review_checklist"
    | string;
  nodes?: string[];
  steps?: string[];
  root?: string;
  branches?: string[];
  left?: { title: string; items: string[] };
  right?: { title: string; items: string[] };
  conclusion?: string;
  cases?: ArabicGrammarCaseRow[];
  conditions?: string[];
  cards?: Array<{
    title?: string;
    items?: string[];
    word?: string;
    meaning?: string;
    source?: string;
    label?: string;
    answer?: string;
    contextSentence?: string;
    explanationEgyptian?: string;
    examTrick?: string;
    linkedQuestionId?: string;
  }>;
  items?: Array<string | { name?: string; evidence?: string }>;
  examples?: ArabicWorkedExampleItem[];
  tasks?: ArabicWritingTaskItem[];
}

export interface ArabicContentBlock<
  T extends ArabicContentBlockType = ArabicContentBlockType,
  P = Record<string, unknown>,
> {
  id: string;
  sectionId: string;
  type: T;
  order: number;
  payload: P;
  media?: {
    audioUrl?: string | null;
    imageUrl?: string | null;
    pdfUrl?: string | null;
    officialAudioAvailable?: boolean;
    caption?: string | null;
  };
  sourceReferences?: ArabicSourceReference[];
  visible: boolean;
}

export interface ArabicNormalizedSection {
  id: string;
  order: number;
  stageId: string;
  skillCategory: ArabicSkillCategory;
  title: string;
  summary: string;
  sourceReferences?: ArabicSourceReference[];
  teacherExplanation: ArabicTeacherStep[];
  examSolvingMethod?: string[];
  commonTraps?: string[];
  visualization?: ArabicVisualization | null;
  keywords?: string[];
  activities?: ArabicSectionActivity[];
  practiceQuestionIds?: string[];
  blocks: ArabicContentBlock[];
}

export interface ArabicWritingModel {
  id: string;
  title: string;
  origin?: string;
  sourceReferences?: ArabicSourceReference[];
  task: string;
  teacherIntro?: string;
  model?: string;
  wordCount?: number;
  howToUse?: string[];
  modelFourLines?: string[];
  outline?: string[];
  evaluationChecklist?: string[];
}

export interface ArabicSourceLimit {
  topic: string;
  fact: string;
  handling: string;
}

export interface ArabicWeeklyCoverage {
  group: string;
  source: string;
  pages: number[];
  focus: string[];
}

export interface ArabicQuestionMeta {
  jsonId: string;
  sectionId: string;
  skillCategory: ArabicSkillCategory;
  originEnum: ArabicQuestionOriginEnum;
  rawOrigin?: string;
  examTrick?: string;
  explanation?: string;
  concept?: string;
  modelAnswer?: string;
  points?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  type?: "MCQ" | "TRUE_FALSE" | "ESSAY";
  sourceReferences?: ArabicSourceReference[];
  displayAfterAnswer?: string[];
}

export interface ArabicNormalizedQuestion extends ArabicQuestionMeta {
  statement: string;
  options?: Array<{ text: string; isCorrect: boolean }>;
}

export interface ArabicLessonPayloadV1 {
  schemaVersion: string;
  contentType: string;
  language: string;
  textDirection: "rtl";
  education: {
    system: string;
    grade: number;
    schoolLanguage: string;
    subject: string;
    term: number;
    unit: { number: number; title: string };
    lesson: {
      number: number;
      title: string;
      textClassification?: string;
      predominantDiscourse?: string;
    };
  };
  sources: ArabicSource[];
  stages: ArabicStage[];
  sections: ArabicNormalizedSection[];
  writingModels: ArabicWritingModel[];
  studentQuickReference?: {
    fiveRules?: string[];
    criticalDistinctions?: Array<{ a: string; b: string; explanation: string }>;
  };
  sourceLimits: ArabicSourceLimit[];
  officialWeeklyAssessmentCoverage: ArabicWeeklyCoverage[];
  finalAssessment?: {
    id: string;
    title: string;
    officialExamClaim: boolean;
    note?: string;
    questionIds: string[];
    grading?: string;
    feedbackDisplay?: string[];
    coverage?: string[];
  };
  practiceStage?: {
    title?: string;
    learningLoop?: string[];
    questionIds?: string[];
  };
  questionMetaByJsonId: Record<string, ArabicQuestionMeta>;
  questions?: ArabicNormalizedQuestion[];
}

export interface ArabicImportValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  duplicateQuestionIds: string[];
  duplicateStatements: string[];
  duplicateSectionIds: string[];
  missingSources: Array<{
    entityType: "section" | "question";
    id: string;
    reason: string;
  }>;
  missingMediaWarnings: string[];
  summary: {
    schemaVersion: string;
    system: string;
    grade: number;
    subject: string;
    unitTitle: string;
    lessonTitle: string;
    stagesCount: number;
    sectionsCount: number;
    blocksCount: number;
    blockTypeCounts: Partial<Record<ArabicContentBlockType, number>>;
    questionsCount: number;
    mcqCount: number;
    tfCount: number;
    essayCount: number;
    originBreakdown: Partial<Record<ArabicQuestionOriginEnum, number>>;
  };
}

const sourceRefSchema = z.object({
  sourceId: z.string().trim().min(1),
  pages: z.array(z.coerce.number().int().min(1)),
});

const rawSourceSchema = z.object({
  id: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  publisher: z.string().trim().min(1),
  relevantPages: z.array(z.coerce.number().int()).optional(),
});

const rawStageSchema = z.object({
  id: z.string().trim().min(1),
  order: z.coerce.number().int().optional(),
  title: z.string().trim().min(1),
  description: z.string().optional().default(""),
  sectionIds: z.array(z.string()).optional(),
  questionIds: z.array(z.string()).optional(),
  questionCount: z.coerce.number().int().optional(),
});

const teacherStepSchema = z.object({
  title: z.string().trim().min(1),
  explanationEgyptian: z.string().trim().min(1),
  keyPoint: z.string().optional(),
});

const rawSectionSchema = z.object({
  id: z.string().trim().min(1),
  order: z.coerce.number().int(),
  stageId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  summary: z.string().optional().default(""),
  sourceReferences: z.array(sourceRefSchema).optional(),
  teacherExplanation: z.array(teacherStepSchema).default([]),
  examSolvingMethod: z.array(z.string()).optional(),
  commonTraps: z.array(z.string()).optional(),
  visualization: z.record(z.string(), z.unknown()).nullable().optional(),
  keywords: z.array(z.string()).optional(),
  activities: z.array(z.record(z.string(), z.unknown())).optional(),
  practiceQuestionIds: z.array(z.string()).optional(),
});

const rawQuestionOptionSchema = z.object({
  text: z.string().trim().min(1),
  isCorrect: z.boolean(),
});

const rawQuestionSchema = z.object({
  id: z.string().trim().min(1),
  sectionId: z.string().trim().min(1),
  type: z.enum(["MCQ", "TRUE_FALSE", "ESSAY"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  statement: z.string().trim().min(1),
  options: z.array(rawQuestionOptionSchema).optional(),
  modelAnswer: z.string().optional(),
  explanation: z.string().optional(),
  examTrick: z.string().optional(),
  concept: z.string().optional(),
  points: z.coerce.number().int().optional(),
  origin: z.string().optional(),
  sourceReferences: z.array(sourceRefSchema).optional(),
  displayAfterAnswer: z.array(z.string()).optional(),
});

const rawArabicLessonInputSchema = z.object({
  schemaVersion: z.string().default("1.0"),
  contentType: z.string().default("arabic_lesson_curriculum"),
  language: z.string().default("ar"),
  textDirection: z.literal("rtl").optional().default("rtl"),
  education: z.object({
    system: z.string().trim().min(1),
    grade: z.coerce.number().int().min(1).max(12),
    schoolLanguage: z.string().trim().min(1),
    subject: z.string().trim().min(1),
    term: z.coerce.number().int().optional().default(1),
    unit: z.object({
      number: z.coerce.number().int().min(1),
      title: z.string().trim().min(1),
    }),
    lesson: z.object({
      number: z.coerce.number().int().min(1),
      title: z.string().trim().min(1),
      textClassification: z.string().optional(),
      predominantDiscourse: z.string().optional(),
    }),
  }),
  sources: z.array(rawSourceSchema).default([]),
  platform: z
    .object({
      stages: z.array(rawStageSchema).min(1),
    })
    .optional(),
  stages: z.array(rawStageSchema).optional(),
  sections: z.array(rawSectionSchema).min(1),
  questionBank: z.array(rawQuestionSchema).optional(),
  questions: z.array(rawQuestionSchema).optional(),
  writingModels: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  studentQuickReference: z.record(z.string(), z.unknown()).optional(),
  sourceLimits: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  officialWeeklyAssessmentCoverage: z
    .array(z.record(z.string(), z.unknown()))
    .optional()
    .default([]),
  finalAssessment: z.record(z.string(), z.unknown()).optional(),
  practiceStage: z.record(z.string(), z.unknown()).optional(),
});

const UNSAFE_HTML_PATTERN = /<\s*script|on\w+\s*=/i;

export function hasUnsafeScriptContent(value: unknown): boolean {
  try {
    return UNSAFE_HTML_PATTERN.test(JSON.stringify(value));
  } catch {
    return true;
  }
}

export function normalizeArabicForDuplicateCheck(input: string): string {
  return input
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[؟?!.,،:؛"«»()\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function mapRawOriginToEnum(raw?: string | null): ArabicQuestionOriginEnum {
  if (!raw) return "KHOLASA_ORIGINAL";
  const key = raw.trim().toLowerCase();
  if (key === "official_textbook" || key === "official_textbook_transcribed") {
    return "OFFICIAL_TEXTBOOK";
  }
  if (key === "official_textbook_adapted" || key === "official_textbook_activity_adapted") {
    return "OFFICIAL_TEXTBOOK_ADAPTED";
  }
  if (key === "official_classroom_assessment") {
    return "OFFICIAL_CLASSROOM_ASSESSMENT";
  }
  if (key === "official_home_assessment") {
    return "OFFICIAL_HOME_ASSESSMENT";
  }
  if (key === "official_weekly_assessment") {
    return "OFFICIAL_WEEKLY_ASSESSMENT";
  }
  if (
    key === "official_assessments_adapted" ||
    key === "official_assessments_transcribed" ||
    key === "official_assessments_guided_analysis"
  ) {
    return "OFFICIAL_ASSESSMENTS_ADAPTED";
  }
  return "KHOLASA_ORIGINAL";
}

export function inferSkillCategoryFromSection(
  sectionId?: string,
  title?: string
): ArabicSkillCategory {
  const sid = (sectionId || "").toLowerCase();
  const t = title || "";

  if (sid.endsWith("s05") || t.includes("المفردات") || t.includes("الدلالة")) {
    return "vocabulary";
  }
  if (
    sid.endsWith("s07") ||
    sid.endsWith("s08") ||
    sid.endsWith("s09") ||
    t.includes("الحجاج") ||
    t.includes("الإقناع")
  ) {
    return "argumentation";
  }
  if (sid.endsWith("s10") || t.includes("المتحرر")) {
    return "reading_unseen";
  }
  if (sid.endsWith("s11") || sid.endsWith("s12") || t.includes("الأسماء الخمسة")) {
    return "grammar";
  }
  if (sid.endsWith("s13") || t.includes("الخبري") || t.includes("الإنشائي")) {
    return "rhetoric";
  }
  if (sid.endsWith("s14") || t.includes("الإملاء") || t.includes("التاء")) {
    return "spelling";
  }
  if (sid.endsWith("s15") || t.includes("التعبير") || t.includes("التلخيص") || t.includes("المقال")) {
    return "writing";
  }
  if (sid.endsWith("s16") || t.includes("الاستماع") || t.includes("المقابلة")) {
    return "listening";
  }
  if (sid.endsWith("s17") || t.includes("مراجعة الدرس")) {
    return "general";
  }
  return "comprehension";
}

function buildSectionBlocks(
  section: z.infer<typeof rawSectionSchema>,
  skillCategory: ArabicSkillCategory,
  questionMetaByJsonId: Record<string, ArabicQuestionMeta>,
  questionsById: Map<string, ArabicNormalizedQuestion>
): ArabicContentBlock[] {
  const blocks: ArabicContentBlock[] = [];
  let order = 1;
  const refs = section.sourceReferences;

  for (const step of section.teacherExplanation) {
    blocks.push({
      id: `${section.id}-b-${order}`,
      sectionId: section.id,
      type: "teacher_explanation",
      order: order++,
      payload: {
        title: step.title,
        explanationEgyptian: step.explanationEgyptian,
        keyPoint: step.keyPoint,
      },
      sourceReferences: refs,
      visible: true,
    });
  }

  const vis = (section.visualization || null) as ArabicVisualization | null;
  if (vis && vis.type) {
    if (vis.type === "mind_map" && vis.root && Array.isArray(vis.branches)) {
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "mind_map",
        order: order++,
        payload: {
          title: "الخريطة الذهنية للأفكار",
          root: vis.root,
          branches: vis.branches,
        },
        sourceReferences: refs,
        visible: true,
      });
    } else if (vis.type === "word_cards" && Array.isArray(vis.cards)) {
      const sectionQuestionIds = section.practiceQuestionIds || [];
      const cards: ArabicWordCard[] = vis.cards.map((c) => {
        const wordText = c.word || "";
        const linked = sectionQuestionIds.find((qid) => {
          const q = questionsById.get(qid);
          return wordText ? Boolean(q?.statement?.includes(wordText)) : false;
        });
        return {
          word: wordText,
          meaning: c.meaning || "",
          source: c.source,
          contextSentence: c.contextSentence,
          explanationEgyptian: c.explanationEgyptian,
          examTrick: c.examTrick,
          linkedQuestionId: c.linkedQuestionId || linked,
        };
      });
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "vocabulary",
        order: order++,
        payload: { cards },
        sourceReferences: refs,
        visible: true,
      });
    } else if (
      vis.type === "comparison" &&
      Array.isArray(vis.cases) &&
      Array.isArray(vis.conditions)
    ) {
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "grammar_rule",
        order: order++,
        payload: {
          title: "شروط إعراب الأسماء الخمسة بالحروف",
          conditions: vis.conditions,
        },
        sourceReferences: refs,
        visible: true,
      });
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "grammar_table",
        order: order++,
        payload: {
          title: "جدول علامات الإعراب الفرعية للأسماء الخمسة",
          rows: vis.cases,
        },
        sourceReferences: refs,
        visible: true,
      });
    } else if (vis.type === "worked_examples" && Array.isArray(vis.examples)) {
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "worked_example",
        order: order++,
        payload: { examples: vis.examples },
        sourceReferences: refs,
        visible: true,
      });
    } else if (vis.type === "writing_recipe" && Array.isArray(vis.tasks)) {
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "writing_task",
        order: order++,
        payload: { tasks: vis.tasks },
        sourceReferences: refs,
        visible: true,
      });
    } else if (
      vis.type === "comparison" ||
      vis.type === "two_cards" ||
      vis.type === "three_cards" ||
      vis.type === "timeline" ||
      vis.type === "flow"
    ) {
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "comparison",
        order: order++,
        payload: {
          visualVariant: vis.type,
          skillCategory,
          left: vis.left,
          right: vis.right,
          cards: vis.cards,
          nodes: vis.nodes,
          steps: vis.steps,
          conclusion: vis.conclusion,
        },
        sourceReferences: refs,
        visible: true,
      });
    } else {
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "key_takeaway",
        order: order++,
        payload: {
          visualVariant: vis.type,
          items: vis.items,
          steps: vis.steps,
          keywords: section.keywords || [],
        },
        sourceReferences: refs,
        visible: true,
      });
    }
  }

  for (const rawAct of section.activities || []) {
    const act = rawAct as unknown as ArabicSectionActivity;
    const actRefs = act.sourceReferences || refs;
    if (act.type === "listening") {
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "listening_activity",
        order: order++,
        payload: {
          title: act.title,
          officialAudioAvailable: Boolean(act.officialAudioAvailable),
          textAvailableInProvidedFiles: Boolean(act.textAvailableInProvidedFiles),
          questionsFromBook: act.questionsFromBook || [],
          answerPolicy: act.answerPolicy || "",
        },
        media: {
          officialAudioAvailable: Boolean(act.officialAudioAvailable),
          audioUrl: null,
        },
        sourceReferences: actRefs,
        visible: true,
      });
    } else if (act.passageSummary || (act.workedQuestions && act.workedQuestions.length > 0)) {
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "reading_passage",
        order: order++,
        payload: {
          id: act.id,
          title: act.title,
          origin: act.origin,
          passageSummary: act.passageSummary,
          workedQuestions: act.workedQuestions || [],
        },
        sourceReferences: actRefs,
        visible: true,
      });
    } else {
      blocks.push({
        id: `${section.id}-b-${order}`,
        sectionId: section.id,
        type: "speaking_activity",
        order: order++,
        payload: {
          id: act.id,
          title: act.title,
          origin: act.origin,
          sourceScope: act.sourceScope,
          steps: act.steps || [],
          teacherTip: act.teacherTip,
        },
        sourceReferences: actRefs,
        visible: true,
      });
    }
  }

  if (section.examSolvingMethod && section.examSolvingMethod.length > 0) {
    blocks.push({
      id: `${section.id}-b-${order}`,
      sectionId: section.id,
      type: "exam_trick",
      order: order++,
      payload: {
        title: "إزاي تحل سؤال على الجزئية دي في الامتحان؟",
        items: section.examSolvingMethod,
      },
      sourceReferences: refs,
      visible: true,
    });
  }

  if (section.commonTraps && section.commonTraps.length > 0) {
    blocks.push({
      id: `${section.id}-b-${order}`,
      sectionId: section.id,
      type: "common_mistake",
      order: order++,
      payload: {
        title: "احذر هذه التركات والأخطاء الشائعة",
        items: section.commonTraps,
      },
      sourceReferences: refs,
      visible: true,
    });
  }

  if (section.keywords && section.keywords.length > 0 && vis?.type !== "review_checklist") {
    blocks.push({
      id: `${section.id}-b-${order}`,
      sectionId: section.id,
      type: "key_takeaway",
      order: order++,
      payload: {
        title: "مصطلحات ومفاهيم مفتاحية",
        keywords: section.keywords,
        summary: section.summary,
      },
      sourceReferences: refs,
      visible: true,
    });
  }

  const linkedIds = (section.practiceQuestionIds || []).filter((qid) =>
    Boolean(questionMetaByJsonId[qid])
  );
  if (linkedIds.length > 0) {
    blocks.push({
      id: `${section.id}-b-${order}`,
      sectionId: section.id,
      type: "practice_question",
      order: order++,
      payload: {
        title: `تطبيق مباشر على «${section.title}»`,
        questionIds: linkedIds,
      },
      sourceReferences: refs,
      visible: true,
    });
  }

  return blocks;
}

export function validateAndAdaptArabicLessonJson(rawInput: unknown): {
  payload: ArabicLessonPayloadV1 | null;
  report: ArabicImportValidationReport;
} {
  const emptyReport: ArabicImportValidationReport = {
    valid: false,
    errors: [],
    warnings: [],
    duplicateQuestionIds: [],
    duplicateStatements: [],
    duplicateSectionIds: [],
    missingSources: [],
    missingMediaWarnings: [],
    summary: {
      schemaVersion: "1.0",
      system: "",
      grade: 0,
      subject: "",
      unitTitle: "",
      lessonTitle: "",
      stagesCount: 0,
      sectionsCount: 0,
      blocksCount: 0,
      blockTypeCounts: {},
      questionsCount: 0,
      mcqCount: 0,
      tfCount: 0,
      essayCount: 0,
      originBreakdown: {},
    },
  };

  if (!rawInput || typeof rawInput !== "object") {
    emptyReport.errors.push("الملف المرفوع يجب أن يكون بصيغة JSON صالحة (كائن رئيسي).");
    return { payload: null, report: emptyReport };
  }

  if (hasUnsafeScriptContent(rawInput)) {
    emptyReport.errors.push("تم رفض المحتوى لاحتوائه على وسوم برمجية غير آمنة (<script> أو معالجات أحداث).");
    return { payload: null, report: emptyReport };
  }

  const parsed = rawArabicLessonInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    for (const issue of parsed.error.issues.slice(0, 12)) {
      emptyReport.errors.push(`${issue.path.join(".") || "root"}: ${issue.message}`);
    }
    return { payload: null, report: emptyReport };
  }

  const data = parsed.data;
  const errors: string[] = [];
  const warnings: string[] = [];
  const duplicateSectionIds: string[] = [];
  const duplicateQuestionIds: string[] = [];
  const duplicateStatements: string[] = [];
  const missingSources: ArabicImportValidationReport["missingSources"] = [];
  const missingMediaWarnings: string[] = [];

  const sourceIds = new Set(data.sources.map((s) => s.id));
  if (data.sources.length === 0) {
    warnings.push("لا توجد مصادر رسمية مرفقة في مصفوفة sources.");
  }

  const rawStages = data.platform?.stages || data.stages || [];
  if (rawStages.length === 0) {
    errors.push("يجب تحديد المراحل التعليمية الأربع (platform.stages).");
  }

  const sectionIdSet = new Set<string>();
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);
  for (const sec of sortedSections) {
    if (sectionIdSet.has(sec.id)) {
      duplicateSectionIds.push(sec.id);
      errors.push(`معرف القسم مكرر: ${sec.id}`);
    } else {
      sectionIdSet.add(sec.id);
    }

    if (!sec.sourceReferences || sec.sourceReferences.length === 0) {
      missingSources.push({
        entityType: "section",
        id: sec.id,
        reason: "القسم لا يحتوي على sourceReferences",
      });
    } else {
      for (const sr of sec.sourceReferences) {
        if (!sourceIds.has(sr.sourceId)) {
          missingSources.push({
            entityType: "section",
            id: sec.id,
            reason: `مرجع المصدر غير معرف: ${sr.sourceId}`,
          });
        }
      }
    }
  }

  const rawQuestions = data.questionBank || data.questions || [];
  const seenQuestionIds = new Set<string>();
  const seenStatements = new Map<string, string>();
  const normalizedQuestions: ArabicNormalizedQuestion[] = [];
  const questionMetaByJsonId: Record<string, ArabicQuestionMeta> = {};
  const questionsById = new Map<string, ArabicNormalizedQuestion>();

  let mcqCount = 0;
  let tfCount = 0;
  let essayCount = 0;
  const originBreakdown: Partial<Record<ArabicQuestionOriginEnum, number>> = {};

  for (const q of rawQuestions) {
    if (seenQuestionIds.has(q.id)) {
      duplicateQuestionIds.push(q.id);
      errors.push(`معرف السؤال مكرر: ${q.id}`);
      continue;
    }
    seenQuestionIds.add(q.id);

    const normStmt = normalizeArabicForDuplicateCheck(q.statement);
    if (seenStatements.has(normStmt)) {
      const existingId = seenStatements.get(normStmt)!;
      duplicateStatements.push(`${q.id} ↔ ${existingId}`);
      errors.push(`نص السؤال مكرر (${q.id} يطابق ${existingId}): «${q.statement.slice(0, 60)}»`);
    } else {
      seenStatements.set(normStmt, q.id);
    }

    if (!sectionIdSet.has(q.sectionId)) {
      errors.push(`السؤال ${q.id} يشير إلى قسم غير موجود: ${q.sectionId}`);
    }

    if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
      if (!q.options || q.options.length < 2) {
        errors.push(`السؤال ${q.id} (${q.type}) يجب أن يحتوي على خيارين على الأقل.`);
      } else if (!q.options.some((opt) => opt.isCorrect)) {
        errors.push(`السؤال ${q.id} (${q.type}) لا يحتوي على أي خيار صحيح.`);
      }
    } else if (q.type === "ESSAY" && !q.modelAnswer?.trim()) {
      warnings.push(`السؤال المقالي ${q.id} لا يحتوي على إجابة نموذجية.`);
    }

    if (!q.sourceReferences || q.sourceReferences.length === 0) {
      missingSources.push({
        entityType: "question",
        id: q.id,
        reason: "السؤال لا يحتوي على sourceReferences",
      });
    }

    if (q.type === "MCQ") mcqCount++;
    else if (q.type === "TRUE_FALSE") tfCount++;
    else essayCount++;

    const originEnum = mapRawOriginToEnum(q.origin);
    originBreakdown[originEnum] = (originBreakdown[originEnum] || 0) + 1;

    const secObj = sortedSections.find((s) => s.id === q.sectionId);
    const skillCategory = inferSkillCategoryFromSection(q.sectionId, secObj?.title);

    const meta: ArabicQuestionMeta = {
      jsonId: q.id,
      sectionId: q.sectionId,
      skillCategory,
      originEnum,
      rawOrigin: q.origin,
      examTrick: q.examTrick,
      explanation: q.explanation,
      concept: q.concept,
      modelAnswer: q.modelAnswer,
      points: q.points,
      difficulty: q.difficulty,
      type: q.type,
      sourceReferences: q.sourceReferences,
      displayAfterAnswer: q.displayAfterAnswer,
    };

    const normalizedQ: ArabicNormalizedQuestion = {
      ...meta,
      statement: q.statement,
      options: q.options,
    };

    questionMetaByJsonId[q.id] = meta;
    questionsById.set(q.id, normalizedQ);
    normalizedQuestions.push(normalizedQ);
  }

  for (const stage of rawStages) {
    for (const sid of stage.sectionIds || []) {
      if (!sectionIdSet.has(sid)) {
        errors.push(`المرحلة ${stage.id} تشير إلى قسم غير موجود: ${sid}`);
      }
    }
  }
  for (const sec of sortedSections) {
    for (const qid of sec.practiceQuestionIds || []) {
      if (!seenQuestionIds.has(qid)) {
        errors.push(`القسم ${sec.id} يشير إلى سؤال غير موجود في questionBank: ${qid}`);
      }
    }
  }

  const normalizedStages: ArabicStage[] = rawStages.map((s, idx) => ({
    id: s.id,
    order: s.order ?? idx + 1,
    title: s.title,
    description: s.description || "",
    sectionIds: s.sectionIds,
    questionIds: s.questionIds,
    questionCount:
      s.questionIds?.length ??
      s.questionCount ??
      (s.id === "practice" ? normalizedQuestions.length : undefined),
  }));

  const blockTypeCounts: Partial<Record<ArabicContentBlockType, number>> = {};
  let totalBlocksCount = 0;

  const normalizedSections: ArabicNormalizedSection[] = sortedSections.map((sec) => {
    const skillCategory = inferSkillCategoryFromSection(sec.id, sec.title);
    const blocks = buildSectionBlocks(
      sec,
      skillCategory,
      questionMetaByJsonId,
      questionsById
    );
    for (const b of blocks) {
      blockTypeCounts[b.type] = (blockTypeCounts[b.type] || 0) + 1;
      totalBlocksCount++;
      if (b.type === "listening_activity" && !b.media?.officialAudioAvailable) {
        missingMediaWarnings.push(
          `نشاط الاستماع «${String((b.payload as { title?: string }).title || sec.title)}»: المقطع الصوتي الرسمي غير متوفر بعد.`
        );
      }
    }

    return {
      id: sec.id,
      order: sec.order,
      stageId: sec.stageId,
      skillCategory,
      title: sec.title,
      summary: sec.summary || "",
      sourceReferences: sec.sourceReferences,
      teacherExplanation: sec.teacherExplanation,
      examSolvingMethod: sec.examSolvingMethod,
      commonTraps: sec.commonTraps,
      visualization: (sec.visualization || null) as ArabicVisualization | null,
      keywords: sec.keywords,
      activities: (sec.activities || []) as unknown as ArabicSectionActivity[],
      practiceQuestionIds: sec.practiceQuestionIds,
      blocks,
    };
  });

  const sourceLimits = (data.sourceLimits || []) as unknown as ArabicSourceLimit[];
  for (const limit of sourceLimits) {
    if (limit.topic && limit.fact) {
      warnings.push(`${limit.topic}: ${limit.fact}`);
    }
  }

  if (missingSources.length > 0) {
    warnings.push(`يوجد ${missingSources.length} عنصر بدون مرجع مصدر مكتمل.`);
  }

  const normalizedPayload: ArabicLessonPayloadV1 = {
    schemaVersion: data.schemaVersion,
    contentType: data.contentType,
    language: data.language,
    textDirection: "rtl",
    education: data.education,
    sources: data.sources,
    stages: normalizedStages,
    sections: normalizedSections,
    writingModels: data.writingModels as unknown as ArabicWritingModel[],
    studentQuickReference: data.studentQuickReference as ArabicLessonPayloadV1["studentQuickReference"],
    sourceLimits,
    officialWeeklyAssessmentCoverage:
      data.officialWeeklyAssessmentCoverage as unknown as ArabicWeeklyCoverage[],
    finalAssessment: data.finalAssessment as ArabicLessonPayloadV1["finalAssessment"],
    practiceStage: data.practiceStage as ArabicLessonPayloadV1["practiceStage"],
    questionMetaByJsonId,
    questions: normalizedQuestions,
  };

  const report: ArabicImportValidationReport = {
    valid: errors.length === 0,
    errors,
    warnings,
    duplicateQuestionIds,
    duplicateStatements,
    duplicateSectionIds,
    missingSources,
    missingMediaWarnings,
    summary: {
      schemaVersion: data.schemaVersion,
      system: data.education.system,
      grade: data.education.grade,
      subject: data.education.subject,
      unitTitle: data.education.unit.title,
      lessonTitle: data.education.lesson.title,
      stagesCount: normalizedStages.length,
      sectionsCount: normalizedSections.length,
      blocksCount: totalBlocksCount,
      blockTypeCounts,
      questionsCount: normalizedQuestions.length,
      mcqCount,
      tfCount,
      essayCount,
      originBreakdown,
    },
  };

  return {
    payload: errors.length === 0 ? normalizedPayload : null,
    report,
  };
}

export function isArabicLessonPayload(val: unknown): val is ArabicLessonPayloadV1 {
  if (!val || typeof val !== "object") return false;
  const obj = val as Record<string, unknown>;
  return (
    Array.isArray(obj.stages) &&
    obj.stages.length > 0 &&
    Array.isArray(obj.sections) &&
    obj.sections.length > 0 &&
    typeof obj.education === "object" &&
    obj.education !== null
  );
}

export function sanitizeArabicPayloadForStudent(
  payload: ArabicLessonPayloadV1
): ArabicLessonPayloadV1 {
  const safeMeta: Record<string, ArabicQuestionMeta> = {};
  for (const [qid, meta] of Object.entries(payload.questionMetaByJsonId || {})) {
    safeMeta[qid] = {
      jsonId: meta.jsonId,
      sectionId: meta.sectionId,
      skillCategory: meta.skillCategory,
      originEnum: meta.originEnum,
      rawOrigin: meta.rawOrigin,
      points: meta.points,
      difficulty: meta.difficulty,
      type: meta.type,
      sourceReferences: meta.sourceReferences,
      displayAfterAnswer: meta.displayAfterAnswer,
    };
  }

  return {
    ...payload,
    questionMetaByJsonId: safeMeta,
    questions: undefined,
  };
}

export function buildArabicLessonBodyAndObjectives(payload: ArabicLessonPayloadV1): {
  body: string;
  objectives: string[];
  mindMapNodes: Array<{ id: string; label: string; category?: string }>;
  mindMapEdges: Array<{ id: string; source: string; target: string }>;
} {
  const objectives = payload.sections.slice(0, 6).map((s) => `${s.title}: ${s.summary}`);
  const body = payload.sections
    .map((sec) => {
      const steps = sec.teacherExplanation
        .map((st) => `### ${st.title}\n${st.explanationEgyptian}${st.keyPoint ? `\n**الخلاصة:** ${st.keyPoint}` : ""}`)
        .join("\n\n");
      return `## ${sec.title}\n${sec.summary}\n\n${steps}`;
    })
    .join("\n\n---\n\n");

  const rootId = "root-lesson";
  const mindMapNodes: Array<{ id: string; label: string; category?: string }> = [
    { id: rootId, label: payload.education.lesson.title, category: "root" },
  ];
  const mindMapEdges: Array<{ id: string; source: string; target: string }> = [];

  for (const stage of payload.stages) {
    const stageNodeId = `stage-${stage.id}`;
    mindMapNodes.push({ id: stageNodeId, label: stage.title, category: "stage" });
    mindMapEdges.push({ id: `edge-${rootId}-${stageNodeId}`, source: rootId, target: stageNodeId });
  }

  for (const sec of payload.sections) {
    mindMapNodes.push({ id: sec.id, label: sec.title, category: sec.skillCategory });
    mindMapEdges.push({
      id: `edge-stage-${sec.stageId}-${sec.id}`,
      source: `stage-${sec.stageId}`,
      target: sec.id,
    });
  }

  return { body, objectives, mindMapNodes, mindMapEdges };
}
