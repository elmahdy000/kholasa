"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  Lock,
  CheckCircle2,
  X,
} from "lucide-react";
import type { UserItem } from "./types";
import { useToast } from "@/components/ui/Toast";

interface EditRoleModalProps {
  user: UserItem | null;
  currentUserRole: string;
  onClose: () => void;
  onUserSaved: (updatedUser: UserItem) => void;
}

export function EditRoleModal({
  user,
  currentUserRole,
  onClose,
  onUserSaved,
}: EditRoleModalProps) {
  const { toast } = useToast();

  const [role, setRole] = useState("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [maxDevices, setMaxDevices] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setPassword("");
      setShowPassword(false);
      setCopiedPassword(false);
      setMaxDevices(user.maxDevices || 1);
      setIsActive(user.isActive !== false);
      setErrorMsg(null);
    }
  }, [user]);

  if (!user) return null;

  const isAssistant = role !== "STUDENT";

  const generateSecurePassword = () => {
    const specials = ["@", "#", "!", "$", "%"];
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const special = specials[Math.floor(Math.random() * specials.length)];
    let randomPart = "";
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `Assist@2026${special}${randomPart}`;
    setPassword(generated);
    setShowPassword(true);
    navigator.clipboard.writeText(generated);
    setCopiedPassword(true);
    toast.info(`تم توليد ونسخ كلمة المرور: ${generated}`);
    setTimeout(() => setCopiedPassword(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMsg(null);

    if (password && password.length < 8) {
      setErrorMsg("كلمة المرور يجب أن لا تقل عن 8 أحرف وأرقام");
      setIsUpdating(false);
      return;
    }

    try {
      const payload: Record<string, any> = {
        role,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        isActive,
      };

      if (password && password.trim()) {
        payload.password = password.trim();
      }

      if (role === "STUDENT") {
        payload.maxDevices = maxDevices;
      }

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحديث بيانات الحساب");
      }

      const updatedUser: UserItem = {
        ...user,
        ...data.user,
        role,
        isActive,
        maxDevices: role === "STUDENT" ? maxDevices : user.maxDevices,
      };

      onUserSaved(updatedUser);

      if (password) {
        toast.success(`تم تحديث الصلاحيات وتغيير كلمة المرور للحساب بنجاح وإلغاء الجلسات القديمة.`);
      } else {
        toast.success(`تم تحديث بيانات وصلاحيات الحساب بنجاح.`);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-7 space-y-5 text-right shadow-2xl border border-[#E2E8F0] dark:border-[#334155] max-h-[92vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/20 dark:text-[#FB7185] flex items-center justify-center font-bold shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <span>إدارة الحساب وكلمة المرور والصلاحيات</span>
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                التحكم الكامل في المساعدين، المعلمين، وصلاحيات الوصول للمنصة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target User Info Banner */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#800020] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {(user.name || "م").charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-[#0F172A] dark:text-white block truncate">
                {user.name || "مستخدم بدون اسم"}
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                <span>{user.email || user.phone || "بدون بريد/هاتف"}</span>
                {user.loginCode && <span>• كود: {user.loginCode}</span>}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                user.role === "SUPER_ADMIN"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : user.role === "ADMIN"
                  ? "bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] border-[#800020]/30"
                  : user.role === "EDITOR"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200"
                  : user.role === "TEACHER"
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200"
              }`}
            >
              {user.role === "SUPER_ADMIN"
                ? "مشرف أعلى"
                : user.role === "ADMIN"
                ? "مسؤول / مساعد"
                : user.role === "EDITOR"
                ? "محرر محتوى"
                : user.role === "TEACHER"
                ? "معلم"
                : "طالب"}
            </span>
            <span
              className={`text-[10px] font-bold ${
                user.isActive !== false ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {user.isActive !== false ? "الحساب مفعّل 🟢" : "الحساب موقوف 🔴"}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-[#DC2626]/10 text-[#DC2626] text-xs font-bold flex items-center gap-2 border border-[#DC2626]/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SECTION 1: Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
              الصلاحية والرتبة في المنصة
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            >
              <option value="ADMIN">
                مسؤول / مساعد (ADMIN) — صلاحيات كاملة: مناهج، أسئلة، امتحانات، وتفعيل حسابات الطلاب
              </option>
              <option value="EDITOR">
                محرر محتوى (EDITOR) — إضافة وتعديل المناهج والأسئلة والوسائط (بدون إدارة المستخدمين)
              </option>
              <option value="TEACHER">
                معلم (TEACHER) — متابعة إنجاز الطلاب ونتائج الامتحانات وتصحيحها
              </option>
              <option value="STUDENT">
                طالب (STUDENT) — حساب تدريب ومذاكرة اعتيادي (دخول بالكود)
              </option>
              {currentUserRole === "SUPER_ADMIN" && (
                <option value="SUPER_ADMIN">
                  مشرف عام أعلى (SUPER_ADMIN) — وصول مطلق للنظام
                </option>
              )}
            </select>
          </div>

          {/* SECTION 2: Direct Password Change Section */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>تعيين أو تغيير كلمة المرور للمساعد / المستخدم</span>
              </label>
              <button
                type="button"
                onClick={generateSecurePassword}
                className="text-[11px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1 cursor-pointer"
                title="توليد كلمة مرور عشوائية قوية وسهلة الحفظ"
              >
                <RefreshCw className="w-3 h-3" />
                <span>توليد كلمة قوية</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="اتركه فارغاً إذا كنت لا ترغب بتغيير كلمة المرور الحالية"
                minLength={8}
                className="w-full h-11 pr-3 pl-20 rounded-xl border border-amber-300/80 dark:border-amber-800 bg-white dark:bg-[#0F172A] text-xs font-mono font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] placeholder:font-sans focus:outline-none focus:border-[#800020]"
                dir="ltr"
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {password && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(password);
                      setCopiedPassword(true);
                      toast.success("تم نسخ كلمة المرور");
                      setTimeout(() => setCopiedPassword(false), 2500);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="نسخ كلمة المرور"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={showPassword ? "إخفاء" : "إظهار"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              💡 <span className="font-bold">أمان الدخول:</span> عند تعيين كلمة مرور جديدة، سيتم تشفيرها وحفظها، وإلغاء كافة الجلسات النشطة للمساعد فوراً ليتم إجباره على تسجيل الدخول بكلمة المرور الجديدة.
            </p>
          </div>

          {/* SECTION 3: Account Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                رقم الهاتف (للتواصل أو الدخول)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-mono font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                البريد الإلكتروني (لتسجيل دخول المشرفين والمساعدين)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-mono font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Status and Devices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                حالة تفعيل الحساب
              </label>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className={`w-full h-10 px-3 rounded-xl border text-xs font-bold ${
                  isActive
                    ? "border-emerald-300 text-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300"
                    : "border-rose-300 text-rose-700 bg-rose-50/30 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-300"
                }`}
              >
                <option value="active">مفعّل (مسموح له بالدخول والعمل) 🟢</option>
                <option value="inactive">معلّق / موقوف (محظور من الدخول) 🔴</option>
              </select>
            </div>

            {role === "STUDENT" && (
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  الحد الأقصى للأجهزة المصرح بها
                </label>
                <select
                  value={maxDevices}
                  onChange={(e) => setMaxDevices(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold"
                >
                  <option value={1}>جهاز واحد فقط (افتراضي لمنع المشاركة)</option>
                  <option value={2}>جهازين (تصريح إضافي للطالب)</option>
                  <option value={3}>3 أجهزة (استثناء خاص)</option>
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#64748B] dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#1E293B] cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ التعديلات...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ التعديلات وكلمة المرور</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
