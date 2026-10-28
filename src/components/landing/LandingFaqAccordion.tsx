"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import type { FaqItem } from "./types";

const FAQS: FaqItem[] = [
  {
    q: "ما هو الفرق بين تطبيق الخلاصة وأي منصة فيديوهات أخرى؟",
    a: "الخلاصة ليست مجرد فيديوهات مسجلة تشاهدها بسلبية. نحن نركز على مصفوفة التعلم النشط: ملخص الزتونة المكثف لكل درس، خرائط العلاقات الذهنية، بنك أسئلة متدرج وشامل يفسر لماذا كل اختيار صح أو غلط، وركن أخطائي التلقائي الذي يضمن عدم تكرار الغلطة في الامتحان النهائي.",
  },
  {
    q: "هل المنصة تغطي منهج الثانوية العامة أم البكالوريا المصرية فقط؟",
    a: "تغطي المنصة كلاً من نظام الثانوية العامة ونظام البكالوريا المصرية بشكل مخصص ومنفصل تماماً، مع توزيع الوحدات ونواتج التعلم وتكات الامتحانات الخاصة بكل نظام.",
  },
  {
    q: "هل يعمل التطبيق بدون إنترنت (PWA)؟",
    a: "نعم! الخلاصة مصممة كـ Progressive Web App كامل، مما يتيح لك تثبيتها مباشرة على هاتفك أو حاسوبك بدون متجر تطبيقات، واستعراض ملخصات الزتونة ومراجعاتك في أي وقت حتى عند انقطاع الاتصال.",
  },
  {
    q: "كيف يساعدني «ركن غلطاتي» على تحسين مجموعي؟",
    a: "كل سؤال تجيب عنه بشكل غير صحيح في أي اختبار مخصص يتم ترحيله فوراً إلى «ركن غلطاتي». يعيد النظام اختبارك فيه لاحقاً بذكاء، ويعرض لك التفسير المفهومي حتى تتحول نسبة إتقانك للمفهوم إلى 100%.",
  },
];

export function LandingFaqAccordion() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>إجابات واضحة</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
          الأسئلة الأكثر شيوعاً حول المنصة
        </h2>
      </div>

      <div className="space-y-3 pt-2">
        {FAQS.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-right text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#94A3B8] transition-transform ${
                    isOpen ? "rotate-180 text-[#800020] dark:text-[#FB7185]" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed border-t border-[#E2E8F0] dark:border-[#334155]/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
