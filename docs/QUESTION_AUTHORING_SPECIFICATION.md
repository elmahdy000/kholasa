# دليل مواصفات صياغة وتوليد الأسئلة لمنصة «الخلاصة»
# Kholasa Platform Question Authoring & AI Generation Specification

> **Document Purpose:** هذا الملف هو الدليل المرجعي الشامل (Master Prompt & Few-Shot Reference) لتدريب وتوجيه نماذج الذكاء الاصطناعي (مثل ChatGPT, Claude, Gemini) لتوليد وبناء بنوك أسئلة متوافقة 100% مع محرك استيراد وتصنيف منصة «الخلاصة» (Kholasa Document Parser) لمدارس اللغات والمدارس العامة.

---

## 1. القواعد التقنية الصارمة لمحرك المنصة (Engine Invariants)

لكي يقبل محرك المنصة الملف (سواء كان `.docx` أو `.txt` أو لصق مباشر) بدون أي أخطاء أو مراجعات يدوية، يجب الالتزام بالقواعد التالية:

1. **الفاصل بين الأسئلة:** يجب وضع ثلاثة شرطات متتالية `---` في سطر منفصل بعد نهاية كل سؤال.
2. **وسم النوع والصعوبة في السطر الأول:**
   - النوع: `[MCQ]` أو `[TRUE_FALSE]` أو `[ESSAY]`.
   - الصعوبة: `[EASY]` أو `[MEDIUM]` أو `[HARD]`.
   - مثال: `[MCQ] [MEDIUM]`
3. **بداية نص السؤال:**
   - يبدأ بـ `Q1:`, `Q2:`, `Question 1:`, أو `س1:`, `س2:`.
4. **تحديد الإجابة الصحيحة (للاختياري والصح/خطأ):**
   - وضع علامة النجمة `*` بجانب الحرف الصحيح مباشرة: `*A)` أو `A)*` (وفي العربي `*أ)` أو `أ)*`).
   - إضافة سطر صريح: `Answer: A` أو `الإجابة: أ`.
5. **الترجمة الفورية (Translation Engine):**
   - إضافة سطر `Translation:` فيه الترجمة العربية لنص السؤال (ضروري جداً لمواد اللغات لتفعيل زرار الترجمة اللحظي للطالب).
   - في الأسئلة المقالية، يُضاف أيضاً `Model Answer Translation:`.
6. **التفسير التعليمي (Explanation):**
   - سطر `Explanation:` يشرح للطالب لماذا هذه الإجابة صحيحة ولماذا البدائل الأخرى خاطئة.
7. **المفهوم التعليمي (Concept):**
   - سطر `Concept:` يحدد المفهوم البرمجي أو العلمي لربطه بخريطة إتقان الطالب (Student Mastery Map).
8. **معايير جودة المشتتات (Distractors Quality):**
   - لا تضع إجابات هزلية أو ساذجة.
   - يجب أن تكون كل الاختيارات الأربعة متقاربة في الطول والأسلوب النحوي لمنع الغش البديهي.

---

## 2. الأنواع والنماذج الاسترشادية (Few-Shot Archetypes)

### النوع 1: اختيار من متعدد - نظري ومفاهيمي (MCQ - Conceptual)

```text
[MCQ] [EASY]
Q1: Which component is responsible for executing arithmetic and logical instructions in a computer system?
Translation: ما هي الوحدة المسؤولة عن معالجة وتنفيذ العمليات الحسابية والمنطقية في الحاسوب؟
*A) Central Processing Unit (CPU)
B) Solid State Drive (SSD)
C) Random Access Memory (RAM)
D) Graphics Processing Unit (GPU)
Answer: A
Explanation: The CPU contains the Arithmetic Logic Unit (ALU), which directly performs all basic arithmetic and logical comparisons. Secondary storage devices (SSD) and memory (RAM) only store data.
Concept: Computer Architecture & CPU Functionality
---
```

---

### النوع 2: اختيار من متعدد - تتبع كود ومخرجات (MCQ - Code Tracing & Output)

```text
[MCQ] [MEDIUM]
Q2: What is the output of the following Python code snippet?
```python
numbers = [10, 20, 30]
alias = numbers
alias.append(40)
print(len(numbers))
```
Translation: ما هي مخرجات مقطع كود بايثون التالي؟
A) 3
*B) 4
C) 5
D) TypeError: Cannot modify referenced list
Answer: B
Explanation: In Python, assigning an existing list to a new variable (`alias = numbers`) creates a shared reference to the same memory address, not a clone. Appending to `alias` mutates `numbers`, so its length becomes 4.
Concept: Mutable Objects & Memory References in Python
---
```

