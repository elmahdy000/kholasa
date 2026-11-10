export interface SupportWhatsAppContact {
  local: string;
  intl: string;
}

export const SUPPORT_WHATSAPP_NUMBERS: readonly SupportWhatsAppContact[] = [
  { local: "01025131212", intl: "201025131212" },
  { local: "01066711545", intl: "201066711545" },
  { local: "01020457827", intl: "201020457827" },
];

export function buildWhatsAppUrl(intlPhone: string, message: string): string {
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}
