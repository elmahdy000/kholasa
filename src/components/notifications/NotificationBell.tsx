"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Checks,
  Flame,
  WarningCircle,
  BookOpen,
  Megaphone,
  X,
  Broadcast,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface InAppNotificationItem {
  id: string;
  type:
    | "DAILY_EXAM"
    | "MISTAKES"
    | "PROGRESS"
    | "SYSTEM"
    | "ANNOUNCEMENT"
    | "COURSE_UPDATE"
    | "MISTAKE_REMINDER";
  title: string;
  message: string;
  link: string;
  createdAt: string | Date;
  isUrgent?: boolean;
  isRead?: boolean;
  isPersisted?: boolean;
}

function formatRelativeArabicTime(dateInput: string | Date): string {
  const d = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return "الآن";
  if (diffSec < 3600) return `منذ ${Math.floor(diffSec / 60)} دقيقة`;
  if (diffSec < 86400) return `منذ ${Math.floor(diffSec / 3600)} ساعة`;
  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
}

function getNotificationVisuals(type: string, isUrgent?: boolean) {
  switch (type) {
    case "DAILY_EXAM":
      return {
        icon: Flame,
        bg: "bg-[#FFF8E6] dark:bg-[#3D2C10]/40",
        border: "border-[#FDE68A] dark:border-[#78350F]",
        text: "text-[#B45309] dark:text-[#FCD34D]",
      };
    case "MISTAKES":
      return {
        icon: WarningCircle,
        bg: "bg-[#FFF1F2] dark:bg-[#3E141B]/40",
        border: "border-[#FECDD3] dark:border-[#881337]",
        text: "text-[#BE123C] dark:text-[#FDA4AF]",
      };
    case "PROGRESS":
      return {
        icon: BookOpen,
        bg: "bg-[#F0FDF4] dark:bg-[#0E2F1B]/40",
        border: "border-[#BBF7D0] dark:border-[#14532D]",
        text: "text-[#15803D] dark:text-[#86EFAC]",
      };
    case "ANNOUNCEMENT":
    default:
      return {
        icon: Megaphone,
        bg: isUrgent ? "bg-[#FFF1F2] dark:bg-[#3E141B]/40" : "bg-[#F8FAFC] dark:bg-[#1E293B]",
        border: isUrgent ? "border-[#FECDD3] dark:border-[#881337]" : "border-[#E2E8F0] dark:border-[#334155]",
        text: isUrgent ? "text-[#BE123C] dark:text-[#FDA4AF]" : "text-[#475569] dark:text-[#94A3B8]",
      };
  }
}

