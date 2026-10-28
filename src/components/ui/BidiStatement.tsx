"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BidiStatementProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

// Comprehensive tokenization regex:
// 1. Explicit markdown inline code: `...`
// 2. Big-O, Theta, Omega asymptotic notations: O(1), O(n), O(log n), O(n²), O(n^2), O(n log n), O(2^n)
// 3. Programming languages with symbols: C++, C#, .NET, F#, HTML5, CSS3
// 4. Variable declarations and statements (e.g. int x = 13 % 4; or float val = 0.5;)
// 5. I/O statements (e.g. cout << x; or cin >> y;)
// 6. Control flow expressions (e.g. if (x == 10), for (int i = 0; ...))
// 7. Assignment expressions (e.g. x = 13 % 4; or res = a + b;)
// 8. Increment/decrement expressions (e.g. x++; or --count;)
const CODE_TOKEN_REGEX =
  /(`[^`]+`|\b(?:O|Θ|Ω)\s*\([^)]+\)|\bC\+\+|\bC#|\b\.NET|\bF#|\bHTML5|\bCSS3|\b(?:const\s+)?(?:int|float|double|char|bool|string|void|auto|long|short|unsigned)\s+[a-zA-Z0-9_\s*+=%&|<>!/().-]+;?|\b(?:cout|cin)\s*(?:<<|>>)\s*[^;]+;?|\b(?:printf|scanf|return|sizeof)\s*[^;]+;?|\b(?:if|for|while|switch)\s*\([^)]+\)|\b[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^;]+;|\b[a-zA-Z_][a-zA-Z0-9_]*(?:\+\+|--);?)/g;

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
    const isCode =
      text.includes(";") ||
      text.includes("=") ||
      text.includes("++") ||
      text.includes("--") ||
      text.includes("<<") ||
      text.includes(">>") ||
      /^(?:int|float|double|char|bool|string|void|auto|long|short)\b/.test(text) ||
      text.startsWith("`") && text.endsWith("`");

    const cleanText =
      text.startsWith("`") && text.endsWith("`") && text.length > 2
        ? text.slice(1, -1)
        : text;

    if (isCode) {
      return (
        <code
          dir="ltr"
          className={cn(
            "inline-block font-mono font-bold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm whitespace-nowrap mx-1 align-baseline ",
            className
          )}
          style={{ unicodeBidi: "isolate" }}
        >
          {cleanText}
        </code>
      );
    }

    return (
      <Component
        dir="ltr"
        className={cn("leading-relaxed break-words", className)}
        style={{ unicodeBidi: "isolate" }}
      >
        {cleanText}
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
              className="inline-block font-mono font-bold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm whitespace-nowrap mx-1 align-baseline "
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

        // 3. Code statement or expression detected
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
              className="inline-block font-mono font-bold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm whitespace-nowrap mx-1 align-baseline "
              style={{ unicodeBidi: "isolate" }}
            >
              {token.trim()}
            </code>
          );
        }

        // 4. Regular text (Arabic or neutral punctuation)
        return (
          <span key={index} style={{ unicodeBidi: "isolate" }}>
            {token}
          </span>
        );
      })}
    </Component>
  );
}
