import { NextResponse } from "next/server";
import { CurriculumService } from "@/services/curriculum.service";

export async function GET() {
  try {
    const systems = await CurriculumService.getSystems(true);
    return NextResponse.json({ systems });
  } catch (error) {
    console.error("Failed to fetch systems:", error);
    return NextResponse.json(
      { error: "تعذر تحميل الأنظمة التعليمية" },
      { status: 500 }
    );
  }
}
