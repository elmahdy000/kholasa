"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb,
  WarningCircle,
  XCircle,
  CheckCircle,
  Check,
  FilePdf,
  Images,
  Eye,
  EyeSlash,
  DownloadSimple,
  ArrowSquareOut,
  ArrowsOut,
  ArrowsIn,
  X,
  CaretRight,
  CaretLeft,
  MagnifyingGlassPlus,
} from "@phosphor-icons/react";
import {
  LessonSummary,
  Formula,
  Comparison,
  Mistake,
  ChecklistItem,
} from "../types";

interface LessonSummarySectionProps {
  summary?: LessonSummary | null;
  keyConcepts: string[];
  formulas: Formula[];
  comparisons: Comparison[];
  examTips: string[];
  commonMistakes: Mistake[];
  checklist: ChecklistItem[];
  onToggleChecklistItem: (index: number) => void;
}

export function LessonSummarySection({
  summary,
  keyConcepts,
  formulas,
  comparisons,
  examTips,
  commonMistakes,
  checklist,
  onToggleChecklistItem,
}: LessonSummarySectionProps) {
  // PDF Reader State
  const [isPdfEmbeddedOpen, setIsPdfEmbeddedOpen] = useState(false);
  const [isPdfExpanded, setIsPdfExpanded] = useState(false);

  // Summary Images Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = summary?.images || [];
  const hasImages = images.length > 0;
  const hasPdf = Boolean(summary?.pdfUrl);

  const hasAnyContent = Boolean(
    hasPdf ||
      hasImages ||
      keyConcepts.length > 0 ||
      formulas.length > 0 ||
      comparisons.length > 0 ||
      examTips.length > 0 ||
      commonMistakes.length > 0 ||
      checklist.length > 0
  );

  // Lightbox navigation callbacks
  const handleNextImage = useCallback(() => {
    if (!hasImages || lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % images.length
    );
  }, [hasImages, lightboxIndex, images.length]);

  const handlePrevImage = useCallback(() => {
    if (!hasImages || lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + images.length) % images.length
    );
  }, [hasImages, lightboxIndex, images.length]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Keyboard controls for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseLightbox();
      } else if (e.key === "ArrowLeft") {
        // In Arabic RTL, left arrow goes next or previous depending on direction
        handleNextImage();
      } else if (e.key === "ArrowRight") {
        handlePrevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Lock body scrolling when modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxIndex, handleCloseLightbox, handleNextImage, handlePrevImage]);

  return (
    <div id="section-summary" className="space-y-6">
      {/* Section Header */}
      <div className="p-6 rounded-2xl bg-[#D97706]/10 border border-[#D97706]/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Lightbulb className="w-6 h-6" weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706] bg-[#D97706]/15 px-2 py-0.5 rounded-md">
                كبسولة المراجعة
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                أهم تريكات ونقاط الامتحان
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              كبسولة مركزة للمفاهيم السريعة، المقارنات، والقوانين وتنبيهات الأخطاء الشائعة
            </p>
          </div>
        </div>

        {/* Quick Material Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasPdf && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185] border border-[#800020]/20">
              <FilePdf className="w-4 h-4" weight="fill" />
              <span>ملخص PDF متاح</span>
            </span>
          )}
          {hasImages && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/25">
              <Images className="w-4 h-4" weight="fill" />
              <span>{images.length} بطاقة مصورة</span>
            </span>
          )}
        </div>
      </div>

      {hasAnyContent ? (
        <>
          {/* 1. PDF Summary Document Capsule */}
          {hasPdf && summary?.pdfUrl && (
            <div className="rounded-2xl border border-[#800020]/25 bg-gradient-to-br from-[#800020]/5 via-white dark:via-[#0F172A] to-amber-500/5 dark:bg-[#0F172A] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-md">
                    <FilePdf className="w-6 h-6" weight="fill" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#800020]/15 text-[#800020] dark:text-[#FB7185]">
                        وثيقة PDF الرسمية
                      </span>
                      <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                        ملف ملخص الزتونة للدرس
                      </h3>
                    </div>
                    <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                      ملف شامل معد للطباعة والمراجعة السريعة قبل الامتحانات والاختبارات الدورية
                    </p>
                  </div>
                </div>

                {/* PDF Actions */}
                <div className="flex items-center flex-wrap gap-2 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => setIsPdfEmbeddedOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#800020] hover:bg-[#660019] text-white transition-all shadow-sm active:scale-95"
                  >
                    {isPdfEmbeddedOpen ? (
                      <>
                        <EyeSlash className="w-4 h-4" weight="bold" />
                        <span>إخفاء القارئ</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" weight="bold" />
                        <span>قراءة داخل الصفحة</span>
                      </>
                    )}
                  </button>

                  <a
                    href={summary.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#334155] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155] transition-all"
                  >
                    <ArrowSquareOut className="w-4 h-4" />
                    <span>نافذة جديدة</span>
                  </a>

                  <a
                    href={summary.pdfUrl}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#334155] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155] transition-all"
                  >
                    <DownloadSimple className="w-4 h-4" weight="bold" />
                    <span>تحميل</span>
                  </a>
                </div>
              </div>

              {/* Embedded PDF Viewer */}
              {isPdfEmbeddedOpen && (
                <div className="mt-4 pt-4 border-t border-[#800020]/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    <span>قارئ المستند المباشر</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPdfExpanded((prev) => !prev)}
                        className="inline-flex items-center gap-1 hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors"
                      >
                        {isPdfExpanded ? (
                          <>
                            <ArrowsIn className="w-3.5 h-3.5" />
                            <span>تصغير الارتفاع</span>
                          </>
                        ) : (
                          <>
                            <ArrowsOut className="w-3.5 h-3.5" />
                            <span>توسيع الارتفاع</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div
                    className={`w-full rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-slate-900 transition-all duration-300 ${
                      isPdfExpanded ? "h-[850px]" : "h-[550px]"
                    }`}
                  >
                    <iframe
                      src={`${summary.pdfUrl}#toolbar=1&navpanes=0`}
                      title="ملخص الزتونة PDF"
                      className="w-full h-full border-0"
                    />
                  </div>

                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] text-center">
                    إذا كان جهازك أو متصفحك لا يدعم معاينة PDF التفاعلية، يمكنك الضغط على زر &quot;نافذة جديدة&quot; أو &quot;تحميل&quot; بالشهادة الكاملة.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 2. Visual Summary Cards Gallery */}
          {hasImages && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2">
                  <Images className="w-5 h-5" weight="fill" />
                  <span>كبسولات وبطاقات الزتونة المصورة</span>
                </h3>
                <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  اضغط على أي بطاقة للتكبير بدقة عالية
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative cursor-pointer rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] aspect-[16/10] flex items-center justify-center hover:border-[#D97706]/60 transition-all shadow-sm hover:shadow-md"
                  >
                    <img
                      src={imgUrl}
                      alt={`بطاقة الزتونة رقم ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Card Index Badge */}
                    <span className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      بطاقة {idx + 1}
                    </span>

                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs backdrop-blur-[2px]">
                      <MagnifyingGlassPlus className="w-5 h-5" weight="bold" />
                      <span>تكبير البطاقة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Key Concepts Grid */}
          {keyConcepts.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
              <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2">
                <Lightbulb className="w-4 h-4" weight="fill" />
                <span>أهم المفاهيم الأساسية المستخلصة من الدرس</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {keyConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#D97706]/5 border border-[#D97706]/15 text-[13px] sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-start gap-3 font-content"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#D97706] text-white flex items-center justify-center text-[12px] shrink-0 font-bold">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{concept}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Formulas & Code Snippets */}
          {formulas.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <span className="font-mono text-base font-bold text-[#800020]">#</span>
                <span>القوانين والمعادلات الأساسية</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formulas.map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0F172A] text-white space-y-2 dir-ltr text-left border border-[#334155]"
                  >
                    <span className="text-[12px] font-bold text-[#94A3B8] block uppercase tracking-wider">
                      {formula.title}
                    </span>
                    <code className="text-sm font-mono text-[#059669] block font-semibold">
                      {formula.code}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Comparisons Table */}
          {comparisons.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
              <h3 className="text-sm font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-2">
                <span className="text-base">⇄</span>
                <span>المقارنات الهامة التي تتكرر في الامتحانات</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] sm:text-sm text-right font-content">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-[#334155]">
                      <th className="py-2.5 px-3 font-bold text-[#64748B]">وجه المقارنة</th>
                      <th className="py-2.5 px-3 font-bold text-[#800020] dark:text-[#FB7185]">العنصر الأول</th>
                      <th className="py-2.5 px-3 font-bold text-[#059669]">العنصر الثاني</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((comp, idx) => (
                      <tr key={idx} className="border-b border-[#E2E8F0]/50 dark:border-[#334155]/50 last:border-0">
                        <td className="py-3 px-3 font-bold text-[#0F172A] dark:text-white">{comp.aspect}</td>
                        <td className="py-3 px-3 text-[#64748B] dark:text-[#F8FAFC]">{comp.first}</td>
                        <td className="py-3 px-3 text-[#64748B] dark:text-[#F8FAFC]">{comp.second}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Exam Tips */}
          {examTips.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#D97706]/5 border border-[#D97706]/20 space-y-4">
              <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2">
                <WarningCircle className="w-4 h-4 text-[#D97706]" weight="fill" />
                <span>تنبيهات وتكات امتحانية هامة</span>
              </h3>
              <ul className="space-y-2.5">
                {examTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[13px] sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] font-content">
                    <span className="text-[#D97706] shrink-0 mt-1 font-bold">•</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 7. Common Mistakes */}
          {commonMistakes.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#DC2626]/5 border border-[#DC2626]/20 space-y-4">
              <h3 className="text-sm font-bold text-[#DC2626] flex items-center gap-2">
                <XCircle className="w-4 h-4 text-[#DC2626]" weight="fill" />
                <span>أخطاء شائعة يقع فيها الطلاب في الامتحان</span>
              </h3>
              <div className="space-y-3">
                {commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#DC2626]/15 font-content space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[#DC2626] font-bold text-[13px] shrink-0 mt-0.5">خطأ:</span>
                      <span className="text-[13px] text-[#DC2626] line-through leading-relaxed">{mistake.mistake}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#059669] font-bold text-[13px] shrink-0 mt-0.5">صح:</span>
                      <span className="text-[13px] text-[#059669] font-medium leading-relaxed">{mistake.correction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Interactive Checklist */}
          {checklist.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
              <h3 className="text-sm font-bold text-[#059669] flex items-center gap-2">
                <CheckCircle className="w-4 h-4" weight="bold" />
                <span>قائمة مراجعة إتقان الدرس السريعة</span>
              </h3>
              <div className="space-y-2">
                {checklist.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onToggleChecklistItem(idx)}
                    className={`w-full p-3 rounded-xl border text-right flex items-center gap-3 transition-colors text-[13px] sm:text-sm font-medium font-content ${
                      item.completed
                        ? "bg-[#059669]/10 border-[#059669]/30 text-[#059669]"
                        : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#059669]/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        item.completed
                          ? "bg-[#059669] border-[#059669] text-white"
                          : "border-[#E2E8F0] dark:border-[#334155]"
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5" weight="bold" />}
                    </div>
                    <span className={item.completed ? "line-through opacity-70" : ""}>
                      {item.task}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-[#64748B] rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
          كبسولة الزتونة قيد التجهيز من قبل أستاذ المادة...
        </div>
      )}

      {/* Lightbox Modal for Summary Images */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/90 backdrop-blur-md p-4 sm:p-6"
          onClick={handleCloseLightbox}
        >
          {/* Lightbox Header Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-white/10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold bg-white/15 px-3 py-1 rounded-lg">
                بطاقة {lightboxIndex + 1} من {images.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={images[lightboxIndex]}
                download={`al-zaytouna-card-${lightboxIndex + 1}`}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="تحميل الصورة"
                onClick={(e) => e.stopPropagation()}
              >
                <DownloadSimple className="w-5 h-5" weight="bold" />
              </a>
              <a
                href={images[lightboxIndex]}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="فتح في نافذة كاملة"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowSquareOut className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={handleCloseLightbox}
                className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-colors"
                title="إغلاق (Esc)"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image & Navigation */}
          <div
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center py-4"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-transform active:scale-90"
                aria-label="البطاقة السابقة"
              >
                <CaretRight className="w-6 h-6" weight="bold" />
              </button>
            )}

            <img
              src={images[lightboxIndex]}
              alt={`بطاقة الزتونة ${lightboxIndex + 1}`}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10 select-none"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-transform active:scale-90"
                aria-label="البطاقة التالية"
              >
                <CaretLeft className="w-6 h-6" weight="bold" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Strip */}
          {images.length > 1 && (
            <div
              className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto py-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((thumbUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    idx === lightboxIndex
                      ? "border-[#D97706] scale-105 shadow-md"
                      : "border-white/20 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={`مصغرة ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
