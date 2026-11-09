"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  Target,
  Layers,
  BookMarked,
  X,
} from "lucide-react";

export interface SubjectItemData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
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
  if (c.includes("cyber") || c.includes("أمن") || c.includes("سيبران") || c.includes("تشفير")) return ShieldCheck;
  if (c.includes("physic") || c.includes("فيزياء")) return Atom;
  if (c.includes("chem") || c.includes("كيمياء")) return FlaskConical;
  if (c.includes("bio") || c.includes("أحياء")) return Dna;
  if (c.includes("math") || c.includes("رياض")) return Calculator;
  if (c.includes("geolog") || c.includes("جيولوجيا") || c.includes("بيئة")) return Mountain;
  if (c.includes("arab") || c.includes("عرب")) return BookOpen;
  return BookMarked;
}

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
      <div className="p-8 sm:p-14 text-center rounded-3xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-[0_8px_28px_rgba(9,27,64,0.07)] space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#800B34]/10 text-[#800B34] dark:bg-[#E9AD32]/15 dark:text-[#E9AD32] flex items-center justify-center mx-auto">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-[#091B40] dark:text-white">
            {isStaff ? "لسه مفيش مواد مضافة" : "لا توجد مواد دراسية متاحة حالياً لمسارك"}
          </h3>
          <p className="text-xs sm:text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
            {isStaff
              ? "المسارات والصفوف جاهزة ومتظبطة، وتقدر تبدأ تضيف المواد والوحدات والدروس من لوحة التحكم."
              : "يتم إعداد وتحديث المناهج الدراسية الخاصة بصفك الدراسي. إذا كنت تواجه مشكلة، يرجى مراجعة إدارة السنتر أو المساعد."}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          {isStaff ? (
            <Link
              href="/admin/curriculum"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-bold transition-all shadow-md"
            >
              <span>إضافة مادة من لوحة التحكم</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-bold transition-all shadow-md"
            >
              <span>العودة للرئيسية</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Bar & Filters */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#536681] dark:text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المادة، الوحدة، أو الموضوع..."
              className="w-full h-11 pr-10 pl-10 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-semibold text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800B34] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#536681] hover:text-[#091B40] dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Result Counter Pill */}
          <div className="shrink-0 text-xs font-bold text-[#536681] dark:text-[#94A3B8] bg-[#F7F9FC] dark:bg-[#071737] px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] text-center">
            عرض {filteredSubjects.length} من {subjects.length} مادة
          </div>
        </div>

        {/* Filter Pills */}
        {filterTabs.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[#E2E8F0] dark:border-[#1E3A6E]">
            {filterTabs.map((tab) => {
              const isSelected = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#800B34] text-white shadow-sm"
                      : "bg-[#F7F9FC] dark:bg-[#071737] text-[#536681] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:text-[#091B40] dark:hover:text-white"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subj) => {
            const Icon = getSubjectIcon(subj.code, subj.name);
            const badgeLabel =
              subj.trackName || subj.gradeName || subj.systemName || "منهج معتمد";

            return (
              <Link
                key={subj.id}
                href={`/subjects/${subj.id}`}
                className="group p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#800B34]/50 transition-all flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md h-auto min-w-0"
              >
                <div className="space-y-4">
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: subj.color || "#800B34" }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <span className="text-[11px] font-bold text-[#536681] dark:text-[#94A3B8] bg-[#F7F9FC] dark:bg-[#071737] px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#1E3A6E]">
                      {badgeLabel}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#091B40] dark:text-[#F7F9FC] group-hover:text-[#800B34] dark:group-hover:text-[#E9AD32] transition-colors leading-snug break-words">
                      <bdi>{subj.name}</bdi>
                    </h3>
                    <p className="text-xs text-[#536681] dark:text-[#94A3B8] leading-relaxed font-normal break-words">
                      {subj.description ||
                        "شرح كامل لوحدات المنهج، ملخص مركز، وأسئلة لكل درس."}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-[#536681] dark:text-[#94A3B8]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E]">
                      <Layers className="w-3.5 h-3.5 text-[#800B34] dark:text-[#E9AD32]" />
                      <span>{subj.unitsCount} وحدات</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E]">
                      <BookmarkCheck className="w-3.5 h-3.5 text-[#E9AD32]" />
                      <span>{subj.lessonsCount} درس</span>
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E3A6E] flex items-center justify-between text-xs font-bold text-[#800B34] dark:text-[#E9AD32]">
                  <span>تصفح المنهج والدروس</span>
                  <div className="w-8 h-8 rounded-lg bg-[#800B34]/10 dark:bg-[#E9AD32]/15 flex items-center justify-center group-hover:bg-[#800B34] group-hover:text-white transition-all">
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty Search State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] text-[#536681] dark:text-[#94A3B8] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#091B40] dark:text-[#F7F9FC]">
              لم نعثر على مواد مطابقة للبحث
            </h3>
            <p className="text-xs text-[#536681] dark:text-[#94A3B8] max-w-sm mx-auto">
              جرب البحث بكلمة تانية أو مسح الفلاتر لعرض كافة المقررات المتاحة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("ALL");
            }}
            className="h-10 px-5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            عرض كل المواد
          </button>
        </div>
      )}
    </div>
  );
}
