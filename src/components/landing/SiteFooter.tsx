import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#0F172A] text-white py-12 sm:py-16 border-t border-[#E2E8F0] dark:border-[#334155]/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#800020] flex items-center justify-center text-white font-bold text-base">
                خ
              </div>
              <div>
                <span className="font-bold text-base text-white leading-tight block">
                  الخلاصة
                </span>
                <span className="text-[13px] text-[#FB7185] font-medium block -mt-1">
                  EL KHOLASA
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#94A3B8] font-content leading-relaxed max-w-xs">
              المنصة التعليمية الذكية لطلاب الثانوية العامة والبكالوريا المصرية. افهمها صح.. هتفضل معاك.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">المنتج</h4>
            <nav className="flex flex-col gap-3">
              <a href="#features" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                المميزات
              </a>
              <a href="#how-it-works" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                إزاي تذاكر؟
              </a>
              <a href="#demo" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                جرّب بنفسك
              </a>
            </nav>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">المصادر</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/subjects" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                المواد الدراسية
              </Link>
              <Link href="/exams/builder" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                بنك الأسئلة
              </Link>
              <Link href="/leaderboard" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                المتصدرون
              </Link>
            </nav>
          </div>

          {/* Account Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">الحساب</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/login" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                إنشاء حساب
              </Link>
              <Link href="/profile" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                حسابي
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[#64748B] font-medium">
            © {new Date().getFullYear()} الخلاصة | EL KHOLASA. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[13px] text-[#64748B] hover:text-[#94A3B8] transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#94A3B8] transition-colors">
              شروط الاستخدام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}