// Convert VAPID base64 string to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pushStatus, setPushStatus] = useState<"default" | "granted" | "denied" | "unsupported">("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check initial browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      setPushStatus(Notification.permission);
    } else {
      setPushStatus("unsupported");
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications();
    // Poll notifications every 60 seconds
    const timer = setInterval(() => {
      void fetchNotifications();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAll: true }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } catch (err) {
        console.error("Failed to mark all as read:", err);
      }
    });
  };

  // Mark single as read when clicking link
  const handleItemClick = async (notif: InAppNotificationItem) => {
    if (!notif.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
    setIsOpen(false);
  };

  // Request browser push notification permission and register service worker
  const handleEnablePush = async () => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("متصفحك لا يدعم إشعارات الويب.");
      return;
    }

    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission === "granted") {
        // Register Push Service Worker
        const reg = await navigator.serviceWorker.register("/sw-push.js", { scope: "/" });
        await navigator.serviceWorker.ready;

        // Fetch Public VAPID Key
        const keyRes = await fetch("/api/notifications/push");
        const keyData = await keyRes.json();
        if (!keyData.publicKey) throw new Error("تعذر جلب مفتاح الإشعارات العام");

        // Subscribe with Push Manager
        const convertedKey = urlBase64ToUint8Array(keyData.publicKey);
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });

        // Send subscription to server
        await fetch("/api/notifications/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: sub.toJSON(),
            userAgent: navigator.userAgent,
          }),
        });
      }
    } catch (err) {
      console.error("Web push enablement error:", err);
      alert("حدث خطأ أثناء تفعيل إشعارات المتصفح، تأكد من إعطاء الصلاحية في إعدادات المتصفح.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const hasUrgent = notifications.some((n) => n.isUrgent && !n.isRead);

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB] hover:border-[#800020]/40 dark:hover:border-[#A30D36]/60 transition-colors cursor-pointer",
          isOpen && "border-[#800020] dark:border-[#A30D36] text-[#800020] dark:text-[#F5F7FB]"
        )}
        title="الإشعارات والتنبيهات"
        aria-label="الإشعارات"
        aria-expanded={isOpen}
      >
        <Bell className={cn("w-4 h-4", hasUrgent && "text-[#800020] dark:text-[#FDA4AF]")} weight={unreadCount > 0 ? "fill" : "bold"} />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#800020] dark:bg-[#A30D36] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#081426] shadow-xs">
            {unreadCount > 9 ? "+9" : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[400px] max-w-[420px] bg-white dark:bg-[#0D1B2E] border border-[#E8E9ED] dark:border-[#22364F] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-[#E8E9ED] dark:border-[#22364F] flex items-center justify-between bg-[#F7F8FA] dark:bg-[#10233A]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#12263F] dark:text-[#F5F7FB]">الإشعارات</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#800020]/10 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#FDA4AF]">
                  {unreadCount} جديد
                </span>
              ) : (
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">لا توجد غير مقروءة</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="px-2 py-1 text-xs text-[#800020] dark:text-[#FDA4AF] hover:bg-[#800020]/5 dark:hover:bg-[#A30D36]/10 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="تحديد الكل كمقروء"
                >
                  <Checks className="w-3.5 h-3.5" weight="bold" />
                  <span>قراءة الكل</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-[#64748B] hover:text-[#12263F] dark:text-[#94A3B8] dark:hover:text-[#F5F7FB] transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Web Push Prompt Banner */}
          {pushStatus === "default" && (
            <div className="p-3 bg-linear-to-r from-[#FFF8E6] to-[#FEF3C7] dark:from-[#2B1D0C] dark:to-[#1C1307] border-b border-[#FDE68A] dark:border-[#78350F] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Broadcast className="w-4 h-4 text-[#D97706] shrink-0" weight="fill" />
                <span className="text-[#92400E] dark:text-[#FDE68A] font-medium leading-tight">
                  فعّل إشعارات المتصفح ليصلك تنبيه التحدي اليومي والمذاكرة
                </span>
              </div>
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={isSubscribing}
                className="px-2.5 py-1 bg-[#800020] hover:bg-[#600018] text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubscribing ? "جاري..." : "تفعيل"}
              </button>
            </div>
          )}

          {/* Notifications Scrollable List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E8E9ED]/70 dark:divide-[#22364F]/70">
            {isLoading ? (
              <div className="py-10 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                جاري تحميل الإشعارات...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F7F8FA] dark:bg-[#10233A] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8]">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-[#12263F] dark:text-[#F5F7FB]">لا توجد إشعارات حالياً</h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  أنت على اطلاع بكل جديد ودروسك وتحدياتك اليومية محدثة.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const visual = getNotificationVisuals(notif.type, notif.isUrgent);
                const Icon = visual.icon;

                return (
                  <Link
                    key={notif.id}
                    href={notif.link}
                    onClick={() => handleItemClick(notif)}
                    className={cn(
                      "block p-3.5 transition-colors hover:bg-[#F7F8FA] dark:hover:bg-[#10233A] relative",
                      !notif.isRead && "bg-[#800020]/[0.02] dark:bg-[#A30D36]/[0.04]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                          visual.bg,
                          visual.border,
                          visual.text
                        )}
                      >
                        <Icon className="w-5 h-5" weight={notif.isUrgent ? "fill" : "bold"} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5
                            className={cn(
                              "text-xs truncate",
                              !notif.isRead
                                ? "font-bold text-[#12263F] dark:text-[#F5F7FB]"
                                : "font-medium text-[#475569] dark:text-[#94A3B8]"
                            )}
                          >
                            {notif.title}
                          </h5>
                          <span className="text-[10px] text-[#94A3B8] shrink-0 font-sans">
                            {formatRelativeArabicTime(notif.createdAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#800020] dark:bg-[#A30D36] shrink-0 mt-1" />
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-2.5 bg-[#F7F8FA] dark:bg-[#10233A] border-t border-[#E8E9ED] dark:border-[#22364F] flex items-center justify-between text-xs">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-[#800020] dark:text-[#FDA4AF] hover:underline"
            >
              الانتقال للوحة الطالب ←
            </Link>
            <span className="text-[10px] text-[#94A3B8]">منصة الخلاصة التعليمية</span>
          </div>
        </div>
      )}
    </div>
  );
}
