import { NextResponse } from "next/server";
import { getCurrentUser, canManageQuestions } from "@/lib/auth";
import {
  parseDocxBuffer,
  parsePdfBuffer,
  parseQuestionsFromText,
  ParseOptions,
  QuestionType,
  QuestionDifficulty,
} from "@/lib/question-parser";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك باستيراد الأسئلة" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const textFallback = formData.get("text") as string | null;

      // Extract optional parsing parameters
      const strategy = (formData.get("strategy") as "AUTO" | "MANUAL_REVIEW" | "FORCED") || undefined;
      let allowedTypes: QuestionType[] | undefined;
      const allowedTypesRaw = formData.get("allowedTypes") as string | null;
      if (allowedTypesRaw) {
        try {
          const parsed = JSON.parse(allowedTypesRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            allowedTypes = parsed.filter((t: any) => ["MCQ", "TRUE_FALSE", "ESSAY"].includes(t));
          }
        } catch {
          // If comma-separated
          const parts = allowedTypesRaw.split(",").map(s => s.trim().toUpperCase()) as QuestionType[];
          allowedTypes = parts.filter(t => ["MCQ", "TRUE_FALSE", "ESSAY"].includes(t));
        }
      }

      const forcedType = (formData.get("type") as QuestionType) || undefined;
      const forcedDifficulty = (formData.get("difficulty") as QuestionDifficulty | "MIXED") || undefined;
      const schoolCategory = (formData.get("schoolCategory") as "ARABIC" | "LANGUAGES") || undefined;

      const parseOptions: ParseOptions = {
        strategy: strategy && ["AUTO", "MANUAL_REVIEW", "FORCED"].includes(strategy) ? strategy : undefined,
        allowedTypes: allowedTypes && allowedTypes.length > 0 ? allowedTypes : undefined,
        forcedType: forcedType && ["MCQ", "TRUE_FALSE", "ESSAY"].includes(forcedType) ? forcedType : undefined,
        forcedDifficulty: forcedDifficulty && ["EASY", "MEDIUM", "HARD", "MIXED"].includes(forcedDifficulty) ? forcedDifficulty : undefined,
        schoolCategory: schoolCategory && ["ARABIC", "LANGUAGES"].includes(schoolCategory) ? schoolCategory : undefined,
      };

      const calculateStats = (questions: any[]) => ({
        total: questions.length,
        valid: questions.filter((q) => q.isValid).length,
        invalid: questions.filter((q) => !q.isValid).length,
        approved: questions.filter((q) => q.reviewStatus === "APPROVED").length,
        needsChanges: questions.filter((q) => q.reviewStatus === "NEEDS_CHANGES").length,
        pending: questions.filter((q) => q.reviewStatus === "PENDING").length,
        excluded: questions.filter((q) => q.reviewStatus === "EXCLUDED").length,
        duplicates: questions.filter((q) => q.isDuplicate).length,
        mcq: questions.filter((q) => q.type === "MCQ").length,
        trueFalse: questions.filter((q) => q.type === "TRUE_FALSE").length,
        essay: questions.filter((q) => q.type === "ESSAY").length,
        easy: questions.filter((q) => q.difficulty === "EASY").length,
        medium: questions.filter((q) => q.difficulty === "MEDIUM").length,
        hard: questions.filter((q) => q.difficulty === "HARD").length,
      });

      if (file && file.size > 0) {
        const fileName = file.name.toLowerCase();
        const isDocx = fileName.endsWith(".docx");
        const isPdf = fileName.endsWith(".pdf");

        if (!isDocx && !isPdf) {
          return NextResponse.json(
            { error: "يرجى رفع ملف بصيغة Word (.docx) أو PDF (.pdf)" },
            { status: 400 }
          );
        }

        if (file.size > 15 * 1024 * 1024) {
          return NextResponse.json(
            { error: "حجم الملف كبير جداً (الحد الأقصى 15 ميجابايت)" },
            { status: 413 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        try {
          const { text, questions } = isDocx
            ? await parseDocxBuffer(buffer, parseOptions)
            : await parsePdfBuffer(buffer, parseOptions);

          const stats = calculateStats(questions);

          return NextResponse.json({
            success: true,
            fileName: file.name,
            fileType: isDocx ? "DOCX" : "PDF",
            questions,
            rawText: text,
            stats,
          });
        } catch (parseErr: any) {
          console.error("Document parsing error:", parseErr);
          return NextResponse.json(
            {
              error:
                parseErr?.message ||
                "تعذر قراءة المستند، يرجى التأكد من أن الملف سليم بصيغة .docx أو .pdf أو لصق النصوص مباشرة.",
            },
            { status: 422 }
          );
        }
      } else if (textFallback && textFallback.trim().length > 0) {
        const questions = parseQuestionsFromText(textFallback, parseOptions);
        const stats = calculateStats(questions);

        return NextResponse.json({
          success: true,
          fileName: "نص مباشر",
          fileType: "MANUAL",
          questions,
          rawText: textFallback,
          stats,
        });
      }

      return NextResponse.json(
        { error: "لم يتم العثور على ملف أو نصوص في الطلب" },
        { status: 400 }
      );
    }

    // Direct JSON payload with text
    const body = await req.json().catch(() => ({}));
    if (body.text) {
      const parseOptions: ParseOptions = {
        strategy: body.strategy,
        allowedTypes: Array.isArray(body.allowedTypes) ? body.allowedTypes : undefined,
        forcedType: body.type,
        forcedDifficulty: body.difficulty,
        schoolCategory: body.schoolCategory,
      };

      const questions = parseQuestionsFromText(body.text, parseOptions);
      const stats = {
        total: questions.length,
        valid: questions.filter((q) => q.isValid).length,
        invalid: questions.filter((q) => !q.isValid).length,
        approved: questions.filter((q) => q.reviewStatus === "APPROVED").length,
        needsChanges: questions.filter((q) => q.reviewStatus === "NEEDS_CHANGES").length,
        pending: questions.filter((q) => q.reviewStatus === "PENDING").length,
        excluded: questions.filter((q) => q.reviewStatus === "EXCLUDED").length,
        duplicates: questions.filter((q) => q.isDuplicate).length,
        mcq: questions.filter((q) => q.type === "MCQ").length,
        trueFalse: questions.filter((q) => q.type === "TRUE_FALSE").length,
        essay: questions.filter((q) => q.type === "ESSAY").length,
        easy: questions.filter((q) => q.difficulty === "EASY").length,
        medium: questions.filter((q) => q.difficulty === "MEDIUM").length,
        hard: questions.filter((q) => q.difficulty === "HARD").length,
      };

      return NextResponse.json({
        success: true,
        fileName: "نص مباشر",
        fileType: "MANUAL",
        questions,
        rawText: body.text,
        stats,
      });
    }

    return NextResponse.json(
      { error: "طريقة إرسال غير صالحة" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Parse document API route error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة المستند" },
      { status: 500 }
    );
  }
}
