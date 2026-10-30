import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Baccalaureate Programming & AI Question Seeder...");

  // 1. Find Educational System & Grade 11
  const baccalaureate = await prisma.educationalSystem.findFirst({
    where: { code: "baccalaureate" },
  });

  if (!baccalaureate) {
    throw new Error("Educational system 'baccalaureate' not found.");
  }

  const g11 = await prisma.grade.findFirst({
    where: { code: "bacc_g11" },
  });

  if (!g11) {
    throw new Error("Grade bacc_g11 (الصف الثاني الثانوي) not found.");
  }

  console.log(`✅ System: ${baccalaureate.name} | Grade: ${g11.name}`);

  // 2. Find or Create Subject: البرمجة والذكاء الاصطناعي (الصف الثاني الثانوي - عربي)
  let subject = await prisma.subject.findFirst({
    where: {
      gradeId: g11.id,
      schoolCategory: "ARABIC",
      OR: [
        { code: "g11_programming_ai_ar" },
        { code: "g11_cs_engineering" },
        { name: { contains: "برمج" } },
      ],
    },
  });

  if (subject) {
    subject = await prisma.subject.update({
      where: { id: subject.id },
      data: {
        name: "البرمجة والذكاء الاصطناعي",
        code: "g11_programming_ai_ar",
        description: "المنهج الرسمي المعتمد للبكالوريا المصرية (الصف الثاني الثانوي): تكنولوجيا المعلومات والمجتمع، الأمن السيبراني، تطبيقات الويب، وتصميم الواجهات والوسائط الرقمية.",
        icon: "Cpu",
        color: "#2563EB",
        schoolCategory: "ARABIC",
        isPublished: true,
      },
    });
    console.log(`✅ Updated existing Subject: ${subject.name} (${subject.id})`);
  } else {
    subject = await prisma.subject.create({
      data: {
        name: "البرمجة والذكاء الاصطناعي",
        code: "g11_programming_ai_ar",
        description: "المنهج الرسمي المعتمد للبكالوريا المصرية (الصف الثاني الثانوي): تكنولوجيا المعلومات والمجتمع، الأمن السيبراني، تطبيقات الويب، وتصميم الواجهات والوسائط الرقمية.",
        icon: "Cpu",
        color: "#2563EB",
        systemId: baccalaureate.id,
        gradeId: g11.id,
        schoolCategory: "ARABIC",
        order: 1,
        isPublished: true,
      },
    });
    console.log(`✅ Created Subject: ${subject.name} (${subject.id})`);
  }

  // 3. Define the 4 Official Units & Lessons from the Egyptian Ministry Curriculum
  const unitsData = [
    {
      title: "الوحدة الأولى: تكنولوجيا المعلومات والمجتمع",
      order: 1,
      description: "تطور تكنولوجيا المعلومات، الحوسبة السحابية والحوسبة الطرفية، قانون مور، والتأثيرات الاجتماعية والاقتصادية للتقنيات الحديثة.",
      lessons: [
        {
          title: "1. تطور تكنولوجيا المعلومات وتأثيرها المجتمعي",
          order: 1,
          durationMinutes: 20,
          objectives: [
            "تتبع المحطات التاريخية لتطور تكنولوجيا المعلومات من الحواسيب المركزية إلى الهواتف الذكية.",
            "تحليل التأثيرات الاجتماعية لشبكات التواصل الاجتماعي والتجارة الإلكترونية والعمل عن بعد.",
          ],
          questions: [
            {
              statement: "ما المقصود بالذكاء الاصطناعي (AI)؟",
              type: "MCQ",
              difficulty: "MEDIUM",
              options: [
                { text: "مجال يهدف إلى تطوير أنظمة حاسوبية تستطيع تنفيذ مهام تتطلب عادةً ذكاءً بشريًا", isCorrect: true },
                { text: "نظام مخصص لتخزين الملفات فقط", isCorrect: false },
                { text: "وسيلة لتوصيل أجهزة الحاسب بالإنترنت فقط", isCorrect: false },
                { text: "برنامج يستخدم لإنشاء الصور فقط", isCorrect: false },
              ],
              explanation: "الذكاء الاصطناعي مجال يضم أنظمة حاسوبية تستطيع تنفيذ مهام مثل التعلم والتنبؤ والتعرف وتوليد المحتوى واتخاذ القرارات أو دعمها.",
              concept: "مفهوم الذكاء الاصطناعي وتطبيقاته",
            },
            {
              statement: "أي من الخيارات التالية يمثل الحدث الرئيسي المرتبط بفترة السبعينيات والثمانينيات من القرن الماضي في تطور تكنولوجيا المعلومات؟",
              type: "MCQ",
              difficulty: "EASY",
              options: [
                { text: "ظهور الهواتف الذكية", isCorrect: false },
                { text: "انتشار الحواسيب الشخصية (PCs)", isCorrect: true },
                { text: "انتشار الحوسبة السحابية", isCorrect: false },
                { text: "إتاحة الإنترنت للاستخدام التجاري وظهور الويب", isCorrect: false },
              ],
              explanation: "فترة السبعينيات والثمانينيات شهدت الثورة الصناعية للحواسيب الشخصية (Personal Computers) مع شركات مثل Apple و IBM مما جعل الحاسوب متاحاً للأفراد والشركات الصغيرة.",
              concept: "تاريخ تطور الحواسيب",
            },
            {
              statement: "العمل عن بعد (Remote Work) يعني نمط عمل يؤدي فيه الموظف مهامه من المنزل أو موقع آخر باستخدام الإنترنت دون الحاجة للتواجد بمقر العمل.",
              type: "TRUE_FALSE",
              difficulty: "EASY",
              options: [
                { text: "صواب", isCorrect: true },
                { text: "خطأ", isCorrect: false },
              ],
              explanation: "العمل عن بعد هو أحد أبرز التحولات الاجتماعية الناتجة عن تكنولوجيا المعلومات ويوفر مرونة للموظف وتوفيراً في نفقات المقار للشركات.",
              concept: "أنماط العمل الرقمي الحديث",
            },
            {
              statement: "اذكر ثلاثة تغيرات اجتماعية ناتجة عن انتشار تكنولوجيا المعلومات في المجتمع الحديث.",
              type: "ESSAY",
              difficulty: "MEDIUM",
              modelAnswer: "1. انتشار العمل عن بعد والتعليم الإلكتروني.\n2. تحول المعاملات المالية إلى التجارة والدفع الإلكتروني غير النقدي.\n3. تغير أنماط التواصل البشري عبر شبكات التواصل الاجتماعي (SNS).",
              concept: "التغيرات الاجتماعية لتكنولوجيا المعلومات",
              points: 10,
            },
          ],
        },
        {
          title: "2. الحوسبة السحابية والطرفية وقانون مور",
          order: 2,
          durationMinutes: 25,
          objectives: [
            "شرح مفهوم قانون مور وأثره على قدرات المعالجة الحاسوبية.",
            "المقارنة بين الحوسبة السحابية والحوسبة الطرفية من حيث سرعة الاستجابة وأمان البيانات.",
          ],
          questions: [
            {
              statement: "ما هي الملاحظة التجريبية التي تصف اتجاهاً تاريخياً لازدياد عدد الترانزستورات في الدوائر المتكاملة بمعدل يقارب الضعف كل عامين تقريباً؟",
              type: "MCQ",
              difficulty: "MEDIUM",
              options: [
                { text: "الحوسبة السحابية", isCorrect: false },
                { text: "قانون مور (Moore's Law)", isCorrect: true },
                { text: "الحوسبة الطرفية", isCorrect: false },
                { text: "التراكب الكمي", isCorrect: false },
              ],
              explanation: "قانون مور صاغه جوردون مور عام 1965 كملاحظة تجريبية تنص على تضاعف عدد الترانزستورات على شريحة المعالج كل سنتين تقريباً مع انخفاض التكلفة.",
              concept: "قانون مور وقدرات المعالجة",
            },
            {
              statement: "ما هي التقنية التي تقضي بمعالجة البيانات على الجهاز نفسه فوراً بدلاً من إرسالها إلى السحابة لتجنب التأخير الزمني (Latency)؟",
              type: "MCQ",
              difficulty: "MEDIUM",
              options: [
                { text: "الحوسبة الطرفية (Edge Computing)", isCorrect: true },
                { text: "الحوسبة السحابية المركزية", isCorrect: false },
                { text: "النسخ الاحتياطي عن بعد", isCorrect: false },
                { text: "الواقع الافتراضي", isCorrect: false },
              ],
              explanation: "الحوسبة الطرفية تعالج البيانات قريباً جداً من مصدر إنتاجها (مثل السيارات ذاتية القيادة) لتحقيق سرعة استجابة فائقة واتخاذ قرارات فورية.",
              concept: "الحوسبة الطرفية والسحابية",
            },
            {
              statement: "يُعتبر قانون مور قانوناً فيزيائياً حتمياً لا يمكن للتقدم التكنولوجي تجاوزه.",
              type: "TRUE_FALSE",
              difficulty: "HARD",
              options: [
                { text: "صواب", isCorrect: false },
                { text: "خطأ", isCorrect: true },
              ],
              explanation: "قانون مور ليس قانوناً فيزيائياً كقوانين نيوتن، بل هو رصد تجريبي وتوقع صناعي يقترب حالياً من حدوده الفيزيائية على المستوى الذري.",
              concept: "طبيعة قانون مور وحدوده الفيزيائية",
            },
            {
              statement: "وضح كيف تساهم «الحوسبة الطرفية» في تعزيز الأمان وسرعة اتخاذ القرار في تقنية القيادة الذاتية دون الحاجة لإرسال البيانات إلى السحابة؟",
              type: "ESSAY",
              difficulty: "HARD",
              modelAnswer: "تساهم الحوسبة الطرفية في معالجة بيانات الكاميرات وحساسات السيارة ذاتية القيادة داخلياً في أجزاء من الثانية (Zero Latency) لاتخاذ قرار الفرملة أو تفادي العوائق فوراً دون الاعتماد على اتصال الإنترنت بالسحابة الذي قد يتعرض للانقطاع أو التأخير.",
              concept: "تطبيقات الحوسبة الطرفية في المركبات الذكية",
              points: 10,
            },
          ],
        },
      ],
    },
    {
      title: "الوحدة الثانية: الأمن السيبراني",
      order: 2,
      description: "مبادئ أمن المعلومات (CIA Triad)، استراتيجيات الدفاع في العمق، التهديدات والهجمات الرقمية، وطرق التشفير والتحقق من الهوية.",
      lessons: [
        {
          title: "1. أساسيات الأمن السيبراني وحماية البيانات",
          order: 1,
          durationMinutes: 20,
          objectives: [
            "تطبيق أركان أمن المعلومات الثلاثة: السرية، النزاهة، والتوافر (CIA Triad).",
            "التعرف على أنواع الهجمات السيبرانية مثل التصيد الاحتيالي وبرمجيات الفدية.",
          ],
          questions: [
            {
              statement: "ما هو الركن في ثالوث أمن المعلومات (CIA Triad) الذي يضمن عدم وصول أي شخص غير مصرح له إلى البيانات الحساسة؟",
              type: "MCQ",
              difficulty: "EASY",
              options: [
                { text: "السرية (Confidentiality)", isCorrect: true },
                { text: "النزاهة (Integrity)", isCorrect: false },
                { text: "التوافر (Availability)", isCorrect: false },
                { text: "عدم الإنكار (Non-repudiation)", isCorrect: false },
              ],
              explanation: "السرية (Confidentiality) تعني حماية البيانات من الاطلاع غير المصرح به باستخدام آليات مثل التشفير والتحكم في الوصول وكلمات المرور القوية.",
              concept: "أركان ثالوث أمن المعلومات (CIA)",
            },
            {
              statement: "أي من الهجمات التالية يعتمد على خداع المستخدم برسائل مزيفة تبدو رسمية للحصول على كلمة المرور أو البيانات البنكية؟",
              type: "MCQ",
              difficulty: "MEDIUM",
              options: [
                { text: "هجوم حجب الخدمة (DDoS)", isCorrect: false },
                { text: "التصيد الاحتيالي (Phishing)", isCorrect: true },
                { text: "حقن لغة الاستعلامات (SQL Injection)", isCorrect: false },
                { text: "هجوم الوسيط (Man-in-the-Middle)", isCorrect: false },
              ],
              explanation: "التصيد الاحتيالي يعتمد على الهندسة الاجتماعية عبر رسائل بريد أو صفحات تسجيل دخول مزورة لخداع الضحايا للإفصاح عن بياناتهم السرية.",
              concept: "الهندسة الاجتماعية والتصيد الاحتيالي",
            },
            {
              statement: "المصادقة ثنائية العوامل (2FA) تعتمد فقط على معرفة كلمة المرور دون الحاجة لأي وسيلة تحقق إضافية.",
              type: "TRUE_FALSE",
              difficulty: "EASY",
              options: [
                { text: "صواب", isCorrect: false },
                { text: "خطأ", isCorrect: true },
              ],
              explanation: "المصادقة ثنائية العوامل تتطلب عاملين مختلفين للتحقق: شيء تعرفه (كلمة المرور) وشيء تملكه (رمز OTP على الهاتف أو تطبيق المصادقة).",
              concept: "المصادقة الثنائية 2FA",
            },
            {
              statement: "قارن بين مفهومي «نزاهة البيانات (Integrity)» و«توافر البيانات (Availability)» مع ذكر مثال عملي لكل منهما.",
              type: "ESSAY",
              difficulty: "MEDIUM",
              modelAnswer: "1. النزاهة (Integrity): التأكد من أن البيانات لم يتم تعديلها أو حذفها أو التلاعب بها من طرف غير مصرح له، مثال: عدم التلاعب بدرجات الطلاب في قاعدة البيانات.\n2. التوافر (Availability): ضمان وصول المستخدم المصرح له للبيانات والخدمات في أي وقت يحتاجه، مثال: استمرار عمل موقع البنك على مدار الساعة دون توقف السيرفر.",
              concept: "المقارنة بين النزاهة والتوافر في أمن المعلومات",
              points: 10,
            },
          ],
        },
        {
          title: "2. استراتيجيات الدفاع في العمق والتهديدات الرقمية",
          order: 2,
          durationMinutes: 25,
          objectives: [
            "فهم طبقات نموذج الدفاع في العمق (Defense-in-Depth).",
            "تحليل دور الجدران النارية وأنظمة كشف التسلل في صد الهجمات المعقدة.",
          ],
          questions: [
            {
              statement: "ما هو المبدأ الأمني القائم على وضع طبقات دفاعية متعددة ومتتالية بحيث إذا فشلت طبقة تصدت الطبقة التالية للهجوم؟",
              type: "MCQ",
              difficulty: "MEDIUM",
              options: [
                { text: "الدفاع في العمق (Defense in Depth)", isCorrect: true },
                { text: "الأمان السلبي (Passive Security)", isCorrect: false },
                { text: "التشفير المتماثل فقط", isCorrect: false },
                { text: "الوصول المفتوح", isCorrect: false },
              ],
              explanation: "استراتيجية الدفاع في العمق تستخدم جدران حماية، ومضادات فيروسات، وتحكم بالوصول، وتشفير بيانات، بحيث لا يشكل اختراق نقطة واحدة سقوطاً للمنظومة بالكامل.",
              concept: "استراتيجية الدفاع في العمق",
            },
            {
              statement: "أي مما يلي يمثل الطبقة الأولى (مدخل الشبكة) في استراتيجية الدفاع في العمق لحماية الأنظمة؟",
              type: "MCQ",
              difficulty: "MEDIUM",
              options: [
                { text: "جدار الحماية المحيطي (Perimeter Firewall)", isCorrect: true },
                { text: "تشفير قواعد البيانات", isCorrect: false },
                { text: "النسخ الاحتياطي على السحابة", isCorrect: false },
                { text: "تدريب الموظفين", isCorrect: false },
              ],
              explanation: "الجدار الناري المحيطي يقف على حدود الشبكة لفلترة الحزم القادمة من الإنترنت ومنع الاتصالات المشبوهة قبل وصولها للأجهزة الداخلية.",
              concept: "جدران الحماية المحيطية",
            },
            {
              statement: "اشرح باختصار كيف تعمل برمجيات الفدية (Ransomware) وما هي أفضل وسيلة استرجاع للوقاية من أضرارها؟",
              type: "ESSAY",
              difficulty: "HARD",
              modelAnswer: "برمجيات الفدية هي برامج خبيثة تقوم بتشفير ملفات الضحية باستخدام مفتاح تشفير معقد ثم تطلب فدية مالية لفك التشفير. وأفضل وسيلة للوقاية واسترجاع البيانات هي الاحتفاظ بنسخ احتياطية معزولة (Offline / Air-gapped Backups) بصفة دورية وتحديث الأنظمة باستمرار.",
              concept: "آلية عمل برمجيات الفدية وطرق الوقاية",
              points: 10,
            },
          ],
        },
      ],
    },
    {
      title: "الوحدة الثالثة: تطبيقات الويب",
      order: 3,
      description: "بنية خوادم وتطبيقات الويب (Client-Server Architecture)، بروتوكول HTTP/HTTPS، وتصميم واجهات برمجة التطبيقات (APIs).",
      lessons: [
        {
          title: "1. بنية وتطوير تطبيقات الويب والخوادم",
          order: 1,
          durationMinutes: 20,
          objectives: [
            "التمييز بين كود جانب العميل (Client-Side) وكود جانب الخادم (Server-Side).",
            "فهم دورة الطلب والاستجابة (Request-Response Cycle) عبر بروتوكول HTTP.",
          ],
          questions: [
            {
              statement: "ما هو الفرق الأساسي بين كود جانب العميل (Client-Side) وكود جانب الخادم (Server-Side) في تطبيقات الويب؟",
              type: "MCQ",
              difficulty: "MEDIUM",
              options: [
                { text: "كود العميل ينفذ داخل متصفح المستخدم بينما كود الخادم ينفذ على سيرفر التطبيق", isCorrect: true },
                { text: "كود العميل يتصل مباشرة بقواعد البيانات دون إذن الخادم", isCorrect: false },
                { text: "كود الخادم يستخدم فقط لتلوين النصوص والأزرار", isCorrect: false },
                { text: "لا يوجد فرق بينهما ويعملان في نفس المكان", isCorrect: false },
              ],
              explanation: "الواجهة الأمامية (Frontend / HTML, CSS, JS) تنفذ في متصفح العميل، بينما المنطق التجاري والاتصال بقاعدة البيانات والأمان ينفذ على الخادم (Backend).",
              concept: "هيكلية العميل والخادم في الويب",
            },
            {
              statement: "ما هو رمز حالة الاستجابة (HTTP Status Code) الذي يعبر عن نجاح معالجة الطلب بالكامل على الخادم؟",
              type: "MCQ",
              difficulty: "EASY",
              options: [
                { text: "200 OK", isCorrect: true },
                { text: "404 Not Found", isCorrect: false },
                { text: "500 Internal Server Error", isCorrect: false },
                { text: "403 Forbidden", isCorrect: false },
              ],
              explanation: "الرمز 200 يمثل استجابة HTTP قياسية تؤكد أن الخادم تلقى الطلب وعالجه بنجاح وأرسل البيانات المطلوبة.",
              concept: "رموز استجابة بروتوكول HTTP",
            },
            {
              statement: "بروتوكول HTTPS يقدم اتصالاً مشفراً وآمناً بين متصفح العميل والخادم باستخدام شهادات SSL/TLS لمنع التنصت.",
              type: "TRUE_FALSE",
              difficulty: "EASY",
              options: [
                { text: "صواب", isCorrect: true },
                { text: "خطأ", isCorrect: false },
              ],
              explanation: "HTTPS يضيف طبقة تشفير أمني TLS لبروتوكول HTTP مما يمنع اعتراض البيانات السرية ككلمات المرور أثناء انتقالها عبر الشبكة.",
              concept: "أمان الويب وبروتوكول HTTPS",
            },
            {
              statement: "وضح باختصار دورة الطلب والاستجابة (HTTP Request-Response Lifecycle) عندما يكتب المستخدم عنوان موقع في المتصفح.",
              type: "ESSAY",
              difficulty: "HARD",
              modelAnswer: "1. يرسل المتصفح طلباً (HTTP Request) عبر الـ DNS لتحديد عنوان IP الخادم.\n2. يستقبل الخادم الطلب ويعالجه (يجلب البيانات من قاعدة البيانات).\n3. يرسل الخادم استجابة (HTTP Response) تحتوي كود الحالة (مثلاً 200) وملفات HTML/CSS/JS.\n4. يقوم المتصفح بعرض الصفحة (Render) للمستخدم.",
              concept: "دورة حياة طلب الويب HTTP",
              points: 10,
            },
          ],
        },
        {
          title: "2. واجهات برمجة التطبيقات (APIs) وتكامل الخدمات",
          order: 2,
          durationMinutes: 25,
          objectives: [
            "فهم مفهوم REST API وتبادل البيانات بصيغة JSON.",
            "استخدام أفعال HTTP القياسية (GET, POST, PUT, DELETE) لإدارة البيانات.",
          ],
          questions: [
            {
              statement: "أي من أفعال HTTP (HTTP Methods) يُستخدم لإنشاء عنصر أو إرسال بيانات جديدة لحفظها على الخادم؟",
              type: "MCQ",
              difficulty: "EASY",
              options: [
                { text: "GET", isCorrect: false },
                { text: "POST", isCorrect: true },
                { text: "DELETE", isCorrect: false },
                { text: "OPTIONS", isCorrect: false },
              ],
              explanation: "طريقة POST تُستخدم لإرسال حمولة بيانات (Payload) إلى الخادم لإنشاء مورد جديد، بينما GET تُستخدم للقراءة فقط.",
              concept: "طرق وأفعال HTTP في REST API",
            },
            {
              statement: "صيغة JSON (JavaScript Object Notation) تُستخدم لتبادل البيانات النصية المهيكلة بين العميل والخادم بسهولة واستقلال عن لغة البرمجة.",
              type: "TRUE_FALSE",
              difficulty: "EASY",
              options: [
                { text: "صواب", isCorrect: true },
                { text: "خطأ", isCorrect: false },
              ],
              explanation: "JSON هي الصيغة العالمية الأكثر انتشاراً لتبادل البيانات بين تطبيقات الويب لسهولة قراءتها وخفتها وتوافقها مع جميع لغات البرمجة.",
              concept: "صيغة تبادل البيانات JSON",
            },
          ],
        },
      ],
    },
    {
      title: "الوحدة الرابعة: تصميم الويب والوسائط الرقمية",
      order: 4,
      description: "مبادئ واجهة وتجربة المستخدم (UI/UX)، التصميم المتجاوب، الوسائط الرقمية، وأخلاقيات الذكاء الاصطناعي في إنتاج المحتوى.",
      lessons: [
        {
          title: "1. مبادئ تجربة المستخدم (UI/UX) وتصميم الواجهات",
          order: 1,
          durationMinutes: 20,
          objectives: [
            "التمييز بين واجهة المستخدم (UI) وتجربة المستخدم (UX).",
            "تطبيق مبادئ التصميم المتجاوب (Responsive Design) والتسلسل البصري.",
          ],
          questions: [
            {
              statement: "ما هو المصطلح الذي يشير إلى مشاعر المستخدم وسهولة تفاعله وانسيابية تنقله داخل التطبيق أو الموقع الإلكتروني؟",
              type: "MCQ",
              difficulty: "EASY",
              options: [
                { text: "واجهة المستخدم (UI)", isCorrect: false },
                { text: "تجربة المستخدم (UX)", isCorrect: true },
                { text: "قواعد البيانات (Database)", isCorrect: false },
                { text: "نظام التشغيل (OS)", isCorrect: false },
              ],
              explanation: "تجربة المستخدم (User Experience - UX) تركز على كيفية شعور المستخدم وسهولة أداء مهامه، بينما UI تركز على المظهر البصري والألوان والأزرار.",
              concept: "الفرق بين UI و UX",
            },
            {
              statement: "التصميم المتجاوب (Responsive Web Design) يعني قدرة الموقع على التكيف تلقائياً مع أحجام الشاشات المختلفة (حاسوب، تابلت، هاتف ذكي) دون تشوه.",
              type: "TRUE_FALSE",
              difficulty: "EASY",
              options: [
                { text: "صواب", isCorrect: true },
                { text: "خطأ", isCorrect: false },
              ],
              explanation: "التصميم المتجاوب يستخدم أساليب مثل Fluid Layouts و Media Queries لتوفير تجربة عرض ممتازة على كافة أحجام الشاشات.",
              concept: "التصميم المتجاوب",
            },
          ],
        },
        {
          title: "2. الوسائط المتعددة وأخلاقيات الذكاء الاصطناعي",
          order: 2,
          durationMinutes: 25,
          objectives: [
            "فهم أنواع الوسائط الرقمية وضغط الملفات.",
            "الوعي بأخلاقيات الذكاء الاصطناعي التوليدي والملكية الفكرية والتزييف العميق (Deepfake).",
          ],
          questions: [
            {
              statement: "ما هي التقنية المعتمدة على الذكاء الاصطناعي التوليدي التي تُستخدم لإنشاء مقاطع فيديو أو تسجيلات صوتية مزيفة ومضللة تبدو شديدة الواقعية؟",
              type: "MCQ",
              difficulty: "MEDIUM",
              options: [
                { text: "التزييف العميق (Deepfake)", isCorrect: true },
                { text: "الحوسبة السحابية", isCorrect: false },
                { text: "ضغط الصور بدون فقد", isCorrect: false },
                { text: "التعرف البصري على الحروف (OCR)", isCorrect: false },
              ],
              explanation: "التزييف العميق يستخدم خوارزميات التعلم العميق (GANs) لتبديل الوجوه وتركيب الأصوات مما يفرض تحديات أخلاقية وأمنية كبيرة تتطلب تدقيق المحتوى.",
              concept: "مخاطر التزييف العميق وأخلاقيات الذكاء الاصطناعي",
            },
            {
              statement: "اشرح باختصار أهمية التحقق من حقوق الملكية الفكرية والأمانة العلمية عند استخدام أدوات الذكاء الاصطناعي التوليدي في إنتاج المحتوى الرقمي.",
              type: "ESSAY",
              difficulty: "HARD",
              modelAnswer: "يجب احترام الملكية الفكرية والتأكد من عدم استخدام أدوات الذكاء الاصطناعي لنقل مصنفات محمية دون إذن، والإفصاح عن استخدام الذكاء الاصطناعي، ومراجعة المحتوى الناتج يدوياً للتأكد من دقته وعدم احتوائه على معلومات مضللة أو متحيزة.",
              concept: "أخلاقيات الذكاء الاصطناعي التوليدي والملكية الفكرية",
              points: 10,
            },
          ],
        },
      ],
    },
  ];

  // 4. Seed Units, Lessons, and Questions in Database
  let totalImportedQuestions = 0;

  for (const uData of unitsData) {
    let unit = await prisma.unit.findFirst({
      where: {
        subjectId: subject.id,
        title: uData.title,
      },
    });

    if (!unit) {
      unit = await prisma.unit.create({
        data: {
          title: uData.title,
          order: uData.order,
          description: uData.description,
          subjectId: subject.id,
          isPublished: true,
        },
      });
      console.log(`\n📁 Created Unit: ${unit.title}`);
    } else {
      console.log(`\n📁 Existing Unit: ${unit.title}`);
    }

    for (const lData of uData.lessons) {
      let lesson = await prisma.lesson.findFirst({
        where: {
          unitId: unit.id,
          title: lData.title,
        },
      });

      if (!lesson) {
        lesson = await prisma.lesson.create({
          data: {
            title: lData.title,
            order: lData.order,
            unitId: unit.id,
            durationMinutes: lData.durationMinutes,
            isPublished: true,
          },
        });
        console.log(`  📄 Created Lesson: ${lesson.title}`);
      } else {
        console.log(`  📄 Existing Lesson: ${lesson.title}`);
      }

      // Check or create Lesson Content
      const existingContent = await prisma.lessonContent.findUnique({
        where: { lessonId: lesson.id },
      });

      if (!existingContent) {
        await prisma.lessonContent.create({
          data: {
            lessonId: lesson.id,
            objectives: lData.objectives,
            body: `## ${lData.title}\n\nمرحباً بك في درس **${lData.title}** ضمن منهج البكالوريا المصرية المعتمد.\n\n### أهداف الدرس:\n${lData.objectives.map((o) => `- ${o}`).join("\n")}\n\nتابع الشرح بعناية ثم اختبر فهمك في بنك الأسئلة أدناه.`,
          },
        });
      }

      // Create an ImportBatch audit record for this lesson's seed
      const batch = await prisma.importBatch.create({
        data: {
          fileName: "كتاب التقييمات والأداءات الوزاري - بكالوريا برمجة",
          fileType: "PDF",
          questionType: "MCQ",
          schoolCategory: "ARABIC",
          gradeId: g11.id,
          subjectId: subject.id,
          unitId: unit.id,
          importedCount: lData.questions.length,
        },
      });

      // Insert questions into database with full explanation and choices
      for (const q of lData.questions) {
        // Prevent duplicate statements in the same lesson
        const existingQ = await prisma.question.findFirst({
          where: {
            subjectId: subject.id,
            statement: q.statement,
          },
        });

        if (existingQ) {
          continue;
        }

        await prisma.question.create({
          data: {
            statement: q.statement,
            type: q.type as any,
            difficulty: q.difficulty as any,
            status: "PUBLISHED",
            schoolCategory: "ARABIC",
            subjectId: subject.id,
            unitId: unit.id,
            batchId: batch.id,
            lessons: {
              create: {
                lessonId: lesson.id,
              },
            },
            options: {
              create: (q.options || []).map((opt, idx) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
                order: idx + 1,
              })),
            },
            ...(q.explanation
              ? {
                  explanation: {
                    create: {
                      concept: q.concept || "تفسير الإجابة",
                      correctReason: q.explanation,
                    },
                  },
                }
              : {}),
            ...(q.type === "ESSAY" && q.modelAnswer
              ? {
                  rubric: {
                    create: {
                      modelAnswer: q.modelAnswer,
                      maxScore: q.points || 10,
                    },
                  },
                }
              : {}),
          },
        });

        totalImportedQuestions++;
      }
    }
  }

  console.log(`\n🎉 Successfully Seeded & Uploaded ${totalImportedQuestions} Questions across all 4 Units and Lessons!`);
}

main()
  .catch((e) => {
    console.error("Error seeding questions:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
