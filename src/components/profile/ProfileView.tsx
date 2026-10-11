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
    <div className="max-w-4xl mx-auto space-y-8 text-right font-sans pb-16">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#6858EA] to-[#11B7B4] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-[#6858EA]/25 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#14243D] dark:text-white">
              {user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8] font-bold mt-1">
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
          className="h-10 px-4 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-black flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors self-start sm:self-center"
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm sm:text-base font-black text-[#14243D] dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#6858EA]" />
            <span>المسار التعليمي والصف الدراسي</span>
          </h2>
          {!isEditingAcademic && (
            <button
              onClick={() => setIsEditingAcademic(true)}
              className="text-xs font-bold text-[#6858EA] hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
          )}
        </div>

        {!isEditingAcademic ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                النظام التعليمي
              </span>
              <span className="text-sm font-black text-[#14243D] dark:text-white">
                {user.system?.name || "غير محدد"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                الصف الدراسي
              </span>
              <span className="text-sm font-black text-[#14243D] dark:text-white">
                {user.grade?.name || "غير محدد"}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#14243D] dark:text-slate-200 mb-1.5">
                  النظام التعليمي
                </label>
                <select
                  value={selectedSystemId}
                  onChange={(e) => handleSystemChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-[#14243D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6858EA]"
                >
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14243D] dark:text-slate-200 mb-1.5">
                  الصف الدراسي
                </label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => setSelectedGradeId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-[#14243D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6858EA]"
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
                className="h-10 px-5 rounded-xl bg-[#6858EA] text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-[#6858EA]/25"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>حفظ التعديلات</span>
              </button>
              <button
                onClick={() => setIsEditingAcademic(false)}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 text-right">
          <div className="w-9 h-9 rounded-xl bg-[#6858EA]/10 text-[#6858EA] flex items-center justify-center mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-[#14243D] dark:text-white block">
            {stats.completedLessonsCount}
          </span>
          <span className="text-xs font-bold text-slate-500">
            دروس مكتملة
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 text-right">
          <div className="w-9 h-9 rounded-xl bg-[#11B7B4]/10 text-[#11B7B4] flex items-center justify-center mb-2">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-[#14243D] dark:text-white block">
            {stats.completedExamsCount}
          </span>
          <span className="text-xs font-bold text-slate-500">
            اختبارات منجزة
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 text-right">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-amber-500 block">
            {stats.averageScore}%
          </span>
          <span className="text-xs font-bold text-slate-500">
            متوسط الدرجات
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 text-right">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-emerald-600 block">
            {stats.resolvedMistakesCount}
          </span>
          <span className="text-xs font-bold text-slate-500">
            أخطاء تم تصحيحها
          </span>
        </div>
      </div>

      {/* Bookmarked Lessons */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm sm:text-base font-black text-[#14243D] dark:text-white flex items-center gap-2">
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
                    <h3 className="text-xs sm:text-sm font-black text-[#14243D] dark:text-white">
                      {b.lesson.title}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-bold">
                      {b.lesson.unit.subject.name} • {b.lesson.unit.title}
                    </span>
                  </div>
                  <Link
                    href={`/lessons/${b.lesson.id}`}
                    className="h-8 px-3 rounded-lg bg-[#6858EA]/10 hover:bg-[#6858EA]/20 text-[#6858EA] text-xs font-bold flex items-center gap-1"
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
