"use client";

import {
  Video,
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
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
import { LessonDefinitionsTab } from "./LessonDefinitionsTab";
import { LessonQuestionsTab } from "./LessonQuestionsTab";

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
    definitions,
    setDefinitions,
    questions,
    setQuestions,
    isLoadingQuestions,
    fetchLessonQuestions,
    handleMediaUpload,
    handleAddImage,
    handleRemoveImage,
    handleMoveImage,
    handleAddDefinition,
    handleRemoveDefinition,
    handleUpdateDefinition,
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
      className={`w-full bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-sm overflow-hidden flex flex-col font-sans text-right ${
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
          className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:bg-[#1E293B] dark:text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-600 dark:bg-[#1E293B] dark:text-red-400 border-red-500/20"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Primary Tab Navigation (Mind Map | Definitions | Questions | Info & Video) */}
      <div className="px-4 sm:px-6 pt-3 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center gap-2 overflow-x-auto shrink-0">
        {([
          {
            id: "mindmap",
            label: `🗺️ الخريطة الذهنية (${mindMapImages.length})`,
            icon: ImageIcon,
          },
          {
            id: "definitions",
            label: `📖 المصطلحات والتعريفات (${definitions.length})`,
            icon: BookOpen,
          },
          {
            id: "questions",
            label: `🎯 أسئلة وتدريبات الدرس (${questions.length})`,
            icon: HelpCircle,
          },
          {
            id: "media",
            label: "⚙️ بيانات الدرس والفيديو",
            icon: Video,
          },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
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
            <div className="w-10 h-10 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs font-bold text-[#94A3B8]">
              جارٍ تحميل محتويات الدرس...
            </span>
          </div>
        ) : (
          <>
            {/* 1. Mind Map Tab */}
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

            {/* 2. Definitions & Terms Tab */}
            {activeTab === "definitions" && (
              <LessonDefinitionsTab
                definitions={definitions}
                setDefinitions={setDefinitions}
                onAddDefinition={handleAddDefinition}
                onRemoveDefinition={handleRemoveDefinition}
                onUpdateDefinition={handleUpdateDefinition}
              />
            )}

            {/* 3. Questions & Practice Tab */}
            {activeTab === "questions" && (
              <LessonQuestionsTab
                lessonId={lessonId}
                unitInfo={unitInfo}
                questions={questions}
                setQuestions={setQuestions}
                isLoadingQuestions={isLoadingQuestions}
                onRefreshQuestions={fetchLessonQuestions}
              />
            )}

            {/* 4. Lesson Info & Video Tab */}
            {(activeTab === "media" || activeTab === "info") && (
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
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {previewLightboxImage && (
        <LessonImageLightbox
          imageUrl={previewLightboxImage}
          onClose={() => setPreviewLightboxImage(null)}
        />
      )}

      {/* Audio Pair Modal */}
      <AudioImagePairModal
        isOpen={showPairUploadModal}
        onClose={() => setShowPairUploadModal(false)}
        onSuccess={(result) => {
          if (result.audioUrl) setAudioUrl(result.audioUrl);
          if (result.imageUrl) {
            setMindMapImages((prev) => [...prev, result.imageUrl]);
          }
        }}
      />

      {/* Sticky Bottom Actions Footer */}
      <LessonEditorFooter
        isSaving={isSaving}
        isDeleting={isDeleting}
        isLoading={isLoading}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        isStandaloneRoute={isStandaloneRoute}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={onClose}
      />
    </div>
  );
}
