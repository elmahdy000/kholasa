import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { CurriculumManagerClient } from "@/components/admin/CurriculumManagerClient";

export default async function AdminCurriculumPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/curriculum");
  }

  const systems = await prisma.educationalSystem.findMany({
    orderBy: { order: "asc" },
    include: {
      subjects: {
        orderBy: { order: "asc" },
        include: {
          units: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  return (
    <AdminShell user={user}>
      <div className="space-y-6 text-right font-sans">
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-[#14243D] dark:text-white">
            إدارة المناهج والوحدات والدروس
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            التحكم في نشر المناهج، ترتيب الدروس، ومعاينة تجربة الطالب الحية
          </p>
        </div>

        <CurriculumManagerClient initialSystems={systems as any} />
      </div>
    </AdminShell>
  );
}
