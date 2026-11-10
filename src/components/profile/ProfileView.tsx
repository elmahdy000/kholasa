"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAnyDemoCode } from "@/lib/demo-shared";
import type { ProfileViewProps } from "./types";
import { ProfileHeaderCard } from "./ProfileHeaderCard";
import { AcademicSetupCard } from "./AcademicSetupCard";
import { PasswordChangeCard } from "./PasswordChangeCard";
import { ProfileStatsGrid } from "./ProfileStatsGrid";
import { BookmarksListCard } from "./BookmarksListCard";
import { DeviceSecurityCard } from "./DeviceSecurityCard";

export type { ProfileViewProps, Grade, EducationalSystem, BookmarkItem } from "./types";

export function ProfileView({
  user,
  stats,
  bookmarks,
  systems,
}: ProfileViewProps) {
  const router = useRouter();
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [selectedSystemId, setSelectedSystemId] = useState(
    user.system?.id || (systems[0]?.id ?? "")
  );
  const [selectedGradeId, setSelectedGradeId] = useState(
    user.grade?.id || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [academicError, setAcademicError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleSystemChange = (sysId: string) => {
    setSelectedSystemId(sysId);
    const target = systems.find((s) => s.id === sysId);
    if (target && target.grades.length > 0) {
      setSelectedGradeId(target.grades[0].id);
    }
  };

  const handleSaveAcademic = async () => {
    setIsSaving(true);
    setAcademicError(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId: selectedSystemId,
          gradeId: selectedGradeId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "تعذر حفظ التعديلات، يرجى المحاولة مرة أخرى");
      }

      setIsEditingAcademic(false);
      router.refresh();
    } catch (err) {
      setAcademicError(
        err instanceof Error ? err.message : "تعذر حفظ التعديلات، يرجى المحاولة مرة أخرى"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordStatus({
        type: "error",
        text: "كلمتا المرور الجديدتان غير متطابقتين",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "تعذر تغيير كلمة المرور");
      }

      setPasswordForm({ current: "", next: "", confirm: "" });
      setPasswordStatus({
        type: "success",
        text: data.message || "تم تغيير كلمة المرور بنجاح",
      });
    } catch (err) {
      setPasswordStatus({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "تعذر تغيير كلمة المرور، حاول مرة أخرى",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isDemoSession = isAnyDemoCode(user.loginCode);

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right font-sans pb-28">
      {/* 1. Profile Header */}
      <ProfileHeaderCard
        user={user}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />

      {/* 2. Device Security Status (Real Students only) */}
      {user.role === "STUDENT" && !isDemoSession && (
        <DeviceSecurityCard
          maxDevices={user.maxDevices || 2}
          boundDevicesCount={user.boundDevices?.length || 0}
        />
      )}

      {/* 3. Academic Setup */}
      <AcademicSetupCard
        userSystemName={user.system?.name}
        userGradeName={user.grade?.name}
        userSchoolCategory={user.schoolCategory}
        isEditingAcademic={isEditingAcademic}
        selectedSystemId={selectedSystemId}
        selectedGradeId={selectedGradeId}
        isSaving={isSaving}
        saveError={academicError}
        systems={systems}
        onStartEditing={() => {
          setAcademicError(null);
          setIsEditingAcademic(true);
        }}
        onCancelEditing={() => {
          setAcademicError(null);
          setIsEditingAcademic(false);
        }}
        onSystemChange={handleSystemChange}
        onGradeChange={setSelectedGradeId}
        onSaveAcademic={handleSaveAcademic}
      />

      {/* 4. Password Change (Hidden for passwordless demo sandboxes) */}
      {!isDemoSession && (
        <PasswordChangeCard
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
          isChangingPassword={isChangingPassword}
          passwordStatus={passwordStatus}
          onSubmit={handleChangePassword}
        />
      )}

      {/* 4. Statistics Cards */}
      <ProfileStatsGrid stats={stats} />

      {/* 5. Bookmarked Lessons */}
      <BookmarksListCard bookmarks={bookmarks} />
    </div>
  );
}
