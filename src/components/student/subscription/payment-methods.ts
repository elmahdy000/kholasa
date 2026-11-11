import { normalizeDigits } from "@/lib/validation/auth";
export { normalizeDigits };

export type PaymentMethodId = "instapay" | "vodafone_cash";

export interface PaymentAccountOption {
  key: string;
  label: string;
  number: string;
}

export interface PaymentMethodConfig {
  id: PaymentMethodId;
  name: string;
  shortLabel: string;
  subtitle: string;
  badge: string | null;
  instructions: string;
  accounts: readonly PaymentAccountOption[];
}

export const SUBSCRIPTION_PRICE_EGP = 200;
export const MAX_RECEIPT_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const ACCEPTED_RECEIPT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const PAYMENT_METHODS: readonly PaymentMethodConfig[] = [
  {
    id: "instapay",
    name: "إنستاباي (InstaPay)",
    shortLabel: "إنستاباي",
    subtitle: "تحويل لحظي من أي تطبيق بنكي أو محفظة",
    badge: "سريع ومباشر",
    instructions:
      "افتح تطبيق إنستاباي، واختر التحويل إلى حساب محفظة أو رقم موبايل، وحوّل مبلغ الاشتراك (200 جنيه) إلى الرقم التالي:",
    accounts: [
      {
        key: "insta",
        label: "حساب إنستاباي المعتمد",
        number: "01025131212",
      },
    ],
  },
  {
    id: "vodafone_cash",
    name: "فودافون كاش / محفظة إلكترونية",
    shortLabel: "فودافون كاش",
    subtitle: "التحويل متاح على أي من الرقمين المعتمدين",
    badge: null,
    instructions:
      "حوّل قيمة الاشتراك (200 جنيه مصري) من محفظتك الإلكترونية أو عبر فرع فودافون كاش إلى أحد الرقمين التاليين، واحتفظ بصورة الإيصال:",
    accounts: [
      {
        key: "voda1",
        label: "رقم فودافون كاش (1)",
        number: "01025131212",
      },
      {
        key: "voda2",
        label: "رقم فودافون كاش (2)",
        number: "01066711545",
      },
    ],
  },
] as const;

export const SUBSCRIPTION_BENEFITS: readonly string[] = [
  "جميع دروس وشروحات المنهج المقررة",
  "بنك الأسئلة الكامل بالشرح والتفسير",
  "الكبسولات الصوتية وملخصات المراجعة",
  "الامتحانات التفاعلية وتقارير الأخطاء",
];

/** Validate Egyptian mobile number required by backend receipt confirmation. */
export function validateSenderPhone(rawPhone: string): string | null {
  const normalized = normalizeDigits(rawPhone);
  if (!normalized) {
    return "يرجى إدخال رقم الموبايل المحوّل منه لتأكيد العملية.";
  }
  if (!/^01[0125]\d{8}$/.test(normalized)) {
    return "يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقماً (يبدأ بـ 010 أو 011 أو 012 أو 015).";
  }
  return null;
}

/** Client-side image compression for large mobile screenshots before upload. */
export async function compressReceiptImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= 400 * 1024) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) return resolve(file);
          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
          );
        },
        "image/jpeg",
        0.82
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

