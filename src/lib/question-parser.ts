/**
 * Question Document Parser for Kholasa Platform
 * Parses Word (.docx) and structured text into questions (MCQ, TRUE_FALSE, ESSAY)
 * Supports Egyptian curriculum formatting, Arabic/English lettering, and various teacher styles.
 */

export type QuestionType = "MCQ" | "TRUE_FALSE" | "ESSAY";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionReviewStatus = "PENDING" | "APPROVED" | "NEEDS_CHANGES" | "EXCLUDED";

export interface ParseOptions {
  forcedType?: QuestionType;
  allowedTypes?: QuestionType[];
  forcedDifficulty?: QuestionDifficulty | "MIXED";
  strategy?: "AUTO" | "MANUAL_REVIEW" | "FORCED";
  schoolCategory?: "ARABIC" | "LANGUAGES";
}

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
  imageUrl?: string;
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
  sourceReference?: string;
  classificationConfidence: number; // 0.0 to 1.0
  classificationReason: string;
  difficultyReason: string;
  reviewStatus: QuestionReviewStatus;
  isDuplicate?: boolean;
  duplicateOf?: string;
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
 * Get numerical rank for an option's letter prefix to sort them logically:
 * أ/A/1 -> 1, ب/B/2 -> 2, ج/C/3 -> 3, د/D/4 -> 4, هـ/E/5 -> 5
 */
export function getOptionLetterRank(rawOption: string): number {
  const match = rawOption.trim().match(/^[\*\(]?\s*(?:(هـ)|([أاإآبجدوهA-Ea-e1-5١-٥]))\s*[\.\-\)\:\]\*]/);
  if (!match) return 999;
  const char = match[1] || match[2];
  if (char === "أ" || char === "ا" || char === "إ" || char === "آ" || char === "A" || char === "a" || char === "1" || char === "١") return 1;
  if (char === "ب" || char === "B" || char === "b" || char === "2" || char === "٢") return 2;
  if (char === "ج" || char === "C" || char === "c" || char === "3" || char === "٣") return 3;
  if (char === "د" || char === "D" || char === "d" || char === "4" || char === "٤") return 4;
  if (char === "ه" || char === "هـ" || char === "E" || char === "e" || char === "5" || char === "٥") return 5;
  return 999;
}

/**
 * Filter noise lines common in Egyptian ministry books and exam workbooks:
 * Dotted answer lines, page markers, student evaluation headers
 */
export function isNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;

  // Dotted / dashed student handwriting lines (e.g. "..............." or "_ _ _ _ _")
  if (/^[\.\_\-\s]{4,}$/.test(trimmed)) return true;

  // PDF page number markers: e.g. "-- 3 of 87 --" or "-- Page 5 --"
  if (/^--\s*\d+\s+(?:of|من|page)\s+\d+\s*--$/i.test(trimmed)) return true;

  // Ministry form headers / dates / grade labels
  if (/التاريخ.*(?:الأسبوع|األسبوع)/i.test(trimmed) || /الفصل الدرا.*(?:الأول|األول)/i.test(trimmed)) return true;

  // Ministry section transition banners (e.g. أولاً: المهام الأدائية، ثانياً: أداءات منزلية)
  if (/^(?:أولاً|ثانياً|ثالثاً|رابعاً|خامساً|أوالً|ثانيًا|ثالثًا)\s*[:\-]?\s*(?:أداءات منزلية|المهام الأدائية|امهام األدائية|تقييم)/i.test(trimmed)) return true;

  return false;
}

/**
 * Check if a line starts a new question
 */
