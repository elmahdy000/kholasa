import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { badRequest, forbidden, jsonError } from "@/lib/http";
import { MediaService } from "@/services/media.service";
import { AnalyticsService } from "@/services/analytics.service";

const MAX_BYTES = 50 * 1024 * 1024;

async function requireStaffUser() {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) throw forbidden("غير مصرح");
  return user;
}

// GET: List all uploaded files with metadata
export async function GET() {
  try {
    await requireStaffUser();
    const files = await MediaService.listAllMediaFiles();
    return NextResponse.json({ files });
  } catch (error) {
    return jsonError(error);
  }
}

// POST: Upload a file
export async function POST(req: Request) {
  try {
    const user = await requireStaffUser();

    const declared = Number(req.headers.get("content-length") || 0);
    if (declared > MAX_BYTES + 1024 * 1024) {
      throw badRequest("حجم الملف يتجاوز الحد الأقصى المسموح به (50 ميجابايت)");
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio");
    const imageFile = formData.get("image");

    // Case 1: Paired Audio + Image Upload (Select image, select audio, upload both together)
    if (audioFile instanceof File && imageFile instanceof File) {
      if (audioFile.size > MAX_BYTES || imageFile.size > MAX_BYTES) {
        throw badRequest("حجم أحد الملفات يتجاوز الحد الأقصى المسموح به (50 ميجابايت)");
      }

      // Save Image
      const imgBuffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadedImage = await MediaService.saveUploadedBuffer(imgBuffer, imageFile.name, imageFile.type);

      // Save Audio
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const uploadedAudio = await MediaService.saveUploadedBuffer(audioBuffer, audioFile.name, audioFile.type);

      await AnalyticsService.logAuditAction(user.id, "UPLOAD", "media", uploadedImage.filename, {
        size: uploadedImage.size,
        type: uploadedImage.type,
      });
      await AnalyticsService.logAuditAction(user.id, "UPLOAD", "media", uploadedAudio.filename, {
        size: uploadedAudio.size,
        type: uploadedAudio.type,
      });

      return NextResponse.json({
        success: true,
        image: uploadedImage,
        audio: uploadedAudio,
        imageUrl: uploadedImage.url,
        audioUrl: uploadedAudio.url,
      });
    }

    // Case 2: Single File Upload (standard)
    const file = formData.get("file");
    if (!(file instanceof File)) throw badRequest("لم يتم تحديد أي ملف");
    if (file.size > MAX_BYTES) {
      throw badRequest("حجم الملف يتجاوز الحد الأقصى المسموح به (50 ميجابايت)");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await MediaService.saveUploadedBuffer(buffer, file.name, file.type);

    await AnalyticsService.logAuditAction(user.id, "UPLOAD", "media", uploaded.filename, {
      size: uploaded.size,
      type: uploaded.type,
    });
    return NextResponse.json(uploaded);
  } catch (error) {
    return jsonError(error);
  }
}

// DELETE: Delete an uploaded file
export async function DELETE(req: Request) {
  try {
    const user = await requireStaffUser();
    const filename = new URL(req.url).searchParams.get("filename");
    if (!filename) throw badRequest("اسم الملف مطلوب");

    await MediaService.deleteMediaFile(filename);
    await AnalyticsService.logAuditAction(user.id, "DELETE", "media", filename);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
