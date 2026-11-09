import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { StudentPaywallView } from "@/components/student/subscription/StudentPaywallView";
import { CheckCircle2, BookOpen, LayoutDashboard, Upload, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface SubscriptionPageProps {
  searchParams?: Promise<{
    force?: string;
    manage?: string;
    renew?: string;
  }>;
}

export default async function SubscriptionPage({ searchParams }: SubscriptionPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/subscription");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const isForceView =
    resolvedParams?.force === "true" ||
    resolvedParams?.manage === "true" ||
    resolvedParams?.renew === "true";

  const isStaff = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const isActive = isStaff || user.subscriptionStatus === "ACTIVE";

  return (
    <StudentShell user={user}>
      <div className="w-full max-w-[1080px] mx-auto space-y-3 sm:space-y-4 pb-6 sm:pb-10 px-3 sm:px-4">
        {/* Breadcrumb */}
        <nav aria-label="مسار التصفح" className="flex items-center gap-2 text-xs font-semibold text-[#64748B] pt-1 sm:pt-2">
          <Link href="/dashboard" className="hover:text-[#800B34] transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-[#091B40] font-bold">شاشة تفعيل الاشتراك ورفع الإيصال</span>
        </nav>

        {isActive && !isForceView ? (
          <div className="max-w-xl mx-auto my-8 sm:my-12 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-emerald-500/30 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white">
                حسابك مفعّل بالكامل! 🎉
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-md mx-auto">
                اشتراكك نشط وشامل كافة الدروس والوحدات والكبسولات وبنك الأسئلة والامتحانات التفاعلية.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/subjects"
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>تصفح المواد والدروس</span>
              </Link>
              <Link
                href="/subscription?renew=true"
                className="w-full sm:w-auto h-11 px-5 rounded-xl bg-[#FAF6F7] hover:bg-[#F3E8EC] text-[#800B34] border border-[#800B34]/20 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>رفع إيصال جديد أو تجديد الاشتراك</span>
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>لوحة التحكم</span>
              </Link>
            </div>
          </div>
        ) : (
          <StudentPaywallView user={user} />
        )}
      </div>
    </StudentShell>
  );
}

