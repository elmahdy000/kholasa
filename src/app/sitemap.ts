import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.APP_URL || "https://el-kholasa.online").replace(/\/$/, "");

  // Core public landing and exploration routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/subjects`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/exams/builder`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const [subjects, lessons] = await Promise.all([
      prisma.subject.findMany({
        where: { isPublished: true },
        select: { id: true },
      }),
      prisma.lesson.findMany({
        where: {
          isPublished: true,
          unit: { isPublished: true, subject: { isPublished: true } },
        },
        select: { id: true },
      }),
    ]);

    const subjectRoutes: MetadataRoute.Sitemap = subjects.map((sub) => ({
      url: `${baseUrl}/subjects/${sub.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    const lessonRoutes: MetadataRoute.Sitemap = lessons.map((les) => ({
      url: `${baseUrl}/lessons/${les.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    return [...staticRoutes, ...subjectRoutes, ...lessonRoutes];
  } catch {
    return staticRoutes;
  }
}
