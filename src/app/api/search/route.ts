import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope } from "@/lib/curriculum";
import { jsonError, unauthorized } from "@/lib/http";
import { SearchService } from "@/services/search.service";

export async function GET(req: Request) {
  try {
    // Only used by the authenticated StudentShell search box.
    const user = await getCurrentUser();
    if (!user) throw unauthorized("غير مصرح");

    const scope = getCurriculumScope(user);
    const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 100);

    if (q.length < 2) {
      const suggestions = await SearchService.getQuickSuggestions(scope);
      return NextResponse.json({ results: [], suggestions });
    }

    const results = await SearchService.globalSearch(q, scope);
    return NextResponse.json({ results });
  } catch (error) {
    return jsonError(error);
  }
}
