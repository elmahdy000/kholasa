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

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right font-sans pb-16">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center text-xl font-bold shadow-2xs shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              {user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
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
          className="h-9 px-3.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors self-start sm:self-center interactive-tap"
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
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#4F46E5] dark:text-indigo-400" />
            <span>المسار التعليمي والصف الدراسي</span>
          </h2>
          {!isEditingAcademic && (
            <button
              onClick={() => setIsEditingAcademic(true)}
              className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
          )}
        </div>

        {!isEditingAcademic ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                النظام التعليمي
              </span>
              <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                {user.system?.name || "غير محدد"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
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
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  النظام التعليمي
                </label>
                <select
                  value={selectedSystemId}
                  onChange={(e) => handleSystemChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
                  الصف الدراسي
                </label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => setSelectedGradeId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
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
                className="h-9 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs interactive-tap"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>حفظ التعديلات</span>
              </button>
              <button
                onClick={() => setIsEditingAcademic(false)}
                className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs text-right">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center mb-2.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#0F172A] dark:text-white block">
            {stats.completedLessonsCount}
          </span>
          <span className="text-xs font-medium text-slate-500">
            دروس مكتملة
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs text-right">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center mb-2.5">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#0F172A] dark:text-white block">
            {stats.completedExamsCount}
          </span>
          <span className="text-xs font-medium text-slate-500">
            اختبارات منجزة
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs text-right">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 block">
            {stats.averageScore}%
          </span>
          <span className="text-xs font-medium text-slate-500">
            متوسط الدرجات
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs text-right">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
            {stats.resolvedMistakesCount}
          </span>
          <span className="text-xs font-medium text-slate-500">
            أخطاء تم تصحيحها
          </span>
        </div>
      </div>

      {/* Bookmarked Lessons */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>الدروس المحفوظة في المفضلة ({bookmarks.length})</span>
        </h2>

        {bookmarks.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bookmarks.map((b) => {
              if (!b.lesson) return null;
              return (
                <div
                  key={b.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                      {b.lesson.title}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {b.lesson.unit.subject.name} • {b.lesson.unit.title}
                    </span>
                  </div>
                  <Link
                    href={`/lessons/${b.lesson.id}`}
                    className="h-8 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-[#4F46E5] dark:text-indigo-400 text-xs font-bold flex items-center gap-1 transition-colors interactive-tap"
                  >
                    <span>فتح الدرس</span>
                    <ArrowLeft className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-2">
            لم تقم بحفظ أي دروس في المفضلة بعد. اضغط على علامة "حفظ" داخل أي درس للوصول إليه سريعاً من هنا.
          </p>
        )}
      </div>
    </div>
  );
}
