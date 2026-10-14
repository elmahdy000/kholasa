import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { BulkImportClient } from "@/components/admin/BulkImportClient";

export default async function AdminQuestionsImportPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/questions/import");
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      units: {
        orderBy: { order: "asc" },
        select: { id: true, title: true },
      },
    },
  });

  return (
    <AdminShell user={user}>
      <div className="font-sans text-right max-w-5xl mx-auto">
        <BulkImportClient subjects={subjects as any} />
      </div>
    </AdminShell>
  );
}
