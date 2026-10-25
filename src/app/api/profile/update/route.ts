import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, parseJson, unauthorized } from "@/lib/http";
import { StudentService } from "@/services/student.service";

// Egyptian mobile: 01[0125] + 8 digits, optional +20 / 0020 prefix.
const egyptianPhone = z
  .string()
  .trim()
  .regex(/^(?:\+20|0020|0)?1[0125]\d{8}$/, "رقم الهاتف غير صالح");

const schema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.union([egyptianPhone, z.literal(""), z.null()]).optional(),
  systemId: z.string().min(1).nullable().optional(),
  gradeId: z.string().min(1).nullable().optional(),
  trackId: z.string().min(1).nullable().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("غير مصرح");

    const body = await parseJson(req, schema);
    const updated = await StudentService.updateProfile(user.id, body);
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return jsonError(error);
  }
}
