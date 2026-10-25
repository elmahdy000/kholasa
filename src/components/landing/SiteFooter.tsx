import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#12263F] text-white py-16 sm:py-20 border-t border-[#1E3A5F]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-right">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#800020] flex items-center justify-center text-white font-bold text-lg shadow-xs">
                خ
              </div>
              <div>
                <span className="font-bold text-lg text-white leading-tight block">
                  الخلاصة
                </span>
                <span className="text-xs text-[#94A3B8] font-semibold block -mt-1 font-mono">
                  EL KHOLASA
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-xs font-normal">
              المنصة التعليمية الشاملة لطلاب الثانوية العامة والبكالوريا المصرية: شروحات مفككة، كبسولات الزتونة المركزة، وبنك أسئلة متكيف.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">المنصة والمنهجية</h4>
            <nav className="flex flex-col gap-2.5">
              <a href="#features" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                أدوات المذاكرة
              </a>
              <a href="#how-it-works" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                إزاي تذاكر؟
              </a>
              <a href="#demo" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                كبسولة الزتونة
              </a>
              <Link href="/exams/builder" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                بنك الأسئلة المتكيف
              </Link>
            </nav>
          </div>

          {/* Academic Modules */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">المناهج والمسارات</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/subjects" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                تصفح المواد الدراسية
              </Link>
              <Link href="/mistakes" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                سجل معالجة الأخطاء
              </Link>
              <Link href="/leaderboard" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                لوحة المتصدرين
              </Link>
              <Link href="/profile" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                خطة المذاكرة الشخصية
              </Link>
            </nav>
          </div>

          {/* Account & Administration */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">الحساب والدخول</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/login" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                إنشاء حساب جديد
              </Link>
              <Link href="/admin" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                بوابة الإدارة وهيئة التدريس
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>
            © {new Date().getFullYear()} الخلاصة | EL KHOLASA. جميع الحقوق محفوظة لطلاب الثانوية العامة.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              شروط الاستخدام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}