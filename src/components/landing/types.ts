export type LandingTabType = "zatona" | "questions" | "mistakes" | "mindmap";

export interface FaqItem {
  q: string;
  a: string;
}

export interface DemoMcqOption {
  id: number;
  text: string;
  isCorrect: boolean;
  reason: string;
}
