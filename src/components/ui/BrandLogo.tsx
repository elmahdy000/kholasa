"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  /**
   * "combined": Emblem + styled text (ideal for navbars & headers)
   * "icon": Emblem only (ideal for compact mobile, drawer, avatars, banners)
   * "full": 3D Emblem with 3D sculpted Arabic wordmark (ideal for auth cards, hero)
   */
  variant?: "combined" | "icon" | "full";
  /**
   * Overall scale
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /**
   * Surface context: 'auto' (respects dark class), 'dark' (for always dark containers like footer), 'light'
   */
  surfaceTheme?: "auto" | "dark" | "light";
  /**
   * Subtitle displayed when variant="combined"
   */
  showSubtitle?: boolean;
  subtitleText?: string;
  /**
   * Wrap with next/link if provided
   */
  href?: string;
  className?: string;
  priority?: boolean;
  /**
   * Adds an ambient brand glow around the 3D emblem
   */
  glow?: boolean;
}

const sizeConfig = {
  xs: {
    iconSize: 28,
    fullWidth: 100,
    fullHeight: 120,
    titleClass: "text-sm",
    subtitleClass: "text-[10px]",
    gapClass: "gap-2",
  },
  sm: {
    iconSize: 32,
    fullWidth: 120,
    fullHeight: 144,
    titleClass: "text-base",
    subtitleClass: "text-[11px]",
    gapClass: "gap-2.5",
  },
  md: {
    iconSize: 42,
    fullWidth: 150,
    fullHeight: 180,
    titleClass: "text-lg sm:text-xl",
    subtitleClass: "text-[11px] sm:text-[12px]",
    gapClass: "gap-3",
  },
  lg: {
    iconSize: 52,
    fullWidth: 180,
    fullHeight: 216,
    titleClass: "text-xl sm:text-2xl",
    subtitleClass: "text-xs sm:text-sm",
    gapClass: "gap-3.5",
  },
  xl: {
    iconSize: 72,
    fullWidth: 220,
    fullHeight: 264,
    titleClass: "text-2xl sm:text-3xl",
    subtitleClass: "text-sm",
    gapClass: "gap-4",
  },
  "2xl": {
    iconSize: 96,
    fullWidth: 280,
    fullHeight: 336,
    titleClass: "text-3xl sm:text-4xl",
    subtitleClass: "text-base",
    gapClass: "gap-4",
  },
};

export function BrandLogo({
  variant = "combined",
  size = "md",
  surfaceTheme = "auto",
  showSubtitle = true,
  subtitleText = "افهمها صح.. هتفضل معاك",
  href,
  className,
  priority = false,
  glow = true,
}: BrandLogoProps) {
  const cfg = sizeConfig[size] || sizeConfig.md;

  const glowStyles = glow
    ? "drop-shadow-[0_4px_14px_rgba(128,0,32,0.18)] dark:drop-shadow-[0_0_18px_rgba(163,13,54,0.4)]"
    : "";

  const emblemElement = (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center transition-all duration-300",
        glowStyles
      )}
      style={{ width: cfg.iconSize, height: cfg.iconSize }}
    >
      <Image
        src="/images/logo-icon.png"
        alt="شعار منصة الخلاصة"
        width={cfg.iconSize * 2}
        height={cfg.iconSize * 2}
        priority={priority}
        className="w-full h-full object-contain filter select-none transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );

  let content: React.ReactNode = null;

  if (variant === "icon") {
    content = emblemElement;
  } else if (variant === "full") {
    content = (
      <div
        className={cn(
          "relative flex flex-col items-center justify-center select-none transition-all duration-300",
          glowStyles
        )}
        style={{ width: cfg.fullWidth, height: cfg.fullHeight }}
      >
        <Image
          src="/images/logo-full.png"
          alt="شعار الخلاصة التعليمية"
          width={cfg.fullWidth * 2}
          height={cfg.fullHeight * 2}
          priority={priority}
          className="w-full h-full object-contain filter transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  } else {
    // variant === "combined" (default)
    const titleColors =
      surfaceTheme === "dark"
        ? "text-white group-hover:text-[#FB7185]"
        : surfaceTheme === "light"
        ? "text-[#12263F] group-hover:text-[#800020]"
        : "text-[#12263F] dark:text-[#F5F7FB] group-hover:text-[#800020] dark:group-hover:text-[#FB7185]";

    const subtitleColors =
      surfaceTheme === "dark"
        ? "text-[#94A3B8]"
        : surfaceTheme === "light"
        ? "text-[#64748B]"
        : "text-[#64748B] dark:text-[#94A3B8]";

    content = (
      <div className={cn("flex items-center text-right select-none", cfg.gapClass)}>
        {emblemElement}
        <div className="flex flex-col justify-center">
          <span
            className={cn(
              "font-extrabold leading-tight tracking-tight block transition-colors",
              titleColors,
              cfg.titleClass
            )}
          >
            الخلاصة
          </span>
          {showSubtitle && (
            <span
              className={cn(
                "font-medium block -mt-0.5 tracking-normal transition-colors",
                subtitleColors,
                cfg.subtitleClass
              )}
            >
              {subtitleText}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#800020] rounded-xl transition-transform active:scale-[0.98]",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("inline-flex items-center group", className)}>
      {content}
    </div>
  );
}