---

### النوع 3: اختيار من متعدد - تحليل أخطاء وسيناريوهات (MCQ - Problem Solving & Debugging)

```text
[MCQ] [HARD]
Q3: Consider the following recursive Python function designed to calculate the factorial of a positive integer n:
```python
def factorial(n):
    if n == 1:
        return 1
    return n * factorial(n)
```
What issue will occur when calling `factorial(4)`?
Translation: بالنظر إلى دالة بايثون التكرارية (Recursive) التالية والمخصصة لحساب مضروب عدد صحيح موجب n: ما المشكلة التي ستحدث عند استدعاء الدالة بالقيمة 4؟
A) It returns 0 due to an off-by-one boundary error
B) It raises a TypeError because integers cannot multiply functions
*C) It triggers a RecursionError due to an infinite recursive loop
D) It successfully calculates and returns 24
Answer: C
Explanation: The recursive call inside the return statement passes `n` instead of decrementing it (`n - 1`). As a result, `n` never reaches the base case `n == 1`, exhausting the call stack and causing a `RecursionError: maximum recursion depth exceeded`.
Concept: Recursion & Stack Overflow Prevention
---
```

---

### النوع 4: صح أو خطأ - مفاهيمي (TRUE_FALSE - Conceptual)

```text
[TRUE_FALSE] [EASY]
Q4: In object-oriented programming, a class is an instance of an object.
Translation: في البرمجة كائنية التوجه (OOP)، الكلاس (Class) يُعد نسخة (Instance) من الكائن (Object).
A) True
*B) False
Answer: B
Explanation: The statement is inverted. An object is an instance created from a class, whereas a class acts as the blueprint or template defining attributes and behaviors.
Concept: Object-Oriented Programming (OOP) Principles
---
```

---

### النوع 5: صح أو خطأ - برمجي وقواعد بناء الكود (TRUE_FALSE - Syntax & Logic)

```text
[TRUE_FALSE] [MEDIUM]
Q5: In Python, tuples are immutable data structures, meaning their elements cannot be modified, added, or removed after creation.
Translation: في لغة بايثون، تعتبر الصفوف (Tuples) هياكل بيانات غير قابلة للتعديل (Immutable)، مما يعني أنه لا يمكن تعديل عناصرها أو إضافتها أو حذفها بعد إنشائها.
*A) True
B) False
Answer: A
Explanation: Tuples in Python are strictly immutable once declared. To modify a collection dynamically, lists (`list`) should be used instead.
Concept: Python Data Structures & Immutability
---
```

---

### النوع 6: مقالي - شرح ومقارنة معمارية (ESSAY - Architectural & Conceptual)

```text
[ESSAY] [MEDIUM]
Q6: Explain the difference between Linear Search and Binary Search in terms of data prerequisites and time complexity.

Translation: وضح الفرق بين خوارزمية البحث الخطي (Linear Search) والبحث الثنائي (Binary Search) من حيث المتطلبات المسبقة للبيانات والتعقيد الزمني (Time Complexity).

Model Answer:
1. Data Prerequisites:
- Linear Search: Does not require data to be sorted; works on arbitrary sequences.
- Binary Search: Strictly requires the dataset or array to be sorted in ascending or descending order beforehand.

2. Time Complexity:
- Linear Search: Worst-case complexity is O(N) because it inspects elements sequentially one by one.
- Binary Search: Worst-case complexity is O(log N) because it repeatedly divides the search space in half.

Model Answer Translation:
1. المتطلبات المسبقة للبيانات:
- البحث الخطي: لا يشترط ترتيب البيانات مسبقاً، ويعمل على أي تسلسل.
- البحث الثنائي: يشترط بدقة أن تكون المصفوفة أو البيانات مرتبة تصاعدياً أو تنازلياً.

2. التعقيد الزمني (Time Complexity):
- البحث الخطي: تعقيد أسوأ حالة هو O(N) لأنه يفحص كل عنصر على حدة.
- البحث الثنائي: تعقيد أسوأ حالة هو O(log N) لأنه يقسم نطاق البحث إلى النصف في كل خطوة.

Explanation: High-scoring answers must highlight the sorting requirement for binary search and contrast O(N) with O(log N).
Concept: Search Algorithms & Big-O Analysis
---
```

---

### النوع 7: مقالي - كتابة كود وتطبيقي (ESSAY - Code Implementation)

