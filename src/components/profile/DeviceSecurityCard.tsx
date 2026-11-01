import { ShieldCheck, Smartphone, Info } from "lucide-react";

interface DeviceSecurityCardProps {
  maxDevices?: number;
  boundDevicesCount?: number;
}

export function DeviceSecurityCard({
  maxDevices = 2,
  boundDevicesCount = 0,
}: DeviceSecurityCardProps) {
  const isAtLimit = boundDevicesCount >= maxDevices;

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
              أمان الحساب وربط الأجهزة
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              حماية اشتراكك ومنع مشاركة الحساب
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isAtLimit
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>
              {boundDevicesCount} من {maxDevices} أجهزة مستخدمة
            </span>
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 bg-[#F8FAFC] dark:bg-[#1E293B]/50 p-4 rounded-xl text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
        <Info className="w-4 h-4 text-[#800020] dark:text-[#FB7185] shrink-0 mt-0.5" />
        <p>
          حسابك محمي بنظام ربط الأجهزة الآلي (بحد أقصى {maxDevices} أجهزة للدراسة). إذا قمت بتغيير جهازك وترغب في فك ربط جهاز قديم، يمكنك التواصل مع إدارة المنصة لإعادة ضبط أجهزتك المعتمدة.
        </p>
      </div>
    </div>
  );
}

