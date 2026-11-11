import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoTemplateDefaults, isDemoSandboxCode, isDemoTemplateCode } from "@/lib/demo";
import { getClientIp, rateLimit, withRetryAfter } from "@/lib/rate-limit";
import { jsonError } from "@/lib/http";

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    // Lightweight rate limit: up to 30 lookups per minute per IP to prevent brute-force
    rateLimit(`lookup:ip:${ip}`, 30, 60 * 1000);

    const { searchParams } = new URL(req.url);
    const rawCode = searchParams.get("code");

    if (!rawCode || rawCode.trim().length < 3) {
      return NextResponse.json({ found: false });
    }

    const cleanCode = rawCode.trim().toUpperCase();

    // Ephemeral demo sandbox codes must never be looked up or shared
    if (isDemoSandboxCode(cleanCode)) {
      return NextResponse.json({ found: false });
    }

    if (isDemoTemplateCode(cleanCode)) {
      const templateUser = await prisma.user.findFirst({
        where: { loginCode: { equals: cleanCode, mode: "insensitive" } },
        select: { isActive: true },
      });
      if (templateUser && templateUser.isActive === false) {
        return NextResponse.json({ found: false });
      }
      const defaults = getDemoTemplateDefaults(cleanCode);
      return NextResponse.json({
        found: true,
        user: {
          name: defaults.name,
          schoolCategory: defaults.schoolCategory,
          studyMode: "ONLINE",
          centerName: defaults.defaultCenter,
          subscriptionStatus: defaults.subscriptionStatus,
          role: "STUDENT",
          gradeName: "تانية بكالوريا",
        },
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        loginCode: { equals: cleanCode, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        schoolCategory: true,
        studyMode: true,
        centerName: true,
        subscriptionStatus: true,
        role: true,
        grade: {
          select: { name: true },
        },
      },
    });

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      user: {
        name: user.name,
        schoolCategory: user.schoolCategory,
        studyMode: user.studyMode,
        centerName: user.centerName,
        subscriptionStatus: user.subscriptionStatus,
        role: user.role,
        gradeName: user.grade?.name || null,
      },
    });
  } catch (error) {
    return withRetryAfter(jsonError(error), error);
  }
}
