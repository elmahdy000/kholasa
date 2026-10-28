"use client";

import {
  Video,
  Image as ImageIcon,
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AudioImagePairModal } from "../AudioImagePairModal";
import type { LessonData } from "./types";
import { useLessonEditor } from "./useLessonEditor";
import { LessonEditorHeader } from "./LessonEditorHeader";
import { LessonEditorFooter } from "./LessonEditorFooter";
import { LessonImageLightbox } from "./LessonImageLightbox";
import { LessonMediaTab } from "./LessonMediaTab";
import { LessonMindMapTab } from "./LessonMindMapTab";
import { LessonContentTab } from "./LessonContentTab";
import { LessonSummaryTab } from "./LessonSummaryTab";

export interface LessonEditorFormProps {
  lessonId: string;
  isStandaloneRoute?: boolean;
  onClose?: () => void;
  onLessonUpdated?: (updatedLesson: LessonData) => void;
  onLessonDeleted?: (deletedId: string) => void;
}

export function LessonEditorForm({
  lessonId,
  isStandaloneRoute = false,
  onClose,
  onLessonUpdated,
  onLessonDeleted,
}: LessonEditorFormProps) {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    isSaving,
    isDeleting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    statusMessage,
    setStatusMessage,
    title,
    setTitle,
    order,
    setOrder,
    durationMinutes,
    setDurationMinutes,
    isPublished,
    setIsPublished,
    unitInfo,
    videoUrl,
    setVideoUrl,
    audioUrl,
    setAudioUrl,
    showPairUploadModal,
    setShowPairUploadModal,
    uploadingMedia,
    mindMapTitle,
    setMindMapTitle,
    mindMapDescription,
    setMindMapDescription,
    mindMapImages,
    setMindMapImages,
    newImageUrl,
    setNewImageUrl,
    previewLightboxImage,
    setPreviewLightboxImage,
    bodyText,
    setBodyText,
    objectives,
    newObjective,
    setNewObjective,
    contentPdfUrl,
    setContentPdfUrl,
    summaryPdfUrl,
    setSummaryPdfUrl,
    summaryImages,
    setSummaryImages,
    newSummaryImageUrl,
    setNewSummaryImageUrl,
    handleAddSummaryImage,
    handleRemoveSummaryImage,
    handleMoveSummaryImage,
    keyConcepts,
    newConcept,
    setNewConcept,
    examTips,
    newExamTip,
    setNewExamTip,
    commonMistakes,
    newMistake,
    setNewMistake,
    newCorrection,
    setNewCorrection,
    handleMediaUpload,
    handleAddImage,
    handleRemoveImage,
    handleMoveImage,
    handleAddObjective,
    handleRemoveObjective,
    handleAddKeyConcept,
    handleRemoveKeyConcept,
    handleAddExamTip,
    handleRemoveExamTip,
    handleAddMistake,
    handleRemoveMistake,
    handleSave,
    handleDelete,
  } = useLessonEditor({
    lessonId,
    isStandaloneRoute,
    onClose,
    onLessonUpdated,
    onLessonDeleted,
  });

  return (
    <div
      className={`w-full bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-sm overflow-hidden flex flex-col font-sans text-right ${
        isStandaloneRoute ? "min-h-[85vh]" : "max-h-[92vh]"
      }`}
    >
      {/* Header */}
      <LessonEditorHeader
        lessonId={lessonId}
        title={title}
        unitInfo={unitInfo}
        isStandaloneRoute={isStandaloneRoute}
        isSaving={isSaving}
        isLoading={isLoading}
        onSave={handleSave}
        onClose={onClose}
      />

      {/* Status Toast */}
      {statusMessage && (
        <div
          className={`px-6 py-3 text-[13px] font-bold flex items-center gap-2 border-b transition-all ${
            statusMessage.type === "success"
              ? "bg-[#059669]/10 text-[#059669] dark:bg-[#1E293B] dark:text-[#34D399] border-[#E2E8F0] dark:border-[#34D399]"
              : "bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#1E293B] dark:text-[#F87171] border-[#E2E8F0] dark:border-[#F87171]"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-4 sm:px-6 pt-3 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center gap-2 overflow-x-auto shrink-0">
        {([
          { id: "media", label: "الوسائط والبيانات", icon: Video },
          {
            id: "mindmap",
            label: `الخرائط الذهنية (${mindMapImages.length})`,
            icon: ImageIcon,
          },
          { id: "content", label: "الشرح ومخرجات التعلم", icon: BookOpen },
          { id: "summary", label: "الزتونة ونقاط الامتحان", icon: Sparkles },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 text-[13px] font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "border-[#800020] text-[#800020]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-11 h-11 border-3 border-[#800020]/30 border-t-[#800020] rounded-full animate-spin" />
            <span className="text-[13px] font-bold text-[#94A3B8]">
              جارٍ تحميل بيانات الدرس...
            </span>
          </div>
        ) : (
          <>
            {activeTab === "media" && (
              <LessonMediaTab
                title={title}
                setTitle={setTitle}
                durationMinutes={durationMinutes}
                setDurationMinutes={setDurationMinutes}
                order={order}
                setOrder={setOrder}
                isPublished={isPublished}
                setIsPublished={setIsPublished}
                videoUrl={videoUrl}
                setVideoUrl={setVideoUrl}
                audioUrl={audioUrl}
                setAudioUrl={setAudioUrl}
                uploadingMedia={uploadingMedia}
                onUploadMedia={handleMediaUpload}
                onOpenPairUploadModal={() => setShowPairUploadModal(true)}
              />
            )}

            {activeTab === "mindmap" && (
              <LessonMindMapTab
                mindMapTitle={mindMapTitle}
                setMindMapTitle={setMindMapTitle}
                mindMapDescription={mindMapDescription}
                setMindMapDescription={setMindMapDescription}
                mindMapImages={mindMapImages}
                newImageUrl={newImageUrl}
                setNewImageUrl={setNewImageUrl}
                onAddImage={handleAddImage}
                onRemoveImage={handleRemoveImage}
                onMoveImage={handleMoveImage}
                uploadingMedia={uploadingMedia}
                onUploadMedia={handleMediaUpload}
                onPreviewImage={(url) => setPreviewLightboxImage(url)}
              />
            )}

            {activeTab === "content" && (
              <LessonContentTab
                objectives={objectives}
                newObjective={newObjective}
                setNewObjective={setNewObjective}
                onAddObjective={handleAddObjective}
                onRemoveObjective={handleRemoveObjective}
                bodyText={bodyText}
                setBodyText={setBodyText}
                contentPdfUrl={contentPdfUrl}
                setContentPdfUrl={setContentPdfUrl}
                uploadingMedia={uploadingMedia}
                onUploadMedia={handleMediaUpload}
              />
            )}

            {activeTab === "summary" && (
              <LessonSummaryTab
                summaryPdfUrl={summaryPdfUrl}
                setSummaryPdfUrl={setSummaryPdfUrl}
                summaryImages={summaryImages}
                newSummaryImageUrl={newSummaryImageUrl}
                setNewSummaryImageUrl={setNewSummaryImageUrl}
                onAddSummaryImage={handleAddSummaryImage}
                onRemoveSummaryImage={handleRemoveSummaryImage}
                onMoveSummaryImage={handleMoveSummaryImage}
                uploadingMedia={uploadingMedia}
                onUploadMedia={handleMediaUpload}
                onPreviewImage={(url) => setPreviewLightboxImage(url)}
                keyConcepts={keyConcepts}
                newConcept={newConcept}
                setNewConcept={setNewConcept}
                onAddKeyConcept={handleAddKeyConcept}
                onRemoveKeyConcept={handleRemoveKeyConcept}
                examTips={examTips}
                newExamTip={newExamTip}
                setNewExamTip={setNewExamTip}
                onAddExamTip={handleAddExamTip}
                onRemoveExamTip={handleRemoveExamTip}
                commonMistakes={commonMistakes}
                newMistake={newMistake}
                setNewMistake={setNewMistake}
                newCorrection={newCorrection}
                setNewCorrection={setNewCorrection}
                onAddMistake={handleAddMistake}
                onRemoveMistake={handleRemoveMistake}
              />
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <LessonEditorFooter
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        isDeleting={isDeleting}
        isSaving={isSaving}
        isLoading={isLoading}
        isStandaloneRoute={isStandaloneRoute}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={onClose}
      />

      {/* Lightbox for Previewing Mind Map Images */}
      <LessonImageLightbox
        imageUrl={previewLightboxImage}
        onClose={() => setPreviewLightboxImage(null)}
      />

      {/* Audio + Image Pair Upload Modal */}
      <AudioImagePairModal
        isOpen={showPairUploadModal}
        onClose={() => setShowPairUploadModal(false)}
        title="رفع تسجيل صوتي مع صورة الشرح"
        description="اختر صورة الشرح أو الغلاف أولاً، ثم اختر الملف الصوتي لربطهما معاً بالدرس."
        onSuccess={({ audioUrl: newAudioUrl, imageUrl: newImageUrl }) => {
          setAudioUrl(newAudioUrl);
          setMindMapImages((prev) => [...prev, newImageUrl]);
          setStatusMessage({
            type: "success",
            text: "تم رفع التسجيل الصوتي وصورة الشرح معاً بنجاح وتعيينهما بالدرس!",
          });
          setTimeout(() => setStatusMessage(null), 3500);
        }}
      />
    </div>
  );
}
