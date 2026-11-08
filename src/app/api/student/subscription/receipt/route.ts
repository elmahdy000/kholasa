import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized, badRequest, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { MediaService } from "@/services/media.service";
import { AnalyticsService } from "@/services/analytics.service";

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024; // 10 MB limit for receipt photos

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("يرجى تسجيل الدخول أولاً للمتابعة");

    const formData = await req.formData();
    const file = formData.get("file");
    const senderPhone = (formData.get("senderPhone") as string)?.trim() || null;
    const reference = (formData.get("reference") as string)?.trim() || null;

    if (!(file instanceof File)) {
      throw badRequest("يرجى اختيار صورة إيصال التحويل");
    }

    if (file.size > MAX_RECEIPT_BYTES) {
      throw badRequest("حجم صورة الإيصال يتجاوز الحد المسموح به (10 ميجابايت)");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await MediaService.saveUploadedBuffer(buffer, file.name, file.type);

    // Update user subscription & payment verification state
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        paymentReceiptUrl: uploaded.url,
        paymentSenderPhone: senderPhone,
        paymentReference: reference,
        paymentUploadedAt: new Date(),
        subscriptionStatus: "PENDING_VERIFICATION",
      },
      select: {
        id: true,
        name: true,
        loginCode: true,
        subscriptionStatus: true,
        paymentReceiptUrl: true,
        paymentSenderPhone: true,
        paymentReference: true,
        paymentUploadedAt: true,
      },
    });

    // Log action to audit logs
    await AnalyticsService.logAuditAction(
      user.id,
      "UPLOAD",
      "subscription_receipt",
      uploaded.filename,
      {
        senderPhone,
        reference,
        fileSize: uploaded.size,
      }
    ).catch(() => null);

    return NextResponse.json({
      success: true,
      message: "تم رفع إيصال الدفع بنجاح! سيتم مراجعته وتفعيل حسابك في أقرب وقت.",
      user: updatedUser,
    });
  } catch (error) {
    return jsonError(error);
  }
}
