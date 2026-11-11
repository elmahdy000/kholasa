"use client";

import { MessageCircle } from "lucide-react";
import { SUPPORT_WHATSAPP_NUMBERS, buildWhatsAppUrl } from "@/lib/contact";

interface WhatsAppSupportLinksProps {
  message: string;
  title?: string;
  variant?: "buttons" | "compact" | "footer-dark" | "footer-light";
  className?: string;
}

export function WhatsAppSupportLinks({
  message,
  title,
  variant = "buttons",
  className = "",
}: WhatsAppSupportLinksProps) {
  if (variant === "footer-dark" || variant === "footer-light") {
    const isDark = variant === "footer-dark";
    return (
      <div className={`space-y-2 ${className}`}>
        {title && (
          <span
            className={`text-xs font-bold block ${
              isDark ? "text-white" : "text-[#091B40] dark:text-white"
            }`}
          >
            {title}
          </span>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {SUPPORT_WHATSAPP_NUMBERS.map((num) => (
            <a
              key={num.intl}
              href={buildWhatsAppUrl(num.intl, message)}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold font-sans tabular-nums inline-flex items-center gap-1.5 transition-colors border ${
                isDark
                  ? "bg-white/5 border-white/15 text-[#CBD5E1] hover:text-white hover:bg-[#17834B] hover:border-[#17834B]"
                  : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#17834B] dark:text-[#34D399] hover:border-[#17834B]"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{num.local}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`space-y-2 ${className}`}>
        {title && (
          <span className="block font-bold text-[#091B40] dark:text-white text-xs text-center">
            {title}
          </span>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SUPPORT_WHATSAPP_NUMBERS.map((num) => (
            <a
              key={num.intl}
              href={buildWhatsAppUrl(num.intl, message)}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#17834B] text-[#17834B] dark:text-[#34D399] font-bold font-sans tabular-nums text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{num.local}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <span className="text-xs font-bold text-[#536681] dark:text-[#94A3B8] block">
          {title}
        </span>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SUPPORT_WHATSAPP_NUMBERS.map((num) => (
          <a
            key={num.intl}
            href={buildWhatsAppUrl(num.intl, message)}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="min-h-[44px] px-3 py-2 rounded-xl bg-[#17834B] hover:bg-[#126B3D] text-white font-bold font-sans tabular-nums text-xs sm:text-[13px] flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>{num.local}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
