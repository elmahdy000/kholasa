"use client";

import { AlertCircle, Headphones, Mic, Sparkles } from "lucide-react";

interface ArabicListeningBlockProps {
  title: string;
  officialAudioAvailable: boolean;
  textAvailableInProvidedFiles: boolean;
  questionsFromBook: string[];
  answerPolicy: string;
  audioUrl?: string | null;
  transcript?: string | null;
}

export function ArabicListeningActivityBlock({
  title,
  officialAudioAvailable,
  questionsFromBook,
  answerPolicy,
  audioUrl,
  transcript,
}: ArabicListeningBlockProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <h4 className="text-xs sm:text-sm font-black text-[#091B40] dark:text-white flex items-center gap-2">
          <Headphones className="w-4 h-4 text-[#1E40AF] dark:text-[#60A5FA] shrink-0" />
          <span>نشاط الاستماع: {title}</span>
        </h4>
        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
            officialAudioAvailable && audioUrl
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
          }`}
        >
          {officialAudioAvailable && audioUrl ? "الصوت متاح" : "بانتظار المقطع الرسمي"}
        </span>
      </div>

      {officialAudioAvailable && audioUrl ? (
        <audio controls src={audioUrl} className="w-full" />
      ) : (
        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs font-bold text-amber-950 dark:text-amber-200 leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-300" />
          <div>
            <p className="font-black">تنبيه أمانة المصادر:</p>
            <p className="font-medium mt-0.5">
              {answerPolicy ||
                "أسئلة النشاط مأخوذة من كتاب الطالب، بينما المقطع الصوتي الرسمي أو تفريغه غير مرفق حتى الآن؛ لذا لا نختلق إجابات قبل إتاحة النص الرسمي."}
            </p>
          </div>
        </div>
      )}

      {transcript && (
        <div className="p-3 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs leading-relaxed">
          {transcript}
        </div>
      )}

      {questionsFromBook.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-black text-[#091B40] dark:text-white">
            أسئلة الاستماع الواردة في كتاب الوزارة (للاستعداد قبل السماع):
          </p>
          <ol className="space-y-1.5 text-xs sm:text-[13px] font-medium text-[#334155] dark:text-[#E2E8F0] list-decimal pr-5 leading-relaxed">
            {questionsFromBook.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

interface ArabicSpeakingBlockProps {
  title: string;
  sourceScope?: string;
  steps: string[];
  teacherTip?: string;
}

export function ArabicSpeakingActivityBlock({
  title,
  sourceScope,
  steps,
  teacherTip,
}: ArabicSpeakingBlockProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#EFF6FF]/60 dark:bg-[#071737] border border-[#BFDBFE] dark:border-[#1E3A6E] space-y-3">
      <h4 className="text-xs sm:text-sm font-black text-[#1E40AF] dark:text-[#93C5FD] flex items-center gap-2">
        <Mic className="w-4 h-4 shrink-0" />
        <span>نشاط التحدث والمحاكاة: {title}</span>
      </h4>
      {sourceScope && (
        <p className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
          نطاق التنفيذ: {sourceScope}
        </p>
      )}
      {steps.length > 0 && (
        <ol className="space-y-2 text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-white list-decimal pr-5 leading-relaxed">
          {steps.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ol>
      )}
      {teacherTip && (
        <p className="text-xs font-bold text-[#800B34] dark:text-[#E9AD32] flex items-start gap-1.5 pt-1">
          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>توجيه المعلم: {teacherTip}</span>
        </p>
      )}
    </div>
  );
}
