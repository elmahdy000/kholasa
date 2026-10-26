import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function SiteFooter() {
  return (
    <footer className="bg-[#12263F] text-white py-16 sm:py-20 border-t border-[#1E3A5F]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-right">
          {/* Brand Column */}
          <div className="space-y-4">
            <BrandLogo
              href="/"
              variant="combined"
              size="md"
              surfaceTheme="dark"
              subtitleText="EL KHOLASA"
            />
            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-xs font-normal">
              منصتك الذكية للثانوية العامة والبكالوريا.. افهمها صح هتفضل معاك، بشروحات مفككة وزتونة سريعة وبنك أسئلة ذكي.
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
                الزتونة المركزة
              </a>
              <Link href="/exams/builder" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                بنك الأسئلة الذكي
              </Link>
            </nav>
          </div>

          {/* Academic Modules */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">المناهج والمسارات</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/subjects" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                تصفح المواد والوحدات
              </Link>
              <Link href="/mistakes" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                ركن غلطاتي
              </Link>
              <Link href="/leaderboard" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                لوحة الأوائل
              </Link>
              <Link href="/profile" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                حسابك ومتابعة مستواك
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
                بوابة الإدارة
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>
            © {new Date().getFullYear()} الخلاصة | EL KHOLASA — معمولة لطلاب الثانوية العامة بكل حب عشان تذاكر بذكاء.
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