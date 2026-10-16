import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff, canManageStructure } from "@/lib/auth";

// GET: Return full structure tree (Systems -> Grades -> Tracks -> Subjects)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const systems = await prisma.educationalSystem.findMany({
      orderBy: { order: "asc" },
      include: {
        grades: {
          orderBy: { order: "asc" },
          include: {
            tracks: true,
            subjects: {
              orderBy: { order: "asc" },
              include: {
                _count: {
                  select: {
                    units: true,
                    questions: true,
                    exams: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ systems });
  } catch (error) {
    console.error("Failed to fetch educational structure:", error);
    return NextResponse.json(
      { error: "تعذر تحميل الهيكل الأكاديمي" },
      { status: 500 }
    );
  }
}

// POST: Create a system, grade, track, or subject
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    if (type === "system") {
      const { name, code, description, isActive } = data;
      if (!name || !code) {
        return NextResponse.json({ error: "اسم النظام والرمز مطلوبان" }, { status: 400 });
      }

      const existing = await prisma.educationalSystem.findUnique({ where: { code } });
      if (existing) {
        return NextResponse.json({ error: "هذا الرمز مستخدم بالفعل لنظام آخر" }, { status: 400 });
      }

      const system = await prisma.educationalSystem.create({
        data: {
          name,
          code,
          description: description || null,
          isActive: isActive !== undefined ? !!isActive : true,
        },
      });

      return NextResponse.json({ success: true, item: system });
    }

    if (type === "grade") {
      const { name, code, systemId, order } = data;
      if (!name || !code || !systemId) {
        return NextResponse.json({ error: "البيانات الأساسية للصف ناقصة" }, { status: 400 });
      }

      const grade = await prisma.grade.create({
        data: {
          name,
          code,
          systemId,
          order: order || 0,
        },
      });

      return NextResponse.json({ success: true, item: grade });
    }

    if (type === "subject") {
      const { name, code, icon, color, description, systemId, gradeId, trackId, isPublished, order } = data;
      if (!name || !code || !systemId || !gradeId) {
        return NextResponse.json({ error: "البيانات الأساسية للمادة ناقصة" }, { status: 400 });
      }

      const subject = await prisma.subject.create({
        data: {
          name,
          code,
          icon: icon || null,
          color: color || "#4F46E5",
          description: description || null,
          systemId,
          gradeId,
          trackId: trackId || null,
          isPublished: isPublished !== undefined ? !!isPublished : true,
          order: order || 0,
        },
      });

      return NextResponse.json({ success: true, item: subject });
    }

    return NextResponse.json({ error: "نوع العنصر غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("Failed to create educational structure item:", error);
    return NextResponse.json(
      { error: "تعذر إضافة العنصر، تحقق من عدم تكرار الرمز" },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing system, grade, or subject
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { type, id, data } = body;

    if (!type || !id || !data) {
      return NextResponse.json({ error: "بيانات غير مكتملة للتعديل" }, { status: 400 });
    }

    if (type === "system") {
      const updated = await prisma.educationalSystem.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          isActive: data.isActive !== undefined ? !!data.isActive : undefined,
          order: data.order !== undefined ? Number(data.order) : undefined,
        },
      });
      return NextResponse.json({ success: true, item: updated });
    }

    if (type === "grade") {
      const updated = await prisma.grade.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          order: data.order !== undefined ? Number(data.order) : undefined,
        },
      });
      return NextResponse.json({ success: true, item: updated });
    }

    if (type === "subject") {
      const updated = await prisma.subject.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          icon: data.icon,
          color: data.color,
          description: data.description,
          order: data.order !== undefined ? Number(data.order) : undefined,
          isPublished: data.isPublished !== undefined ? !!data.isPublished : undefined,
        },
      });
      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ error: "نوع العنصر غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update structure item:", error);
    return NextResponse.json(
      { error: "تعذر حفظ التعديلات" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a system, grade, or subject
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "معرف العنصر ونوعه مطلوبان" }, { status: 400 });
    }

    if (type === "system") {
      await prisma.educationalSystem.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "grade") {
      await prisma.grade.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "subject") {
      await prisma.subject.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "نوع العنصر غير مدعوم" }, { status: 400 });
  } catch (error) {
    console.error("Failed to delete structure item:", error);
    return NextResponse.json(
      { error: "تعذر حذف العنصر، قد يحتوي على وحدات أو أسئلة مرتبطة به" },
      { status: 500 }
    );
  }
}
