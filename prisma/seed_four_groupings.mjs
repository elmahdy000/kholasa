import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import nextEnv from "@next/env";
import { baccG10Subject } from "./data/bacc_g10_curriculum.mjs";

nextEnv.loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting 4 Primary Curriculum Groupings Seeder...");

  // 1. Find Educational System & Grades
  const baccalaureate = await prisma.educationalSystem.findFirst({
    where: { code: "baccalaureate" },
    include: {
      grades: {
        include: { tracks: true }
      }
    }
  });

  if (!baccalaureate) {
    throw new Error("Educational system 'baccalaureate' not found.");
  }

  const g10 = baccalaureate.grades.find(g => g.code === "bacc_g10");
  const g11 = baccalaureate.grades.find(g => g.code === "bacc_g11");

  if (!g10 || !g11) {
    throw new Error("Grades bacc_g10 or bacc_g11 not found.");
  }

  const g11EngTrack = g11.tracks.find(t => t.code === "engineering_track");

  console.log(`Found G10: ${g10.name} (${g10.id})`);
  console.log(`Found G11: ${g11.name} (${g11.id})`);

  // =========================================================================
  // GROUPING 1: أولى بكالوريا — عربي (G10 Arabic Schools)
  // =========================================================================
  console.log("\n📚 Seeding Grouping 1: أولى بكالوريا — عربي...");
  let g10ArSubject = await prisma.subject.findFirst({
    where: {
      gradeId: g10.id,
      schoolCategory: "ARABIC",
      code: "g10_programming_ai_ar"
    }
  });

  if (!g10ArSubject) {
    // Check if g10_programming_ai exists without suffix
    g10ArSubject = await prisma.subject.findFirst({
      where: { gradeId: g10.id, code: "g10_programming_ai" }
    });
  }

  if (!g10ArSubject) {
    g10ArSubject = await prisma.subject.create({
      data: {
        name: "البرمجة والتفكير الحاسوبي والذكاء الاصطناعي",
        code: "g10_programming_ai_ar",
        icon: "Code",
        color: "#6858EA",
        description: "المنهج الرسمي المعتمد لوزارة التربية والتعليم لمدارس عربي: أساسيات البيانات والمعلومات، أركان التفكير الحاسوبي، مبادئ البرمجة، وأسس الذكاء الاصطناعي.",
        systemId: baccalaureate.id,
        gradeId: g10.id,
        schoolCategory: "ARABIC",
        order: 1,
        isPublished: true,
      }
    });

    // Seed units & lessons for G10 Arabic from baccG10Subject data
    for (const unitData of baccG10Subject.units) {
      const createdUnit = await prisma.unit.create({
        data: {
          title: unitData.title,
          order: unitData.order,
          description: unitData.description,
          subjectId: g10ArSubject.id,
          isPublished: true,
        }
      });

      for (const lessonData of unitData.lessons) {
        const createdLesson = await prisma.lesson.create({
          data: {
            title: lessonData.title,
            order: lessonData.order,
            unitId: createdUnit.id,
            durationMinutes: lessonData.durationMinutes || 15,
            isPublished: true,
          }
        });

        await prisma.lessonContent.create({
          data: {
            lessonId: createdLesson.id,
            objectives: lessonData.objectives || [],
            body: lessonData.body,
          }
        });

        if (lessonData.questions && lessonData.questions.length > 0) {
          for (const q of lessonData.questions) {
            await prisma.question.create({
              data: {
                statement: q.statement,
                type: q.type,
                difficulty: q.difficulty,
                status: "PUBLISHED",
                schoolCategory: "ARABIC",
                subjectId: g10ArSubject.id,
                unitId: createdUnit.id,
                lessons: {
                  create: { lessonId: createdLesson.id }
                },
                options: {
                  create: (q.options || []).map((opt, idx) => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    order: idx + 1,
                    explanation: opt.explanation || null,
                  }))
                },
                ...(q.explanation ? {
                  explanation: {
                    create: {
                      concept: q.explanation.concept,
                      correctReason: q.explanation.correctReason,
                    }
                  }
                } : {}),
                ...(q.rubric ? {
                  rubric: {
                    create: {
                      maxScore: q.rubric.maxScore,
                      modelAnswer: q.rubric.modelAnswer,
                      criteria: q.rubric.criteria || [],
                    }
                  }
                } : {})
              }
            });
          }
        }
      }
    }
    console.log(`✅ Seeded G10 Arabic Subject: ${g10ArSubject.name}`);
  } else {
    // Ensure schoolCategory is ARABIC
    if (g10ArSubject.schoolCategory !== "ARABIC") {
      await prisma.subject.update({
        where: { id: g10ArSubject.id },
        data: { schoolCategory: "ARABIC" }
      });
    }
    console.log(`ℹ️ G10 Arabic Subject exists: ${g10ArSubject.name}`);
  }

  // =========================================================================
  // GROUPING 2: أولى بكالوريا — لغات (G10 Language Schools)
  // =========================================================================
  console.log("\n📚 Seeding Grouping 2: أولى بكالوريا — لغات...");
  let g10EnSubject = await prisma.subject.findFirst({
    where: {
      gradeId: g10.id,
      schoolCategory: "LANGUAGES",
      code: "g10_programming_ai_en"
    }
  });

  if (!g10EnSubject) {
    g10EnSubject = await prisma.subject.create({
      data: {
        name: "Programming, Computational Thinking & AI",
        code: "g10_programming_ai_en",
        icon: "Code",
        color: "#0284C7",
        description: "Official Egyptian Baccalaureate curriculum for Language Schools: Data Fundamentals, Computational Thinking, Python Programming, and Machine Learning.",
        systemId: baccalaureate.id,
        gradeId: g10.id,
        schoolCategory: "LANGUAGES",
        order: 2,
        isPublished: true,
      }
    });

    // Seed English units & lessons
    const enUnits = [
      {
        title: "Unit 1: Fundamentals of Data, Information and Digital Media",
        order: 1,
        description: "Data vs Information, Binary System, Character Encoding, and Digital Citizenship.",
        lessons: [
          {
            title: "1. Data, Information and Binary Representation",
            order: 1,
            durationMinutes: 18,
            objectives: [
              "Distinguish scientifically between raw Data, processed Information, and Knowledge.",
              "Understand the Binary System and how computers represent numbers and characters using bits and bytes.",
              "Explore standard encoding schemes including ASCII and Unicode."
            ],
            body: `## 1. Data vs. Information\n\nIn computer science:\n- **Data**: Raw, unprocessed facts and figures (e.g., numbers, sensor readings: 25, 18).\n- **Processing**: Logical and arithmetic operations performed by the CPU.\n- **Information**: Processed data endowed with meaning, purpose, and context (e.g., Average score = 85%).\n\n## 2. Binary System\nComputers operate using digital electronic circuits represented by two distinct states: **ON (1)** or **OFF (0)**.`,
            questions: [
              {
                statement: "What is the smallest unit of digital data in computer science, holding a value of either 0 or 1?",
                type: "MCQ",
                difficulty: "EASY",
                options: [
                  { text: "Bit (Binary Digit)", isCorrect: true, explanation: "A bit is the fundamental unit of data in binary computation." },
                  { text: "Byte (8 Bits)", isCorrect: false, explanation: "A byte consists of 8 individual bits." },
                  { text: "Kilobyte (KB)", isCorrect: false, explanation: "A kilobyte is 1024 bytes." },
                  { text: "Megahertz (MHz)", isCorrect: false, explanation: "Megahertz measures clock frequency, not data capacity." },
                ],
                explanation: {
                  concept: "Binary Representation",
                  correctReason: "A bit (short for binary digit) is the smallest possible unit of data, storing either 0 or 1."
                }
              },
              {
                statement: "ASCII encoding supports all global languages including Arabic and hieroglyphs natively in standard 7-bit format.",
                type: "TRUE_FALSE",
                difficulty: "MEDIUM",
                options: [
                  { text: "True", isCorrect: false, explanation: "ASCII is restricted to English and basic Latin symbols." },
                  { text: "False", isCorrect: true, explanation: "Unicode was developed specifically to encode all world languages." },
                ],
                explanation: {
                  concept: "Character Encoding",
                  correctReason: "ASCII was designed for English characters (128 characters). Unicode was created to represent symbols from all languages."
                }
              },
              {
                statement: "Differentiate clearly between raw Data and processed Information, giving one concrete example in educational software.",
                type: "ESSAY",
                difficulty: "MEDIUM",
                rubric: {
                  maxScore: 10,
                  modelAnswer: "Data consists of isolated, unorganized facts without inherent context (e.g., student exam mark '18'). Information is the result of processing, structuring, and analyzing that data to provide meaningful context (e.g., 'Student scored 90% and achieved top rank in Mathematics')."
                }
              }
            ]
          },
          {
            title: "2. Computational Thinking Pillars & Algorithm Design",
            order: 2,
            durationMinutes: 20,
            objectives: [
              "Master the four core pillars of computational thinking.",
              "Formulate step-by-step algorithms using pseudocode and flowcharts."
            ],
            body: `## The Four Pillars of Computational Thinking\n\n1. **Decomposition**: Breaking down a complex problem into smaller parts.\n2. **Pattern Recognition**: Identifying common similarities or trends.\n3. **Abstraction**: Focusing strictly on essential details while filtering out irrelevancies.\n4. **Algorithm Design**: Developing step-by-step instructions to solve the problem.`,
            questions: [
              {
                statement: "Breaking down a large, complicated problem into smaller and more manageable sub-problems is called:",
                type: "MCQ",
                difficulty: "EASY",
                options: [
                  { text: "Decomposition", isCorrect: true },
                  { text: "Abstraction", isCorrect: false },
                  { text: "Pattern Recognition", isCorrect: false },
                  { text: "Generalization", isCorrect: false }
                ],
                explanation: {
                  concept: "Computational Thinking",
                  correctReason: "Decomposition is the process of breaking down a complex problem or system into smaller parts that are easier to understand, program, and maintain."
                }
              },
              {
                statement: "In algorithm design, 'Finiteness' means the algorithm must eventually terminate after a countable number of execution steps.",
                type: "TRUE_FALSE",
                difficulty: "EASY",
                options: [
                  { text: "True", isCorrect: true },
                  { text: "False", isCorrect: false }
                ],
                explanation: {
                  concept: "Algorithm Properties",
                  correctReason: "Every valid algorithm must terminate after a finite number of steps and produce an output."
                }
              }
            ]
          }
        ]
      }
    ];

    for (const u of enUnits) {
      const createdUnit = await prisma.unit.create({
        data: {
          title: u.title,
          order: u.order,
          description: u.description,
          subjectId: g10EnSubject.id,
          isPublished: true,
        }
      });

      for (const l of u.lessons) {
        const createdLesson = await prisma.lesson.create({
          data: {
            title: l.title,
            order: l.order,
            unitId: createdUnit.id,
            durationMinutes: l.durationMinutes,
            isPublished: true,
          }
        });

        await prisma.lessonContent.create({
          data: {
            lessonId: createdLesson.id,
            objectives: l.objectives,
            body: l.body,
          }
        });

        for (const q of l.questions) {
          await prisma.question.create({
            data: {
              statement: q.statement,
              type: q.type,
              difficulty: q.difficulty,
              status: "PUBLISHED",
              schoolCategory: "LANGUAGES",
              subjectId: g10EnSubject.id,
              unitId: createdUnit.id,
              lessons: {
                create: { lessonId: createdLesson.id }
              },
              options: {
                create: (q.options || []).map((opt, idx) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                  order: idx + 1,
                  explanation: opt.explanation || null,
                }))
              },
              ...(q.explanation ? {
                explanation: {
                  create: {
                    concept: q.explanation.concept,
                    correctReason: q.explanation.correctReason,
                  }
                }
              } : {}),
              ...(q.rubric ? {
                rubric: {
                  create: {
                    maxScore: q.rubric.maxScore,
                    modelAnswer: q.rubric.modelAnswer,
                  }
                }
              } : {})
            }
          });
        }
      }
    }
    console.log(`✅ Seeded G10 Language Subject: ${g10EnSubject.name}`);
  } else {
    console.log(`ℹ️ G10 Language Subject exists: ${g10EnSubject.name}`);
  }

  // =========================================================================
  // GROUPING 3: تانية بكالوريا — عربي (G11 Arabic Schools)
  // =========================================================================
  console.log("\n📚 Seeding Grouping 3: تانية بكالوريا — عربي...");
  let g11ArSubject = await prisma.subject.findFirst({
    where: {
      gradeId: g11.id,
      schoolCategory: "ARABIC",
      code: "g11_cs_engineering"
    }
  });

  if (g11ArSubject) {
    // Ensure schoolCategory and questions are updated to ARABIC
    await prisma.subject.update({
      where: { id: g11ArSubject.id },
      data: { schoolCategory: "ARABIC" }
    });
    await prisma.question.updateMany({
      where: { subjectId: g11ArSubject.id },
      data: { schoolCategory: "ARABIC" }
    });
    console.log(`✅ Verified G11 Arabic Subject: ${g11ArSubject.name}`);
  } else {
    console.log(`⚠️ G11 Arabic Subject not found. Creating placeholder...`);
    g11ArSubject = await prisma.subject.create({
      data: {
        name: "البرمجة وعلوم الحاسب (مسار الهندسة)",
        code: "g11_cs_engineering",
        icon: "Cpu",
        color: "#2563EB",
        description: "منهج تانية بكالوريا - مسار الهندسة والحاسب لمدارس عربي: البرمجة المتقدمة، الخوارزميات وهياكل البيانات، والبرمجة الشيئية.",
        systemId: baccalaureate.id,
        gradeId: g11.id,
        trackId: g11EngTrack?.id || null,
        schoolCategory: "ARABIC",
        order: 1,
        isPublished: true,
      }
    });
  }

  // =========================================================================
  // GROUPING 4: تانية بكالوريا — لغات (G11 Language Schools)
  // =========================================================================
  console.log("\n📚 Seeding Grouping 4: تانية بكالوريا — لغات...");
  let g11EnSubject = await prisma.subject.findFirst({
    where: {
      gradeId: g11.id,
      schoolCategory: "LANGUAGES",
      code: "g11_cs_engineering_en"
    }
  });

  if (!g11EnSubject) {
    g11EnSubject = await prisma.subject.create({
      data: {
        name: "Computer Science & Engineering Programming",
        code: "g11_cs_engineering_en",
        icon: "Cpu",
        color: "#4F46E5",
        description: "Second Year Egyptian Baccalaureate curriculum for Language Schools (Engineering & CS Track): Advanced Systems, Data Structures, OOP Architecture, and Dynamic Memory.",
        systemId: baccalaureate.id,
        gradeId: g11.id,
        trackId: g11EngTrack?.id || null,
        schoolCategory: "LANGUAGES",
        order: 2,
        isPublished: true,
      }
    });

    const g11EnUnits = [
      {
        title: "Unit 1: Computer Systems & Architecture",
        order: 1,
        description: "Memory Management, Hardware Abstraction, and Data Structures.",
        lessons: [
          {
            title: "1. Memory Addresses and Data Structures",
            order: 1,
            durationMinutes: 25,
            objectives: [
              "Understand physical computer memory addressing in hexadecimal.",
              "Differentiate between stack and heap memory allocation.",
              "Master safe dynamic allocation and deallocation."
            ],
            body: `## Memory Architecture in Engineering Computing\n\nEach byte in computer memory has a unique numerical address.\n- Stack memory: Automatic allocation and fast execution.\n- Heap memory: Dynamic allocation managed at runtime.`,
            questions: [
              {
                statement: "Which area of computer memory is used for dynamic memory allocation during program execution?",
                type: "MCQ",
                difficulty: "EASY",
                options: [
                  { text: "Heap memory", isCorrect: true, explanation: "Heap memory is dynamically allocated and managed during runtime." },
                  { text: "Stack memory", isCorrect: false, explanation: "Stack memory is statically reserved for function call frames." },
                  { text: "ROM", isCorrect: false, explanation: "ROM is read-only memory." },
                  { text: "Cache L1", isCorrect: false, explanation: "Cache L1 is high-speed CPU cache, not software-allocated memory." }
                ],
                explanation: {
                  concept: "Memory Architecture",
                  correctReason: "Dynamic memory allocation at runtime occurs on the heap."
                }
              },
              {
                statement: "Failing to release dynamically allocated heap memory with delete results in a memory leak.",
                type: "TRUE_FALSE",
                difficulty: "EASY",
                options: [
                  { text: "True", isCorrect: true },
                  { text: "False", isCorrect: false }
                ],
                explanation: {
                  concept: "Dynamic Memory Management",
                  correctReason: "Memory allocated with new on the heap remains occupied until explicitly freed using delete."
                }
              },
              {
                statement: "Explain the fundamental performance and lifecycle differences between Stack memory and Heap memory in high-performance computing.",
                type: "ESSAY",
                difficulty: "HARD",
                rubric: {
                  maxScore: 10,
                  modelAnswer: "Stack memory is fast and automatically managed using LIFO allocation for local variables. Memory is freed automatically upon function return. Heap memory allows dynamic, runtime variable allocation of flexible size, but incurs slower access overhead and must be manually managed by the programmer using delete/free to prevent memory leaks."
                }
              }
            ]
          }
        ]
      }
    ];

    for (const u of g11EnUnits) {
      const createdUnit = await prisma.unit.create({
        data: {
          title: u.title,
          order: u.order,
          description: u.description,
          subjectId: g11EnSubject.id,
          isPublished: true,
        }
      });

      for (const l of u.lessons) {
        const createdLesson = await prisma.lesson.create({
          data: {
            title: l.title,
            order: l.order,
            unitId: createdUnit.id,
            durationMinutes: l.durationMinutes,
            isPublished: true,
          }
        });

        await prisma.lessonContent.create({
          data: {
            lessonId: createdLesson.id,
            objectives: l.objectives,
            body: l.body,
          }
        });

        for (const q of l.questions) {
          await prisma.question.create({
            data: {
              statement: q.statement,
              type: q.type,
              difficulty: q.difficulty,
              status: "PUBLISHED",
              schoolCategory: "LANGUAGES",
              subjectId: g11EnSubject.id,
              unitId: createdUnit.id,
              lessons: {
                create: { lessonId: createdLesson.id }
              },
              options: {
                create: (q.options || []).map((opt, idx) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                  order: idx + 1,
                  explanation: opt.explanation || null,
                }))
              },
              ...(q.explanation ? {
                explanation: {
                  create: {
                    concept: q.explanation.concept,
                    correctReason: q.explanation.correctReason,
                  }
                }
              } : {}),
              ...(q.rubric ? {
                rubric: {
                  create: {
                    maxScore: q.rubric.maxScore,
                    modelAnswer: q.rubric.modelAnswer,
                  }
                }
              } : {})
            }
          });
        }
      }
    }
    console.log(`✅ Seeded G11 Language Subject: ${g11EnSubject.name}`);
  } else {
    console.log(`ℹ️ G11 Language Subject exists: ${g11EnSubject.name}`);
  }

  // =========================================================================
  // DEMO STUDENT ACCOUNTS FOR ALL 4 GROUPINGS
  // =========================================================================
  console.log("\n👤 Ensuring Demo Student Accounts for all 4 groupings...");
  const hashedPassword = await bcrypt.hash("Student123!", 10);

  const demoAccounts = [
    {
      email: "student.g10.ar@kholasa.app",
      name: "زياد أحمد (أولى بكالوريا - عربي)",
      gradeId: g10.id,
      schoolCategory: "ARABIC",
      trackId: null,
    },
    {
      email: "student.g10.en@kholasa.app",
      name: "Omar Tarek (G10 - Language Schools)",
      gradeId: g10.id,
      schoolCategory: "LANGUAGES",
      trackId: null,
    },
    {
      email: "student@kholasa.app",
      name: "يوسف المهدي (تانية بكالوريا - عربي)",
      gradeId: g11.id,
      schoolCategory: "ARABIC",
      trackId: g11EngTrack?.id || null,
    },
    {
      email: "student.g11.en@kholasa.app",
      name: "Kareem Fathy (G11 - Language Schools)",
      gradeId: g11.id,
      schoolCategory: "LANGUAGES",
      trackId: g11EngTrack?.id || null,
    },
  ];

  for (const acc of demoAccounts) {
    const existing = await prisma.user.findUnique({ where: { email: acc.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: acc.email,
          name: acc.name,
          password: hashedPassword,
          role: "STUDENT",
          systemId: baccalaureate.id,
          gradeId: acc.gradeId,
          schoolCategory: acc.schoolCategory,
          trackId: acc.trackId,
        }
      });
      console.log(`✅ Created student account: ${acc.email} (${acc.schoolCategory})`);
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          gradeId: acc.gradeId,
          schoolCategory: acc.schoolCategory,
          trackId: acc.trackId,
        }
      });
      console.log(`ℹ️ Updated student account: ${acc.email} (${acc.schoolCategory})`);
    }
  }

  console.log("\n🎉 All 4 primary curriculum groupings seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
