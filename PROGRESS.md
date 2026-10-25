# سجل تقدم التنفيذ | PROGRESS.md

## 1. الحالة العامة ونقطة التحقق الأخيرة (Current State & Last Verified Checkpoint)

- **حالة النظام:** التطبيق يعمل، وجميع الشرائح العمودية (Vertical Slices) للطلاب والإداريين مكتملة. اكتملت جولة تدقيق شامل (P0–P3) للأمان وسلامة الامتحانات والمعمارية وتجربة الاستخدام ونظام التصميم والصفحات القانونية.
- **آخر نقطة تحقق مؤكدة (Last Verified Checkpoint):** 
  - تاريخ: 2026-10-22
  - الحالة: تعديلات غير مُودعة في شجرة عمل نظيفة الوظائف (بدون Commit)، وفق طلب المستخدم.
  - التحقق التقني المنفذ فعلياً:
    - `tsc --noEmit`: 0 أخطاء.
    - Vitest: 6 ملفات، 24 اختباراً ناجحاً.
    - ESLint: 0 أخطاء و274 تحذيراً (تحذيرات أنواع/متغيرات غير معطِّلة).
    - `next build`: ناجح، 59 مساراً.
    - فحص تشغيل الإنتاج على المنفذ 3100: الصفحات العامة 200، ومسارات API المحمية 401/403، ورؤوس الأمان وCSP موجودة، و`/dashboard` و`/leaderboard` تعيدان الزائر غير المسجل إلى `/login`.
    - فحص بصري فعلي عبر Chrome بأحجام 390 و768 و1440: لا يوجد تجاوز أفقي (0px) في الصفحة الرئيسية وتسجيل الدخول وسياسة الخصوصية وشروط الاستخدام، مع التحقق من الوضعين الفاتح والليلي.
    - اختبار حارس الـ Seed: يرفض التشغيل قبل الاتصال بقاعدة البيانات عند غياب `SEED_ADMIN_PASSWORD`.

---

## 2. جدول إنجاز الصفحات والمسارات (Completed Pages & Routes)

