"use client";

import { useState, useRef } from "react";
import {
  HardDrive,
  Upload,
  Music,
  Image as ImageIcon,
  FileText,
  Video,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Play,
  Pause,
} from "lucide-react";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
  type: "audio" | "image" | "document" | "video" | "other";
  ext: string;
}

interface MediaManagerClientProps {
  initialFiles: MediaFile[];
}

export function MediaManagerClient({ initialFiles }: MediaManagerClientProps) {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleFileUpload = async (selectedFile: File) => {
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
      if (listData.files) {
        setFiles(listData.files);
      }
    } catch (err: any) {
      alert(err.message || "فشل رفع الملف");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`هل أنت متأكد من حذف الملف "${filename}"؟`)) return;
    try {
      const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFiles((prev) => prev.filter((f) => f.name !== filename));
    } catch (err: any) {
      alert(err.message || "تعذر حذف الملف");
    }
  };

  const toggleAudio = (url: string) => {
    if (playingAudio === url) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingAudio(url);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            <span>مركز رفع الوسائط والملفات</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            رفع وإدارة ملفات الصوت (البودكاست)، الخرائط الذهنية، مستندات PDF التلخيصية، وملفات الامتحانات
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-8.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "جاري الرفع..." : "رفع ملف جديد"}</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone (Vercel Style) */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
        }}
        className="p-8 border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 text-center cursor-pointer transition-colors group"
      >
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          <Upload className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          انقر هنا لرفع ملف أو اسحبه وأفلته مباشرة
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
          يدعم MP3, M4A (صوتيات) · PNG, JPG, WEBP (خرائط وصور) · PDF (ملخصات) · الحد الأقصى 50MB
        </p>
      </div>

      {/* Filter Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "كافة الملفات", count: files.length },
            {
              id: "audio",
              label: "صوتيات وبودكاست",
              count: files.filter((f) => f.type === "audio").length,
            },
            {
              id: "image",
              label: "صور وخرائط ذهنية",
              count: files.filter((f) => f.type === "image").length,
            },
            {
              id: "document",
              label: "مستندات PDF",
              count: files.filter((f) => f.type === "document").length,
            },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                filterType === cat.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] font-mono opacity-60">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الملف..."
            className="w-full h-8 pr-8 pl-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none"
          />
        </div>
      </div>

      {/* Files Grid / List */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 text-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950">
          <HardDrive className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-zinc-500">لا توجد ملفات مرفوعة مطابقة للبحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFiles.map((file) => {
            const isCopied = copiedUrl === file.url;
            const isAudioPlaying = playingAudio === file.url;

            return (
              <div
                key={file.name}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 flex flex-col justify-between space-y-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400">
                      {file.type === "audio" && <Music className="w-5 h-5 text-indigo-500" />}
                      {file.type === "image" && <ImageIcon className="w-5 h-5 text-emerald-500" />}
                      {file.type === "document" && <FileText className="w-5 h-5 text-amber-500" />}
                      {file.type === "video" && <Video className="w-5 h-5 text-rose-500" />}
                      {file.type === "other" && <HardDrive className="w-5 h-5 text-zinc-400" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                        {formatFileSize(file.size)} · {new Date(file.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                    {file.ext.replace(".", "")}
                  </span>
                </div>

                {/* Inline Audio Preview */}
                {file.type === "audio" && (
                  <button
                    onClick={() => toggleAudio(file.url)}
                    className="w-full h-8 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {isAudioPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>إيقاف المعاينة الصوتية</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>تشغيل ومعاينة البودكاست</span>
                      </>
                    )}
                  </button>
                )}

                {/* Inline Image Preview */}
                {file.type === "image" && (
                  <div className="h-28 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-900 relative">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Action Buttons: Copy URL, View, Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900 text-xs">
                  <button
                    onClick={() => handleCopy(file.url)}
                    className="h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      title="فتح في علامة تبويب جديدة"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
