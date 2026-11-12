import { Skeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div
      className="w-full space-y-4 sm:space-y-5 text-right"
      dir="rtl"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">جاري تحميل دروس ووحدات المادة...</span>

      {/* Breadcrumb skeleton */}
      <Skeleton className="h-4 w-44 rounded-lg" />

      {/* Compact Subject Header Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-[#0D214D] border border-[#DFE6F0] dark:border-[#1E3A6E] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-7 w-56 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
          <Skeleton className="h-2 w-full max-w-md rounded-full" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl shrink-0" />
      </div>

      {/* View Mode Switcher Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-12 w-full max-w-[440px] rounded-full" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-11 w-20 rounded-full" />
          <Skeleton className="h-11 w-44 rounded-full" />
        </div>
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>

      {/* Responsive Grid Cards Skeleton */}
      <div className="lessons-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#DFE6F0] dark:border-[#1E3352] p-3.5 sm:p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-8 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex items-start gap-2.5">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
