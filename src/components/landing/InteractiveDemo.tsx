"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Network,
  CheckSquare,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Brain,
  Code2,
  ShieldCheck,
  Cpu,
  Layers,
  BarChart3,
} from "lucide-react";

const ZATONA_LESSONS = {
  arabic: [
    {
      id: "cpu",
      pill: "الوحدة ١ • معمارية المعالج ودورة FDE",
      title: "معمارية فون نيومان ودورة الجلب والتنفيذ (Fetch-Decode-Execute)",
      coreIdea:
        "معمارية فون نيومان بتعتمد على مبدأ البرنامج المخزن (Stored-Program Concept) حيث البيانات والتعليمات بيتخزنوا معاً في الـ RAM. المعالج (CPU) بينفذ 3 خطوات متصلة: جلب التعليمة (Fetch)، فك الشفرة بواسطة وحدة التحكم CU (Decode)، والتنفيذ في وحدة الحساب والمنطق ALU (Execute).",
      formulaCode: "PC → MAR → RAM → MDR → CIR  |  PC = PC + 1",
      examTrap:
        "فخ امتحاني متكرر: متى يزداد عداد البرنامج (PC) بمقدار +1؟ يزداد تلقائياً أثناء مرحلة الجلب (Fetch) فور نسخ العنوان إلى MAR، وليس بعد انتهاء التنفيذ! وتذكر: MAR للعناوين (Address) و MDR للبيانات (Data).",
      checklist: [
        "فرّقت بين وظيفة سجل العناوين MAR وسجل البيانات MDR",
        "عرفت إن وحدة التحكم (CU) هي المسؤولة حصراً عن فك الشفرة (Decode)",
        "حفظت دور المركم (Accumulator) في حفظ نتائج الـ ALU المؤقتة",
      ],
    },
    {
      id: "cyber",
      pill: "الوحدة ٢ • الأمن السيبراني والتشفير",
      title: "ثالوث أمن المعلومات (CIA Triad) والتشفير المتماثل وغير المتماثل",
      coreIdea:
        "يرتكز أمن النظم على 3 أعمدة: السرية (Confidentiality) بمنع الوصول غير المصرح، التكامل (Integrity) بحماية البيانات من التعديل، والتوافر (Availability) بضمان عمل الخدمة. في التشفير غير المتماثل يُستخدم المفتاح العام (Public Key) للتشفير والمفتاح الخاص (Private Key) لفك التشفير.",
      formulaCode: "Cipher = Encrypt(Data, PublicKey) → Decrypt(Cipher, PrivateKey)",
      examTrap:
        "تكة امتحان حاسمة: دوال الهاش (Hashing مثل SHA-256) هي دوال وحيدة الاتجاه (One-Way) تُستخدم للتحقق من سلامة البيانات (Integrity) ولا يمكن فك تشفيرها لاسترجاع النص الأصلي أبداً!",
      checklist: [
        "ربطت بين التشفير (السرية) ودوال الهاش (التكامل والسلامة)",
        "فرّقت بين التشفير المتماثل (مفتاح واحد سريع) وغير المتماثل (مفتاحين)",
        "عرفت الفرق بين هجمات التصيد (Phishing) وهجمات حجب الخدمة (DDoS)",
      ],
    },
    {
      id: "cpp",
      pill: "الوحدة ٥ • البرمجة الهندسية C++ و Big-O",
      title: "المؤشرات (Pointers) وإدارة الذاكرة والتعقيد الخوارزمي (Big-O)",
      coreIdea:
        "المؤشر (Pointer) في C++ هو متغير يخزن عنوان الذاكرة لمتغير آخر باستخدام معامل العنوان (&)، بينما معامل فك الإشارة (*) يصل للقيمة نفسها. وفي خوارزميات البحث: البحث الثنائي (Binary Search) يقسم المصفوفة المرتبة لنصفين في كل خطوة بتعقيد زمني فائق السرعة O(log n).",
      formulaCode: "int x = 50; int *ptr = &x; *ptr = 70; // x becomes 70",
      examTrap:
        "انتبه: البحث الثنائي (Binary Search) سرعته O(log n) مقارنة بالبحث الخطي O(n)، لكنه يشترط شرطاً أساسياً لا يعمل بدونه: يجب أن تكون المصفوفة مرتبة (Sorted) مسبقاً!",
      checklist: [
        "أتقنت الفرق بين تمرير المتغيرات بالقيمة (By Value) وبالمرجع (By Reference)",
        "قارنت بين ذاكرة المكدس (Stack) التلقائية وذاكرة الكومة (Heap) الديناميكية",
        "حسبت عدد خطوات Binary Search لمصفوفة من 1024 عنصر (10 خطوات فقط!)",
      ],
    },
  ],
  languages: [
    {
      id: "cpu",
      pill: "Unit 1 • CPU Architecture & FDE Cycle",
      title: "Von Neumann Architecture & Fetch-Decode-Execute Cycle",
      coreIdea:
        "Von Neumann architecture relies on the Stored-Program Concept where both instructions and data share the same RAM. The CPU continuously runs 3 phases: Fetch (via PC, MAR, MDR, CIR), Decode (by the Control Unit), and Execute (by the ALU and Accumulator).",
      formulaCode: "PC → MAR → RAM → MDR → CIR  |  PC = PC + 1",
      examTrap:
        "Classic Exam Trap: When does the Program Counter (PC) increment by +1? Immediately during the Fetch phase right after the address is copied to MAR — NOT after execution! Also remember: MAR holds the Address, MDR holds the Data.",
      checklist: [
        "Distinguished clearly between MAR (Address) and MDR (Data)",
        "Identified the Control Unit (CU) as the sole decoder of instructions",
        "Understood how the Accumulator (ACC) stores intermediate ALU outputs",
      ],
    },
    {
      id: "cyber",
      pill: "Unit 2 • Cybersecurity & Cryptography",
      title: "CIA Triad, Asymmetric Encryption & Hashing",
      coreIdea:
        "Information security rests on Confidentiality (authorized access only), Integrity (no unauthorized modification), and Availability (system uptime). Asymmetric encryption uses the receiver's Public Key to encrypt and their Private Key to decrypt.",
      formulaCode: "Cipher = Encrypt(Data, PublicKey) → Decrypt(Cipher, PrivateKey)",
      examTrap:
        "High-Yield Exam Note: Cryptographic hash functions (like SHA-256) are strictly ONE-WAY functions used to verify Data Integrity — they cannot be decrypted back into plaintext!",
      checklist: [
        "Linked Encryption to Confidentiality and Hashing to Integrity",
        "Compared Symmetric (1 shared key, fast) vs. Asymmetric (Public/Private pair)",
        "Differentiated Phishing (social engineering) from DDoS (availability attack)",
      ],
    },
    {
      id: "cpp",
      pill: "Unit 5 • Engineering C++, Pointers & Big-O",
      title: "Pointers, Stack vs. Heap & Algorithmic Complexity (Big-O)",
      coreIdea:
        "In C++, a pointer stores the hexadecimal memory address of another variable using the address-of operator (&), while the dereference operator (*) accesses or modifies the target value. Binary Search halves the search space each step, achieving O(log n) time complexity.",
      formulaCode: "int x = 50; int *ptr = &x; *ptr = 70; // x becomes 70",
      examTrap:
        "Crucial Prerequisite: Binary Search runs in O(log n) compared to Linear Search O(n), but it ONLY works if the array or dataset is already SORTED beforehand!",
      checklist: [
        "Mastered Pass-by-Value vs. Pass-by-Reference using pointers",
        "Contrasted Stack (automatic LIFO) vs. Heap (dynamic new/delete)",
        "Calculated max Binary Search comparisons for N = 1024 (log2(1024) = 10 steps)",
      ],
    },
  ],
};

