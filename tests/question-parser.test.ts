import { describe, expect, it } from "vitest";
import {
  normalizeNumerals,
  cleanText,
  isQuestionStart,
  isOptionLine,
  parseQuestionsFromText,
} from "@/lib/question-parser";

describe("Question Document Parser", () => {
  it("normalizes Eastern Arabic numerals to Western digits", () => {
    expect(normalizeNumerals("سؤال ١٢٣")).toBe("سؤال 123");
    expect(normalizeNumerals("الدرجة: ٥ من ١٠")).toBe("الدرجة: 5 من 10");
  });

  it("cleans and normalizes unicode whitespace and line breaks", () => {
    expect(cleanText("  اختبار   نص\r\nسطر جديد  ")).toBe("اختبار   نص\nسطر جديد");
  });

  it("identifies question start lines accurately", () => {
    expect(isQuestionStart("س1: ما هي وحدة قياس القوة؟")).toBe(true);
    expect(isQuestionStart("1. عرف الحركة التوافقية البسيطة")).toBe(true);
    expect(isQuestionStart("علل: انكسار الضوء عند انتقاله بين وسطين")).toBe(true);
    expect(isQuestionStart("أ) نيوتن")).toBe(false);
  });

  it("identifies option lines in Arabic and English formats", () => {
    expect(isOptionLine("أ) نيوتن")).toBe(true);
    expect(isOptionLine("ب- جول")).toBe(true);
    expect(isOptionLine("A. Newton")).toBe(true);
    expect(isOptionLine("ج] باسكال")).toBe(true);
    expect(isOptionLine("ما هي الإجابة الصحيحة؟")).toBe(false);
  });

  it("parses an MCQ question block with choices and answer indicator", () => {
    const rawBlock = `س1: ما هي وحدة قياس القوة في النظام الدولي؟
أ) جول
ب) نيوتن
ج) وات
د) باسكال
الإجابة: ب
التفسير: النيوتن هو وحدة قياس القوة ويعادل كجم.م/ث²`;

    const questions = parseQuestionsFromText(rawBlock);
    expect(questions.length).toBe(1);
    const parsed = questions[0];
    expect(parsed.isValid).toBe(true);
    expect(parsed.type).toBe("MCQ");
    expect(parsed.options.length).toBe(4);
    const correct = parsed.options.find((o) => o.isCorrect);
    expect(correct?.text).toContain("نيوتن");
    expect(parsed.correctReason).toContain("النيوتن هو وحدة قياس القوة");
  });
});
