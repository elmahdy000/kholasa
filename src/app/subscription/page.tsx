import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { StudentPaywallView } from "@/components/student/subscription/StudentPaywallView";
import { CheckCircle2, BookOpen, LayoutDashboard, Upload } from "lucide-react";

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
      <div className="w-full max-w-[1050px] mx-auto space-y-4 pb-8 sm:pb-12">
        {/* Breadcrumb */}
        <nav
          aria-label="مسار التصفح"
          className="flex items-center gap-2 text-[13px] font-semibold text-[#64748B] pt-1"
        >
          <Link href="/dashboard" className="hover:text-[#1D4ED8] transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-[#091B40] font-bold">تأكيد دفع الاشتراك</span>
        </nav>

        {isActive && !isForceView ? (
          <div className="max-w-xl mx-auto my-8 sm:my-12 p-6 sm:p-10 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_30px_rgba(9,27,64,0.06)] text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-[20px] sm:text-[24px] font-black text-[#091B40]">
                حسابك مفعّل بالكامل!
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#475569] leading-relaxed max-w-md mx-auto">
                اشتراكك نشط وشامل كافة الدروس والوحدات والكبسولات وبنك الأسئلة والامتحانات التفاعلية.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/subjects"
                className="w-full sm:w-auto min-h-[44px] px-6 rounded-xl bg-[#091B40] hover:bg-[#1D4ED8] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>تصفح المواد والدروس</span>
              </Link>
              <Link
                href="/subscription?renew=true"
                className="w-full sm:w-auto min-h-[44px] px-5 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-[14px] font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>رفع إيصال جديد أو تجديد</span>
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto min-h-[44px] px-6 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#091B40] border border-[#E2E8F0] text-[14px] font-bold flex items-center justify-center gap-2 transition-colors"
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
