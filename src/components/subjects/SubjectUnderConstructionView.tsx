import Link from "next/link";
import { ArrowRight, Home, Lock, Wrench } from "lucide-react";

interface SubjectUnderConstructionViewProps {
  subjectName: string;
  description?: string | null;
  backHref?: string;
}

export function SubjectUnderConstructionView({
  subjectName,
  description,
  backHref = "/subjects",
}: SubjectUnderConstructionViewProps) {
  return (
    <div dir="rtl" className="max-w-2xl mx-auto py-8 sm:py-12 px-2 text-right font-sans">
      <div className="kholasa-signature-curve rounded-3xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-[0_8px_28px_rgba(9,27,64,0.07)] p-6 sm:p-10 text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#800B34]/10 dark:bg-[#800B34]/25 border border-[#800B34]/20 flex items-center justify-center text-[#800B34] dark:text-[#FB7185] relative">
            <Wrench className="w-8 h-8" />
            <span className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-[#091B40] text-[#E9AD32] flex items-center justify-center shadow-sm">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-xs font-extrabold text-amber-800 dark:text-amber-200">
            <Wrench className="w-3.5 h-3.5" />
            <span>تحت الإنشاء</span>
          </span>
        </div>

        <div className="space-y-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-[#091B40] dark:text-white leading-snug">
            مادة {subjectName} — تحت الإنشاء
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#536681] dark:text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
            هذه المادة مغلقة حالياً وجارٍ استكمال إعداد دروسها وخرائطها وتدريباتها وفق منهج الخلاصة للبكالوريا المصرية، وستُفتح لجميع الطلاب فور الانتهاء من التجهيز.
          </p>
          {description && (
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] rounded-xl px-4 py-2.5 max-w-lg mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={backHref}
            className="w-full sm:w-auto min-h-[44px] px-6 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى المواد الدراسية</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto min-h-[44px] px-6 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] hover:bg-[#EAF2FF] dark:hover:bg-[#132C60] border border-[#E2E8F0] dark:border-[#1E3A6E] text-[#091B40] dark:text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32]" />
            <span>الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
