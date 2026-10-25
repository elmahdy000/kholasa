"use client";

import Link from "next/link";
import {
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Languages,
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
    description: "الكهربية، المغناطيسية، كيرشوف، والفيزياء الحديثة وقوانين بلانك.",
    unitsCount: "8 فصول",
    questionsCount: "+3,200 سؤال",
    color: "#800020",
  },
  {
    id: "chemistry",
    name: "الكيمياء",
    track: "علمي علوم وعلمي رياضة",
    icon: FlaskConical,
    description: "العناصر الانتقالية، التحليل الكيميائي، الاتزان، والكيمياء العضوية.",
    unitsCount: "5 أبواب",
    questionsCount: "+2,800 سؤال",
    color: "#800020",
  },
  {
    id: "biology",
    name: "الأحياء",
    track: "شعبة علمي علوم",
    icon: Dna,
    description: "الدعامة والحركة، التنسيق الهرموني، التكاثر، والمناعة والـ DNA.",
    unitsCount: "4 أبواب",
    questionsCount: "+2,500 سؤال",
    color: "#800020",
  },
  {
    id: "math",
    name: "الرياضيات البحتة والتطبيقية",
    track: "شعبة علمي رياضة",
    icon: Calculator,
    description: "التفاضل والتكامل، الجبر والهندسة الفراغية، والاستاتيكا والديناميكا.",
    unitsCount: "4 فروع",
    questionsCount: "+3,500 سؤال",
    color: "#800020",
  },
  {
    id: "arabic",
    name: "اللغة العربية",
    track: "المسار المشترك (العام والأدبي)",
    icon: BookMarked,
    description: "النحو والقواعد الإعرابية، البلاغة، الأدب، ونواتج القراءة المتحررة.",
    unitsCount: "7 وحدات",
    questionsCount: "+2,400 سؤال",
    color: "#800020",
  },
  {
    id: "geology",
    name: "الجيولوجيا وعلوم البيئة",
    track: "شعبة علمي علوم",
    icon: Mountain,
    description: "مكونات الأرض، التراكيب الجيولوجية، المعادن، الصخور، والتوازن البيئي.",
    unitsCount: "5 أبواب",
    questionsCount: "+1,800 سؤال",
    color: "#800020",
  },
];

export function SubjectsShowcase() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-[#0F172A] border-t border-[#F0E6E8] dark:border-[#334155]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 text-right">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#F0E6E8] dark:border-[#334155] pb-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] block">
              تغطية شاملة ومعتمدة
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1A0A10] dark:text-white leading-tight tracking-tight">
              المناهج الدراسية لشهادة الثانوية العامة 2026
            </h2>
            <p className="text-sm text-[#735C63] dark:text-[#94A3B8] font-normal leading-relaxed">
              كل مادة مفككة إلى وحدات ودروس تفاعلية، مع كبسولة الزتونة المركزة وبنك أسئلة مصنف بحسب مستويات نواتج التعلم الوزارية.
            </p>
          </div>

          <Link
            href="/subjects"
            className="h-11 px-5 rounded-xl border border-[#F0E6E8] dark:border-[#334155] text-xs font-bold text-[#1A0A10] dark:text-white flex items-center gap-2 hover:border-[#800020] hover:text-[#800020] dark:hover:border-[#FB7185] dark:hover:text-[#FB7185] transition-all shrink-0 self-start md:self-auto shadow-xs"
          >
            <span>استعراض جميع المواد والوحدات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => {
            const Icon = sub.icon;
            return (
              <div
                key={sub.id}
                className="p-6 rounded-2xl bg-[#FAF7F8] dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#FB7185]/40 transition-all duration-200 flex flex-col justify-between space-y-5 shadow-xs group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#735C63] dark:text-[#94A3B8] px-2.5 py-1 rounded-md bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155]">
                      {sub.track}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-[#1A0A10] dark:text-white">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-[#735C63] dark:text-[#94A3B8] leading-relaxed font-normal">
                      {sub.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F0E6E8] dark:border-[#334155] flex items-center justify-between text-[11px] text-[#735C63] dark:text-[#94A3B8]">
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
