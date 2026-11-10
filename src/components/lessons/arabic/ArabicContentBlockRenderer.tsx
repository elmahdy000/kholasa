"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookmarkCheck,
  CheckCircle2,
  GitBranch,
  Lightbulb,
  Sparkles,
  Tag,
} from "lucide-react";
import type {
  ArabicContentBlock,
  ArabicGrammarCaseRow,
  ArabicWordCard,
  ArabicWorkedExampleItem,
  ArabicWorkedQuestionItem,
  ArabicWritingModel,
  ArabicWritingTaskItem,
} from "@/lib/arabic-curriculum";
import type {
  ArabicSource,
  ArabicVisualization,
} from "./types";
import type { Question, QuestionAnswerState } from "../types";
import { formatSourceReferences } from "./types";
import { ArabicVocabularyTrainer } from "./ArabicVocabularyTrainer";
import { ArabicArgumentFlow } from "./ArabicArgumentFlow";
import {
  ArabicGrammarRuleBlock,
  ArabicGrammarTableBlock,
  ArabicWorkedExamplesBlock,
} from "./ArabicGrammarModule";
import { ArabicReadingPassageViewer } from "./ArabicReadingPassageViewer";
import { ArabicWritingLab } from "./ArabicWritingLab";
import {
  ArabicListeningActivityBlock,
  ArabicSpeakingActivityBlock,
} from "./ArabicListeningSpeaking";
import { ArabicSectionVisualizer } from "./ArabicSectionVisualizer";
import { ArabicQuestionCard } from "./ArabicQuestionCard";

interface ArabicContentBlockRendererProps {
  block: ArabicContentBlock;
  sources?: ArabicSource[];
  writingModels?: ArabicWritingModel[];
  questionsMap?: Map<string, Question>;
  questionMetaByJsonId?: Record<string, { examTrick?: string; originEnum?: string; rawOrigin?: string; skillCategory?: string; sourceReferences?: Array<{ sourceId: string; pages: number[] }> }>;
  sectionSolvingTip?: string;
  answerStates?: Record<string, QuestionAnswerState>;
  essayDrafts?: Record<string, string>;
  essayRevealed?: Record<string, boolean>;
  markedForReviewIds?: Set<string>;
  writingDraftState?: {
    drafts?: Record<string, string>;
    checklist?: Record<string, boolean>;
  };
  onPracticeQuestionClick?: (questionId: string) => void;
  onSelectOption?: (questionId: string, optionId: string) => void;
  onChangeEssayDraft?: (questionId: string, value: string) => void;
  onRevealEssay?: (questionId: string, draftText?: string) => Promise<void> | void;
  onToggleEssayReview?: (questionId: string, mark: boolean, essayText?: string) => Promise<void> | void;
  onSaveWritingDraftState?: (drafts: Record<string, string>, checklist: Record<string, boolean>) => Promise<void> | void;
}

