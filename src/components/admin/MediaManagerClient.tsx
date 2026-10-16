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
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  FileCheck,
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
  const [dragActive, setDragActive] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [imageZoom, setImageZoom] = useState<number>(1);
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
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
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
      if (previewFile?.name === filename) {
        setPreviewFile(null);
      }
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

  const openPreview = (file: MediaFile) => {
    setImageZoom(1);
    setPreviewFile(file);
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

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
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
            ? "border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/30 scale-[1.01]"
            : "border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/40"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          <Upload className="w-5 h-5 text-indigo-500" />
        </div>
        <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          انقر هنا لرفع ملف أو اسحبه وأفلته مباشرة
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
          يدعم MP3, M4A, WAV (صوتيات) · PNG, JPG, WEBP, SVG (خرائط وصور) · PDF (ملخصات) · MP4, WebM (فيديو) · الحد الأقصى 50MB
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
            {
              id: "video",
              label: "فيديوهات",
              count: files.filter((f) => f.type === "video").length,
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
                  <div
                    onClick={() => openPreview(file)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group/title"
                  >
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400 group-hover/title:border-indigo-500 transition-colors">
                      {file.type === "audio" && <Music className="w-5 h-5 text-indigo-500" />}
                      {file.type === "image" && <ImageIcon className="w-5 h-5 text-emerald-500" />}
                      {file.type === "document" && <FileText className="w-5 h-5 text-amber-500" />}
                      {file.type === "video" && <Video className="w-5 h-5 text-rose-500" />}
                      {file.type === "other" && <HardDrive className="w-5 h-5 text-zinc-400" />}
                    </div>
                    <div className="min-w-0">
                      <span
                        className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors"
                        title={file.name}
                      >
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

                {/* Inline Image Preview Thumbnail */}
                {file.type === "image" && (
                  <div
                    onClick={() => openPreview(file)}
                    className="h-28 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-900 relative cursor-pointer group/img"
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>معاينة مكبرة</span>
                    </div>
                  </div>
                )}

                {/* Video Indicator */}
                {file.type === "video" && (
                  <div
                    onClick={() => openPreview(file)}
                    className="h-24 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 flex items-center justify-center cursor-pointer group/vid relative"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 group-hover/vid:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all">
                      <Play className="w-5 h-5 fill-current mr-0.5" />
                    </div>
                    <span className="absolute bottom-2 right-2 text-[10px] font-mono text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded">
                      فيديو MP4
                    </span>
                  </div>
                )}

                {/* PDF Document Indicator */}
                {file.type === "document" && (
                  <button
                    onClick={() => openPreview(file)}
                    className="w-full h-8 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة المستند (PDF Viewer)</span>
                  </button>
                )}

                {/* Action Buttons: Preview, Copy URL, Download, Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openPreview(file)}
                      className="h-7 px-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[11px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="معاينة كاملة"
                    >
                      <Eye className="w-3 h-3 text-indigo-500" />
                      <span>معاينة</span>
                    </button>

                    <button
                      onClick={() => handleCopy(file.url)}
                      className="h-7 px-2 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-bold">تم!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={file.url}
                      download={file.name}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      title="تنزيل الملف"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      title="فتح في علامة تبويب جديدة"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
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

      {/* FULL RICH FILE PREVIEW MODAL */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          dir="rtl"
          onClick={() => setPreviewFile(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-4 px-5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  {previewFile.type === "audio" && <Music className="w-5 h-5 text-indigo-500" />}
                  {previewFile.type === "image" && <ImageIcon className="w-5 h-5 text-emerald-500" />}
                  {previewFile.type === "document" && <FileText className="w-5 h-5 text-amber-500" />}
                  {previewFile.type === "video" && <Video className="w-5 h-5 text-rose-500" />}
                  {previewFile.type === "other" && <HardDrive className="w-5 h-5 text-zinc-400" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate" title={previewFile.name}>
                    {previewFile.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                    <span>{formatFileSize(previewFile.size)}</span>
                    <span>•</span>
                    <span>{new Date(previewFile.createdAt).toLocaleDateString("ar-EG")}</span>
                    <span className="uppercase px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px]">
                      {previewFile.ext.replace(".", "")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Close */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(previewFile.url)}
                  className="h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                  title="نسخ الرابط المباشر"
                >
                  {copiedUrl === previewFile.url ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">نسخ الرابط</span>
                    </>
                  )}
                </button>

                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  className="h-8 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تنزيل</span>
                </a>

                <button
                  onClick={() => setPreviewFile(null)}
                  className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center min-h-[350px]">
              {/* IMAGE PREVIEW */}
              {previewFile.type === "image" && (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 px-2 shadow-xs">
                    <button
                      onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      title="تصغير"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono px-2 text-zinc-600 dark:text-zinc-300">
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <button
                      onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      title="تكبير"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setImageZoom(1)}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      title="إعادة ضبط"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="overflow-auto max-w-full max-h-[65vh] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2">
                    <img
                      src={previewFile.url}
                      alt={previewFile.name}
                      style={{ transform: `scale(${imageZoom})`, transformOrigin: "center center" }}
                      className="max-h-[60vh] max-w-full object-contain mx-auto transition-transform duration-150"
                    />
                  </div>
                </div>
              )}

              {/* PDF / DOCUMENT PREVIEW */}
              {previewFile.type === "document" && (
                <div className="w-full h-full flex flex-col items-center">
                  {previewFile.ext === ".pdf" ? (
                    <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white">
                      <iframe
                        src={previewFile.url}
                        title={previewFile.name}
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-md">
                      <FileCheck className="w-12 h-12 text-amber-500 mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{previewFile.name}</h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          هذا المستند يتطلب تحميله لفتحه في التطبيق المخصص له على جهازك
                        </p>
                      </div>
                      <a
                        href={previewFile.url}
                        download={previewFile.name}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل المستند الآن</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* VIDEO PREVIEW */}
              {previewFile.type === "video" && (
                <div className="w-full max-w-3xl rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black">
                  <video
                    src={previewFile.url}
                    controls
                    autoPlay
                    className="w-full max-h-[65vh]"
                  />
                </div>
              )}

              {/* AUDIO PREVIEW */}
              {previewFile.type === "audio" && (
                <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Music className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {previewFile.name}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        تسجيل صوتي وبودكاست مخصص للدروس والمراجعات
                      </p>
                    </div>
                  </div>

                  <audio
                    src={previewFile.url}
                    controls
                    autoPlay
                    className="w-full h-11 rounded-lg"
                  />
                </div>
              )}

              {/* OTHER FILES */}
              {previewFile.type === "other" && (
                <div className="p-8 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-md">
                  <HardDrive className="w-12 h-12 text-zinc-400 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{previewFile.name}</h4>
                    <p className="text-xs text-zinc-500 mt-1">ملف ملحق بالنظام</p>
                  </div>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل الملف</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-5 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-zinc-400 truncate max-w-xs sm:max-w-md" dir="ltr">
                {previewFile.url}
              </span>
              <a
                href={previewFile.url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>فتح في نافذة كاملة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

