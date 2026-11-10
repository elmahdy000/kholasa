"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import type { ArabicNormalizedSection, ArabicVisualAsset } from "./types";

interface ArabicVisualAssetsTabProps {
  assets: ArabicVisualAsset[];
  sections: ArabicNormalizedSection[];
  onChangeAssets: (next: ArabicVisualAsset[]) => void;
}

export function ArabicVisualAssetsTab({
  assets,
  sections,
  onChangeAssets,
}: ArabicVisualAssetsTabProps) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleUploadAssetImage = async (assetKey: string, file: File) => {
    setUploadingKey(assetKey);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "فشل رفع الصورة");
      }
      onChangeAssets(
        assets.map((a) =>
          a.assetKey === assetKey
            ? { ...a, imageUrl: data.url, status: "uploaded_and_linked" }
            : a
        )
      );
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "تعذر رفع الصورة، حاول مرة أخرى"
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const addAsset = () => {
    const nextIdx = assets.length + 1;
    onChangeAssets([
      ...assets,
      {
        assetKey: `arabic-map-${Date.now().toString(36)}`,
        sectionId: sections[0]?.id || "u1-l1-s01",
        title: `خريطة توضيحية ${nextIdx}`,
        order: nextIdx,
        status: "previously_designed_upload_to_platform_required",
        imageUrl: null,
      },
    ]);
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-[#FBF8F1] dark:bg-[#1E293B] border border-[#E5DEC9] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-[#0F2744] dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
            <span>الخرائط الذهنية والوسائط البصرية ({assets.length})</span>
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            المراجع المستخرجة من ملف JSON هي بيانات وصفية (`assetKey` + `sectionId`) بانتظار رفع ملفات الصور الفعلية وربطها بالأقسام — لن نظهر صوراً وهمية قبل الرفع.
          </p>
        </div>

        <button
          type="button"
          onClick={addAsset}
          className="px-3.5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-extrabold flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة أصل بصري</span>
        </button>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...assets]
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((asset) => {
            const hasUploadedImage = Boolean(asset.imageUrl);
            const isUploading = uploadingKey === asset.assetKey;
            return (
              <div
                key={asset.assetKey}
                className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F2744] dark:text-slate-200">
                        {asset.assetKey}
                      </code>
                      {hasUploadedImage ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>صورة مرفوعة ومربوطة ✓</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          مرجع وصفي بانتظار رفع الصورة
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeAssets(assets.filter((a) => a.assetKey !== asset.assetKey))
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="إزالة المرجع"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Preview box */}
                <div className="rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] bg-[#F8FAF9] dark:bg-[#1E293B] overflow-hidden">
                  {hasUploadedImage ? (
                    <div className="relative group">
                      <img
                        src={asset.imageUrl!}
                        alt={asset.title}
                        className="w-full h-44 object-contain bg-white dark:bg-[#0B1120]"
                      />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setLightboxUrl(asset.imageUrl!)}
                          className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black cursor-pointer"
                          title="تكبير"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onChangeAssets(
                              assets.map((a) =>
                                a.assetKey === asset.assetKey
                                  ? {
                                    ...a,
                                    imageUrl: null,
                                    status: "previously_designed_upload_to_platform_required",
                                  }
                                  : a
                              )
                            )
                          }
                          className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                          title="فصل الصورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center p-4 text-center gap-2">
                      <ImageIcon className="w-7 h-7 text-[#94A3B8]" />
                      <p className="text-[11px] font-bold text-[#64748B]">
                        لم يُرفع ملف صورة لهذه الخريطة بعد ({asset.assetKey})
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                      عنوان الخريطة
                    </label>
                    <input
                      type="text"
                      value={asset.title}
                      onChange={(e) =>
                        onChangeAssets(
                          assets.map((a) =>
                            a.assetKey === asset.assetKey
                              ? { ...a, title: e.target.value }
                              : a
                          )
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={asset.order}
                      onChange={(e) =>
                        onChangeAssets(
                          assets.map((a) =>
                            a.assetKey === asset.assetKey
                              ? { ...a, order: Number(e.target.value || 1) }
                              : a
                          )
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold tabular-nums"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <select
                    value={asset.sectionId}
                    onChange={(e) =>
                      onChangeAssets(
                        assets.map((a) =>
                          a.assetKey === asset.assetKey
                            ? { ...a, sectionId: e.target.value }
                            : a
                        )
                      )
                    }
                    className="flex-1 px-2.5 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.order}. {sec.title}
                      </option>
                    ))}
                  </select>

                  <label className="px-3 py-2 rounded-lg bg-[#0F2744] hover:bg-[#1E3A5F] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{hasUploadedImage ? "تبديل الصورة" : "رفع صورة الخريطة"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleUploadAssetImage(asset.assetKey, f);
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
      </div>

      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <img
            src={lightboxUrl}
            alt="معاينة الخريطة"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