| م | الصفحة / المسار | ملف المكون الأساسي | حالة الإنجاز | ملاحظات التحقق |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **الصفحة الرئيسية (Landing Page)** (`/`) | [`src/app/page.tsx`](src/app/page.tsx), [`LandingInteractiveClient.tsx`](src/components/landing/LandingInteractiveClient.tsx) | مكتمل 100% | استعراض مميزات المنصة وتجربة تفاعلية وبطاقات تقديمية |
| 2 | **تسجيل الدخول (Login)** (`/login`) | [`src/app/login/page.tsx`](src/app/login/page.tsx) | مكتمل 100% | دعم تسجيل دخول الطلاب والإداريين مع حفظ الجلسة |
| 3 | **إنشاء حساب طالب (Register)** (`/register`) | [`src/app/register/page.tsx`](src/app/register/page.tsx) | مكتمل 100% | اختيار النظام التعليمي، الصف الدراسي، وبيانات الحساب |
| 4 | **لوحة تحكم الطالب (Dashboard)** (`/dashboard`) | [`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx) | مكتمل 100% | إحصائيات الإنجاز، متابعة المذاكرة، وبوابة الامتحان اليومي |
| 5 | **فهرس المواد (Subjects Catalog)** (`/subjects`) | [`src/app/subjects/page.tsx`](src/app/subjects/page.tsx) | مكتمل 100% | استعراض المواد بحسب صف ونظام الطالب المسجل |
| 6 | **تفاصيل المادة والوحدات** (`/subjects/[id]`) | [`src/app/subjects/[id]/page.tsx`](src/app/subjects/[id]/page.tsx) | مكتمل 100% | الوحدات والدروس ونسب التقدم مع مؤشرات الإتمام |
| 7 | **شاشة الدرس التفاعلية** (`/lessons/[id]`) | [`src/components/lessons/LessonViewer.tsx`](src/components/lessons/LessonViewer.tsx) | مكتمل 100% | 4 ألسنة: الشرح والبودكاست، الزتونة وطباعة PDF، الخرائط مع Zoom/Pan، وتأكيد الفهم |
| 8 | **مركز الامتحانات** (`/exams`) | [`src/app/exams/page.tsx`](src/app/exams/page.tsx) | مكتمل 100% | الامتحانات الرسمية والمحاولات السابقة وتقييم الأداء |
| 9 | **مُفصّل الامتحانات المخصص** (`/exams/builder`) | [`src/app/exams/builder/page.tsx`](src/app/exams/builder/page.tsx) | مكتمل 100% | تخصيص امتحان حسب المادة والوحدة ومستوى الصعوبة مع عداد حي للأسئلة |
| 10 | **محلّل ومجري الامتحانات** (`/exams/[id]`) | [`src/components/exams/ExamSolver.tsx`](src/components/exams/ExamSolver.tsx) | مكتمل 100% | وضع تدريب (تصحيح فوري) ووضع امتحان (مؤقت وتسليم نهائي) |
| 11 | **شاشة نتائج الامتحان التفصيلية** (`/exams/[id]/results`) | [`src/app/exams/[id]/results/page.tsx`](src/app/exams/[id]/results/page.tsx) | مكتمل 100% | تحليل الدرجات، تفسير كل اختيار، مشاركة النتيجة وطباعة PDF |
| 12 | **ركن «غلطاتي» والتكرار المتباعد** (`/mistakes`) | [`src/app/mistakes/page.tsx`](src/app/mistakes/page.tsx) | مكتمل 100% | تجميع أوتوماتيكي للأخطاء وزر «امتحان مجمع من غلطاتي» |
| 13 | **لوحة الصدارة والتنافس** (`/leaderboard`) | [`src/app/leaderboard/page.tsx`](src/app/leaderboard/page.tsx) | مكتمل 100% | ترتيب حقيقي داخل نظام/صف الطالب حسب XP والدروس والامتحانات، دون منافسين وهميين |
| 14 | **الملف الشخصي للطالب** (`/profile`) | [`src/app/profile/page.tsx`](src/app/profile/page.tsx) | مكتمل 100% | عرض وتعديل بيانات الطالب، تغيير كلمة المرور بالتحقق من الحالية، والإشارات المرجعية |
| 15 | **صفحة العمل أوفلاين** (`/offline`) | [`src/app/offline/page.tsx`](src/app/offline/page.tsx) | مكتمل 100% | واجهة PWA بديلة عند انقطاع اتصال الإنترنت |
| 16 | **لوحة الإدارة الرئيسية** (`/admin`) | [`src/app/admin/page.tsx`](src/app/admin/page.tsx) | مكتمل 100% | إحصائيات عامة، مؤشر اتصال حي بقاعدة البيانات، وروابط سريعة |
| 17 | **إدارة المناهج والدروس** (`/admin/curriculum`) | [`src/app/admin/curriculum/page.tsx`](src/app/admin/curriculum/page.tsx) | مكتمل 100% | إدارة شجرية للمواد، الوحدات، الدروس والتحكم في حالة النشر |
| 18 | **إدارة الهيكل الأكاديمي** (`/admin/structure`) | [`src/app/admin/structure/page.tsx`](src/app/admin/structure/page.tsx) | مكتمل 100% | الأنظمة التعليمية (عام، أزهر، لغات) والصفوف وتوزيع المواد |
| 19 | **بنك الأسئلة المركزي** (`/admin/questions`) | [`src/app/admin/questions/page.tsx`](src/app/admin/questions/page.tsx) | مكتمل 100% | فرز وتصفية الأسئلة وتعديل الخيارات والشروحات التفسيرية |
| 20 | **الاستيراد الذكي للأسئلة** (`/admin/questions/import`) | [`src/app/admin/questions/import/page.tsx`](src/app/admin/questions/import/page.tsx) | مكتمل 100% | رفع وتفكيك ملفات Word DOCX ومعاينة الأسئلة قبل الحفظ |
| 21 | **مركز رفع وإدارة الوسائط** (`/admin/media`) | [`src/app/admin/media/page.tsx`](src/app/admin/media/page.tsx) | مكتمل 100% | رفع حتى 50MB لملفات البودكاست الصوتية والخرائط الذهنية وPDF |
| 22 | **إدارة الامتحانات الرسمية** (`/admin/exams`) | [`src/app/admin/exams/page.tsx`](src/app/admin/exams/page.tsx) | مكتمل 100% | جدولة الامتحانات، تحديد أوقاتها، وتخصيص أسئلتها |
| 23 | **سجل المحاولات والتصحيح المقالي** (`/admin/attempts`) | [`src/app/admin/attempts/page.tsx`](src/app/admin/attempts/page.tsx) | مكتمل 100% | تتبع حلول الطلاب واعتماد درجات الأسئلة المقالية يدويًا |
| 24 | **التحليلات وسجل تدقيق العمليات** (`/admin/analytics`) | [`src/app/admin/analytics/page.tsx`](src/app/admin/analytics/page.tsx) | مكتمل 100% | مؤشرات التحصيل، توزيع الصعوبة، وسجل النشاط (`AuditLog`) |
| 25 | **إدارة المستخدمين والصلاحيات** (`/admin/users`) | [`src/app/admin/users/page.tsx`](src/app/admin/users/page.tsx) | مكتمل 100% | تعديل الرتب والصلاحيات وإدارة الحسابات التعليمية |
| 26 | **سياسة الخصوصية** (`/privacy`) | [`src/app/privacy/page.tsx`](src/app/privacy/page.tsx) | مكتمل 100% | صفحة قانونية عامة ومربوطة من التذييل |
| 27 | **شروط الاستخدام** (`/terms`) | [`src/app/terms/page.tsx`](src/app/terms/page.tsx) | مكتمل 100% | صفحة قانونية عامة ومربوطة من التذييل |

---

## 3. قائمة المهام المنجزة والمعلقة (Task Breakdown)

### المهام المكتملة (Completed Tasks)
- [x] **TASK-001**: تصميم وإعداد المخطط العلائقي لقاعدة البيانات (Prisma Schema) يشمل المستخدمين، المناهج، بنك الأسئلة، الامتحانات، المحاولات، وركن غلطاتي.
- [x] **TASK-002**: إنشاء بيانات الاختبار الأولية (Comprehensive Seed Data) للمواد والأسئلة والأنظمة التعليمية في [`prisma/seed.mjs`](prisma/seed.mjs).
- [x] **TASK-003**: بناء الغلاف العام للطلاب [`StudentShell`](src/components/layout/StudentShell.tsx) مع شريط تنقل سفلي عائم متكيف مع الهواتف ومسار تصفح علوي.
- [x] **TASK-004**: بناء لوحة الإدارة ونظام Vercel [`AdminShell`](src/components/layout/AdminShell.tsx) مع شريط جانبي قابل للطي، ونافذة أوامر سريعة (`Ctrl+K`).
- [x] **TASK-005**: بناء عارض الدروس المتقدم [`LessonViewer`](src/components/lessons/LessonViewer.tsx) بألسنته الأربعة المتخصصة مع مشغل صوتي وعارض صور متقدم.
- [x] **TASK-006**: بناء محرك الامتحانات ومفصل الامتحانات الذكي [`ExamSolver`](src/components/exams/ExamSolver.tsx) و [`ExamBuilder`](src/app/exams/builder/page.tsx).
- [x] **TASK-007**: بناء منظومة «غلطاتي» والتكرار المتباعد وحفظ الأخطاء تلقائياً وإتاحة إعادة الامتحان.
- [x] **TASK-008**: بناء محرك استيراد الأسئلة الذكي من مستندات Word (`.docx`) بالمعاينة الحية والتخصيص الأكاديمي.
- [x] **TASK-009**: تنفيذ امتحان الدخول اليومي الإجباري للطلاب (Daily Entrance Gatekeeper Exam) مع تحليل الأخطاء ومراجعتها الفورية.
- [x] **TASK-010**: تأمين مسارات الـ API بالكامل والتحقق من الصلاحيات والأدوار عبر جلسات قاعدة بيانات مخصصة (`Session`) وCookie آمن، مع رؤوس أمان وCSP.
- [x] **TASK-011**: توحيد الهوية البصرية على لوحة ألوان محددة، وخط IBM Plex Sans Arabic فقط، وإزالة التدرجات والزجاج والتوهج والإيموجي العشوائي.
- [x] **TASK-012**: دعم طباعة ملخصات "الزتونة" وتقارير نتائج الامتحانات كملفات PDF منسقة.

- [x] **TASK-013**: بناء وإتمام طبقة الخدمات المركزية المتكاملة (14 خدمة نطاقية في `src/services/`):
  - [`CurriculumService`](src/services/curriculum.service.ts): إدارة الأنظمة التعليمية، الصفوف، المسارات، المواد، الوحدات، والدروس ونشرها وهيكلها الشجري.
  - [`QuestionService`](src/services/question.service.ts): بنك الأسئلة، التصنيفات، الخيارات، الشروحات، والاستيراد الذكي المجمع (`bulkCreateQuestions`).
  - [`ExamService`](src/services/exam.service.ts): توليد الامتحانات المخصصة والرسمية، إدارة المحاولات، حساب الدرجات الموضوعية، وتصحيح الأسئلة المقالية يدوياً للإدارة.
  - [`DailyCheckinService`](src/services/daily-checkin.service.ts): توليد ومراجعة امتحان الدخول اليومي الإجباري مع الالتزام الصارم بقرار عدم تقييم المقالي آلياً (DEC-011).
  - [`MistakeService`](src/services/mistake.service.ts): التكرار المتباعد وركن غلطاتي وتوليد امتحانات الأخطاء التراكمية وحساب عدد الأسئلة غير المتقنة.
  - [`StudentService`](src/services/student.service.ts): إحصائيات لوحة تحكم الطالب، متابعة تقدم المذاكرة، والإشارات المرجعية.
  - [`LeaderboardService`](src/services/leaderboard.service.ts): حساب لوحة الصدارة، النقاط التراكمية (XP)، وسلاسل الالتزام الحقيقية داخل نطاق نظام/صف الطالب.
  - [`SearchService`](src/services/search.service.ts): محرك البحث الشامل والموحد عبر المناهج والدروس وبنوك الأسئلة.
  - [`AnalyticsService`](src/services/analytics.service.ts): مؤشرات الأداء لمنصة الإدارة وسجل النشاطات التدقيقي (`AuditLog`).
  - [`UserService`](src/services/user.service.ts): شؤون الطلاب، صلاحيات المشرفين والمعلمين، وإدارة الحسابات.
  - [`MediaService`](src/services/media.service.ts): معالجة وحفظ وتصنيف ملفات البودكاست والخرائط الذهنية ومستندات PDF.
  - [`OtpService`](src/services/otp.service.ts): التحقق بخطوتين OTP واسترجاع الحساب وتحديث كلمة المرور بأمان.
  - [`NotificationService`](src/services/notification.service.ts): التنبيهات اللحظية والتذكير اليومي وشعلة الالتزام وحمولة الـ Web Push.
  - [`OfflineService`](src/services/offline.service.ts) & [`offline-db.ts`](src/lib/offline-db.ts): حزم التخزين المحلي للدروس أوفلاين عبر IndexedDB.
- [x] **TASK-014**: تطبيق قرار DEC-011 (عدم تقييم المقالي آلياً):
  - تمكين الطالب فور انتهاء وقت الامتحان من مقارنة إجابته المكتوبة ذاتياً بنموذج الإجابة المثالي المسترجع من بنك الأسئلة.
  - منع احتساب الأسئلة المقالية كأخطاء تلقائية أو إنقاص النسبة المئوية للأسئلة الموضوعية سواء في الامتحانات العامة أو امتحان الدخول اليومي.
- [x] **TASK-015**: تفويض وتحديث كافة مسارات الـ API وصفحة المتصدرين للاعتماد الحصري على طبقة الخدمات الخلفية.
- [x] **TASK-016**: المراجعة والتدقيق التقني المعمق لكافة الخدمات الـ 14 (Backend Services Deep Technical Audit):
  - إصلاح احتساب الأسئلة المتخطاة (Skipped Questions) في `ExamService.submitExamAttempt` عبر مطابقتها مع كامل أسئلة الامتحان وليس فقط الإجابات المسجلة.
  - ضبط احتساب درجات المقالي في `DailyCheckinService` لتكون `score: null` التزاماً صارماً بـ DEC-011 ومنع تسجيلها كـ 0.
  - تأمين حذف الأخطاء في `MistakeService.resolveMistake` باستخدام `updateMany` لتفادي أخطاء السجلات غير الموجودة.
  - تصحيح إحصائيات `StudentService.getStudentDashboard` لاحتساب إجمالي الامتحانات الحقيقي بدلاً من الاقتصار على أحدث 5 محاولات.
  - تحسين استعلام `LeaderboardService.getLeaderboard` لتوسيع شريحة الفحص وضمان احتساب الطالب الحالي وترتيب الـ XP تنازلياً بدقة.
  - تعزيز الحماية الأمنية في `UserService.deleteUser` لمنع حذف حسابات المشرفين والمسؤولين إلا بواسطة المشرف العام (SUPER_ADMIN).
  - تنظيف البيانات المتضاربة آلياً في `QuestionService.updateQuestion` عند تغيير نوع السؤال بين مقالي وموضوعي.
  - إعداد وتشغيل اختبار تدقيق شامل للمنظومة بالكامل في [`scripts/test-services-audit.ts`](scripts/test-services-audit.ts) مع تحقيق نجاح 100%.
- [x] **TASK-017**: جولة المراجعة والتدقيق الثانية الشاملة (100% Zero Raw Prisma in API Routes):
  - تصفية وتفويض جميع مسارات الـ API (حذف أي استعلامات `prisma.` مباشرة) للاعتماد الحصري والمباشر على طبقة الخدمات الـ 14 (`src/services/`).
  - تفويض إنشاء وتسليم الامتحانات بالكامل (`api/exams/create`, `api/exams/[id]/submit`) إلى `ExamService` مع الالتزام التام بمعاملات `$transaction` وقرار DEC-011 للمقالي.
  - تفويض المصادقة والوسائط (`api/auth/register`, `api/auth/login`, `api/admin/upload`) إلى `UserService` و `MediaService`.
  - التحقق من خلو المشروع تماماً من أي أخطاء نوعية برمجية (`tsc --noEmit` بنجاح كامل 0 أخطاء).
  - اجتياز اختبارات E2E الكاملة لجميع المسارات الـ 26 بحالة 200 OK.

- [x] **TASK-018**: تدقيق شامل P0–P3 وتنفيذ الإصلاحات:
  - إزالة كلمة مرور المدير الثابتة من `seed.mjs` وإلزام `SEED_ADMIN_PASSWORD` (8+) مع منع الإنتاج افتراضياً.
  - منع إعادة تقديم الامتحان عبر تحقق خدمي مبكر و`updateMany({ isCompleted: false })` داخل معاملة ذرية.
  - إغلاق IDOR في نتائج الامتحانات وربط المحاولة بمالكها، وإخفاء مفاتيح الإجابات عن العميل (التحقق عبر API محمي).
  - إضافة `src/lib/curriculum.ts` وتطبيق النطاق (نظام/صف/مسار) على لوحة التحكم والمواد والامتحانات والبحث والمتصدرين والتحدي اليومي.
  - تحويل التحدي اليومي إلى سجل خادم ثابت لكل مستخدم/يوم مع منع المطالبة المزدوجة والتحقق من معرّفات الأسئلة، واحتساب الأسئلة المتخطاة ضمن المقام كإجابات خاطئة.
  - تأمين `/dashboard` و`/leaderboard` بإعادة توجيه الزائر غير المسجل، وتقييد البحث الشامل بنطاق الطالب حتى لا تظهر نتائج من صفوف أخرى.
  - إصلاح عرض نموذج تسجيل الدخول على الهاتف (`w-full`) لمنع أي تجاوز أفقي عند ظهور رسائل خطأ طويلة.
  - تأمين المسارات الحساسة (أوفلاين، الإجابة، إحصاءات المفصل، تغيير كلمة المرور) والتحقق من المدخلات عبر zod وتحديد المعدل.
  - استبدال المقاييس الوهمية (السلسلة، معدل الاستيعاب، أركان الهبوط، المتصدرون) ببيانات حقيقية أو تسميات محايدة.
  - تطبيق نظام التصميم: لوحة ألوان مغلقة، IBM Plex فقط، أسطح صلبة، 13px حد أدنى، 44px أهداف لمس، وشبكة 4px.
  - إضافة `/privacy` و`/terms` وربطهما، وتحديث الوثائق لتطابق التنفيذ.
  - إضافة اختبارات `tests/date.test.ts` و`tests/curriculum.test.ts`.

### المهام المعلقة والقادمة بحسب خارطة الطريق (Pending Roadmap Tasks)
- [ ] **TASK-ROADMAP-1**: دمج واجهة استرجاع كلمة المرور (`/forgot-password`) على واجهات الـ Frontend لربطها بـ `OtpService`.
- [ ] **TASK-ROADMAP-2**: زر التحميل الأوفلاين داخل شاشة الدرس (`LessonViewer`) للربط مع `offlineStorage` (IndexedDB).
- [ ] **TASK-ROADMAP-3**: شارة التنبيهات المنسدلة في الشريط العلوي لعرض إشعارات `NotificationService`.

---

## 4. المهمة الحالية والإجراء التالي المطلوب (Active Task & Next Action)

- **المهمة الحالية (Current Active Task):** اكتمال جولة التدقيق الشاملة P0–P3 وإصلاحات الأمان وسلامة الامتحانات ونظام التصميم والوثائق، مع اجتياز TypeScript وVitest وESLint والبناء وفحوص التشغيل والمراجعة البصرية على 390/768/1440.
- **الإجراء التالي المحدد (Exact Next Action Required):** إيداع التغييرات في Git عند طلب المستخدم، ثم تدوير كلمة مرور حساب المدير في بيئة التطوير الحالية إن كانت لا تزال بالقيمة القديمة.
- **التبعيات والعوائق (Dependencies & Blockers):** لا توجد عوائق تقنية. ملاحظة تشغيلية: قاعدة البيانات التطويرية الحالية قد تحتوي كلمة مرور مدير قديمة، ويجب تغييرها من الملف الشخصي/الإدارة. محدد المعدل في الذاكرة يحتاج Redis عند تشغيل أكثر من نسخة.

