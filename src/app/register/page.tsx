"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Lock,
  Mail,
  Phone,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  Loader2,
  CheckCircle2,
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [systems, setSystems] = useState<EducationalSystem[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSystems, setIsFetchingSystems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSystems() {
      try {
        const res = await fetch("/api/systems");
        if (res.ok) {
          const data = await res.json();
          setSystems(data.systems || []);
          if (data.systems && data.systems.length > 0) {
            setSelectedSystemId(data.systems[0].id);
            if (data.systems[0].grades.length > 0) {
              setSelectedGradeId(data.systems[0].grades[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load systems", err);
      } finally {
        setIsFetchingSystems(false);
      }
    }
    loadSystems();
  }, []);

  const currentGrades =
    systems.find((s) => s.id === selectedSystemId)?.grades || [];

  const handleSystemChange = (sysId: string) => {
    setSelectedSystemId(sysId);
    const target = systems.find((s) => s.id === sysId);
    if (target && target.grades.length > 0) {
      setSelectedGradeId(target.grades[0].id);
    } else {
      setSelectedGradeId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    if (!email && !phone) {
      setError("يرجى إدخال البريد الإلكتروني أو رقم الهاتف");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          password,
          systemId: selectedSystemId || undefined,
          gradeId: selectedGradeId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل إنشاء الحساب");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ أثناء إنشاء الحساب");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#09090B] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-right font-sans relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-95 mb-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-2xs group-hover:bg-[#4338CA] transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white block">
                الخُلاصة
              </span>
              <span className="text-[10px] font-mono font-medium text-[#4F46E5] dark:text-indigo-400 block tracking-wider">
                EL KHOLASA
              </span>
            </div>
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            إنشاء حساب طالب جديد
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            ابدأ رحلة التفوق مع الخلاصة الذهبية والخرائط التفاعلية
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-950 py-8 px-6 sm:px-8 shadow-xs border border-slate-200 dark:border-slate-800 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3 text-right">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs sm:text-sm font-bold text-[#0F172A] dark:text-slate-200 mb-1.5"
              >
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full h-11 pr-11 pl-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-[#0F172A] dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Email & Phone in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full h-11 pr-10 pl-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-[#0F172A] dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5"
                >
                  رقم الهاتف (واتساب)
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full h-11 pr-10 pl-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-[#0F172A] dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic System & Grade */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4F46E5] dark:text-indigo-400">
                <GraduationCap className="w-4 h-4" />
                <span>المسار والصف الدراسي</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    النظام التعليمي
                  </label>
                  <select
                    value={selectedSystemId}
                    onChange={(e) => handleSystemChange(e.target.value)}
                    disabled={isFetchingSystems}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-zinc-950 text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    {systems.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    الصف الدراسي
                  </label>
                  <select
                    value={selectedGradeId}
                    onChange={(e) => setSelectedGradeId(e.target.value)}
                    disabled={isFetchingSystems || currentGrades.length === 0}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-zinc-950 text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    {currentGrades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5"
                >
                  كلمة المرور <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pr-10 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-[#0F172A] dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5"
                >
                  تأكيد كلمة المرور <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pr-10 pl-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-[#0F172A] dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 interactive-tap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ إنشاء الحساب...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>إنشاء الحساب والبدء الآن</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>لديك حساب بالفعل؟ </span>
            <Link
              href="/login"
              className="font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline"
            >
              سجّل الدخول الآن
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
