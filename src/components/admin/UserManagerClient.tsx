"use client";

import { useState } from "react";
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

  return (
    <div className="space-y-6">
      {/* 1. Metrics Strip */}
      <UserMetricsStrip users={users} />

      {/* 2. Filter and Search Bar */}
      <UserFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedSystemId={selectedSystemId}
        setSelectedSystemId={setSelectedSystemId}
        systems={systems}
        totalFilteredCount={filteredUsers.length}
        totalUsersCount={users.length}
        onOpenCreate={() => {
          handleOpenCreateModal();
          setCreateError(null);
        }}
      />

      {/* 3. Users Table */}
      <UserTable
        users={filteredUsers}
        currentUserId={currentUserId}
        onSelectUserToEdit={(u) => {
          setSelectedUser(u);
          setNewRole(u.role);
          setNewMaxDevices(u.maxDevices || 2);
        }}
        onDeleteUser={handleDeleteUser}
        onResetDevices={handleResetDevices}
        onInspectUser={(id) => setInspectUserId(id)}
      />

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
