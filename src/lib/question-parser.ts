/**
 * Question Document Parser for Kholasa Platform
 * Parses Word (.docx) and structured text into questions (MCQ, TRUE_FALSE, ESSAY)
 * Supports Egyptian curriculum formatting, Arabic/English lettering, and various teacher styles.
 */

export type QuestionType = "MCQ" | "TRUE_FALSE" | "ESSAY";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface ParsedQuestionOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface ParsedQuestion {
  id: string;
  statement: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  options: ParsedQuestionOption[];
  modelAnswer?: string;
  concept?: string;
  correctReason?: string;
  points?: number;
  subjectId?: string;
  unitId?: string;
  lessonId?: string;
  isValid: boolean;
  validationNotes: string[];
  rawText?: string;
}

// Convert Eastern Arabic numerals (٠-٩) to Western (0-9)
export function normalizeNumerals(str: string): string {
  const easternDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replace(easternDigits[i], String(i));
  }
  return res;
}

// Normalize Arabic letters and clean whitespace
export function cleanText(str: string): string {
  if (!str) return "";
  return str
    .replace(/[\u00a0\u200b\uFEFF]/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

/**
 * Check if a line starts a new question
 */
export function isQuestionStart(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Pattern 1: Question indicator like "س1:", "س:", "سؤال 1:", "السؤال الأول:"
  const arabicQPrefix = /^(?:س|سؤال|السؤال)\s*(?:[0-9]+|[٠-٩]+|[الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر]+)?\s*[:\-\.\)\/]/i;
  if (arabicQPrefix.test(trimmed)) return true;

  // Pattern 2: English Question indicator "Q1:", "Question 1:", "Q:"
  const englishQPrefix = /^(?:Question|Q)\s*[0-9]*\s*[:\-\.\)\/]/i;
  if (englishQPrefix.test(trimmed)) return true;

  // Pattern 3: Numbered line like "1.", "1-", "1)", "(1)", "١.", "١-", "١)"
  const numberedStart = /^(?:\([0-9]+\)|[0-9]+[\.\-\)\:\/]|(?:\([٠-٩]+\)|[٠-٩]+[\.\-\)\:\/]))\s+/;
  if (numberedStart.test(trimmed)) {
    // Avoid mistaking choice "1)" for question start if it's short, but > 5 chars is a question
    return trimmed.length > 5;
  }

  // Pattern 4: Explicit essay prompt keywords at line start
  const essayKeywords = /^(?:علل|فسر|وضح|اشرح|قارن بين|ما النتائج المترتبة على|ما المقصود بـ|عرف|أثبت أن|بين سبب|لماذا)\b/;
  if (essayKeywords.test(trimmed)) return true;

  return false;
}

/**
 * Check if line is a choice/option indicator (MCQ or TRUE/FALSE)
 */
export function isOptionLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Arabic letters: أ, ب, ج, د (with brackets, parenthesis, or dots)
  const arabicChoice = /^[\*\(]?\s*(?:[أاإآ]|ب|ج|د)[\.\-\)\:\]\*]/;
  if (arabicChoice.test(trimmed)) return true;

  // English letters: A, B, C, D
  const englishChoice = /^[\*\(]?\s*[A-Da-d][\.\-\)\:\]\*]/;
  if (englishChoice.test(trimmed)) return true;

  // Numbered choices 1-4 when surrounded by brackets or parens (1), [1]
  const bracketedNumChoice = /^[\*\(]?\s*(?:[1-4]|[١-٤])[\.\-\)\:\]\*]/;
  if (bracketedNumChoice.test(trimmed) && trimmed.length < 120) return true;

  return false;
}

/**
 * Parse inline choices on a single line (e.g. "أ) القاهرة   ب) الإسكندرية   ج) أسوان   د) الجيزة")
 */
export function extractInlineChoices(line: string): string[] {
  const regex = /(?:^|\s+)([\*\(]?\s*(?:[أاإآ]|ب|ج|د|[A-Da-d]|[1-4]|[١-٤])[\.\-\)\:\]\*]\s+[\s\S]+?)(?=(?:\s+[\*\(]?\s*(?:[أاإآ]|ب|ج|د|[A-Da-d]|[1-4]|[١-٤])[\.\-\)\:\]\*]|$))/g;
  const matches: string[] = [];
  let m;
  while ((m = regex.exec(line)) !== null) {
    matches.push(m[1].trim());
  }
  if (matches.length >= 2) return matches;

  return [];
}

/**
 * Strip question numbering/prefix from statement
 */
