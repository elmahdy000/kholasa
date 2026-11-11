"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ShieldCheck, KeyRound, Plus, CheckCircle2, Ban } from "lucide-react";
import { canDeleteUsersRole, isFullAdmin } from "@/lib/roles";
import type {
  UserManagerClientProps,
  UserItem,
  UserActivationFilter,
  UserSubscriptionStatus,
} from "./users/types";
import { UserMetricsStrip } from "./users/UserMetricsStrip";
import { UserFilterBar } from "./users/UserFilterBar";
import { UserTable } from "./users/UserTable";
import { EditRoleModal } from "./users/EditRoleModal";
import { CreateUserModal } from "./users/CreateUserModal";
import { StudentDetailsDrawer } from "./users/StudentDetailsDrawer";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

export type { UserManagerClientProps, UserItem, EducationalSystem, Grade } from "./users/types";

export function UserManagerClient({
  initialUsers,
  systems,
  grades,
  currentUserId,
  currentUserRole,
}: UserManagerClientProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<UserActivationFilter>("all");
  const [selectedSystemId, setSelectedSystemId] = useState("all");
  const [inspectUserId, setInspectUserId] = useState<string | null>(null);

  const suspendedCount = useMemo(
    () => users.filter((u) => u.role === "STUDENT" && u.isActive === false).length,
    [users]
  );
  const trialActiveCount = useMemo(
    () =>
      users.filter(
        (u) => u.role === "STUDENT" && u.isActive !== false && u.subscriptionStatus !== "ACTIVE"
      ).length,
    [users]
  );
  const pendingCount = useMemo(
    () =>
      users.filter(
        (u) => u.role === "STUDENT" && u.subscriptionStatus === "PENDING_VERIFICATION"
      ).length,
    [users]
  );
  const staffCount = useMemo(
    () => users.filter((u) => u.role !== "STUDENT").length,
    [users]
  );
  const studentsCount = useMemo(
    () => users.filter((u) => u.role === "STUDENT").length,
    [users]
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemHighlight?: string;
    confirmText?: string;
    variant?: "danger" | "warning";
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "تأكيد",
    variant: "danger",
    onConfirm: async () => { },
  });

  // Edit Role & Password Modal State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

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
  const [createSubscriptionStatus, setCreateSubscriptionStatus] =
    useState<UserSubscriptionStatus>("ACTIVE");
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

  const assistantUsers = useMemo(
    () => users.filter((u) => u.role === "ASSISTANT"),
    [users]
  );
  const canAdminManageAssistants = isFullAdmin(currentUserRole);
  const canDeleteStudents = canDeleteUsersRole(currentUserRole);

  const handleOpenCreateModal = (presetRole = "STUDENT") => {
    setCreateRole(presetRole);
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
          ...(createRole === "STUDENT" ? { subscriptionStatus: createSubscriptionStatus } : {}),
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
      setCreateSubscriptionStatus("ACTIVE");
      toast.success("تم إنشاء الحساب بنجاح");
    } catch (err: any) {
      setCreateError(err.message || "حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (!canDeleteStudents) {
      toast.error("غير مصرح للمساعد بحذف الطلاب أو المستخدمين — هذه الصلاحية للإدارة فقط.");
      return;
    }
    if (userId === currentUserId) {
      toast.warning("لا يمكنك حذف حسابك الحالي المسجل به الآن.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "حذف المستخدم",
      description: `هل أنت متأكد من حذف هذا الحساب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
      itemHighlight: userName ? `الحساب المستهدف: ${userName}` : undefined,
      confirmText: "تأكيد الحذف",
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          toast.success("تم حذف المستخدم بنجاح");
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
      description: `سيتم مسح الأجهزة المسجلة فوراً وإلغاء الجلسات النشطة ليتمكن الطالب من تسجيل جهازه الجديد.`,
      itemHighlight: userName ? `الطالب المستهدف: ${userName}` : undefined,
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
          toast.success("تم فك ربط أجهزة الطالب بنجاح");
        } else {
          const data = await res.json();
          throw new Error(data.error || "تعذر إعادة ضبط الأجهزة");
        }
      },
    });
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    try {
      const nextStatus = !currentStatus;
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر تحديث حالة الحساب");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                isActive: nextStatus,
                subscriptionStatus: data.user?.subscriptionStatus ?? u.subscriptionStatus,
              }
            : u
        )
      );
      toast.success(
        data.message || (nextStatus ? `تم تفعيل حساب واشتراك الطالب "${userName}" بنجاح` : `تم إيقاف حساب الطالب "${userName}" بنجاح`)
      );
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تحديث حالة الحساب");
    }
  };

  const handleActivateSubscription = async (userId: string, userName: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: "ACTIVE", isActive: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر تفعيل اشتراك الطالب");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                isActive: true,
                subscriptionStatus: data.user?.subscriptionStatus ?? "ACTIVE",
              }
            : u
        )
      );
      toast.success(`تم تفعيل الاشتراك الكامل للطالب "${userName || "المستهدف"}" بنجاح — كل الدروس والامتحانات مفتوحة الآن`);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تفعيل اشتراك الطالب");
    }
  };

  const handleQuickRegenerateCode = async (userId: string, userName: string) => {
    try {
      const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      let newCode = "";
      for (let i = 0; i < 6; i++) {
        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginCode: newCode, isActive: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر تجديد كود الدخول");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loginCode: newCode, isActive: true } : u))
      );
      navigator.clipboard.writeText(newCode);
      toast.success(
        `تم توليد وتفعيل كود الطالب "${userName || "المستهدف"}" بنجاح (${newCode}) وتم نسخه للحافظة! 📋`
      );
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تجديد كود الدخول");
    }
  };

  const handleBulkActivateStudents = () => {
    const targetStudents = users.filter(
      (u) => u.role === "STUDENT" && (u.isActive === false || u.subscriptionStatus !== "ACTIVE")
    );
    const count = targetStudents.length;

    if (count === 0) {
      toast.info("جميع حسابات واشتراكات الطلاب مفعلة بالكامل بالفعل!");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "تفعيل جماعي لحسابات واشتراكات الطلاب",
      description: `سيتم تفعيل جميع حسابات الطلاب ومنحها الاشتراك الكامل (${count} طالب)، ليتمكن كل طالب من الدخول وفتح كافة الدروس والامتحانات مباشرة.`,
      confirmText: `تأكيد تفعيل ${count} طالب`,
      variant: "warning",
      onConfirm: async () => {
        const res = await fetch("/api/admin/users/bulk-toggle-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true, role: "STUDENT", activateSubscription: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر تفعيل الطلاب");

        setUsers((prev) =>
          prev.map((u) =>
            u.role === "STUDENT"
              ? { ...u, isActive: true, subscriptionStatus: "ACTIVE" }
              : u
          )
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        toast.success(data.message || `تم تفعيل ${count} طالب بالاشتراك الكامل بنجاح`);
      },
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedRole !== "all") {
        if (selectedRole === "STAFF" && u.role === "STUDENT") return false;
        if (selectedRole !== "STAFF" && u.role !== selectedRole) return false;
      }
      if (selectedStatus === "inactive" && u.isActive !== false) return false;
      if (selectedStatus === "subscribed") {
        if (u.role !== "STUDENT" || u.isActive === false || u.subscriptionStatus !== "ACTIVE") return false;
      }
      if (selectedStatus === "trial_active") {
        if (u.role !== "STUDENT" || u.isActive === false || u.subscriptionStatus === "ACTIVE") return false;
      }
      if (selectedStatus === "pending_verification") {
        if (u.role !== "STUDENT" || u.subscriptionStatus !== "PENDING_VERIFICATION") return false;
      }
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
  }, [users, selectedRole, selectedStatus, selectedSystemId, searchQuery]);

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

      {/* Dedicated Assistant Account Panel (Admins) / Permission Notice (Assistant) */}
      {canAdminManageAssistants ? (
        <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-[#D97706] dark:text-[#FBBF24]" />
                <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                  حساب المساعد الإداري
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  كل الصلاحيات ماعدا حذف الطلاب
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                يمكنك كأدمن تغيير بيانات الدخول، كلمة المرور، البريد، أو إيقاف وتفعيل حساب المساعد في أي وقت.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreateError(null);
                handleOpenCreateModal("ASSISTANT");
              }}
              className="h-9 px-3.5 rounded-xl bg-[#091B40] hover:bg-[#1E3A8A] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#E9AD32]" />
              <span>إضافة حساب مساعد</span>
            </button>
          </div>

          {assistantUsers.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-dashed border-[#CBD5E1] dark:border-[#334155] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-[#475569] dark:text-[#94A3B8]">
                لا يوجد حساب مساعد مسجل حالياً.
              </span>
              <button
                type="button"
                onClick={() => {
                  setCreateError(null);
                  handleOpenCreateModal("ASSISTANT");
                }}
                className="h-8 px-3 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white font-bold cursor-pointer"
              >
                إنشاء حساب المساعد الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assistantUsers.map((assistant) => (
                <div
                  key={assistant.id}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0F172A] dark:text-white truncate">
                        {assistant.name || "المساعد الإداري"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          assistant.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                        }`}
                      >
                        {assistant.isActive !== false ? "مفعّل" : "موقوف"}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate" dir="ltr">
                      {[assistant.email, assistant.phone].filter(Boolean).join(" • ") || "بدون بريد أو هاتف"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(assistant)}
                      className="h-8 px-3 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>تغيير البيانات / الباسورد</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleStatus(
                          assistant.id,
                          assistant.isActive !== false,
                          assistant.name || "المساعد الإداري"
                        )
                      }
                      className={`h-8 px-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                        assistant.isActive === false
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#94A3B8] hover:text-rose-600"
                      }`}
                    >
                      {assistant.isActive === false ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تفعيل</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-3.5 h-3.5 text-rose-500" />
                          <span>إيقاف</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 flex items-center gap-2.5 text-xs font-bold text-amber-900 dark:text-amber-200"
        >
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            أنت مسجل بحساب المساعد الإداري — متاح لك كافة الصلاحيات وتعديل وتفعيل حسابات الطلاب، باستثناء حذف حسابات الطلاب أو تعديل حسابات الإدارة.
          </span>
        </div>
      )}

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
        selectedStatus={selectedStatus}
        setSelectedStatus={(s) => {
          setSelectedStatus(s);
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
        suspendedCount={suspendedCount}
        trialActiveCount={trialActiveCount}
        pendingCount={pendingCount}
        staffCount={staffCount}
        studentsCount={studentsCount}
        onOpenCreate={() => {
          handleOpenCreateModal();
          setCreateError(null);
        }}
        onOpenBulkActivation={handleBulkActivateStudents}
      />

      {/* 3. Users Table */}
      <UserTable
        users={paginatedUsers}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onSelectUserToEdit={(u) => {
          setSelectedUser(u);
        }}
        onDeleteUser={handleDeleteUser}
        onResetDevices={handleResetDevices}
        onInspectUser={(id) => setInspectUserId(id)}
        onToggleStatus={handleToggleStatus}
        onActivateSubscription={handleActivateSubscription}
        onQuickRegenerateCode={handleQuickRegenerateCode}
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

      {/* 4. Edit Role & Password Modal */}
      <EditRoleModal
        user={selectedUser}
        currentUserRole={currentUserRole}
        onClose={() => setSelectedUser(null)}
        onUserSaved={(updatedUser) => {
          setUsers((prev) =>
            prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
          );
        }}
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
        createSubscriptionStatus={createSubscriptionStatus}
        setCreateSubscriptionStatus={setCreateSubscriptionStatus}
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
        itemHighlight={confirmModal.itemHighlight}
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
        onUserUpdated={async () => {
          if (inspectUserId) {
            try {
              const res = await fetch(`/api/admin/users/${inspectUserId}`);
              const data = await res.json();
              if (data.user) {
                setUsers((prev) =>
                  prev.map((u) => (u.id === inspectUserId ? { ...u, ...data.user } : u))
                );
              }
            } catch { }
          }
        }}
      />
    </div>
  );
}
