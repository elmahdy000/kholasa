import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
  } catch (error) {
    return jsonError(error);
  }
}
