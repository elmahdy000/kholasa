"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Filter,
  RotateCcw,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";
import type { Question, QuestionAnswerState, LessonMistakeItem } from "../types";
import type { ArabicQuestionMeta, ArabicWeeklyCoverage } from "@/lib/arabic-curriculum";
import {
  ARABIC_SKILL_LABELS,
  type ArabicSkillCategory,
} from "@/lib/arabic-curriculum";
import { ArabicQuestionCard } from "./ArabicQuestionCard";

type AssessmentModeKey =
  | "comprehensive"
  | "ministry"
  | "reading"
  | "grammar"
  | "skill"
  | "mistakes";

interface ArabicAssessmentHubProps {
  lessonTitle: string;
  allQuestions: Question[];
  questionsMap: Map<string, Question>;
  questionMetaByJsonId: Record<string, ArabicQuestionMeta>;
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
  weeklyCoverage?: ArabicWeeklyCoverage[];
  mistakes: LessonMistakeItem[];
  answerStates: Record<string, QuestionAnswerState>;
  essayDrafts: Record<string, string>;
  essayRevealed: Record<string, boolean>;
  markedForReviewIds: Set<string>;
  onSelectOption: (questionId: string, optionId: string) => void;
  onChangeEssayDraft: (questionId: string, value: string) => void;
  onRevealEssay: (questionId: string, draftText?: string) => Promise<void> | void;
  onToggleEssayReview: (
    questionId: string,
    mark: boolean,
    essayText?: string
  ) => Promise<void> | void;
}