```text
[ESSAY] [HARD]
Q7: Write a clean Python function named `find_first_duplicate(items)` that takes a list of integers and returns the first number that appears more than once. If no duplicate exists, it should return `None`. Achieve this in O(N) time complexity.

Translation: اكتب دالة بلغة بايثون باسم `find_first_duplicate(items)` تأخذ قائمة من الأرقام الصحيحة وتُرجع أول رقم يظهر أكثر من مرة. إذا لم توجد أرقام مكررة تُرجع الدالة `None`. يجب أن تعمل الدالة بتعقيد زمني O(N).

Model Answer:
def find_first_duplicate(items: list[int]) -> int | None:
    seen = set()
    for item in items:
        if item in seen:
            return item
        seen.add(item)
    return None

Model Answer Translation:
كود بايثون المعياري:
1. إنشاء مجموعة فارغة `seen = set()` للبحث والتحقق في زمن ثابت O(1).
2. المرور التكراري على القائمة وفحص ما إذا كان العنصر موجوداً مسبقاً في المجموعة.
3. إرجاع أول عنصر متكرر فور اكتشافه، أو إرجاع `None` عند انتهاء القائمة بدون تكرار.

Explanation: Using a hash set guarantees O(1) average lookup time, achieving an overall O(N) linear time complexity instead of an inefficient nested loop of O(N^2).
Concept: Set Data Structure & Algorithmic Optimization
---
```

---

### النوع 8: أسئلة المناهج باللغة العربية (Arabic Curriculum Format)

```text
[MCQ] [MEDIUM]
س8: في شبكات الحاسوب، أي البروتوكولات التالية يعمل في طبقة التطبيقات (Application Layer) ويقوم بنقل وتصفح صفحات الويب بشكل مشفر وآمن؟
*أ) HTTPS
ب) FTP
ج) UDP
د) IP
الإجابة: أ
التفسير: بروتوكول HTTPS يعتمد على التشفير باستخدام SSL/TLS لتأمين اتصال المتصفح مع خوادم الويب في طبقة التطبيقات، بينما FTP لنقل الملفات بدون تشفير، و UDP في طبقة النقل، و IP في طبقة الشبكة.
المفهوم: بروتوكولات شبكات الحاسوب وتأمين الويب
---
```

---

## 3. البرومبت الشامل للنسخ واللصق في ChatGPT / Claude / Gemini

انسخ الكود أدناه بالكامل وضعه في محادثة الذكاء الاصطناعي مع ملء البيانات بين الأقواس المربعة `[...]`:

```text
You are an expert curriculum designer and senior assessment author for Egyptian Secondary Education & Baccalaureate standards.

Your task is to generate a comprehensive, high-quality question bank for the Kholasa e-learning platform.

Subject: [مثال: Computer Science / Programming / Information Technology]
Category: [LANGUAGES (English curriculum) أو ARABIC (مدارس عربي)]
Grade / System: [مثال: Grade 10 / الثانوية العامة / البكالوريا]
Unit / Lesson Name: [اكتب هنا اسم الوحدة أو الدرس، مثلاً: Data Structures and Python Dictionaries]
Target Number of Questions: [مثال: 20 questions]
Difficulty Distribution: 30% EASY, 50% MEDIUM, 20% HARD.

FORMATTING REQUIREMENTS (CRITICAL FOR PLATFORM PARSER):
1. Every single question must start with its exact tags on the first line:
   - Type tag: [MCQ], [TRUE_FALSE], or [ESSAY]
   - Difficulty tag: [EASY], [MEDIUM], or [HARD]
2. Question numbering format: Q1:, Q2:, Q3: (or س1: for Arabic).
3. Code snippets must be neatly placed within the question body.
4. For LANGUAGES subjects:
   - Provide the question statement in English.
   - Include an accurate Arabic translation line: "Translation: [Arabic text]".
   - For MCQ: provide 4 distinct choices A), B), C), D). Mark the correct choice with an asterisk (*) next to the letter (e.g. *B) or B)*) AND provide an explicit line "Answer: B".
   - For TRUE_FALSE: provide A) True, B) False with the correct option starred, and "Answer: True" (or False).
   - For ESSAY: provide "Model Answer:" with structured points or code, and "Model Answer Translation:".
   - Include "Explanation:" with clear pedagogical rationale explaining why the correct choice is right and other choices are wrong.
   - Include "Concept:" naming the specific educational concept tested.
5. End EVERY single question with a line containing three dashes: "---".
6. Distractors (wrong answers) must be realistic, plausible, and grammatically parallel to the correct answer.
7. Output the raw formatted text directly without enclosing the entire response in a top-level markdown wrapper so it can be copied directly into Microsoft Word (.docx) or pasted into the importer.
```

