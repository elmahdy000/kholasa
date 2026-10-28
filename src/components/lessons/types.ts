export interface LessonContent {
  id: string;
  body: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
  objectives: string[];
}

export interface Definition {
  term: string;
  meaning: string;
}

export interface Formula {
  title: string;
  code: string;
}

export interface Comparison {
  aspect: string;
  first: string;
  second: string;
}

export interface Mistake {
  mistake: string;
  correction: string;
}

export interface ChecklistItem {
  task: string;
  completed?: boolean;
}

export interface LessonSummary {
  id: string;
  keyConcepts: string[];
  definitions?: Definition[];
  formulas?: Formula[];
  comparisons?: Comparison[];
  examTips?: string[];
  commonMistakes?: Mistake[];
  checklist?: ChecklistItem[];
}

export interface MindNode {
  id: string;
  label: string;
  level: number;
  description?: string;
}

export interface MindEdge {
  id: string;
  source: string;
  target: string;
}

export interface MindMap {
  id: string;
  title: string;
  images?: string[];
  description?: string | null;
  nodes: MindNode[];
  edges: MindEdge[];
}

export interface QuestionOption {
  id: string;
  text: string;
  order: number;
}

export interface QuestionExplanation {
  id: string;
  concept: string;
  correctReason: string;
  sectionId?: string | null;
}

export interface RevealedOption {
  id: string;
  isCorrect?: boolean;
  explanation?: string | null;
}

export interface RevealedQuestion {
  isCorrect?: boolean;
  correctOptionId?: string;
  explanation?: QuestionExplanation | null;
  options?: RevealedOption[];
}

export interface RubricCriterion {
  point: string;
  marks: number;
}

export interface QuestionRubric {
  modelAnswer: string;
  criteria?: RubricCriterion[] | any;
  maxScore: number;
}

export interface Question {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  options: QuestionOption[];
  rubric?: QuestionRubric | null;
  explanation?: QuestionExplanation | null;
}

export interface QuestionAnswerState {
  selectedOptionId: string;
  revealed: boolean;
  isCorrect: boolean;
  reveal?: RevealedQuestion;
}

export interface LessonViewerProps {
  lesson: {
    id: string;
    title: string;
    durationMinutes: number;
    unit: {
      id: string;
      title: string;
      subject: {
        id: string;
        name: string;
        color?: string | null;
      };
      lessons: { id: string; title: string; order: number }[];
    };
    content?: LessonContent | null;
    summary?: LessonSummary | null;
    mindMap?: MindMap | null;
    questions: { question: Question }[];
  };
  initialIsBookmarked: boolean;
  initialIsCompleted: boolean;
  userId?: string | null;
}

export type FlowFilterType =
  | "all"
  | "summary"
  | "definitions"
  | "mcq"
  | "essay"
  | "assessments"
  | "true_false";

export type MasteryRatingType = "mastered" | "review" | "unclear";
