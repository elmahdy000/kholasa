import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

// Single font system — IBM Plex Sans Arabic for all UI and content
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "الخلاصة | EL KHOLASA — افهمها صح.. هتفضل معاك",
  description:
    "المنصة التعليمية الذكية لطلاب الثانوية العامة والبكالوريا المصرية: شروحات تفاعلية، ملخصات الزتونة، خرائط ذهنية، وبنك أسئلة ذكي.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "الخلاصة",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { PwaRegister } from "@/components/pwa/PwaRegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <body className="min-h-screen font-ui bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] antialiased selection:bg-[#4F46E5]/20 selection:text-[#4F46E5]">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}