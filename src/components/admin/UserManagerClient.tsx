"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { UserManagerClientProps, UserItem } from "./users/types";
import { UserMetricsStrip } from "./users/UserMetricsStrip";
import { UserFilterBar } from "./users/UserFilterBar";
import { UserTable } from "./users/UserTable";
import { EditRoleModal } from "./users/EditRoleModal";
import { CreateUserModal } from "./users/CreateUserModal";
import { StudentDetailsDrawer } from "./users/StudentDetailsDrawer";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export type { UserManagerClientProps, UserItem, EducationalSystem, Grade } from "./users/types";

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
  const [inspectUserId, setInspectUserId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: "danger" | "warning";
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "تأكيد",
    variant: "danger",
    onConfirm: async () => {},
  });

  // Edit Role Modal State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState("STUDENT");
  const [newMaxDevices, setNewMaxDevices] = useState(2);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createLoginCode, setCreateLoginCode] = useState("");
  const [createSchoolCategory, setCreateSchoolCategory] = useState<"ARABIC" | "LANGUAGES">("ARABIC");
  const [createMaxDevices, setCreateMaxDevices] = useState(1);
  const [createRole, setCreateRole] = useState("STUDENT");
  const [createSystemId, setCreateSystemId] = useState("");
  const [createGradeId, setCreateGradeId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const generateRandomCode = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let res = "";
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleOpenCreateModal = () => {
    setCreateLoginCode(generateRandomCode());
    setIsCreateOpen(true);
  };

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
          phone: createPhone.trim() || undefined,
          email: createEmail.trim() || undefined,
          password: createPassword || undefined,
          loginCode: createRole === "STUDENT" ? (createLoginCode.trim().toUpperCase() || undefined) : undefined,
          schoolCategory: createSchoolCategory,
          maxDevices: createRole === "STUDENT" ? createMaxDevices : 1,
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
      setCreateLoginCode("");
      setCreateRole("STUDENT");
      setCreateSystemId("");
      setCreateGradeId("");
    } catch (err: any) {
      setCreateError(err.message || "حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsUpdating(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: newRole,
          maxDevices: newRole === "STUDENT" ? newMaxDevices : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحديث الرتبة");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, role: newRole, maxDevices: newRole === "STUDENT" ? newMaxDevices : u.maxDevices }
            : u
        )
      );
      setSelectedUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء التحديث");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUserId) {
      alert("لا يمكنك حذف حسابك الحالي المسجل به الآن.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "حذف المستخدم",
      description: `هل أنت متأكد من حذف المستخدم "${userName || "هذا الحساب"}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: "تأكيد الحذف",
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } else {
          const data = await res.json();
          throw new Error(data.error || "تعذر حذف المستخدم");
        }
      },
    });
  };

  const handleResetDevices = (userId: string, userName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "إعادة ضبط أجهزة الطالب",
      description: `هل أنت متأكد من فك ربط أجهزة الطالب "${userName || "المستخدم"}"؟ سيتم مسح الأجهزة المسجلة فوراً وتسجيل خروج الطالب ليتمكن من ربط جهازه الجديد.`,
      confirmText: "تأكيد فك الأجهزة",
      variant: "warning",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/users/${userId}/reset-devices`, {
          method: "POST",
        });

        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, boundDevices: [] } : u))
          );
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } else {
          const data = await res.json();
          throw new Error(data.error || "تعذر إعادة ضبط الأجهزة");
        }
      },
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedRole !== "all" && u.role !== selectedRole) return false;
      if (selectedSystemId !== "all" && u.system?.id !== selectedSystemId)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q) || false;
        const matchEmail = u.email?.toLowerCase().includes(q) || false;
        const matchPhone = u.phone?.toLowerCase().includes(q) || false;
        const matchCode = u.loginCode?.toLowerCase().includes(q) || false;
        if (!matchName && !matchEmail && !matchPhone && !matchCode) return false;
      }
      return true;
    });
  }, [users, selectedRole, selectedSystemId, searchQuery]);

  // Pagination calculation
  const totalFilteredCount = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const start = (safeCurrentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(start, start + pageSize);

  return (
    <div className="space-y-6">
      {/* 1. Metrics Strip */}
      <UserMetricsStrip users={users} />

      {/* 2. Filter and Search Bar */}
      <UserFilterBar
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        selectedRole={selectedRole}
        setSelectedRole={(r) => {
          setSelectedRole(r);
          setCurrentPage(1);
        }}
        selectedSystemId={selectedSystemId}
        setSelectedSystemId={(s) => {
          setSelectedSystemId(s);
          setCurrentPage(1);
        }}
        systems={systems}
        totalFilteredCount={totalFilteredCount}
        totalUsersCount={users.length}
        onOpenCreate={() => {
          handleOpenCreateModal();
          setCreateError(null);
        }}
      />

      {/* 3. Users Table */}
      <UserTable
        users={paginatedUsers}
        currentUserId={currentUserId}
        onSelectUserToEdit={(u) => {
          setSelectedUser(u);
          setNewRole(u.role);
          setNewMaxDevices(u.maxDevices || 1);
        }}
        onDeleteUser={handleDeleteUser}
        onResetDevices={handleResetDevices}
        onInspectUser={(id) => setInspectUserId(id)}
      />

      {/* Pagination Footer */}
      {totalFilteredCount > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            <span>عرض</span>
            <span className="font-mono text-[#0F172A] dark:text-white">
              {start + 1} - {Math.min(start + pageSize, totalFilteredCount)}
            </span>
            <span>من إجمالي</span>
            <span className="font-mono text-[#0F172A] dark:text-white">{totalFilteredCount}</span>
            <span>مستخدم</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] font-bold">
              <span>لكل صفحة:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="h-8 w-8 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="الصفحة الأولى"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="الصفحة السابقة"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>

              <div className="px-2.5 text-xs font-mono font-bold text-[#0F172A] dark:text-white">
                {safeCurrentPage} / {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="الصفحة التالية"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="h-8 w-8 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="الصفحة الأخيرة"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Role Modal */}
      <EditRoleModal
        user={selectedUser}
        newRole={newRole}
        setNewRole={setNewRole}
        maxDevices={newMaxDevices}
        setMaxDevices={setNewMaxDevices}
        isUpdating={isUpdating}
        errorMsg={errorMsg}
        currentUserRole={currentUserRole}
        onClose={() => setSelectedUser(null)}
        onSubmit={handleUpdateRole}
      />

      {/* 5. Create User Modal */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        createName={createName}
        setCreateName={setCreateName}
        createPhone={createPhone}
        setCreatePhone={setCreatePhone}
        createEmail={createEmail}
        setCreateEmail={setCreateEmail}
        createPassword={createPassword}
        setCreatePassword={setCreatePassword}
        createLoginCode={createLoginCode}
        setCreateLoginCode={setCreateLoginCode}
        createSchoolCategory={createSchoolCategory}
        setCreateSchoolCategory={setCreateSchoolCategory}
        createMaxDevices={createMaxDevices}
        setCreateMaxDevices={setCreateMaxDevices}
        createRole={createRole}
        setCreateRole={setCreateRole}
        createSystemId={createSystemId}
        setCreateSystemId={setCreateSystemId}
        createGradeId={createGradeId}
        setCreateGradeId={setCreateGradeId}
        isCreating={isCreating}
        createError={createError}
        systems={systems}
        grades={grades}
        currentUserRole={currentUserRole}
        onGenerateCode={() => setCreateLoginCode(generateRandomCode())}
        onSubmit={handleCreateUser}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        open={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        confirmText={confirmModal.confirmText || "تأكيد"}
        cancelText="إلغاء"
        variant={confirmModal.variant || "danger"}
      />

      {/* 6. Comprehensive Student Details Drawer */}
      <StudentDetailsDrawer
        userId={inspectUserId}
        systems={systems}
        grades={grades}
        onClose={() => setInspectUserId(null)}
        onUserUpdated={() => {
          void fetch("/api/admin/users")
            .then((res) => res.json())
            .then((data) => {
              if (data.users) setUsers(data.users);
            })
            .catch(() => {});
        }}
      />
    </div>
  );
}