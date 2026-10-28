"use client";

import { Eye } from "lucide-react";
import type { Attempt } from "./types";

interface AttemptTableProps {
  attempts: Attempt[];
  onOpenInspect: (attempt: Attempt) => void;
}

export function AttemptTable({ attempts, onOpenInspect }: AttemptTableProps) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-[13px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/50 text-[#64748B] font-mono text-[13px] uppercase tracking-wider">
              <th className="py-3 px-4">الطالب</th>
              <th className="py-3 px-4">الامتحان / المادة</th>
              <th className="py-3 px-4">النوع</th>
              <th className="py-3 px-4">النتيجة</th>
              <th className="py-3 px-4">الوقت المستغرق</th>
              <th className="py-3 px-4">التاريخ</th>
              <th className="py-3 px-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/80">
            {attempts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#64748B]">
                  لا توجد محاولات مسجلة مطابقة للبحث
                </td>
              </tr>
            ) : (
              attempts.map((att) => (
                <tr
                  key={att.id}
                  className="hover:bg-[#F8FAFC]/80 dark:hover:bg-[#1E293B]/40 transition-colors"
                >
                  {/* Student */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#F8FAFC] dark:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center font-bold text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">
                        {(att.user.name || "ط").charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
                          {att.user.name || "طالب"}
                        </span>
                        <span className="text-[13px] font-mono text-[#64748B] block">
                          {att.user.phone || att.user.email || "بدون هاتف"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Exam / Subject */}
                  <td className="py-4 px-4">
                    <div>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block truncate max-w-xs">
                        {att.exam?.title || att.title}
                      </span>
                      {att.exam?.subject && (
                        <span className="text-[13px] text-[#64748B] flex items-center gap-1 mt-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: att.exam.subject.color || "#800020",
                            }}
                          />
                          <span>{att.exam.subject.name}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Mode */}
                  <td className="py-4 px-4 font-mono">
                    {att.mode === "EXAM" ? (
                      <span className="px-2 py-1 rounded text-[13px] font-semibold bg-[#800020]/10 text-[#800020] border border-[#800020]/20">
                        امتحان رسمي
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-[13px] font-semibold bg-[#64748B] text-[#64748B] border border-[#94A3B8]/20">
                        تدريب حر
                      </span>
                    )}
                  </td>

                  {/* Score / Percentage */}
                  <td className="py-4 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          att.percentage >= 85
                            ? "text-[#059669]"
                            : att.percentage >= 50
                            ? "text-[#D97706]"
                            : "text-[#DC2626]"
                        }`}
                      >
                        {att.percentage}%
                      </span>
                      <span className="text-[13px] text-[#64748B]">
                        ({att.score} نقطة)
                      </span>
                    </div>
                  </td>

                  {/* Time Spent */}
                  <td className="py-4 px-4 font-mono text-[#64748B] text-[13px]">
                    {Math.floor(att.timeSpentSeconds / 60)}د {att.timeSpentSeconds % 60}ث
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 font-mono text-[#64748B] text-[13px]">
                    {new Date(att.startedAt).toLocaleDateString("ar-EG")}
                  </td>

                  {/* Inspect button */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => onOpenInspect(att)}
                      className="h-7 px-3 rounded-md border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-medium flex items-center gap-2 transition-colors mx-auto cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>مراجعة الإجابات</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