const DEMO_QUESTIONS_BANK = {
  arabic: [
    {
      badge: "سؤال ١ • معمارية المعالج والـ CPU",
      question:
        "ما هي الوحدة المسؤولة داخل المعالج (CPU) عن فك تشفير التعليمة البرمجية (Instruction Decoding) وإرسال إشارات التوقيت والتحكم لباقي المكونات؟",
      options: [
        {
          id: 0,
          text: "أ) وحدة التحكم (Control Unit - CU)",
          isCorrect: true,
          reason:
            "صح جداً! وحدة التحكم (CU) هي اللي بتقرأ التعليمة من سجل CIR وتفك شفرتها وتبعت إشارات التحكم للـ ALU والذاكرة.",
        },
        {
          id: 1,
          text: "ب) وحدة الحساب والمنطق (ALU)",
          isCorrect: false,
          reason:
            "غلط: الـ ALU بتنفذ العمليات الحسابية (جمع/طرح) والمنطقية (AND/OR) في مرحلة الـ Execute، مش فك التشفير.",
        },
        {
          id: 2,
          text: "ج) سجل عنوان الذاكرة (MAR)",
          isCorrect: false,
          reason:
            "غلط: الـ MAR مجرد سجل بيشيل عنوان موقع الذاكرة اللي بنقرأ منه أو نكتب فيه.",
        },
        {
          id: 3,
          text: "د) المركم (Accumulator - ACC)",
          isCorrect: false,
          reason:
            "غلط: المركم بيحفظ نواتج العمليات الحسابية المؤقتة اللي بتطلع من الـ ALU.",
        },
      ],
    },
    {
      badge: "سؤال ٢ • البرمجة الهندسية C++ والذاكرة",
      question:
        "أي منطقة في ذاكرة الحاسوب تُستخدم للحجز الديناميكي للمتغيرات أثناء تشغيل البرنامج (Runtime) ويجب تحريرها يدوياً لمنع تسرب الذاكرة (Memory Leak)؟",
      options: [
        {
          id: 0,
          text: "أ) ذاكرة الكومة (Heap Memory)",
          isCorrect: true,
          reason:
            "إجابة دقيقة! الـ Heap بتستخدم للحجز الديناميكي وقت التشغيل (بأمر new) ولازم المبرمج يحررها بأمر delete.",
        },
        {
          id: 1,
          text: "ب) ذاكرة المكدس (Stack Memory)",
          isCorrect: false,
          reason:
            "غلط: الـ Stack بتحجز المتغيرات المحلية تلقائياً وبتتمسح لوحدها أول ما الدالة تخلص.",
        },
        {
          id: 2,
          text: "ج) ذاكرة القراءة فقط (ROM)",
          isCorrect: false,
          reason:
            "غلط: الـ ROM ذاكرة دائمة فيها أوامر بدء التشغيل (BIOS/Firmware) ومش بتتغير وقت تشغيل البرنامج.",
        },
        {
          id: 3,
          text: "د) عداد البرنامج (Program Counter)",
          isCorrect: false,
          reason:
            "غلط: الـ PC سجل داخلي صغير لحفظ عنوان التعليمة الجاية مش لحجز هياكل البيانات.",
        },
      ],
    },
    {
      badge: "سؤال ٣ • الذكاء الاصطناعي وتعلم الآلة",
      question:
        "عندما يولّد نموذج الذكاء الاصطناعي التوليدي (Generative AI) إجابة تبدو منطقية لغوياً لكنها تحتوي على معلومات غير حقيقية ومخالفة للواقع، تسمى هذه الظاهرة:",
      options: [
        {
          id: 0,
          text: "أ) الهلوسة (AI Hallucination)",
          isCorrect: true,
          reason:
            "برافو! الهلوسة (Hallucination) هي توليد الذكاء الاصطناعي لمعلومات تبدو مقنعة لكنها غير صحيحة علمياً أو واقعياً.",
        },
        {
          id: 1,
          text: "ب) مشكلة الصندوق الأسود (Black-box Problem)",
          isCorrect: false,
          reason:
            "غلط: الصندوق الأسود معناه صعوبة تفسير الطريقة الداخلية اللي وصل بيها النموذج للقرار، مش اختلاق معلومات غلط.",
        },
        {
          id: 2,
          text: "ج) الحوسبة الطرفية (Edge Computing)",
          isCorrect: false,
          reason:
            "غلط: الحوسبة الطرفية معناها معالجة البيانات على الجهاز نفسه محلياً بدل السحابة.",
        },
        {
          id: 3,
          text: "د) الصيانة التنبؤية (Predictive Maintenance)",
          isCorrect: false,
          reason:
            "غلط: الصيانة التنبؤية هي توقع أعطال الآلات في المصانع قبل حدوثها باستخدام الـ AI.",
        },
      ],
    },
  ],
  languages: [
    {
      badge: "Q1 • CPU Architecture & FDE Cycle",
      question:
        "Which internal CPU component is strictly responsible for Instruction Decoding and generating timing and control signals?",
      options: [
        {
          id: 0,
          text: "A) Control Unit (CU)",
          isCorrect: true,
          reason:
            "Correct! The Control Unit (CU) reads the instruction in CIR, decodes the opcode, and dispatches control signals across the CPU.",
        },
        {
          id: 1,
          text: "B) Arithmetic Logic Unit (ALU)",
          isCorrect: false,
          reason:
            "Wrong: The ALU performs mathematical and logical operations during the Execute phase, not instruction decoding.",
        },
        {
          id: 2,
          text: "C) Memory Address Register (MAR)",
          isCorrect: false,
          reason:
            "Wrong: MAR simply holds the RAM address being read from or written to.",
        },
        {
          id: 3,
          text: "D) Accumulator (ACC)",
          isCorrect: false,
          reason:
            "Wrong: The Accumulator stores intermediate results produced by the ALU.",
        },
      ],
    },
    {
      badge: "Q2 • Engineering C++ & Dynamic Memory",
      question:
        "Which memory region is used for dynamic runtime allocation in C++ and must be explicitly freed to avoid a memory leak?",
      options: [
        {
          id: 0,
          text: "A) Heap Memory",
          isCorrect: true,
          reason:
            "Spot on! Heap memory is dynamically allocated at runtime (using new) and must be manually deallocated (using delete).",
        },
        {
          id: 1,
          text: "B) Stack Memory",
          isCorrect: false,
          reason:
            "Wrong: Stack memory is automatically managed (LIFO) for local function variables and freed when the function exits.",
        },
        {
          id: 2,
          text: "C) Read-Only Memory (ROM)",
          isCorrect: false,
          reason:
            "Wrong: ROM stores permanent system firmware and cannot be dynamically allocated by user programs.",
        },
        {
          id: 3,
          text: "D) Program Counter (PC)",
          isCorrect: false,
          reason:
            "Wrong: PC is a CPU register holding the next instruction address, not a dynamic data segment.",
        },
      ],
    },
    {
      badge: "Q3 • Generative AI & Deep Learning",
      question:
        "When a Generative AI model produces fluent, convincing output that is factually false or fabricated, this phenomenon is known as:",
      options: [
        {
          id: 0,
          text: "A) Hallucination",
          isCorrect: true,
          reason:
            "Correct! AI Hallucination refers to generating plausible-sounding content that contradicts real-world facts.",
        },
        {
          id: 1,
          text: "B) Black-box Problem",
          isCorrect: false,
          reason:
            "Wrong: The Black-box problem refers to the inability to see or explain how a deep neural network reached its decision.",
        },
        {
          id: 2,
          text: "C) Edge Computing",
          isCorrect: false,
          reason:
            "Wrong: Edge computing means processing data locally on the device rather than on cloud servers.",
        },
        {
          id: 3,
          text: "D) Predictive Maintenance",
          isCorrect: false,
          reason:
            "Wrong: Predictive maintenance uses sensor data and AI to forecast equipment failures before they happen.",
        },
      ],
    },
  ],
};

