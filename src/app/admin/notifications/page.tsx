import { redirect } from "next/navigation";
import { getCurrentUser, canManageAnnouncements } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/services/notification.service";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminNotificationsClient } from "@/components/admin/notifications/AdminNotificationsClient";

export const metadata = {
  title: "إدارة الإعلانات والإشعارات | منصة الخلاصة",
  description: "إرسال الإعلانات والتنبيهات المباشرة وبث إشعارات المتصفح للطلاب",
};

export default async function AdminNotificationsPage() {
  const user = await getCurrentUser();
  if (!user || !canManageAnnouncements(user.role)) {
    redirect("/admin");
  }

  const [announcementsData, grades, pushSubscribersCount] = await Promise.all([
    NotificationService.listAdminAnnouncements({ page: 1, limit: 30 }),
    prisma.grade.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { order: "asc" },
    }),
    prisma.pushSubscription.count(),
  ]);

  // Serialize createdAt dates for client
  const serializedAnnouncements = announcementsData.items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    expiresAt: item.expiresAt ? item.expiresAt.toISOString() : null,
  }));

  return (
    <AdminShell user={user}>
      <AdminNotificationsClient
        initialAnnouncements={serializedAnnouncements}
        grades={grades}
        pushSubscribersCount={pushSubscribersCount}
      />
    </AdminShell>
  );
}
