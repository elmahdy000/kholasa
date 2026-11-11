"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { SchoolCategory } from "@prisma/client";
import {
  Search,
  Code,
  Cpu,
  ShieldCheck,
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  BookOpen,
  Mountain,
  ArrowLeft,
  BookmarkCheck,
  Layers,
  BookMarked,
  Lock,
  Wrench,
  X,
} from "lucide-react";

export interface SubjectItemData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  schoolCategory?: SchoolCategory;
  isCommonCategory?: boolean;
  isUnderConstruction?: boolean;
  systemName?: string | null;
  gradeName?: string | null;
  trackName?: string | null;
  unitsCount: number;
  lessonsCount: number;
}

interface SubjectsExplorerProps {
  subjects: SubjectItemData[];
  isStaff?: boolean;
}

function getSubjectIcon(code: string, name: string) {
  const c = (code + " " + name).toLowerCase();
  if (c.includes("cpp") || c.includes("برمج") || c.includes("كود")) return Code;
  if (c.includes("ai") || c.includes("ذكاء") || c.includes("اصطناع")) return Cpu;
  if (c.includes("cyber") || c.includes("أمن") || c.includes("سيبران") || c.includes("تشفير"))
    return ShieldCheck;
  if (c.includes("physic") || c.includes("فيزياء")) return Atom;
  if (c.includes("chem") || c.includes("كيمياء")) return FlaskConical;
  if (c.includes("bio") || c.includes("أحياء")) return Dna;
  if (c.includes("math") || c.includes("رياض")) return Calculator;
  if (c.includes("geolog") || c.includes("جيولوجيا") || c.includes("بيئة")) return Mountain;
  if (c.includes("arab") || c.includes("عرب")) return BookOpen;
  return BookMarked;
}

const formatCount = (value: number) => new Intl.NumberFormat("en-US").format(value);

