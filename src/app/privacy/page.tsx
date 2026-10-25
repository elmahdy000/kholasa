import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | الخلاصة",
  description: "كيف تجمع منصة الخلاصة بياناتك وتستخدمها وتحميها.",
};

const sections = [
  {
    title: "البيانات التي نجمعها",
    body: [
      "بيانات الحساب: الاسم، البريد الإلكتروني أو رقم الهاتف، وكلمة المرور المشفرة.",
      "بيانات المسار الدراسي: النظام التعليمي والصف والمسار الذي تختاره.",
      "بيانات الاستخدام: الدروس المكتملة، إجابات الاختبارات، الأخطاء المحفوظة، والمحاولات اليومية.",
    ],
  },
  {
    title: "لماذا نستخدمها",
    body: [
      "لتشغيل حسابك وعرض المحتوى المناسب لصفك الدراسي.",
      "لحساب تقدمك ونتائجك ومساعدتك على مراجعة أخطائك.",
      "لتحسين موثوقية المنصة وحماية الحسابات من الاستخدام المسيء.",
    ],
  },
  {
    title: "ملفات الجلسة والتخزين المحلي",
    body: [
      "نستخدم ملف تعريف ارتباط (Cookie) ضروريًا للحفاظ على تسجيل الدخول، وهو httpOnly ولا يُستخدم للتتبع الإعلاني.",
      "قد نحفظ تفضيلات بسيطة في متصفحك مثل الوضع الليلي. يمكنك مسحها في أي وقت من إعدادات المتصفح.",
    ],
  },
  {
    title: "مشاركة البيانات",
    body: [
      "لا نبيع بياناتك الشخصية ولا نشاركها مع جهات إعلانية.",
      "قد تُعالج البيانات عبر مزود الاستضافة وقاعدة البيانات لتشغيل الخدمة فقط، وبما يتوافق مع الغرض المذكور أعلاه.",
    ],
  },
  {
    title: "حقوقك",
    body: [
      "يمكنك تعديل بياناتك الدراسية من صفحة الحساب، وتغيير كلمة المرور في أي وقت.",
      "يمكنك طلب حذف حسابك وبياناتك عبر التواصل مع إدارة المنصة.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-right">
        <h1 className="text-2xl sm:text-3xl sm:text-4xl font-bold tracking-tight">
          سياسة الخصوصية
        </h1>
        <p className="mt-3 text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
          توضح هذه السياسة البيانات التي تجمعها منصة الخلاصة وكيفية استخدامها
          وحمايتها. باستخدامك المنصة فإنك توافق على ما ورد هنا.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-lg font-bold">{section.title}</h2>
              <ul className="space-y-2">
                {section.body.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed flex gap-2"
                  >
                    <span aria-hidden="true" className="text-[#4F46E5]">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#64748B] dark:text-[#94A3B8]">
          آخر تحديث: أكتوبر 2026
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
