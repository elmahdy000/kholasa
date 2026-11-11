import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canManageUsersRole, getRoleArabicLabel } from "@/lib/roles";
import { EXCLUDE_DEMO_SANDBOX_CONDITION } from "@/lib/demo";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageUsersRole(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";

    const students = await prisma.user.findMany({
      where: EXCLUDE_DEMO_SANDBOX_CONDITION,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        loginCode: true,
        role: true,
        schoolCategory: true,
        studyMode: true,
        centerName: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        maxDevices: true,
        boundDevices: true,
        isActive: true,
        createdAt: true,
        system: { select: { name: true } },
        grade: { select: { name: true } },
        track: { select: { name: true } },
        _count: {
          select: {
            attempts: true,
            progress: true,
            mistakes: true,
          },
        },
      },
    });

    const dateStr = new Date().toISOString().split("T")[0];

    // JSON Format Export
    if (format === "json") {
      const payload = {
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          version: "1.0",
          platform: "منصة الخلاصة التعليمية",
          totalStudents: students.length,
        },
        students: students.map((s) => ({
          id: s.id,
          name: s.name,
          loginCode: s.loginCode,
          phone: s.phone,
          email: s.email,
          role: s.role,
          schoolCategory: s.schoolCategory,
          studyMode: s.studyMode,
          centerName: s.centerName,
          subscriptionStatus: s.subscriptionStatus,
          subscriptionExpiresAt: s.subscriptionExpiresAt ? s.subscriptionExpiresAt.toISOString() : null,
          isActive: s.isActive,
          system: s.system?.name || null,
          grade: s.grade?.name || null,
          track: s.track?.name || null,
          activeDevicesCount: s.boundDevices?.length || 0,
          maxDevices: s.maxDevices,
          boundDevices: s.boundDevices,
          attemptsCount: s._count.attempts,
          completedLessonsCount: s._count.progress,
          mistakesCount: s._count.mistakes,
          createdAt: s.createdAt.toISOString(),
        })),
      };

      return new Response(JSON.stringify(payload, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="students_kholasa_${dateStr}.json"`,
        },
      });
    }

    // Generate CSV string with UTF-8 BOM so Excel opens Arabic correctly
    const headers = [
      "المعرف (ID)",
      "كود الدخول (Login Code)",
      "اسم الطالب",
      "رقم الهاتف",
      "البريد الإلكتروني",
      "الرتبة",
      "النظام التعليمي",
      "الصف الدراسي",
      "المسار التخصصي",
      "نوع المدرسة",
      "طريقة الحضور",
      "اسم السنتر",
      "حالة الاشتراك",
      "حالة الحساب",
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
      escapeCsv(s.loginCode || "—"),
      escapeCsv(s.name || "بدون اسم"),
      escapeCsv(s.phone || "—"),
      escapeCsv(s.email || "—"),
      escapeCsv(getRoleArabicLabel(s.role)),
      escapeCsv(s.system?.name || "غير محدد"),
      escapeCsv(s.grade?.name || "غير محدد"),
      escapeCsv(s.track?.name || "عام"),
      escapeCsv(s.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"),
      escapeCsv(s.studyMode === "OFFLINE" ? "سنتر / أوفلاين" : "أونلاين"),
      escapeCsv(s.centerName || "—"),
      escapeCsv(
        s.subscriptionStatus === "ACTIVE"
          ? "مفعل"
          : s.subscriptionStatus === "PENDING_VERIFICATION"
          ? "قيد المراجعة"
          : s.subscriptionStatus === "TRIAL"
          ? "تجريبي"
          : "منتهي"
      ),
      escapeCsv(s.isActive ? "نشط" : "معطل"),
      escapeCsv(s.boundDevices?.length || 0),
      escapeCsv(s.maxDevices || 2),
      escapeCsv(s._count.attempts),
      escapeCsv(s._count.progress),
      escapeCsv(s._count.mistakes),
      escapeCsv(new Date(s.createdAt).toLocaleDateString("ar-EG")),
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

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