export function isQuestionStart(line: string): boolean {
  let trimmed = line.trim();
  if (!trimmed) return false;

  // Strip all leading bracket tags like [مقالي], [سهل], [مقالي] [سهل] etc.
  trimmed = trimmed.replace(/^(?:\[[^\]]+\]\s*)+/, "").trim();
  if (!trimmed) return false;

  // Pattern 1: Question indicator like "س1:", "س:", "سؤال 1:", "السؤال الأول:"
  const arabicQPrefix = /^(?:س|سؤال|السؤال)\s*(?:[0-9]+|[٠-٩]+|[الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر]+)?\s*[:\-\.\)\/]/i;
  if (arabicQPrefix.test(trimmed)) return true;

  // Pattern 2: English Question indicator "Q1:", "Question 1:", "Q:"
  const englishQPrefix = /^(?:Question|Q)\s*[0-9]*\s*[:\-\.\)\/]/i;
  if (englishQPrefix.test(trimmed)) return true;

  // Pattern 3: Numbered line like "1.", "1-", "1)", "(1)", "١.", "١-", "١)" (with or without space)
  const numberedStart = /^(?:\([0-9]+\)|[0-9]+[\.\-\)\:\/]|(?:\([٠-٩]+\)|[٠-٩]+[\.\-\)\:\/]))\s*/;
  if (numberedStart.test(trimmed)) {
    const withoutNum = trimmed.replace(numberedStart, "").trim();
    if (withoutNum.length >= 3 && !isOptionLine(withoutNum)) {
      return true;
    }
  }

  // Pattern 4: Explicit essay prompt keywords at line start
  const essayKeywords = /^(?:علل|فسر|وضح|اشرح|قارن بين|ما النتائج المترتبة على|ما المقصود بـ|عرف|أثبت أن|بين سبب|لماذا|اذكر|ما أثر|ما الفرق بين|كيف|ما التحديات)(?:[:\s\-\.]|$)/;
  if (essayKeywords.test(trimmed)) return true;

  return false;
}

/**
 * Check if line is a choice/option indicator (MCQ or TRUE/FALSE)
 */
export function isOptionLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Arabic letters: أ, ب, ج, د (with dot, dash, paren, colon, bracket) - allow optional space before punctuation
  const arabicChoice = /^[\*\(]?\s*(?:[أاإآ]|ب|ج|د)\s*[\.\-\)\:\]\*]/;
  if (arabicChoice.test(trimmed)) return true;

  // English letters: A, B, C, D
  const englishChoice = /^[\*\(]?\s*[A-Da-d]\s*[\.\-\)\:\]\*]/;
  if (englishChoice.test(trimmed)) return true;

  // Bracketed numbers only: (1), [1], (١), [١]
  const bracketedNumChoice = /^[\*]?\s*[\(\[]\s*(?:[1-4]|[١-٤])\s*[\)\]]/;
  if (bracketedNumChoice.test(trimmed) && trimmed.length < 120) return true;

  return false;
}

/**
 * Parse inline choices on a single line (e.g. "أ) القاهرة   ب) الإسكندرية" or "ب- قانون مور \t أ -الحوسبة")
 */
export function extractInlineChoices(line: string): string[] {
  // Matches choices separated by tabs or multiple spaces.
  // Punctuation is mandatory to avoid matching standard Arabic words starting with alif (like 'الحواسيب').
  const regex = /(?:^|[\t\s]{2,}|\t)([\*\(]?\s*(?:[أاإآ]|ب|ج|د|[A-Da-d]|[\(\[][1-4١-٤][\)\]])\s*[\.\-\)\:\]\*]\s*[\s\S]+?)(?=(?:[\t\s]{2,}|\t)(?:[\*\(]?\s*(?:[أاإآ]|ب|ج|د|[A-Da-d]|[\(\[][1-4١-٤][\)\]])\s*[\.\-\)\:\]\*])|$)/g;
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

  // Strip brackets first so that [سهل] 1. -> 1. -> stripped number
  cleaned = cleaned
    .replace(/^(?:\[[^\]]+\]\s*)+/, "")
    .replace(/\[\s*(?:صعوبة|مستوى|difficulty)?\s*[:\-\=]?\s*(?:سهل|متوسط|صعب|easy|medium|hard)\s*\]/gi, "")
    .replace(/\(\s*(?:صعوبة|مستوى|difficulty)?\s*[:\-\=]?\s*(?:سهل|متوسط|صعب|easy|medium|hard)\s*\)/gi, "")
    .replace(/\[\s*(?:نوع|type)?\s*[:\-\=]?\s*(?:اختياري|اختيار من متعدد|صح وخطأ|صح أو خطأ|صح أم خطأ|صواب وخطأ|صواب أو خطأ|صواب أم خطأ|مقالي|سؤال مقالي|mcq|true[_\s\/\-]false|essay)\s*\]/gi, "")
    .replace(/\(\s*(?:نوع|type)?\s*[:\-\=]?\s*(?:اختياري|اختيار من متعدد|صح وخطأ|صح أو خطأ|صح أم خطأ|صواب وخطأ|صواب أو خطأ|صواب أم خطأ|مقالي|سؤال مقالي|mcq|true[_\s\/\-]false|essay)\s*\)/gi, "")
    .trim();

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
 * Automatically format model answers so that numbered items (1. 2. 3. or 1- 2- or • -)
 * are placed on separate lines under each other instead of running together on one line.
 */
