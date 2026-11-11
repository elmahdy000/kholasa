export const DEMO_TEMPLATE_CODES = ["DEMO-AR", "DEMO-EN"] as const;
export type DemoTemplateCode = (typeof DEMO_TEMPLATE_CODES)[number];

export const DEMO_SANDBOX_PREFIXES = ["DEMO-AR-", "DEMO-EN-", "DEMO-PRO-"] as const;

export function isDemoTemplateCode(code?: string | null): code is DemoTemplateCode {
  if (!code) return false;
  const upper = code.trim().toUpperCase();
  return (DEMO_TEMPLATE_CODES as readonly string[]).includes(upper);
}

export function isDemoSandboxCode(code?: string | null): boolean {
  if (!code) return false;
  const upper = code.trim().toUpperCase();
  return DEMO_SANDBOX_PREFIXES.some((prefix) => upper.startsWith(prefix));
}

export function isAnyDemoCode(code?: string | null): boolean {
  if (!code) return false;
  return code.trim().toUpperCase().startsWith("DEMO-");
}
