import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { CurriculumService } from "@/services/curriculum.service";

export const dynamic = "force-dynamic";

// Public (used by register/setup before login): active systems only, non-sensitive fields.
export async function GET() {
  try {
    const systems = await CurriculumService.getPublicSystems();
    return NextResponse.json(
      { systems },
      { headers: { "Cache-Control": "no-store, must-revalidate" } }
    );
  } catch (error) {
    return jsonError(error);
  }
}