export function SubjectsExplorer({ subjects, isStaff }: SubjectsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  // Extract unique track / grade filter categories
  const filterTabs = useMemo(() => {
    const tabs = [{ id: "ALL", label: "كل المواد" }];
    const set = new Set<string>();

    for (const s of subjects) {
      if (s.trackName && !set.has(s.trackName)) {
        set.add(s.trackName);
        tabs.push({ id: s.trackName, label: s.trackName });
      } else if (s.gradeName && !set.has(s.gradeName)) {
        set.add(s.gradeName);
        tabs.push({ id: s.gradeName, label: s.gradeName });
      }
    }
    return tabs;
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.gradeName && s.gradeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.trackName && s.trackName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        selectedFilter === "ALL" ||
        s.trackName === selectedFilter ||
        s.gradeName === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [subjects, searchQuery, selectedFilter]);

  if (subjects.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
        <div className="w-12 h-12 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-[#091B40] dark:text-white">
            {isStaff ? "لسه مفيش مواد مضافة" : "لا توجد مواد دراسية متاحة حالياً لمسارك"}
          </h3>
          <p className="text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
            {isStaff
              ? "المسارات والصفوف جاهزة، وتقدر تبدأ تضيف المواد والوحدات والدروس من لوحة التحكم."
              : "يتم إعداد وتحديث المناهج الدراسية الخاصة بصفك الدراسي. يمكنك التواصل مع الدعم إذا احتجت مساعدة."}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          {isStaff ? (
            <Link
              href="/admin/curriculum"
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold transition-colors"
            >
              <span>إضافة مادة من لوحة التحكم</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold transition-colors"
            >
              <span>العودة للرئيسية</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  const gridColsClass =
    filteredSubjects.length <= 2
      ? "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6";

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#536681] dark:text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المادة أو الموضوع..."
              className="w-full min-h-[44px] pr-10 pl-10 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-sm font-medium text-[#091B40] dark:text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#800B34] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="مسح البحث"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#536681] hover:text-[#091B40] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Result Counter Pill */}
          <div className="shrink-0 min-h-[44px] flex items-center justify-center text-xs font-bold font-sans tabular-nums text-[#536681] dark:text-[#94A3B8] bg-[#F7F9FC] dark:bg-[#1E293B] px-4 rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
            عرض {formatCount(filteredSubjects.length)} من {formatCount(subjects.length)} مادة
          </div>
        </div>

        {/* Filter Pills */}
        {filterTabs.length > 2 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
            {filterTabs.map((tab) => {
              const isSelected = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`min-h-[40px] px-3.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#800B34] text-white"
                      : "bg-[#F7F9FC] dark:bg-[#1E293B] text-[#536681] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:text-[#091B40] dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length > 0 ? (
        <div className={gridColsClass}>
          {filteredSubjects.map((subj) => {
            const Icon = getSubjectIcon(subj.code, subj.name);
            const isLanguages = subj.schoolCategory === "LANGUAGES";
            const badgeLabel = subj.isCommonCategory
              ? "مادة عامة لكل المسارات"
              : subj.trackName ||
                subj.gradeName ||
                (isLanguages ? "مدارس اللغات" : "المدارس العربية");
            const isEnglishDesc = Boolean(
              subj.description && /^[A-Za-z0-9]/.test(subj.description.trim())
            );

            return (
              <Link
                key={subj.id}
                href={`/subjects/${subj.id}`}
                className="group p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34]/60 transition-colors flex flex-col justify-between gap-5 min-w-0"
              >
                <div className="space-y-4">
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{
                        backgroundColor:
                          subj.color || (isLanguages ? "#800B34" : "#091B40"),
                      }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {subj.isUnderConstruction && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>تحت الإنشاء</span>
                        </span>
                      )}
                      <span className="text-xs font-bold text-[#536681] dark:text-[#94A3B8] bg-[#F7F9FC] dark:bg-[#1E293B] px-3 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
                        {badgeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[#091B40] dark:text-white group-hover:text-[#800B34] dark:group-hover:text-[#FB7185] transition-colors leading-snug break-words">
                      <bdi>{subj.name}</bdi>
                    </h3>
                    <p
                      dir={isEnglishDesc ? "ltr" : "rtl"}
                      className={`text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed font-normal break-words ${
                        isEnglishDesc ? "text-left" : "text-right"
                      }`}
                    >
                      {subj.description ||
                        "شرح منظم لوحدات المنهج، تعريفات الدرس الأساسية، وتدريبات بتفسير معتمد."}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  {subj.isUnderConstruction ? (
                    <div className="p-3 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#536681] dark:text-[#94A3B8]">
                      جاري العمل على تجهيز الوحدات والدروس لتكون متاحة قريباً.
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-[#536681] dark:text-[#94A3B8]">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
                        <Layers className="w-3.5 h-3.5 text-[#800B34] dark:text-[#FB7185]" />
                        <strong className="font-sans tabular-nums font-bold text-[#091B40] dark:text-white">
                          {formatCount(subj.unitsCount)}
                        </strong>
                        <span>وحدات</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
                        <BookmarkCheck className="w-3.5 h-3.5 text-[#091B40] dark:text-white" />
                        <strong className="font-sans tabular-nums font-bold text-[#091B40] dark:text-white">
                          {formatCount(subj.lessonsCount)}
                        </strong>
                        <span>درساً</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-xs sm:text-sm font-bold text-[#800B34] dark:text-[#FB7185]">
                  <span>
                    {subj.isUnderConstruction
                      ? "تحت الإنشاء — مغلقة حالياً"
                      : "تصفح الوحدات والدروس"}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-[#800B34]/10 dark:bg-[#800B34]/20 flex items-center justify-center group-hover:bg-[#800B34] group-hover:text-white transition-colors">
                    {subj.isUnderConstruction ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <ArrowLeft className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty Search State */
        <div className="p-10 text-center rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
          <div className="w-12 h-12 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#536681] dark:text-[#94A3B8] flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#091B40] dark:text-white">
              لم نعثر على مواد مطابقة للبحث
            </h3>
            <p className="text-sm text-[#536681] dark:text-[#94A3B8] max-w-sm mx-auto">
              جرب البحث بكلمة أخرى أو امسح التصفية لعرض كافة المواد المتاحة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("ALL");
            }}
            className="min-h-[44px] px-5 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold transition-colors cursor-pointer"
          >
            عرض كل المواد
          </button>
        </div>
      )}
    </div>
  );
}
