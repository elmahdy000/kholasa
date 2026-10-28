"use client";

import Link from "next/link";
import { BookOpen, Target, BookmarkSimple, ArrowCounterClockwise, Trophy } from "@phosphor-icons/react";

interface QuickActionsGridProps {
  subjectsCount: number;
  unresolvedMistakesCount: number;
}

export function QuickActionsGrid({ subjectsCount, unresolvedMistakesCount }: QuickActionsGridProps) {
  const quickActions = [
    {
      id: "subjects",
      title: "تصفح المناهج",
      desc: "المواد والوحدات والدروس بتاعتك",
      href: "/subjects",
      icon: BookOpen,
      badge: `${subjectsCount} مواد`,
      badgeColor: "bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185]",
      iconBg: "bg-[#800020]/10 text-[#800020] dark:bg-[#1E293B] dark:text-[#FB7185]",
      layoutClass: "col-span-2 sm:col-span-3 lg:col-span-1",
      isFeaturedOnMobile: true,
    },
    {
      id: "quick-exam",
      title: "اختبار 5 دقايق",
      desc: "سؤالين على السريع تطمن بيهم على فهمك",
      href: "/exams/builder",
      icon: Target,
      badge: "فوري",
      badgeColor: "bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/30 dark:text-[#34D399]",
      iconBg: "bg-[#059669]/10 text-[#059669] dark:bg-[#1E293B] dark:text-[#34D399]",
      layoutClass: "col-span-1 sm:col-span-3 lg:col-span-1",
    },
    {
      id: "capsule",
      title: "كبسولة الزتونة",
      desc: "أهم القوانين والخلاصات في السريع",
      href: "/subjects",
      icon: BookmarkSimple,
      badge: "شامل",
      badgeColor: "bg-[#D97706]/10 text-[#D97706] dark:bg-[#D97706]/30 dark:text-[#FBBF24]",
      iconBg: "bg-[#D97706]/10 text-[#D97706] dark:bg-[#1E293B] dark:text-[#FBBF24]",
      layoutClass: "col-span-1 sm:col-span-2 lg:col-span-1",
    },
    {
      id: "mistakes",
      title: "ركن غلطاتي",
      desc: "راجع الأسئلة اللي وقفت معاك قبل كدة",
      href: "/mistakes",
      icon: ArrowCounterClockwise,
      badge: `${unresolvedMistakesCount} أخطاء`,
      badgeColor:
        unresolvedMistakesCount > 0
          ? "bg-[#DC2626] text-white"
          : "bg-[#F3F4F6] text-[#6B7280] dark:bg-[#334155] dark:text-[#94A3B8]",
      iconBg: "bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#1E293B] dark:text-[#F87171]",
      layoutClass: "col-span-1 sm:col-span-2 lg:col-span-1",
    },
    {
      id: "leaderboard",
      title: "لوحة الشرف",
      desc: "ترتيبك بين زمايلك للأسبوع ده",
      href: "/leaderboard",
      icon: Trophy,
      badge: "تنافسي",
      badgeColor: "bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185]",
      iconBg: "bg-[#800020]/10 text-[#800020] dark:bg-[#1E293B] dark:text-[#FB7185]",
      layoutClass: "col-span-1 sm:col-span-2 lg:col-span-1",
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-[#12263F] dark:text-[#F8FAFC]">
          اختصارات سريعة
        </h2>
        <span className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium">
          كل اللي تحتاجه في مكان واحد
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-5 gap-3 sm:gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className={`group p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-all flex flex-col justify-between text-right ${action.layoutClass}`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action.iconBg}`}
                >
                  <Icon className="w-5 h-5" weight="bold" />
                </div>
                {action.badge && (
                  <span
                    className={`text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${action.badgeColor}`}
                  >
                    {action.badge}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-[13px] sm:text-sm font-bold text-[#12263F] dark:text-[#F8FAFC] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors leading-snug">
                  {action.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed line-clamp-2">
                  {action.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
