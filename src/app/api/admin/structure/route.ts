import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { CurriculumService } from "@/services";

// GET: Return full structure tree (Systems -> Grades -> Tracks -> Subjects)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const systems = await CurriculumService.getStructureTree();
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

    const body = await req.json().catch(() => ({}));
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    if (type === "system") {
      const { name, code, description, isActive } = data;
      if (!name || !code) {
        return NextResponse.json({ error: "اسم النظام والرمز مطلوبان" }, { status: 400 });
      }

      const system = await CurriculumService.createSystem({
        name,
        code,
        description,
        isActive,
      });

      return NextResponse.json({ success: true, item: system });
    }

    if (type === "grade") {
      const { name, code, systemId, order } = data;
      if (!name || !code || !systemId) {
        return NextResponse.json({ error: "البيانات الأساسية للصف ناقصة" }, { status: 400 });
      }

      const grade = await CurriculumService.createGrade({
        name,
        code,
        systemId,
        order,
      });

      return NextResponse.json({ success: true, item: grade });
    }

    if (type === "subject") {
      const { name, code, icon, color, description, systemId, gradeId, trackId, isPublished, order } = data;
      if (!name || !code || !systemId || !gradeId) {
        return NextResponse.json({ error: "البيانات الأساسية للمادة ناقصة" }, { status: 400 });
      }

      const subject = await CurriculumService.createSubject({
        name,
        code,
        icon,
        color,
        description,
        systemId,
        gradeId,
        trackId,
        isPublished,
        order,
      });

      return NextResponse.json({ success: true, item: subject });
    }

    return NextResponse.json({ error: "نوع العنصر غير معروف" }, { status: 400 });
  } catch (error: any) {
    console.error("Failed to create educational structure item:", error);
    return NextResponse.json(
      { error: error?.message || "تعذر إضافة العنصر، تحقق من عدم تكرار الرمز" },
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

    const body = await req.json().catch(() => ({}));
    const { type, id, data } = body;

    if (!type || !id || !data) {
      return NextResponse.json({ error: "بيانات غير مكتملة للتعديل" }, { status: 400 });
    }

    if (type === "system") {
      const updated = await CurriculumService.updateSystem(id, data);
      return NextResponse.json({ success: true, item: updated });
    }

    if (type === "grade") {
      const updated = await CurriculumService.updateGrade(id, data);
      return NextResponse.json({ success: true, item: updated });
    }

    if (type === "subject") {
      const updated = await CurriculumService.updateSubject(id, data);
      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ error: "نوع العنصر غير معروف" }, { status: 400 });
  } catch (error: any) {
    console.error("Failed to update structure item:", error);
    return NextResponse.json(
      { error: error?.message || "تعذر حفظ التعديلات" },
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
      await CurriculumService.deleteSystem(id);
      return NextResponse.json({ success: true });
    }

    if (type === "grade") {
      await CurriculumService.deleteGrade(id);
      return NextResponse.json({ success: true });
    }

    if (type === "subject") {
      await CurriculumService.deleteSubject(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "نوع العنصر غير مدعوم" }, { status: 400 });
  } catch (error: any) {
    console.error("Failed to delete structure item:", error);
    return NextResponse.json(
      { error: error?.message || "تعذر حذف العنصر، قد يحتوي على وحدات أو أسئلة مرتبطة به" },
      { status: 500 }
    );
  }
}
