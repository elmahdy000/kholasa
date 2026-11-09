import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { forbidden, jsonError } from "@/lib/http";

function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim();
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      throw forbidden("غير مصرح لك بتصدير الهيكل الأكاديمي للمناهج");
    }

    const { searchParams } = new URL(req.url);
    const systemCode = searchParams.get("systemCode") || "baccalaureate";
    const gradeId = searchParams.get("gradeId");
    const subjectId = searchParams.get("subjectId");
    const isDownload = searchParams.get("download") === "true";

    const systems = await prisma.educationalSystem.findMany({
      where: {
        code: systemCode,
      },
      orderBy: { order: "asc" },
      include: {
        grades: {
          where: gradeId ? { id: gradeId } : undefined,
          orderBy: { order: "asc" },
          include: {
            tracks: {
              orderBy: { order: "asc" },
            },
            subjects: {
              where: subjectId ? { id: subjectId } : undefined,
              orderBy: { order: "asc" },
              include: {
                units: {
                  orderBy: { order: "asc" },
                  include: {
                    lessons: {
                      orderBy: { order: "asc" },
                      select: {
                        id: true,
                        title: true,
                        order: true,
                        durationMinutes: true,
                        isPublished: true,
                        isTrial: true,
                        viewsCount: true,
                        _count: {
                          select: {
                            questions: true,
                          },
                        },
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    units: true,
                    questions: true,
                    exams: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `Kholasa_Curriculum_Structure_${systemCode}_${dateStr}.json`;

    const payload = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        platform: "منصة الخلاصة التعليمية",
        systemCode,
        totalSystems: systems.length,
      },
      systems: systems.map((sys) => ({
        id: sys.id,
        name: sys.name,
        code: sys.code,
        grades: sys.grades.map((grade) => ({
          id: grade.id,
          name: grade.name,
          code: grade.code,
          tracks: grade.tracks.map((track) => ({
            id: track.id,
            name: track.name,
            code: track.code,
            nameEn: track.nameEn,
          })),
          subjects: grade.subjects.map((sub) => ({
            id: sub.id,
            name: sub.name,
            code: sub.code,
            schoolCategory: sub.schoolCategory,
            trackId: sub.trackId,
            unitsCount: sub._count.units,
            questionsCount: sub._count.questions,
            examsCount: sub._count.exams,
            units: sub.units.map((unit) => ({
              id: unit.id,
              title: unit.title,
              order: unit.order,
              lessonsCount: unit.lessons.length,
              lessons: unit.lessons.map((l) => ({
                id: l.id,
                title: l.title,
                order: l.order,
                durationMinutes: l.durationMinutes,
                isPublished: l.isPublished,
                isTrial: l.isTrial,
                viewsCount: l.viewsCount,
                questionsCount: l._count.questions,
              })),
            })),
          })),
        })),
      })),
    };

    const jsonString = JSON.stringify(payload, null, 2);

    if (isDownload) {
      return new NextResponse(jsonString, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(sanitizeFilename(filename))}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    return NextResponse.json({
      success: true,
      filename,
      data: payload,
    });
  } catch (error) {
    return jsonError(error);
  }
}
