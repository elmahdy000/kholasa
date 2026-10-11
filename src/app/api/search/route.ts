import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const [lessons, subjects, questions] = await Promise.all([
      prisma.lesson.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            {
              content: {
                body: { contains: q, mode: "insensitive" },
              },
            },
          ],
        },
        take: 5,
        include: {
          unit: {
            include: {
              subject: { select: { id: true, name: true, color: true } },
            },
          },
        },
      }),
      prisma.subject.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 3,
      }),
      prisma.question.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { statement: { contains: q, mode: "insensitive" } },
            {
              explanation: {
                concept: { contains: q, mode: "insensitive" },
              },
            },
          ],
        },
        take: 4,
        include: {
          subject: { select: { id: true, name: true } },
          lessons: {
            include: {
              lesson: { select: { id: true, title: true } },
            },
          },
        },
      }),
    ]);

    const formatted = [
      ...lessons.map((l) => ({
        type: "LESSON",
        id: l.id,
        title: l.title,
        subtitle: `${l.unit.subject.name} • ${l.unit.title}`,
        url: `/lessons/${l.id}`,
      })),
      ...subjects.map((s) => ({
        type: "SUBJECT",
        id: s.id,
        title: s.name,
        subtitle: s.description || "مادة دراسية",
        url: `/subjects/${s.id}`,
      })),
      ...questions.map((qItem) => ({
        type: "QUESTION",
        id: qItem.id,
        title: qItem.statement.slice(0, 60) + "...",
        subtitle: `سؤال في ${qItem.subject.name}`,
        url: qItem.lessons[0]
          ? `/lessons/${qItem.lessons[0].lesson.id}`
          : `/exams/builder?subjectId=${qItem.subject.id}`,
      })),
    ];

    return NextResponse.json({ results: formatted });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] });
  }
}
