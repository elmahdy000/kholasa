"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BidiStatementProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

// Comprehensive tokenization regex for mixed Arabic/English text:
// 1. Explicit markdown inline code: `...`
// 2. Big-O, Theta, Omega asymptotic notations: O(1), O(n), O(log n), O(n²), O(n^2), O(n log n), O(2^n)
// 3. Programming languages with symbols: C++, C#, .NET, F#, HTML5, CSS3
// 4. Parenthesized English phrases / terms: (RAM), (Virtual Private Network)
// 5. Multi-word Latin / English phrases or alphanumeric terms: Virtual Private Network, 100 Mbps, DDoS
// 6. Explicit programming language statements: int x = 13 % 4; or cout << x;
const CODE_TOKEN_REGEX =
  /(`[^`]+`|\b(?:O|Θ|Ω)\s*\([^)]+\)|\bC\+\+|\bC#|\b\.NET|\bF#|\bHTML5|\bCSS3|\([A-Za-z0-9_\s&+/.:,-]+\)|[A-Za-z0-9][A-Za-z0-9_&+/.:,-]*(?:\s+[A-Za-z0-9][A-Za-z0-9_&+/.:,-]+)*|\b(?:const\s+)?(?:int|float|double|char|bool|string|void|auto|long|short|unsigned)\s+[a-zA-Z0-9_\s*+=%&|<>!/().-]+;?|\b(?:cout|cin)\s*(?:<<|>>)\s*[^;]+;?|\b(?:printf|scanf|return|sizeof)\s*[^;]+;?|\b(?:if|for|while|switch)\s*\([^)]+\)|\b[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^;]+;|\b[a-zA-Z_][a-zA-Z0-9_]*(?:\+\+|--);?)/g;

export function BidiStatement({
  text,
  className,
  as: Component = "span",
}: BidiStatementProps) {
  if (!text) return null;

  const hasArabic = /[\u0600-\u06FF]/.test(text);

  // If the text contains NO Arabic characters (pure English, pure code, numbers, or symbols),
  // render it strictly with dir="ltr" and isolate so neutral punctuation (like semicolon ';')
  // or operators (like '++') never jump to the wrong side in an RTL page context.
  if (!hasArabic) {
    // 1. If the entire text is explicitly wrapped in markdown backticks: `code`
    if (text.startsWith("`") && text.endsWith("`") && text.length > 2) {
      const cleanCode = text.slice(1, -1);
      return (
        <code
          dir="ltr"
          className={cn(
            "inline-block font-mono font-bold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] px-2 py-0.5 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm break-words [overflow-wrap:anywhere] whitespace-pre-wrap max-w-full align-baseline",
            className
          )}
          style={{ unicodeBidi: "isolate" }}
        >
          {cleanCode}
        </code>
      );
    }

    // 2. If it contains inline backticks like: "The output of `cout << x;` is:"
    if (text.includes("`")) {
      const parts = text.split(/(`[^`]+`)/g);
      return (
        <Component
          dir="ltr"
          className={cn("leading-relaxed break-words", className)}
          style={{ unicodeBidi: "isolate" }}
        >
          {parts.map((part, pIdx) => {
            if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
              return (
                <code
                  key={pIdx}
                  dir="ltr"
                  className="inline-block font-mono font-bold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] px-1.5 py-0.5 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm break-words [overflow-wrap:anywhere] whitespace-pre-wrap max-w-full align-baseline mx-0.5"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return <React.Fragment key={pIdx}>{part}</React.Fragment>;
          })}
        </Component>
      );
    }

    // 3. Normal English / Latin text (including sentences with semicolons ';', colons ':', equals '=', formulas)
    return (
      <Component
        dir="ltr"
        className={cn("leading-relaxed break-words", className)}
        style={{ unicodeBidi: "isolate" }}
      >
        {text}
      </Component>
    );
  }

  // Mixed text (Arabic with embedded code / English / tokens)
  const tokens = text.split(CODE_TOKEN_REGEX);

  return (
    <Component
      className={cn("leading-relaxed font-content break-words", className)}
      style={{ unicodeBidi: "isolate" }}
      dir="auto"
    >
      {tokens.map((token, index) => {
        if (!token) return null;

        // 1. Explicit markdown inline code: `...`
        if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
          const rawCode = token.slice(1, -1);
          return (
            <code
              key={index}
              dir="ltr"
              className="inline-block font-mono font-bold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] px-2 py-0.5 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm break-words [overflow-wrap:anywhere] whitespace-pre-wrap max-w-full mx-1 align-baseline"
              style={{ unicodeBidi: "isolate" }}
            >
              {rawCode}
            </code>
          );
        }

        // 2. Big-O, Theta, Omega Asymptotic Notations
        if (/^(?:O|Θ|Ω)\s*\([^)]+\)$/.test(token)) {
          return (
            <bdi
              key={index}
              dir="ltr"
              className="inline-block font-mono font-bold text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 dark:bg-[#1E293B] px-1.5 py-0.5 rounded border border-[#800020]/20 dark:border-[#FB7185]/30 text-[13px] sm:text-sm mx-1 align-baseline whitespace-nowrap"
              style={{ unicodeBidi: "isolate" }}
            >
              {token.trim()}
            </bdi>
          );
        }

        // 3. Language tokens (C++, C#, .NET, F#, HTML5, CSS3)
        if (
          token === "C++" ||
          token === "C#" ||
          token === ".NET" ||
          token === "F#" ||
          token === "HTML5" ||
          token === "CSS3"
        ) {
          return (
            <bdi
              key={index}
              dir="ltr"
              className="inline-block font-sans font-bold text-[#800020] dark:text-[#FB7185] mx-1"
              style={{ unicodeBidi: "isolate" }}
            >
              {token}
            </bdi>
          );
        }

        // 4. Parenthesized English / Latin phrase (e.g. (CIA Triad & Threats), (RAM), (API))
        if (/^\([A-Za-z0-9_\s&+/.:,-]+\)$/.test(token)) {
          const isShort = token.length <= 25;
          return (
            <bdi
              key={index}
              dir="ltr"
              className={cn("inline mx-1 font-sans", isShort ? "whitespace-nowrap" : "break-words")}
              style={{ unicodeBidi: "isolate" }}
            >
              {token}
            </bdi>
          );
        }

        // 5. Multi-word or single Latin/English phrase or alphanumeric term (e.g. Virtual Private Network, DDoS, 100 Mbps)
        if (/^[A-Za-z0-9][A-Za-z0-9_&+/.:,-]*(?:\s+[A-Za-z0-9][A-Za-z0-9_&+/.:,-]+)*$/.test(token)) {
          return (
            <bdi
              key={index}
              dir="ltr"
              className="inline font-sans mx-1"
              style={{ unicodeBidi: "isolate" }}
            >
              {token}
            </bdi>
          );
        }

        // 6. Code statement or expression detected
        const isMatchedCode =
          /^(?:const\s+)?(?:int|float|double|char|bool|string|void|auto|long|short|unsigned)\s+[a-zA-Z0-9_\s*+=%&|<>!/().-]+;?$/.test(
            token
          ) ||
          /^(?:cout|cin)\s*(?:<<|>>)\s*[^;]+;?$/.test(token) ||
          /^(?:printf|scanf|return|sizeof)\s*[^;]+;?$/.test(token) ||
          /^(?:if|for|while|switch)\s*\([^)]+\)$/.test(token) ||
          /^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^;]+;$/.test(token) ||
          /^[a-zA-Z_][a-zA-Z0-9_]*(?:\+\+|--);?$/.test(token);

        if (isMatchedCode) {
          return (
            <code
              key={index}
              dir="ltr"
              className="inline-block font-mono font-bold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] px-2 py-0.5 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm break-words [overflow-wrap:anywhere] whitespace-pre-wrap max-w-full mx-1 align-baseline"
              style={{ unicodeBidi: "isolate" }}
            >
              {token.trim()}
            </code>
          );
        }

        // 7. Regular text (Arabic or neutral punctuation)
        return (
          <span key={index} style={{ unicodeBidi: "isolate" }}>
            {token}
          </span>
        );
      })}
    </Component>
  );
}
