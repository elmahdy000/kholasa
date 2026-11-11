"use client";

import { CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";
import { WhatsAppSupportLinks } from "@/components/ui/WhatsAppSupportLinks";
import {
  SUBSCRIPTION_BENEFITS,
  SUBSCRIPTION_PRICE_EGP,
} from "./payment-methods";

interface SubscriptionOrderSummaryProps {
  studentName?: string | null;
  loginCode?: string | null;
  whatsappMessage: string;
  compactMobileOnly?: boolean;
}

export function SubscriptionOrderSummary({
  studentName,
  loginCode,
  whatsappMessage,
  compactMobileOnly = false,
}: SubscriptionOrderSummaryProps) {
  if (compactMobileOnly) {
    return (
      <section
        aria-label="ملخص قيمة الاشتراك"
        className="lg:hidden bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-[0_2px_12px_rgba(9,27,64,0.04)] flex flex-wrap items-center justify-between gap-3"
      >
        <div className="space-y-1">
          <span className="text-[13px] font-bold text-[#475569] block">
            قيمة الاشتراك الشهري
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-black text-[#091B40] font-mono tabular-nums leading-none">
              {SUBSCRIPTION_PRICE_EGP}
            </span>
            <span className="text-[14px] font-bold text-[#091B40]">
              جنيه مصري / شهرياً
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#091B40] text-white text-[12px] font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#D49B24]" />
          <span>شامل المنهج بالكامل</span>
        </span>
      </section>
    );
  }

  return (
    <aside
      aria-label="ملخص الطلب والتفاصيل"
      className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-[0_4px_20px_rgba(9,27,64,0.04)] space-y-5 lg:sticky lg:top-24"
    >
      {/* Price Header (Desktop Sidebar; Mobile uses top prominent card) */}
      <div className="hidden lg:block pb-4 border-b border-[#E2E8F0] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold text-[#475569]">
            ملخص الاشتراك
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF8EC] text-[#92620A] border border-[#E9AD32]/40 text-[12px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D49B24]" />
            <span>باقة شهرية شاملة</span>
          </span>
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-[34px] font-black text-[#091B40] font-mono tabular-nums leading-none">
            {SUBSCRIPTION_PRICE_EGP}
          </span>
          <span className="text-[15px] font-bold text-[#091B40]">
            جنيه مصري / شهرياً
          </span>
        </div>
      </div>

      {/* Included Features */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-extrabold text-[#091B40]">
          يتضمن الاشتراك:
        </h3>
        <ul className="space-y-2.5">
          {SUBSCRIPTION_BENEFITS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-[14px] font-medium text-[#334155] leading-snug"
            >
              <CheckCircle2 className="w-4.5 h-4.5 text-[#D49B24] shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Student Identity Verification Box */}
      <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#091B40]">
          <UserCheck className="w-4 h-4 text-[#1D4ED8] shrink-0" />
          <span>بيانات الحساب المستفيد</span>
        </div>
        <div className="text-[13px] text-[#475569] space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span>الاسم:</span>
            <span className="font-bold text-[#091B40] truncate">
              {studentName || "طالب المنصة"}
            </span>
          </div>
          {loginCode && (
            <div className="flex items-center justify-between gap-2">
              <span>كود الطالب:</span>
              <span className="font-mono font-bold text-[#091B40]" dir="ltr">
                {loginCode}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Honest Verification Note */}
      <div className="flex items-start gap-2 text-[13px] text-[#475569] leading-relaxed bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
        <ShieldCheck className="w-4.5 h-4.5 text-[#1D4ED8] shrink-0 mt-0.5" />
        <span>
          يتم تفعيل الحساب بعد مراجعة الإيصال من قِبل الإدارة، وليس فورياً قبل التحقق الفعلي من التحويل.
        </span>
      </div>

      {/* Support WhatsApp Links */}
      <div className="pt-2 border-t border-[#E2E8F0]">
        <WhatsAppSupportLinks
          variant="compact"
          title="تحتاج مساعدة في الدفع؟ تواصل معنا:"
          message={whatsappMessage}
          className="!text-right sm:!items-start"
        />
      </div>
    </aside>
  );
}
