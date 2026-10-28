"use client";

import { Check } from "lucide-react";

export function LandingComparisonTable() {
  return (
    <section className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
          لماذا يختار أوائل الثانوية منصة الخلاصة؟
        </h2>
        <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
          مقارنة واضحة بين الطرق التقليدية وطريقة المذاكرة الذكية
        </p>
      </div>

      <div className="max-w-4xl mx-auto rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden bg-white dark:bg-[#0F172A]">
        <div className="grid grid-cols-3 p-4 bg-[#F8FAFC] dark:bg-[#1E293B] font-bold text-[13px] sm:text-sm text-[#0F172A] dark:text-white border-b border-[#E2E8F0] dark:border-[#334155] text-center">
          <div>المعيار</div>
          <div className="text-[#DC2626] font-bold">الطرق التقليدية</div>
          <div className="text-[#800020] dark:text-[#FB7185] font-bold">منصة الخلاصة</div>
        </div>

        <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155] text-[13px] sm:text-sm">
          <div className="grid grid-cols-3 p-4 items-center text-center">
            <div className="font-bold text-[#0F172A] dark:text-white">
              زمن مراجعة الدرس
            </div>
            <div className="text-[#64748B]">2 إلى 3 ساعات حفظ عشوائي</div>
            <div className="text-[#059669] dark:text-[#34D399] font-bold flex items-center justify-center gap-1">
              <Check className="w-4 h-4 text-[#059669]" />
              <span>10 دقائق في الزتونة المركزة</span>
            </div>
          </div>

          <div className="grid grid-cols-3 p-4 items-center text-center">
            <div className="font-bold text-[#0F172A] dark:text-white">
              تفسير الإجابات
            </div>
            <div className="text-[#64748B]">معرفة الإجابة الصحيحة فقط دون سبب</div>
            <div className="text-[#059669] dark:text-[#34D399] font-bold flex items-center justify-center gap-1">
              <Check className="w-4 h-4 text-[#059669]" />
              <span>تفسير لكل خيار ولماذا الباقي خطأ</span>
            </div>
          </div>

          <div className="grid grid-cols-3 p-4 items-center text-center">
            <div className="font-bold text-[#0F172A] dark:text-white">
              معالجة الأخطاء
            </div>
            <div className="text-[#64748B]">تضيع الأسئلة وتتكرر نفس الغلطة</div>
            <div className="text-[#059669] dark:text-[#34D399] font-bold flex items-center justify-center gap-1">
              <Check className="w-4 h-4 text-[#059669]" />
              <span>حفظ تلقائي بركن «غلطاتي» وإعادة التدريب</span>
            </div>
          </div>

          <div className="grid grid-cols-3 p-4 items-center text-center">
            <div className="font-bold text-[#0F172A] dark:text-white">
              المذاكرة أوفلاين
            </div>
            <div className="text-[#64748B]">تتوقف تماماً عند انقطاع النت</div>
            <div className="text-[#059669] dark:text-[#34D399] font-bold flex items-center justify-center gap-1">
              <Check className="w-4 h-4 text-[#059669]" />
              <span>تطبيق PWA يحفظ الملخصات تلقائياً</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