export function ArabicAssessmentHub({
  allQuestions,
  questionsMap,
  questionMetaByJsonId,
  finalAssessment,
  weeklyCoverage = [],
  mistakes,
  answerStates,
  essayDrafts,
  essayRevealed,
  markedForReviewIds,
  onSelectOption,
  onChangeEssayDraft,
  onRevealEssay,
  onToggleEssayReview,
}: ArabicAssessmentHubProps) {
  const [activeMode, setActiveMode] = useState<AssessmentModeKey | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<ArabicSkillCategory>("grammar");
  const [sessionQuestionIdx, setSessionQuestionIdx] = useState(0);
  const [showReport, setShowReport] = useState(false);

  const getQuestionMeta = useCallback(
    (q: Question): ArabicQuestionMeta | undefined =>
      (q.externalKey ? questionMetaByJsonId[q.externalKey] : undefined) ||
      questionMetaByJsonId[q.id],
    [questionMetaByJsonId]
  );

  // Available pools computed strictly from lesson's verified curriculum questions
  const pools = useMemo(() => {
    const compIds = finalAssessment?.questionIds || [];
    const compQuestions = compIds
      .map((id) => questionsMap.get(id) || allQuestions.find((q) => q.externalKey === id))
      .filter((q): q is Question => Boolean(q));

    const comprehensive =
      compQuestions.length > 0 ? compQuestions : allQuestions.slice(0, 20);

    const ministry = allQuestions.filter((q) => {
      const m = getQuestionMeta(q);
      const origin = String(q.origin || m?.originEnum || "");
      return origin.startsWith("OFFICIAL_");
    });

    const reading = allQuestions.filter((q) => {
      const m = getQuestionMeta(q);
      const sk = String(q.skillCategory || m?.skillCategory || "");
      return sk === "comprehension" || sk === "reading_unseen" || sk === "argumentation" || sk === "vocabulary";
    });

    const grammar = allQuestions.filter((q) => {
      const m = getQuestionMeta(q);
      const sk = String(q.skillCategory || m?.skillCategory || "");
      return sk === "grammar" || sk === "rhetoric" || sk === "spelling";
    });

    const bySelectedSkill = allQuestions.filter((q) => {
      const m = getQuestionMeta(q);
      return String(q.skillCategory || m?.skillCategory || "") === selectedSkill;
    });

    const mistakeIds = new Set(mistakes.map((m) => m.questionId));
    for (const [qid, st] of Object.entries(answerStates)) {
      if (st.revealed && !st.isCorrect) mistakeIds.add(qid);
    }
    const mistakeQuestions = allQuestions.filter((q) => mistakeIds.has(q.id));

    return {
      comprehensive,
      ministry,
      reading,
      grammar,
      skill: bySelectedSkill,
      mistakes: mistakeQuestions,
    };
  }, [
    allQuestions,
    questionsMap,
    finalAssessment,
    selectedSkill,
    mistakes,
    answerStates,
    getQuestionMeta,
  ]);

  const activeQuestions = useMemo(
    () => (activeMode ? pools[activeMode] : []),
    [activeMode, pools]
  );
  const currentQuestion = activeQuestions[sessionQuestionIdx];

  const availableSkills = useMemo(() => {
    const counts = new Map<ArabicSkillCategory, number>();
    for (const q of allQuestions) {
      const sk = (q.skillCategory ||
        getQuestionMeta(q)?.skillCategory ||
        "general") as ArabicSkillCategory;
      counts.set(sk, (counts.get(sk) || 0) + 1);
    }
    return Array.from(counts.entries());
  }, [allQuestions, getQuestionMeta]);

  const sessionStats = useMemo(() => {
    if (!activeQuestions.length) return { answered: 0, correct: 0, objectiveTotal: 0 };
    let answered = 0;
    let correct = 0;
    let objectiveTotal = 0;
    for (const q of activeQuestions) {
      if (q.type !== "ESSAY") {
        objectiveTotal++;
        const st = answerStates[q.id];
        if (st?.revealed) {
          answered++;
          if (st.isCorrect) correct++;
        }
      } else if (essayRevealed[q.id]) {
        answered++;
      }
    }
    return { answered, correct, objectiveTotal };
  }, [activeQuestions, answerStates, essayRevealed]);

  const startSession = (mode: AssessmentModeKey) => {
    setActiveMode(mode);
    setSessionQuestionIdx(0);
    setShowReport(false);
  };

  if (activeMode && showReport) {
    const pct =
      sessionStats.objectiveTotal > 0
        ? Math.round((sessionStats.correct / sessionStats.objectiveTotal) * 100)
        : 0;
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h4 className="text-base sm:text-lg font-black text-[#091B40] dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#800B34] dark:text-[#E9AD32]" />
            <span>نتيجة التقييم التدريبي</span>
          </h4>
          <button
            type="button"
            onClick={() => {
              setActiveMode(null);
              setShowReport(false);
            }}
            className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-extrabold text-[#091B40] dark:text-white min-h-[40px]"
          >
            العودة لأنماط الاختبار
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E]">
            <p className="text-xs font-bold text-[#64748B]">إجمالي الأسئلة</p>
            <p className="text-2xl font-black text-[#091B40] dark:text-white tabular-nums mt-1">
              {activeQuestions.length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              الأسئلة الموضوعية الصحيحة
            </p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-200 tabular-nums mt-1">
              {sessionStats.correct} / {sessionStats.objectiveTotal}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              نسبة الإتقان الموضوعي
            </p>
            <p className="text-2xl font-black text-amber-800 dark:text-amber-200 tabular-nums mt-1">
              {pct}%
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setShowReport(false);
              setSessionQuestionIdx(0);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#1E40AF] text-white text-xs font-extrabold min-h-[42px]"
          >
            استعراض الأسئلة والإجابات
          </button>
          {pools.mistakes.length > 0 && activeMode !== "mistakes" && (
            <button
              type="button"
              onClick={() => startSession("mistakes")}
              className="px-4 py-2.5 rounded-xl bg-[#800B34] text-white text-xs font-extrabold min-h-[42px]"
            >
              تدرّب الآن على أخطائك ({pools.mistakes.length})
            </button>
          )}
        </div>
      </div>
    );
  }

  if (activeMode && currentQuestion) {
    const qMeta = getQuestionMeta(currentQuestion);
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-[#800B34] dark:text-[#E9AD32]">
                سؤال {sessionQuestionIdx + 1} من {activeQuestions.length}
              </span>
              <span className="text-[11px] font-bold text-[#64748B] tabular-nums">
                • أجبت على {sessionStats.answered}
              </span>
            </div>
            <div className="w-full sm:w-64 h-2 rounded-full bg-[#E2E8F0] dark:bg-[#132C60] overflow-hidden">
              <div
                className="h-full bg-[#1E40AF] rounded-full transition-all"
                style={{
                  width: `${Math.round(
                    ((sessionQuestionIdx + 1) / Math.max(1, activeQuestions.length)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowReport(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold min-h-[40px]"
            >
              عرض ملخص التقييم
            </button>
            <button
              type="button"
              onClick={() => setActiveMode(null)}
              className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-extrabold text-[#091B40] dark:text-white min-h-[40px]"
            >
              تغيير نوع الاختبار
            </button>
          </div>
        </div>

        <ArabicQuestionCard
          index={sessionQuestionIdx}
          question={currentQuestion}
          answerState={answerStates[currentQuestion.id]}
          essayDraft={essayDrafts[currentQuestion.id] || ""}
          isEssayRevealed={Boolean(essayRevealed[currentQuestion.id])}
          isMarkedForReview={markedForReviewIds.has(currentQuestion.id)}
          meta={qMeta}
          onSelectOption={onSelectOption}
          onChangeEssayDraft={onChangeEssayDraft}
          onRevealEssay={onRevealEssay}
          onToggleEssayReview={onToggleEssayReview}
        />

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={sessionQuestionIdx === 0}
            onClick={() => setSessionQuestionIdx((i) => Math.max(0, i - 1))}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-extrabold text-[#091B40] dark:text-white disabled:opacity-40 flex items-center gap-1.5 min-h-[44px]"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (sessionQuestionIdx < activeQuestions.length - 1) {
                setSessionQuestionIdx((i) => i + 1);
              } else {
                setShowReport(true);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-[#091B40] hover:bg-[#132C60] text-white text-xs font-extrabold flex items-center gap-1.5 min-h-[44px]"
          >
            <span>
              {sessionQuestionIdx < activeQuestions.length - 1
                ? "السؤال التالي"
                : "إنهاء وعرض النتيجة"}
            </span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2">
        <h3 className="text-base sm:text-lg font-black text-[#091B40] dark:text-white flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-[#800B34] dark:text-[#E9AD32] shrink-0" />
          <span>اختبر نفسك في «العلم بين القانون والضمير»</span>
        </h3>
        <p className="text-xs sm:text-sm font-medium text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
          اختر نوع التقييم المناسب لمستواك. جميع الأسئلة مأخوذة حصريًا من منهج هذا الدرس وبنكه المعتمد بدون أي أسئلة من خارج المقرر.
        </p>
        {finalAssessment?.note && (
          <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{finalAssessment.note}</span>
          </p>
        )}
      </div>

      {/* Mode Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => startSession("comprehensive")}
          className="text-right p-4 rounded-2xl bg-white dark:bg-[#0D214D] border-2 border-[#800B34]/25 hover:border-[#800B34] transition-all space-y-2 min-h-[120px] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="p-2 rounded-xl bg-[#800B34]/10 text-[#800B34] dark:text-[#E9AD32]">
              <Award className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#091B40] text-white tabular-nums">
              {pools.comprehensive.length} سؤال
            </span>
          </div>
          <div>
            <p className="text-sm font-black text-[#091B40] dark:text-white">
              {finalAssessment?.title || "الاختبار الختامي الشامل للدرس"}
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              يغطي المفردات والفهم والحجاج والنحو والأساليب والإملاء
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={pools.ministry.length === 0}
          onClick={() => startSession("ministry")}
          className="text-right p-4 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#1E40AF] transition-all space-y-2 min-h-[120px] flex flex-col justify-between disabled:opacity-50"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-[#93C5FD]">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 tabular-nums">
              {pools.ministry.length} سؤال
            </span>
          </div>
          <div>
            <p className="text-sm font-black text-[#091B40] dark:text-white">
              أسئلة كتاب الوزارة والتقييمات الرسمية
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              أسئلة مستقاة مباشرة من تقييمات الوزارة وكتاب الطالب
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={pools.reading.length === 0}
          onClick={() => startSession("reading")}
          className="text-right p-4 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#1E40AF] transition-all space-y-2 min-h-[120px] flex flex-col justify-between disabled:opacity-50"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              <Target className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 tabular-nums">
              {pools.reading.length} سؤال
            </span>
          </div>
          <div>
            <p className="text-sm font-black text-[#091B40] dark:text-white">
              اختبار الفهم القرائي والنصوص المتحررة
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              المفردات السياقية وبنية الحجة والقراءة المتحررة
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={pools.grammar.length === 0}
          onClick={() => startSession("grammar")}
          className="text-right p-4 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#1E40AF] transition-all space-y-2 min-h-[120px] flex flex-col justify-between disabled:opacity-50"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
              <Wrench className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 tabular-nums">
              {pools.grammar.length} سؤال
            </span>
          </div>
          <div>
            <p className="text-sm font-black text-[#091B40] dark:text-white">
              اختبار النحو والأساليب والإملاء
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              الأسماء الخمسة والخبر والإنشاء والتاء المربوطة والمبسوطة والهاء
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={pools.mistakes.length === 0}
          onClick={() => startSession("mistakes")}
          className="text-right p-4 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-rose-500 transition-all space-y-2 min-h-[120px] flex flex-col justify-between disabled:opacity-55"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
              <RotateCcw className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 tabular-nums">
              {pools.mistakes.length} سؤال
            </span>
          </div>
          <div>
            <p className="text-sm font-black text-[#091B40] dark:text-white">
              مراجعة أخطائي ونقاط الضعف
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              {pools.mistakes.length > 0
                ? "ركّز على الأسئلة اللي غلطت فيها أو سجلتها للمراجعة"
                : "لم تسجل أخطاء بعد — ممتاز!"}
            </p>
          </div>
        </button>

        {/* Skill Picker Card */}
        <div className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#091B40] dark:text-white">
            <Filter className="w-4 h-4 text-[#1E40AF]" />
            <span>اختبار حسب مهارة محددة</span>
          </div>
          <select
            aria-label="اختر مهارة"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value as ArabicSkillCategory)}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-bold text-[#091B40] dark:text-white min-h-[40px]"
          >
            {availableSkills.map(([sk, count]) => (
              <option key={sk} value={sk}>
                {ARABIC_SKILL_LABELS[sk] || sk} ({count} سؤال)
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pools.skill.length === 0}
            onClick={() => startSession("skill")}
            className="w-full py-2 rounded-xl bg-[#091B40] hover:bg-[#132C60] text-white text-xs font-extrabold min-h-[40px] disabled:opacity-50"
          >
            ابدأ اختبار المهارة ({pools.skill.length})
          </button>
        </div>
      </div>

      {/* Weekly Official Coverage Overview */}
      {weeklyCoverage.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
          <p className="text-xs font-black text-[#091B40] dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تغطية نماذج التقييم الأسبوعي الرسمي (المجموعات أ / ب / ج):</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {weeklyCoverage.map((cov) => (
              <div
                key={cov.group}
                className="p-3 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#800B34] dark:text-[#E9AD32]">
                    المجموعة ({cov.group})
                  </span>
                  <span className="text-[10px] font-bold text-[#64748B]">
                    ص {cov.pages.join("–")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cov.focus.map((f, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#132C60] text-[#091B40] dark:text-[#CBD5E1]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
