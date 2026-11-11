import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope } from "@/lib/curriculum";
import { MistakeService } from "@/services/mistake.service";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, must-revalidate" };

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        {
          unresolvedCount: 0,
          resolvedCount: 0,
          topWeakness: null,
          breakdown: [],
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    const scope = getCurriculumScope(user);
    const summary = await MistakeService.getStudentMistakeDiagnosisSummary(user.id, scope);
    return NextResponse.json(summary, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Failed to fetch mistakes summary:", error);
    return NextResponse.json(
      {
        unresolvedCount: 0,
        resolvedCount: 0,
        topWeakness: null,
        breakdown: [],
      },
      { headers: NO_STORE_HEADERS }
    );
  }
}

