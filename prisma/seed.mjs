import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import nextEnv from "@next/env";

// Load .env/.env.local the same way Next.js does (does not override real env vars).
nextEnv.loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting El Kholasa Database Seeding...");

  // حماية: لا تمسح قاعدة البيانات أبدًا في الإنتاج بدون موافقة صريحة
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PRODUCTION !== "true") {
    throw new Error(
      "Refusing to seed in production. Set SEED_ALLOW_PRODUCTION=true only if you really mean it."
    );
  }

  // التحقق من كلمة مرور الأدمن *قبل* أي حذف أو تعديل للبيانات
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      "SEED_ADMIN_PASSWORD is required and must be at least 8 characters. " +
        "Set it in .env before running the seed."
    );
  }

  // 1. Clear existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.mistakeReview.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.studentAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.essayRubric.deleteMany();
  await prisma.questionExplanation.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.questionLesson.deleteMany();
  await prisma.question.deleteMany();
  await prisma.mindMap.deleteMany();
  await prisma.lessonSummary.deleteMany();
  await prisma.lessonContent.deleteMany();
  await prisma.lessonSection.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.academicTrack.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.educationalSystem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing database records.");

  // 2. Educational Systems
  const thanaweya = await prisma.educationalSystem.create({
    data: {
      name: "الثانوية العامة المصرية",
      code: "thanaweya",
      description: "المسار التعليمي الرسمي للثانوية العامة المصرية بجميع شعبها",
      order: 1,
    },
  });

  const baccalaureate = await prisma.educationalSystem.create({
    data: {
      name: "البكالوريا المصرية (عربي ولغات)",
      code: "baccalaureate",
      description: "منهج البكالوريا الحديث الشامل للتكنولوجيا والبرمجة والذكاء الاصطناعي",
      order: 2,
    },
  });

  // 3. Academic Year
  await prisma.academicYear.create({
    data: {
      name: "العام الدراسي 2026/2027",
      code: "2026-2027",
      isActive: true,
    },
  });

  // 4. Grades
  const g10 = await prisma.grade.create({
    data: {
      name: "الصف الأول الثانوي",
      code: "g10",
      systemId: thanaweya.id,
      order: 1,
    },
  });

  const g11 = await prisma.grade.create({
    data: {
      name: "الصف الثاني الثانوي",
      code: "g11",
      systemId: thanaweya.id,
      order: 2,
    },
  });

  const g12 = await prisma.grade.create({
    data: {
      name: "الصف الثالث الثانوي",
      code: "g12",
      systemId: thanaweya.id,
      order: 3,
    },
  });

  const baccG11 = await prisma.grade.create({
    data: {
      name: "تانية بكالوريا (عربي ولغات)",
      code: "bacc_g11",
      systemId: baccalaureate.id,
      order: 1,
    },
  });

  // 5. Academic Tracks
  const scienceTrack = await prisma.academicTrack.create({
    data: {
      name: "علمي (رياضة وعلوم)",
      code: "scientific",
      gradeId: g11.id,
    },
  });

  const generalTrack = await prisma.academicTrack.create({
    data: {
      name: "المسار التكنولوجي العام",
      code: "tech_general",
      gradeId: baccG11.id,
    },
  });

  // 6. Users (Admin + Student)
  // لا تُستخدم كلمات مرور ثابتة أبدًا: تُقرأ من البيئة ويُرفض التشغيل بدونها.
  // حساب الطالب التجريبي: كلمة مروره من البيئة، وإلا تُولَّد عشوائيًا (غير قابلة للاستخدام).
  const studentPassword =
    process.env.SEED_STUDENT_PASSWORD || randomBytes(24).toString("base64url");

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const studentPasswordHash = await bcrypt.hash(studentPassword, 12);

  const adminUser = await prisma.user.create({
    data: {
      name: "د. محمود المهدي (المشرف العام)",
      email: "admin@kholasa.app",
      phone: "01000000000",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      name: "أحمد محمد علي",
      email: "student@kholasa.app",
      phone: "01111111111",
      password: studentPasswordHash,
      role: "STUDENT",
      systemId: thanaweya.id,
      gradeId: g11.id,
    },
  });

  console.log(`👤 Created users: Admin (${adminUser.email}) and Student (${studentUser.email})`);
  if (!process.env.SEED_STUDENT_PASSWORD) {
    console.log(
      "ℹ️  Demo student password was generated randomly. Set SEED_STUDENT_PASSWORD to choose your own."
    );
  }

  // 7. Core Subject 1: أساسيات C++ والتفكير البرمجي
  const subCpp = await prisma.subject.create({
    data: {
      name: "تأسيس البرمجة ولغة C++",
      code: "cpp_programming",
      icon: "Terminal",
      color: "#6858EA",
      description: "مدخل شامل إلى التفكير الخوارزمي، هيكلية البرامج، المتغيرات، الدوال، وحل المشكلات بلغة C++.",
      systemId: thanaweya.id,
      gradeId: g11.id,
      trackId: scienceTrack.id,
      order: 1,
      isPublished: true,
    },
  });

  // Unit 1 in C++
  const unitCpp1 = await prisma.unit.create({
    data: {
      title: "الوحدة الأولى: أساسيات وهيكل لغة C++",
      order: 1,
      description: "المفاهيم التأسيسية، بيئة التطوير، دالة main، وجمل الإدخال والإخراج.",
      subjectId: subCpp.id,
      isPublished: true,
    },
  });

  // Lesson 1 in Unit 1
  const lessonCpp1 = await prisma.lesson.create({
    data: {
      title: "1. هيكل برنامج C++ ودالة main وجمل الإخراج",
      order: 1,
      unitId: unitCpp1.id,
      durationMinutes: 15,
      isPublished: true,
    },
  });

  // LessonContent for Lesson 1
  await prisma.lessonContent.create({
    data: {
      lessonId: lessonCpp1.id,
      objectives: [
        "فهم البنية الأساسية لأي برنامج مكتوب بلغة C++.",
        "التعرف على دور المكتبة القياسية iostream واستخدام namespace std.",
        "إتقان استخدام كائن cout مع معامل الإخراج << والرمز endl.",
      ],
      body: `## مقدمة في لغة C++
لغة **C++** هي إحدى أقوى لغات البرمجة وأكثرها انتشاراً في العالم؛ نظراً لسرعتها الفائقة وتحكمها الدقيق في موارد الحاسوب والذاكرة.

### 1. البنية الهيكلية لأي كود C++
كل برنامج في لغة C++ يبدأ بتضمين المكتبات اللازمة، ثم تعريف نقطة الانطلاق الرئيسية وهي دالة \`main()\`.

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "مرحباً بك في منصة الخلاصة!" << endl;
    return 0;
}
\`\`\`

### 2. تفكيك مكونات الكود:
* **\`#include <iostream>\`**: أمر للمترجم (Preprocessor directive) لتضمين مكتبة الإدخال والإخراج القياسية.
* **\`using namespace std;\`**: يتيح استخدام المعرفات القياسية مثل \`cout\` و \`cin\` بدون الحاجة لكتابة \`std::\` قبل كل منها.
* **\`int main()\`**: الدالة الرئيسية التي يبدأ نظام التشغيل بتنفيذ البرنامج من عندها إجبارياً.
* **\`cout << ...;\`**: كائن يمثل شاشة الإخراج (Console output).
* **\`endl\`**: للانتقال إلى سطر جديد وإفراغ الذاكرة المؤقتة (buffer).
* **\`return 0;\`**: إشارة لنظام التشغيل بأن البرنامج انتهى بنجاح وبدون أخطاء.

> **تكة امتحانية:** نسيان الفاصلة المنقوطة \`;\` في نهاية السطر يسبب خطأ ترجمة (Syntax Error) شهير يمنع تحويل الكود إلى ملف تنفيذي.`,
    },
  });

  // LessonSection anchors
  const section1 = await prisma.lessonSection.create({
    data: {
      lessonId: lessonCpp1.id,
      title: "هيكل الكود ودالة main",
      anchorId: "code-structure",
      order: 1,
    },
  });

  const section2 = await prisma.lessonSection.create({
    data: {
      lessonId: lessonCpp1.id,
      title: "كائن الإخراج cout وعلامة endl",
      anchorId: "cout-and-endl",
      order: 2,
    },
  });

  // LessonSummary: الزتونة الذهبية
  await prisma.lessonSummary.create({
    data: {
      lessonId: lessonCpp1.id,
      keyConcepts: [
        "دالة main هي نقطة البداية الإجبارية لأي كود C++.",
        "كل جملة برمجية تنفيذية في C++ يجب أن تنتهي بفاصلة منقوطة (;).",
        "مكتبة iostream مسؤولة عن عمليات cout و cin.",
      ],
      definitions: [
        { term: "iostream", meaning: "مكتبة الإدخال والإخراج القياسية Standard Input / Output Stream." },
        { term: "cout", meaning: "كائن إخراج البيانات القياسي إلى شاشة الكونسول." },
        { term: "Syntax Error", meaning: "خطأ نحوي في قواعد كتابة اللغة يكتشفه المترجم قبل تشغيل البرنامج." },
      ],
      formulas: [
        { title: "جملة الطباعة الأساسية", code: "cout << \"النص\" << endl;" },
        { title: "طباعة قيم متعددة", code: "cout << \"العمر: \" << age << endl;" },
      ],
      comparisons: [
        {
          aspect: "endl مقابل \\n",
          first: "endl ينزل سطراً ويفصل الـ buffer (أبطأ قليلاً في الحلقات الضخمة)",
          second: "\\n ينزل سطراً فقط كرمز خاص (أسرع في الأداء)",
        },
      ],
      examTips: [
        "اسم دالة main يكتب بأحرف صغيرة دائماً (case-sensitive).",
        "تأكد دائماً أن الأقواس المعقوفة {} مغلقة بالتساوي.",
      ],
      commonMistakes: [
        "كتابة علامة الإدخال >> مع cout بدلاً من علامة الإخراج <<.",
        "نسيان علامات التنصيص \" \" حول النصوص العادية.",
      ],
      checklist: [
        "حفظت مكونات القالب الأساسي لملف C++",
        "فهمت الفرق بين علامات التنصيص للرمز وللنص",
        "عرفت متى يظهر خطأ Syntax Error",
      ],
    },
  });

  // MindMap for Lesson 1
  await prisma.mindMap.create({
    data: {
      lessonId: lessonCpp1.id,
      title: "خريطة هيكل برنامج C++",
      nodes: [
        { id: "1", label: "برنامج C++", type: "input", position: { x: 250, y: 0 } },
        { id: "2", label: "تضمين المكتبات (#include)", position: { x: 100, y: 100 } },
        { id: "3", label: "دالة البداية (main)", position: { x: 400, y: 100 } },
        { id: "4", label: "جمل الإخراج (cout)", position: { x: 300, y: 200 } },
        { id: "5", label: "إنهاء البرنامج (return 0)", position: { x: 500, y: 200 } },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e1-3", source: "1", target: "3" },
        { id: "e3-4", source: "3", target: "4" },
        { id: "e3-5", source: "3", target: "5" },
      ],
    },
  });

  // Questions for Lesson 1
  const q1 = await prisma.question.create({
    data: {
      statement: "ما هي نقطة الانطلاق الإجبارية التي يبدأ منها تنفيذ أي برنامج مكتوب بلغة C++؟",
      type: "MCQ",
      difficulty: "EASY",
      status: "PUBLISHED",
      subjectId: subCpp.id,
      unitId: unitCpp1.id,
      lessons: {
        create: { lessonId: lessonCpp1.id },
      },
      options: {
        create: [
          { text: "الدالة start()", isCorrect: false, order: 1, explanation: "لا توجد دالة قياسية بهذا الاسم في لغة C++." },
          { text: "الدالة main()", isCorrect: true, order: 2, explanation: "صحيح! دالة main هي نقطة البداية المعيارية لتنفيذ الكود." },
          { text: "المكتبة #include <iostream>", isCorrect: false, order: 3, explanation: "هذا أمر معالج مسبق لتضمين المكتبة وليس دالة تنفيذية." },
          { text: "سطر using namespace std;", isCorrect: false, order: 4, explanation: "هذا توجيه لمجال الأسماء وليس نقطة بدء التنفيذ." },
        ],
      },
      explanation: {
        create: {
          concept: "نقطة انطلاق التنفيذ في C++",
          correctReason: "يحدد معيار لغة C++ أن نظام التشغيل يستدعي دالة main() كأول كود يتم تنفيذه في البرنامج.",
          sectionId: section1.id,
        },
      },
    },
  });

  const q2 = await prisma.question.create({
    data: {
      statement: "ما هو المعامل الصحيح المستخدم لتمرير البيانات إلى كائن الإخراج cout على الشاشة؟",
      type: "MCQ",
      difficulty: "EASY",
      status: "PUBLISHED",
      subjectId: subCpp.id,
      unitId: unitCpp1.id,
      lessons: {
        create: { lessonId: lessonCpp1.id },
      },
      options: {
        create: [
          { text: ">> (معامل الاستخراج)", isCorrect: false, order: 1, explanation: "علامة >> تستخدم مع كائن الإدخال cin وليس cout." },
          { text: "<< (معامل الإدراج)", isCorrect: true, order: 2, explanation: "صحيح! المعامل << (Insertion Operator) يوجّه البيانات إلى شاشة الكونسول." },
          { text: "== (معامل المقارنة)", isCorrect: false, order: 3, explanation: "علامة == تستخدم لمقارنة التساوي بين قيمتين." },
          { text: "-> (معامل المؤشرات)", isCorrect: false, order: 4, explanation: "علامة -> تستخدم للوصول لعناصر المؤشرات للكائنات." },
        ],
      },
      explanation: {
        create: {
          concept: "معاملات الإدخال والإخراج القياسية",
          correctReason: "المعامل << يسمى Insertion operator وهو المسؤول عن تدفق البيانات نحو cout.",
          sectionId: section2.id,
        },
      },
    },
  });

  const q3 = await prisma.question.create({
    data: {
      statement: "إذا نسيت كتابة الفاصلة المنقوطة (;) في نهاية أمر cout، فإن البرنامج سيعطي خطأ من نوع Runtime Error أثناء التشغيل.",
      type: "TRUE_FALSE",
      difficulty: "MEDIUM",
      status: "PUBLISHED",
      subjectId: subCpp.id,
      unitId: unitCpp1.id,
      lessons: {
        create: { lessonId: lessonCpp1.id },
      },
      options: {
        create: [
          { text: "صواب", isCorrect: false, order: 1, explanation: "غير صحيح، الخطأ يحدث قبل التشغيل تماماً." },
          { text: "خطأ", isCorrect: true, order: 2, explanation: "صحيح! الخطأ هو Syntax Error (خطأ ترجمة) وليس خطأ تشغيل." },
        ],
      },
      explanation: {
        create: {
          concept: "أنواع الأخطاء البرمجية (Syntax vs Runtime)",
          correctReason: "غياب الفاصلة المنقوطة خطأ في قواعد اللغة النحوية (Syntax Error)، ويكتشفه المترجم أثناء عملية الـ Compilation.",
          sectionId: section1.id,
        },
      },
    },
  });

  // Lesson 2: المتغيرات وأنواع البيانات في C++
  const lessonCpp2 = await prisma.lesson.create({
    data: {
      title: "2. المتغيرات، أنواع البيانات، والعمليات الحسابية",
      order: 2,
      unitId: unitCpp1.id,
      durationMinutes: 20,
      isPublished: true,
    },
  });

  await prisma.lessonContent.create({
    data: {
      lessonId: lessonCpp2.id,
      objectives: [
        "التمييز بين أنواع البيانات الأساسية: int و float و double و char و bool.",
        "قواعد تسمية المتغيرات السليمة في لغة C++.",
        "العمليات الحسابية وأولويات العمليات (Operator Precedence).",
      ],
      body: `## المتغيرات وأنواع البيانات الأساسية
المتغير هو مساحة محجوزة في ذاكرة الحاسوب (RAM) لها اسم محدد ونوع بياني يحكم حجمها والقيم المسموح بتخزينها فيها.

### 1. أنواع البيانات الأساسية
* **\`int\`**: للأعداد الصحيحة (مثل: 5, -20, 100). يشغل عادة 4 بايت.
* **\`float\`**: للأعداد العشرية بدقة عادية (مثل: 3.14). يشغل 4 بايت.
* **\`double\`**: للأعداد العشرية بدقة مضاعفة (مثل: 3.14159265). يشغل 8 بايت.
* **\`char\`**: لحرف واحد فقط ويوضع بين علامتي تنصيص مفردة \`'A'\`.
* **\`bool\`**: للقيم المنطقية (\`true\` أو \`false\`).

### 2. أولويات العمليات الحسابية (Precedence)
1. الأقواس \`()\`
2. الضرب \`*\` والقسمة \`/\` وباقي القسمة \`%\` (من اليسار إلى اليمين)
3. الجمع \`+\` والطرح \`-\` (من اليسار إلى اليمين)`,
    },
  });

  await prisma.lessonSummary.create({
    data: {
      lessonId: lessonCpp2.id,
      keyConcepts: [
        "حجم int هو 4 بايت بينما double هو 8 بايت.",
        "القسمة بين عددين صحيحين تنتج عدداً صحيحاً وتتجاهل الكسور (مثل 5 / 2 = 2).",
        "الأقواس دائماً تسبق عمليات الضرب والقسمة.",
      ],
      definitions: [
        { term: "Variable", meaning: "موقع مسمى في الذاكرة لتخزين قيمة قابلة للتعديل أثناء تشغيل البرنامج." },
        { term: "Modulus (%)", meaning: "معامل باقي القسمة، ويعمل فقط مع الأعداد الصحيحة الصحيحة." },
      ],
      formulas: [
        { title: "تعريف متغير مع إعطاء قيمة أولية", code: "int score = 95;" },
        { title: "معامل باقي القسمة", code: "int remainder = 10 % 3; // remainder = 1" },
      ],
      comparisons: [
        {
          aspect: "float مقابل double",
          first: "float دقة 7 أرقام عشرية (4 بايت)",
          second: "double دقة 15 رقماً عشرياً (8 بايت)",
        },
      ],
      examTips: [
        "ناتج قسمة 7 / 2 في C++ يساوي 3 وليس 3.5 لأن كلا الطرفين أعداد صحيحة int.",
        "للحصول على ناتج عشري، يجب أن يكون أحد الطرفين على الأقل عشرياً: 7.0 / 2 = 3.5.",
      ],
      commonMistakes: [
        "تسمية متغير يبدأ برقم (مثل 1student وهذا ممنوع).",
        "استخدام معامل باقي القسمة % مع أعداد عشرية (يسبب خطأ ترجمة).",
      ],
      checklist: [
        "حفظت أنواع البيانات وأحجامها بالبايت",
        "فهمت سلوك قسمة الأعداد الصحيحة",
        "تمرنت على حساب أولويات العمليات",
      ],
    },
  });

  const q4 = await prisma.question.create({
    data: {
      statement: "ما هي القيمة الناتجة عن تنفيذ التعبير البرمجي التالي في لغة C++: int x = 13 % 4;",
      type: "MCQ",
      difficulty: "MEDIUM",
      status: "PUBLISHED",
      subjectId: subCpp.id,
      unitId: unitCpp1.id,
      lessons: {
        create: { lessonId: lessonCpp2.id },
      },
      options: {
        create: [
          { text: "3", isCorrect: false, order: 1, explanation: "3 هو ناتج القسمة الصحيحة وليس باقي القسمة." },
          { text: "1", isCorrect: true, order: 2, explanation: "صحيح! 13 = (4 * 3) + 1، وبالتالي الباقي هو 1." },
          { text: "0.25", isCorrect: false, order: 3, explanation: "معامل % يرجع الباقي الصحيح ولا يرجع كسوراً عشرية." },
          { text: "4", isCorrect: false, order: 4, explanation: "4 هو المقسوم عليه." },
        ],
      },
      explanation: {
        create: {
          concept: "معامل باقي القسمة (Modulus)",
          correctReason: "معامل % يرجع باقي القسمة الصحيحة للعدد 13 على 4 وهو 1.",
        },
      },
    },
  });

  const q5 = await prisma.question.create({
    data: {
      statement: "ما هي نتيجة العملية الحسابية التالية: int res = 2 + 3 * 4;",
      type: "MCQ",
      difficulty: "EASY",
      status: "PUBLISHED",
      subjectId: subCpp.id,
      unitId: unitCpp1.id,
      lessons: {
        create: { lessonId: lessonCpp2.id },
      },
      options: {
        create: [
          { text: "20", isCorrect: false, order: 1, explanation: "خطأ: قمت بإجراء الجمع قبل الضرب، بينما الضرب يسبق الجمع." },
          { text: "14", isCorrect: true, order: 2, explanation: "صحيح! عملية الضرب 3 * 4 = 12 أولاً، ثم نجمع 2 ليصبح الناتج 14." },
          { text: "24", isCorrect: false, order: 3, explanation: "حساب غير صحيح للأولويات." },
          { text: "10", isCorrect: false, order: 4, explanation: "حساب غير صحيح." },
        ],
      },
      explanation: {
        create: {
          concept: "أولويات العمليات الحسابية (Operator Precedence)",
          correctReason: "عملية الضرب (*) لها أولوية تنفيذ أعلى من عملية الجمع (+).",
        },
      },
    },
  });

  // Unit 2 in C++
  const unitCpp2 = await prisma.unit.create({
    data: {
      title: "الوحدة الثانية: جمل التحكم والقرارات المنطقية",
      order: 2,
      description: "جمل if-else والشروط المركبة وجملة الاختيار switch-case.",
      subjectId: subCpp.id,
      isPublished: true,
    },
  });

  const lessonCpp3 = await prisma.lesson.create({
    data: {
      title: "3. جملة if الشرطية والمعاملات المنطقية",
      order: 1,
      unitId: unitCpp2.id,
      durationMinutes: 18,
      isPublished: true,
    },
  });

  await prisma.lessonContent.create({
    data: {
      lessonId: lessonCpp3.id,
      objectives: [
        "فهم جملة if و if-else لاتخاذ القرارات.",
        "التعرف على المعاملات المنطقية: && (AND) و || (OR) و ! (NOT).",
      ],
      body: `## اتخاذ القرارات في C++
تتيح جملة \`if\` للبرنامج اختبار شرط معين، وتنفيذ مجموعة من الأوامر فقط إذا كان هذا الشرط صحيحاً (\`true\`).

\`\`\`cpp
if (score >= 50) {
    cout << "ناجح" << endl;
} else {
    cout << "راسب" << endl;
}
\`\`\`

### المعاملات المنطقية:
* **\`&&\` (AND)**: يكون الشرط صحيحاً فقط إذا كانت جميع الأطراف صحيحة.
* **\`||\` (OR)**: يكون الشرط صحيحاً إذا كان طرف واحد على الأقل صحيحاً.
* **\`!\` (NOT)**: يعكس القيمة المنطقية (يحول true إلى false والعكس).`,
    },
  });

  await prisma.lessonSummary.create({
    data: {
      lessonId: lessonCpp3.id,
      keyConcepts: [
        "الشرط في if يوضع بين قوسين دائريين ().",
        "المعامل == يستخدم للمقارنة، بينما = يستخدم للإسناد والتعيين.",
        "الـ else اختيارية وتنفذ فقط إذا كانت جميع الشروط السابقة خاطئة.",
      ],
      definitions: [
        { term: "Boolean Expression", meaning: "تعبير منطقي ينتج عنه إما true (1) أو false (0)." },
        { term: "Short-circuit Evaluation", meaning: "توقف تقييم الشرط بمجرد معرفة النتيجة النهائية في && و ||." },
      ],
      formulas: [
        { title: "صيغة if-else", code: "if (condition) { /* كود */ } else { /* كود */ }" },
      ],
      comparisons: [
        {
          aspect: "&& مقابل ||",
          first: "&& تتطلب صحة الطرفين معاً",
          second: "|| تكتفي بصحة طرف واحد فقط",
        },
      ],
      examTips: [
        "أخطر خطأ شائع هو كتابة if (x = 5) بدلاً من if (x == 5)، الأولى تقوم بتعيين القيمة 5 للمتغير وتعتبر الشرط true دائماً!",
      ],
      commonMistakes: [
        "وضع فاصلة منقوطة بعد قوس الشرط مباشرة مثل: if (x > 5); مما يعطل عمل جملة الشرط.",
      ],
      checklist: [
        "أتقنت الفرق بين = و ==",
        "فهمت جدول الصواب والخطأ لمعاملات AND و OR",
      ],
    },
  });

  const q6 = await prisma.question.create({
    data: {
      statement: "ما هو الخطأ الذي يحدث عند كتابة الشرط بالشكل: if (x = 10) بدلاً من if (x == 10)؟",
      type: "MCQ",
      difficulty: "HARD",
      status: "PUBLISHED",
      subjectId: subCpp.id,
      unitId: unitCpp2.id,
      lessons: {
        create: { lessonId: lessonCpp3.id },
      },
      options: {
        create: [
          { text: "سيعطي المترجم خطأ Syntax Error ويتوقف البرنامج", isCorrect: false, order: 1, explanation: "المترجم يقبلها كجملة صالحة قواعدياً ولكنه خطأ منطقي." },
          { text: "سيتم تعيين القيمة 10 إلى x ويعتبر الشرط صحيحاً دائماً (Logic Error)", isCorrect: true, order: 2, explanation: "صحيح! = تعني إسناد، والقيمة 10 غير الصفرية تعتبر true دائماً." },
          { text: "سيتم مقارنة القيمة بشكل طبيعي", isCorrect: false, order: 3, explanation: "علامة = لا تقارن بل تعين." },
          { text: "سيؤدي ذلك إلى حلقة تكرار لانهائية", isCorrect: false, order: 4, explanation: "هذه جملة شرطية وليست حلقة تكرار." },
        ],
      },
      explanation: {
        create: {
          concept: "الفرق بين معامل الإسناد (=) ومعامل المقارنة (==)",
          correctReason: "في C++، أي رقم غير الصفر يعتبر true. جملة x = 10 تضع 10 في x وتُرجع 10، وبالتالي يتحقق الشرط دائماً.",
        },
      },
    },
  });

  // 8. Core Subject 2: الذكاء الاصطناعي والتكنولوجيا الحديثة
  const subAi = await prisma.subject.create({
    data: {
      name: "الذكاء الاصطناعي والتكنولوجيا الحديثة",
      code: "artificial_intelligence",
      icon: "Brain",
      color: "#11B7B4",
      description: "المفاهيم الشاملة لتعلم الآلة، معالجة اللغات الطبيعية، الشبكات العصبية، والأخلاقيات الرقمية.",
      systemId: thanaweya.id,
      gradeId: g11.id,
      order: 2,
      isPublished: true,
    },
  });

  const unitAi1 = await prisma.unit.create({
    data: {
      title: "الوحدة الأولى: أسس وخوارزميات الذكاء الاصطناعي",
      order: 1,
      description: "كيف يتعلم الحاسوب من البيانات وكيف تتخذ نماذج الذكاء الاصطناعي القرارات.",
      subjectId: subAi.id,
      isPublished: true,
    },
  });

  const lessonAi1 = await prisma.lesson.create({
    data: {
      title: "1. مفهوم الذكاء الاصطناعي والتعلم الآلي (Machine Learning)",
      order: 1,
      unitId: unitAi1.id,
      durationMinutes: 15,
      isPublished: true,
    },
  });

  await prisma.lessonContent.create({
    data: {
      lessonId: lessonAi1.id,
      objectives: [
        "تعريف الذكاء الاصطناعي والفرق بينه وبين البرمجة التقليدية.",
        "فهم أنواع التعلم الآلي: الموجّه (Supervised) وغير الموجّه (Unsupervised).",
      ],
      body: `## ما هو الذكاء الاصطناعي؟
الذكاء الاصطناعي (AI) هو فرع من علوم الحاسوب يهتم ببناء أنظمة قادرة على محاكاة القدرات الذهنية البشرية، مثل التفكير، الاستنتاج، التعلم من الخبرة السابقة، وحل المشكلات المعقدة.

### البرمجة التقليدية مقابل التعلم الآلي:
* **البرمجة التقليدية**: نُدخل القواعد (Rules) والبيانات (Data) لنحصل على الإجابة (Answers).
* **التعلم الآلي (Machine Learning)**: نُدخل البيانات والإجابات السابقة، فيقوم النموذج باستنتاج القواعد والأنماط الرياضية بنفسه.`,
    },
  });

  await prisma.lessonSummary.create({
    data: {
      lessonId: lessonAi1.id,
      keyConcepts: [
        "التعلم الآلي جزء من الذكاء الاصطناعي، والتعلم العميق جزء من التعلم الآلي.",
        "التعلم الموجه (Supervised Learning) يتطلب بيانات مصنفة (Labeled Data).",
      ],
      definitions: [
        { term: "Machine Learning", meaning: "قدرة الحاسوب على التعلم من البيانات بدون برمجته بشكل صريح لكل حالة." },
        { term: "Training Data", meaning: "مجموعة البيانات المستخدمة لتدريب النموذج وضبط أوزانه وخوارزمياته." },
      ],
      formulas: [],
      comparisons: [
        {
          aspect: "التعلم الموجه مقابل غير الموجه",
          first: "Supervised: بيانات مصنفة مسبقاً (مع الإجابة النموذجية)",
          second: "Unsupervised: بيانات غير مصنفة يكتشف الأنماط فيها تلقائياً",
        },
      ],
      examTips: [
        "تذكر: التعرف على الوجوه أو تصنيف رسائل البريد (Spam / Not Spam) هو مثال صريح للتعلم الموجه Supervised.",
      ],
      commonMistakes: [
        "الاعتقاد بأن الذكاء الاصطناعي هو روبوتات مادية فقط؛ الذكاء الاصطناعي هو خوارزميات برمجية في الأساس.",
      ],
      checklist: [
        "فهمت هرمية الذكاء الاصطناعي والتعلم الآلي والعميق",
        "ميزت بين التعلم الموجه وغير الموجه",
      ],
    },
  });

  const q7 = await prisma.question.create({
    data: {
      statement: "ما هو الفارق الجوهري بين البرمجة التقليدية والتعلم الآلي (Machine Learning)؟",
      type: "MCQ",
      difficulty: "MEDIUM",
      status: "PUBLISHED",
      subjectId: subAi.id,
      unitId: unitAi1.id,
      lessons: {
        create: { lessonId: lessonAi1.id },
      },
      options: {
        create: [
          { text: "البرمجة التقليدية تستخدم الحواسيب بينما التعلم الآلي لا يستخدمها", isCorrect: false, order: 1, explanation: "كلاهما يعمل على الحواسيب." },
          { text: "في التعلم الآلي، يستنتج النظام القواعد والأنماط من البيانات والإجابات بنفسه", isCorrect: true, order: 2, explanation: "صحيح! هذا هو جوهر التعلم الآلي مقارنة بالبرمجة التقليدية المبنية على كتابة القواعد يدوياً." },
          { text: "البرمجة التقليدية أسرع دائماً في معالجة الصور", isCorrect: false, order: 3, explanation: "نماذج التعلم الآلي متفوقة تماماً في معالجة الصور." },
          { text: "التعلم الآلي يتطلب لغة C فقط", isCorrect: false, order: 4, explanation: "يستخدم بايثون ولغات متعددة." },
        ],
      },
      explanation: {
        create: {
          concept: "فلسفة التعلم الآلي",
          correctReason: "في التعلم الآلي يدخل المدخلات والنتائج ويقوم النموذج بتوليد القواعد والأنماط الرياضية.",
        },
      },
    },
  });

  // Essay Question for AI
  const q8 = await prisma.question.create({
    data: {
      statement: "اشرح باختصار الفرق بين التعلم الموجه (Supervised Learning) والتعلم غير الموجه (Unsupervised Learning) مع ذكر مثال تطبيقي واحد لكل منهما.",
      type: "ESSAY",
      difficulty: "MEDIUM",
      status: "PUBLISHED",
      subjectId: subAi.id,
      unitId: unitAi1.id,
      lessons: {
        create: { lessonId: lessonAi1.id },
      },
      rubric: {
        create: {
          maxScore: 10,
          modelAnswer: `1. التعلم الموجه (Supervised Learning): يتم تزويد النموذج ببيانات تدريب مصنفة ومرفقة بالإجابة الصحيحة (Labeled Data). مثال: فلترة رسائل البريد الإلكتروني إلى سبام أو عادي، أو التعرف على صور القطط والكلاب.
2. التعلم غير الموجه (Unsupervised Learning): يتم تزويد النموذج ببيانات خام غير مصنفة، ومهمته اكتشاف الأنماط والتجمعات (Clusters) المتشابهة تلقائياً. مثال: تجميع وتصنيف عملاء المتجر الإلكتروني حسب سلوكهم الشرائي.`,
          criteria: [
            { title: "تعريف التعلم الموجه ومثاله", marks: 5 },
            { title: "تعريف التعلم غير الموجه ومثاله", marks: 5 },
          ],
        },
      },
    },
  });

  // 9. Core Subject 3: الأمن السيبراني والتشفير
  const subSec = await prisma.subject.create({
    data: {
      name: "الأمن السيبراني والتشفير",
      code: "cybersecurity",
      icon: "ShieldCheck",
      color: "#FFBA55",
      description: "حماية البيانات، الهجمات الإلكترونية الشائعة، التشفير المتماثل وغير المتماثل، وإدارة المخاطر.",
      systemId: thanaweya.id,
      gradeId: g11.id,
      order: 3,
      isPublished: true,
    },
  });

  const unitSec1 = await prisma.unit.create({
    data: {
      title: "الوحدة الأولى: أمن المعلومات وتقنيات التشفير",
      order: 1,
      description: "المصادقة، المفاتيح العامة والخاصة، وهجمات الهندسة الاجتماعية.",
      subjectId: subSec.id,
      isPublished: true,
    },
  });

  const lessonSec1 = await prisma.lesson.create({
    data: {
      title: "1. مبادئ التشفير المتماثل والتشفير غير المتماثل",
      order: 1,
      unitId: unitSec1.id,
      durationMinutes: 16,
      isPublished: true,
    },
  });

  await prisma.lessonContent.create({
    data: {
      lessonId: lessonSec1.id,
      objectives: [
        "فهم مفهوم التشفير ودوره في سرية البيانات.",
        "المقارنة بين التشفير المتماثل (Symmetric) وغير المتماثل (Asymmetric).",
      ],
      body: `## التشفير الرقمي وأمن المعلومات
التشفير هو عملية تحويل البيانات من نص مقروء ومفهوم (Plaintext) إلى نص مشفر وغير مفهوم (Ciphertext) باستخدام خوارزمية ومفتاح سري.

### أنواع التشفير:
1. **التشفير المتماثل (Symmetric Encryption)**:
   * يستخدم **نفس المفتاح السري** لعمليتي التشفير وفك التشفير.
   * سريع جداً ومناسب لتشفير كميات ضخمة من البيانات (مثل خوارزمية AES).
   * التحدي: كيفية تبادل المفتاح بأمان بين الطرفين.

2. **التشفير غير المتماثل (Asymmetric Encryption)**:
   * يستخدم **زوجين من المفاتيح**:
     * **المفتاح العام (Public Key)**: متاح للجميع ويُستخدم في التشفير.
     * **المفتاح الخاص (Private Key)**: سري تماماً ويُستخدم في فك التشفير.
   * خوارزمية شهيرة: RSA.`,
    },
  });

  await prisma.lessonSummary.create({
    data: {
      lessonId: lessonSec1.id,
      keyConcepts: [
        "التشفير المتماثل يستخدم مفتاحاً واحداً مشتركاً.",
        "التشفير غير المتماثل يستخدم مفتاحين (عام وخاص).",
        "المفتاح العام يشفر، والمفتاح الخاص يفرد لفك التشفير.",
      ],
      definitions: [
        { term: "Plaintext", meaning: "النص الأصلي المقروء قبل التشفير." },
        { term: "Ciphertext", meaning: "النص المشفر الناتج غير القابل للفهم بدون المفتاح." },
      ],
      formulas: [],
      comparisons: [
        {
          aspect: "التشفير المتماثل مقابل غير المتماثل",
          first: "المتماثل: مفتاح واحد، سريع جداً (AES)",
          second: "غير المتماثل: مفتاحان، أبطأ نسبياً لكنه يحل مشكلة تبادل المفاتيح (RSA)",
        },
      ],
      examTips: [
        "المفتاح الخاص (Private Key) لا يُشارك أبداً مع أي شخص تحت أي ظرف.",
      ],
      commonMistakes: [
        "الاعتقاد بأن المفتاح العام يمكنه فك التشفير؛ المفتاح العام للتشفير فقط.",
      ],
      checklist: [
        "فهمت دور المفتاح العام والخاص",
        "حفظت مثالاً لكل نوع تشفير (AES و RSA)",
      ],
    },
  });

  const q9 = await prisma.question.create({
    data: {
      statement: "في نظام التشفير غير المتماثل (Asymmetric Encryption)، أي مفتاح يُستخدم لفك تشفير الرسالة؟",
      type: "MCQ",
      difficulty: "EASY",
      status: "PUBLISHED",
      subjectId: subSec.id,
      unitId: unitSec1.id,
      lessons: {
        create: { lessonId: lessonSec1.id },
      },
      options: {
        create: [
          { text: "المفتاح العام للمستقبل (Public Key)", isCorrect: false, order: 1, explanation: "المفتاح العام يستخدم في التشفير وليس فك التشفير." },
          { text: "المفتاح الخاص للمستقبل (Private Key)", isCorrect: true, order: 2, explanation: "صحيح! المفتاح الخاص السري هو الوحيد القادر رياضياً على فك التشفير الذي تم بالمفتاح العام المناظر له." },
          { text: "المفتاح المشترك السري", isCorrect: false, order: 3, explanation: "المفتاح المشترك يستخدم في التشفير المتماثل." },
          { text: "مفتاح التجزئة Hash", isCorrect: false, order: 4, explanation: "دوال الهاش لا يمكن فكها أصلاً لأنها أحادية الاتجاه." },
        ],
      },
      explanation: {
        create: {
          concept: "آلية عمل التشفير غير المتماثل",
          correctReason: "في خوارزميات مثل RSA، يشفر المرسل بالمفتاح العام، ويفك المستقبل بمفتاحه الخاص السري فقط.",
        },
      },
    },
  });

  // 10. Sample Pre-built Exam
  const exam1 = await prisma.exam.create({
    data: {
      title: "امتحان شامل على أساسيات لغة C++ ومفاهيم التفكير المنطقي",
      description: "اختبار استعراضي لقياس فهم الطلاب لمفاهيم دالة main، كائن cout، والمتغيرات وأنواع البيانات.",
      subjectId: subCpp.id,
      durationMinutes: 20,
      isPractice: false,
      questions: {
        create: [
          { questionId: q1.id, order: 1 },
          { questionId: q2.id, order: 2 },
          { questionId: q3.id, order: 3 },
          { questionId: q4.id, order: 4 },
          { questionId: q5.id, order: 5 },
          { questionId: q6.id, order: 6 },
        ],
      },
    },
  });

  console.log(`📝 Created sample exam with ${6} questions.`);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
