import { describe, expect, it } from "vitest";
import { extractAnswerPoints } from "@/components/ui/FormattedAnswerView";

describe("extractAnswerPoints", () => {
  it("extracts inline numbered points from real user essay answer", () => {
    const raw =
      "1. القيادة الذاتية: تستخدم الذكاء الاصطناعي والكاميرات والمستشعرات لإدراك المحيط واتخاذ قرارات القيادة، وتساعد الحوسبة الطرفية على تقليل زمن الاستجابة، لأن التأخير قد يؤثر في السلامة. 2. الواقع المعزز والواقع الافتراضي: يضيف الواقع المعزز معلومات رقمية إلى العالم الحقيقي، بينما يضع الواقع الافتراضي المستخدم داخل بيئة مولدة حاسوبيا. 3. الحوسبة الكمومية: تستخدم خصائص ميكانيكا الكم لمعالجة المعلومات، وقد توفر تفوقًا في فئات محددة من المسائل، لكنها لا تسرّع جميع أنواع الحسابات.";

    const result = extractAnswerPoints(raw);
    expect(result).not.toBeNull();
    expect(result!.points.length).toBe(3);

    expect(result!.points[0].badge).toBe("1");
    expect(result!.points[0].title).toBe("القيادة الذاتية:");
    expect(result!.points[0].body).toContain("تستخدم الذكاء الاصطناعي");

    expect(result!.points[1].badge).toBe("2");
    expect(result!.points[1].title).toBe("الواقع المعزز والواقع الافتراضي:");
    expect(result!.points[1].body).toContain("يضيف الواقع المعزز");

    expect(result!.points[2].badge).toBe("3");
    expect(result!.points[2].title).toBe("الحوسبة الكمومية:");
    expect(result!.points[2].body).toContain("تستخدم خصائص ميكانيكا الكم");
  });

  it("extracts points separated by newlines and dashes", () => {
    const raw = `1- الأربعينيات: ظهور الحواسيب الإلكترونية
2- السبعينيات: الحواسيب الشخصية
3- التسعينيات: ظهور الويب`;

    const result = extractAnswerPoints(raw);
    expect(result).not.toBeNull();
    expect(result!.points.length).toBe(3);
    expect(result!.points[0].title).toBe("الأربعينيات:");
    expect(result!.points[1].title).toBe("السبعينيات:");
    expect(result!.points[2].title).toBe("التسعينيات:");
  });

  it("extracts bullet points with introductory sentence", () => {
    const raw =
      "أهم فوائد الحوسبة السحابية: • توفير الموارد عند الطلب • تقليل تكاليف البنية التحتية • سهولة الوصول من أي مكان";

    const result = extractAnswerPoints(raw);
    expect(result).not.toBeNull();
    expect(result!.intro).toBe("أهم فوائد الحوسبة السحابية:");
    expect(result!.points.length).toBe(3);
  });

  it("returns null for simple short paragraphs without points", () => {
    const raw = "هذا نص إجابة عادي يتكون من جملة واحدة بسيطة بدون أي ترقيمات.";
    const result = extractAnswerPoints(raw);
    expect(result).toBeNull();
  });
});
