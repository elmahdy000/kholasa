"use client";

import { Check } from "lucide-react";

export type PaymentFlowStep = 1 | 2 | 3;

interface PaymentProgressStepperProps {
  currentStep: PaymentFlowStep;
}

const STEPS: readonly {
  step: PaymentFlowStep;
  mobileTitle: string;
  title: string;
  subtitle: string;
}[] = [
  { step: 1, mobileTitle: "التحويل", title: "تحويل المبلغ", subtitle: "اختر وسيلة التحويل" },
  { step: 2, mobileTitle: "الإيصال", title: "بيانات الإيصال", subtitle: "ارفع الصورة والرقم" },
  { step: 3, mobileTitle: "المراجعة", title: "مراجعة التفعيل", subtitle: "تحت مراجعة الإدارة" },
];

export function PaymentProgressStepper({ currentStep }: PaymentProgressStepperProps) {
  return (
    <nav
      aria-label="خطوات تأكيد الدفع"
      className="bg-white rounded-2xl border border-[#E2E8F0] p-3 sm:p-4 shadow-[0_2px_10px_rgba(9,27,64,0.03)]"
    >
      <ol className="flex items-center justify-between gap-1.5 sm:gap-4">
        {STEPS.map((item, idx) => {
          const isCompleted = item.step < currentStep;
          const isCurrent = item.step === currentStep;
          const isLast = idx === STEPS.length - 1;

          return (
            <li
              key={item.step}
              className={`flex items-center ${isLast ? "shrink-0" : "flex-1 min-w-0"}`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black font-mono shrink-0 transition-colors ${
                    isCompleted
                      ? "bg-[#059669] text-white"
                      : isCurrent
                      ? "bg-[#1D4ED8] text-white ring-3 sm:ring-4 ring-[#DBEAFE]"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.75} /> : item.step}
                </span>

                <div className="min-w-0">
                  <span
                    className={`block text-[12px] sm:text-[14px] font-bold leading-tight whitespace-nowrap ${
                      isCurrent
                        ? "text-[#091B40]"
                        : isCompleted
                        ? "text-[#059669]"
                        : "text-[#64748B]"
                    }`}
                  >
                    <span className="sm:hidden">{item.mobileTitle}</span>
                    <span className="hidden sm:inline">{item.title}</span>
                  </span>
                  <span className="hidden md:block text-[12px] text-[#64748B] truncate mt-0.5">
                    {item.subtitle}
                  </span>
                </div>
              </div>

              {!isLast && (
                <div
                  aria-hidden="true"
                  className={`flex-1 h-[2px] mx-1.5 sm:mx-3 rounded-full transition-colors min-w-[8px] ${
                    isCompleted ? "bg-[#059669]" : "bg-[#E2E8F0]"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
