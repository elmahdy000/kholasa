import { describe, it, expect } from "vitest";
import { parseDefinitionsText } from "../src/components/admin/lesson-editor/LessonDefinitionsTab";

describe("Definitions Parser & Translation Specifications", () => {
  it("should parse 2-line definition with 'الترجمة:' and preserve translation", () => {
    const text = `Moore's Law: the empirical observation that transistors double every two years.
الترجمة: ملاحظة تجريبية تنص على تضاعف الترانزستورات كل سنتين.

Cloud Computing: IT delivered as a service over the Internet.
الترجمة العربية: تقديم موارد تكنولوجيا المعلومات في صورة خدمات عبر الإنترنت.`;

    const defs = parseDefinitionsText(text);

    expect(defs).toHaveLength(2);
    expect(defs[0].term).toBe("Moore's Law");
    expect(defs[0].meaning).toBe(
      "the empirical observation that transistors double every two years."
    );
    expect(defs[0].translation).toBe(
      "ملاحظة تجريبية تنص على تضاعف الترانزستورات كل سنتين."
    );

    expect(defs[1].term).toBe("Cloud Computing");
    expect(defs[1].translation).toBe(
      "تقديم موارد تكنولوجيا المعلومات في صورة خدمات عبر الإنترنت."
    );
  });

  it("should parse inline double-pipe delimiter '||' with translation", () => {
    const text = `Moore's Law: Transistors double every 2 years. || يتضاعف عدد الترانزستورات كل عامين.
Edge Computing - Processing on device instantly. || معالجة البيانات على الجهاز نفسه فوراً.`;

    const defs = parseDefinitionsText(text);

    expect(defs).toHaveLength(2);
    expect(defs[0].term).toBe("Moore's Law");
    expect(defs[0].translation).toBe("يتضاعف عدد الترانزستورات كل عامين.");

    expect(defs[1].term).toBe("Edge Computing");
    expect(defs[1].translation).toBe("معالجة البيانات على الجهاز نفسه فوراً.");
  });

  it("should parse JSON definitions with flexible translation keys", () => {
    const jsonText = JSON.stringify([
      {
        term: "AR (Augmented Reality)",
        meaning: "a technology that overlays digital information on real-world images.",
        arabicTranslation: "تقنية تضيف عناصر أو معلومات رقمية إلى مشهد من العالم الحقيقي.",
      },
      {
        name: "VR (Virtual Reality)",
        definition: "a technology that allows users to immerse themselves in virtual space.",
        translation: "تقنية تضع المستخدم داخل بيئة افتراضية مولَّدة حاسوبياً.",
      },
    ]);

    const defs = parseDefinitionsText(jsonText);

    expect(defs).toHaveLength(2);
    expect(defs[0].translation).toBe(
      "تقنية تضيف عناصر أو معلومات رقمية إلى مشهد من العالم الحقيقي."
    );
    expect(defs[1].translation).toBe(
      "تقنية تضع المستخدم داخل بيئة افتراضية مولَّدة حاسوبياً."
    );
  });

  it("should parse inline parenthesized translation in meaning", () => {
    const text = `Quantum Computing: dramatic speedup of difficult computations (الترجمة: نهج حوسبي متقدم يعتمد على ميكانيكا الكم)`;

    const defs = parseDefinitionsText(text);

    expect(defs).toHaveLength(1);
    expect(defs[0].term).toBe("Quantum Computing");
    expect(defs[0].meaning).toBe("dramatic speedup of difficult computations");
    expect(defs[0].translation).toBe(
      "نهج حوسبي متقدم يعتمد على ميكانيكا الكم"
    );
  });
});
