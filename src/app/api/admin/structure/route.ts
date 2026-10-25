import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { badRequest, forbidden, jsonError, parseJson } from "@/lib/http";
import { CurriculumService } from "@/services/curriculum.service";
import { AnalyticsService } from "@/services/analytics.service";

const name = z.string().trim().min(1).max(120);
const code = z.string().trim().min(1).max(50);
const order = z.coerce.number().int().min(0).max(100000).optional();
const optText = z.string().max(2000).nullable().optional();

const createSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("system"),
    data: z.object({ name, code, description: optText, isActive: z.boolean().optional(), order }),
  }),
  z.object({
    type: z.literal("grade"),
    data: z.object({ name, code, systemId: z.string().min(1), order }),
  }),
  z.object({
    type: z.literal("subject"),
    data: z.object({
      name,
      code,
      icon: z.string().max(100).nullable().optional(),
      color: z.string().max(20).optional(),
      description: optText,
      systemId: z.string().min(1),
      gradeId: z.string().min(1),
      trackId: z.string().nullable().optional(),
      isPublished: z.boolean().optional(),
      order,
    }),
  }),
]);

const updateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("system"),
    id: z.string().min(1),
    data: z.object({
      name: name.optional(),
      code: code.optional(),
      description: optText,
      isActive: z.boolean().optional(),
      order,
    }),
  }),
  z.object({
    type: z.literal("grade"),
    id: z.string().min(1),
    data: z.object({ name: name.optional(), code: code.optional(), order }),
  }),
  z.object({
    type: z.literal("subject"),
    id: z.string().min(1),
    data: z.object({
      name: name.optional(),
      code: code.optional(),
      icon: z.string().max(100).nullable().optional(),
      color: z.string().max(20).optional(),
      description: optText,
      order,
      isPublished: z.boolean().optional(),
    }),
  }),
]);

async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) throw forbidden("غير مصرح");
  return user;
}

// GET: Return full structure tree (Systems -> Grades -> Tracks -> Subjects)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) throw forbidden("غير مصرح");

    const systems = await CurriculumService.getStructureTree();
    return NextResponse.json({ systems });
  } catch (error) {
    return jsonError(error);
  }
}

// POST: Create a system, grade, or subject
export async function POST(req: Request) {
  try {
    const user = await requireAdminUser();
    const body = await parseJson(req, createSchema);

    let item: { id: string };
    if (body.type === "system") item = await CurriculumService.createSystem(body.data);
    else if (body.type === "grade") item = await CurriculumService.createGrade(body.data);
    else item = await CurriculumService.createSubject(body.data);

    await AnalyticsService.logAuditAction(user.id, "CREATE", body.type, item.id, {
      name: body.data.name,
    });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    return jsonError(error);
  }
}

// PATCH: Update an existing system, grade, or subject
export async function PATCH(req: Request) {
  try {
    const user = await requireAdminUser();
    const body = await parseJson(req, updateSchema);

    let item: { id: string };
    if (body.type === "system") item = await CurriculumService.updateSystem(body.id, body.data);
    else if (body.type === "grade") item = await CurriculumService.updateGrade(body.id, body.data);
    else item = await CurriculumService.updateSubject(body.id, body.data);

    await AnalyticsService.logAuditAction(user.id, "UPDATE", body.type, body.id, {
      fields: Object.keys(body.data),
    });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    return jsonError(error);
  }
}

// DELETE: Delete a system, grade, or subject
export async function DELETE(req: Request) {
  try {
    const user = await requireAdminUser();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    if (!type || !id) throw badRequest("معرف العنصر ونوعه مطلوبان");

    if (type === "system") await CurriculumService.deleteSystem(id);
    else if (type === "grade") await CurriculumService.deleteGrade(id);
    else if (type === "subject") await CurriculumService.deleteSubject(id);
    else throw badRequest("نوع العنصر غير مدعوم");

    await AnalyticsService.logAuditAction(user.id, "DELETE", type, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
