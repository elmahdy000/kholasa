"use client";

import { useState, useRef } from "react";
import {
  HardDrive,
  Upload,
  Music,
} from "lucide-react";
import { MediaFile, MediaManagerClientProps } from "./media/types";
import { MediaFilterBar } from "./media/MediaFilterBar";
import { MediaCard } from "./media/MediaCard";
import { MediaPreviewModal } from "./media/MediaPreviewModal";
import { PairUploadModal } from "./media/PairUploadModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export type { MediaFile, MediaManagerClientProps } from "./media/types";

export function MediaManagerClient({ initialFiles }: MediaManagerClientProps) {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [showPairUploadModal, setShowPairUploadModal] = useState(false);

  // Confirmation modal state
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).href);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      setError("تعذر نسخ الرابط. تحقق من إذن الحافظة وحاول مرة أخرى.");
    }
  };

  const handleFileUpload = async (selectedFile: File) => {
    if (uploading) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh files list
      const listRes = await fetch("/api/admin/upload");
      const listData = await listRes.json();
      if (!listRes.ok) throw new Error(listData.error || "تم الرفع، لكن تعذر تحديث قائمة الملفات. أعد تحميل الصفحة.");
      if (listData.files) {
        setFiles(listData.files);
      }
    } catch (err: any) {
      setError(err.message || "فشل رفع الملف");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (filename: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف الملف",
      description: `هل أنت متأكد من حذف الملف "${filename}" نهائياً من خادم الوسائط؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: async () => {
        const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(filename)}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر حذف الملف");

        setFiles((prev) => prev.filter((f) => f.name !== filename));
        if (previewFile?.name === filename) {
          setPreviewFile(null);
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const toggleAudio = async (url: string) => {
    if (playingAudio === url) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        try {
          await audioRef.current.play();
          setPlayingAudio(url);
        } catch {
          setPlayingAudio(null);
          setError("تعذر تشغيل الملف الصوتي. تحقق من الملف وحاول مرة أخرى.");
        }
      }
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesFilter = filterType === "all" || file.type === filterType;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hidden Audio Player for In-line previews */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudio(null)}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[#0F172A] dark:text-[#F8FAFC]" />
            <span>مركز رفع الوسائط والملفات</span>
          </h1>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            رفع وإدارة ملفات الصوت (البودكاست)، الخرائط الذهنية، مستندات PDF التلخيصية، وملفات الامتحانات
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.gif,.mp3,.m4a,.aac,.ogg,.wav,.pdf,.docx"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
            className="hidden"
          />

          {/* Primary Paired Uploader Button */}
          <button
            type="button"
            onClick={() => setShowPairUploadModal(true)}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Music className="w-4 h-4 shrink-0" />
            <span>رفع صوت مع صورة (بودكاست)</span>
          </button>

          {/* Single File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/80 text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "جاري الرفع..." : "رفع ملف منفرد"}</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div
        role="button"
        tabIndex={uploading ? -1 : 0}
        aria-disabled={uploading}
        aria-label="رفع ملف"
        onClick={() => !uploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!uploading) fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
        }}
        className={`p-8 border border-dashed rounded-xl text-center cursor-pointer transition-all group ${
          dragActive
            ? "border-[#800020] bg-[#800020] dark:bg-[#1E293B] scale-[1.01]"
            : "border-[#E2E8F0] dark:border-[#334155] hover:border-[#E2E8F0] dark:hover:border-[#E11D48]/60 bg-[#F8FAFC]/50 dark:bg-[#0F172A]/40"
        }`}
      >
        <div className="w-11 h-11 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <Upload className="w-5 h-5 text-[#800020]" />
        </div>
        <h3 className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
          انقر هنا لرفع ملف أو اسحبه وأفلته مباشرة
        </h3>
        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-mono">
          يدعم MP3, M4A, AAC, OGG, WAV (صوتيات) · PNG, JPG, WEBP, GIF (صور) · PDF, DOCX (مستندات) · الحد الأقصى 50MB
        </p>
      </div>

      {/* Filter Tabs and Search */}
      <MediaFilterBar
        files={files}
        filterType={filterType}
        onFilterChange={setFilterType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Files Grid / List */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 text-center border border-[#E2E8F0] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A]">
          <HardDrive className="w-11 h-11 text-[#64748B] mx-auto mb-2 opacity-50" />
          <p className="text-[13px] text-[#64748B]">لا توجد ملفات مرفوعة مطابقة للبحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFiles.map((file) => (
            <MediaCard
              key={file.name}
              file={file}
              isCopied={copiedUrl === file.url}
              isPlayingAudio={playingAudio === file.url}
              onPreview={setPreviewFile}
              onToggleAudio={toggleAudio}
              onCopyUrl={handleCopy}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Full Rich File Preview Modal */}
      <MediaPreviewModal
        previewFile={previewFile}
        onClose={() => setPreviewFile(null)}
        onCopyUrl={handleCopy}
        isCopied={copiedUrl === previewFile?.url}
      />

      {/* Paired Audio & Cover Image Upload Modal */}
      <PairUploadModal
        isOpen={showPairUploadModal}
        onClose={() => setShowPairUploadModal(false)}
        onUploadSuccess={(newFiles) => setFiles(newFiles)}
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
