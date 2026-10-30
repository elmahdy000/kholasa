"use client";

import { useState, useMemo } from "react";
import {
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  CheckCircle2,
  FileText,
  Plus,
} from "lucide-react";
import {
  Question,
  Subject,
  Grade,
  QuestionBankManagerClientProps,
} from "./questions/types";
import { QuestionFilterBar } from "./questions/QuestionFilterBar";
import { QuestionRow } from "./questions/QuestionRow";
import { QuestionDrawer } from "./questions/QuestionDrawer";
import { QuestionImportWizardModal } from "./questions/QuestionImportWizardModal";
import { QuestionBulkActionsBar } from "./questions/QuestionBulkActionsBar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export type {
  Question,
  Subject,
  Grade,
  QuestionBankManagerClientProps,
} from "./questions/types";

export function QuestionBankManagerClient({
  initialQuestions,
  subjects,
  grades = [],
  openCreate = false,
  initialSubjectId,
}: QuestionBankManagerClientProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [importCommitted, setImportCommitted] = useState(false);

  // Multi-selection state for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Accordion Expand/Collapse state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Confirmation dialog state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: async () => {},
  });

  // Grade & School Category Primary Hierarchy Filters
  const [selectedGradeCode, setSelectedGradeCode] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.some((subject) => subject.id === initialSubjectId) ? initialSubjectId! : "all"
  );
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Drawers state
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [wizardInitialType, setWizardInitialType] = useState<"ALL" | "MCQ" | "TRUE_FALSE" | "ESSAY">("ALL");

  const openImportWizardWithType = (type: "ALL" | "MCQ" | "TRUE_FALSE" | "ESSAY" = "ALL") => {
    setWizardInitialType(type);
    setIsImportWizardOpen(true);
  };

  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    question?: Question | null;
  }>({
    isOpen: openCreate,
    mode: "create",
    question: null,
  });

  // Helper to determine subject school category
  const getSubjectCategory = (subjectId: string): "ARABIC" | "LANGUAGES" => {
    const s = subjects.find((sub) => sub.id === subjectId);
    return s?.schoolCategory === "LANGUAGES" ? "LANGUAGES" : "ARABIC";
  };

  // Toggle selection of a single question
  const handleToggleSelect = (qId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Toggle expand for a single question
  const handleToggleExpand = (qId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  // Toggle Expand All visible questions
  const handleToggleExpandAll = () => {
    if (expandedIds.size === paginatedQuestions.length && paginatedQuestions.length > 0) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(paginatedQuestions.map((q) => q.id)));
    }
  };

  // Delete Single Question
  const handleDeleteQuestion = (qId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف السؤال من بنك الأسئلة",
      description: "هل أنت متأكد من حذف هذا السؤال نهائياً من بنك الأسئلة؟ لا يمكن التراجع عن هذا الإجراء.",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/questions/${qId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setQuestions((prev) => prev.filter((q) => q.id !== qId));
          setSelectedIds((prev) => {
            if (prev.has(qId)) {
              const next = new Set(prev);
              next.delete(qId);
              return next;
            }
            return prev;
          });
          setExpandedIds((prev) => {
            const next = new Set(prev);
            next.delete(qId);
            return next;
          });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } else {
          throw new Error("تعذر حذف السؤال");
        }
      },
    });
  };

  const handleQuestionSaved = (savedQuestion: Question) => {
    setQuestions((prev) => {
      const exists = prev.some((q) => q.id === savedQuestion.id);
      if (exists) {
        return prev.map((q) => (q.id === savedQuestion.id ? savedQuestion : q));
      }
      return [savedQuestion, ...prev];
    });
  };

  // Filter available subjects based on active grade & category selection
  const availableSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (selectedGradeCode !== "all") {
        const grade = grades?.find((g) => g.code === selectedGradeCode);
        if (grade && s.gradeId !== grade.id) return false;
      }
      if (selectedCategory !== "all") {
        if (s.schoolCategory !== selectedCategory) return false;
      }
      return true;
    });
  }, [subjects, grades, selectedGradeCode, selectedCategory]);

  // Filter questions based on criteria
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedGradeCode !== "all") {
        const grade = grades?.find((g) => g.code === selectedGradeCode);
        if (grade && q.subject?.gradeId !== grade.id) return false;
      }
      if (selectedCategory !== "all") {
        const effectiveCategory =
          q.schoolCategory || q.subject?.schoolCategory || getSubjectCategory(q.subject.id);
        if (effectiveCategory !== selectedCategory) return false;
      }
      if (selectedSubjectId !== "all" && q.subject.id !== selectedSubjectId)
        return false;
      if (selectedType !== "all" && q.type !== selectedType) return false;
      if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty)
        return false;
      if (searchQuery.trim()) {
        const qText = searchQuery.toLowerCase();
        const matchStatement = q.statement.toLowerCase().includes(qText);
        const matchConcept = q.explanation?.concept?.toLowerCase().includes(qText);
        const matchReason = q.explanation?.correctReason?.toLowerCase().includes(qText);
        if (!matchStatement && !matchConcept && !matchReason) return false;
      }
      return true;
    });
  }, [
    questions,
    selectedGradeCode,
    selectedCategory,
    selectedSubjectId,
    selectedType,
    selectedDifficulty,
    searchQuery,
    grades,
  ]);

  // Reset page when filters change
  const totalFilteredCount = filteredQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Paginated Slice
  const paginatedQuestions = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, safeCurrentPage, pageSize]);

  // Global Metric Breakdown
  const metrics = useMemo(() => {
    let mcq = 0;
    let tf = 0;
    let essay = 0;
    let arabic = 0;
    let languages = 0;

    questions.forEach((q) => {
      if (q.type === "MCQ") mcq++;
      else if (q.type === "TRUE_FALSE") tf++;
      else if (q.type === "ESSAY") essay++;

      const cat = q.schoolCategory || q.subject?.schoolCategory;
      if (cat === "LANGUAGES") languages++;
      else arabic++;
    });

    return { mcq, tf, essay, arabic, languages, total: questions.length };
  }, [questions]);

  // Check if all visible paginated questions are currently selected
  const isAllSelected =
    paginatedQuestions.length > 0 &&
    paginatedQuestions.every((q) => selectedIds.has(q.id));

  // Toggle select all visible paginated questions
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedQuestions.forEach((q) => next.delete(q.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedQuestions.forEach((q) => next.add(q.id));
        return next;
      });
    }
  };

  // Bulk Delete Selected Questions
  const handleBulkDelete = () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    const count = idsToDelete.length;
    setConfirmModal({
      isOpen: true,
      title: "حذف الأسئلة المحددة",
      description: `هل أنت متأكد من حذف ${count} ${count === 1 ? "سؤال محدد" : "أسئلة محددة"} نهائياً من بنك الأسئلة؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: async () => {
        setIsBulkDeleting(true);
        try {
          const res = await fetch("/api/admin/questions/bulk", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: idsToDelete }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "تعذر حذف الأسئلة المحددة");
          }

          const deletedSet = new Set(idsToDelete);
          setQuestions((prev) => prev.filter((q) => !deletedSet.has(q.id)));
          setSelectedIds(new Set());
          setExpandedIds((prev) => {
            const next = new Set(prev);
            idsToDelete.forEach((id) => next.delete(id));
            return next;
          });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: unknown) {
          console.error("Bulk delete questions failed:", err);
          throw err;
        } finally {
          setIsBulkDeleting(false);
        }
      },
    });
  };

  return (
    <div className="space-y-5 font-sans text-right">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
            إجمالي بنك الأسئلة
          </span>
          <span className="text-[22px] font-bold text-[#0F172A] dark:text-white mt-0.5 block">
            {metrics.total}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
            اختيار من متعدد (MCQ)
          </span>
          <span className="text-[22px] font-bold text-[#0F172A] dark:text-white mt-0.5 block">
            {metrics.mcq}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
            صح أو خطأ (T/F)
          </span>
          <span className="text-[22px] font-bold text-[#0F172A] dark:text-white mt-0.5 block">
            {metrics.tf}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
            أسئلة مقالية (Essay)
          </span>
          <span className="text-[22px] font-bold text-[#0F172A] dark:text-white mt-0.5 block">
            {metrics.essay}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex items-center justify-between sm:block">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
            توزيع المدارس
          </span>
          <div className="flex items-center gap-2 mt-0.5 text-[13px] font-bold">
            <span className="text-[#0F172A] dark:text-white">{metrics.arabic} عربي</span>
            <span className="text-[#CBD5E1] dark:text-[#475569]">/</span>
            <span className="text-blue-600 dark:text-blue-400">{metrics.languages} لغات</span>
          </div>
        </div>
      </div>

      {/* Question Category Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <button
          type="button"
          onClick={() => {
            setSelectedType("all");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
            selectedType === "all"
              ? "bg-[#800020] text-white shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <span>جميع الأسئلة</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] ${
              selectedType === "all"
                ? "bg-white/20 text-white"
                : "bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B]"
            }`}
          >
            {metrics.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedType("MCQ");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
            selectedType === "MCQ"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          <span>🎯 اختيار من متعدد</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] ${
              selectedType === "MCQ"
                ? "bg-white/20 text-white"
                : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
            }`}
          >
            {metrics.mcq}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedType("TRUE_FALSE");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
            selectedType === "TRUE_FALSE"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-purple-600 dark:hover:text-purple-400"
          }`}
        >
          <span>⚖️ صواب وخطأ</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] ${
              selectedType === "TRUE_FALSE"
                ? "bg-white/20 text-white"
                : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
            }`}
          >
            {metrics.tf}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedType("ESSAY");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
            selectedType === "ESSAY"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-amber-600 dark:hover:text-amber-400"
          }`}
        >
          <span>📝 أسئلة مقالية</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] ${
              selectedType === "ESSAY"
                ? "bg-white/20 text-white"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
            }`}
          >
            {metrics.essay}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <QuestionFilterBar
        selectedGradeCode={selectedGradeCode}
        setSelectedGradeCode={(v) => {
          setSelectedGradeCode(v);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={(v) => {
          setSelectedCategory(v);
          setCurrentPage(1);
        }}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={(v) => {
          setSelectedSubjectId(v);
          setCurrentPage(1);
        }}
        selectedType={selectedType}
        setSelectedType={(v) => {
          setSelectedType(v);
          setCurrentPage(1);
        }}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={(v) => {
          setSelectedDifficulty(v);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        setSearchQuery={(v) => {
          setSearchQuery(v);
          setCurrentPage(1);
        }}
        availableSubjects={availableSubjects}
        totalQuestions={questions.length}
        filteredCount={filteredQuestions.length}
        onOpenCreate={() =>
          setDrawerState({ isOpen: true, mode: "create", question: null })
        }
        onOpenImport={openImportWizardWithType}
      />

      {/* Control Strip: Bulk Selection & Expand All */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right">
        <QuestionBulkActionsBar
          totalCount={paginatedQuestions.length}
          selectedCount={selectedIds.size}
          isAllSelected={isAllSelected}
          onToggleSelectAll={handleToggleSelectAll}
          onClearSelection={handleClearSelection}
          onDeleteSelected={handleBulkDelete}
          isDeleting={isBulkDeleting}
        />

        {paginatedQuestions.length > 0 && (
          <button
            type="button"
            onClick={handleToggleExpandAll}
            className="text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {expandedIds.size === paginatedQuestions.length ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>طي جميع الأسئلة المعروضة</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>توسيع جميع الأسئلة المعروضة</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Question List: High Density Compact Rows */}
      <div className="space-y-2">
        {paginatedQuestions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] text-[#94A3B8] flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#0F172A] dark:text-white">
              لا توجد أسئلة تطابق معايير التصفية المحددة
            </h4>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
              جرب تغيير كلمات البحث أو اختيار مادة أو مرحلة دراسية مختلفة، أو أضف سؤالاً جديداً لبنك الأسئلة.
            </p>
          </div>
        ) : (
          paginatedQuestions.map((q, idx) => {
            // Sequential Continuous Question Numbering: (currentPage - 1) * pageSize + idx + 1
            const globalIndex = (safeCurrentPage - 1) * pageSize + idx + 1;
            return (
              <QuestionRow
                key={q.id}
                question={q}
                index={globalIndex}
                isSelected={selectedIds.has(q.id)}
                onToggleSelect={() => handleToggleSelect(q.id)}
                isExpanded={expandedIds.has(q.id)}
                onToggleExpand={() => handleToggleExpand(q.id)}
                getSubjectCategory={getSubjectCategory}
                onEdit={(question) =>
                  setDrawerState({ isOpen: true, mode: "edit", question })
                }
                onDelete={handleDeleteQuestion}
              />
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalFilteredCount > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
            <span>
              عرض{" "}
              <strong className="text-[#0F172A] dark:text-white">
                {(safeCurrentPage - 1) * pageSize + 1}
              </strong>{" "}
              -{" "}
              <strong className="text-[#0F172A] dark:text-white">
                {Math.min(safeCurrentPage * pageSize, totalFilteredCount)}
              </strong>{" "}
              من إجمالي{" "}
              <strong className="text-[#0F172A] dark:text-white">
                {totalFilteredCount}
              </strong>{" "}
              سؤال
            </span>

            <div className="flex items-center gap-1.5">
              <span>لكل صفحة:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[12px] font-bold text-[#0F172A] dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Navigation Page Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#64748B] disabled:opacity-40 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer"
              title="الصفحة الأولى"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-1 text-[12px] font-bold text-[#64748B] disabled:opacity-40 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <span className="px-3 text-[12px] font-bold text-[#0F172A] dark:text-white">
              {safeCurrentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-1 text-[12px] font-bold text-[#64748B] disabled:opacity-40 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#64748B] disabled:opacity-40 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer"
              title="الصفحة الأخيرة"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Side Drawer for Add / Edit Question */}
      <QuestionDrawer
        isOpen={drawerState.isOpen}
        mode={drawerState.mode}
        editingQuestion={drawerState.question}
        subjects={subjects}
        grades={grades}
        onClose={() =>
          setDrawerState({ isOpen: false, mode: "create", question: null })
        }
        onSuccess={handleQuestionSaved}
      />

      {/* Dedicated 4-Step Import Wizard Modal */}
      <QuestionImportWizardModal
        isOpen={isImportWizardOpen}
        initialType={wizardInitialType}
        onClose={() => {
          setIsImportWizardOpen(false);
          if (importCommitted) {
            setImportCommitted(false);
            window.location.reload();
          }
        }}
        subjects={subjects}
        grades={grades}
        initialSubjectId={selectedSubjectId !== "all" ? selectedSubjectId : undefined}
        onSuccess={() => setImportCommitted(true)}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        open={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        confirmText="تأكيد الحذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
}
