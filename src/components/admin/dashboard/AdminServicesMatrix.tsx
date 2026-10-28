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
  ArrowUpRight,
} from "lucide-react";
import type { AdminDashboardMetrics } from "./types";

interface AdminServicesMatrixProps {
  metrics: AdminDashboardMetrics;
}

export function AdminServicesMatrix({ metrics }: AdminServicesMatrixProps) {
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
      desc: "رفع بنوك أسئلة كاملة عبر ملفات CSV أو لصق نصي",
      href: "/admin/questions/import",
      icon: Upload,
      stat: "CSV / JSON",
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
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
          الخدمات والعمليات الإدارية المتكاملة
        </h2>
        <span className="text-[13px] font-mono text-[#64748B]">
          9 خدمات نشطة
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {administrativeServices.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <Link
              key={idx}
              href={srv.href}
              className="group p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-[#E2E8F0] dark:hover:border-[#E11D48]/60 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC] transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                  {srv.stat}
                </span>
              </div>

              <div>
                <h3 className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors flex items-center justify-between">
                  <span>{srv.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed line-clamp-2">
                  {srv.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
