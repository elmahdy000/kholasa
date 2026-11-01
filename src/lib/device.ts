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
      const entropy = `${Date.now()}_${Math.random().toString(36).slice(2)}_${window.screen?.width || 0}x${window.screen?.height || 0}_${navigator.userAgent.slice(0, 40)}`;
      deviceId = "dev_" + btoa(entropy).replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);
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

