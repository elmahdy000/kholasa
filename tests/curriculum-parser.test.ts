import { describe, it, expect } from "vitest";
import { parseCurriculumText } from "@/lib/curriculum-parser";

describe("parseCurriculumText", () => {
  it("parses Arabic bulleted units and lessons outline", () => {
    const raw = `
الوحدة الأولى: القوى والحركة
- كمية التحرك
- قانون نيوتن الثاني
- الكتلة والوزن

الوحدة الثانية: الحركة الدائرية
- العجلة المركزية
- القوة الجاذبة المركزية
    `;

    const result = parseCurriculumText(raw);
    expect(result.totalUnits).toBe(2);
    expect(result.totalLessons).toBe(5);

    expect(result.units[0].title).toContain("الوحدة الأولى");
    expect(result.units[0].lessons).toHaveLength(3);
    expect(result.units[0].lessons[0].title).toBe("كمية التحرك");
    expect(result.units[0].lessons[0].order).toBe(1);

    expect(result.units[1].title).toContain("الوحدة الثانية");
    expect(result.units[1].lessons).toHaveLength(2);
    expect(result.units[1].lessons[1].title).toBe("القوة الجاذبة المركزية");
    expect(result.units[1].lessons[1].order).toBe(2);
  });

  it("parses numbered outlines with markdown headers", () => {
    const raw = `
# الفصل الأول: تركيب الذرة
1. النواة والإلكترونات
2. مستويات الطاقة
3. التوزيع الإلكتروني

# الفصل الثاني: الروابط الكيميائية
1. الرابطة الأيونية
2. الرابطة التساهمية
    `;

    const result = parseCurriculumText(raw);
    expect(result.totalUnits).toBe(2);
    expect(result.totalLessons).toBe(5);
    expect(result.units[0].title).toBe("الفصل الأول: تركيب الذرة");
    expect(result.units[0].lessons[0].title).toBe("النواة والإلكترونات");
    expect(result.units[1].lessons[1].title).toBe("الرابطة التساهمية");
  });

  it("handles empty or whitespace text gracefully", () => {
    const result = parseCurriculumText("   \n\n  ");
    expect(result.totalUnits).toBe(0);
    expect(result.totalLessons).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("creates a default unit if lessons are provided without an explicit unit header", () => {
    const raw = `
- الدرس الأول: مقدمة
- الدرس الثاني: الخصائص العامة
    `;

    const result = parseCurriculumText(raw);
    expect(result.totalUnits).toBe(1);
    expect(result.totalLessons).toBe(2);
    expect(result.units[0].lessons[0].title).toBe("مقدمة");
  });
});
