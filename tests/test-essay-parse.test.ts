import { describe, it, expect } from "vitest";
import { parseQuestionsFromText } from "@/lib/question-parser";

describe("essay question parse", () => {
  it("parses user essay question", () => {
    const text = `[مقالي] [صعب] س1: حلّل الاختلاف بين أنظمة الذكاء الاصطناعي التي تتعلم من البيانات والبرامج التقليدية التي تعتمد على القواعد المحددة مسبقًا.

الإجابة النموذجية:
1. تعتمد البرامج التقليدية على قواعد يكتبها المبرمج صراحةً لتنفيذ المهام.
2. تتعلم نماذج التعلم الآلي الأنماط من البيانات بدلًا من برمجة كل قاعدة.
3. تستخدم النماذج الأنماط المتعلمة لإجراء تنبؤات أو تصنيفات أو دعم القرارات.

التفسير: الاختلاف الأساسي هو الاعتماد على القواعد المبرمجة صراحةً مقابل تعلم الأنماط من البيانات.

المفهوم: التعلم الآلي والقواعد المبرمجة.`;

    const res = parseQuestionsFromText(text);
    expect(res.length).toBe(1);
    expect(res[0].correctReason).toBe(
      "الاختلاف الأساسي هو الاعتماد على القواعد المبرمجة صراحةً مقابل تعلم الأنماط من البيانات."
    );
    expect(res[0].concept).toBe("التعلم الآلي والقواعد المبرمجة.");
  });

  it("parses التوضيح as explanation", () => {
    const text = `[مقالي] س1: ما هو الذكاء؟
الإجابة النموذجية:
1. نموذج إجابة تجريبي.
التوضيح: هذا هو التوضيح المهم للحل.`;
    const res = parseQuestionsFromText(text);
    expect(res[0].correctReason).toBe("هذا هو التوضيح المهم للحل.");
  });

  it("parses explanation when on a newline after التفسير:", () => {
    const text = `[مقالي] س1: ما هو الذكاء؟
الإجابة النموذجية:
1. نموذج إجابة تجريبي.
التفسير:
الاختلاف الأساسي هو الاعتماد على القواعد المبرمجة صراحةً مقابل تعلم الأنماط من البيانات.
المفهوم: التعلم الآلي.`;
    const res = parseQuestionsFromText(text);
    expect(res[0].correctReason).toBe(
      "الاختلاف الأساسي هو الاعتماد على القواعد المبرمجة صراحةً مقابل تعلم الأنماط من البيانات."
    );
    expect(res[0].concept).toBe("التعلم الآلي.");
  });

  it("parses multi-line explanation correctly", () => {
    const text = `[مقالي] س1: ما هو الذكاء؟
الإجابة النموذجية:
1. نموذج إجابة تجريبي.
التفسير: السطر الأول من التفسير.
السطر الثاني المكمل لنفس التفسير.
المفهوم: الذكاء الاصطناعي.`;
    const res = parseQuestionsFromText(text);
    expect(res[0].correctReason).toContain("السطر الأول من التفسير.");
    expect(res[0].correctReason).toContain("السطر الثاني المكمل لنفس التفسير.");
  });

  it("parses explanation with prefix [التفسير] or تفسير: or الشرح:", () => {
    const t1 = `[مقالي] س1: سؤال تجريبي\nالإجابة النموذجية:\n1. حل\nتفسير: شرح بدون ألف ولام`;
    const r1 = parseQuestionsFromText(t1);
    expect(r1[0].correctReason).toBe("شرح بدون ألف ولام");

    const t2 = `[مقالي] س1: سؤال تجريبي\nالإجابة النموذجية:\n1. حل\nالشرح: شرح كامل`;
    const r2 = parseQuestionsFromText(t2);
    expect(r2[0].correctReason).toBe("شرح كامل");

    const t3 = `[مقالي] س1: سؤال تجريبي\nالإجابة النموذجية:\n1. حل\n[التفسير]: بين قوسين`;
    const r3 = parseQuestionsFromText(t3);
    expect(r3[0].correctReason).toBe("بين قوسين");
  });
});
