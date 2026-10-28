"use client";

import { Upload, FileText, FileSpreadsheet } from "lucide-react";

interface ImportModeTabsProps {
  activeTab: "file" | "paste";
  setActiveTab: (tab: "file" | "paste") => void;
  fileName: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pastedText: string;
  setPastedText: (text: string) => void;
  onPasteParse: () => void;
}

export function ImportModeTabs({
  activeTab,
  setActiveTab,
  fileName,
  onFileUpload,
  pastedText,
  setPastedText,
  onPasteParse,
}: ImportModeTabsProps) {
  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
        <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
          2. إدخال بيانات الملف:
        </span>
        <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#1E293B] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
              activeTab === "file"
                ? "bg-white dark:bg-[#334155] text-[#800020] "
                : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5 inline ml-2" />
            رفع ملف CSV
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
              activeTab === "paste"
                ? "bg-white dark:bg-[#334155] text-[#800020] "
                : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline ml-2" />
            لصق النص مباشرة
          </button>
        </div>
      </div>

      {activeTab === "file" ? (
        <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020] rounded-xl p-8 text-center transition-colors">
          <input
            type="file"
            id="csv-file-input"
            accept=".csv,text/csv"
            onChange={onFileUpload}
            className="hidden"
          />
          <label
            htmlFor="csv-file-input"
            className="cursor-pointer flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-14 h-14 rounded-xl bg-[#800020]/10 text-[#800020] flex items-center justify-center">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#0F172A] dark:text-white block">
                {fileName ? fileName : "اضغط لاختيار ملف CSV أو اسحبه هنا"}
              </span>
              <span className="text-[13px] text-[#94A3B8] mt-1 block">
                يقبل ملفات CSV بترميز UTF-8 مع فواصل عادية
              </span>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            rows={6}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="الصق أسطر CSV هنا متضمنة الرأس (Header)..."
            className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
          <button
            type="button"
            onClick={onPasteParse}
            className="h-11 px-4 rounded-xl bg-[#0F172A] text-white text-[13px] font-bold hover:bg-[#334155] transition-colors"
          >
            تحليل النص المعروض
          </button>
        </div>
      )}
    </div>
  );
}
