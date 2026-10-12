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
// 2. Programming languages with symbols: C++, C#, .NET, F#
// 3. Variable declarations and statements (e.g. int x = 13 % 4; or float val = 0.5;)
// 4. I/O statements (e.g. cout << x; or cin >> y;)
// 5. Control flow expressions (e.g. if (x == 10), for (int i = 0; ...))
// 6. Assignment expressions (e.g. x = 13 % 4; or res = a + b;)
// 7. Increment/decrement expressions (e.g. x++; or --count;)
const CODE_TOKEN_REGEX =
  /(`[^`]+`|\bC\+\+|\bC#|\b\.NET|\bF#|\b(?:const\s+)?(?:int|float|double|char|bool|string|void|auto|long|short|unsigned)\s+[a-zA-Z0-9_\s*+=%&|<>!/().-]+;?|\b(?:cout|cin)\s*(?:<<|>>)\s*[^;]+;?|\b(?:printf|scanf|return|sizeof)\s*[^;]+;?|\b(?:if|for|while|switch)\s*\([^)]+\)|\b[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^;]+;|\b[a-zA-Z_][a-zA-Z0-9_]*(?:\+\+|--);?)/g;

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
            "inline-block font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs sm:text-sm whitespace-nowrap mx-0.5 align-baseline shadow-2xs",
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
        className={cn("leading-relaxed", className)}
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
      className={cn("leading-relaxed font-content", className)}
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
              className="inline-block font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs sm:text-sm whitespace-nowrap mx-1 align-baseline shadow-2xs"
              style={{ unicodeBidi: "isolate" }}
            >
              {rawCode}
            </code>
          );
        }

        // 2. Language tokens (C++, C#, .NET, F#)
        if (
          token === "C++" ||
          token === "C#" ||
          token === ".NET" ||
          token === "F#"
        ) {
          return (
            <bdi
              key={index}
              dir="ltr"
              className="inline-block font-sans font-bold text-indigo-600 dark:text-indigo-400 mx-1"
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
              className="inline-block font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs sm:text-sm whitespace-nowrap mx-1 align-baseline shadow-2xs"
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
