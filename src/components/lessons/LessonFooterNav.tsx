"use client";

import Link from "next/link";
import { CaretRight, CaretLeft, ArrowLeft } from "@phosphor-icons/react";

interface SiblingLesson {
  id: string;
  title: string;
  order: number;
}

interface LessonFooterNavProps {
  prevLesson: SiblingLesson | null;
  nextLesson: SiblingLesson | null;
  subjectId: string;
}

export function LessonFooterNav({
  prevLesson,
  nextLesson,
  subjectId,
}: LessonFooterNavProps) {
  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4 mt-8">
      {prevLesson ? (
        <Link
          href={`/lessons/${prevLesson.id}`}
          className="flex items-center gap-2 text-[13px] sm:text-sm font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#800020] transition-colors"
        >
          <CaretRight className="w-4 h-4 shrink-0" weight="bold" />
          <div className="text-right">
            <span className="block text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              الدرس السابق
            </span>
            <span className="block break-words max-w-xs leading-snug">
              <bdi>{prevLesson.title}</bdi>
            </span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextLesson ? (
        <Link
          href={`/lessons/${nextLesson.id}`}
          className="flex items-center gap-2 text-[13px] sm:text-sm font-bold text-[#800020] hover:text-[#66001A] transition-colors"
        >
          <div className="text-left">
            <span className="block text-[13px] text-[#800020]/70">
              الدرس التالي
            </span>
            <span className="block break-words max-w-xs leading-snug">
              <bdi>{nextLesson.title}</bdi>
            </span>
          </div>
          <CaretLeft className="w-4 h-4 shrink-0" weight="bold" />
        </Link>
      ) : (
        <Link
          href={`/subjects/${subjectId}`}
          className="h-11 px-4 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-colors"
        >
          <span>تم إنهاء الوحدة! عودة للمادة</span>
          <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
        </Link>
      )}
    </div>
  );
}
