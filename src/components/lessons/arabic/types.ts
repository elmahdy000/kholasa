import type {
  ArabicContentBlock,
  ArabicLessonPayloadV1,
  ArabicNormalizedSection,
  ArabicQuestionMeta,
  ArabicSectionActivity,
  ArabicSource,
  ArabicSourceLimit,
  ArabicSourceReference,
  ArabicStage,
  ArabicTeacherStep,
  ArabicVisualization,
  ArabicWeeklyCoverage,
  ArabicWritingModel,
} from "@/lib/arabic-curriculum";
import { isArabicLessonPayload } from "@/lib/arabic-curriculum";

export type {
  ArabicContentBlock,
  ArabicQuestionMeta,
  ArabicSectionActivity,
  ArabicSource,
  ArabicSourceLimit,
  ArabicSourceReference,
  ArabicStage,
  ArabicTeacherStep,
  ArabicVisualization,
  ArabicWeeklyCoverage,
  ArabicWritingModel,
};

export type ArabicSection = ArabicNormalizedSection;
export type ArabicLessonStructuredData = ArabicLessonPayloadV1;

export interface ArabicSectionProgressItem {
  id?: string;
  sectionAnchorId: string;
  stageId: string;
  isCompleted: boolean;
  lastVisitedAt: string;
  state?: Record<string, unknown> | null;
}

export function isArabicStructuredData(
  val: unknown
): val is ArabicLessonStructuredData {
  return isArabicLessonPayload(val);
}

export function formatSourceReferences(
  refs: ArabicSourceReference[] | undefined,
  sources?: ArabicSource[]
): string | null {
  if (!refs || refs.length === 0) return null;
  return refs
    .map((r) => {
      const matched = sources?.find((s) => s.id === r.sourceId);
      const label =
        matched?.id === "assessments" || r.sourceId === "assessments"
          ? "التقييمات الرسمية"
          : "كتاب الوزارة";
      return `${label} ص ${r.pages.join("، ")}`;
    })
    .join(" • ");
}
