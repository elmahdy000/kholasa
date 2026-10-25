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
  Plus,
  X,
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

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("STUDENT");
  const [createSystemId, setCreateSystemId] = useState("");
  const [createGradeId, setCreateGradeId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          phone: createPhone.trim(),
          email: createEmail.trim() || undefined,
          password: createPassword,
          role: createRole,
          systemId: createSystemId || undefined,
          gradeId: createGradeId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "تعذر إنشاء المستخدم");
      }

      setUsers((prev) => [data.user, ...prev]);
      setIsCreateOpen(false);
      setCreateName("");
      setCreatePhone("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("STUDENT");
      setCreateSystemId("");
      setCreateGradeId("");
    } catch (err: any) {
      setCreateError(err.message || "حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsCreating(false);
    }
  };

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 ">
          <span className="text-[13px] font-bold text-[#64748B]">إجمالي الحسابات</span>
          <span className="text-2xl font-bold text-[#0F172A] dark:text-white block mt-1">
            {users.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 ">
          <span className="text-[13px] font-bold text-[#800020]">الطلاب المسجلون</span>
          <span className="text-2xl font-bold text-[#800020] dark:text-[#FB7185] block mt-1">
            {studentsCount}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 ">
          <span className="text-[13px] font-bold text-[#D97706]">المسؤولون والمشرفون</span>
          <span className="text-2xl font-bold text-[#D97706] dark:text-[#FBBF24] block mt-1">
            {adminsCount}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 ">
          <span className="text-[13px] font-bold text-[#059669]">إجمالي الامتحانات المنفذة</span>
          <span className="text-2xl font-bold text-[#059669] dark:text-[#34D399] block mt-1">
            {users.reduce((sum, u) => sum + u.attempts.length, 0)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80  flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بالاسم، رقم الهاتف، أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800020]"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
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
            className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل الأنظمة التعليمية</option>
            {systems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[13px] font-bold text-[#94A3B8]">
            عرض {filteredUsers.length} من أصل {users.length} مستخدم
          </span>
          <button
            onClick={() => {
              setIsCreateOpen(true);
              setCreateError(null);
            }}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2  cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مستخدم أو مشرف</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[13px]">
            <thead className="bg-[#F8FAFC] dark:bg-[#1E293B]/80 border-b border-[#E2E8F0]/80 dark:border-[#334155]/80 text-[#64748B] font-bold">
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
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/60 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {filteredUsers.map((u) => {
                const completedLessons = u.progress.filter((p) => p.isCompleted).length;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-[#334155]/20 transition-colors"
                  >
                    {/* User info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#800020] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                          {(u.name || "م").charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-[#0F172A] dark:text-white block">
                            {u.name || "مستخدم بدون اسم"}
                          </span>
                          <span className="text-[13px] text-[#94A3B8] font-mono block">
                            {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 font-mono text-[13px] text-[#64748B]" dir="ltr">
                      {u.phone || u.email || "—"}
                    </td>

                    {/* Educational Info */}
                    <td className="p-4">
                      {u.system?.name ? (
                        <div className="space-y-1">
                          <span className="text-[13px] font-bold block">
                            {u.system.name}
                          </span>
                          <span className="text-[13px] text-[#94A3B8] font-medium">
                            {u.grade?.name || "الصف غير محدد"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#94A3B8] text-[13px]">غير محدد</span>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-bold ${
                          u.role === "SUPER_ADMIN"
                            ? "bg-[#800020]/10 text-[#800020] border border-[#800020]/20"
                            : u.role === "ADMIN"
                            ? "bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20"
                            : u.role === "TEACHER"
                            ? "bg-[#800020]/10 text-[#800020] border border-[#800020]/20"
                            : "bg-[#800020]/10 text-[#800020] border border-[#800020]/20"
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
                      <span className="text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]">
                        {completedLessons} درس
                      </span>
                    </td>

                    {/* Attempts */}
                    <td className="p-4">
                      <span className="text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]">
                        {u.attempts.length} اختبار
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRole(u.role);
                          }}
                          className="h-11 px-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[13px] font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-1 transition-colors"
                          title="تعديل الرتبة"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>الرتبة</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.name || "")}
                          disabled={u.id === currentUserId}
                          className="p-2 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl p-6 space-y-5 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#800020]" />
                <span>تعديل رتبة وصلاحيات المستخدم</span>
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"
              >
                ×
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0]/60 dark:border-[#334155]/60 text-[13px] space-y-1">
              <span className="text-[#94A3B8] font-bold block">المستخدم المستهدف:</span>
              <span className="font-bold text-[#0F172A] dark:text-white block text-sm">
                {selectedUser.name || "مستخدم"}
              </span>
              <span className="text-[13px] font-mono text-[#64748B] block" dir="ltr">
                {selectedUser.email || selectedUser.phone}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] text-[13px] font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-2">
                  اختر الرتبة الجديدة
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
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

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold disabled:opacity-50"
                >
                  {isUpdating ? "جاري الحفظ..." : "حفظ التعديل"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User / Subadmin Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-6 space-y-4 shadow-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
              <div className="flex items-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                  إضافة مستخدم أو مشرف جديد
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"
              >
                ×
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] text-[13px] font-bold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="مثال: أحمد محمد علي"
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    required
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                  كلمة المرور * (6 أحرف على الأقل)
                </label>
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                  الرتبة / نوع الحساب *
                </label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                >
                  <option value="STUDENT">طالب (STUDENT) - حساب طالب اعتيادي</option>
                  <option value="TEACHER">معلم (TEACHER) - Subadmin لمتابعة وتصحيح الامتحانات</option>
                  <option value="EDITOR">محرر محتوى (EDITOR) - Subadmin لإدارة المناهج والأسئلة والوسائط</option>
                  <option value="ADMIN">مسؤول (ADMIN) - مشرف كامل الصلاحيات</option>
                  {currentUserRole === "SUPER_ADMIN" && (
                    <option value="SUPER_ADMIN">مشرف عام أعلى (SUPER_ADMIN)</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    النظام التعليمي
                  </label>
                  <select
                    value={createSystemId}
                    onChange={(e) => {
                      setCreateSystemId(e.target.value);
                      setCreateGradeId("");
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                  >
                    <option value="">بدون تحديد</option>
                    {systems.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    الصف الدراسي
                  </label>
                  <select
                    value={createGradeId}
                    onChange={(e) => setCreateGradeId(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
                  >
                    <option value="">بدون تحديد</option>
                    {grades
                      .filter((g) => !createSystemId || g.systemId === createSystemId)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold disabled:opacity-50"
                >
                  {isCreating ? "جاري الإنشاء..." : "إنشاء المستخدم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
