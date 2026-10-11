import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { Users, GraduationCap, Shield, Trophy, BookOpen } from "lucide-react";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/users");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      system: { select: { name: true } },
      grade: { select: { name: true } },
      attempts: { select: { id: true, score: true } },
      progress: { select: { id: true, isCompleted: true } },
    },
  });

  return (
    <AdminShell user={user}>
      <div className="space-y-6 text-right font-sans">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-[#14243D] dark:text-white">
            إدارة الطلاب والمستخدمين
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            سجل الطلاب المسجلين ومتابعة تقدمهم الأكاديمي
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black">
                <tr>
                  <th className="p-4">الطالب</th>
                  <th className="p-4">البريد / الهاتف</th>
                  <th className="p-4">النظام والصف</th>
                  <th className="p-4">الرتبة</th>
                  <th className="p-4">الدروس المنجزة</th>
                  <th className="p-4">الاختبارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-[#14243D] dark:text-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6858EA] to-[#11B7B4] text-white flex items-center justify-center font-black text-xs shrink-0">
                        {(u.name || "ط").charAt(0)}
                      </div>
                      <span className="font-black">{u.name || "طالب"}</span>
                    </td>
                    <td className="p-4 text-slate-500" dir="ltr">
                      {u.email || u.phone || "—"}
                    </td>
                    <td className="p-4">
                      {u.system?.name ? (
                        <span>
                          {u.system.name} • {u.grade?.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">غير محدد</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          u.role === "ADMIN"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : "bg-[#6858EA]/10 text-[#6858EA]"
                        }`}
                      >
                        {u.role === "ADMIN" ? "مسؤول" : "طالب"}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.progress.filter((p) => p.isCompleted).length} درس
                    </td>
                    <td className="p-4">
                      {u.attempts.length} اختبار
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
