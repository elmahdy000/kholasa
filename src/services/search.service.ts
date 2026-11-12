import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CurriculumScope, subjectScopeWhere } from "@/lib/curriculum";

export interface SearchResultItem {
  type: "LESSON" | "SUBJECT" | "QUESTION";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export class SearchService {
  /**
   * Returns scoped published subjects and sample top lessons for empty-query quick access.
   */
  static async getQuickSuggestions(
    scope: CurriculumScope | null = null
  ): Promise<SearchResultItem[]> {
    const openSubjectFilter: Prisma.SubjectWhereInput = {
      isPublished: true,
      isUnderConstruction: false,
      ...subjectScopeWhere(scope),
    };

    const [subjects, lessons] = await Promise.all([
      prisma.subject.findMany({
        where: openSubjectFilter,
        orderBy: { order: "asc" },
        take: 4,
        select: {
          id: true,
          name: true,
          description: true,
        },
      }),
      prisma.lesson.findMany({
        where: {
          isPublished: true,
          unit: {
            isPublished: true,
            subject: { is: openSubjectFilter },
          },
        },
        orderBy: [{ unit: { order: "asc" } }, { order: "asc" }],
        take: 4,
        include: {
          unit: {
            select: {
              title: true,
              subject: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    return [
      ...subjects.map((s) => ({
        type: "SUBJECT" as const,
        id: s.id,
        title: s.name,
        subtitle: s.description || "افتح وحدات ودروس المادة",
        url: `/subjects/${s.id}`,
      })),
      ...lessons.map((l) => ({
        type: "LESSON" as const,
        id: l.id,
        title: l.title,
        subtitle: `${l.unit.subject.name} • ${l.unit.title}`,
        url: `/lessons/${l.id}`,
      })),
    ];
  }

  /**
   * Search across lessons, subjects, and questions with strict publish & track scoping
   */
  static async globalSearch(
    query: string,
    scope: CurriculumScope | null = null
  ): Promise<SearchResultItem[]> {
    const q = query.trim();
    if (!q || q.length < 2) {
      return [];
    }

    const subjectFilter = subjectScopeWhere(scope);
    const publishedSubjectFilter: Prisma.SubjectWhereInput = {
      isPublished: true,
      ...subjectFilter,
    };
    const openSubjectFilter: Prisma.SubjectWhereInput = {
      ...publishedSubjectFilter,
      isUnderConstruction: false,
    };

    const [lessons, subjects, questions] = await Promise.all([
      prisma.lesson.findMany({
        where: {
          isPublished: true,
          unit: {
            isPublished: true,
            subject: { is: openSubjectFilter },
          },
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
          AND: [
            publishedSubjectFilter,
            {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            },
          ],
        },
        take: 3,
      }),
      prisma.question.findMany({
        where: {
          status: "PUBLISHED",
          subject: { is: openSubjectFilter },
          AND: [
            ...(scope?.schoolCategory
              ? [
                  {
                    OR: [
                      { schoolCategory: scope.schoolCategory },
                      { subject: { isCommonCategory: true } },
                    ],
                  },
                ]
              : []),
            {
              OR: [
                { lessons: { none: {} } },
                {
                  lessons: {
                    some: {
                      lesson: {
                        isPublished: true,
                        unit: { isPublished: true },
                      },
                    },
                  },
                },
              ],
            },
            {
              OR: [
                { statement: { contains: q, mode: "insensitive" } },
                { translation: { contains: q, mode: "insensitive" } },
                {
                  explanation: {
                    concept: { contains: q, mode: "insensitive" },
                  },
                },
              ],
            },
          ],
        },
        take: 4,
        include: {
          subject: { select: { id: true, name: true } },
          lessons: {
            where: {
              lesson: {
                isPublished: true,
                unit: { isPublished: true },
              },
            },
            include: {
              lesson: { select: { id: true, title: true } },
            },
          },
        },
      }),
    ]);

    return [
      ...lessons.map((l) => ({
        type: "LESSON" as const,
        id: l.id,
        title: l.title,
        subtitle: `${l.unit.subject.name} • ${l.unit.title}`,
        url: `/lessons/${l.id}`,
      })),
      ...subjects.map((s) => ({
        type: "SUBJECT" as const,
        id: s.id,
        title: s.name,
        subtitle: s.description || "مادة دراسية",
        url: `/subjects/${s.id}`,
      })),
      ...questions.map((qItem) => ({
        type: "QUESTION" as const,
        id: qItem.id,
        title: qItem.statement.slice(0, 60) + (qItem.statement.length > 60 ? "..." : ""),
        subtitle: `سؤال في ${qItem.subject.name}`,
        url: qItem.lessons[0]
          ? `/lessons/${qItem.lessons[0].lesson.id}`
          : `/exams/builder?subjectId=${qItem.subject.id}`,
      })),
    ];
  }
}
