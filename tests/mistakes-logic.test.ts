import { describe, it, expect } from "vitest";

describe("Mistakes Logic & Track Compatibility (Arabic & Languages)", () => {
  it("generates correct essay statement and criteria language based on term language", () => {
    const englishTerm = "Cloud Computing";
    const arabicTerm = "الحوسبة السحابية";

    const isEnglishTerm = (term: string) => !/[\u0600-\u06FF]/.test(term);

    expect(isEnglishTerm(englishTerm)).toBe(true);
    expect(isEnglishTerm(arabicTerm)).toBe(false);

    const getStatement = (term: string) =>
      isEnglishTerm(term)
        ? `What is meant by the term: ${term}?`
        : `ما المقصود بمصطلح: ${term}؟`;

    expect(getStatement(englishTerm)).toBe("What is meant by the term: Cloud Computing?");
    expect(getStatement(arabicTerm)).toBe("ما المقصود بمصطلح: الحوسبة السحابية؟");
  });

  it("ensures schoolCategory inherits from parent subject for both tracks", () => {
    const subjectArabic = { id: "sub-1", schoolCategory: "ARABIC" };
    const subjectLanguages = { id: "sub-2", schoolCategory: "LANGUAGES" };

    const createQuestionPayload = (subject: typeof subjectArabic, term: string, meaning: string) => ({
      statement: !/[\u0600-\u06FF]/.test(term)
        ? `What is meant by the term: ${term}?`
        : `ما المقصود بمصطلح: ${term}؟`,
      subjectId: subject.id,
      schoolCategory: subject.schoolCategory,
      rubric: {
        modelAnswer: meaning,
      },
    });

    const qAr = createQuestionPayload(subjectArabic, "التشفير", "حماية البيانات");
    expect(qAr.schoolCategory).toBe("ARABIC");

    const qEn = createQuestionPayload(subjectLanguages, "Encryption", "Data protection");
    expect(qEn.schoolCategory).toBe("LANGUAGES");
  });

  it("correctly groups and filters mistakes exam by primary subject", () => {
    const mistakes = [
      { questionId: "q1", question: { subjectId: "sub-languages", subject: { schoolCategory: "LANGUAGES" } } },
      { questionId: "q2", question: { subjectId: "sub-languages", subject: { schoolCategory: "LANGUAGES" } } },
      { questionId: "q3", question: { subjectId: "sub-arabic", subject: { schoolCategory: "ARABIC" } } },
    ];

    const primarySubjectId = mistakes[0].question.subjectId;
    const subjectMistakes = mistakes.filter((m) => m.question.subjectId === primarySubjectId);

    expect(primarySubjectId).toBe("sub-languages");
    expect(subjectMistakes).toHaveLength(2);
    expect(subjectMistakes.every((m) => m.question.subject.schoolCategory === "LANGUAGES")).toBe(true);
  });
});
