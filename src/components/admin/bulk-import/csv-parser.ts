import type { ParsedQuestion } from "./types";

export function handleDownloadSample(): void {
  const csvContent =
    "نص السؤال,نوع السؤال,المستوى,الخيار الأول,صحيح1,تفسير الخيار 1,الخيار الثاني,صحيح2,تفسير الخيار 2,الخيار الثالث,صحيح3,تفسير الخيار 3,الخيار الرابع,صحيح4,تفسير الخيار 4,المفهوم التعليمي,سبب صحة الإجابة\n" +
    '"ما هو ناتج تفاعل حمض الهيدروكلوريك مع هيدروكسيد الصوديوم؟",MCQ,EASY,"كلوريد صوديوم وماء",نعم,"تفاعل تعادل كلاسيكي بين حمض وقاعدة","غاز الهيدروجين فقط",لا,"لا ينتج غاز مفرد","حمض كبريتيك",لا,"لا يحتوي المتفاعلات على كبريت","راسب أبيض",لا,"جميع النواتج ذائبة","تفاعلات التعادل","يتفاعل الحمض مع القلوي ليعطي ملحاً وماء"\n' +
    '"تعتبر الخلية النباتية محاطة بجدار خلوي من مادة السليلوز",TRUE_FALSE,EASY,"صواب",نعم,"السليلوز يمنح النبات دعامة وشكلاً محدداً","خطأ",لا,"الخلية النباتية تمتلك جداراً فعلياً","الجدار الخلوي","الجدار الخلوي الخارجي يميز الخلايا النباتية عن الحيوانية"\n';

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "kholasa_questions_sample.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(content: string, selectedSubjectId: string, selectedUnitId?: string): ParsedQuestion[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return [];
  }

  // Skip header line
  const dataLines = lines.slice(1);
  const result: ParsedQuestion[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' && (j === 0 || line[j - 1] !== "\\")) {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        cells.push(cur.trim().replace(/^"|"$/g, ""));
        cur = "";
      } else {
        cur += char;
      }
    }
    cells.push(cur.trim().replace(/^"|"$/g, ""));

    if (cells.length < 4 || !cells[0]) continue;

    const statement = cells[0];
    const rawType = (cells[1] || "MCQ").toUpperCase();
    const type: "MCQ" | "TRUE_FALSE" | "ESSAY" =
      rawType.includes("TRUE") || rawType.includes("صح")
        ? "TRUE_FALSE"
        : rawType.includes("ESSAY") || rawType.includes("مقال")
        ? "ESSAY"
        : "MCQ";

    const rawDiff = (cells[2] || "MEDIUM").toUpperCase();
    const difficulty: "EASY" | "MEDIUM" | "HARD" =
      rawDiff.includes("EASY") || rawDiff.includes("سهل")
        ? "EASY"
        : rawDiff.includes("HARD") || rawDiff.includes("صعب") || rawDiff.includes("متقدم")
        ? "HARD"
        : "MEDIUM";

    const options: { text: string; isCorrect: boolean; explanation?: string }[] = [];

    if (cells[3]) {
      const isCorrect =
        cells[4]?.toLowerCase() === "true" ||
        cells[4]?.toLowerCase() === "1" ||
        cells[4] === "نعم" ||
        cells[4] === "صحيح";
      options.push({ text: cells[3], isCorrect, explanation: cells[5] || "" });
    }

    if (cells[6]) {
      const isCorrect =
        cells[7]?.toLowerCase() === "true" ||
        cells[7]?.toLowerCase() === "1" ||
        cells[7] === "نعم" ||
        cells[7] === "صحيح";
      options.push({ text: cells[6], isCorrect, explanation: cells[8] || "" });
    }

    if (cells[9]) {
      const isCorrect =
        cells[10]?.toLowerCase() === "true" ||
        cells[10]?.toLowerCase() === "1" ||
        cells[10] === "نعم" ||
        cells[10] === "صحيح";
      options.push({ text: cells[9], isCorrect, explanation: cells[11] || "" });
    }

    if (cells[12]) {
      const isCorrect =
        cells[13]?.toLowerCase() === "true" ||
        cells[13]?.toLowerCase() === "1" ||
        cells[13] === "نعم" ||
        cells[13] === "صحيح";
      options.push({ text: cells[12], isCorrect, explanation: cells[14] || "" });
    }

    const concept = cells[15] || undefined;
    const correctReason = cells[16] || undefined;

    let isValid = true;
    let error = undefined;

    if (!statement) {
      isValid = false;
      error = "نص السؤال غير موجود";
    } else if (type === "MCQ" && options.length < 2) {
      isValid = false;
      error = "يجب توفر خيارين على الأقل";
    } else if (
      (type === "MCQ" || type === "TRUE_FALSE") &&
      !options.some((o) => o.isCorrect)
    ) {
      isValid = false;
      error = "لم يتم تحديد أي إجابة صحيحة (ضع 'نعم' في عمود صحيح)";
    }

    result.push({
      statement,
      type,
      difficulty,
      subjectId: selectedSubjectId,
      unitId: selectedUnitId || undefined,
      concept,
      correctReason,
      options,
      isValid,
      error,
    });
  }

  return result;
}
