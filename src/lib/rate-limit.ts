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
export function formatArabicWaitTime(seconds: number): string {
  const safeSeconds = Math.max(1, Math.ceil(seconds));
  if (safeSeconds < 60) {
    if (safeSeconds === 1) return "ثانية واحدة";
    if (safeSeconds === 2) return "ثانيتين";
    if (safeSeconds >= 3 && safeSeconds <= 10) return `${safeSeconds} ثوانٍ`;
    return `${safeSeconds} ثانية`;
  }
  const mins = Math.ceil(safeSeconds / 60);
  if (mins === 1) return "دقيقة واحدة";
  if (mins === 2) return "دقيقتين";
  if (mins >= 3 && mins <= 10) return `${mins} دقائق`;
  return `${mins} دقيقة`;
}

export function parseRetryAfterCode(code?: string | null): number | null {
  if (!code) return null;
  const m = /^RETRY_AFTER_(\d+)$/.exec(code);
  return m ? Number(m[1]) : null;
}

export function buildRateLimitError(retryAfterSeconds: number) {
  const safeSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  const err = tooManyRequests(
    `تم إيقاف المحاولات مؤقتاً لحماية حسابك لمدة (${safeSeconds} ثانية — ${formatArabicWaitTime(safeSeconds)}) بعد تكرار محاولات غير صحيحة. حسابك سليم وغير معطّل، ويمكنك إعادة المحاولة فور انتهاء الوقت.`
  );
  err.code = `RETRY_AFTER_${safeSeconds}`;
  return err;
}

export function computeRateLimitWindow(
  existingHits: number[],
  limit: number,
  windowMs: number,
  now: number
): { allowed: boolean; activeHits: number[]; retryAfter: number } {
  const activeHits = existingHits.filter((t) => now - t < windowMs);
  if (activeHits.length >= limit) {
    const retryAfter = Math.max(1, Math.ceil((activeHits[0] + windowMs - now) / 1000));
    return { allowed: false, activeHits, retryAfter };
  }
  return { allowed: true, activeHits, retryAfter: 0 };
}

function sweepExpiredBuckets(now: number): void {
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [k, hits] of buckets) {
      if (hits.length === 0 || now - hits[hits.length - 1] > 3_600_000) buckets.delete(k);
    }
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): void {
  if (process.env.NODE_ENV === "test") return;
  const effectiveLimit = process.env.NODE_ENV === "production" ? limit : limit * 10;
  const now = Date.now();
  sweepExpiredBuckets(now);
  const state = computeRateLimitWindow(buckets.get(key) ?? [], effectiveLimit, windowMs, now);
  if (!state.allowed) {
    buckets.set(key, state.activeHits);
    throw buildRateLimitError(state.retryAfter);
  }
  state.activeHits.push(now);
  buckets.set(key, state.activeHits);
}

export function assertRateLimitAvailable(key: string, limit: number, windowMs: number): void {
  if (process.env.NODE_ENV === "test") return;
  const effectiveLimit = process.env.NODE_ENV === "production" ? limit : limit * 10;
  const now = Date.now();
  sweepExpiredBuckets(now);
  const state = computeRateLimitWindow(buckets.get(key) ?? [], effectiveLimit, windowMs, now);
  buckets.set(key, state.activeHits);
  if (!state.allowed) {
    throw buildRateLimitError(state.retryAfter);
  }
}

export function recordRateLimitAttempt(key: string, windowMs: number): void {
  if (process.env.NODE_ENV === "test") return;
  const now = Date.now();
  sweepExpiredBuckets(now);
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/** Wraps jsonError to add the Retry-After header for 429s. */
export function withRetryAfter(res: Response, err: unknown): Response {
  const code = (err as { status?: number; code?: string })?.code;
  if ((err as { status?: number })?.status === 429 && code?.startsWith("RETRY_AFTER_")) {
    res.headers.set("Retry-After", code.slice("RETRY_AFTER_".length));
  }
  return res;
}
