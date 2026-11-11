"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
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
import { useToast } from "@/components/ui/Toast";
import { useRealtimeTopic } from "@/lib/realtime-client";

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
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-200 dark:border-amber-900/40",
        text: "text-amber-700 dark:text-amber-400",
      };
    case "MISTAKES":
      return {
        icon: WarningCircle,
        bg: "bg-rose-50 dark:bg-rose-950/30",
        border: "border-rose-200 dark:border-rose-900/40",
        text: "text-rose-700 dark:text-rose-400",
      };
    case "PROGRESS":
      return {
        icon: BookOpen,
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-900/40",
        text: "text-emerald-700 dark:text-emerald-400",
      };
    case "ANNOUNCEMENT":
    default:
      return {
        icon: Megaphone,
        bg: isUrgent ? "bg-rose-50 dark:bg-rose-950/30" : "bg-slate-100 dark:bg-slate-800",
        border: isUrgent ? "border-rose-200 dark:border-rose-900/40" : "border-slate-200 dark:border-slate-700",
        text: isUrgent ? "text-rose-700 dark:text-rose-400" : "text-slate-600 dark:text-slate-300",
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
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
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

  // Fetch notifications cleanly with no-store
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
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
  }, []);

  useEffect(() => {
    void fetchNotifications();
    const timer = setInterval(() => {
      void fetchNotifications();
    }, 60000);

    const handleResume = () => {
      if (document.visibilityState === "visible") {
        void fetchNotifications();
      }
    };
    const handleFocus = () => {
      void fetchNotifications();
    };

    document.addEventListener("visibilitychange", handleResume);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleResume);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchNotifications]);

  // Real-time push via shared SSE event stream
  useRealtimeTopic(["notifications", "users"], () => {
    void fetchNotifications();
  });

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
        const res = await fetch("/api/notifications", {
          method: "PATCH",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAll: true }),
        });
        if (!res.ok) {
          toast.error("تعذر تحديد الإشعارات كمقروءة");
          return;
        }
        setNotifications((prev) =>
          prev.map((n) => (n.isPersisted ? { ...n, isRead: true } : n))
        );
        await fetchNotifications();
        toast.success("تم تحديد كافة الإشعارات كمقروءة");
      } catch (err) {
        console.error("Failed to mark all as read:", err);
        toast.error("تعذر تحديث حالة الإشعارات");
      }
    });
  };

  // Mark single item as read on click
  const handleItemClick = async (notif: InAppNotificationItem) => {
    setIsOpen(false);
    if (!notif.isRead && notif.isPersisted) {
      try {
        const res = await fetch("/api/notifications", {
          method: "PATCH",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id }),
        });
        if (res.ok) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }
  };

  // Request browser push notification permission and subscribe using unified /sw.js
  const handleEnablePush = async () => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      toast.warning("متصفحك لا يدعم إشعارات الويب");
      return;
    }

    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission === "granted") {
        // Use unified PWA + Web Push Service Worker (/sw.js)
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await reg.update().catch(() => {});
        await navigator.serviceWorker.ready;

        // Fetch Public VAPID Key
        const keyRes = await fetch("/api/notifications/push", { cache: "no-store" });
        const keyData = await keyRes.json();
        if (!keyData.publicKey) throw new Error("تعذر جلب مفتاح الإشعارات العام");

        // Subscribe with Push Manager
        const existingSub = await reg.pushManager.getSubscription();
        const convertedKey = urlBase64ToUint8Array(keyData.publicKey);
        const sub =
          existingSub ||
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          }));

        // Send subscription to server
        const saveRes = await fetch("/api/notifications/push", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: sub.toJSON(),
            userAgent: navigator.userAgent,
          }),
        });
        if (!saveRes.ok) {
          throw new Error("فشل حفظ اشتراك الإشعارات");
        }

        toast.success("تم تفعيل إشعارات المتصفح بنجاح!");
      } else {
        toast.warning("تم رفض إذن الإشعارات من إعدادات المتصفح");
      }
    } catch (err) {
      console.error("Web push enablement error:", err);
      toast.error("حدث خطأ أثناء تفعيل إشعارات المتصفح، يرجى مراجعة إعدادات الأذونات");
    } finally {
      setIsSubscribing(false);
    }
  };

  const hasUrgent = notifications.some((n) => n.isUrgent && !n.isRead);
  const displayedNotifications =
    activeTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) void fetchNotifications();
        }}
        className={cn(
          "relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer shadow-2xs",
          isOpen && "border-[#800B34] dark:border-[#FB7185] text-[#800B34] dark:text-[#FB7185]"
        )}
        title="الإشعارات والتنبيهات"
        aria-label="الإشعارات"
        aria-expanded={isOpen}
      >
        <Bell
          className={cn("w-4 h-4", hasUrgent && "text-[#800B34] dark:text-[#FB7185]")}
          weight={unreadCount > 0 ? "fill" : "bold"}
        />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#800B34] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0F172A] shadow-xs">
            {unreadCount > 9 ? "+9" : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Dropdown Menu */}
      {isOpen && (
        <>
          {/* Mobile backdrop to easily dismiss */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-16 sm:top-auto sm:end-0 mt-0 sm:mt-2 sm:w-[380px] max-w-[420px] mx-auto sm:mx-0 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">الإشعارات والتنبيهات</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185]">
                  {unreadCount} جديد
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="px-2 py-1 text-xs text-[#800B34] dark:text-[#FB7185] hover:bg-[#800B34]/10 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="تحديد الكل كمقروء"
                >
                  <Checks className="w-3.5 h-3.5" weight="bold" />
                  <span>قراءة الكل</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs (الكل / غير المقروءة) */}
          <div className="flex items-center gap-1 p-1.5 px-3 bg-slate-50/40 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer",
                activeTab === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-700/60"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              الكل ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={cn(
                "px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer",
                activeTab === "unread"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-700/60"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              غير المقروءة ({unreadCount})
            </button>
          </div>

          {/* Web Push Prompt Banner */}
          {pushStatus === "default" && (
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Broadcast className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" weight="fill" />
                <span className="text-amber-900 dark:text-amber-200 font-medium leading-tight text-[11px]">
                  فعّل إشعارات المتصفح للتنبيه عند نزول الامتحانات والمراجعات
                </span>
              </div>
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={isSubscribing}
                className="px-2.5 py-1 bg-[#800B34] hover:bg-[#680829] text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubscribing ? "جاري..." : "تفعيل"}
              </button>
            </div>
          )}

          {/* Notifications Scrollable List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                جاري تحميل الإشعارات...
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {activeTab === "unread" ? "لا توجد إشعارات غير مقروءة" : "لا توجد إشعارات حالياً"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  أنت على اطلاع دائم بجميع تحديثات المنصة والدروس.
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const visual = getNotificationVisuals(notif.type, notif.isUrgent);
                const Icon = visual.icon;

                return (
                  <Link
                    key={notif.id}
                    href={notif.link}
                    onClick={() => handleItemClick(notif)}
                    className={cn(
                      "block p-3.5 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 relative",
                      !notif.isRead && "bg-slate-50/50 dark:bg-slate-800/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                          visual.bg,
                          visual.border,
                          visual.text
                        )}
                      >
                        <Icon className="w-4 h-4" weight={notif.isUrgent ? "fill" : "bold"} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5
                            className={cn(
                              "text-xs truncate",
                              !notif.isRead
                                ? "font-bold text-slate-900 dark:text-slate-100"
                                : "font-medium text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {notif.title}
                          </h5>
                          <span className="text-[10px] text-slate-400 shrink-0 font-sans">
                            {formatRelativeArabicTime(notif.createdAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#800B34] dark:bg-[#FB7185] shrink-0 mt-1" />
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-2.5 px-4 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-[#800B34] dark:text-[#FB7185] hover:underline"
            >
              الانتقال للوحة الطالب ←
            </Link>
            <span className="text-[10px] text-slate-400">منصة الخلاصة</span>
          </div>
        </div>
      </>
    )}
  </div>
);
}
