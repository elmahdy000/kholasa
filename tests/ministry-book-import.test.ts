import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  parsePdfBuffer,
  parseQuestionsFromText,
  getOptionLetterRank,
  extractInlineChoices,
  isOptionLine,
  isQuestionStart,
} from "@/lib/question-parser";

describe("Egyptian Baccalaureate Ministry Book Question Parser", () => {
  const pdfPath = path.join(process.cwd(), "books", "Programming-ArtificialIntelligence-Ar-EB-Assessments-1.pdf");
  const assessmentsExist = fs.existsSync(pdfPath);

  it("identifies option letters and assigns correct ranks", () => {
    expect(getOptionLetterRank("أ- خيار أول")).toBe(1);
    expect(getOptionLetterRank("ب - خيار ثان")).toBe(2);
    expect(getOptionLetterRank("ج- خيار ثالث")).toBe(3);
    expect(getOptionLetterRank("د - خيار رابع")).toBe(4);
    expect(getOptionLetterRank("هـ- خيار خامس")).toBe(5);
  });

  it("extracts inline choices with tabs and spaces without splitting regular words", () => {
    const inlineLine = "ب- انتشار الحواسيب الشخصية (PCs) \tأ- ظهور الهواتف الذكية";
    const choices = extractInlineChoices(inlineLine);
    expect(choices.length).toBe(2);
    expect(choices).toContain("أ- ظهور الهواتف الذكية");
    expect(choices).toContain("ب- انتشار الحواسيب الشخصية (PCs)");
  });

  it("does not mistake question numbers like 1- for choices", () => {
    expect(isOptionLine("1-أي من الخيارات التالية")).toBe(false);
    expect(isOptionLine("2-ما هي الملاحظة التجريبية")).toBe(false);
    expect(isOptionLine("أ- خيار صحيح")).toBe(true);
    expect(isOptionLine("ب- خيار ثان")).toBe(true);
    expect(isOptionLine("(1) خيار بين قوسين")).toBe(true);
  });

  it("recognizes question start with and without spaces after numbers", () => {
    expect(isQuestionStart("1-ما هي الخوارزمية؟")).toBe(true);
    expect(isQuestionStart("2- وضح الفرق بين التعليم الآلي والذكاء الاصطناعي")).toBe(true);
    expect(isQuestionStart("س1: اذكر مبادئ الأمن السيبراني")).toBe(true);
  });

  it("correctly parses and sorts real Ministry assessment questions", () => {
    const sampleMinistryText = `
األسئلة املوضوعية (اختيار من متعدد):
1-أي من الخيارات التالية ميثل التقنية أو الحدث الرئييس املرتبط بفرتة السبعينيات والثامنينيات من القرن
املايض؟
ب- انتشار الحواسيب الشخصية (PCs) 	أ- ظهور الهواتف الذكية
د -إتاحة اإلنرتنت لالستخدام التجاري وظهور الويب 	ج -انتشار الحوسبة السحابية

2-ما هي املالحظة التجريبية التي تصف اتجاها ً تاريخيا ً الزدياد عدد الرتانزستورات يف الدوائر املتكاملة مبعدل
يقارب الضعف كل عامني؟
ب- قانون مور 	أ -الحوسبة السحابية
د -الرتاكب الكمي 	ج -الحوسبة الطرفية

األسئلة املقالية:
1-اذكر ثالثة تغريات اجتامعية ناتجة عن تكنولوجيا املعلومات ؟
........................................................................................................................................................................................................
2-ما املقصود مبصطلح «التجارة اإللكرتونية (E-commerce)»؟ موضحًا ذلك مبثاليني.
...................................................................................................................................................................................................
    `;

    const parsed = parseQuestionsFromText(sampleMinistryText);
    expect(parsed.length).toBe(4);

    // Question 1: MCQ with 4 options sorted أ, ب, ج, د
    const q1 = parsed[0];
    expect(q1.type).toBe("MCQ");
    expect(q1.statement).toContain("السبعينيات");
    expect(q1.options.length).toBe(4);
    expect(q1.options[0].text).toBe("ظهور الهواتف الذكية"); // أ
    expect(q1.options[1].text).toContain("انتشار الحواسيب"); // ب
    expect(q1.options[2].text).toContain("الحوسبة السحابية"); // ج
    expect(q1.options[3].text).toContain("إتاحة اإلنرتنت"); // د

    // Question 2: MCQ with 4 options
    const q2 = parsed[1];
    expect(q2.type).toBe("MCQ");
    expect(q2.statement).toContain("الرتانزستورات");
    expect(q2.options.length).toBe(4);
    expect(q2.options[0].text).toContain("الحوسبة السحابية"); // أ
    expect(q2.options[1].text).toContain("قانون مور"); // ب

    // Question 3: Essay question without dotted lines
    const q3 = parsed[2];
    expect(q3.type).toBe("ESSAY");
    expect(q3.statement).toContain("اذكر ثالثة تغريات");
    expect(q3.statement).not.toContain("....");

    // Question 4: Essay question
    const q4 = parsed[3];
    expect(q4.type).toBe("ESSAY");
    expect(q4.statement).toContain("التجارة اإللكرتونية");
    expect(q4.statement).not.toContain("....");
  });

  it("parses the user's exact requested MCQ format with Correct Answer and Explanation", () => {
    const userInput = `Question 1: ما المقصود بالذكاء الاصطناعي (AI)؟

A) مجال يهدف إلى تطوير أنظمة حاسوبية تستطيع تنفيذ مهام تتطلب عادةً ذكاءً بشريًا
B) نظام مخصص لتخزين الملفات فقط
C) وسيلة لتوصيل أجهزة الحاسب بالإنترنت فقط
D) برنامج يستخدم لإنشاء الصور فقط

Correct Answer: A

Explanation: الذكاء الاصطناعي مجال يضم أنظمة حاسوبية تستطيع تنفيذ مهام مثل التعلم والتنبؤ والتعرف وتوليد المحتوى واتخاذ القرارات أو دعمها.`;

    const parsed = parseQuestionsFromText(userInput);
    expect(parsed.length).toBe(1);
    const q = parsed[0];
    expect(q.type).toBe("MCQ");
    expect(q.statement).toBe("ما المقصود بالذكاء الاصطناعي (AI)؟");
    expect(q.options.length).toBe(4);
    expect(q.options[0].text).toContain("مجال يهدف إلى تطوير");
    expect(q.options[0].isCorrect).toBe(true);
    expect(q.options[1].isCorrect).toBe(false);
    expect(q.options[2].isCorrect).toBe(false);
    expect(q.options[3].isCorrect).toBe(false);
    expect(q.correctReason).toBe(
      "الذكاء الاصطناعي مجال يضم أنظمة حاسوبية تستطيع تنفيذ مهام مثل التعلم والتنبؤ والتعرف وتوليد المحتوى واتخاذ القرارات أو دعمها."
    );
    expect(q.isValid).toBe(true);
    expect(q.reviewStatus).toBe("APPROVED");
  });

  it("parses Arabic equivalent of user format with سؤال and الإجابة الصحيحة and التفسير", () => {
    const arabicInput = `سؤال 1: ما المقصود بالذكاء الاصطناعي (AI)؟

أ) مجال يهدف إلى تطوير أنظمة حاسوبية تستطيع تنفيذ مهام تتطلب عادةً ذكاءً بشريًا
ب) نظام مخصص لتخزين الملفات فقط
ج) وسيلة لتوصيل أجهزة الحاسب بالإنترنت فقط
د) برنامج يستخدم لإنشاء الصور فقط

الإجابة الصحيحة: أ

التفسير: الذكاء الاصطناعي مجال يضم أنظمة حاسوبية تستطيع تنفيذ مهام مثل التعلم والتنبؤ والتعرف وتوليد المحتوى واتخاذ القرارات أو دعمها.`;

    const parsed = parseQuestionsFromText(arabicInput);
    expect(parsed.length).toBe(1);
    const q = parsed[0];
    expect(q.type).toBe("MCQ");
    expect(q.statement).toBe("ما المقصود بالذكاء الاصطناعي (AI)؟");
    expect(q.options.length).toBe(4);
    expect(q.options[0].text).toContain("مجال يهدف إلى تطوير");
    expect(q.options[0].isCorrect).toBe(true);
    expect(q.options[1].isCorrect).toBe(false);
    expect(q.correctReason).toBe(
      "الذكاء الاصطناعي مجال يضم أنظمة حاسوبية تستطيع تنفيذ مهام مثل التعلم والتنبؤ والتعرف وتوليد المحتوى واتخاذ القرارات أو دعمها."
    );
    expect(q.isValid).toBe(true);
    expect(q.reviewStatus).toBe("APPROVED");
  });

  it("extracts real questions from the official Ministry Assessments PDF", async () => {
    if (!assessmentsExist) {
      console.warn("Skipping PDF test: PDF file not found at", pdfPath);
      return;
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const { questions, text } = await parsePdfBuffer(pdfBuffer);

    expect(text.length).toBeGreaterThan(10000);
    expect(questions.length).toBeGreaterThan(200);

    const mcqs = questions.filter(q => q.type === "MCQ");
    const essays = questions.filter(q => q.type === "ESSAY");

    expect(mcqs.length).toBeGreaterThan(50);
    expect(essays.length).toBeGreaterThan(50);

    const counts: Record<number, number> = {};
    for (const q of mcqs) {
      counts[q.options.length] = (counts[q.options.length] || 0) + 1;
    }
    console.log("PDF MCQ Option Counts:", counts);

    // Verify Bloom's taxonomy cognitive difficulties are assigned
    const difficulties = new Set(questions.map(q => q.difficulty));
    expect(difficulties.has("EASY") || difficulties.has("MEDIUM") || difficulties.has("HARD")).toBe(true);

    // Verify question statements don't contain book dotted answer lines
    for (const q of questions.slice(0, 50)) {
      expect(q.statement).not.toMatch(/\.{6,}/);
    }
  });
});
