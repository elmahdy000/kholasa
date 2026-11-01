"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  GraduationCap,
  KeyRound,
  RotateCcw,
  Smartphone,
  Trophy,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Shield,
  Loader2,
  Save,
  Check,
  Copy,
  RefreshCw,
  BarChart3,
  Printer,
  Send,
  Share2,
  Award,
  TrendingUp,
  Sparkles,
  FileText,
} from "lucide-react";
import type { EducationalSystem, Grade } from "./types";

interface StudentDetailsDrawerProps {
  userId: string | null;
  systems: EducationalSystem[];
  grades: Grade[];
  onClose: () => void;
  onUserUpdated: () => void;
}

interface DetailedStudent {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  loginCode: string | null;
  role: string;
  schoolCategory: "ARABIC" | "LANGUAGES";
  maxDevices: number;
  boundDevices: string[];
  createdAt: string;
  system: { id: string; name: string } | null;
  grade: { id: string; name: string } | null;
  track: { id: string; name: string } | null;
  stats: {
    completedLessons: number;
    totalAttempts: number;
    averageScore: number;
    totalMistakes: number;
    resolvedMistakes: number;
    activeDevicesCount: number;
    totalTimeSpentMinutes?: number;
    lastActiveAt?: string | null;
    subjectStats?: Array<{
      subjectName: string;
      attemptsCount: number;
      averageScore: number;
      completedLessons: number;
      totalMistakes: number;
    }>;
  };
  attempts: Array<{
    id: string;
    title: string | null;
    score: number;
    percentage: number;
    timeSpentSeconds: number | null;
    isCompleted: boolean;
    startedAt: string;
    completedAt: string | null;
    mode: string;
    exam: {
      id: string;
      title: string;
      isPractice: boolean;
      subject: { name: string } | null;
    } | null;
  }>;
  progress: Array<{
    id: string;
    isCompleted: boolean;
    progressPercent: number;
    lastAccessedAt: string;
    lesson: {
      id: string;
      title: string;
      unit: {
        title: string;
        subject: { name: string } | null;
      } | null;
    } | null;
  }>;
  mistakes: Array<{
    id: string;
    wrongCount: number;
    isResolved: boolean;
    lastAttemptAt: string;
    question: {
      id: string;
      statement: string;
      type: string;
      difficulty: string;
      subject: { name: string } | null;
    } | null;
  }>;
  sessions: Array<{
    id: string;
    deviceId: string | null;
    expires: string;
    createdAt: string;
  }>;
}