export function cleanQuestionStatement(statement: string): string {
  let cleaned = statement.trim();

  cleaned = cleaned
    .replace(/^(?:س|سؤال|السؤال)\s*(?:[0-9]+|[٠-٩]+|[الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر]+)?\s*[:\-\.\)\/]\s*/i, "")
    .replace(/^(?:Question|Q)\s*[0-9]*\s*[:\-\.\)\/]\s*/i, "")
    .replace(/^(?:\([0-9]+\)|[0-9]+[\.\-\)\:\/]|(?:\([٠-٩]+\)|[٠-٩]+[\.\-\)\:\/]))\s*/, "")
    .trim();

  return cleaned;
}

/**
 * Parse an option item to extract clean text and detect correctness
 */
export function parseOptionItem(rawOption: string): ParsedQuestionOption {
  let text = rawOption.trim();
  let isCorrect = false;

  // Check if starts or ends with asterisk: *أ) ... or أ) ... *
  if (text.startsWith("*") || text.endsWith("*") || text.includes("(*)")) {
    isCorrect = true;
    text = text.replace(/^\*+|\*+$|\(\*\)/g, "").trim();
  }

  // Check for checkmark (√) or [x] or (صح) or (صحيح)
  if (/[\(√\[✓]\s*(?:√|✓|x|X|صح|صحيح)\s*[\)\]]/.test(text)) {
    isCorrect = true;
    text = text.replace(/[\(√\[✓]\s*(?:√|✓|x|X|صح|صحيح)\s*[\)\]]/g, "").trim();
  }

  // Strip choice prefix: "أ)", "أ-", "(أ)", "A)", "A.", "1)", etc.
  text = text
    .replace(/^[\*\(]?\s*(?:[أاإآ]|ب|ج|د|[A-Da-d]|[1-4]|[١-٤])[\.\-\)\:\]\*]\s*/, "")
    .replace(/^\([أاإآبجدA-Da-d1-4١-٤]\)\s*/, "")
    .replace(/^\[[أاإآبجدA-Da-d1-4١-٤]\]\s*/, "")
    .trim();

  // Strip trailing correctness notes if any
  text = text.replace(/[\(\[]\s*(?:صحيح|إجابة صحيحة|correct)\s*[\)\]]/i, "").trim();

  return {
    text,
    isCorrect,
  };
}

/**
 * Main parser function: converts text into structured ParsedQuestion array
 */
export function parseQuestionsFromText(rawContent: string): ParsedQuestion[] {
  const text = cleanText(rawContent);
  if (!text) return [];

  const rawLines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const questions: ParsedQuestion[] = [];

  let currentBlock: string[] = [];

  function flushBlock() {
    if (currentBlock.length === 0) return;
    const q = processQuestionBlock(currentBlock);
    if (q) {
      questions.push(q);
    }
    currentBlock = [];
  }

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Check if line indicates a section header that we should skip or use as context
    if (/^(?:أسئلة|اختبار|امتحان|بنك الأسئلة|الفصل|الوحدة|الدرس)\s*[:\-]/i.test(line) && line.length < 40) {
      if (currentBlock.length === 0) continue;
    }

    if (isQuestionStart(line)) {
      if (currentBlock.length > 0) {
        flushBlock();
      }
      currentBlock.push(line);
    } else {
      if (currentBlock.length > 0) {
        currentBlock.push(line);
      } else {
        // Line before any explicit question start, but looks like a question
        if (line.endsWith("؟") || line.endsWith("?") || line.endsWith(":") || isOptionLine(line)) {
          currentBlock.push(line);
        }
      }
    }
  }

  flushBlock();

  return questions;
}

/**
 * Process a block of lines representing a single question
 */
