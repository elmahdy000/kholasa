import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-xl bg-[#E2E8F0] dark:bg-[#334155]/70", className)}
    />
  );
}

/** Header bar that mirrors the real shell when used outside a persistent shell, or pure content skeleton when inside. */
function ShellSkeleton({
  children,
  label,
  withHeader = false,
}: {
  children: React.ReactNode;
  label: string;
  withHeader?: boolean;
}) {
  return (
    <div
      className="w-full space-y-6"
      dir="rtl"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      {withHeader && (
        <div className="h-15 border-b border-[#E2E8F0]/80 dark:border-[#334155]/80 bg-white/80 dark:bg-[#0F172A]/80 mb-6">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <Skeleton className="h-11 w-28" />
            <Skeleton className="hidden md:block h-11 w-80" />
            <Skeleton className="h-11 w-24" />
          </div>
        </div>
      )}
      <div className="w-full space-y-6">
        {children}
      </div>
    </div>
  );
}

export function PageLoading({
  variant = "cards",
  label = "جاري التحميل...",
}: {
  variant?: "cards" | "list" | "article" | "table";
  label?: string;
}) {
  return (
    <ShellSkeleton label={label}>
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {variant === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}
      {variant === "list" && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}
      {variant === "table" && (
        <div className="space-y-2">
          <Skeleton className="h-11" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      )}
      {variant === "article" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <Skeleton className="h-56" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={cn("h-4", i % 3 === 2 ? "w-2/3" : "w-full")} />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      )}
    </ShellSkeleton>
  );
}
