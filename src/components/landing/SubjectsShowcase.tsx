"use client";

import Link from "next/link";
import {
  Cpu,
  Code2,
  Brain,
  Calculator,
  BookMarked,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export interface DynamicLandingSubject {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  track?: { name: string } | null;
  _count?: {
    units: number;
    questions: number;
  };
}

interface SubjectsShowcaseProps {
  subjects?: DynamicLandingSubject[];
}

const defaultIcons = [Cpu, Code2, Brain, Calculator, BookMarked, ShieldCheck];

export function SubjectsShowcase({ subjects = [] }: SubjectsShowcaseProps) {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14 text-right">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E9ED] dark:border-[#334155] pb-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800B34]/10 border border-[#800B34]/20 text-[#800B34] dark:text-[#FB7185] text-xs font-bold mb-1">
              🏗️ مسار الهندسة وعلوم الحاسب
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
              مواد البكالوريا مشروحة ومترتبة صح
            </h2>
            <p className="text-base text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
              كل مادة متقسمة لوحدات ودروس واضحة، مع كبسولة زتونة سريعة لكل
              درس وبنك أسئلة متفصل على مواصفات الوزارة.
            </p>
          </div>

          <Link
            href="/subjects"
            className="h-11 px-5 rounded-xl border border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#12263F] dark:text-white flex items-center gap-2 hover:border-[#800B34] hover:text-[#800B34] dark:hover:border-[#FB7185] dark:hover:text-[#FB7185] transition-colors shrink-0 self-start md:self-auto shadow-xs"
          >
            <span>تصفح كل المواد والوحدات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub, index) => {
            const Icon = defaultIcons[index % defaultIcons.length] || BookOpen;
            const unitsCount = sub._count?.units ?? 0;
            const questionsCount = sub._count?.questions ?? 0;
            const trackName = sub.track?.name || "المسار العام";

            return (
              <div
                key={sub.id}
                className="p-6 rounded-2xl bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800B34]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-5 shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: sub.color || "#800B34" }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155]">
                      {trackName}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                      {sub.name}
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal line-clamp-2">
                      {sub.description || "شرح مبسط ومفاهيم واضحة وتدريبات متدرجة تغطي كافة نواتج التعلم."}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E9ED] dark:border-[#334155] flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">
                  <span>{unitsCount > 0 ? `${unitsCount} وحدات وفصول` : "قيد الإعداد"}</span>
                  <span className="font-semibold text-[#800B34] dark:text-[#FB7185]">
                    {questionsCount > 0 ? `${questionsCount} أسئلة تدريبية` : "بنك الأسئلة قيد التحديث"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
