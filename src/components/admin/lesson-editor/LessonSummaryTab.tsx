"use client";

import { useRef } from "react";
import {
  BookmarkCheck,
  Plus,
  Trash2,
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  ArrowUp,
  ArrowDown,
  Sparkles,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { CommonMistakeItem } from "./types";

interface LessonSummaryTabProps {
  summaryPdfUrl: string;
  setSummaryPdfUrl: (v: string) => void;
  summaryImages: string[];
  newSummaryImageUrl: string;
  setNewSummaryImageUrl: (v: string) => void;
  onAddSummaryImage: () => void;
  onRemoveSummaryImage: (idx: number) => void;
  onMoveSummaryImage: (idx: number, dir: "up" | "down") => void;
  uploadingMedia: "video" | "audio" | "mindmap" | "summary_pdf" | "summary_image" | "content_pdf" | null;
  onUploadMedia: (file: File, target: "summary_pdf" | "summary_image") => void;
  onPreviewImage: (url: string) => void;
  keyConcepts: string[];
  newConcept: string;
  setNewConcept: (v: string) => void;
  onAddKeyConcept: () => void;
  onRemoveKeyConcept: (idx: number) => void;
  examTips: string[];
  newExamTip: string;
  setNewExamTip: (v: string) => void;
  onAddExamTip: () => void;
  onRemoveExamTip: (idx: number) => void;
  commonMistakes: CommonMistakeItem[];
  newMistake: string;
  setNewMistake: (v: string) => void;
  newCorrection: string;
  setNewCorrection: (v: string) => void;
  onAddMistake: () => void;
  onRemoveMistake: (idx: number) => void;
}

export function LessonSummaryTab({
  summaryPdfUrl,
  setSummaryPdfUrl,
  summaryImages,
  newSummaryImageUrl,
  setNewSummaryImageUrl,
  onAddSummaryImage,
  onRemoveSummaryImage,
  onMoveSummaryImage,
  uploadingMedia,
  onUploadMedia,
  onPreviewImage,
  keyConcepts,
  newConcept,
  setNewConcept,
  onAddKeyConcept,
  onRemoveKeyConcept,
  examTips,
  newExamTip,
  setNewExamTip,
  onAddExamTip,
  onRemoveExamTip,
  commonMistakes,
  newMistake,
  setNewMistake,
  newCorrection,
  setNewCorrection,
  onAddMistake,
  onRemoveMistake,
}: LessonSummaryTabProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      {/* 0. Introductory Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#D97706]/20 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-right">
          <h4 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <span>تجهيز ماتريال "الزتونة" للدرس (The Core Summary Capsule)</span>
          </h4>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            يمكنك رفع الزتونة كـ <strong>ملف مستند PDF</strong>، أو كـ <strong>صور وبطاقات تلخيصية عالية الجودة</strong>، أو <strong>كبسولات نصية ومفاهيم سريعة</strong>، أو دمج كل هذه الوسائط معاً لتظهر للطالب بأبهى حلة.
          </p>
        </div>
      </div>

      {/* 1. PDF Capsule Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <div>
            <label className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#DC2626]" />
              <span>مستند كبسولة الزتونة (ملف PDF)</span>
            </label>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              ملف ملخص الدرس المنسق ليتمكن الطالب من قراءته مباشرة داخل المنصة أو تحميله وطباعته
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#059669] bg-[#059669]/10 px-2.5 py-1 rounded-full w-fit">
            يدعم القراءة المدمجة والتحميل
          </span>
        </div>

        {summaryPdfUrl ? (
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-lg bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <span className="text-[13px] font-bold text-[#0F172A] dark:text-white block truncate">
                  {summaryPdfUrl.split("/").pop() || "ملخص_الدرس.pdf"}
                </span>
                <span className="text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8] block truncate" dir="ltr">
                  {summaryPdfUrl}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={summaryPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:bg-[#F8FAFC] text-[12px] font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة PDF</span>
              </a>
              <button
                type="button"
                onClick={() => setSummaryPdfUrl("")}
                className="h-9 px-3 rounded-lg bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إزالة الملف</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="url"
                value={summaryPdfUrl}
                onChange={(e) => setSummaryPdfUrl(e.target.value)}
                placeholder="https://... رابط مباشر لملف PDF أو ارفع من جهازك"
                className="flex-1 h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                dir="ltr"
              />

              <input
                type="file"
                ref={pdfInputRef}
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) onUploadMedia(e.target.files[0], "summary_pdf");
                }}
              />

              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={uploadingMedia === "summary_pdf"}
                className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center justify-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
              >
                {uploadingMedia === "summary_pdf" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{uploadingMedia === "summary_pdf" ? "جاري الرفع..." : "رفع PDF من الجهاز"}</span>
              </button>
            </div>
            <p className="text-[12px] text-[#94A3B8]">
              يقبل ملفات PDF حتى 50 ميجابايت مع الحفاظ على التنسيق والخطوط الأصلية.
            </p>
          </div>
        )}
      </div>

      {/* 2. Summary Images Section (صور وبطاقات الزتونة) */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <div>
            <label className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
              <span>بطاقات وكبسولات الزتونة المصورة ({summaryImages.length})</span>
            </label>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              صور التلخيص، بطاقات المقارنات، أو سلايدات كبسولة الدرس لعرضها في معرض صور تفاعلي سريع
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 px-2.5 py-1 rounded-full w-fit">
            تدعم التكبير والعرض بملء الشاشة
          </span>
        </div>

        {/* Add image row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="url"
            value={newSummaryImageUrl}
            onChange={(e) => setNewSummaryImageUrl(e.target.value)}
            placeholder="https://... رابط مباشر لصورة كبسولة الزتونة أو ارفعها من جهازك"
            className="flex-1 h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            dir="ltr"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddSummaryImage();
              }
            }}
          />
          <button
            type="button"
            onClick={onAddSummaryImage}
            disabled={!newSummaryImageUrl.trim()}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center justify-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة بالرابط</span>
          </button>

          <input
            type="file"
            ref={imagesInputRef}
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) onUploadMedia(e.target.files[0], "summary_image");
            }}
          />

          <button
            type="button"
            onClick={() => imagesInputRef.current?.click()}
            disabled={uploadingMedia === "summary_image"}
            className="h-11 px-4 rounded-xl bg-[#0F172A] hover:bg-black dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#0F172A] text-[13px] font-bold flex items-center justify-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            {uploadingMedia === "summary_image" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploadingMedia === "summary_image" ? "جاري الرفع..." : "رفع صورة من الجهاز"}</span>
          </button>
        </div>

        {/* Gallery Grid of uploaded images */}
        {summaryImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {summaryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden flex flex-col"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-black/5 dark:bg-black/30 flex items-center justify-center">
                  <img
                    src={imgUrl}
                    alt={`بطاقة الزتونة ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPreviewImage(imgUrl)}
                      className="w-8 h-8 rounded-lg bg-white/90 text-[#0F172A] flex items-center justify-center hover:bg-white transition-colors"
                      title="تكبير ومعاينة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#800020] text-white text-[11px] font-bold">
                    بطاقة {idx + 1}
                  </span>
                </div>

                <div className="p-2 flex items-center justify-between bg-white dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-[#334155]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onMoveSummaryImage(idx, "up")}
                      disabled={idx === 0}
                      className="w-7 h-7 rounded-md border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] disabled:opacity-30 cursor-pointer"
                      title="تحريك لليمين"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveSummaryImage(idx, "down")}
                      disabled={idx === summaryImages.length - 1}
                      className="w-7 h-7 rounded-md border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] disabled:opacity-30 cursor-pointer"
                      title="تحريك لليسار"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveSummaryImage(idx)}
                    className="w-7 h-7 rounded-md bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center hover:bg-[#DC2626]/20 transition-colors cursor-pointer"
                    title="حذف البطاقة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-[#94A3B8] italic pt-1">
            لم يتم رفع صور أو بطاقات بعد. يمكنك رفع صورة واحدة أو عدة بطاقات سلايدات لدرس اليوم.
          </p>
        )}
      </div>

      {/* 3. Key Concepts (المفاهيم والنقاط الجوهرية النصية) */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
        <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-[#D97706]" />
          <span>المفاهيم والنقاط الجوهرية النصية (كبسولة الزتونة)</span>
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newConcept}
            onChange={(e) => setNewConcept(e.target.value)}
            placeholder="أضف مفهوماً جوهرياً..."
            className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddKeyConcept();
              }
            }}
          />
          <button
            type="button"
            onClick={onAddKeyConcept}
            disabled={!newConcept.trim()}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>

        {keyConcepts.length > 0 && (
          <div className="space-y-2 pt-1">
            {keyConcepts.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemoveKeyConcept(i)}
                  className="text-[#DC2626] hover:text-[#B91C1C] p-1 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Exam Tips */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
        <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#D97706]" />
          <span>تنبيهات وتكات الامتحان (Exam Tips)</span>
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newExamTip}
            onChange={(e) => setNewExamTip(e.target.value)}
            placeholder="أضف تكة أو ملحوظة امتحانية هامة..."
            className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddExamTip();
              }
            }}
          />
          <button
            type="button"
            onClick={onAddExamTip}
            disabled={!newExamTip.trim()}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>

        {examTips.length > 0 && (
          <div className="space-y-2 pt-1">
            {examTips.map((tip, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                <span>{tip}</span>
                <button
                  type="button"
                  onClick={() => onRemoveExamTip(i)}
                  className="text-[#DC2626] hover:text-[#B91C1C] p-1 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Common Mistakes */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
        <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#DC2626]" />
          <span>أخطاء شائعة يقع فيها الطلاب مع التصحيح النموذجي</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={newMistake}
            onChange={(e) => setNewMistake(e.target.value)}
            placeholder="الخطأ الشائع الذي يقع فيه الطالب..."
            className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
          <input
            type="text"
            value={newCorrection}
            onChange={(e) => setNewCorrection(e.target.value)}
            placeholder="التصويب العلمي الصحيح..."
            className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAddMistake}
            disabled={!newMistake.trim() || !newCorrection.trim()}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خطأ وتصويبه</span>
          </button>
        </div>

        {commonMistakes.length > 0 && (
          <div className="space-y-3 pt-2">
            {commonMistakes.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2 text-[13px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[#DC2626] font-bold line-through">
                      الخطأ: {item.mistake}
                    </p>
                    <p className="text-[#059669] dark:text-[#34D399] font-bold">
                      الصواب: {item.correction}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveMistake(i)}
                    className="text-[#DC2626] hover:text-[#B91C1C] p-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
