"use client";

import { Target } from "lucide-react";
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

      {/* Learning Objectives */}
      {content?.objectives && content.objectives.length > 0 && (
        <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#800020]" />
            <span>أهداف ومخرجات التعلم</span>
          </h3>
          <ul className="space-y-2">
            {content.objectives.map((obj, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[13px] sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] font-content"
              >
                <div className="w-4 h-4 rounded bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0 mt-1 text-[13px] font-bold">
                  {i + 1}
                </div>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
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
