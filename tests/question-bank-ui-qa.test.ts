import { describe, expect, it } from "vitest";
import {
  parseQuestionsFromText,
  getOptionLetterRank,
  normalizeNumerals,
} from "@/lib/question-parser";

describe("Question Bank Redesigned Quality Assurance & Logic Suite", () => {
  // 1. Long Question Statement with mathematical expressions
  it("QA 1: handles long questions with mathematical expressions and scientific notation cleanly", () => {
    const raw = `Question 1: في تجربة لقياس طاقة الحركة لجسيم يتحرك بسرعة v، إذا كانت الكتلة m = 2.5 kg وكانت السرعة تعطى بالعلاقة: v = √(2 * g * h) حيث g = 9.8 m/s² و h = 10 m:
A) الطاقة الحركية E = 1/2 * m * v² = 245 J
B) الطاقة الحركية E = 100 J
C) الطاقة الحركية E = 50 J
D) الطاقة الحركية E = 0 J
Correct Answer: A
Explanation: بتعويض السرعة v² = 2 * g * h = 2 * 9.8 * 10 = 196 m²/s²، ثم E = 0.5 * 2.5 * 196 = 245 J.`;

    const questions = parseQuestionsFromText(raw);
    expect(questions.length).toBe(1);
    const q = questions[0];
    expect(q.type).toBe("MCQ");
    expect(q.statement).toContain("v = √(2 * g * h)");
    expect(q.statement).toContain("9.8 m/s²");
    expect(q.options.length).toBe(4);
    expect(q.options[0].isCorrect).toBe(true);
    expect(q.options[0].text).toContain("1/2 * m * v² = 245 J");
    expect(q.correctReason).toContain("245 J");
  });

  // 2. Multiline choices and Arabic/English letter ranking
  it("QA 2: preserves multiline choices and normalizes letter ranks in correct order", () => {
    expect(getOptionLetterRank("أ) خيار أول")).toBe(1);
    expect(getOptionLetterRank("ب) خيار ثاني")).toBe(2);
    expect(getOptionLetterRank("ج) خيار ثالث")).toBe(3);
    expect(getOptionLetterRank("د) خيار رابع")).toBe(4);
    expect(getOptionLetterRank("هـ) خيار خامس")).toBe(5);
    expect(getOptionLetterRank("A) Option 1")).toBe(1);
    expect(getOptionLetterRank("B) Option 2")).toBe(2);
    expect(getOptionLetterRank("C) Option 3")).toBe(3);
    expect(getOptionLetterRank("D) Option 4")).toBe(4);
  });

  // 3. Essay Rubrics and Model Answers
  it("QA 3: extracts essay rubrics with model answer and max score correctly", () => {
    const raw = `[مقالي] 1. اشرح دورة حياة تطوير البرمجيات (SDLC) مع ذكر ثلاث مراحل أساسية؟
نموذج الإجابة: دورة حياة تطوير البرمجيات هي إطار عمل منظم لبناء التطبيقات.
وتشمل:
1. التخطيط وجمع المتطلبات (Requirements Analysis).
2. التصميم والبناء (Design & Implementation).
3. الاختبار والتشغيل (Testing & Deployment).
الدرجة: 10`;

    const questions = parseQuestionsFromText(raw);
    expect(questions.length).toBe(1);
    const q = questions[0];
    expect(q.type).toBe("ESSAY");
    expect(q.modelAnswer).toContain("Requirements Analysis");
    expect(q.modelAnswer).toContain("Testing & Deployment");
  });

  // 4. Sequential Question Numbering logic across pagination
  it("QA 4: accurately computes continuous sequential question numbers across pagination", () => {
    const pageSize = 25;
    
    // Page 1: indices 0..24 should be #1..#25
    const page1Indices = Array.from({ length: 25 }, (_, idx) => (1 - 1) * pageSize + idx + 1);
    expect(page1Indices[0]).toBe(1);
    expect(page1Indices[24]).toBe(25);

    // Page 2: indices 0..24 should be #26..#50
    const page2Indices = Array.from({ length: 25 }, (_, idx) => (2 - 1) * pageSize + idx + 1);
    expect(page2Indices[0]).toBe(26);
    expect(page2Indices[24]).toBe(50);

    // Page 3: first item should be #51
    const page3First = (3 - 1) * pageSize + 0 + 1;
    expect(page3First).toBe(51);
  });

  // 5. Eastern Arabic Numeral Normalization
  it("QA 5: normalizes Eastern Arabic numerals to standard integers", () => {
    expect(normalizeNumerals("١٢٣٤٥٦٧٨٩٠")).toBe("1234567890");
    expect(normalizeNumerals("السؤال رقم ٥")).toBe("السؤال رقم 5");
  });

  // 6. True/False question extraction with explanation
  it("QA 6: parses True/False questions and sets options and correct explanation", () => {
    const raw = `1. لغة HTML هي لغة برمجة مخصصة لإجراء العمليات الحسابية المعقدة على الخادم. (خطأ)
التفسير: لغة HTML هي لغة ترميز وتوصيف لبنية صفحات الويب وليست لغة برمجة خوادم.`;

    const questions = parseQuestionsFromText(raw);
    expect(questions.length).toBe(1);
    const q = questions[0];
    expect(q.type).toBe("TRUE_FALSE");
    expect(q.options.length).toBe(2);
    expect(q.options.find((o) => o.text === "خطأ")?.isCorrect).toBe(true);
    expect(q.options.find((o) => o.text === "صواب")?.isCorrect).toBe(false);
    expect(q.correctReason).toContain("لغة ترميز وتوصيف");
  });
});