const MINDMAP_UNITS = {
  arabic: [
    {
      id: 0,
      unitName: "الوحدة ١: هندسة النظم والمعالج",
      icon: Cpu,
      nodes: [
        {
          step: "1. معمارية فون نيومان",
          title: "البرنامج المخزن والـ CPU",
          desc: "وحدة الحساب والمنطق ALU + وحدة التحكم CU + السجلات (PC, MAR, MDR, CIR, ACC)",
        },
        {
          step: "2. دورة المعالج FDE",
          title: "Fetch → Decode → Execute",
          desc: "جلب التعليمة من RAM، زيادة PC بمقدار 1، فك الشفرة في CU، والتنفيذ في ALU",
        },
        {
          step: "3. المنطق الرقمي",
          title: "الأنظمة العددية والبوابات",
          desc: "التحويل بين Binary و Hexadecimal + جداول الحقيقة لبوابات AND, OR, NOT, XOR",
        },
        {
          step: "4. الذكاء الاصطناعي",
          title: "ML & Deep Learning",
          desc: "الشبكات العصبية، الذكاء التوليدي، الحوسبة الطرفية Edge، وقانون مور",
        },
      ],
    },
    {
      id: 1,
      unitName: "الوحدة ٢: الأمن السيبراني والتشفير",
      icon: ShieldCheck,
      nodes: [
        {
          step: "1. ثالوث الحماية CIA",
          title: "السرية والتكامل والتوافر",
          desc: "Confidentiality (تشفير) • Integrity (هاش) • Availability (مقاومة DDoS)",
        },
        {
          step: "2. التشفير Cryptography",
          title: "متماثل مقابل غير متماثل",
          desc: "المفتاح العام (Public Key) للتشفير والمفتاح الخاص (Private Key) لفك التشفير",
        },
        {
          step: "3. دوال الهاش والمصادقة",
          title: "Hashing & 2FA",
          desc: "بصمة رقمية وحيدة الاتجاه لكشف أي تلاعب بالبيانات + الشهادات الرقمية SSL",
        },
        {
          step: "4. الدفاع السيبراني",
          title: "Firewalls & Malware",
          desc: "الحماية من الفدية (Ransomware) والتصيد (Phishing) وحقن قواعد البيانات",
        },
      ],
    },
    {
      id: 2,
      unitName: "الوحدة ٣ و ٤: معمارية الويب و CRAP",
      icon: Layers,
      nodes: [
        {
          step: "1. معمارية الويب",
          title: "Three-Tier Architecture",
          desc: "طبقة العرض (Presentation) + طبقة المنطق (Application) + طبقة البيانات (Database)",
        },
        {
          step: "2. البناء الأمامي",
          title: "HTML5 & CSS Box Model",
          desc: "الوسوم الدلالية + حساب العرض الكلي: Width + Padding + Border + Margin",
        },
        {
          step: "3. مبادئ التصميم",
          title: "مبادئ CRAP الأربعة",
          desc: "التباين (Contrast)، التكرار (Repetition)، المحاذاة (Alignment)، والتقارب (Proximity)",
        },
        {
          step: "4. تحليلات الأداء",
          title: "CVR & A/B Testing & PDCA",
          desc: "حساب معدل التحويل CVR ومعدل الارتداد Bounce Rate ودورة التحسين المستمر",
        },
      ],
    },
    {
      id: 3,
      unitName: "الوحدة ٥: برمجة C++ و Big-O",
      icon: Code2,
      nodes: [
        {
          step: "1. أساسيات C++",
          title: "هياكل التحكم والحلقات",
          desc: "المعاملات الحسابية والمنطقية، جمل الشرط if/switch، وحلقات for/while",
        },
        {
          step: "2. المؤشرات Pointers",
          title: "العناوين (&) وفك الإشارة (*)",
          desc: "التعامل المباشر مع عناوين الذاكرة وتمرير المتغيرات بالمرجع (Pass by Reference)",
        },
        {
          step: "3. إدارة الذاكرة",
          title: "Stack vs. Heap Memory",
          desc: "الحجز التلقائي في الـ Stack مقابل الحجز الديناميكي في الـ Heap ومنع Memory Leaks",
        },
        {
          step: "4. التعقيد الخوارزمي",
          title: "Big-O & Binary Search",
          desc: "مقارنة البحث الخطي O(n) بالبحث الثنائي O(log n) في المصفوفات المرتبة",
        },
      ],
    },
  ],
  languages: [
    {
      id: 0,
      unitName: "Unit 1: Systems, CPU & AI",
      icon: Cpu,
      nodes: [
        {
          step: "1. Von Neumann Model",
          title: "Stored-Program & CPU",
          desc: "ALU + Control Unit (CU) + Dedicated Registers (PC, MAR, MDR, CIR, ACC)",
        },
        {
          step: "2. FDE Cycle",
          title: "Fetch → Decode → Execute",
          desc: "Fetch instruction from RAM, auto-increment PC (+1), decode in CU, execute in ALU",
        },
        {
          step: "3. Digital Logic",
          title: "Binary, Hex & Logic Gates",
          desc: "Base conversions + Truth tables for AND, OR, NOT, NAND, XOR gates",
        },
        {
          step: "4. Modern AI & Cloud",
          title: "ML, DL & Edge Computing",
          desc: "Neural networks, Generative AI, Moore's Law, and Cloud vs. Edge processing",
        },
      ],
    },
    {
      id: 1,
      unitName: "Unit 2: Cybersecurity & Crypto",
      icon: ShieldCheck,
      nodes: [
        {
          step: "1. CIA Triad",
          title: "Core Security Pillars",
          desc: "Confidentiality (privacy) • Integrity (anti-tampering) • Availability (uptime)",
        },
        {
          step: "2. Cryptography",
          title: "Symmetric vs. Asymmetric",
          desc: "Public Key encrypts data; Private Key decrypts it securely",
        },
        {
          step: "3. Hashing & Auth",
          title: "One-Way Hash & 2FA",
          desc: "SHA-256 digital fingerprints for integrity + Digital Certificates & MFA",
        },
        {
          step: "4. Cyber Defense",
          title: "Firewalls & Threat Prevention",
          desc: "Defending against Ransomware, Phishing, SQL Injection, and DDoS attacks",
        },
      ],
    },
    {
      id: 2,
      unitName: "Units 3 & 4: Web, CRAP & PDCA",
      icon: Layers,
      nodes: [
        {
          step: "1. Web Architecture",
          title: "Three-Tier & HTTP Codes",
          desc: "Presentation, Application, and Database tiers + HTTP 200, 404, 500 status codes",
        },
        {
          step: "2. Frontend Engineering",
          title: "Semantic HTML5 & Box Model",
          desc: "Total Width = Content Width + Padding + Border + Margin",
        },
        {
          step: "3. UI/UX Design",
          title: "The 4 CRAP Principles",
          desc: "Contrast, Repetition, Alignment, and Proximity for clear visual hierarchy",
        },
        {
          step: "4. Web Analytics",
          title: "CVR, Bounce Rate & PDCA",
          desc: "CVR = (Conversions / Visitors) × 100% + A/B Testing & Plan-Do-Check-Act",
        },
      ],
    },
    {
      id: 3,
      unitName: "Unit 5: C++, Pointers & Big-O",
      icon: Code2,
      nodes: [
        {
          step: "1. C++ Core",
          title: "Control Flow & Functions",
          desc: "Data types, operators, loops, modular functions, and I/O formatting",
        },
        {
          step: "2. Pointers",
          title: "Address (&) & Dereference (*)",
          desc: "Direct hexadecimal memory manipulation and Pass-by-Reference",
        },
        {
          step: "3. Memory Lifecycle",
          title: "Stack vs. Heap Allocation",
          desc: "Automatic LIFO Stack frames vs. dynamic runtime Heap (new / delete)",
        },
        {
          step: "4. Algorithmic Complexity",
          title: "Big-O & Binary Search",
          desc: "Linear Search O(n) vs. Binary Search O(log n) on sorted arrays",
        },
      ],
    },
  ],
};

