import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

export async function GET() {
  try {
    const publicKey = NotificationService.getPublicKey();
    return NextResponse.json({ publicKey });
  } catch (err) {
    console.error("VAPID public key fetch error:", err);
    return NextResponse.json({ error: "تعذر جلب مفتاح الإشعارات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول لتفعيل الإشعارات" }, { status: 401 });
    }

    const body = await req.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "بيانات الاشتراك غير صالحة" }, { status: 400 });
    }

    const saved = await NotificationService.savePushSubscription(user.id, subscription, userAgent);
    return NextResponse.json({ success: true, subscriptionId: saved.id });
  } catch (err) {
    console.error("Push subscribe error:", err);
    return NextResponse.json({ error: "فشل حفظ اشتراك الإشعارات" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (endpoint) {
      await NotificationService.removePushSubscription(endpoint);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push unsubscribe error:", err);
    return NextResponse.json({ error: "فشل إلغاء الاشتراك" }, { status: 500 });
  }
}
