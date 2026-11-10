"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  BookOpen,
  Network,
  RotateCcw,
  ArrowLeft,
  Search,
  X,
  Languages,
  Layers,
  AlertCircle,
} from "lucide-react";
import type {
  LandingAnswerCheckResult,
  LandingGradeItem,
  LandingPreviewQuestionPublic,
  LandingSubjectItem,
} from "@/components/landing/types";
import { RealQuestionChallenge } from "@/components/landing/RealQuestionChallenge";
import { LessonMindMapTab } from "@/components/lessons/LessonMindMapTab";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { FormattedDefinitionView } from "@/components/ui/FormattedDefinitionView";
import { TranslationToggle } from "@/components/ui/TranslationToggle";
import { QuestionExplanationBox, splitExplanation } from "@/components/ui/QuestionExplanationBox";

interface InteractiveDemoProps {
  grades: LandingGradeItem[];
  subjects: LandingSubjectItem[];
}

type ExplorerToolTab = "question" | "definitions" | "mindmap" | "mistakes";

const TOOL_TABS: Array<{ id: ExplorerToolTab; label: string; icon: typeof CheckSquare }> = [
  { id: "question", label: "حل سؤال من الدرس", icon: CheckSquare },
  { id: "definitions", label: "المفاهيم والتعريفات", icon: BookOpen },
  { id: "mindmap", label: "الخريطة الذهنية", icon: Network },
  { id: "mistakes", label: "معالجة الأخطاء («غلطاتي»)", icon: RotateCcw },
];