export function formatModelAnswer(text: string): string {
  if (!text) return "";
  let formatted = text.trim();

  // If there are run-on numbered items like " 2. " or " 3) " or " 2- " or " (2) "
  // Replace space before digit+punct with newline so items appear under each other
  formatted = formatted.replace(
    /(?:^|\s+)((?:[0-9]+|[٠-٩]+)[\.\-\)\:]|\([0-9]+|[٠-٩]+\)|[أ-دA-Da-d][\.\-\)])\s+/g,
    (match, prefix, offset) => {
      return offset === 0 ? `${prefix} ` : `\n${prefix} `;
    }
  );

  // Also split bullet points: " • " or " - " or " * "
  formatted = formatted.replace(/\s+([•\-–—\*])\s+/g, "\n$1 ");

  // Normalize multiple consecutive newlines to at most 2
  formatted = formatted.replace(/\n{3,}/g, "\n\n").trim();
  return formatted;
}

/**
 * Main parser function: converts text into structured ParsedQuestion array
 */
export function parseQuestionsFromText(
  rawContent: string,
  options?: ParseOptions
): ParsedQuestion[] {
  const text = cleanText(rawContent);
  if (!text) return [];

  const rawLines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const questions: ParsedQuestion[] = [];

  let currentBlock: string[] = [];
  let inAnswerBlock = false;
  let activeSectionContext: QuestionType | undefined = options?.forcedType;

  function flushBlock() {
    if (currentBlock.length === 0) return;
    const blockOptions: ParseOptions | undefined = activeSectionContext && !options?.forcedType
      ? { ...options, forcedType: activeSectionContext }
      : options;
    const q = processQuestionBlock(currentBlock, blockOptions);
    if (q) {
      questions.push(q);
    }
    currentBlock = [];
    inAnswerBlock = false;
  }

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Explicit divider line (e.g. ---, ===, ___, _________________) - MUST be checked before noise line filter
    if (/^[\-\=_]{3,}$/.test(line) || /^[\-_—–=\s]{4,}$/.test(line)) {
      flushBlock();
      continue;
    }

    // Filter noise lines (student dotted lines, page numbers, Ministry headers)
    if (isNoiseLine(line)) {
      continue;
    }

    // Ministry assessment standalone section header switchers (must not be questions)
    if (!line.startsWith("[") && !isQuestionStart(line) && line.length <= 65) {
      if (/موضوعي|اختيار من متعدد/i.test(line)) {
        flushBlock();
        activeSectionContext = "MCQ";
        continue;
      }
      if (/مقالي|الأسئلة المقالية|األسئلة املقالية/i.test(line)) {
        flushBlock();
        activeSectionContext = "ESSAY";
        continue;
      }
      if (/صح وخطأ|صح أو خطأ|صح أم خطأ|صواب وخطأ|صواب أم خطأ|true\s*[\/\-]\s*false/i.test(line)) {
        flushBlock();
        activeSectionContext = "TRUE_FALSE";
        continue;
      }
    }

    // Check if line indicates a section header that we should skip or use as context
    if (/^(?:أسئلة|اختبار|امتحان|بنك الأسئلة|الفصل|الوحدة|الدرس)\s*[:\-]/i.test(line) && line.length < 50) {
      if (currentBlock.length === 0) continue;
    }

    // Track if this line introduces an answer/explanation/rubric
    const isAnswerHeader = /^(?:نموذج الإجابة|الإجابة النموذجية|التفسير|الشرح|الإجابة|الدرجة|Model Answer|Explanation|Rubric)\s*[:\-]/i.test(line);
    if (isAnswerHeader) {
      inAnswerBlock = true;
    }

    // Explicit question indicator that overrides inAnswerBlock (e.g. [مقالي] 2., [مقالي] [سهل] س2:, [صح وخطأ] [سهل], س2:, Question 2:)
    const hasQuestionTags =
      /^\[\s*(?:مقالي|سؤال مقالي|اختياري|اختيار من متعدد|صح وخطأ|صح أو خطأ|صح أم خطأ|صواب وخطأ|صواب أو خطأ|صواب أم خطأ|mcq|essay|true[_\s\/\-]false|سهل|متوسط|صعب|easy|medium|hard)(?:\s|\]|$)/i.test(line) ||
      /^\[[^\]]+\]\s*\[[^\]]+\]/.test(line);

    const isExplicitQStart =
      hasQuestionTags ||
      /^(?:\[[^\]]+\]\s*)*(?:س|سؤال|السؤال)\s*(?:[0-9]+|[٠-٩]+|[الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر]+)?\s*[:\-\.\)\/]/i.test(line) ||
      /^(?:\[[^\]]+\]\s*)*(?:Question|Q)\s*[0-9]*\s*[:\-\.\)\/]/i.test(line);

    const isStarting = isExplicitQStart || (!inAnswerBlock && isQuestionStart(line));

    // Check if the current accumulated block contains ONLY bracket tags/metadata lines
    const isBlockOnlyTags = currentBlock.length > 0 && currentBlock.every((l) => {
      const t = l.trim();
      return (
        /^\[[^\]]+\](?:\s*\[[^\]]+\])*$/.test(t) ||
        /^(?:\[\s*(?:مقالي|سؤال مقالي|اختياري|اختيار من متعدد|صح وخطأ|صح أو خطأ|صح أم خطأ|صواب وخطأ|صواب أو خطأ|صواب أم خطأ|mcq|essay|true[_\s\/\-]false|سهل|متوسط|صعب|easy|medium|hard)\s*\]\s*)+$/i.test(t)
      );
    });

    if (isStarting) {
      if (currentBlock.length > 0 && !isBlockOnlyTags) {
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

  // Deduplication check across the batch (detecting identical/near-identical statements)
  const seenStatements = new Map<string, string>();
  for (const q of questions) {
    const normalized = q.statement
      .replace(/[\s\p{P}\p{S}]/gu, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/[ة]/g, "ه")
      .toLowerCase();

    if (normalized.length > 5 && seenStatements.has(normalized)) {
      q.isDuplicate = true;
      q.duplicateOf = seenStatements.get(normalized);
      q.reviewStatus = "NEEDS_CHANGES";
      q.validationNotes.push("⚠️ اشتباه تكرار: نص هذا السؤال مطابق لسؤال آخر داخل نفس الملف");
    } else if (normalized.length > 5) {
      seenStatements.set(normalized, q.id);
    }
  }

  return questions;
}

/**
 * Process a block of lines representing a single question
 */
function processQuestionBlock(
  lines: string[],
  options?: ParseOptions
): ParsedQuestion | null {
  if (lines.length === 0) return null;

  const rawBlockText = lines.join("\n");
  let statement = "";
  const rawOptionLines: string[] = [];
  let answerLine = "";
  let explanationText = "";
  let conceptText = "";
  let modelAnswerText = "";
  let detectedType: QuestionType = options?.forcedType || "MCQ";
  let detectedDifficulty: QuestionDifficulty =
    options?.forcedDifficulty && options.forcedDifficulty !== "MIXED"
      ? (options.forcedDifficulty as QuestionDifficulty)
      : "MEDIUM";

  let explicitDifficultyFound: string | null = null;
  let explicitTypeFound: string | null = null;

  // Extract source reference from line 1 if present (e.g. س1: أو Q3:)
  let sourceReference = "";
  const firstLine = lines[0]?.trim() || "";
  const refMatch = firstLine.match(
    /^(?:(?:س|سؤال|السؤال)\s*(?:[0-9]+|[٠-٩]+|[الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر]+)?|(?:Question|Q)\s*[0-9]*|(?:\([0-9]+\)|[0-9]+[\.\-\)\:\/]|(?:\([٠-٩]+\)|[٠-٩]+[\.\-\)\:\/])))\s*[:\-\.\)\/]?/i
  );
  if (refMatch) {
    sourceReference = refMatch[0].replace(/[:\-\.\)\/\s]+$/, "").trim();
  }

  // Pre-scan all lines in block for Difficulty and Type markers
  for (const line of lines) {
    const diffMatch = line.match(/(?:\[|\(|\b)(?:صعوبة|مستوى|المستوى|difficulty)?\s*[:\-\=]?\s*(سهل|متوسط|صعب|easy|medium|hard)(?:\]|\)|\b)/i);
    if (diffMatch && (!options?.forcedDifficulty || options.forcedDifficulty === "MIXED")) {
      const val = diffMatch[1].toLowerCase();
      explicitDifficultyFound = val;
      if (val === "سهل" || val === "easy") detectedDifficulty = "EASY";
      else if (val === "صعب" || val === "hard") detectedDifficulty = "HARD";
      else if (val === "متوسط" || val === "medium") detectedDifficulty = "MEDIUM";
    }

    const typeMatch = line.match(/(?:\[|\(|\b)(?:نوع|نوع السؤال|type)?\s*[:\-\=]?\s*(اختياري|اختيار من متعدد|صح وخطأ|صح أو خطأ|صواب وخطأ|مقالي|سؤال مقالي|mcq|true[_\s\/\-]false|essay)(?:\]|\)|\b)/i);
    if (typeMatch && !options?.forcedType) {
      const tval = typeMatch[1].toLowerCase();
      explicitTypeFound = tval;
      if (tval.includes("اختيار") || tval === "اختياري" || tval === "mcq") detectedType = "MCQ";
      else if (tval.includes("صح") || tval.includes("صواب") || tval.includes("true")) detectedType = "TRUE_FALSE";
      else if (tval.includes("مقال") || tval === "essay") detectedType = "ESSAY";
    }
  }

  // First line is almost always the statement start
  statement = lines[0];
  const statementLines = [lines[0]];
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
      if (!options?.forcedType) detectedType = "ESSAY";
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

    // If question is forced as ESSAY, lines are not treated as MCQ options
    if (options?.forcedType === "ESSAY") {
      if (readingStatement) {
        statementLines.push(line);
      } else {
        modelAnswerText = (modelAnswerText ? modelAnswerText + "\n" : "") + line;
      }
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
        modelAnswerText = (modelAnswerText ? modelAnswerText + "\n" : "") + line;
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
  if (/[\(（]\s*(?:صح|صواب|نعم|√|✓|true)\s*[\)）]/i.test(statement)) {
    embeddedTrueFalseAnswer = true;
    if (!options?.forcedType) detectedType = "TRUE_FALSE";
    statement = statement.replace(/[\(（]\s*(?:صح|صواب|نعم|√|✓|true)\s*[\)）]/gi, "").trim();
  } else if (/[\(（]\s*(?:خطأ|غلط|لا|×|X|false)\s*[\)）]/i.test(statement)) {
    embeddedTrueFalseAnswer = false;
    if (!options?.forcedType) detectedType = "TRUE_FALSE";
    statement = statement.replace(/[\(（]\s*(?:خطأ|غلط|لا|×|X|false)\s*[\)）]/gi, "").trim();
  } else if (/\((?:صح\s*[\/\-]\s*خطأ|صواب\s*[\/\-]\s*خطأ|true\s*[\/\-]\s*false)\)/i.test(statement)) {
    if (!options?.forcedType) detectedType = "TRUE_FALSE";
    statement = statement.replace(/\((?:صح\s*[\/\-]\s*خطأ|صواب\s*[\/\-]\s*خطأ|true\s*[\/\-]\s*false)\)/gi, "").trim();
  }

  // Detect type if essay prompt keywords are present (only if not forced)
  if (!options?.forcedType) {
    const essayKeywords = /^(?:علل|فسر|وضح|اشرح|قارن بين|ما النتائج المترتبة على|ما المقصود بـ|عرف|أثبت أن|بين سبب|لماذا|explain|describe|discuss|compare)\b/i;
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
  }

  // Force override type if requested
  if (options?.forcedType) {
    detectedType = options.forcedType;
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

    const isLang = options?.schoolCategory === "LANGUAGES";
    parsedOptions = [
      { text: isLang ? "True" : "صواب", isCorrect: trueIsCorrect },
      { text: isLang ? "False" : "خطأ", isCorrect: falseIsCorrect },
    ];
  } else if (detectedType === "MCQ") {
    // Sort options by letter rank (أ/ب/ج/د or A/B/C/D or 1/2/3/4) so multi-column PDF layouts are ordered correctly
    if (rawOptionLines.length > 1) {
      rawOptionLines.sort((a, b) => getOptionLetterRank(a) - getOptionLetterRank(b));
    }
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

    // If options length is 0 and not explicitly forced as MCQ, fallback to Essay
    if (parsedOptions.length === 0 && !options?.forcedType) {
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

  // Determine Difficulty Reason (Cognitive / Bloom analysis without relying on length)
  let difficultyReason = "";
  if (options?.forcedDifficulty && options.forcedDifficulty !== "MIXED") {
    difficultyReason = "تم تحديد مستوى الصعوبة يدوياً من إعدادات الاستيراد";
  } else if (explicitDifficultyFound) {
    difficultyReason = `وسم صريح موجود في السؤال [${explicitDifficultyFound}]`;
  } else {
    if (/(?:^|\s)(?:عرف|اذكر|ما المقصود بـ|ما هي عاصمة|ما هو تعريف|سمّ|متى حدث|أين يقع|حدد مفهوم|كم عدد|اختر المصطلح)(?:\s|$|[:\-\.\?])/i.test(statement)) {
      detectedDifficulty = "EASY";
      difficultyReason = "تحليل بنيوي: سؤال مباشر في مستوى التذكر والمفاهيم الأولية";
    } else if (/(?:^|\s)(?:برهن|استنتج|أثبت أن|أثبت|حلل|ما العلاقة بين|قارن موضحاً|مهارات تفكير عليا|تفكير ناقد|بين كيف يؤثر|ماذا تتوقع أن يحدث لو)(?:\s|$|[:\-\.\?])/i.test(statement)) {
      detectedDifficulty = "HARD";
      difficultyReason = "تحليل بنيوي: يتطلب مهارات تفكير عليا وتحليل واستنتاج";
    } else {
      detectedDifficulty = "MEDIUM";
      difficultyReason = "تحليل بنيوي: سؤال قياسي في مستوى الفهم والتطبيق";
    }
  }

  // Determine Type Reason
  let classificationReason = "";
  if (explicitTypeFound) {
    classificationReason = `وسم صريح لنوع السؤال [${explicitTypeFound}]`;
  } else if (detectedType === "MCQ") {
    classificationReason = `تحليل بنيوي: تم التعرف على ${parsedOptions.length} خيارات متعددة`;
  } else if (detectedType === "TRUE_FALSE") {
    classificationReason = "تحليل بنيوي: عبارة صواب وخطأ";
  } else {
    classificationReason = "تحليل بنيوي: سؤال مقالي يتطلب إجابة إنشائية ونموذج إجابة";
  }

  // Validation & Confidence & Review Status
  const validationNotes: string[] = [];
  let isValid = true;
  let classificationConfidence = 0.95;
  let reviewStatus: QuestionReviewStatus = "APPROVED";

  if (!statement || statement.length < 3) {
    isValid = false;
    classificationConfidence = 0.20;
    reviewStatus = "NEEDS_CHANGES";
    validationNotes.push("نص السؤال مفقود أو قصير جداً");
  }

  if (detectedType === "MCQ") {
    if (parsedOptions.length < 2) {
      isValid = false;
      classificationConfidence = 0.40;
      reviewStatus = "NEEDS_CHANGES";
      validationNotes.push("السؤال الاختياري يتطلب خيارين على الأقل");
    } else if (!parsedOptions.some((o) => o.isCorrect)) {
      isValid = false;
      classificationConfidence = 0.60;
      reviewStatus = "NEEDS_CHANGES";
      validationNotes.push("لم يتم تحديد الإجابة الصحيحة بشكل مؤكد (يرجى التحديد في المراجعة)");
    }
  } else if (detectedType === "TRUE_FALSE") {
    if (!parsedOptions.some((o) => o.isCorrect)) {
      isValid = false;
      classificationConfidence = 0.60;
      reviewStatus = "NEEDS_CHANGES";
      validationNotes.push("يرجى تحديد ما إذا كانت العبارة صواب أم خطأ");
    }
  } else if (detectedType === "ESSAY") {
    if (!modelAnswerText) {
      classificationConfidence = 0.75;
      validationNotes.push("يُستحسن كتابة نموذج إجابة استرشادي لسؤال المقال");
    }
  }

  // Filter against allowedTypes if specified in options
  if (options?.allowedTypes && options.allowedTypes.length > 0 && !options.allowedTypes.includes(detectedType)) {
    reviewStatus = "EXCLUDED";
    validationNotes.push(`تم استبعاد السؤال تلقائياً لأن نوعه (${detectedType}) غير مدرج ضمن الأنواع المطلوبة في الاستيراد`);
  } else if (options?.strategy === "MANUAL_REVIEW") {
    reviewStatus = "PENDING";
  } else if (isValid && reviewStatus !== "NEEDS_CHANGES") {
    reviewStatus = "APPROVED";
  }

  const finalDifficulty: QuestionDifficulty =
    options?.forcedDifficulty && options.forcedDifficulty !== "MIXED"
      ? (options.forcedDifficulty as QuestionDifficulty)
      : detectedDifficulty;

  const id = "pq_" + Math.random().toString(36).substring(2, 9);

  return {
    id,
    statement,
    type: detectedType,
    difficulty: finalDifficulty,
    options: parsedOptions,
    modelAnswer: modelAnswerText ? formatModelAnswer(modelAnswerText) : undefined,
    concept: conceptText || undefined,
    correctReason: explanationText || undefined,
    sourceReference: sourceReference || undefined,
    classificationConfidence,
    classificationReason,
    difficultyReason,
    reviewStatus,
    isValid,
    validationNotes,
    rawText: rawBlockText,
    isDuplicate: false,
  };
}

/**
 * Parse .docx buffer using mammoth
 */
export async function parseDocxBuffer(
  buffer: Buffer,
  options?: ParseOptions
): Promise<{
  text: string;
  questions: ParsedQuestion[];
}> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value || "";
  const questions = parseQuestionsFromText(rawText, options);
  return {
    text: rawText,
    questions,
  };
}

/**
 * Parse .pdf buffer using pdf-parse
 */
export async function parsePdfBuffer(
  buffer: Buffer,
  options?: ParseOptions
): Promise<{
  text: string;
  questions: ParsedQuestion[];
}> {
  let rawText = "";
  try {
    const pdfModule = await import("pdf-parse");
    if (typeof (pdfModule as any).PDFParse === "function") {
      const parser = new (pdfModule as any).PDFParse({ data: buffer });
      const res = await parser.getText();
      rawText = res?.text || "";
    } else if (typeof (pdfModule as any).default === "function") {
      const data = await (pdfModule as any).default(buffer);
      rawText = data?.text || "";
    } else if (typeof pdfModule === "function") {
      const data = await (pdfModule as any)(buffer);
      rawText = data?.text || "";
    }
  } catch (err: any) {
    console.error("PDF parse error:", err);
    throw new Error(
      "فشل في استخراج النصوص من ملف PDF: " + (err?.message || "خطأ غير معروف")
    );
  }

  const questions = parseQuestionsFromText(rawText, options);
  return {
    text: rawText,
    questions,
  };
}