export function StudentDetailsDrawer({
  userId,
  systems,
  grades,
  onClose,
  onUserUpdated,
}: StudentDetailsDrawerProps) {
  const [student, setStudent] = useState<DetailedStudent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "exams" | "mistakes" | "lessons" | "security">("overview");
  const [copiedReport, setCopiedReport] = useState(false);

  // Edit basic info state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [systemId, setSystemId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [schoolCategory, setSchoolCategory] = useState<"ARABIC" | "LANGUAGES">("ARABIC");
  const [maxDevices, setMaxDevices] = useState(1);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const generateRandomCode = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let res = "";
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setLoginCode(res);
  };

  // Password reset state
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Device reset state
  const [isResettingDevices, setIsResettingDevices] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    async function fetchStudent() {
      setIsLoading(true);
      setInfoMessage(null);
      setPasswordMessage(null);
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const data = await res.json();
        if (res.ok && data.user && isMounted) {
          const u = data.user as DetailedStudent;
          setStudent(u);
          setName(u.name || "");
          setPhone(u.phone || "");
          setEmail(u.email || "");
          setLoginCode(u.loginCode || "");
          setSystemId(u.system?.id || "");
          setGradeId(u.grade?.id || "");
          setSchoolCategory(u.schoolCategory || "ARABIC");
          setMaxDevices(u.maxDevices || 2);
        }
      } catch (err) {
        console.error("Failed to load student details:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchStudent();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (!userId) return null;

  const currentGrades = grades.filter((g) => !systemId || g.systemId === systemId);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    setInfoMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          loginCode: loginCode.trim().toUpperCase() || undefined,
          systemId: systemId || undefined,
          gradeId: gradeId || undefined,
          schoolCategory,
          maxDevices,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر حفظ البيانات");

      setInfoMessage({ type: "success", text: "تم تحديث بيانات الطالب بنجاح" });
      onUserUpdated();
    } catch (err) {
      setInfoMessage({
        type: "error",
        text: err instanceof Error ? err.message : "حدث خطأ أثناء حفظ البيانات",
      });
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "كلمة المرور يجب أن لا تقل عن 8 أحرف" });
      return;
    }

    setIsResettingPassword(true);
    setPasswordMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر إعادة تعيين كلمة المرور");

      setPasswordMessage({ type: "success", text: "تم تغيير كلمة المرور بنجاح وإلغاء الجلسات النشطة" });
      setNewPassword("");
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err instanceof Error ? err.message : "حدث خطأ أثناء تغيير كلمة المرور",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleResetDevices = async () => {
    if (!confirm("هل أنت متأكد من فك ربط جميع أجهزة هذا الطالب؟")) return;

    setIsResettingDevices(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-devices`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر فك الأجهزة");

      setStudent((prev) => (prev ? { ...prev, boundDevices: [], stats: { ...prev.stats, activeDevicesCount: 0 } } : prev));
      onUserUpdated();
      alert("تم فك ربط أجهزة الطالب بنجاح");
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ أثناء فك الأجهزة");
    } finally {
      setIsResettingDevices(false);
    }
  };

  const generateWhatsAppReportText = (s: DetailedStudent) => {
    const avg = s.stats.averageScore;
    const rating =
      avg >= 85
        ? "ممتاز 🌟"
        : avg >= 70
        ? "جيد جداً 📈"
        : avg >= 50
        ? "جيد (يحتاج لمزيد من التدريب) 💡"
        : "يحتاج لمتابعة وتكثيف المذاكرة ⚠️";

    const hours = Math.floor((s.stats.totalTimeSpentMinutes || 0) / 60);
    const mins = (s.stats.totalTimeSpentMinutes || 0) % 60;
    const timeStr = hours > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${mins} دقيقة`;

    let subjectLines = "";
    if (s.stats.subjectStats && s.stats.subjectStats.length > 0) {
      subjectLines = s.stats.subjectStats
        .map(
          (sub) =>
            `▪️ *${sub.subjectName}*: متوسط ${sub.averageScore}% (${sub.attemptsCount} امتحانات | ${sub.completedLessons} دروس)`
        )
        .join("\n");
    } else {
      subjectLines = "▪️ جاري تسجيل المحاولات الأولى في المواد المقررة.";
    }

    return `*📊 تقرير المتابعة الأكاديمية - منصة الخلاصة*

*👤 بيانات الطالب:*
• الاسم: ${s.name || "طالب"}
• كود المنصة: ${s.loginCode || "—"}
• نوع المدرسة: ${s.schoolCategory === "LANGUAGES" ? "لغات (Languages)" : "عربي"}
• الصف: ${s.grade?.name || "الصف الثاني الثانوي"}

*📈 ملخص الأداء والتحصيل:*
• التقييم التراكمي العام: *${avg}%* (${rating})
• عدد الامتحانات المنجزة: *${s.stats.totalAttempts}* امتحان
• الدروس المكتملة: *${s.stats.completedLessons}* درس
• إجمالي وقت التدريب: *${timeStr}*
• بنك الأخطاء المعالجة: *${s.stats.resolvedMistakes}* من *${s.stats.totalMistakes}*

*📚 تفصيل أداء المواد:*
${subjectLines}

*🔐 الأجهزة المعتمدة:*
• ${s.boundDevices.length} من أصل ${s.maxDevices} جهاز مسموح به.

*💡 توصيات المشرف الأكاديمي:*
${
  avg >= 80
    ? "مستوى متميز والتزام مستمر، نوصي بالمحافظة على جدول الامتحانات الأسبوعي."
    : s.stats.totalAttempts > 0
    ? "الطالب يتفاعل بشكل إيجابي، ويُنصح بمراجعة بنك الأخطاء وتكرار حل الأسئلة غير المتقنة."
    : "تم تفعيل كود الطالب بنجاح، ويُرجى توجيهه للبدء في حل الامتحانات المتاحة على المنصة."
}

_منصة الخلاصة التعليمية - رفيقكم نحو التفوق_ 🎓`;
  };

  const handleCopyReport = async () => {
    if (!student) return;
    const text = generateWhatsAppReportText(student);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch {
      alert("تعذر نسخ النص تلقائياً");
    }
  };

  const handleSendWhatsApp = () => {
    if (!student) return;
    const text = generateWhatsAppReportText(student);
    let phoneNum = (student.phone || "").replace(/\D/g, "");
    if (phoneNum.startsWith("0")) {
      phoneNum = "2" + phoneNum;
    } else if (!phoneNum.startsWith("20") && phoneNum.length === 10) {
      phoneNum = "20" + phoneNum;
    }
    const url = `https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#0F172A] h-full shadow-2xl flex flex-col text-right font-sans border-r border-[#E2E8F0] dark:border-[#334155] animate-in slide-in-from-left duration-200"
        dir="rtl"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between shrink-0 bg-[#F8FAFC]/50 dark:bg-[#1E293B]/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#800020] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
              {(student?.name || "ط").charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                  {student?.name || "تفاصيل الطالب"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] border border-[#800020]/20">
                  {student?.role === "STUDENT" ? "طالب" : student?.role}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {student?.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}
                </span>
                {student?.loginCode && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(student.loginCode!);
                      alert(`تم نسخ كود الطالب: ${student.loginCode}`);
                    }}
                    title="انقر لنسخ كود الدخول"
                    className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#800020]/10 hover:bg-[#800020]/20 text-[#800020] dark:text-[#FB7185] border border-[#800020]/20 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>كود: {student.loginCode}</span>
                    <Copy className="w-3 h-3 opacity-60" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 font-mono">
                <span>{student?.phone || "بدون هاتف"}</span>
                {student?.email && <span>• {student.email}</span>}
                <span>• انضم في {student ? new Date(student.createdAt).toLocaleDateString("ar-EG") : "—"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Strip */}
        {student && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/20 text-center shrink-0">
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">متوسط الدرجات</span>
              <span className="text-base font-bold text-[#0F172A] dark:text-white font-mono">
                {student.stats.averageScore}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">الامتحانات</span>
              <span className="text-base font-bold text-[#0F172A] dark:text-white font-mono">
                {student.stats.totalAttempts}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">الدروس المنجزة</span>
              <span className="text-base font-bold text-[#0F172A] dark:text-white font-mono">
                {student.stats.completedLessons}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">بنك الأخطاء</span>
              <span className="text-base font-bold text-[#DC2626] dark:text-[#F87171] font-mono">
                {student.stats.totalMistakes}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">الأجهزة المعتمدة</span>
              <span className="text-base font-bold text-[#800020] dark:text-[#FB7185] font-mono">
                {student.boundDevices.length} / {student.maxDevices}
              </span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8F0] dark:border-[#334155] px-6 gap-6 shrink-0 bg-white dark:bg-[#0F172A] overflow-x-auto text-[13px] font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "border-[#800020] text-[#800020] dark:border-[#FB7185] dark:text-[#FB7185]"
                : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
            }`}
          >
            البيانات والتحكم
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "analytics"
                ? "border-[#800020] text-[#800020] dark:border-[#FB7185] dark:text-[#FB7185]"
                : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>تقرير وإحصائيات الطالب 📊</span>
          </button>
          <button
            onClick={() => setActiveTab("exams")}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "exams"
                ? "border-[#800020] text-[#800020] dark:border-[#FB7185] dark:text-[#FB7185]"
                : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
            }`}
          >
            سجل الامتحانات ({student?.attempts.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("mistakes")}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "mistakes"
                ? "border-[#800020] text-[#800020] dark:border-[#FB7185] dark:text-[#FB7185]"
                : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
            }`}
          >
            بنك الأخطاء ({student?.mistakes.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("lessons")}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "lessons"
                ? "border-[#800020] text-[#800020] dark:border-[#FB7185] dark:text-[#FB7185]"
                : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
            }`}
          >
            الدروس المنجزة ({student?.progress.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "security"
                ? "border-[#800020] text-[#800020] dark:border-[#FB7185] dark:text-[#FB7185]"
                : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
            }`}
          >
            الأجهزة والجلسات ({student?.boundDevices.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#64748B]">
              <Loader2 className="w-8 h-8 animate-spin text-[#800020]" />
              <p className="text-sm font-medium">جاري جلب الملف الشامل للطالب...</p>
            </div>
          ) : !student ? (
            <p className="text-center text-sm text-[#64748B] py-12">تعذر العثور على بيانات الطالب</p>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & CONTROLS */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Basic Info Form */}
                  <div className="bg-[#F8FAFC] dark:bg-[#1E293B]/30 p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                    <h3 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-[#800020]" />
                      <span>تعديل البيانات الأساسية والأكاديمية</span>
                    </h3>

                    {infoMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs font-bold ${
                          infoMessage.type === "success"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {infoMessage.text}
                      </div>
                    )}

                    <form onSubmit={handleSaveInfo} className="space-y-4 text-xs font-bold">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#64748B] mb-1.5">اسم الطالب</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[#64748B] mb-1.5">رقم الهاتف</label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] font-mono text-left"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="block text-[#64748B] mb-1.5">البريد الإلكتروني</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-left"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[#64748B]">كود الدخول المباشر (Login Code)</label>
                            <button
                              type="button"
                              onClick={generateRandomCode}
                              className="text-[11px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>توليد كود</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={loginCode}
                            onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                            maxLength={12}
                            placeholder="مثال: J9KFQY"
                            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] font-mono font-bold text-center tracking-widest text-[#800020] dark:text-[#FB7185]"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="block text-[#64748B] mb-1.5">نوع المدرسة / المسار</label>
                          <select
                            value={schoolCategory}
                            onChange={(e) => setSchoolCategory(e.target.value as "ARABIC" | "LANGUAGES")}
                            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]"
                          >
                            <option value="ARABIC">مدارس عربي (Arabic)</option>
                            <option value="LANGUAGES">مدارس لغات (Languages)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#64748B] mb-1.5">النظام التعليمي</label>
                          <select
                            value={systemId}
                            onChange={(e) => {
                              setSystemId(e.target.value);
                              setGradeId("");
                            }}
                            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]"
                          >
                            <option value="">غير محدد</option>
                            {systems.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#64748B] mb-1.5">الصف الدراسي</label>
                          <select
                            value={gradeId}
                            onChange={(e) => setGradeId(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]"
                          >
                            <option value="">غير محدد</option>
                            {currentGrades.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#64748B] mb-1.5">الحد الأقصى للأجهزة المصرح بها</label>
                          <select
                            value={maxDevices}
                            onChange={(e) => setMaxDevices(Number(e.target.value))}
                            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] font-bold"
                          >
                            <option value={1}>جهاز واحد فقط (الافتراضي - منع مشاركة الحساب)</option>
                            <option value={2}>جهازين (تصريح إضافي للطالب)</option>
                            <option value={3}>3 أجهزة (استثناء خاص)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingInfo}
                          className="h-10 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          {isSavingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>حفظ التعديلات</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Password Reset Section */}
                  <div className="bg-[#F8FAFC] dark:bg-[#1E293B]/30 p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                    <h3 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#800020]" />
                      <span>إعادة تعيين كلمة المرور للطالب مباشرة</span>
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      تغيير كلمة المرور من هنا سيسري فوراً وسيلغي جميع الجلسات القديمة المسجلة بحساب الطالب.
                    </p>

                    {passwordMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs font-bold ${
                          passwordMessage.type === "success"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {passwordMessage.text}
                      </div>
                    )}

                    <form onSubmit={handleResetPassword} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="أدخل كلمة المرور الجديدة (8 أحرف على الأقل)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1 h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-bold text-left font-mono"
                        dir="ltr"
                      />
                      <button
                        type="submit"
                        disabled={isResettingPassword || !newPassword}
                        className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {isResettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        <span>تعيين كلمة المرور</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: STUDENT ANALYTICS & REPORT CARD */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#800020]/10 via-[#800020]/5 to-transparent border border-[#800020]/20">
                    <div>
                      <h3 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
                        <span>كشف درجات وتقرير ولي الأمر المعتمد</span>
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                        تقرير أكاديمي مخصص وجاهز للمشاركة المباشرة عبر واتساب أو الطباعة الورقية
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyReport}
                        className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          copiedReport
                            ? "bg-emerald-600 text-white"
                            : "bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white hover:bg-slate-50 dark:hover:bg-[#1E293B]"
                        }`}
                        title="نسخ تقرير ولي الأمر إلى الحافظة"
                      >
                        {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />}
                        <span>{copiedReport ? "تم نسخ التقرير!" : "نسخ التقرير"}</span>
                      </button>

                      {student.phone && (
                        <button
                          type="button"
                          onClick={handleSendWhatsApp}
                          className="h-9 px-3.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="فتح واتساب وإرسال التقرير لولي الأمر فوراً"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال واتساب</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handlePrintReport}
                        className="h-9 px-3.5 rounded-xl text-xs font-bold bg-[#800020] hover:bg-[#66001A] text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="طباعة كشف الدرجات الرسمي"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة الكشف</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Main Analytics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
                    <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">متوسط النسبة العامة</span>
                      <div className="my-2">
                        <span className="text-2xl font-bold font-mono text-[#0F172A] dark:text-white">
                          {student.stats.averageScore}%
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block w-fit ${
                          student.stats.averageScore >= 85
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : student.stats.averageScore >= 70
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                            : student.stats.averageScore >= 50
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {student.stats.averageScore >= 85
                          ? "ممتاز 🌟"
                          : student.stats.averageScore >= 70
                          ? "جيد جداً 📈"
                          : student.stats.averageScore >= 50
                          ? "جيد (يحتاج دعم) 💡"
                          : "يحتاج تكثيف المذاكرة ⚠️"}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">إجمالي وقت التدريب</span>
                      <div className="my-2">
                        <span className="text-2xl font-bold font-mono text-[#0F172A] dark:text-white">
                          {student.stats.totalTimeSpentMinutes || 0}
                        </span>
                        <span className="text-xs text-[#64748B] mr-1">دقيقة</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] font-mono">
                        عبر {student.stats.totalAttempts} امتحانات منفذة
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">الدروس المنجزة</span>
                      <div className="my-2">
                        <span className="text-2xl font-bold font-mono text-[#0F172A] dark:text-white">
                          {student.stats.completedLessons}
                        </span>
                        <span className="text-xs text-[#64748B] mr-1">درس</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        إتقان 100% للشروحات
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">بنك الأخطاء والإتقان</span>
                      <div className="my-2">
                        <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                          {student.stats.totalMistakes - student.stats.resolvedMistakes}
                        </span>
                        <span className="text-xs text-[#64748B] mr-1">متبقي</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        تم تصحيح {student.stats.resolvedMistakes} من {student.stats.totalMistakes}
                      </span>
                    </div>
                  </div>

                  {/* Subject-by-Subject Breakdown Table */}
                  <div className="bg-[#F8FAFC] dark:bg-[#1E293B]/30 p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
                        <span>تحليل وإحصائيات المواد الدراسية بالتفصيل</span>
                      </h4>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        {student.stats.subjectStats?.length || 0} مواد نشطة
                      </span>
                    </div>

                    {!student.stats.subjectStats || student.stats.subjectStats.length === 0 ? (
                      <div className="text-center py-8 text-xs text-[#64748B] dark:text-[#94A3B8] border border-dashed border-[#E2E8F0] dark:border-[#334155] rounded-xl">
                        لم يتم تسجيل أي محاولات امتحانية أو تفاعل دروس في المواد حتى الآن.
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden bg-white dark:bg-[#0F172A]">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] font-bold border-b border-[#E2E8F0] dark:border-[#334155]">
                            <tr>
                              <th className="p-3">المادة الدراسية</th>
                              <th className="p-3">الامتحانات</th>
                              <th className="p-3">متوسط الدرجة</th>
                              <th className="p-3">الدروس المنجزة</th>
                              <th className="p-3">الأخطاء</th>
                              <th className="p-3">مستوى الطالب</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/60 font-bold">
                            {student.stats.subjectStats.map((sub) => (
                              <tr key={sub.subjectName} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-[#1E293B]/20">
                                <td className="p-3 text-[#0F172A] dark:text-white flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#800020]" />
                                  <span>{sub.subjectName}</span>
                                </td>
                                <td className="p-3 font-mono text-[#64748B]">
                                  {sub.attemptsCount}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] min-w-[36px]">
                                      {sub.averageScore}%
                                    </span>
                                    <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          sub.averageScore >= 85
                                            ? "bg-emerald-500"
                                            : sub.averageScore >= 70
                                            ? "bg-blue-500"
                                            : sub.averageScore >= 50
                                            ? "bg-amber-500"
                                            : "bg-rose-500"
                                        }`}
                                        style={{ width: `${sub.averageScore}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400">
                                  {sub.completedLessons}
                                </td>
                                <td className="p-3 font-mono text-rose-600 dark:text-rose-400">
                                  {sub.totalMistakes}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] ${
                                      sub.averageScore >= 85
                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                        : sub.averageScore >= 70
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                        : sub.averageScore >= 50
                                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                                    }`}
                                  >
                                    {sub.averageScore >= 85
                                      ? "متميز"
                                      : sub.averageScore >= 70
                                      ? "جيد جداً"
                                      : sub.averageScore >= 50
                                      ? "متوسط"
                                      : "بحاجة لتحسين"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Parent Report Card Live Box */}
                  <div className="bg-[#F8FAFC] dark:bg-[#1E293B]/30 p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
                        <span>معاينة نص تقرير ولي الأمر (واتساب)</span>
                      </h4>
                      <span className="text-[11px] text-[#64748B] font-mono">
                        جاهز للمشاركة المباشرة
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] font-sans text-xs leading-relaxed text-[#334155] dark:text-[#CBD5E1] whitespace-pre-wrap select-all">
                      {generateWhatsAppReportText(student)}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EXAMS HISTORY */}
              {activeTab === "exams" && (
                <div className="space-y-4">
                  {student.attempts.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[#64748B]">
                      لم يخض الطالب أي امتحانات حتى الآن.
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] font-bold border-b border-[#E2E8F0] dark:border-[#334155]">
                          <tr>
                            <th className="p-3">الامتحان والمادة</th>
                            <th className="p-3">الدرجة</th>
                            <th className="p-3">الوقت المستغرق</th>
                            <th className="p-3">الحالة</th>
                            <th className="p-3">التاريخ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/60 font-bold">
                          {student.attempts.map((att) => (
                            <tr key={att.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-[#1E293B]/20">
                              <td className="p-3">
                                <span className="block text-[#0F172A] dark:text-white">
                                  {att.title || att.exam?.title || "اختبار تدريبي"}
                                </span>
                                <span className="text-[11px] text-[#94A3B8] font-normal">
                                  {att.exam?.subject?.name || "عام"} • {att.exam?.isPractice ? "تدريبي" : "امتحان"}
                                </span>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-md font-mono ${
                                    att.percentage >= 85
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                      : att.percentage >= 60
                                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                                  }`}
                                >
                                  {att.percentage}% ({att.score} د)
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[#64748B]">
                                {att.timeSpentSeconds ? `${Math.round(att.timeSpentSeconds / 60)} دقيقة` : "—"}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    att.isCompleted
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  }`}
                                >
                                  {att.isCompleted ? "مكتمل ومسلّم" : "غير مكتمل"}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[#94A3B8]">
                                {new Date(att.startedAt).toLocaleDateString("ar-EG")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MISTAKES BANK */}
              {activeTab === "mistakes" && (
                <div className="space-y-3">
                  {student.mistakes.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[#64748B]">
                      لا توجد أخطاء مسجلة للطالب (أو قام بإتقانها جميعاً).
                    </div>
                  ) : (
                    student.mistakes.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/40 dark:bg-[#1E293B]/20 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] font-bold text-[11px]">
                              {m.question?.subject?.name || "سؤال مادة"}
                            </span>
                            <span className="text-[11px] text-[#94A3B8] font-mono">
                              آخر محاولة: {new Date(m.lastAttemptAt).toLocaleDateString("ar-EG")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-rose-600 dark:text-rose-400 font-bold">
                              تكرر الخطأ: {m.wrongCount} مرات
                            </span>
                            {m.isResolved ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 text-[10px] font-bold">
                                تم الإتقان
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 text-[10px] font-bold">
                                يحتاج مراجعة
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="font-bold text-[#0F172A] dark:text-white leading-relaxed">
                          {m.question?.statement || "نص السؤال"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: LESSONS PROGRESS */}
              {activeTab === "lessons" && (
                <div className="space-y-4">
                  {student.progress.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[#64748B]">
                      لم يتم تسجيل إنجاز أي دروس حتى الآن.
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] font-bold border-b border-[#E2E8F0] dark:border-[#334155]">
                          <tr>
                            <th className="p-3">المادة والوحدة</th>
                            <th className="p-3">اسم الدرس</th>
                            <th className="p-3">الحالة ونسبة التقدم</th>
                            <th className="p-3">آخر تفاعل</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/60 font-bold">
                          {student.progress.map((p) => (
                            <tr key={p.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-[#1E293B]/20">
                              <td className="p-3 text-[#64748B]">
                                {p.lesson?.unit?.subject?.name || "المادة"} • {p.lesson?.unit?.title || "الوحدة"}
                              </td>
                              <td className="p-3 text-[#0F172A] dark:text-white">
                                {p.lesson?.title || "الدرس"}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-md font-mono text-[11px] ${
                                    p.isCompleted
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                  }`}
                                >
                                  {p.isCompleted ? "مكتمل (100%)" : `${p.progressPercent}%`}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[#94A3B8]">
                                {p.lastAccessedAt ? new Date(p.lastAccessedAt).toLocaleDateString("ar-EG") : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SECURITY & SESSIONS */}
              {activeTab === "security" && (
                <div className="space-y-6 text-xs">
                  {/* Bound Devices List */}
                  <div className="bg-[#F8FAFC] dark:bg-[#1E293B]/30 p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#800020]" />
                          <span>الأجهزة المقترنة بحساب الطالب</span>
                        </h4>
                        <p className="text-[#64748B] dark:text-[#94A3B8] mt-1">
                          المستخدم حالياً: {student.boundDevices.length} من أصل {student.maxDevices} أجهزة مصرح بها
                        </p>
                      </div>

                      <button
                        onClick={handleResetDevices}
                        disabled={isResettingDevices || student.boundDevices.length === 0}
                        className="h-9 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                      >
                        {isResettingDevices ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                        <span>فك ربط جميع الأجهزة</span>
                      </button>
                    </div>

                    {student.boundDevices.length === 0 ? (
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold pt-2">
                        لا توجد أجهزة مقترنة حالياً (يمكن للطالب الدخول من جهازه الجديد وسيتم ربطه تلقائياً).
                      </p>
                    ) : (
                      <div className="space-y-2 pt-2">
                        {student.boundDevices.map((devId, idx) => (
                          <div
                            key={devId}
                            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] font-mono text-[11px]"
                          >
                            <span className="font-bold text-[#0F172A] dark:text-white">جهاز #{idx + 1}: {devId}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">مصرح ونشط</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="bg-[#F8FAFC] dark:bg-[#1E293B]/30 p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <h4 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#800020]" />
                      <span>الجلسات النشطة وتواريخ الدخول الأخيرة</span>
                    </h4>

                    {student.sessions.length === 0 ? (
                      <p className="text-[#64748B]">لا توجد جلسات نشطة حالياً للطالب.</p>
                    ) : (
                      <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/60">
                        {student.sessions.map((sess) => (
                          <div key={sess.id} className="py-2.5 flex items-center justify-between font-mono text-[11px]">
                            <div>
                              <span className="text-[#0F172A] dark:text-white block font-bold">
                                {sess.deviceId ? `معرف: ${sess.deviceId}` : "جلسة متصفح قديمة"}
                              </span>
                              <span className="text-[#94A3B8]">
                                بدأت: {new Date(sess.createdAt).toLocaleString("ar-EG")}
                              </span>
                            </div>
                            <span className="text-[#64748B]">
                              تنتهي: {new Date(sess.expires).toLocaleDateString("ar-EG")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
