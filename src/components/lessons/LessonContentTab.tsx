"use client";

import { useState } from "react";
import { Target, FileText, Eye, EyeOff, Download, ExternalLink } from "lucide-react";
import { LessonContent } from "./types";

interface LessonContentTabProps {
  content?: LessonContent | null;
  lessonTitle: string;
  embedUrl: string | null;
}

export function LessonContentTab({
  content,
  lessonTitle,
  embedUrl,
}: LessonContentTabProps) {
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  return (
    <div className="space-y-6">
      {/* Video Embed */}
      {content?.videoUrl && embedUrl && (
        <div className="rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-black aspect-video">
          <iframe
            src={embedUrl}
            title={lessonTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Friendly Learning Points */}
      {content?.objectives && content.objectives.length > 0 && (
        <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#800020]" />
              <span>هتتعلم إيه في الدرس دا؟</span>
            </h3>
            <p className="text-[12px] sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
              أهم النقاط والأفكار الأساسية اللي هتفهمها وتركز عليها النهاردة:
            </p>
          </div>
          <ul className="space-y-2">
            {content.objectives.map((obj, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[13px] sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] font-content"
              >
                <div className="w-5 h-5 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0 mt-0.5 text-[12px] font-bold">
                  {i + 1}
                </div>
                <span className="leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lesson Material PDF File */}
      {content?.pdfUrl && (
        <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#800020]/25 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#800020]/15 text-[#800020] dark:text-[#FB7185]">
                  مذكرة الشرح الرسمية
                </span>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white mt-1">
                  مذكرة وملزمة الدرس (PDF)
                </h3>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  شرح مبسط ومرتب مع أهم الأمثلة التوضيحية لدرس اليوم، تقدر تقرأها مباشرة أو تنزلها
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsPdfOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#800020] hover:bg-[#660019] text-white transition-all shadow-sm"
              >
                {isPdfOpen ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>إغلاق القارئ</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>معاينة وقراءة</span>
                  </>
                )}
              </button>

              <a
                href={content.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#334155] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155] transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>نافذة كاملة</span>
              </a>

              <a
                href={content.pdfUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#334155] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155] transition-all"
              >
                <Download className="w-4 h-4" />
                <span>تحميل</span>
              </a>
            </div>
          </div>

          {isPdfOpen && (
            <div className="pt-4 border-t border-[#800020]/20 space-y-2">
              <div className="w-full h-[600px] rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-slate-900">
                <iframe
                  src={`${content.pdfUrl}#toolbar=1&navpanes=0`}
                  title="مذكرة الدرس PDF"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Structured Rich Body */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
        <div className="prose dark:prose-invert max-w-none text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-content space-y-4">
          {content?.body ? (
            content.body.split("\n").map((paragraph, index) => {
              if (paragraph.startsWith("## ")) {
                return (
                  <h2
                    key={index}
                    className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white pt-4 pb-2 border-b border-[#E2E8F0] dark:border-[#334155]"
                  >
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("### ")) {
                return (
                  <h3
                    key={index}
                    className="text-base sm:text-lg font-bold text-[#800020] pt-2"
                  >
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("* ") || paragraph.startsWith("- ")) {
                const items = paragraph.split("\n");
                return (
                  <ul key={index} className="space-y-2 list-disc pr-5">
                    {items.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="text-[13px] sm:text-sm leading-relaxed"
                      >
                        {item.replace(/^[*|-]\s+/, "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (
                paragraph.startsWith("```") ||
                paragraph.includes("cout") ||
                paragraph.includes("int ")
              ) {
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-[#0F172A] text-[#059669] font-mono text-[13px] sm:text-sm overflow-x-auto dir-ltr text-left"
                  >
                    <pre>{paragraph.replace(/```[a-z]*/g, "")}</pre>
                  </div>
                );
              }
              return (
                <p key={index} className="text-[13px] sm:text-sm leading-relaxed">
                  {paragraph}
                </p>
              );
            })
          ) : (
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              محتوى الدرس قيد التحديث...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
