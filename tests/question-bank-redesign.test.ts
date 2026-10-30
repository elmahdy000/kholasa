import { describe, expect, it } from "vitest";
import {
  parseQuestionsFromText,
  ParseOptions,
  ParsedQuestion,
} from "@/lib/question-parser";

describe("Question Bank Redesign & Classification Engine Acceptance Tests", () => {
  // Test 1: Mixed MCQ, True/False, and Essay in one document
  it("Test 1: correctly extracts and parses mixed MCQ, True/False, and Essay questions", () => {
    const raw = `1. ما هي عاصمة جمهورية مصر العربية؟
*أ) القاهرة
ب) الإسكندرية
ج) الأقصر
د) أسوان
التفسير: القاهرة هي العاصمة السياسية.

---

2. تقع الإسكندرية على ساحل البحر الأحمر. (خطأ)
التفسير: تقع على البحر المتوسط.

---

3. علل: تنوع الأقاليم المناخية في جمهورية مصر العربية؟
نموذج الإجابة: يرجع لاتساع المساحة وتنوع التضاريس.`;

    const questions = parseQuestionsFromText(raw);
    expect(questions.length).toBe(3);

    // Q1: MCQ
    expect(questions[0].type).toBe("MCQ");
    expect(questions[0].options.length).toBe(4);
    expect(questions[0].options[0].text).toContain("القاهرة");
    expect(questions[0].options[0].isCorrect).toBe(true);
    expect(questions[0].options[1].isCorrect).toBe(false);
    expect(questions[0].correctReason).toContain("القاهرة هي العاصمة السياسية");

    // Q2: True/False
    expect(questions[1].type).toBe("TRUE_FALSE");
    expect(questions[1].options.find((o) => o.text === "خطأ")?.isCorrect).toBe(true);
    expect(questions[1].correctReason).toContain("البحر المتوسط");

    // Q3: Essay
    expect(questions[2].type).toBe("ESSAY");
    expect(questions[2].modelAnswer).toContain("لاتساع المساحة");
  });

  // Test 2: Long question statement and multiline options
  it("Test 2: preserves long multi-line question statements and options without truncation", () => {
    const raw = `1. في ضوء دراستك لعلم الفيزياء والجاذبية الأرضية، عند إطلاق قذيفة بزاوية معينة بسرعة ابتدائية محددة،
مع إهمال مقاومة الهواء تماماً واعتبار عجلة الجاذبية منتظمة:
أ) تصل القذيفة لأقصى مدى أفقي عندما تكون زاوية الإطلاق مساوية 45 درجة مع الأفقي
ب) تظل السرعة الرأسية ثابتة طوال مسار الحركة
*ج) تكون السرعة الأفقية ثابتة المقدار والاتجاه طوال الرحلة
د) تنعدم عجلة الحركة عند وصول القذيفة لأقصى ارتفاع لها`;

    const questions = parseQuestionsFromText(raw);
    expect(questions.length).toBe(1);
    expect(questions[0].statement).toContain("في ضوء دراستك لعلم الفيزياء");
    expect(questions[0].statement).toContain("مع إهمال مقاومة الهواء");
    expect(questions[0].options.length).toBe(4);
    expect(questions[0].options[2].isCorrect).toBe(true);
    expect(questions[0].options[2].text).toContain("تكون السرعة الأفقية ثابتة المقدار");
  });

  // Test 3: Question without clear correct answer (Must flag NEEDS_CHANGES and NEVER guess!)
  it("Test 3: never guesses unconfirmed correct answers and flags question as NEEDS_CHANGES", () => {
    const raw = `1. أي العناصر التالية يعتبر غازاً خاملاً؟
أ) الأكسجين
ب) الهيدروجين
ج) النيتروجين
د) النيون`;

    const questions = parseQuestionsFromText(raw);
    expect(questions.length).toBe(1);
    expect(questions[0].type).toBe("MCQ");
    // None should be guessed as true!
    const hasAnyCorrect = questions[0].options.some((o) => o.isCorrect);
    expect(hasAnyCorrect).toBe(false);
    expect(questions[0].isValid).toBe(false);
    expect(questions[0].reviewStatus).toBe("NEEDS_CHANGES");
    expect(questions[0].validationNotes.some((n) => n.includes("لم يتم تحديد الإجابة الصحيحة"))).toBe(true);
  });

  // Test 4: Explicit difficulty tag in the file ([سهل] / [صعب] / [متوسط])
  it("Test 4: respects explicit difficulty tag provided in file bracket syntax", () => {
    const raw = `[صعب] 1. استنتج العلاقة الرياضية بين فرق الجهد وشدة التيار في دائرة كهربائية مغلقة؟
نموذج الإجابة: V = VB - I*r

[سهل] 2. اذكر وحدة قياس شدة التيار الكهربائي؟
*أ) الأمبير
ب) الفولت
ج) الأوم
د) الجول`;

    const questions = parseQuestionsFromText(raw);
    expect(questions.length).toBe(2);
    expect(questions[0].difficulty).toBe("HARD");
    expect(questions[0].difficultyReason).toContain("وسم صريح");

    expect(questions[1].difficulty).toBe("EASY");
    expect(questions[1].difficultyReason).toContain("وسم صريح");
  });

  // Test 5: Cognitive Bloom taxonomy cues for difficulty (without relying on text length)
  it("Test 5: classifies cognitive level based on keywords instead of text length", () => {
    const easyRaw = `1. اذكر تعريف السرعة المتجهة في خط مستقيم؟
نموذج الإجابة: المعدل الزمني للتغير في الإزاحة.`;

    const hardRaw = `1. حلل واستنتج كيف تؤثر زيادة درجة الحرارة على معدل التفاعل الكيميائي؟
نموذج الإجابة: تزيد من طاقة حركة الجزيئات وعدد التصادمات الفعالة.`;

    const easyQ = parseQuestionsFromText(easyRaw);
    const hardQ = parseQuestionsFromText(hardRaw);

    expect(easyQ[0].difficulty).toBe("EASY");
    expect(easyQ[0].difficultyReason).toContain("التذكر");

    expect(hardQ[0].difficulty).toBe("HARD");
    expect(hardQ[0].difficultyReason).toContain("تفكير عليا");
  });

  // Test 6: In-batch duplicate question detection
  it("Test 6: detects duplicate questions within the imported batch", () => {
    const raw = `1. ما هي عاصمة جمهورية مصر العربية؟
*أ) القاهرة
ب) الإسكندرية
ج) الأقصر
د) أسوان

---

2. ما هي عاصمة جمهورية مصر العربية؟
*أ) القاهرة
ب) الإسكندرية
ج) الأقصر
د) أسوان`;

    const questions = parseQuestionsFromText(raw);
    expect(questions.length).toBe(2);
    expect(questions[0].isDuplicate).toBe(false);
    expect(questions[1].isDuplicate).toBe(true);
    expect(questions[1].validationNotes.some((n) => n.includes("اشتباه تكرار"))).toBe(true);
  });

  // Test 7: School category isolation (Languages vs Arabic)
  it("Test 7: handles English lettering (A, B, C, D) and terms for Languages schools", () => {
    const raw = `1. What is the unit of electric current?
*A) Ampere
B) Volt
C) Ohm
D) Joule
Explanation: Ampere is the SI unit of current.

---

2. Alexandria is located on the Red Sea coast. (False)`;

    const questions = parseQuestionsFromText(raw, { schoolCategory: "LANGUAGES" });
    expect(questions.length).toBe(2);

    expect(questions[0].type).toBe("MCQ");
    expect(questions[0].options[0].text).toContain("Ampere");
    expect(questions[0].options[0].isCorrect).toBe(true);
    expect(questions[0].correctReason).toContain("Ampere is the SI unit");

    expect(questions[1].type).toBe("TRUE_FALSE");
    expect(questions[1].options.find((o) => o.text === "False")?.isCorrect).toBe(true);
  });

  // Test 8: Allowed Types restriction in Wizard Stage 1
  it("Test 8: flags questions not matching allowed types for exclusion", () => {
    const raw = `1. ما هي عاصمة مصر؟
*أ) القاهرة
ب) الإسكندرية

---

2. علل: تنوع الأقاليم المناخية بمصر؟
نموذج الإجابة: لاتساع المساحة.`;

    // Only allow MCQ
    const questions = parseQuestionsFromText(raw, {
      allowedTypes: ["MCQ"],
    });

    expect(questions.length).toBe(2);
    expect(questions[0].type).toBe("MCQ");
    expect(questions[0].reviewStatus).toBe("APPROVED");

    expect(questions[1].type).toBe("ESSAY");
    // Should be flagged as EXCLUDED because ESSAY is not in allowedTypes
    expect(questions[1].reviewStatus).toBe("EXCLUDED");
  });

  // Test 9: Forced difficulty strategy
  it("Test 9: overrides question difficulties when forced strategy is selected", () => {
    const raw = `1. اذكر عاصمة مصر؟
*أ) القاهرة
ب) الإسكندرية

2. علل تنوع الأقاليم المناخية؟
نموذج الإجابة: لاتساع المساحة.`;

    const questions = parseQuestionsFromText(raw, {
      strategy: "FORCED",
      forcedDifficulty: "HARD",
    });

    expect(questions.length).toBe(2);
    expect(questions[0].difficulty).toBe("HARD");
    expect(questions[1].difficulty).toBe("HARD");
    expect(questions[0].difficultyReason).toContain("إعدادات الاستيراد");
  });

  // Test 10: Manual Review strategy sets reviewStatus to PENDING
  it("Test 10: forces questions into PENDING under MANUAL_REVIEW strategy", () => {
    const raw = `1. ما هي عاصمة مصر؟
*أ) القاهرة
ب) الجيزة`;

    const questions = parseQuestionsFromText(raw, {
      strategy: "MANUAL_REVIEW",
    });

    expect(questions.length).toBe(1);
    expect(questions[0].reviewStatus).toBe("PENDING");
  });
});
