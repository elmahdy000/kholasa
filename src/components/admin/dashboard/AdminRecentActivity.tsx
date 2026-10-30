import Link from "next/link";
import { CheckCircle2, BookOpen, ChevronLeft } from "lucide-react";
import type { RecentAttemptItem, SubjectStatItem } from "./types";

interface AdminRecentActivityProps {
  recentAttempts: RecentAttemptItem[];
  subjectsWithStats: SubjectStatItem[];
  canReviewAttempts: boolean;
}

export function AdminRecentActivity({
  recentAttempts,
  subjectsWithStats,
  canReviewAttempts,
}: AdminRecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Realtime Submissions */}
      <div className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
          <h3 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#64748B]" />
            <span>أحدث محاولات الطلاب المكتملة</span>
          </h3>
          {canReviewAttempts && <Link
            href="/admin/attempts"
            className="text-[13px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1 font-medium"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>}
        </div>

        {recentAttempts.length === 0 ? (
          <p className="text-[13px] text-[#64748B] py-6 text-center">
            لا توجد محاولات مكتملة مسجلة بعد.
          </p>
        ) : (
          <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="py-3 flex items-center justify-between text-[13px]"
              >
                <div>
                  <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
                    {attempt.user?.name || "طالب"}
                  </span>
                  <span className="text-[13px] text-[#64748B] block font-mono">
                    {attempt.exam?.title || "اختبار"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold text-[13px] ${
                      (attempt.percentage || 0) >= 85
                        ? "text-[#059669]"
                        : (attempt.percentage || 0) >= 50
                        ? "text-[#D97706]"
                        : "text-[#DC2626]"
                    }`}
                  >
                    {attempt.percentage}%
                  </span>
                  {canReviewAttempts && <Link
                    href="/admin/attempts"
                    className="text-[13px] text-[#64748B] hover:text-[#64748B]"
                  >
                    مراجعة
                  </Link>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Curriculum & Subject Saturation */}
      <div className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
          <h3 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#64748B]" />
            <span>حالة المناهج وتغطية المواد الدراسية</span>
          </h3>
          <Link
            href="/admin/curriculum"
            className="text-[13px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1 font-medium"
          >
            <span>المناهج</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 pt-1">
          {subjectsWithStats.map((sub) => {
            const subLessons = sub.units.reduce(
              (acc, u) => acc + u.lessons.length,
              0
            );
            return (
              <div
                key={sub.id}
                className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30 flex items-center justify-between text-[13px]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: sub.color || "#800020" }}
                  />
                  <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {sub.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[13px] text-[#64748B]">
                  <span>{sub.units.length} وحدات</span>
                  <span>·</span>
                  <span>{subLessons} درس</span>
                  <span>·</span>
                  <span>{sub.questions.length} سؤال</span>
                  <span>·</span>
                  <span>{sub.exams.length} امتحانات</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
