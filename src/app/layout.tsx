import type { Metadata, Viewport } from "next";

import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#800020" },
    { media: "(prefers-color-scheme: dark)", color: "#081426" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://el-kholasa.online"),
  title: {
    default: "الخلاصة للبكالوريا | EL KHOLASA — المنصة التعليمية الذكية للبكالوريا المصرية",
    template: "%s | الخلاصة للبكالوريا",
  },
  description:
    "منصة الخلاصة للبكالوريا: المنصة التعليمية الذكية لطلاب البكالوريا المصرية (بكالوريا عربي وبكالوريا لغات). شروحات تفاعلية، ملخصات الزتونة المركزة، خرائط ذهنية، وبنك أسئلة ذكي مع نماذج إجابة معتمدة، بإشراف وتأليف Dr/Elmahdy.",
  applicationName: "الخلاصة للبكالوريا",
  authors: [{ name: "Dr/Elmahdy", url: "https://el-kholasa.online" }],
  generator: "Next.js",
  keywords: [
    "الخلاصة للبكالوريا",
    "الخلاصة",
    "منصة الخلاصة",
    "EL KHOLASA",
    "البكالوريا المصرية",
    "بكالوريا عربي",
    "بكالوريا لغات",
    "الثانوية العامة المصرية",
    "البرمجة والذكاء الاصطناعي",
    "Computer Science & AI",
    "بنك أسئلة البكالوريا",
    "امتحانات إلكترونية تفاعلية",
    "خرائط ذهنية تعليمية",
    "ملخص الزتونة",
    "Dr/Elmahdy",
    "د. المهدي",
    "منصة تعليمية ذكية",
    "ثانوية عامة 2026",
  ],
  creator: "Dr/Elmahdy",
  publisher: "Dr/Elmahdy",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "ar-EG": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    url: "https://el-kholasa.online",
    siteName: "الخلاصة للبكالوريا | EL KHOLASA",
    title: "الخلاصة للبكالوريا | المنصة التعليمية الذكية للبكالوريا المصرية",
    description:
      "المنصة الأولى المعتمدة لطلاب البكالوريا المصرية (بكالوريا عربي ولغات). شروحات تفاعلية، خرائط ذهنية، بنك أسئلة ذكي بإشراف Dr/Elmahdy.",
    images: [
      {
        url: "/images/logo-full.png",
        width: 1200,
        height: 630,
        alt: "شعار منصة الخلاصة للبكالوريا",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "الخلاصة للبكالوريا | EL KHOLASA",
    description:
      "المنصة التعليمية الذكية لطلاب البكالوريا المصرية (بكالوريا عربي ولغات) بإشراف Dr/Elmahdy.",
    images: ["/images/logo-full.png"],
    creator: "Dr/Elmahdy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "الخلاصة للبكالوريا",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  category: "Education",
  classification: "Educational Platform for Egyptian Baccalaureate",
  other: {
    copyright: "Dr/Elmahdy — جميع الحقوق محفوظة",
    designer: "Dr/Elmahdy",
  },
};

import Script from "next/script";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { NetworkStatusIndicator } from "@/components/ui/NetworkStatusIndicator";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const shellUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loginCode: user.loginCode,
        role: user.role,
      }
    : null;

  return (
    <html
      lang="ar"
      dir="rtl"
      className="font-sans"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        suppressHydrationWarning
        className="min-h-screen font-sans bg-[#F7F9FC] dark:bg-[#091B40] text-[#091B40] dark:text-[#F7F9FC] antialiased selection:bg-[#800B34]/15 dark:selection:bg-[#E9AD32]/25 selection:text-[#800B34] dark:selection:text-[#E9AD32]"
      >
        <Script
          id="jsonld-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "EducationalOrganization",
                  "@id": "https://el-kholasa.online/#organization",
                  name: "الخلاصة للبكالوريا",
                  alternateName: ["EL KHOLASA", "منصة الخلاصة للبكالوريا المصرية"],
                  url: "https://el-kholasa.online",
                  logo: "https://el-kholasa.online/icon-512.png",
                  description:
                    "المنصة التعليمية الذكية لطلاب البكالوريا المصرية (بكالوريا عربي وبكالوريا لغات) بإشراف وتأليف Dr/Elmahdy.",
                  founder: {
                    "@type": "Person",
                    name: "Dr/Elmahdy",
                    jobTitle: "Academic Director & Founder",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://el-kholasa.online/#website",
                  url: "https://el-kholasa.online",
                  name: "الخلاصة للبكالوريا",
                  author: {
                    "@type": "Person",
                    name: "Dr/Elmahdy",
                  },
                  copyrightHolder: {
                    "@type": "Person",
                    name: "Dr/Elmahdy",
                  },
                  inLanguage: ["ar-EG", "en-US"],
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://el-kholasa.online/subjects?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('kholasa_theme');
                // Default to the signature El-Kholasa Light Brand (Pearl White) unless dark is explicitly chosen
                const isDark = theme === 'dark';
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (_) {}
            `,
          }}
        />
        <ThemeProvider>
          <ToastProvider>
            <PwaRegister />
            <NetworkStatusIndicator />
            <AppShell user={shellUser}>{children}</AppShell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
