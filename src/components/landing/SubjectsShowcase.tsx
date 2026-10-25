"use client";

import Link from "next/link";
import {
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  BookMarked,
  ArrowLeft,
  Mountain,
} from "lucide-react";

const subjects = [
  {
    id: "physics",
    name: "الفيزياء",
    track: "علمي علوم وعلمي رياضة",
    icon: Atom,
    description: "الكهربية، كيرشوف، الدينامو، والفيزياء الحديثة وقوانين بلانك بأمثلة ومسائل واضحة.",
    unitsCount: "8 فصول",
    questionsCount: "+3,200 سؤال",
  },
  {
    id: "chemistry",
    name: "الكيمياء",
    track: "علمي علوم وعلمي رياضة",
    icon: FlaskConical,
    description: "العناصر الانتقالية، التحليل الكيميائي، الاتزان، الباب الرابع، والعضوية من غير تعقيد.",
    unitsCount: "5 أبواب",
    questionsCount: "+2,800 سؤال",
  },
  {
    id: "biology",
    name: "الأحياء",
    track: "شعبة علمي علوم",
    icon: Dna,
    description: "الدعامة والحركة، الهرمونات، التكاثر، والمناعة والـ DNA برسم وتوضيح مبسط.",
    unitsCount: "4 أبواب",
    questionsCount: "+2,500 سؤال",
  },
  {
    id: "math",
    name: "الرياضيات البحتة والتطبيقية",
    track: "شعبة علمي رياضة",
    icon: Calculator,
    description: "التفاضل والتكامل، الجبر والفراغية، والاستاتيكا والديناميكا بمسائل متدرجة لحد أفكار الامتحانات.",
    unitsCount: "4 فروع",
    questionsCount: "+3,500 سؤال",
  },
  {
    id: "arabic",
    name: "اللغة العربية",
    track: "المسار المشترك (العام والأدبي)",
    icon: BookMarked,
    description: "قواعد النحو وتطبيقاتها، البلاغة، الأدب، ونواتج القراءة المتحررة مع تدريب عملي.",
    unitsCount: "7 وحدات",
    questionsCount: "+2,400 سؤال",
  },
  {
    id: "geology",
    name: "الجيولوجيا وعلوم البيئة",
    track: "شعبة علمي علوم",
    icon: Mountain,
    description: "الصخور، المعادن، التراكيب الجيولوجية، وعلوم البيئة بأسهل طريقة تلخيص وتثبيت.",
    unitsCount: "5 أبواب",
    questionsCount: "+1,800 سؤال",
  },
];

export function SubjectsShowcase() {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14 text-right">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E9ED] dark:border-[#334155] pb-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
              مواد الثانوية العامة مشروحة ومترتبة صح
            </h2>
            <p className="text-base text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
              كل مادة متقسمة لوحدات ودروس واضحة، مع زتونة سريعة لكل درس وبنك أسئلة متفصل على مواصفات الوزارة.
            </p>
          </div>

          <Link
            href="/subjects"
            className="h-11 px-5 rounded-xl border border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#12263F] dark:text-white flex items-center gap-2 hover:border-[#800020] hover:text-[#800020] dark:hover:border-[#FB7185] dark:hover:text-[#FB7185] transition-colors shrink-0 self-start md:self-auto shadow-xs"
          >
            <span>تصفح كل المواد والوحدات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => {
            const Icon = sub.icon;
            return (
              <div
                key={sub.id}
                className="p-6 rounded-2xl bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-5 shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155]">
                      {sub.track}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                      {sub.name}
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                      {sub.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E9ED] dark:border-[#334155] flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
                  <span>{sub.unitsCount}</span>
                  <span className="font-semibold text-[#800020] dark:text-[#FB7185]">
                    {sub.questionsCount}
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