function processQuestionBlock(lines: string[]): ParsedQuestion | null {
  if (lines.length === 0) return null;

  const rawBlockText = lines.join("\n");
  let statement = "";
  const rawOptionLines: string[] = [];
  let answerLine = "";
  let explanationText = "";
  let conceptText = "";
  let modelAnswerText = "";
  let detectedType: QuestionType = "MCQ";

  // First line is almost always the statement start
  statement = lines[0];
  let statementLines = [lines[0]];
  let readingStatement = true;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Check for Answer Indicator line
    const answerMatch = line.match(/^(?:الإجابة الصحيحة|الإجابة|الجواب|الحل|Answer|Correct Answer)\s*[:\-\=]\s*(.*)$/i);
    if (answerMatch) {
      readingStatement = false;
      answerLine = answerMatch[1].trim();
      continue;
    }

    // Check for Model Answer (for Essay)
    const modelAnswerMatch = line.match(/^(?:الإجابة النموذجية|نموذج الإجابة|Model Answer)\s*[:\-\=]\s*(.*)$/i);
    if (modelAnswerMatch) {
      readingStatement = false;
      modelAnswerText = modelAnswerMatch[1].trim();
      detectedType = "ESSAY";
      continue;
    }

    // Check for Explanation / Reason line
    const expMatch = line.match(/^(?:التفسير|التعليل|سبب الإجابة|تفسير الإجابة|Explanation)\s*[:\-\=]\s*(.*)$/i);
    if (expMatch) {
      readingStatement = false;
      explanationText = expMatch[1].trim();
      continue;
    }

    // Check for Concept line
    const conceptMatch = line.match(/^(?:المفهوم|المفهوم التعليمي|الدرس|الوحدة|Concept)\s*[:\-\=]\s*(.*)$/i);
    if (conceptMatch) {
      readingStatement = false;
      conceptText = conceptMatch[1].trim();
      continue;
    }

    // Check if line contains inline choices (e.g. أ) ... ب) ... ج) ... د) ...)
    const inlineChoices = extractInlineChoices(line);
    if (inlineChoices.length >= 2) {
      readingStatement = false;
      rawOptionLines.push(...inlineChoices);
      continue;
    }

    // Check if line is an option
    if (isOptionLine(line)) {
      readingStatement = false;
      rawOptionLines.push(line);
      continue;
    }

    // If still in statement reading mode and hasn't hit options
    if (readingStatement) {
      statementLines.push(line);
    } else {
      // If we already saw options or answers, append line to explanation or model answer
      if (detectedType === "ESSAY" || modelAnswerText) {
        modelAnswerText = (modelAnswerText ? modelAnswerText + " " : "") + line;
      } else if (explanationText) {
        explanationText += " " + line;
      }
    }
  }

  // Re-assemble cleaned statement
  statement = statementLines.join(" ");
  statement = cleanQuestionStatement(statement);

  // Check if statement contains embedded True/False markers like (صح) or (خطأ) or (√) or (×)
  let embeddedTrueFalseAnswer: boolean | null = null;
  if (/[\(（]\s*(?:صح|صواب|نعم|√|✓)\s*[\)）]/.test(statement)) {
    embeddedTrueFalseAnswer = true;
    detectedType = "TRUE_FALSE";
    statement = statement.replace(/[\(（]\s*(?:صح|صواب|نعم|√|✓)\s*[\)）]/g, "").trim();
  } else if (/[\(（]\s*(?:خطأ|غلط|لا|×|X)\s*[\)）]/.test(statement)) {
    embeddedTrueFalseAnswer = false;
    detectedType = "TRUE_FALSE";
    statement = statement.replace(/[\(（]\s*(?:خطأ|غلط|لا|×|X)\s*[\)）]/g, "").trim();
  } else if (/\((?:صح\s*[\/\-]\s*خطأ|صواب\s*[\/\-]\s*خطأ)\)/.test(statement)) {
    detectedType = "TRUE_FALSE";
    statement = statement.replace(/\((?:صح\s*[\/\-]\s*خطأ|صواب\s*[\/\-]\s*خطأ)\)/g, "").trim();
  }

  // Detect type if essay prompt keywords are present
  const essayKeywords = /^(?:علل|فسر|وضح|اشرح|قارن بين|ما النتائج المترتبة على|ما المقصود بـ|عرف|أثبت أن|بين سبب|لماذا)\b/;
  if (essayKeywords.test(statement) && rawOptionLines.length === 0) {
    detectedType = "ESSAY";
  }

  // Detect True/False if options only contain صح / خطأ
  if (rawOptionLines.length === 2) {
    const opt1 = rawOptionLines[0].toLowerCase();
    const opt2 = rawOptionLines[1].toLowerCase();
    if (
      (opt1.includes("صح") || opt1.includes("صواب") || opt1.includes("true")) &&
      (opt2.includes("خطأ") || opt2.includes("غلط") || opt2.includes("false"))
    ) {
      detectedType = "TRUE_FALSE";
    }
  }

  // Process Options
  let parsedOptions: ParsedQuestionOption[] = [];

  if (detectedType === "TRUE_FALSE") {
    let trueIsCorrect = false;
    let falseIsCorrect = false;

    if (embeddedTrueFalseAnswer !== null) {
      trueIsCorrect = embeddedTrueFalseAnswer;
      falseIsCorrect = !embeddedTrueFalseAnswer;
    } else if (answerLine) {
      if (/صح|صواب|نعم|√|true|1/i.test(answerLine)) {
        trueIsCorrect = true;
      } else if (/خطأ|غلط|لا|×|false|0/i.test(answerLine)) {
        falseIsCorrect = true;
      }
    } else if (rawOptionLines.length >= 2) {
      const o1 = parseOptionItem(rawOptionLines[0]);
      const o2 = parseOptionItem(rawOptionLines[1]);
      if (o1.isCorrect) trueIsCorrect = true;
      if (o2.isCorrect) falseIsCorrect = true;
    }

    parsedOptions = [
      { text: "صواب", isCorrect: trueIsCorrect },
      { text: "خطأ", isCorrect: falseIsCorrect },
    ];
  } else if (detectedType === "MCQ") {
    parsedOptions = rawOptionLines.map((optLine) => parseOptionItem(optLine));

    // If correct option wasn't found via asterisk, check answerLine (e.g. "الإجابة: ب" or "الإجابة: القاهرة")
    if (answerLine && !parsedOptions.some((o) => o.isCorrect)) {
      const cleanAnswer = answerLine.trim();

      // Check if answer specifies a letter (أ/ب/ج/د or A/B/C/D or 1/2/3/4)
      const letterMatch = cleanAnswer.match(/(?:^|\s|\(|\[)(?:([أاإآ]|ب|ج|د)|([A-Da-d])|([1-4]|[١-٤]))(?:\s|\)|\]|$)/);
      if (letterMatch) {
        const arLetter = letterMatch[1];
        const enLetter = letterMatch[2]?.toUpperCase();
        const numLetter = letterMatch[3];

        let targetIdx = -1;
        if (arLetter) {
          if (arLetter === "أ" || arLetter === "ا" || arLetter === "إ" || arLetter === "آ") targetIdx = 0;
          else if (arLetter === "ب") targetIdx = 1;
          else if (arLetter === "ج") targetIdx = 2;
          else if (arLetter === "د") targetIdx = 3;
        } else if (enLetter) {
          if (enLetter === "A") targetIdx = 0;
          else if (enLetter === "B") targetIdx = 1;
          else if (enLetter === "C") targetIdx = 2;
          else if (enLetter === "D") targetIdx = 3;
        } else if (numLetter) {
          const n = parseInt(normalizeNumerals(numLetter), 10);
          if (n >= 1 && n <= 4) targetIdx = n - 1;
        }

        if (targetIdx >= 0 && parsedOptions[targetIdx]) {
          parsedOptions[targetIdx].isCorrect = true;
        }
      }

      // If still not matched, check if option text is contained in answerLine
      if (!parsedOptions.some((o) => o.isCorrect)) {
        const matchedOpt = parsedOptions.find(
          (o) => o.text && (o.text.trim() === cleanAnswer || cleanAnswer.includes(o.text.trim()))
        );
        if (matchedOpt) {
          matchedOpt.isCorrect = true;
        }
      }
    }

    // If options length is 0 and not explicitly typed as MCQ, treat as Essay
    if (parsedOptions.length === 0) {
      detectedType = "ESSAY";
      if (answerLine && !modelAnswerText) {
        modelAnswerText = answerLine;
      }
    }
  }

  // If Essay, modelAnswer from answerLine if empty
  if (detectedType === "ESSAY" && !modelAnswerText && answerLine) {
    modelAnswerText = answerLine;
  }

  // Validation
  const validationNotes: string[] = [];
  let isValid = true;

  if (!statement || statement.length < 3) {
    isValid = false;
    validationNotes.push("نص السؤال قصير جداً أو غير واضح");
  }

  if (detectedType === "MCQ") {
    if (parsedOptions.length < 2) {
      isValid = false;
      validationNotes.push("السؤال الاختياري يتطلب خيارين على الأقل");
    } else if (!parsedOptions.some((o) => o.isCorrect)) {
      isValid = false;
      validationNotes.push("لم يتم تحديد الإجابة الصحيحة (يمكنك تحديدها في المعاينة)");
    }
  } else if (detectedType === "TRUE_FALSE") {
    if (!parsedOptions.some((o) => o.isCorrect)) {
      isValid = false;
      validationNotes.push("يرجى تحديد ما إذا كانت العبارة صواب أو خطأ");
    }
  }

  const id = "pq_" + Math.random().toString(36).substring(2, 9);

  return {
    id,
    statement,
    type: detectedType,
    difficulty: "MEDIUM",
    options: parsedOptions,
    modelAnswer: modelAnswerText || undefined,
    concept: conceptText || undefined,
    correctReason: explanationText || undefined,
    isValid,
    validationNotes,
    rawText: rawBlockText,
  };
}

/**
 * Parse .docx buffer using mammoth
 */
export async function parseDocxBuffer(buffer: Buffer): Promise<{
  text: string;
  questions: ParsedQuestion[];
}> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value || "";
  const questions = parseQuestionsFromText(rawText);
  return {
    text: rawText,
    questions,
  };
}
