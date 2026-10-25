import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { CurriculumService } from "@/services/curriculum.service";

// Public (used by register/setup before login): active systems only, non-sensitive fields.
export async function GET() {
  try {
    const systems = await CurriculumService.getPublicSystems();
    return NextResponse.json({ systems });
  } catch (error) {
    return jsonError(error);
  }
}
