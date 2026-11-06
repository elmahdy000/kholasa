import { describe, it, expect } from "vitest";
import { splitExplanation } from "../src/components/ui/QuestionExplanationBox";
import { extractAnswerPoints } from "../src/components/ui/FormattedAnswerView";
import { cleanQuestionStatement } from "../src/lib/question-parser";

describe("Explanation, BiDi, and Question Cleaning Specifications", () => {
  it("should split primary explanation and embedded translation accurately without creating numbered points", () => {
    const rawExplanation = `The book places the spread of personal computers in the 1970s–1980s; the 1990s are associated with the commercialization of the Internet and the Web.

الترجمة العربية للتفسير:
يربط الكتاب انتشار أجهزة الكمبيوتر الشخصية بالسبعينيات والثمانينيات، بينما ترتبط التسعينيات بإتاحة الإنترنت للاستخدام التجاري وظهور الويب.`;

    const { primary, translation } = splitExplanation(rawExplanation);

    expect(primary).toBe(
      "The book places the spread of personal computers in the 1970s–1980s; the 1990s are associated with the commercialization of the Internet and the Web."
    );
    expect(translation).toBe(
      "يربط الكتاب انتشار أجهزة الكمبيوتر الشخصية بالسبعينيات والثمانينيات، بينما ترتبط التسعينيات بإتاحة الإنترنت للاستخدام التجاري وظهور الويب."
    );

    // Make sure extractAnswerPoints on primary returns null (single paragraph, NOT artificial badge cards 1, 2, 3)
    const points = extractAnswerPoints(primary);
    expect(points).toBeNull();
  });

  it("should clean leading inverted question marks on English statements", () => {
    const inverted = "?Which of the following options represents the main technology or event associated with the 1970s and 1980s";
    const cleaned = cleanQuestionStatement(inverted);

    expect(cleaned).toBe(
      "Which of the following options represents the main technology or event associated with the 1970s and 1980s?"
    );
  });

  it("should not create structured numbered points from translation headers", () => {
    const textWithTranslation = `Personal computers emerged in 1970s.
الترجمة العربية للتفسير:
ظهرت الحواسيب الشخصية في السبعينيات.`;

    const points = extractAnswerPoints(textWithTranslation);
    // Should NOT parse "الترجمة العربية للتفسير:" as point 2
    expect(points).toBeNull();
  });

  it("should correctly extract genuine educational points when structured markers are present", () => {
    const structuredText = `1. First concept: Computer hardware
2. Second concept: Software applications`;

    const result = extractAnswerPoints(structuredText);
    expect(result).not.toBeNull();
    expect(result?.points).toHaveLength(2);
    expect(result?.points[0].badge).toBe("1");
    expect(result?.points[1].badge).toBe("2");
  });
});