const tabList = [
  { id: "zatona" as const, labelAr: "كبسولة الزتونة", labelEn: "Quick Capsule", icon: BookmarkCheck },
  { id: "questions" as const, labelAr: "تفسير كل اختيار", labelEn: "Explain Every Option", icon: CheckSquare },
  { id: "mistakes" as const, labelAr: "كشكول غلطاتي", labelEn: "Smart Mistakes Book", icon: RotateCcw },
  { id: "mindmap" as const, labelAr: "الخرائط الذهنية", labelEn: "Curriculum Mind Maps", icon: Network },
];

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"zatona" | "questions" | "mistakes" | "mindmap">("zatona");
  const [track, setTrack] = useState<"arabic" | "languages">("arabic");
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({ "0": true });
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);
  const [selectedDemoOption, setSelectedDemoOption] = useState<number | null>(0);
  const [mistakeRetried, setMistakeRetried] = useState<"idle" | "correct" | "wrong">("idle");
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);

  const isLang = track === "languages";
  const lessons = ZATONA_LESSONS[track];
  const currentLesson = lessons[selectedLessonIdx] || lessons[0];

  const questionsList = DEMO_QUESTIONS_BANK[track];
  const currentQuestion = questionsList[selectedQuestionIdx] || questionsList[0];

  const unitsList = MINDMAP_UNITS[track];
  const currentUnit = unitsList[selectedUnitIdx] || unitsList[0];

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section
      id="demo"
      className="py-20 sm:py-24 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#800B34]/10 border border-[#800B34]/20 text-[#800B34] dark:text-[#FB7185] text-xs font-bold">
            جولة تفاعلية حية من منهج البكالوريا ومسار الهندسة
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
            جرّب بنفسك إزاي الخلاصة بتفكك أصعب الدروس
          </h2>
          <p className="text-base text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            اختار مسارك (بكالوريا عربي أو بكالوريا لغات)، وتنقّل بين كبسولات الشرح الداخلي، الأسئلة التفاعلية، كشكول معالجة الغلطات، والخرائط الذهنية.
          </p>
        </div>

        {/* ── Track Toggle ── */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setTrack("arabic");
              setSelectedDemoOption(0);
              setMistakeRetried("idle");
            }}
            className={`h-11 px-6 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
              track === "arabic"
                ? "bg-[#091B40] text-white border-[#091B40] shadow-xs"
                : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E8E9ED] dark:border-[#334155] hover:border-[#091B40]/40"
            }`}
          >
            بكالوريا عربي (مسار الهندسة)
          </button>
          <button
            type="button"
            onClick={() => {
              setTrack("languages");
              setSelectedDemoOption(0);
              setMistakeRetried("idle");
            }}
            className={`h-11 px-6 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
              track === "languages"
                ? "bg-[#091B40] text-white border-[#091B40] shadow-xs"
                : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E8E9ED] dark:border-[#334155] hover:border-[#091B40]/40"
            }`}
          >
            بكالوريا لغات (Engineering & CS)
          </button>
        </div>

        {/* ── Tab Bar ── */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center justify-center gap-2 min-w-max mx-auto p-1.5 rounded-2xl bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155]">
            {tabList.map(({ id, labelAr, labelEn, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`h-11 px-4 sm:px-5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === id
                    ? "bg-[#800B34] text-white shadow-xs"
                    : "bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.8} />
                <span>{isLang ? labelEn : labelAr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            Tab 1: كبسولة الزتونة — 3 Real Engineering Track Lessons
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "zatona" && (
          <div
            dir={isLang ? "ltr" : "rtl"}
            className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6"
          >
            {/* Lesson Switcher Inside Capsule */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#E8E9ED] dark:border-[#334155]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] ml-2">
                {isLang ? "Select a real lesson topic:" : "اختار موضوع من دروس المنهج:"}
              </span>
              {lessons.map((les, idx) => (
                <button
                  key={les.id}
                  type="button"
                  onClick={() => setSelectedLessonIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedLessonIdx === idx
                      ? "bg-[#800B34] text-white border-[#800B34]"
                      : "bg-[#F7F8FA] dark:bg-[#0F172A] text-[#12263F] dark:text-[#F8FAFC] border-[#E8E9ED] dark:border-[#334155] hover:border-[#800B34]/40"
                  }`}
                >
                  {les.pill}
                </button>
              ))}
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185] block">
                  {currentLesson.pill}
                </span>
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white mt-0.5">
                  {currentLesson.title}
                </h3>
              </div>
              <span className="text-xs font-semibold bg-[#F7F8FA] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] px-3 py-1.5 rounded-lg border border-[#E8E9ED] dark:border-[#334155] shrink-0 flex items-center gap-2 self-start sm:self-auto">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span>{isLang ? "Read time: 3 min" : "زمن المراجعة: ٣ دقائق"}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Concept Box */}
              <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-3">
                <span className="text-xs font-bold text-[#800B34] dark:text-[#FB7185] flex items-center gap-1.5">
                  <Brain className="w-4 h-4" />
                  {isLang ? "The Core Engineering Concept:" : "الخلاصة الهندسية ببساطة:"}
                </span>
                <p className="text-sm text-[#12263F] dark:text-[#F8FAFC] leading-relaxed font-normal">
                  {currentLesson.coreIdea}
                </p>
                <div
                  dir="ltr"
                  className="p-2.5 rounded-lg bg-[#091B40] text-emerald-300 font-mono text-xs text-left overflow-x-auto"
                >
                  {currentLesson.formulaCode}
                </div>
              </div>

              {/* Exam Trap Box */}
              <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#D97706]/40 space-y-3">
                <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  {isLang ? "High-Yield Exam Trap:" : "تكة امتحان تفرق معاك في الدرجات:"}
                </span>
                <p className="text-sm text-[#12263F] dark:text-[#F8FAFC] leading-relaxed font-normal">
                  {currentLesson.examTrap}
                </p>
              </div>
            </div>

            {/* Interactive Pre-exam Checklist */}
            <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-3">
              <span className="text-xs font-bold text-[#059669] dark:text-[#34D399] block">
                {isLang
                  ? "Interactive Mastery Checklist (Tap to mark completed):"
                  : "تشيك ليست إتقان الدرس (دوس على أي نقطة علشان تعلمها):"}
              </span>
              <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm text-[#12263F] dark:text-[#F8FAFC] font-medium">
                {currentLesson.checklist.map((item, idx) => {
                  const key = `${selectedLessonIdx}-${idx}`;
                  const isChecked = !!checkedItems[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleCheck(key)}
                      className={`p-3 rounded-xl border text-start transition-all flex items-center gap-2.5 cursor-pointer ${
                        isChecked
                          ? "bg-[#059669]/10 border-[#059669]/40 text-[#059669] dark:text-[#34D399]"
                          : "bg-white dark:bg-[#1E293B] border-[#E8E9ED] dark:border-[#334155]"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          isChecked ? "text-[#059669]" : "text-[#94A3B8]"
                        }`}
                      />
                      <span className={isChecked ? "line-through opacity-90" : ""}>
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Tab 2: تفسير كل اختيار — 3 Interactive Questions
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "questions" && (
          <div
            dir={isLang ? "ltr" : "rtl"}
            className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6"
          >
            {/* Question Selector */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#E8E9ED] dark:border-[#334155]">
              {questionsList.map((qItem, idx) => (
                <button
                  key={qItem.badge}
                  type="button"
                  onClick={() => {
                    setSelectedQuestionIdx(idx);
                    setSelectedDemoOption(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedQuestionIdx === idx
                      ? "bg-[#800B34] text-white border-[#800B34]"
                      : "bg-[#F7F8FA] dark:bg-[#0F172A] text-[#12263F] dark:text-[#F8FAFC] border-[#E8E9ED] dark:border-[#334155]"
                  }`}
                >
                  {qItem.badge}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185] block">
                {isLang
                  ? "Tap any option to see immediate analytical feedback:"
                  : "دوس على أي اختيار وشوف التفسير العلمي ليه صح أو ليه غلط:"}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#12263F] dark:text-white leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedDemoOption === opt.id;
                let optionStyle =
                  "bg-[#F7F8FA] dark:bg-[#0F172A] border-[#E8E9ED] dark:border-[#334155] hover:border-[#800B34]/40";

                if (selectedDemoOption !== null) {
                  if (opt.isCorrect) {
                    optionStyle = "bg-[#059669]/5 dark:bg-[#059669]/10 border-[#059669]";
                  } else if (isSelected && !opt.isCorrect) {
                    optionStyle = "bg-[#DC2626]/5 dark:bg-[#DC2626]/10 border-[#DC2626]";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedDemoOption(opt.id)}
                    className={`p-4 rounded-xl border text-xs sm:text-sm ${
                      isLang ? "text-left" : "text-right"
                    } transition-colors flex flex-col justify-between space-y-3 cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-bold text-[#12263F] dark:text-white">
                        {opt.text}
                      </span>
                      {selectedDemoOption !== null && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                      )}
                      {selectedDemoOption !== null && isSelected && !opt.isCorrect && (
                        <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                      )}
                    </div>
                    {selectedDemoOption !== null && (
                      <p
                        className={`text-xs leading-relaxed pt-2 border-t border-[#E8E9ED] dark:border-[#334155] ${
                          opt.isCorrect
                            ? "text-[#059669] dark:text-[#34D399] font-medium"
                            : "text-[#DC2626] dark:text-[#F87171] font-normal"
                        }`}
                      >
                        {opt.reason}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Tab 3: كشكول غلطاتي — Interactive Mistake Recovery Simulation
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "mistakes" && (
          <div
            dir={isLang ? "ltr" : "rtl"}
            className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E9ED] dark:border-[#334155] pb-4">
              <div>
                <span className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185] block">
                  {isLang
                    ? "Zero Repeated Mistakes System"
                    : "نظام القضاء على الأخطاء المتكررة"}
                </span>
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  {isLang
                    ? "Smart Mistakes Journal («My Mistakes»)"
                    : "كشكول أخطاءك الذكي («غلطاتي»)"}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    mistakeRetried === "correct"
                      ? "text-[#059669] bg-[#059669]/10 border-[#059669]/20"
                      : "text-[#800B34] dark:text-[#FB7185] bg-[#800B34]/10 border-[#800B34]/20"
                  }`}
                >
                  {mistakeRetried === "correct"
                    ? isLang
                      ? "Mastered & Resolved ✓"
                      : "تم الإتقان بنجاح ✓"
                    : isLang
                    ? "Needs Quick Fix"
                    : "غلطة مسجلة للمراجعة"}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[#64748B]">
                  {isLang
                    ? "Unit 4 • Web Analytics (CVR & PDCA) — Retry this question now:"
                    : "الوحدة ٤ • تحليلات الويب (CVR & PDCA) — صحح غلطتك دلوقتي:"}
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold text-[#12263F] dark:text-white">
                {isLang
                  ? "If an e-commerce platform receives 10,000 visitors and 350 of them complete a purchase, what is the Conversion Rate (CVR)?"
                  : "إذا زار موقعاً إلكترونياً 10,000 زائر، وقام 350 منهم بإتمام عملية الشراء، فما هو معدل التحويل (CVR)؟"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMistakeRetried("correct")}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${
                    mistakeRetried === "correct"
                      ? "bg-[#059669]/10 border-[#059669] text-[#059669] dark:text-[#34D399]"
                      : "bg-white dark:bg-[#1E293B] border-[#E8E9ED] dark:border-[#334155] text-[#12263F] dark:text-white hover:border-[#800B34]"
                  }`}
                >
                  <span>3.5% — (350 ÷ 10,000) × 100%</span>
                  {mistakeRetried === "correct" && <CheckCircle2 className="w-4 h-4 text-[#059669]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setMistakeRetried("wrong")}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${
                    mistakeRetried === "wrong"
                      ? "bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626]"
                      : "bg-white dark:bg-[#1E293B] border-[#E8E9ED] dark:border-[#334155] text-[#12263F] dark:text-white hover:border-[#800B34]"
                  }`}
                >
                  <span>28.5% — (10,000 ÷ 350)</span>
                  {mistakeRetried === "wrong" && <XCircle className="w-4 h-4 text-[#DC2626]" />}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] text-xs text-[#12263F] dark:text-[#F8FAFC] leading-relaxed">
                <span className="font-bold text-[#800B34] dark:text-[#FB7185]">
                  {isLang ? "Formula Reminder: " : "القانون من الزتونة: "}
                </span>
                {isLang
                  ? "CVR = (Number of Conversions / Total Visitors) × 100% = (350 / 10,000) × 100 = 3.5%. Once you answer it right in your Mistakes Journal, it moves to your Mastered list!"
                  : "معدل التحويل CVR = (عدد التحويلات الناجحة ÷ إجمالي الزوار) × 100 = (350 ÷ 10000) × 100 = 3.5%. أول ما تحلها صح بتتنقل لقائمة المتقن!"}
              </div>

              <div className={`flex items-center pt-1 ${isLang ? "justify-start" : "justify-end"}`}>
                <Link
                  href="/mistakes"
                  className="h-10 px-4 rounded-xl bg-[#800B34] text-white text-xs font-bold hover:bg-[#680829] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>
                    {isLang ? "Open your full mistakes book" : "افتح كشكول غلطاتك كامل"}
                  </span>
                  <ArrowLeft className={`w-3.5 h-3.5 ${isLang ? "rotate-180" : ""}`} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Tab 4: الخرائط الذهنية — Interactive 4-Unit Selector
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "mindmap" && (
          <div
            dir={isLang ? "ltr" : "rtl"}
            className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6"
          >
            {/* Unit Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-4 border-b border-[#E8E9ED] dark:border-[#334155]">
              {unitsList.map((u, idx) => {
                const Icon = u.icon;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUnitIdx(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedUnitIdx === idx
                        ? "bg-[#800B34] text-white border-[#800B34]"
                        : "bg-[#F7F8FA] dark:bg-[#0F172A] text-[#12263F] dark:text-[#F8FAFC] border-[#E8E9ED] dark:border-[#334155]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{u.unitName}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {currentUnit.nodes.map((node, i) => (
                <div
                  key={node.step}
                  className={`p-4 rounded-xl bg-white dark:bg-[#1E293B] border ${
                    i === 0
                      ? "border-[#800B34]/40"
                      : i === 3
                      ? "border-[#D97706]/40"
                      : "border-[#E8E9ED] dark:border-[#334155]"
                  } shadow-xs space-y-1.5`}
                >
                  <span className="text-xs font-bold text-[#800B34] dark:text-[#FB7185] block">
                    {node.step}
                  </span>
                  <h4 className="text-sm font-bold text-[#12263F] dark:text-white">
                    {node.title}
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    {node.desc}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal text-center">
              {isLang
                ? "Every lesson includes a visual concept map connecting definitions, laws, and exam traps in one view."
                : "كل درس في مسار الهندسة معاه خريطة ذهنية بتربطلك القوانين والمفاهيم وتكات الامتحان في نظرة واحدة."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
