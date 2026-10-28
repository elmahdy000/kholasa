import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { CurriculumManagerClient } from "@/components/admin/CurriculumManagerClient";

export default async function AdminCurriculumPage() {
  const user = await getCurrentUser();

  if (!user || !isStaff(user.role)) {
    redirect("/login?callbackUrl=/admin/curriculum");
  }

  const systems = await prisma.educationalSystem.findMany({
    where: {
      isActive: true,
      code: "baccalaureate",
    },
    orderBy: { order: "asc" },
    include: {
      grades: {
        where: {
          code: { in: ["bacc_g10", "bacc_g11", "G10", "G11"] },
        },
        orderBy: { order: "asc" },
        include: {
          tracks: {
            orderBy: { order: "asc" },
          },
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
              _count: {
                select: {
                  units: true,
                  questions: true,
                  exams: true,
                },
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
        <div className="border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
            المناهج والهيكل الأكاديمي
          </h1>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            إدارة الصفوف والمسارات التخصصية والمواد الدراسية والوحدات والدروس لشهادة البكالوريا المصرية
          </p>
        </div>

        <CurriculumManagerClient initialSystems={systems as any} />
      </div>
    </AdminShell>
  );
}
