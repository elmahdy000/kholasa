import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";
import { emitRealtimeEvent } from "@/lib/realtime";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, must-revalidate" };

export async function GET() {
  try {
    const publicKey = NotificationService.getPublicKey();
    return NextResponse.json({ publicKey }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("VAPID public key fetch error:", err);
    return NextResponse.json(
      { error: "تعذر جلب مفتاح الإشعارات" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لتفعيل الإشعارات" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const body = await req.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "بيانات الاشتراك غير صالحة" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const saved = await NotificationService.savePushSubscription(
      user.id,
      subscription,
      userAgent
    );
    emitRealtimeEvent({
      topic: "notifications",
      action: "push_subscription_added",
      audience: "staff",
      entityId: saved.id,
    });
    return NextResponse.json(
      { success: true, subscriptionId: saved.id },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Push subscribe error:", err);
    return NextResponse.json(
      { error: "فشل حفظ اشتراك الإشعارات" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { endpoint } = body;

    if (endpoint) {
      await NotificationService.removePushSubscription(endpoint);
      emitRealtimeEvent({
        topic: "notifications",
        action: "push_subscription_removed",
        audience: "staff",
      });
    }
    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("Push unsubscribe error:", err);
    return NextResponse.json(
      { error: "فشل إلغاء الاشتراك" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
