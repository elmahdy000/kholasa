import { NextResponse } from "next/server";
import { getCurrentUser, canManageCurriculum } from "@/lib/auth";
import { parseDocxBuffer, parseQuestionsFromText } from "@/lib/question-parser";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك باستيراد الأسئلة" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const textFallback = formData.get("text") as string | null;

      if (file && file.size > 0) {
        // Validate file extension
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith(".docx") && !fileName.endsWith(".doc")) {
          return NextResponse.json(
            { error: "يرجى رفع ملف وورد بصيغة .docx" },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        try {
          const { text, questions } = await parseDocxBuffer(buffer);

          const stats = {
            total: questions.length,
            valid: questions.filter((q) => q.isValid).length,
            invalid: questions.filter((q) => !q.isValid).length,
            mcq: questions.filter((q) => q.type === "MCQ").length,
            trueFalse: questions.filter((q) => q.type === "TRUE_FALSE").length,
            essay: questions.filter((q) => q.type === "ESSAY").length,
          };

          return NextResponse.json({
            success: true,
            fileName: file.name,
            questions,
            rawText: text,
            stats,
          });
        } catch (docxErr: any) {
          console.error("DOCX parsing error:", docxErr);
          return NextResponse.json(
            {
              error:
                "تعذر قراءة ملف الوورد، يرجى التأكد من أن الملف سليم بصيغة .docx أو لصق نصوص الأسئلة مباشرة.",
            },
            { status: 422 }
          );
        }
      } else if (textFallback && textFallback.trim().length > 0) {
        const questions = parseQuestionsFromText(textFallback);
        const stats = {
          total: questions.length,
          valid: questions.filter((q) => q.isValid).length,
          invalid: questions.filter((q) => !q.isValid).length,
          mcq: questions.filter((q) => q.type === "MCQ").length,
          trueFalse: questions.filter((q) => q.type === "TRUE_FALSE").length,
          essay: questions.filter((q) => q.type === "ESSAY").length,
        };

        return NextResponse.json({
          success: true,
          fileName: "نص مباشر",
          questions,
          rawText: textFallback,
          stats,
        });
      }

      return NextResponse.json(
        { error: "لم يتم العثور على ملف وورد أو نصوص في الطلب" },
        { status: 400 }
      );
    }

    // Direct JSON payload with text
    const body = await req.json().catch(() => ({}));
    if (body.text) {
      const questions = parseQuestionsFromText(body.text);
      const stats = {
        total: questions.length,
        valid: questions.filter((q) => q.isValid).length,
        invalid: questions.filter((q) => !q.isValid).length,
        mcq: questions.filter((q) => q.type === "MCQ").length,
        trueFalse: questions.filter((q) => q.type === "TRUE_FALSE").length,
        essay: questions.filter((q) => q.type === "ESSAY").length,
      };

      return NextResponse.json({
        success: true,
        fileName: "نص مباشر",
        questions,
        rawText: body.text,
        stats,
      });
    }

    return NextResponse.json(
      { error: "طريقة إرسال غير صالحة" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Parse docx API route error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الملف" },
      { status: 500 }
    );
  }
}
