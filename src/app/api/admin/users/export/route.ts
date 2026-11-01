import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const students = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        schoolCategory: true,
        maxDevices: true,
        boundDevices: true,
        createdAt: true,
        system: { select: { name: true } },
        grade: { select: { name: true } },
        _count: {
          select: {
            attempts: true,
            progress: true,
            mistakes: true,
          },
        },
      },
    });

    // Generate CSV string with UTF-8 BOM so Excel opens Arabic correctly
    const headers = [
      "المعرف (ID)",
      "اسم الطالب",
      "رقم الهاتف",
      "البريد الإلكتروني",
      "الرتبة",
      "النظام التعليمي",
      "الصف الدراسي",
      "نوع المدرسة",
      "الأجهزة المستخدمة",
      "الحد الأقصى للأجهزة",
      "عدد الامتحانات",
      "الدروس المنجزة",
      "عدد الأخطاء",
      "تاريخ التسجيل",
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = students.map((s) => [
      escapeCsv(s.id),
      escapeCsv(s.name || "بدون اسم"),
      escapeCsv(s.phone || "—"),
      escapeCsv(s.email || "—"),
      escapeCsv(s.role === "STUDENT" ? "طالب" : s.role),
      escapeCsv(s.system?.name || "غير محدد"),
      escapeCsv(s.grade?.name || "غير محدد"),
      escapeCsv(s.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"),
      escapeCsv(s.boundDevices?.length || 0),
      escapeCsv(s.maxDevices || 2),
      escapeCsv(s._count.attempts),
      escapeCsv(s._count.progress),
      escapeCsv(s._count.mistakes),
      escapeCsv(new Date(s.createdAt).toLocaleDateString("ar-EG")),
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const dateStr = new Date().toISOString().split("T")[0];
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="students_kholasa_${dateStr}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export students:", error);
    return NextResponse.json({ error: "تعذر تصدير بيانات الطلاب" }, { status: 500 });
  }
}

