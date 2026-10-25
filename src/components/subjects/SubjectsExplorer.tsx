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

export function SubjectsExplorer({ subjects }: SubjectsExplorerProps) {
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

  return (
    <div className="space-y-8">
      {/* Search Bar & Filters */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المادة، الوحدة، أو الموضوع..."
              className="w-full h-11 pr-10 pl-10 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#12263F] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800020] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#12263F] dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Result Counter Pill */}
          <div className="shrink-0 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#F7F8FA] dark:bg-[#0F172A] px-3.5 py-2.5 rounded-xl border border-[#E8E9ED] dark:border-[#334155] text-center">
            عرض {filteredSubjects.length} من {subjects.length} مادة
          </div>
        </div>

        {/* Filter Pills */}
        {filterTabs.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[#E8E9ED]/60 dark:border-[#334155]/60">
            {filterTabs.map((tab) => {
              const isSelected = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#800020] text-white shadow-xs"
                      : "bg-[#F7F8FA] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] border border-[#E8E9ED] dark:border-[#334155] hover:text-[#12263F] dark:hover:text-white"
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
                className="group p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#FB7185]/40 transition-all flex flex-col justify-between space-y-6 shadow-xs hover:shadow-sm"
              >
                <div className="space-y-4">
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: subj.color || "#800020" }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#F7F8FA] dark:bg-[#0F172A] px-2.5 py-1 rounded-lg border border-[#E8E9ED] dark:border-[#334155]">
                      {badgeLabel}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#12263F] dark:text-white group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors leading-snug">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed line-clamp-2 font-normal">
                      {subj.description ||
                        "شرح كامل لوحدات المنهج، كبسولة الزتونة المركزة، وبنك أسئلة متدرج."}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155]">
                      <Layers className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
                      <span>{subj.unitsCount} وحدات وفصول</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155]">
                      <BookmarkCheck className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>{subj.lessonsCount} درس وكبسولة</span>
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-[#E8E9ED] dark:border-[#334155] flex items-center justify-between text-xs font-bold text-[#800020] dark:text-[#FB7185]">
                  <span>تصفح المنهج والدروس</span>
                  <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#FB7185]/10 flex items-center justify-center group-hover:bg-[#800020] group-hover:text-white transition-all">
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#12263F] dark:text-white">
              لم نعثر على مواد مطابقة للبحث
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
              جرب البحث بكلمة تانية أو مسح الفلاتر لعرض كافة المقررات المتاحة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("ALL");
            }}
            className="h-9 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold transition-all shadow-xs"
          >
            عرض كل المواد
          </button>
        </div>
      )}
    </div>
  );
}
