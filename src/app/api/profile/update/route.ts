import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, systemId, gradeId, trackId } = body;

    // Validate that grade belongs to system if both provided
    if (systemId && gradeId) {
      const grade = await prisma.grade.findFirst({
        where: { id: gradeId, systemId },
      });
      if (!grade) {
        return NextResponse.json(
          { error: "الصف الدراسي غير تابع للنظام المختار" },
          { status: 400 }
        );
      }
    }

    // Validate track belongs to grade if provided
    if (trackId && gradeId) {
      const track = await prisma.academicTrack.findFirst({
        where: { id: trackId, gradeId },
      });
      if (!track) {
        return NextResponse.json(
          { error: "المسار الدراسي غير تابع للصف المختار" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(systemId ? { systemId } : {}),
        ...(gradeId ? { gradeId } : {}),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "تعذر تحديث البيانات الشخصية" }, { status: 500 });
  }
}
