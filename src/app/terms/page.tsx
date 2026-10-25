import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const metadata: Metadata = {
  title: "شروط الاستخدام | الخلاصة",
  description: "شروط استخدام منصة الخلاصة التعليمية.",
};

const sections = [
  {
    title: "طبيعة الخدمة",
    body: [
      "الخلاصة منصة تعليمية تقدم شروحات وملخصات وبنك أسئلة واختبارات تدريبية لطلاب المرحلة الثانوية.",
      "المحتوى لأغراض تعليمية ومساندة للمذاكرة، ولا يضمن الحصول على درجة معينة في أي امتحان رسمي.",
    ],
  },
  {
    title: "الحساب",
    body: [
      "أنت مسؤول عن صحة البيانات التي تسجلها وعن الحفاظ على سرية كلمة المرور.",
      "يُمنع مشاركة الحساب مع الآخرين أو إنشاء حسابات متعددة للتحايل على الاختبارات.",
      "يحق لإدارة المنصة تعليق أي حساب يسيء استخدام الخدمة أو يخل بنزاهة الاختبارات.",
    ],
  },
  {
    title: "الملكية الفكرية",
    body: [
      "جميع المواد التعليمية والتصميمات والبرمجيات مملوكة لمنصة الخلاصة أو مرخصة لها.",
      "يُمنع نسخ المحتوى أو إعادة نشره أو بيعه دون إذن كتابي مسبق.",
    ],
  },
  {
    title: "الاستخدام المقبول",
    body: [
      "يُمنع محاولة الوصول إلى بيانات مستخدمين آخرين أو تعطيل الخدمة أو تجاوز حدود الاستخدام.",
      "يُمنع استخدام أدوات آلية لجمع الأسئلة أو الإجابات من المنصة.",
    ],
  },
  {
    title: "التعديلات",
    body: [
      "قد نحدّث هذه الشروط عند إضافة ميزات جديدة أو تغيير طريقة عمل الخدمة.",
      "استمرارك في استخدام المنصة بعد نشر التحديث يعني موافقتك على الشروط المعدلة.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-right">
        <h1 className="text-2xl sm:text-3xl sm:text-4xl font-bold tracking-tight">
          شروط الاستخدام
        </h1>
        <p className="mt-3 text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
          تحدد هذه الشروط قواعد استخدام منصة الخلاصة. باستخدامك المنصة فإنك
          توافق عليها.
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
