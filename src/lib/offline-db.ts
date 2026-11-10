// Client-side IndexedDB Utility for Offline PWA Storage (الخلاصة أوفلاين)

const DB_NAME = "kholasa_offline_db";
const DB_VERSION = 1;
const LESSONS_STORE = "offline_lessons";
export const OFFLINE_MEDIA_CACHE = "el-kholasa-media-v1";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(LESSONS_STORE)) {
        db.createObjectStore(LESSONS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface OfflineMediaCacheSummary {
  cachedUrls: string[];
  failedUrls: string[];
  cachedAt: string;
}

export interface OfflineLessonData {
  id: string;
  title: string;
  unitTitle: string;
  subjectName: string;
  subjectColor?: string;
  durationMinutes: number;
  body: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
  pdfUrl?: string | null;
  objectives: string[];
  summary: Record<string, unknown> | null;
  mindMap: Record<string, unknown> | null;
  downloadedAt: string;
  mediaCacheSummary?: OfflineMediaCacheSummary | null;
}

export function normalizeOfflineAssetUrl(
  rawUrl: unknown,
  origin?: string
): string | null {
  if (typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) {
    return trimmed.startsWith("//") ? null : trimmed;
  }

  try {
    const baseOrigin =
      origin || (typeof window !== "undefined" ? window.location.origin : "");
    if (!baseOrigin) return null;
    const parsed = new URL(trimmed, baseOrigin);
    if (parsed.origin !== baseOrigin) return null;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function extractImageUrl(entry: unknown): unknown {
  if (typeof entry === "string") return entry;
  if (entry && typeof entry === "object" && "url" in entry) {
    return (entry as { url?: unknown }).url;
  }
  return null;
}

export function collectOfflineLessonAssetUrls(
  lesson: Pick<OfflineLessonData, "pdfUrl" | "audioUrl" | "summary" | "mindMap">,
  origin?: string
): string[] {
  const urls = new Set<string>();
  const add = (candidate: unknown) => {
    const normalized = normalizeOfflineAssetUrl(candidate, origin);
    if (normalized) urls.add(normalized);
  };

  add(lesson.pdfUrl);
  add(lesson.audioUrl);

  const summary = lesson.summary as { pdfUrl?: unknown; images?: unknown[] } | null;
  if (summary) {
    add(summary.pdfUrl);
    if (Array.isArray(summary.images)) {
      for (const img of summary.images) {
        add(extractImageUrl(img));
      }
    }
  }

  const mindMap = lesson.mindMap as { images?: unknown[] } | null;
  if (mindMap && Array.isArray(mindMap.images)) {
    for (const img of mindMap.images) {
      add(extractImageUrl(img));
    }
  }

  return Array.from(urls);
}

export async function cacheOfflineLessonAssets(
  lesson: OfflineLessonData
): Promise<OfflineMediaCacheSummary> {
  const assetUrls = collectOfflineLessonAssetUrls(lesson);
  const cachedUrls: string[] = [];
  const failedUrls: string[] = [];

  if (
    assetUrls.length === 0 ||
    typeof window === "undefined" ||
    !("caches" in window)
  ) {
    return {
      cachedUrls,
      failedUrls,
      cachedAt: new Date().toISOString(),
    };
  }

  const cache = await window.caches.open(OFFLINE_MEDIA_CACHE);
  const queue = [...assetUrls];
  const workerCount = Math.min(4, queue.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (queue.length > 0) {
        const assetUrl = queue.shift();
        if (!assetUrl) break;
        try {
          const existing = await cache.match(assetUrl);
          if (existing) {
            cachedUrls.push(assetUrl);
            continue;
          }
          const signal =
            typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
              ? AbortSignal.timeout(25_000)
              : undefined;
          const response = await fetch(assetUrl, {
            credentials: "same-origin",
            ...(signal ? { signal } : {}),
          });
          if (response.ok && response.status === 200) {
            await cache.put(assetUrl, response.clone());
            cachedUrls.push(assetUrl);
          } else {
            failedUrls.push(assetUrl);
          }
        } catch {
          failedUrls.push(assetUrl);
        }
      }
    })
  );

  return {
    cachedUrls,
    failedUrls,
    cachedAt: new Date().toISOString(),
  };
}

export async function isOfflineAssetCached(assetUrl: string): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) return false;
  const normalized = normalizeOfflineAssetUrl(assetUrl);
  if (!normalized) return false;
  try {
    const cache = await window.caches.open(OFFLINE_MEDIA_CACHE);
    const match = await cache.match(normalized);
    return Boolean(match);
  } catch {
    return false;
  }
}

async function pruneUnusedOfflineMedia(
  deletedLesson: OfflineLessonData,
  remainingLessons: OfflineLessonData[]
): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  const deletedUrls = collectOfflineLessonAssetUrls(deletedLesson);
  if (deletedUrls.length === 0) return;

  const stillReferenced = new Set<string>();
  for (const item of remainingLessons) {
    for (const url of collectOfflineLessonAssetUrls(item)) {
      stillReferenced.add(url);
    }
  }

  const cache = await window.caches.open(OFFLINE_MEDIA_CACHE);
  for (const url of deletedUrls) {
    if (!stillReferenced.has(url)) {
      await cache.delete(url).catch(() => false);
    }
  }
}

export const offlineStorage = {
  /**
   * Save a lesson package to local IndexedDB and pre-cache same-origin PDFs, audio, and images.
   */
  async saveLesson(lesson: OfflineLessonData): Promise<OfflineMediaCacheSummary> {
    const mediaCacheSummary =
      lesson.mediaCacheSummary ?? (await cacheOfflineLessonAssets(lesson));
    const payload: OfflineLessonData = {
      ...lesson,
      mediaCacheSummary,
    };

    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(LESSONS_STORE, "readwrite");
      const store = tx.objectStore(LESSONS_STORE);
      const req = store.put(payload);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return mediaCacheSummary;
  },

  /**
   * Retrieve a single lesson by ID from IndexedDB
   */
  async getLesson(lessonId: string): Promise<OfflineLessonData | null> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LESSONS_STORE, "readonly");
      const store = tx.objectStore(LESSONS_STORE);
      const req = store.get(lessonId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * List all saved offline lessons
   */
  async listLessons(): Promise<OfflineLessonData[]> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LESSONS_STORE, "readonly");
      const store = tx.objectStore(LESSONS_STORE);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Check if a lesson exists in offline storage
   */
  async hasLesson(lessonId: string): Promise<boolean> {
    const lesson = await this.getLesson(lessonId);
    return !!lesson;
  },

  /**
   * Remove a saved lesson from offline storage and clean unreferenced cached media.
   */
  async deleteLesson(lessonId: string): Promise<void> {
    const existing = await this.getLesson(lessonId).catch(() => null);
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(LESSONS_STORE, "readwrite");
      const store = tx.objectStore(LESSONS_STORE);
      const req = store.delete(lessonId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    if (existing) {
      const remaining = await this.listLessons().catch(() => []);
      await pruneUnusedOfflineMedia(existing, remaining);
    }
  },
};