export function ArabicContentBlockRenderer({
  block,
  sources,
  writingModels = [],
  questionsMap,
  sectionSolvingTip,
  answerStates = {},
  essayDrafts = {},
  essayRevealed = {},
  markedForReviewIds,
  writingDraftState,
  onPracticeQuestionClick,
  onSelectOption,
  onChangeEssayDraft,
  onRevealEssay,
  onToggleEssayReview,
  onSaveWritingDraftState,
}: ArabicContentBlockRendererProps) {
  const [checkedChecklist, setCheckedChecklist] = useState<Record<number, boolean>>({});

  if (!block.visible) return null;

  const p = block.payload || {};
  const sourceBadge = formatSourceReferences(block.sourceReferences, sources);

  switch (block.type) {
    case "teacher_explanation": {
      const title = String(p.title || "");
      const body = String(p.explanationEgyptian || "");
      const keyPoint = p.keyPoint ? String(p.keyPoint) : null;
      return (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-2xs space-y-2.5 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h4 className="text-sm sm:text-base font-black text-[#091B40] dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] dark:bg-[#60A5FA] shrink-0" />
              <span>{title}</span>
            </h4>
            {sourceBadge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#132C60] text-[#475569] dark:text-[#CBD5E1]">
                {sourceBadge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-[15px] font-medium text-[#1E293B] dark:text-[#E2E8F0] leading-[1.9] break-words">
            {body}
          </p>
          {keyPoint && (
            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2 text-xs sm:text-[13px] font-bold text-emerald-900 dark:text-emerald-200">
              <BookmarkCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-300" />
              <span>الخلاصة: {keyPoint}</span>
            </div>
          )}
        </div>
      );
    }

    case "mind_map": {
      const root = String(p.root || "");
      const branches = Array.isArray(p.branches) ? (p.branches as string[]) : [];
      return (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-4">
          <div className="flex items-center justify-center">
            <div className="px-4 sm:px-5 py-3 rounded-2xl bg-[#091B40] text-white text-xs sm:text-sm font-black text-center shadow-xs flex items-center gap-2 max-w-full">
              <GitBranch className="w-4 h-4 text-[#E9AD32] shrink-0" />
              <span className="break-words">{root}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {branches.map((branch, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-white flex items-center gap-2.5 min-w-0"
              >
                <span className="w-6 h-6 rounded-lg bg-[#0F5132] text-white text-[11px] font-black flex items-center justify-center shrink-0 tabular-nums">
                  {idx + 1}
                </span>
                <span className="break-words">{branch}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "vocabulary": {
      const cards = Array.isArray(p.cards) ? (p.cards as ArabicWordCard[]) : [];
      return (
        <ArabicVocabularyTrainer
          cards={cards}
          onPracticeQuestion={onPracticeQuestionClick}
        />
      );
    }

    case "reading_passage": {
      return (
        <ArabicReadingPassageViewer
          title={String(p.title || "نص القراءة التحليلي")}
          passageSummary={p.passageSummary ? String(p.passageSummary) : undefined}
          fullText={p.fullText ? String(p.fullText) : undefined}
          origin={p.origin ? String(p.origin) : undefined}
          workedQuestions={
            Array.isArray(p.workedQuestions)
              ? (p.workedQuestions as ArabicWorkedQuestionItem[])
              : []
          }
        />
      );
    }

    case "comparison": {
      const variant = String(p.visualVariant || "comparison");
      const steps = Array.isArray(p.steps) ? (p.steps as string[]) : null;
      if (variant === "flow" && steps && steps.length > 0) {
        return <ArabicArgumentFlow steps={steps} />;
      }
      const vis: ArabicVisualization = {
        type: variant,
        left: p.left as ArabicVisualization["left"],
        right: p.right as ArabicVisualization["right"],
        cards: p.cards as ArabicVisualization["cards"],
        nodes: p.nodes as string[],
        steps: p.steps as string[],
      };
      return (
        <div className="space-y-2.5">
          <ArabicSectionVisualizer visualization={vis} />
          {Boolean(p.conclusion) && (
            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-blue-100">
              الاستنتاج الجامع: {String(p.conclusion)}
            </div>
          )}
        </div>
      );
    }

    case "grammar_rule": {
      return (
        <ArabicGrammarRuleBlock
          title={p.title ? String(p.title) : undefined}
          conditions={Array.isArray(p.conditions) ? (p.conditions as string[]) : []}
        />
      );
    }

    case "grammar_table": {
      return (
        <ArabicGrammarTableBlock
          title={p.title ? String(p.title) : undefined}
          rows={Array.isArray(p.rows) ? (p.rows as ArabicGrammarCaseRow[]) : []}
        />
      );
    }

    case "worked_example": {
      return (
        <ArabicWorkedExamplesBlock
          examples={
            Array.isArray(p.examples)
              ? (p.examples as ArabicWorkedExampleItem[])
              : []
          }
        />
      );
    }

    case "writing_task": {
      return (
        <ArabicWritingLab
          tasks={Array.isArray(p.tasks) ? (p.tasks as ArabicWritingTaskItem[]) : []}
          writingModels={writingModels}
          initialDrafts={writingDraftState?.drafts}
          initialChecklist={writingDraftState?.checklist}
          onSaveDraftState={onSaveWritingDraftState}
        />
      );
    }

    case "listening_activity": {
      return (
        <ArabicListeningActivityBlock
          title={String(p.title || "نشاط استماع")}
          officialAudioAvailable={Boolean(p.officialAudioAvailable)}
          textAvailableInProvidedFiles={Boolean(p.textAvailableInProvidedFiles)}
          questionsFromBook={
            Array.isArray(p.questionsFromBook)
              ? (p.questionsFromBook as string[])
              : []
          }
          answerPolicy={String(p.answerPolicy || "")}
          audioUrl={block.media?.audioUrl}
          transcript={p.transcript ? String(p.transcript) : null}
        />
      );
    }

    case "speaking_activity": {
      return (
        <ArabicSpeakingActivityBlock
          title={String(p.title || "نشاط تفاعلي")}
          sourceScope={p.sourceScope ? String(p.sourceScope) : undefined}
          steps={Array.isArray(p.steps) ? (p.steps as string[]) : []}
          teacherTip={p.teacherTip ? String(p.teacherTip) : undefined}
        />
      );
    }

    case "exam_trick": {
      const items = Array.isArray(p.items) ? (p.items as string[]) : [];
      return (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/75 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2.5">
          <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0" />
            <span>{String(p.title || "استراتيجية الحل في الامتحان")}</span>
          </h4>
          <ul className="space-y-1.5 text-xs sm:text-[13px] font-bold text-amber-950/90 dark:text-amber-100 list-disc pr-5 leading-relaxed">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }

    case "common_mistake": {
      const items = Array.isArray(p.items) ? (p.items as string[]) : [];
      return (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/75 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2.5">
          <h4 className="text-xs sm:text-sm font-black text-rose-950 dark:text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-700 dark:text-rose-300 shrink-0" />
            <span>{String(p.title || "تنبيهات وأخطاء شائعة")}</span>
          </h4>
          <ul className="space-y-1.5 text-xs sm:text-[13px] font-bold text-rose-950/90 dark:text-rose-100 list-disc pr-5 leading-relaxed">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }

    case "key_takeaway": {
      const keywords = Array.isArray(p.keywords) ? (p.keywords as string[]) : [];
      const rawItems = Array.isArray(p.items) ? p.items : [];
      const variant = p.visualVariant ? String(p.visualVariant) : "";

      if (variant === "review_checklist" && rawItems.length > 0) {
        const list = rawItems.map((it) => String(it));
        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-[#091B40] dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>قائمة المراجعة السريعة قبل الاختبار</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {list.map((label, idx) => {
                const done = Boolean(checkedChecklist[idx]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setCheckedChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    className={`p-3 rounded-xl border text-right text-xs font-extrabold flex items-center gap-2 transition-colors min-h-[42px] ${
                      done
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white dark:bg-[#0D214D] text-[#091B40] dark:text-white border-[#E2E8F0] dark:border-[#1E3A6E]"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      if (variant === "strategy_cards" && rawItems.length > 0) {
        const cards = rawItems as Array<{ name?: string; evidence?: string }>;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cards.map((c, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-1.5"
              >
                <p className="text-xs font-black text-[#800B34] dark:text-[#E9AD32] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{c.name}</span>
                </p>
                <p className="text-xs sm:text-[13px] font-medium text-[#091B40] dark:text-white leading-relaxed">
                  الدليل من الدرس: {c.evidence}
                </p>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#081633] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2">
          <p className="text-xs font-black text-[#091B40] dark:text-white flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#1E40AF] dark:text-[#60A5FA]" />
            <span>{String(p.title || "الكلمات المفتاحية")}</span>
          </p>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-bold text-[#091B40] dark:text-[#E2E8F0]"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "practice_question": {
      const qIds = Array.isArray(p.questionIds) ? (p.questionIds as string[]) : [];
      if (!questionsMap || !onSelectOption || !onChangeEssayDraft || !onRevealEssay || !onToggleEssayReview) {
        return null;
      }
      const matched = qIds
        .map((id) => questionsMap.get(id))
        .filter((q): q is Question => Boolean(q));
      if (matched.length === 0) return null;

      return (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-black text-[#800B34] dark:text-[#E9AD32]">
            {String(p.title || "تحقق من فهمك لهذه الجزئية")}
          </p>
          {matched.map((q, qIdx) => (
            <ArabicQuestionCard
              key={q.id}
              index={qIdx}
              question={q}
              answerState={answerStates[q.id]}
              essayDraft={essayDrafts[q.id] || ""}
              isEssayRevealed={Boolean(essayRevealed[q.id])}
              isMarkedForReview={Boolean(markedForReviewIds?.has(q.id))}
              sectionSolvingTip={sectionSolvingTip}
              meta={{
                originEnum: q.origin as any,
                skillCategory: q.skillCategory as any,
                sourceReferences: q.sourceReferences || undefined,
                examTrick: q.explanation?.examTrick || undefined,
              }}
              onSelectOption={onSelectOption}
              onChangeEssayDraft={onChangeEssayDraft}
              onRevealEssay={onRevealEssay}
              onToggleEssayReview={onToggleEssayReview}
            />
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
