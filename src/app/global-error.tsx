"use client";

import { useEffect } from "react";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // global-error replaces the root layout, so it carries its own document and inline styles.
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#F8FAFC",
          color: "#0F172A",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif",
        }}
      >
        <title>حدث خطأ | الخلاصة</title>
        <div
          role="alert"
          style={{
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 16,
            padding: 32,
          }}
        >
          <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>حدث خطأ غير متوقع</h1>
          <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, margin: "0 0 20px" }}>
            تعذّر تحميل التطبيق. حاول مرة أخرى بعد قليل.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              height: 40,
              padding: "0 20px",
              borderRadius: 12,
              border: 0,
              background: "#4F46E5",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            حاول مرة أخرى
          </button>
        </div>
      </body>
    </html>
  );
}
