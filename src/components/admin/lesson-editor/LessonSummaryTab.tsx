"use client";

import {
  BookmarkCheck,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { CommonMistakeItem } from "./types";

interface LessonSummaryTabProps {
  keyConcepts: string[];
  newConcept: string;
  setNewConcept: (v: string) => void;
  onAddKeyConcept: () => void;
  onRemoveKeyConcept: (idx: number) => void;
  examTips: string[];
  newExamTip: string;
  setNewExamTip: (v: string) => void;
  onAddExamTip: () => void;
  onRemoveExamTip: (idx: number) => void;
  commonMistakes: CommonMistakeItem[];
  newMistake: string;
  setNewMistake: (v: string) => void;
  newCorrection: string;
  setNewCorrection: (v: string) => void;
  onAddMistake: () => void;
  onRemoveMistake: (idx: number) => void;
}

export function LessonSummaryTab({
  keyConcepts,
  newConcept,
  setNewConcept,
  onAddKeyConcept,
  onRemoveKeyConcept,
  examTips,
  newExamTip,
  setNewExamTip,
  onAddExamTip,
  onRemoveExamTip,
  commonMistakes,
  newMistake,
  setNewMistake,
  newCorrection,
  setNewCorrection,
  onAddMistake,
  onRemoveMistake,
}: LessonSummaryTabProps) {
  return (
    <div className="space-y-6">
      {/* Key Concepts */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
        <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-[#D97706]" />
          <span>المفاهيم والنقاط الجوهرية (كبسولة الزتونة)</span>
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newConcept}
            onChange={(e) => setNewConcept(e.target.value)}
            placeholder="أضف مفهوماً جوهرياً..."
            className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddKeyConcept();
              }
            }}
          />
          <button
            type="button"
            onClick={onAddKeyConcept}
            disabled={!newConcept.trim()}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>

        {keyConcepts.length > 0 && (
          <div className="space-y-2 pt-1">
            {keyConcepts.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemoveKeyConcept(i)}
                  className="text-[#DC2626] hover:text-[#B91C1C] p-1 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam Tips */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
        <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#059669]" />
          <span>تكات الامتحان الهامة (Exam Tips)</span>
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newExamTip}
            onChange={(e) => setNewExamTip(e.target.value)}
            placeholder="مثال: ركّز على كلمة (فقط) في صيغة السؤال فإنها تنفي..."
            className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddExamTip();
              }
            }}
          />
          <button
            type="button"
            onClick={onAddExamTip}
            disabled={!newExamTip.trim()}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>

        {examTips.length > 0 && (
          <div className="space-y-2 pt-1">
            {examTips.map((tip, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                <span>{tip}</span>
                <button
                  type="button"
                  onClick={() => onRemoveExamTip(i)}
                  className="text-[#DC2626] hover:text-[#B91C1C] p-1 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Common Mistakes */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#F87171]/40 space-y-3">
        <label className="text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>الأخطاء الشائعة وتحذيرات الامتحان</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={newMistake}
            onChange={(e) => setNewMistake(e.target.value)}
            placeholder="الخطأ الشائع لدى الطلاب..."
            className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#DC2626]"
          />
          <input
            type="text"
            value={newCorrection}
            onChange={(e) => setNewCorrection(e.target.value)}
            placeholder="التصحيح العلمي الدقيق..."
            className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#059669]"
          />
        </div>
        <button
          type="button"
          onClick={onAddMistake}
          disabled={!newMistake.trim() || !newCorrection.trim()}
          className="h-11 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold flex items-center gap-2 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة الخطأ والتصحيح</span>
        </button>

        {commonMistakes.length > 0 && (
          <div className="space-y-2 pt-2">
            {commonMistakes.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-start justify-between gap-3"
              >
                <div className="space-y-1 text-[13px] font-bold">
                  <p className="text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
                    <span>خطأ:</span>
                    <span>{item.mistake}</span>
                  </p>
                  <p className="text-[#059669] dark:text-[#34D399] flex items-center gap-2">
                    <span>الصواب:</span>
                    <span>{item.correction}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveMistake(i)}
                  className="text-[#DC2626] hover:text-[#B91C1C] p-1 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
