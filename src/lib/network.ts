/**
 * Network utilities optimized for high-latency, fluctuating, and slow mobile connections.
 * Automatically retries transient network drops and prevents duplicate in-flight requests.
 */

interface FetchRetryOptions extends RequestInit {
  maxRetries?: number;
  timeoutMs?: number;
  retryDelayMs?: number;
}

// In-flight request tracker to prevent double-submissions on slow connections
const inFlightRequests = new Set<string>();

export async function fetchWithRetry(
  url: string,
  options: FetchRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 2,
    timeoutMs = 12000,
    retryDelayMs = 500,
    ...fetchOptions
  } = options;

  // Deduplicate identical POST mutations that may be double-tapped on mobile
  const isPost = (fetchOptions.method || "GET").toUpperCase() === "POST";
  const requestFingerprint = isPost && typeof fetchOptions.body === "string"
    ? `${url}::${fetchOptions.body}`
    : null;

  if (requestFingerprint && inFlightRequests.has(requestFingerprint)) {
    // Wait briefly for the in-flight request to settle instead of duplicating
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  if (requestFingerprint) {
    inFlightRequests.add(requestFingerprint);
  }

  let attempt = 0;

  try {
    while (true) {
      // Check if browser is strictly offline before wasting time
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("لا يوجد اتصال بالإنترنت حالياً، يرجى التحقق من اتصالك والمحاولة مرة أخرى.");
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });
        clearTimeout(timer);

        // If server returned temporary 502/503/504 (e.g. during deployment restart), retry
        if (
          (res.status === 502 || res.status === 503 || res.status === 504) &&
          attempt < maxRetries
        ) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, attempt * retryDelayMs));
          continue;
        }

        return res;
      } catch (err: any) {
        clearTimeout(timer);
        attempt++;

        const isAbort = err?.name === "AbortError";
        const isNetworkFailure =
          isAbort ||
          err?.message?.includes("Failed to fetch") ||
          err?.message?.includes("NetworkError") ||
          err?.message?.includes("Load failed") ||
          err?.message?.includes("network");

        if (attempt > maxRetries || !isNetworkFailure) {
          if (isAbort) {
            throw new Error(
              "استغرق الاتصال وقتاً أطول من المعتاد بسبب بطء الإنترنت، يرجى المحاولة مرة أخرى."
            );
          }
          throw err;
        }

        // Exponential backoff before next retry (e.g. 500ms, 1000ms)
        await new Promise((resolve) => setTimeout(resolve, attempt * retryDelayMs));
      }
    }
  } finally {
    if (requestFingerprint) {
      inFlightRequests.delete(requestFingerprint);
    }
  }
}

