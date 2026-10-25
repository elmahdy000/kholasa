import { tooManyRequests } from "@/lib/http";

/**
 * In-memory sliding-window rate limiter.
 * NOTE: state is per server instance. In a multi-instance production
 * deployment, swap this for a shared store (e.g. Redis).
 */
const buckets = new Map<string, number[]>();
let lastSweep = 0;

export function getClientIp(req: Request): string {
  // Prefer the header set by the reverse proxy itself (clients cannot override
  // it when the proxy overwrites incoming values). X-Forwarded-For is only a
  // fallback because its first entry is client-controlled.
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

/** Throws AppError 429 (with retryAfter in code) when the limit is exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number): void {
  if (process.env.NODE_ENV === "test") return;
  const effectiveLimit = process.env.NODE_ENV === "production" ? limit : limit * 10;
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [k, hits] of buckets) {
      if (hits.length === 0 || now - hits[hits.length - 1] > 3_600_000) buckets.delete(k);
    }
  }
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= effectiveLimit) {
    buckets.set(key, hits);
    const retryAfter = Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000));
    const err = tooManyRequests();
    err.code = `RETRY_AFTER_${retryAfter}`;
    throw err;
  }
  hits.push(now);
  buckets.set(key, hits);
}

/** Wraps jsonError to add the Retry-After header for 429s. */
export function withRetryAfter(res: Response, err: unknown): Response {
  const code = (err as { status?: number; code?: string })?.code;
  if ((err as { status?: number })?.status === 429 && code?.startsWith("RETRY_AFTER_")) {
    res.headers.set("Retry-After", code.slice("RETRY_AFTER_".length));
  }
  return res;
}
