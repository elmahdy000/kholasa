import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "التسجيل المباشر مغلق حالياً. يرجى التواصل مع إدارة المنصة أو المساعد للحصول على كود تفعيل معتمد.",
    },
    { status: 403 }
  );
}
