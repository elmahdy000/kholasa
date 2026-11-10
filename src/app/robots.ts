import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.APP_URL || "https://el-kholasa.online").replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/subjects",
          "/subjects/*",
          "/lessons/*",
          "/exams/builder",
          "/leaderboard",
          "/login",
          "/register",
          "/privacy",
          "/terms",
        ],
        disallow: ["/admin/", "/api/", "/setup/", "/profile", "/dashboard", "/mistakes"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/setup/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
