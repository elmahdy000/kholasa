import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { MediaService } from "@/services";

// GET: List all uploaded files with metadata
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const files = await MediaService.listAllMediaFiles();
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Failed to list media files:", error);
    return NextResponse.json(
      { error: "تعذر تحميل قائمة الملفات" },
      { status: 500 }
    );
  }
}

// POST: Upload a file
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم تحديد أي ملف" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await MediaService.saveUploadedBuffer(buffer, file.name, file.type);
    return NextResponse.json(uploaded);
  } catch (error: any) {
    console.error("Failed to upload file:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ أثناء رفع الملف إلى الخادم" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an uploaded file
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "اسم الملف مطلوب" }, { status: 400 });
    }

    await MediaService.deleteMediaFile(filename);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete file:", error);
    return NextResponse.json(
      { error: "تعذر حذف الملف من الخادم" },
      { status: 500 }
    );
  }
}

