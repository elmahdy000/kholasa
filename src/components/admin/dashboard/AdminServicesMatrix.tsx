import Link from "next/link";
import {
  BookOpen,
  Layers,
  HelpCircle,
  Upload,
  Award,
  CheckCircle2,
  Users,
  HardDrive,
  Activity,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import type { AdminDashboardMetrics } from "./types";
import { rawNavigationGroups } from "@/components/layout/admin/navigation";

interface AdminServicesMatrixProps {
  metrics: AdminDashboardMetrics;
  role: string;
}

export function AdminServicesMatrix({ metrics, role }: AdminServicesMatrixProps) {
  const {
    studentsCount,
    subjectsCount,
    lessonsCount,
    questionsCount,
    examsCount,
    attemptsCount,
    avgScore,
  } = metrics;

  const administrativeServices = [
    {
      title: "المناهج والهيكل الأكاديمي",
      desc: "إدارة المقررات، المسارات، الوحدات، الدروس، والخرائط الذهنية",
      href: "/admin/curriculum",
      icon: BookOpen,
      stat: `${subjectsCount} مادة • ${lessonsCount} درس`,
    },
    {
      title: "بنك الأسئلة والتفسيرات",
      desc: "إضافة وتعديل وحذف الأسئلة وربط المفاهيم التعليمية",
      href: "/admin/questions",
      icon: HelpCircle,
      stat: `${questionsCount} سؤال`,
    },
    {
      title: "استيراد الأسئلة المجمع",
      desc: "استيراد الأسئلة من ملفات Word أو PDF أو النصوص",
      href: "/admin/questions/import",
      icon: Upload,
      stat: "Word / PDF",
    },
    {
      title: "إدارة الامتحانات الرسمية",
      desc: "إنشاء وجدولة الامتحانات، وتحديد التوقيت وربط الأسئلة",
      href: "/admin/exams",
      icon: Award,
      stat: `${examsCount} امتحان`,
    },
    {
      title: "سجل المحاولات والتصحيح",
      desc: "متابعة إجابات الطلاب، وتصحيح الأسئلة المقالية في الوقت الفعلي",
      href: "/admin/attempts",
      icon: CheckCircle2,
      stat: `${attemptsCount} محاولة`,
    },
    {
      title: "شؤون الطلاب والمستخدمين",
      desc: "متابعة أداء الطلاب، ترقية المسؤولين، ومراجعة السجلات",
      href: "/admin/users",
      icon: Users,
      stat: `${studentsCount} طالب`,
    },
    {
      title: "مركز رفع الوسائط والملفات",
      desc: "رفع ملفات الصوت (البودكاست)، الخرائط الذهنية ومستندات PDF",
      href: "/admin/media",
      icon: HardDrive,
      stat: "Upload Center",
    },
    {
      title: "التحليلات ومؤشرات الأداء",
      desc: "مؤشرات التحصيل، توزيع صعوبة الأسئلة، وسجل تدقيق العمليات",
      href: "/admin/analytics",
      icon: Activity,
      stat: `${avgScore}% معدل`,
    },
    {
      title: "الإعلانات والإشعارات العامة",
      desc: "بث الإعلانات العامة للطلاب، تنبيهات المتصفح، وإشعارات المنصة الفورية",
      href: "/admin/notifications",
      icon: Bell,
      stat: "Broadcast & Push",
    },
  ].filter((service) => rawNavigationGroups.flatMap((group) => group.items)
    .some((item) => item.href === service.href && item.allowedRoles.includes(role)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
          الخدمات والعمليات الإدارية المتكاملة
        </h2>
        <span className="text-[13px] font-mono text-[#64748B]">
          {administrativeServices.length} خدمات متاحة
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {administrativeServices.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <Link
              key={idx}
              href={srv.href}
              className="group p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:border-[#334155] dark:hover:border-white/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-[#F8FAFC] transition-colors" />
                </div>
                <h3 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors">
                  {srv.title}
                </h3>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1 line-clamp-2">
                  {srv.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0]/50 dark:border-[#334155]/50 flex items-center justify-between text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
                <span>الحالة: نشط</span>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {srv.stat}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