export function InteractiveDemo({ grades, subjects }: InteractiveDemoProps) {
  // Pick initial grade that actually has published subjects, fallback to first grade
  const initialGradeId = useMemo(() => {
    const withContent = grades.find((g) => subjects.some((s) => s.gradeId === g.id));
    return withContent?.id || grades[0]?.id || "";
  }, [grades, subjects]);

  const [selectedGradeId, setSelectedGradeId] = useState<string>(initialGradeId);
  const [selectedCategory, setSelectedCategory] = useState<"ARABIC" | "LANGUAGES">("ARABIC");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [activeTool, setActiveTool] = useState<ExplorerToolTab>("question");

  // Definitions state
  const [defSearch, setDefSearch] = useState("");
  const [showAllDefs, setShowAllDefs] = useState(false);
  const [translatedMap, setTranslatedMap] = useState<Record<number, boolean>>({});
  const [translateAll, setTranslateAll] = useState(false);

  // Store verified evaluation results keyed by questionId so Mistakes Tab stays synchronized
  const [evaluatedMap, setEvaluatedMap] = useState<
    Record<
      string,
      { result: LandingAnswerCheckResult; question: LandingPreviewQuestionPublic }
    >
  >({});

  // Filter subjects strictly by selected Grade + School Category
  const availableSubjects = useMemo(
    () =>
      subjects.filter(
        (s) => s.gradeId === selectedGradeId && s.schoolCategory === selectedCategory
      ),
    [subjects, selectedGradeId, selectedCategory]
  );

  const activeSubject = useMemo(
    () =>
      availableSubjects.find((s) => s.id === selectedSubjectId) ||
      availableSubjects[0] ||
      null,
    [availableSubjects, selectedSubjectId]
  );

  const availableUnits = useMemo(
    () => activeSubject?.units || [],
    [activeSubject]
  );
  const activeUnit = useMemo(
    () => availableUnits.find((u) => u.id === selectedUnitId) || availableUnits[0] || null,
    [availableUnits, selectedUnitId]
  );

  const availableLessons = useMemo(
    () => activeUnit?.lessons || [],
    [activeUnit]
  );
  const activeLesson = useMemo(
    () =>
      availableLessons.find((l) => l.id === selectedLessonId) || availableLessons[0] || null,
    [availableLessons, selectedLessonId]
  );

  const isLanguages = selectedCategory === "LANGUAGES";

  const handleSelectGrade = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedSubjectId("");
    setSelectedUnitId("");
    setSelectedLessonId("");
    setDefSearch("");
    setShowAllDefs(false);
  };

  const handleSelectCategory = (cat: "ARABIC" | "LANGUAGES") => {
    setSelectedCategory(cat);
    setSelectedSubjectId("");
    setSelectedUnitId("");
    setSelectedLessonId("");
    setDefSearch("");
    setShowAllDefs(false);
    setTranslateAll(false);
    setTranslatedMap({});
  };

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    setSelectedLessonId("");
    setDefSearch("");
    setShowAllDefs(false);
    setTranslateAll(false);
    setTranslatedMap({});
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setDefSearch("");
    setShowAllDefs(false);
    setTranslateAll(false);
    setTranslatedMap({});
  };

  // Definitions filtering
  const filteredDefinitions = useMemo(() => {
    if (!activeLesson) return [];
    const defs = activeLesson.definitions;
    if (!defSearch.trim()) return defs;
    const q = defSearch.trim().toLowerCase();
    return defs.filter(
      (d) =>
        d.term.toLowerCase().includes(q) ||
        d.meaning.toLowerCase().includes(q) ||
        (d.translation && d.translation.toLowerCase().includes(q))
    );
  }, [activeLesson, defSearch]);

  const visibleDefinitions = showAllDefs
    ? filteredDefinitions
    : filteredDefinitions.slice(0, 4);

  const hasAnyTranslations = Boolean(
    isLanguages &&
      activeLesson?.definitions.some((d) => {
        if (d.translation && d.translation.trim()) return true;
        const s = splitExplanation(d.meaning);
        return Boolean(s.translation?.trim());
      })
  );

  const firstPublishedGradeId =
    grades.find((g) => subjects.some((s) => s.gradeId === g.id))?.id || "";

  const currentEvaluated = activeLesson?.previewMcq
    ? evaluatedMap[activeLesson.previewMcq.id]
    : undefined;

  return (
    <section
      id="curriculum-explorer"
      className="py-12 sm:py-16 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]"
    >
      {/* Anchor alias so existing #demo links scroll here seamlessly */}
      <div id="demo" className="sr-only" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 text-right">
        {/* Section Heading */}
        <div className="max-w-2xl space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#091B40] dark:text-white leading-snug">
            استكشف المنهج الفعلي وجرّب أدوات التعلم
          </h2>
          <p className="text-sm sm:text-[15px] text-[#536681] dark:text-[#94A3B8] leading-relaxed">
            اختار الصف، نوع المدرسة، الوحدة، والدرس — وكل الأسئلة والمفاهيم والخرائط الذهنية بتظهر من المنهج الفعلي مباشرة.
          </p>
        </div>

        {/* Progressive Curriculum Selector Card */}
        <div className="rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-4 sm:p-6 space-y-5">
          {/* Step 1 & 2: Grade + Track (Strictly separated) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Grade Selector */}
            {grades.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#091B40] dark:text-white block">
                  1. الصف الدراسي (البكالوريا المصرية)
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
                  {grades.map((g) => {
                    const isSelected = selectedGradeId === g.id;
                    const shortLabel =
                      g.code === "bacc_g10"
                        ? "أولى بكالوريا"
                        : g.code === "bacc_g11"
                        ? "تانية بكالوريا"
                        : g.name;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelectGrade(g.id)}
                        className={`min-h-[44px] px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#800B34] text-white"
                            : "text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                        }`}
                      >
                        {shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* School Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#091B40] dark:text-white block">
                2. نوع المدرسة (منهجان منفصلان تماماً)
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => handleSelectCategory("ARABIC")}
                  className={`min-h-[44px] px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    selectedCategory === "ARABIC"
                      ? "bg-[#091B40] text-white"
                      : "text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                  }`}
                >
                  بكالوريا عربي
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectCategory("LANGUAGES")}
                  className={`min-h-[44px] px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    selectedCategory === "LANGUAGES"
                      ? "bg-[#091B40] text-white"
                      : "text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                  }`}
                >
                  بكالوريا لغات
                </button>
              </div>
            </div>
          </div>

          {/* Empty State if chosen Grade/Track has zero published subjects */}
          {availableSubjects.length === 0 ? (
            <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-8 text-center space-y-3">
              <div className="w-11 h-11 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#091B40] dark:text-white">
                لا توجد مواد منشورة حالياً لهذا الاختيار
              </h3>
              <p className="text-sm text-[#536681] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                لم يتم نشر مقررات هذا الصف أو المسار في النسخة الحالية بعد. يمكنك معاينة المنهج المتاح والمنشور حالياً على المنصة.
              </p>
              {firstPublishedGradeId && firstPublishedGradeId !== selectedGradeId && (
                <button
                  type="button"
                  onClick={() => handleSelectGrade(firstPublishedGradeId)}
                  className="min-h-[44px] px-5 py-2 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  انتقل إلى تانية بكالوريا المتاحة الآن
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Step 3: Subject (selector if multiple, or factual badge if single) */}
              {availableSubjects.length > 1 ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#091B40] dark:text-white block">
                    3. المادة الدراسية
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSubjects.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(sub.id);
                          setSelectedUnitId("");
                          setSelectedLessonId("");
                        }}
                        className={`min-h-[44px] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                          activeSubject?.id === sub.id
                            ? "bg-[#800B34] text-white border-[#800B34]"
                            : "bg-white dark:bg-[#0F172A] text-[#091B40] dark:text-white border-[#E2E8F0] dark:border-[#334155]"
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeSubject ? (
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#091B40] dark:text-white">
                    <Layers className="w-4 h-4 text-[#800B34] dark:text-[#FB7185] shrink-0" />
                    <span>المادة المختارة: {activeSubject.name}</span>
                  </div>
                  <span className="text-xs font-mono text-[#536681] dark:text-[#94A3B8]">
                    {activeSubject.publishedUnitsCount} وحدات • {activeSubject.publishedLessonsCount} درساً •{" "}
                    {activeSubject.publishedQuestionsCount} سؤال منشور
                  </span>
                </div>
              ) : null}

              {/* Step 4: Unit Selector */}
              {availableUnits.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#091B40] dark:text-white block">
                    3. اختار الوحدة الدراسية
                  </label>
                  <div
                    dir={isLanguages ? "ltr" : "rtl"}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
                  >
                    {availableUnits.map((u) => {
                      const isActive = activeUnit?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectUnit(u.id)}
                          className={`min-h-[44px] p-3 rounded-lg border text-xs font-bold transition-colors flex flex-col justify-between gap-1.5 cursor-pointer ${
                            isLanguages ? "text-left" : "text-right"
                          } ${
                            isActive
                              ? "bg-[#091B40] text-white border-[#091B40]"
                              : "bg-white dark:bg-[#0F172A] text-[#091B40] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34]/50"
                          }`}
                        >
                          <span className="leading-snug">{u.title}</span>
                          <span
                            className={`text-[11px] font-mono ${
                              isActive ? "text-white/80" : "text-[#64748B] dark:text-[#94A3B8]"
                            }`}
                          >
                            {u.lessons.length} دروس
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Lesson Selector */}
              {availableLessons.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#091B40] dark:text-white block">
                    4. اختار الدرس لمعاينة أدواته الحقيقية
                  </label>
                  <div
                    dir={isLanguages ? "ltr" : "rtl"}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
                  >
                    {availableLessons.map((l) => {
                      const isActive = activeLesson?.id === l.id;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => handleSelectLesson(l.id)}
                          className={`min-h-[44px] p-3 rounded-lg border text-xs font-bold transition-colors flex flex-col justify-between gap-1.5 cursor-pointer ${
                            isLanguages ? "text-left" : "text-right"
                          } ${
                            isActive
                              ? "bg-[#800B34] text-white border-[#800B34]"
                              : "bg-white dark:bg-[#0F172A] text-[#091B40] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34]/50"
                          }`}
                        >
                          <span className="leading-snug">
                            <BidiStatement text={l.title} />
                          </span>
                          <span
                            className={`text-[11px] font-mono ${
                              isActive ? "text-white/85" : "text-[#64748B] dark:text-[#94A3B8]"
                            }`}
                          >
                            {l.publishedQuestionsCount} سؤال • {l.definitions.length} مصطلح
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Selected Lesson Real Interactive Workspace */}
        {activeLesson && activeSubject && activeUnit && (
          <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
            {/* Tool Switcher Bar */}
            <div className="p-3 sm:p-4 bg-[#F7F9FC] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2">
                {TOOL_TABS.map(({ id, label, icon: Icon }) => {
                  const isActive = activeTool === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTool(id)}
                      className={`min-h-[44px] px-2.5 sm:px-3.5 py-2 rounded-lg text-[11px] sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer text-center ${
                        isActive
                          ? "bg-[#800B34] text-white"
                          : "bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/lessons/${activeLesson.id}`)}`}
                className="min-h-[44px] px-3.5 py-2 rounded-lg bg-[#091B40] hover:bg-[#12263F] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shrink-0 self-stretch sm:self-start lg:self-auto"
              >
                <span>دخول لفتح الدرس بالكامل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tool Content Area */}
            <div className="p-4 sm:p-6">
              {/* TAB 1: Real Question Challenge */}
              {activeTool === "question" && (
                <RealQuestionChallenge
                  key={`${activeLesson.id}-${activeLesson.previewMcq?.id ?? "none"}`}
                  lessonId={activeLesson.id}
                  lessonTitle={activeLesson.title}
                  unitTitle={activeUnit.title}
                  question={activeLesson.previewMcq}
                  isLanguages={isLanguages}
                  totalQuestionsCount={activeLesson.publishedQuestionsCount}
                  onEvaluated={(res, q) => {
                    setEvaluatedMap((prev) => ({
                      ...prev,
                      [q.id]: { result: res, question: q },
                    }));
                  }}
                />
              )}

              {/* TAB 2: Verified Definitions Explorer */}
              {activeTool === "definitions" && (
                <div dir={isLanguages ? "ltr" : "rtl"} className="space-y-4">
                  {activeLesson.definitions.length === 0 ? (
                    <div
                      dir="rtl"
                      className="p-8 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-center space-y-2"
                    >
                      <p className="text-sm font-bold text-[#091B40] dark:text-white">
                        لا توجد تعريفات منشورة لهذا الدرس حالياً
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        يمكنك استعراض درس آخر أو تجربة الأسئلة والخريطة الذهنية إن كانت متاحة.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Header + Search + Translate All */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#64748B]">
                            <Search className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={defSearch}
                            onChange={(e) => setDefSearch(e.target.value)}
                            placeholder={
                              isLanguages
                                ? "Search terms in this lesson..."
                                : "ابحث داخل مصطلحات الدرس..."
                            }
                            className="w-full min-h-[44px] ps-9 pe-9 py-2 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs sm:text-sm text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#800B34]"
                          />
                          {defSearch && (
                            <button
                              type="button"
                              onClick={() => setDefSearch("")}
                              className="absolute inset-y-0 end-0 pe-2.5 flex items-center text-[#64748B] hover:text-[#091B40] cursor-pointer"
                              aria-label="مسح البحث"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {hasAnyTranslations && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = !translateAll;
                              setTranslateAll(next);
                              const map: Record<number, boolean> = {};
                              activeLesson.definitions.forEach((_, idx) => {
                                map[idx] = next;
                              });
                              setTranslatedMap(map);
                            }}
                            className={`min-h-[44px] px-4 py-2 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                              translateAll
                                ? "bg-[#091B40] text-white border-[#091B40]"
                                : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#091B40] dark:text-white"
                            }`}
                          >
                            <Languages className="w-4 h-4" />
                            <span>{translateAll ? "إخفاء كل الترجمات" : "ترجمة الكل بالعربي"}</span>
                          </button>
                        )}
                      </div>

                      {visibleDefinitions.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {visibleDefinitions.map((item, idx) => {
                              const split = splitExplanation(item.meaning);
                              const cleanMeaning = item.translation
                                ? item.meaning
                                : split.translation
                                ? split.primary
                                : item.meaning;
                              const effectiveTranslation = (
                                item.translation ||
                                split.translation ||
                                ""
                              ).trim();
                              const hasTranslation = Boolean(
                                isLanguages && effectiveTranslation.length > 0
                              );
                              const isTranslated =
                                translateAll || Boolean(translatedMap[idx]);

                              return (
                                <div
                                  key={`${item.term}-${idx}`}
                                  className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2.5"
                                >
                                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
                                    <div className="font-bold text-sm text-[#059669] dark:text-[#34D399] min-w-0 flex-1 break-words">
                                      <BidiStatement text={item.term} />
                                    </div>
                                    {hasTranslation && (
                                      <TranslationToggle
                                        size="xs"
                                        isTranslated={isTranslated}
                                        onToggle={() =>
                                          setTranslatedMap((prev) => ({
                                            ...prev,
                                            [idx]: !prev[idx],
                                          }))
                                        }
                                      />
                                    )}
                                  </div>

                                  <FormattedDefinitionView
                                    text={cleanMeaning}
                                    variant="card"
                                    colorScheme="emerald"
                                  />

                                  {isTranslated && hasTranslation && (
                                    <div
                                      dir="rtl"
                                      className="p-3 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right space-y-1"
                                    >
                                      <span className="text-[11px] font-bold text-[#059669] dark:text-[#34D399] block">
                                        الترجمة العربية:
                                      </span>
                                      <FormattedDefinitionView
                                        text={effectiveTranslation}
                                        variant="translation"
                                        colorScheme="emerald"
                                        forceDir="rtl"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {filteredDefinitions.length > 4 && (
                            <div className="text-center pt-1">
                              <button
                                type="button"
                                onClick={() => setShowAllDefs((v) => !v)}
                                className="min-h-[44px] px-5 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs font-bold text-[#091B40] dark:text-white hover:border-[#800B34] transition-colors cursor-pointer"
                              >
                                {showAllDefs
                                  ? "عرض عدد أقل"
                                  : `عرض باقي المصطلحات (${filteredDefinitions.length - 4})`}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-6 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] text-center text-xs text-[#64748B]">
                          لا توجد تعريفات مطابقة للبحث.
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: Real Visual Mind Map reusing LessonMindMapTab */}
              {activeTool === "mindmap" && (
                <LessonMindMapTab
                  mindMap={
                    activeLesson.mindMap
                      ? {
                          id: `landing-mindmap-${activeLesson.id}`,
                          title: activeLesson.mindMap.title,
                          description: activeLesson.mindMap.description,
                          images: activeLesson.mindMap.images,
                          nodes: activeLesson.mindMap.nodes,
                          edges: activeLesson.mindMap.edges,
                        }
                      : null
                  }
                />
              )}

              {/* TAB 4: Real Mistakes Tracking & Review Demonstration (No Spoilers!) */}
              {activeTool === "mistakes" && (
                <div className="space-y-4 text-right">
                  <div className="p-4 sm:p-5 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-[#091B40] dark:text-white">
                        كيف تشتغل خاصية «غلطاتي» على أسئلة هذا الدرس؟
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          currentEvaluated?.result.ok
                            ? currentEvaluated.result.isCorrect
                              ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399]"
                              : "bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171]"
                            : "bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#536681] dark:text-[#94A3B8]"
                        }`}
                      >
                        {currentEvaluated?.result.ok
                          ? currentEvaluated.result.isCorrect
                            ? "حلّيت سؤال المعاينة صح"
                            : "مثال لسؤال سُجّل للمراجعة"
                          : "في انتظار تجربتك"}
                      </span>
                    </div>

                    {!currentEvaluated?.result.ok ? (
                      <div className="space-y-3">
                        <p className="text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                          أول ما تحل سؤال غلط أثناء التدريب أو الامتحان جوا حسابك، النظام بيسجله تلقائياً في «غلطاتي» مع التفسير العلمي عشان تراجعه لحد ما تحله صح ويتحول إلى «تم الإتقان».
                        </p>
                        {activeLesson.previewMcq && (
                          <button
                            type="button"
                            onClick={() => setActiveTool("question")}
                            className="min-h-[44px] px-4 py-2 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <span>جرّب حل سؤال هذا الدرس الآن</span>
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                          {currentEvaluated.result.isCorrect
                            ? "إجابتك كانت صحيحة! لو كنت أخطأت في هذا السؤال داخل حسابك، كان هيظهر هنا بالصيغة دي للمراجعة حتى تتقنه:"
                            : "بما أن إجابتك في سؤال المعاينة كانت غير صحيحة، داخل حسابك بيتحفظ السؤال ده مباشرة في قائمة «غلطاتي» بالشكل التالي:"}
                        </p>

                        <div
                          dir={isLanguages ? "ltr" : "rtl"}
                          className={`p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3 ${
                            isLanguages ? "text-left" : "text-right"
                          }`}
                        >
                          <div className="text-sm font-bold text-[#091B40] dark:text-white leading-relaxed">
                            <BidiStatement text={currentEvaluated.question.statement} />
                          </div>

                          {currentEvaluated.result.correctOptionText && (
                            <div className="p-2.5 rounded-lg bg-[#059669]/10 border border-[#059669]/30 text-xs font-bold text-[#059669] dark:text-[#34D399]">
                              {isLanguages ? "Correct Answer: " : "الإجابة الصحيحة: "}
                              <BidiStatement text={currentEvaluated.result.correctOptionText} />
                            </div>
                          )}

                          {currentEvaluated.result.explanation?.correctReason && (
                            <QuestionExplanationBox
                              concept={currentEvaluated.result.explanation.concept}
                              correctReason={currentEvaluated.result.explanation.correctReason}
                              forceEnglish={isLanguages}
                              className="!mt-0"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">
                        كل طالب يمتلك جلسة «غلطاتي» معزولة خاصة به.
                      </span>
                      <Link
                        href="/login"
                        className="font-bold text-[#800B34] dark:text-[#FB7185] hover:underline inline-flex items-center gap-1"
                      >
                        <span>دخول لتجربة ركن غلطاتي الكامل</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
