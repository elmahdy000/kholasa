# دليل هياكل الأسئلة المعتمدة لمنصة «الخلاصة»
# Comprehensive Question Structures & Schema Guide

هذا الدليل هو المرجع الرسمي الشامل لجميع هياكل وصيغ الأسئلة المدعومة في منصة **«الخلاصة»**، سواء عبر رفع ملفات **JSON** المباشرة، أو عبر لصق النصوص من ملفات **Word (.docx)** والملفات النصية.

---

## فهرس المحتويات
1. [قواعد العرض والاتجاهات (BiDi LTR & RTL Rules)](#1-قواعد-العرض-والاتجاهات-bidi-ltr--rtl-rules)
2. [هياكل أسئلة الاختيار من متعدد (MCQ)](#2-هياكل-أسئلة-الاختيار-من-متعدد-mcq)
3. [هياكل أسئلة الصواب والخطأ (TRUE_FALSE)](#3-هياكل-أسئلة-الصواب-والخطأ-true_false)
4. [هياكل الأسئلة المقالية (ESSAY)](#4-هياكل-الأسئلة-المقالية-essay)
5. [جدول الحقول المعتمدة (Field Dictionary)](#5-جدول-الحقول-المعتمدة-field-dictionary)
6. [حزمة تجريبية جاهزة للنسخ المباشر (Copy-Paste Ready Bundle)](#6-حزمة-تجريبية-جاهزة-للنسخ-المباشر-copy-paste-ready-bundle)
7. [صيغ النصوص وملفات الوورد (.docx / Raw Text)](#7-صيغ-النصوص-وملفات-الوورد-docx--raw-text)

---

## 1. قواعد العرض والاتجاهات (BiDi LTR & RTL Rules)

لضمان تجربة تعليمية عالمية تليق بطلاب مدارس اللغات والمدارس العامة:
- **المواد الإنجليزية (مدارس اللغات):**
  - نص السؤال والخيارات تظهر بنظام **LTR** أصيل (من اليسار لليمين).
  - علامات الخيارات `[A]`, `[B]`, `[C]`, `[D]` تظهر على **اليسار** بجوار النص.
  - خيارات الصواب والخطأ تظهر كـ `True` و `False` واضحة ونظيفة بدون تشتيت بترجمة كلمة صواب/خطأ.
  - **ترجمة التفسير العلمي:** تظل مخفية افتراضياً وتظهر فقط في بطاقة عربية RTL منفصلة عند نقر الطالب على زر الترجمة.
- **المواد العربية (المدارس العامة):**
  - كافة العناصر تظهر بنظام **RTL** عربي كامل من اليمين لليسار.

---

## 2. هياكل أسئلة الاختيار من متعدد (MCQ)

### 2.1 الصيغة النموذجية لمدارس اللغات (Bilingual Languages School)

تتضمن نص السؤال بالإنجليزية مع ترجمة عربية اختيارية، وخيارات إنجليزية صافية، وتفسير إنجليزي مع ترجمته العربية المنفصلة:

```json
[
  {
    "type": "MCQ",
    "difficulty": "MEDIUM",
    "statement": "Which of the following components is primarily responsible for executing arithmetic and logical operations in a CPU?",
    "translation": "أي من المكونات التالية مسؤول بشكل أساسي عن تنفيذ العمليات الحسابية والمنطقية داخل وحدة المعالجة المركزية؟",
    "concept": "CPU Architecture – ALU",
    "explanation": "The Arithmetic Logic Unit (ALU) directly performs mathematical computations and logical evaluations, while the Control Unit directs data flow.",
    "explanationTranslation": "تقوم وحدة الحساب والمنطق (ALU) بتنفيذ العمليات الحسابية والمقارنات المنطقية، بينما تتولى وحدة التحكم توجيه مسار البيانات.",
    "options": [
      {
        "text": "Arithmetic Logic Unit (ALU)",
        "isCorrect": true
      },
      {
        "text": "Control Unit (CU)",
        "isCorrect": false
      },
      {
        "text": "Random Access Memory (RAM)",
        "isCorrect": false
      },
      {
        "text": "Instruction Register (IR)",
        "isCorrect": false
      }
    ]
  }
]
```

---

### 2.2 الصيغة المختصرة بخريطة خيارات (Object Map Format)

يدعم المحرك تمرير الاختيارات ككائن يحمل الحروف `A, B, C, D` وتحديد الإجابة عبر `answer`:

```json
[
  {
    "type": "MCQ",
    "difficulty": "EASY",
    "statement": "Which network topology connects every computer to a central hub or switch?",
    "translation": "أي طوبولوجيا شبكات تقوم بتوصيل كل جهاز بموزع أو محول مركزي؟",
    "concept": "Network Topologies",
    "explanation": "In a Star topology, all nodes are connected individually to a central switch or hub.",
    "explanationTranslation": "في طوبولوجيا النجمة (Star)، تتصل جميع الأجهزة بشكل فردي بمحول مركزي.",
    "options": {
      "A": "Bus Topology",
      "B": "Star Topology",
      "C": "Ring Topology",
      "D": "Mesh Topology"
    },
    "answer": "B"
  }
]
```

---

### 2.3 الصيغة النموذجية للمناهج العربية (General Arabic Curriculum)

```json
[
  {
    "type": "MCQ",
    "difficulty": "EASY",
    "statement": "أي من وحدات التخزين التالية تعتبر ذاكرة متطايرة تفقد محتوياتها بمجرد انقطاع التيار الكهربائي؟",
    "concept": "أنواع الذاكرة في الحاسوب",
    "explanation": "ذاكرة الوصول العشوائي (RAM) هي ذاكرة مؤقتة تفقد كل بياناتها عند إغلاق الجهاز، بخلاف القرص الصلب أو ذاكرة ROM.",
    "options": [
      {
        "text": "ذاكرة الوصول العشوائي (RAM)",
        "isCorrect": true
      },
      {
        "text": "ذاكرة القراءة فقط (ROM)",
        "isCorrect": false
      },
      {
        "text": "القرص الصلب (Hard Disk)",
        "isCorrect": false
      },
      {
        "text": "ذاكرة الفلاش (Flash Memory)",
        "isCorrect": false
      }
    ]
  }
]
```

---

## 3. هياكل أسئلة الصواب والخطأ (TRUE_FALSE)

### 3.1 الصيغة النموذجية لمدارس اللغات (بدون ترجمة لـ True و False)

> **تنبيه هام:** لا تضع `"translation": "صواب"` أو `"translation": "خطأ"` داخل خيارات اللغات؛ ضع ترجمة السؤال في `translation` وترجمة التفسير في `explanationTranslation`:

```json
[
  {
    "type": "TRUE_FALSE",
    "difficulty": "EASY",
    "statement": "Personal computers (PCs) first became widespread in the 1990s.",
    "translation": "انتشرت أجهزة الكمبيوتر الشخصية (PCs) لأول مرة في تسعينيات القرن العشرين.",
    "concept": "Information Technology History",
    "explanation": "The widespread adoption of personal computers occurred during the 1970s and 1980s. The 1990s were marked by the commercial spread of the Internet and Web.",
    "explanationTranslation": "بدأ انتشار أجهزة الكمبيوتر الشخصية خلال السبعينيات والثمانينيات، بينما ارتبطت فترة التسعينيات بإتاحة الإنترنت للعامة وظهور الويب.",
    "options": [
      {
        "text": "True",
        "isCorrect": false
      },
      {
        "text": "False",
        "isCorrect": true
      }
    ]
  }
]
```

---

### 3.2 الصيغة الذكية السريعة لأسئلة الصواب والخطأ (بدون مصفوفة options)

المنصة تستطيع توليد أزرار `True` و `False` بالإنجليزية تلقائياً بمجرد تمرير حقل `"answer": "True"` أو `"answer": "False"`:

```json
[
  {
    "type": "TRUE_FALSE",
    "difficulty": "EASY",
    "statement": "Cloud Computing delivers computing resources as an on-demand service over the Internet.",
    "translation": "تُقدم الحوسبة السحابية الموارد الحوسبية كخدمة حسب الطلب عبر شبكة الإنترنت.",
    "concept": "Cloud Computing",
    "explanation": "Cloud computing allows users to access servers, storage, and databases on-demand over the web.",
    "explanationTranslation": "تسمح الحوسبة السحابية بالوصول إلى الخوادم ومساحات التخزين وقواعد البيانات عند الطلب عبر الإنترنت.",
    "answer": "True"
  }
]
```

---

### 3.3 الصيغة العربية لأسئلة صح وغلط

```json
[
  {
    "type": "TRUE_FALSE",
    "difficulty": "EASY",
    "statement": "تعتبر لغة بايثون من لغات البرمجة المترجمة (Compiled Languages) فقط.",
    "concept": "مترجمات ومفسرات لغات البرمجة",
    "explanation": "لغة بايثون هي لغة مفسرة (Interpreted) تعتمد على مفسر سطر بسطر، وتتحول أولاً إلى Bytecode وليس لغة آلة مباشرة.",
    "options": [
      {
        "text": "صواب",
        "isCorrect": false
      },
      {
        "text": "خطأ",
        "isCorrect": true
      }
    ]
  }
]
```

---

## 4. هياكل الأسئلة المقالية (ESSAY)

تعتمد الأسئلة المقالية على **الإجابة النموذجية (Model Answer)** المقسمة لنقاط واضحة ومعايير تصحيح:

### 4.1 الصيغة النموذجية لمدارس اللغات (Bilingual Essay)

```json
[
  {
    "type": "ESSAY",
    "difficulty": "MEDIUM",
    "statement": "Explain the physical and engineering challenges that limit the continuation of Moore's Law.",
    "translation": "اشرح التحديات الفيزيائية والهندسية التي تعيق استمرار العمل بقانون مور.",
    "concept": "Moore's Law – Physical Limits",
    "modelAnswer": "1. Transistor miniaturization is approaching atomic and physical limits.\n2. Quantum tunneling causes electrons to breach barriers unintentionally.\n3. Excessive heat generation and power leakage degrade processor efficiency.\n4. High manufacturing costs for sub-nanometer lithography equipment.",
    "modelAnswerTranslation": "1. اقتراب تصغير الترانزستورات من الحدود الذرية والفيزيائية القصوى.\n2. ظاهرة النفق الكمي تسمح بمرور الإلكترونات عبر الحواجز بشكل غير مقصود.\n3. الانبعاث الحراري العالي وتيار التسرب يقللان من كفاءة استهلاك الطاقة.\n4. ارتفاع تكاليف تصنيع معدات الطباعة الضوئية لما دون النانومتر.",
    "explanation": "As silicon features reach single-digit nanometers, quantum mechanical effects dominate, necessitating multi-core and quantum computing alternatives.",
    "explanationTranslation": "مع اقتراب الترانزستور من أحجام النانومتر الفردية، تصبح التأثيرات الكمية هي الحاكمة، مما استدعى اللجوء للمعالجات متعددة الأنوية والحوسبة الكمية."
  }
]
```

---

### 4.2 الصيغة النموذجية للمناهج العربية (Arabic Essay)

```json
[
  {
    "type": "ESSAY",
    "difficulty": "MEDIUM",
    "statement": "اذكر التحولات الاجتماعية الرئيسية الناتجة عن تطور تكنولوجيا المعلومات.",
    "concept": "التحولات المجتمعية لتكنولوجيا المعلومات",
    "modelAnswer": "1. انتشار شبكات التواصل الاجتماعي وسرعة تبادل الأخبار.\n2. نمو التجارة الإلكترونية وإتمام المعاملات عن بُعد.\n3. شيوع العمل عن بُعد والاجتماعات الافتراضية.\n4. التوسع في منصات التعلم الإلكتروني.\n5. الاعتماد على الدفع الإلكتروني وتقليل التعاملات النقدية.",
    "explanation": "أثرت تكنولوجيا المعلومات على أنماط العمل والتواصل والتعليم والتجارة وحولتها إلى بيئات رقمية فورية."
  }
]
```

---

## 5. جدول الحقول المعتمدة (Field Dictionary)

| الحقل (Key) | النوع | إلزامي؟ | الوصف وسلوك المنصة |
| :--- | :--- | :---: | :--- |
| `type` | String | نعم | نوع السؤال: `"MCQ"` أو `"TRUE_FALSE"` أو `"ESSAY"`. |
| `difficulty` | String | اختياري | مستوى الصعوبة: `"EASY"` (مباشر)، `"MEDIUM"` (متوسط)، `"HARD"` (متقدم). الافتراضي `"MEDIUM"`. |
| `statement` | String | نعم | نص السؤال الأساسي (سواء إنجليزي أو عربي). |
| `translation` | String | اختياري | الترجمة العربية لنص السؤال (ضروري لمدارس اللغات لتمكين زر الترجمة اللحظي). |
| `concept` | String | اختياري | المفهوم المنهجي المرتبط بالسؤال (يظهر في ترويسة الشرح وخريطة إتقان الطالب). |
| `explanation` | String | موصى به | التفسير العلمي لسبب صحة الإجابة. في اللغات يُكتب بالإنجليزية. |
| `explanationTranslation` | String | موصى به | الترجمة العربية للتفسير العلمي؛ تظل مخفية وتظهر فقط عند ضغط الطالب على زر الترجمة. |
| `options` | Array / Object | للـ MCQ و T/F | مصفوفة تحتوي على الخيارات، كل خيار يحمل `text` و `isCorrect: true/false`. |
| `answer` | String | بديل | يمكن كتابة الحرف `"A"` أو `"B"` في الاختياري، أو `"True"` / `"False"` في الصح والخطأ. |
| `modelAnswer` | String | للمقالي | نقاط الإجابة النموذجية للسؤال المقالي (يُفضل ترقيمها 1. 2. 3.). |
| `modelAnswerTranslation` | String | للمقالي | الترجمة العربية للإجابة النموذجية في مواد اللغات. |

---

## 6. حزمة تجريبية جاهزة للنسخ المباشر (Copy-Paste Ready Bundle)

يمكنك نسخ هذا الرمز بالكامل ولصقه داخل **«معالج استيراد الأسئلة»** في لوحة التحكم لاختبار كافة الأنواع الثلاثة في ثوانٍ:

```json
[
  {
    "type": "MCQ",
    "difficulty": "EASY",
    "statement": "Which protocol is the standard foundation of communication on the World Wide Web?",
    "translation": "أي بروتوكول يعد الأساس المعياري للاتصال عبر شبكة الويب العالمية؟",
    "concept": "Web Protocols & Networking",
    "explanation": "HTTP (HyperText Transfer Protocol) defines how messages are formatted and transmitted across web servers and browsers.",
    "explanationTranslation": "يحدد بروتوكول HTTP كيفية تنسيق ونقل البيانات عبر صفحات الويب بين الخوادم والمتصفحات.",
    "options": [
      { "text": "HTTP / HTTPS", "isCorrect": true },
      { "text": "FTP", "isCorrect": false },
      { "text": "SMTP", "isCorrect": false },
      { "text": "SSH", "isCorrect": false }
    ]
  },
  {
    "type": "TRUE_FALSE",
    "difficulty": "EASY",
    "statement": "An IP address uniquely identifies each connected device on a TCP/IP network.",
    "translation": "يحدد عنوان الـ IP بشكل فريد كل جهاز متصل بشبكة تعتمد على بروتوكول TCP/IP.",
    "concept": "IP Addressing & Subnets",
    "explanation": "Every computer or device on the internet has a unique IP address allowing data packets to be routed accurately.",
    "explanationTranslation": "يمتلك كل جهاز متصل بالإنترنت عنوان IP فريداً لضمان توجيه حزم البيانات بدقة إلى وجهتها.",
    "answer": "True"
  },
  {
    "type": "ESSAY",
    "difficulty": "MEDIUM",
    "statement": "Compare between Symmetric and Asymmetric Encryption in terms of key usage and speed.",
    "translation": "قارن بين التشفير المتماثل (Symmetric) وغير المتماثل (Asymmetric) من حيث استخدام المفاتيح والسرعة.",
    "concept": "Cybersecurity & Cryptography",
    "modelAnswer": "1. Key Usage: Symmetric uses a single shared secret key for encryption and decryption; Asymmetric uses a public key to encrypt and a private key to decrypt.\n2. Speed & Efficiency: Symmetric encryption is computationally fast and suitable for bulk data; Asymmetric encryption is slower due to complex mathematical operations.\n3. Common Use Cases: Symmetric is used for disk encryption and session payloads; Asymmetric is used for digital signatures and TLS handshakes.",
    "modelAnswerTranslation": "1. استخدام المفاتيح: يستخدم التشفير المتماثل مفتاحاً سرياً واحداً للتشفير وفك التشفير؛ بينما يستخدم غير المتماثل مفتاحاً عاماً للتشفير ومفتاحاً خاصاً لفك التشفير.\n2. السرعة والكفاءة: التشفير المتماثل أسرع حسابياً ومناسب للبيانات الضخمة؛ بينما غير المتماثل أبطأ بسبب العمليات الرياضية المعقدة.\n3. حالات الاستخدام: يُستخدم المتماثل في تشفير الأقراص وبيانات الجلسة؛ بينما يُستخدم غير المتماثل في التوقيعات الرقمية ومصادقة شهادات TLS.",
    "explanation": "Modern secure web communication (like HTTPS) combines both: using asymmetric encryption to exchange a secret session key, then symmetric encryption for subsequent traffic.",
    "explanationTranslation": "تجمع الاتصالات الآمنة الحديثة مثل HTTPS بين النوعين: تستخدم غير المتماثل لتبادل المفتاح السري، ثم المتماثل لنقل البيانات بسرعة."
  }
]
```

---

## 7. صيغ النصوص وملفات الوورد (.docx / Raw Text)

إذا كنت تفضل تجهيز الأسئلة في ملف **Word (.docx)** أو نص عادي ولصقه مباشرة:

```text
[MCQ] [EASY]
Q1: What does DNS stand for in computer networking?
Translation: ماذا يعني الاختصار DNS في شبكات الحاسوب؟
*A) Domain Name System
B) Digital Network Server
C) Data Name Service
D) Distributed Network System
Answer: A
Explanation: DNS translates human-friendly domain names (e.g. google.com) into machine-readable IP addresses.
الترجمة العربية للتفسير: يقوم نظام DNS بترجمة أسماء النطاقات المفهومة للإنسان إلى عناوين IP رقمية تفهمها الأجهزة.
Concept: Domain Name System
---

[TRUE_FALSE] [EASY]
Q2: Moore's Law is a strict physical law of nature.
Translation: يُعد قانون مور قانوناً فيزيائياً صارماً من قوانين الطبيعة.
A) True
*B) False
Answer: B
Explanation: Moore's Law is an empirical historical observation, not a physical law of nature.
الترجمة العربية للتفسير: قانون مور هو ملاحظة تجريبية وتاريخية لتطور الترانزستورات وليس قانوناً فيزيائياً ثابتاً في الطبيعة.
Concept: Moore's Law
---

[ESSAY] [MEDIUM]
Q3: Explain the main benefits of Cloud Computing for modern businesses.
Translation: اشرح أهم فوائد الحوسبة السحابية للمؤسسات والشركات الحديثة.
Model Answer:
1. Scalability and flexibility according to demand.
2. Cost savings by eliminating physical server maintenance.
3. High availability and automated disaster recovery.
4. Global accessibility from any internet-connected device.
Model Answer Translation:
1. قابلية التوسع والمرونة وفقاً لحاجة العمل.
2. خفض التكاليف بإلغاء الحاجة لشراء وصيانة خوادم فيزيائية.
3. التوافرية العالية والنسخ الاحتياطي التلقائي للكوارث.
4. إمكانية الوصول من أي مكان في العالم عبر الإنترنت.
Explanation: Cloud providers manage infrastructure complexity, allowing companies to focus on software and business logic.
الترجمة العربية للتفسير: تتولى الشركات السحابية إدارة تعقيدات البنية التحتية مما يتيح للشركات التركيز على برمجياتها وخدماتها.
Concept: Cloud Computing Benefits
---
```

