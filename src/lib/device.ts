/**
 * Device fingerprint / identifier helper for student account security & device binding.
 * Generates and persists a unique client device ID in localStorage and cookie.
 */

const DEVICE_STORAGE_KEY = "kholasa_device_id";

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    let deviceId = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!deviceId || deviceId.trim().length < 8) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        deviceId = "dev_" + crypto.randomUUID().replace(/-/g, "");
      } else {
        const rand = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        deviceId = "dev_" + Date.now().toString(36) + rand;
      }
      localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
    }

    // Set cookie so server-side requests / server components can read device context if needed
    try {
      document.cookie = `${DEVICE_STORAGE_KEY}=${deviceId}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    } catch {
      // ignore in restricted contexts
    }

    return deviceId;
  } catch {
    return "";
  }
}

