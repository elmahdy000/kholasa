"use client";

import { useState } from "react";
import type { UserManagerClientProps, UserItem } from "./users/types";
import { UserMetricsStrip } from "./users/UserMetricsStrip";
import { UserFilterBar } from "./users/UserFilterBar";
import { UserTable } from "./users/UserTable";
import { EditRoleModal } from "./users/EditRoleModal";
import { CreateUserModal } from "./users/CreateUserModal";
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

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: async () => {},
  });

  // Edit Role Modal State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState("STUDENT");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUserId) {
      alert("لا يمكنك حذف حسابك الحالي المسجل به الآن.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "حذف المستخدم",
      description: `هل أنت متأكد من حذف المستخدم "${userName || "هذا الحساب"}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
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
          setIsCreateOpen(true);
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
        }}
        onDeleteUser={handleDeleteUser}
      />

      {/* 4. Edit Role Modal */}
      <EditRoleModal
        user={selectedUser}
        newRole={newRole}
        setNewRole={setNewRole}
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
        onSubmit={handleCreateUser}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        open={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        confirmText="تأكيد الحذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
}
