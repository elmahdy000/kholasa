import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { WhatsAppSupportLinks } from "@/components/ui/WhatsAppSupportLinks";

export function SiteFooter() {
  return (
    <footer className="bg-[#091B40] text-white pt-12 pb-24 sm:py-14 border-t border-[#1E3A5F]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-right">
          {/* Brand Column */}
          <div className="space-y-3">
            <BrandLogo
              href="/"
              variant="combined"
              size="md"
              surfaceTheme="dark"
              glow={false}
              subtitleText="EL KHOLASA"
            />
            <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-xs font-normal">
              منصتك التعليمية لطلاب البكالوريا المصرية (عربي ولغات): شرح مفاهيم، خرائط ذهنية، وتدريبات متدرجة بتفسير معتمد لكل سؤال.
            </p>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">تجربة المنهج</h4>
            <nav className="flex flex-col gap-2">
              <a
                href="#subjects-section"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                المواد الدراسية
              </a>
              <a
                href="#try-question"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                جرّب سؤال من المنهج
              </a>
              <a
                href="#features"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                مميزات الخلاصة
              </a>
              <Link
                href="/exams/builder"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                منشئ الامتحانات
              </Link>
            </nav>
          </div>

          {/* Academic Modules */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">الأقسام الدراسية</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/subjects"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                تصفح المواد والوحدات
              </Link>
              <Link
                href="/mistakes"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                ركن غلطاتي
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                لوحة المتصدرين
              </Link>
              <Link
                href="/profile"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                الملف الشخصي
              </Link>
            </nav>
          </div>

          {/* Account & Portal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">الحساب والدخول</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/login"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                دخول بكود الطالب
              </Link>
              <Link
                href="/register"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                إنشاء حساب جديد
              </Link>
              <Link
                href="/admin"
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                بوابة الإدارة والمعلمين
              </Link>
            </nav>

            <WhatsAppSupportLinks
              variant="footer-dark"
              title="تواصل واتساب للدعم والاشتراك:"
              message="مرحباً، أرغب في الاستفسار عن منصة الخلاصة للبكالوريا"
              className="pt-2"
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>
            © {new Date().getFullYear()} الخلاصة للبكالوريا | EL KHOLASA — جميع الحقوق محفوظة لـ Dr/Elmahdy.
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
