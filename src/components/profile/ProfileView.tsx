"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Bookmark,
  Trophy,
  CheckCircle2,
  Clock,
  LogOut,
  Edit2,
  Loader2,
  ArrowLeft,
  Sparkles,
  BookOpen,
  KeyRound,
} from "lucide-react";

interface Grade {
  id: string;
  name: string;
  code: string;
}

interface EducationalSystem {
  id: string;
  name: string;
  code: string;
  grades: Grade[];
}

interface BookmarkItem {
  id: string;
  lesson?: {
    id: string;
    title: string;
    unit: {
      title: string;
      subject: { name: string };
    };
  } | null;
}

interface ProfileViewProps {
  user: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    system?: { id: string; name: string } | null;
    grade?: { id: string; name: string } | null;
  };
  stats: {
    completedLessonsCount: number;
    completedExamsCount: number;
    averageScore: number;
    resolvedMistakesCount: number;
  };
  bookmarks: BookmarkItem[];
  systems: EducationalSystem[];
}

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

  const currentGrades =
    systems.find((s) => s.id === selectedSystemId)?.grades || [];

  const handleSystemChange = (sysId: string) => {
    setSelectedSystemId(sysId);
    const target = systems.find((s) => s.id === sysId);
    if (target && target.grades.length > 0) {
      setSelectedGradeId(target.grades[0].id);
    }
  };

  const handleSaveAcademic = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId: selectedSystemId,
          gradeId: selectedGradeId,
        }),
      });

      if (res.ok) {
        setIsEditingAcademic(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
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

  const handleLogout = async () => {    setIsLoggingOut(true);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right font-sans pb-28">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-7 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#800020] text-white flex items-center justify-center text-xl font-bold  shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              {user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
              {user.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span dir="ltr">{user.email}</span>
                </span>
              )}
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span dir="ltr">{user.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#F87171]/40 text-[#DC2626] dark:text-[#F87171] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors self-start sm:self-center interactive-tap"
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* Academic Setup Card */}
      <div className="p-6 sm:p-7 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
            <span>المسار التعليمي والصف الدراسي</span>
          </h2>
          {!isEditingAcademic && (
            <button
              onClick={() => setIsEditingAcademic(true)}
              className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
          )}
        </div>

        {!isEditingAcademic ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">
                النظام التعليمي
              </span>
              <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                {user.system?.name || "غير محدد"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">
                الصف الدراسي
              </span>
              <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                {user.grade?.name || "غير محدد"}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2">
                  النظام التعليمي
                </label>
                <select
                  value={selectedSystemId}
                  onChange={(e) => handleSystemChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
                >
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2">
                  الصف الدراسي
                </label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => setSelectedGradeId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
                >
                  {currentGrades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAcademic}
                disabled={isSaving}
                className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2  interactive-tap"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>حفظ التعديلات</span>
              </button>
              <button
                onClick={() => setIsEditingAcademic(false)}
                className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password Change Card */}
      <div className="p-6 sm:p-7 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <KeyRound className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
          <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
            تغيير كلمة المرور
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="current-password"
                className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2"
              >
                كلمة المرور الحالية
              </label>
              <input
                id="current-password"
                type="password"
                required
                autoComplete="current-password"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    current: e.target.value,
                  }))
                }
                className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2"
              >
                كلمة المرور الجديدة
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={passwordForm.next}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    next: e.target.value,
                  }))
                }
                className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2"
              >
                تأكيد كلمة المرور
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirm: e.target.value,
                  }))
                }
                className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>
          </div>

          {passwordStatus && (
            <p
              role="alert"
              className={`text-[13px] font-bold ${
                passwordStatus.type === "success"
                  ? "text-[#059669] dark:text-[#34D399]"
                  : "text-[#DC2626] dark:text-[#F87171]"
              }`}
            >
              {passwordStatus.text}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="h-11 px-5 rounded-lg bg-[#800020] hover:bg-[#66001A] disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2 transition-colors"
            >
              {isChangingPassword && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span>تحديث كلمة المرور</span>
            </button>
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              سيتم تسجيل الخروج من الأجهزة الأخرى.
            </span>
          </div>
        </form>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  text-right">
          <div className="w-11 h-11 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center mb-3">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#0F172A] dark:text-white block">
            {stats.completedLessonsCount}
          </span>
          <span className="text-[13px] font-medium text-[#64748B]">
            دروس مكتملة
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  text-right">
          <div className="w-11 h-11 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center mb-3">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#0F172A] dark:text-white block">
            {stats.completedExamsCount}
          </span>
          <span className="text-[13px] font-medium text-[#64748B]">
            اختبارات منجزة
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  text-right">
          <div className="w-11 h-11 rounded-lg bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#D97706] dark:text-[#FBBF24] block">
            {stats.averageScore}%
          </span>
          <span className="text-[13px] font-medium text-[#64748B]">
            متوسط الدرجات
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  text-right">
          <div className="w-11 h-11 rounded-lg bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#059669] dark:text-[#34D399] block">
            {stats.resolvedMistakesCount}
          </span>
          <span className="text-[13px] font-medium text-[#64748B]">
            أخطاء تم تصحيحها
          </span>
        </div>
      </div>

      {/* Bookmarked Lessons */}
      <div className="p-6 sm:p-7 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[#D97706] fill-[#D97706]" />
          <span>الدروس المحفوظة في المفضلة ({bookmarks.length})</span>
        </h2>

        {bookmarks.length > 0 ? (
          <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {bookmarks.map((b) => {
              if (!b.lesson) return null;
              return (
                <div
                  key={b.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white">
                      {b.lesson.title}
                    </h3>
                    <span className="text-[13px] text-[#64748B] font-medium">
                      {b.lesson.unit.subject.name} • {b.lesson.unit.title}
                    </span>
                  </div>
                  <Link
                    href={`/lessons/${b.lesson.id}`}
                    className="h-11 px-3 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] hover:bg-[#800020]/10 dark:hover:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold flex items-center gap-1 transition-colors interactive-tap"
                  >
                    <span>فتح الدرس</span>
                    <ArrowLeft className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] py-2">
            لم تقم بحفظ أي دروس في المفضلة بعد. اضغط على علامة "حفظ" داخل أي درس للوصول إليه سريعاً من هنا.
          </p>
        )}
      </div>
    </div>
  );
}
