// Client-side IndexedDB Utility for Offline PWA Storage (الخلاصة أوفلاين)

const DB_NAME = "kholasa_offline_db";
const DB_VERSION = 1;
const LESSONS_STORE = "offline_lessons";

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
  objectives: string[];
  summary: Record<string, unknown> | null;
  mindMap: Record<string, unknown> | null;
  downloadedAt: string;
}

export const offlineStorage = {
  /**
   * Save a lesson package to local IndexedDB
   */
  async saveLesson(lesson: OfflineLessonData): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LESSONS_STORE, "readwrite");
      const store = tx.objectStore(LESSONS_STORE);
      const req = store.put(lesson);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
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
   * Remove a saved lesson from offline storage
   */
  async deleteLesson(lessonId: string): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LESSONS_STORE, "readwrite");
      const store = tx.objectStore(LESSONS_STORE);
      const req = store.delete(lessonId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
};
