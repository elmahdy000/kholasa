"use client";

import { useState, useRef } from "react";
import {
  CheckCircle2,
  Plus,
  Trash2,
  FileText,
  Upload,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

interface LessonContentTabProps {
  objectives: string[];
  newObjective: string;
  setNewObjective: (v: string) => void;
  onAddObjective: () => void;
  onRemoveObjective: (idx: number) => void;
  bodyText: string;
  setBodyText: (v: string) => void;
  contentPdfUrl: string;
  setContentPdfUrl: (v: string) => void;
  uploadingMedia: "video" | "audio" | "mindmap" | "summary_pdf" | "summary_image" | "content_pdf" | null;
  onUploadMedia: (file: File, target: "summary_pdf" | "summary_image" | "content_pdf") => void;
}

export function LessonContentTab({
  objectives,
  newObjective,
  setNewObjective,
  onAddObjective,
  onRemoveObjective,
  bodyText,
  setBodyText,
  contentPdfUrl,
  setContentPdfUrl,
  uploadingMedia,
  onUploadMedia,
}: LessonContentTabProps) {
  const contentPdfInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Lesson Material PDF Document Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#0F172A] dark:text-white">
            <FileText className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
            <span>ملزمة ومذكرة شرح الدرس الرسمية (ملف PDF)</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={contentPdfInputRef}
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  onUploadMedia(e.target.files[0], "content_pdf");
                }
              }}
            />
            <button
              type="button"
              onClick={() => contentPdfInputRef.current?.click()}
              disabled={uploadingMedia === "content_pdf"}
              className="h-8 px-3 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {uploadingMedia === "content_pdf" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploadingMedia === "content_pdf" ? "جارٍ الرفع..." : "رفع ملف PDF"}</span>
            </button>
            <span className="text-[11px] font-bold text-[#800020] bg-[#800020]/10 px-2 py-1 rounded-md">
              مذكرة الشرح
            </span>
          </div>
        </div>

        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
          الملزمة الشاملة التي تظهر للطالب لتحميلها أو قراءتها مباشرة داخل صفحة الشرح
        </p>

        <div className="flex items-center gap-2">
          <input
            type="url"
            value={contentPdfUrl}
            onChange={(e) => setContentPdfUrl(e.target.value)}
            placeholder="أدخل رابط PDF مباشر أو استخدم زر الرفع أعلاه"
            className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            dir="ltr"
          />

          {contentPdfUrl && (
            <>
              <button
                type="button"
                onClick={() => setIsPreviewPdfOpen((prev) => !prev)}
                className="h-11 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {isPreviewPdfOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isPreviewPdfOpen ? "إخفاء" : "معاينة"}</span>
              </button>

              <a
                href={contentPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح</span>
              </a>

              <button
                type="button"
                onClick={() => setContentPdfUrl("")}
                className="h-11 px-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                title="حذف الرابط"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {contentPdfUrl && isPreviewPdfOpen && (
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
            <div className="w-full h-80 rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-slate-900">
              <iframe
                src={`${contentPdfUrl}#toolbar=1&navpanes=0`}
                title="معاينة مذكرة الشرح"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Objectives */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#800020]" />
            <span>الأهداف التعليمية ومخرجات التعلم ({objectives.length})</span>
          </label>
          <span className="text-[13px] text-[#94A3B8]">
            تظهر أعلى الدرس للطالب
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            placeholder="مثال: التمييز بين الانقسام الميتوزي والميوزي بدقة"
            className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddObjective();
              }
            }}
          />
          <button
            type="button"
            onClick={onAddObjective}
            disabled={!newObjective.trim()}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة هدف</span>
          </button>
        </div>

        {objectives.length > 0 && (
          <ul className="space-y-2 pt-2">
            {objectives.map((obj, i) => (
              <li
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3 text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-lg bg-[#800020]/10 text-[#800020] text-[13px] flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span>{obj}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveObjective(i)}
                  className="text-[#DC2626] hover:text-[#B91C1C] p-1 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Body Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            الشرح التفصيلي للدرس (Body Text)
          </label>
          <span className="text-[13px] text-[#94A3B8]">
            يدعم الترويسات (## عنوان رئيسي، ### عنوان فرعي، * قائمة)
          </span>
        </div>

        <textarea
          rows={14}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="اكتب أو الصق شرح الدرس هنا..."
          className="w-full p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm font-sans leading-relaxed text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
        />
      </div>
    </div>
  );
}
