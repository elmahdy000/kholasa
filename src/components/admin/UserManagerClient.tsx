"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  GraduationCap,
  Trophy,
  BookOpen,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  UserCheck,
  Award,
} from "lucide-react";

interface EducationalSystem {
  id: string;
  name: string;
}

interface Grade {
  id: string;
  name: string;
  systemId: string;
}

interface UserItem {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: string;
  system?: { id: string; name: string } | null;
  grade?: { id: string; name: string } | null;
  attempts: { id: string; score: number; percentage?: number }[];
  progress: { id: string; isCompleted: boolean }[];
  createdAt: string | Date;
}

interface UserManagerClientProps {
  initialUsers: UserItem[];
  systems: EducationalSystem[];
  grades: Grade[];
  currentUserId: string;
  currentUserRole: string;
}

export function UserManagerClient({
  initialUsers,
  systems,
  grades,
  currentUserId,
  currentUserRole,
}: UserManagerClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedSystemId, setSelectedSystemId] = useState("all");

  // Edit Role Modal State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState("STUDENT");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Student Details Modal State
  const [inspectUser, setInspectUser] = useState<UserItem | null>(null);

  // Handle Role Change
  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsUpdating(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحديث الرتبة");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
      );
      setSelectedUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء التحديث");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUserId) {
      alert("لا يمكنك حذف حسابك الحالي المسجل به الآن.");
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف المستخدم "${userName || "هذا الحساب"}" نهائياً؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || "تعذر حذف المستخدم");
      }
    } catch {
      alert("حدث خطأ أثناء حذف المستخدم");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (selectedRole !== "all" && u.role !== selectedRole) return false;
    if (selectedSystemId !== "all" && u.system?.id !== selectedSystemId)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q) || false;
      const matchEmail = u.email?.toLowerCase().includes(q) || false;
      const matchPhone = u.phone?.toLowerCase().includes(q) || false;
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const studentsCount = users.filter((u) => u.role === "STUDENT").length;
  const adminsCount = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;

  return (
    <div className="space-y-6">
      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500">إجمالي الحسابات</span>
          <span className="text-2xl font-black text-[#0F172A] dark:text-white block mt-1">
            {users.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-500">الطلاب المسجلون</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block mt-1">
            {studentsCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs">
          <span className="text-[11px] font-bold text-amber-500">المسؤولون والمشرفون</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block mt-1">
            {adminsCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-500">إجمالي الامتحانات المنفذة</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
            {users.reduce((sum, u) => sum + u.attempts.length, 0)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بالاسم، رقم الهاتف، أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-9 pl-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل الرتب والصلاحيات</option>
            <option value="STUDENT">طالب (STUDENT)</option>
            <option value="TEACHER">معلم (TEACHER)</option>
            <option value="EDITOR">محرر محتوى (EDITOR)</option>
            <option value="ADMIN">مسؤول (ADMIN)</option>
            <option value="SUPER_ADMIN">مشرف عام أعلى (SUPER_ADMIN)</option>
          </select>

          {/* System Filter */}
          <select
            value={selectedSystemId}
            onChange={(e) => setSelectedSystemId(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل الأنظمة التعليمية</option>
            {systems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-400 shrink-0">
          عرض {filteredUsers.length} من أصل {users.length} مستخدم
        </span>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200/80 dark:border-zinc-800/80 text-slate-500 font-black">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">بيانات الاتصال</th>
                <th className="p-4">النظام والصف الدراسي</th>
                <th className="p-4">الرتبة والصلاحية</th>
                <th className="p-4">الدروس المنجزة</th>
                <th className="p-4">الامتحانات</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-bold text-[#0F172A] dark:text-zinc-200">
              {filteredUsers.map((u) => {
                const completedLessons = u.progress.filter((p) => p.isCompleted).length;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                  >
                    {/* User info */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                          {(u.name || "م").charAt(0)}
                        </div>
                        <div>
                          <span className="font-black text-[#0F172A] dark:text-white block">
                            {u.name || "مستخدم بدون اسم"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 font-mono text-[11px] text-slate-500" dir="ltr">
                      {u.phone || u.email || "—"}
                    </td>

                    {/* Educational Info */}
                    <td className="p-4">
                      {u.system?.name ? (
                        <div className="space-y-0.5">
                          <span className="text-xs font-black block">
                            {u.system.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {u.grade?.name || "الصف غير محدد"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">غير محدد</span>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                          u.role === "SUPER_ADMIN"
                            ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                            : u.role === "ADMIN"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : u.role === "TEACHER"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            : "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                        }`}
                      >
                        {u.role === "SUPER_ADMIN"
                          ? "مشرف عام أعلى"
                          : u.role === "ADMIN"
                          ? "مسؤول نظام"
                          : u.role === "TEACHER"
                          ? "معلم"
                          : "طالب"}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="p-4">
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                        {completedLessons} درس
                      </span>
                    </td>

                    {/* Attempts */}
                    <td className="p-4">
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                        {u.attempts.length} اختبار
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRole(u.role);
                          }}
                          className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 transition-colors"
                          title="تعديل الرتبة"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>الرتبة</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.name || "")}
                          disabled={u.id === currentUserId}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="حذف المستخدم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT ROLE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl p-6 space-y-5 text-right shadow-2xl border border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span>تعديل رتبة وصلاحيات المستخدم</span>
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 text-xs space-y-1">
              <span className="text-slate-400 font-bold block">المستخدم المستهدف:</span>
              <span className="font-black text-[#0F172A] dark:text-white block text-sm">
                {selectedUser.name || "مستخدم"}
              </span>
              <span className="text-[11px] font-mono text-slate-500 block" dir="ltr">
                {selectedUser.email || selectedUser.phone}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  اختر الرتبة الجديدة
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                >
                  <option value="STUDENT">طالب (STUDENT) - تصفح وحل الامتحانات</option>
                  <option value="TEACHER">معلم (TEACHER) - متابعة درجات الطلاب</option>
                  <option value="EDITOR">محرر (EDITOR) - إضافة أسئلة ومحتوى</option>
                  <option value="ADMIN">مسؤول (ADMIN) - تحكم كامل بالمنصة</option>
                  {currentUserRole === "SUPER_ADMIN" && (
                    <option value="SUPER_ADMIN">مشرف عام أعلى (SUPER_ADMIN)</option>
                  )}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black disabled:opacity-50"
                >
                  {isUpdating ? "جاري الحفظ..." : "حفظ التعديل"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
