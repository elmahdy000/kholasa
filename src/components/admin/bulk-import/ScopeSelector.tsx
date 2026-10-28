"use client";

import type { Subject } from "./types";

interface ScopeSelectorProps {
  subjects: Subject[];
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  selectedUnitId: string;
  setSelectedUnitId: (id: string) => void;
}

export function ScopeSelector({
  subjects,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedUnitId,
  setSelectedUnitId,
}: ScopeSelectorProps) {
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm space-y-3">
      <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
        1. اختر المادة والوحدة المستهدفة للأسئلة المستوردة:
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
            المادة المقررة *
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setSelectedUnitId("");
            }}
            className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
            الوحدة (اختياري)
          </label>
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="">بدون وحدة محددة (عام للمادة)</option>
            {activeSubject?.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
