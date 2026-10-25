import { describe, expect, it } from "vitest";
import { getClientIp, withRetryAfter } from "@/lib/rate-limit";
import { AppError } from "@/lib/http";

describe("rate-limit utilities", () => {
  it("extracts client IP from x-forwarded-for header", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("falls back to x-real-ip when x-forwarded-for is missing", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "x-real-ip": "198.51.100.1" },
    });
    expect(getClientIp(req)).toBe("198.51.100.1");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    const req = new Request("http://localhost/api/test");
    expect(getClientIp(req)).toBe("unknown");
  });

  it("attaches Retry-After header for 429 errors", () => {
    const res = new Response("Too Many Requests", { status: 429 });
    const err = new AppError(429, "Too Many Requests", "RETRY_AFTER_42");
    withRetryAfter(res, err);
    expect(res.headers.get("Retry-After")).toBe("42");
  });
});
