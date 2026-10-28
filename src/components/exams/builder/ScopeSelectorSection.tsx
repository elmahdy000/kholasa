"use client";

import { Layers, BookOpen, ListChecks, Info, Check } from "lucide-react";
import { ScopeType, Subject, Unit, Lesson } from "./types";

interface ScopeSelectorSectionProps {
  scopeType: ScopeType;
  setScopeType: (scope: ScopeType) => void;
  currentSubject?: Subject;
  currentUnits: Unit[];
  effectiveUnitId: string;
  setSelectedUnitId: (id: string) => void;
  activeUnitLessonTab: string;
  setActiveUnitLessonTab: (tab: string) => void;
  selectedLessonIds: string[];
  displayedLessons: Array<Lesson & { unitTitle: string }>;
  onToggleLesson: (id: string) => void;
  onSelectAllLessons: () => void;
  onClearLessons: () => void;
}

export function ScopeSelectorSection({
  scopeType,
  setScopeType,
  currentSubject,
  currentUnits,
  effectiveUnitId,
  setSelectedUnitId,
  activeUnitLessonTab,
  setActiveUnitLessonTab,
  selectedLessonIds,
  displayedLessons,
  onToggleLesson,
  onSelectAllLessons,
  onClearLessons,
}: ScopeSelectorSectionProps) {
  return (
    <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
              2. نطاق الأسئلة والدروس
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              حدد إذا كان الامتحان شاملاً للمادة، لوحدة معينة، أو دروس محددة
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-[#F7F8FA] dark:bg-[#0D1B2E] rounded-xl border border-[#E8E9ED] dark:border-[#22364F]">
        {[
          { id: "subject" as const, label: "كامل المادة", icon: BookOpen },
          { id: "unit" as const, label: "وحدة محددة", icon: Layers },
          { id: "lessons" as const, label: "دروس مخصصة", icon: ListChecks },
        ].map((scope) => {
          const isSelected = scopeType === scope.id;
          const Icon = scope.icon;
          return (
            <button
              key={scope.id}
              type="button"
              onClick={() => setScopeType(scope.id)}
              className={`min-h-9 h-auto py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-white dark:bg-[#132945] text-[#800020] dark:text-[#F5F7FB] shadow-xs border border-[#E8E9ED] dark:border-[#2D4563]"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB]"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="selection-label">{scope.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scope = Full Subject */}
      {scopeType === "subject" && (
        <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0D1B2E] border border-[#E8E9ED] dark:border-[#22364F] flex items-center gap-2.5 text-xs text-[#64748B] dark:text-[#C8D2E0] leading-relaxed">
          <Info className="w-4 h-4 text-[#800020] dark:text-[#E59A18] shrink-0" />
          <span>
            سيتم اختيار الأسئلة بتوزيع متوازن يغطي كافة وحدات وفصول مادة{" "}
            <strong className="text-[#12263F] dark:text-[#F5F7FB]">
              <bdi>{currentSubject?.name}</bdi>
            </strong>{" "}
            ({currentUnits.length} وحدات).
          </span>
        </div>
      )}

      {/* Scope = Unit */}
      {scopeType === "unit" && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-[#12263F] dark:text-[#F5F7FB] block">
            اختر الوحدة المطلوبة:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentUnits.map((u) => {
              const isSelected = effectiveUnitId === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`p-3 rounded-xl border text-right transition-all flex items-start justify-between gap-2.5 cursor-pointer h-auto min-w-0 ${
                    isSelected
                      ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 shadow-xs"
                      : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span
                      className={`unit-title text-xs font-bold block ${
                        isSelected
                          ? "text-[#800020] dark:text-[#F5F7FB]"
                          : "text-[#12263F] dark:text-[#C8D2E0]"
                      }`}
                    >
                      <bdi>{u.title}</bdi>
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-1 leading-normal">
                      {u.lessons.length} دروس
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                        : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scope = Lessons */}
      {scopeType === "lessons" && (
        <div className="space-y-3 pt-1">
          {/* Unit filter tabs if multiple units */}
          {currentUnits.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveUnitLessonTab("ALL")}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                  activeUnitLessonTab === "ALL"
                    ? "bg-[#800020] dark:bg-[#A30D36] text-white"
                    : "bg-[#F7F8FA] dark:bg-[#0D1B2E] text-[#64748B] dark:text-[#94A3B8] border border-[#E8E9ED] dark:border-[#22364F] hover:text-[#12263F] dark:hover:text-[#F5F7FB]"
                }`}
              >
                كل الوحدات
              </button>
              {currentUnits.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setActiveUnitLessonTab(u.id)}
                  className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    activeUnitLessonTab === u.id
                      ? "bg-[#800020] dark:bg-[#A30D36] text-white"
                      : "bg-[#F7F8FA] dark:bg-[#0D1B2E] text-[#64748B] dark:text-[#94A3B8] border border-[#E8E9ED] dark:border-[#22364F] hover:text-[#12263F] dark:hover:text-[#F5F7FB]"
                  }`}
                >
                  <bdi>{u.title}</bdi>
                </button>
              ))}
            </div>
          )}

          {/* Selection Action Bar */}
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#E8E9ED]/60 dark:border-[#22364F] text-xs">
            <span className="font-bold text-[#12263F] dark:text-[#F5F7FB]">
              تم تحديد:{" "}
              <span className="text-[#800020] dark:text-[#E59A18] font-mono">
                {selectedLessonIds.length}
              </span>{" "}
              درس
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAllLessons}
                className="font-bold text-[#800020] dark:text-[#E59A18] hover:underline cursor-pointer"
              >
                تحديد الكل
              </button>
              <span className="text-[#E8E9ED] dark:text-[#22364F]">•</span>
              <button
                type="button"
                onClick={onClearLessons}
                className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#F87171] cursor-pointer"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>

          {/* Lessons Scrollable List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1 bg-[#F7F8FA]/60 dark:bg-[#0D1B2E] rounded-xl border border-[#E8E9ED] dark:border-[#22364F]">
            {displayedLessons.map((lesson) => {
              const isChecked = selectedLessonIds.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onToggleLesson(lesson.id)}
                  className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer h-auto min-w-0 ${
                    isChecked
                      ? "border-[#800020] dark:border-[#A30D36] bg-white dark:bg-[#132945] shadow-xs"
                      : "border-[#E8E9ED] dark:border-[#22364F] bg-white/70 dark:bg-[#10233A] hover:border-[#800020]/40 dark:hover:border-[#2D4563]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked
                        ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                        : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E]"
                    }`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`lesson-title text-xs font-bold block ${
                        isChecked
                          ? "text-[#800020] dark:text-[#F5F7FB]"
                          : "text-[#12263F] dark:text-[#C8D2E0]"
                      }`}
                    >
                      <bdi>{lesson.title}</bdi>
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block mt-1 leading-normal">
                      <bdi>{lesson.unitTitle}</bdi>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
