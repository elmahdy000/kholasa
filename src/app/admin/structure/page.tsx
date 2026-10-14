import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { StructureManagerClient } from "@/components/admin/StructureManagerClient";

export default async function AdminStructurePage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/structure");
  }

  const systems = await prisma.educationalSystem.findMany({
    orderBy: { order: "asc" },
    include: {
      grades: {
        orderBy: { order: "asc" },
        include: {
          tracks: true,
          subjects: {
            orderBy: { order: "asc" },
            include: {
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
      <StructureManagerClient initialSystems={systems as any} />
    </AdminShell>
  );
}
