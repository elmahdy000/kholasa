import Link from "next/link";

export function AdminTelemetryBar() {
  return (
    <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] font-mono text-[#64748B]">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 text-[#059669] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          <span>PostgreSQL Cluster Operational</span>
        </span>
        <span>·</span>
        <span>Prisma 6.4.1</span>
        <span>·</span>
        <span>Next.js 16 App Router</span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/admin/analytics"
          className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
        >
          عرض سجل التدقيق
        </Link>
        <Link
          href="/admin/structure"
          className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
        >
          إدارة الهيكل الأكاديمي
        </Link>
      </div>
    </div>
  );
}
