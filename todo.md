\# MASTER BUILD PROMPT — EL KHOLASA

\## Build a Premium, Production-Ready Arabic Educational PWA



You are an elite autonomous software engineering team operating inside Google Antigravity.



You combine the expertise of:



\- Principal Full-Stack Software Architect

\- Senior Next.js Engineer

\- Senior UI/UX and Product Designer

\- PostgreSQL \& Prisma Database Architect

\- Educational Technology Product Specialist

\- PWA and Performance Engineer

\- Application Security Engineer

\- Senior QA and Test Automation Engineer



Your mission is to DESIGN, ARCHITECT, BUILD, TEST, and REFINE an exceptional Arabic educational platform named:



\# الخلاصة | EL KHOLASA



\*\*Tagline: افهمها صح.. هتفضل معاك\*\*



This is not a landing page, static prototype, or simple educational website.



This is a serious educational SaaS platform for Egyptian Baccalaureate and General Secondary Education students.



The application must provide an outstanding mobile-first learning experience with explanations, smart summaries, mind maps, question banks, adaptive revision, and a powerful administrative content management system.



The first release must be a Progressive Web Application (PWA).



\---



\# 1. DESIGN REFERENCE — GOOGLE STITCH



Primary design reference:



https://stitch.withgoogle.com/projects/10238941275024974269



IMPORTANT:



1\. Attempt to inspect the provided Google Stitch project through available authorized tools.

2\. If accessible, analyze its screens, colors, typography, spacing, layouts, components, and user journeys.

3\. Reuse the existing design language while upgrading it to professional production quality.

4\. If the project requires authentication or cannot be inspected, do not pretend that you accessed it. Check for available exported assets or reference files.

5\. If no reference assets are available, implement the detailed visual direction below and explicitly state that Stitch parity remains unverified.

6\. Never discard existing project work without inspecting it first.



The target quality should resemble a highly polished premium EdTech product.



NOT a generic Bootstrap dashboard.

NOT a basic CRUD interface.

NOT a collection of unrelated templates.

NOT a visual demo with non-functional buttons.



The final application must feel coherent, thoughtfully designed, interactive, modern, and genuinely useful.



\---



\# 2. REQUIRED TECHNOLOGY STACK



Build using:



\- Next.js with App Router

\- TypeScript with strict type checking

\- PostgreSQL

\- Prisma ORM

\- Tailwind CSS

\- shadcn/ui

\- Radix UI primitives

\- Lucide React icons

\- React Hook Form

\- Zod validation

\- Auth.js for authentication

\- Recharts for analytics

\- React Flow for interactive mind maps

\- A compatible PWA/service-worker solution such as Serwist

\- A rich text editor such as Tiptap for educational content

\- Docker Compose for local PostgreSQL development



Use established stable versions compatible with one another and the available environment.



Check package compatibility before installation. Avoid deprecated packages and unstable APIs.



Prefer Server Components where appropriate. Use Client Components only for necessary interactivity.



Use Server Actions or carefully designed Route Handlers according to the specific operation.



Build a modular monolith initially. Do not introduce microservices or unnecessary architectural complexity.



Code must be maintainable, typed, reusable, and production-oriented.



\---



\# 3. BRAND IDENTITY \& VISUAL DESIGN



Application name: الخلاصة



Language: Arabic.



Direction: RTL across the entire student and admin applications.



Typography:

\- Cairo or IBM Plex Sans Arabic.



Suggested palette:

\- Deep Navy: #14243D

\- Primary Indigo: #6858EA

\- Cyan: #11B7B4

\- Warm Amber: #FFBA55

\- Background: #F7F9FC

\- Cards: #FFFFFF

\- Success: #12A87E

\- Error: #E55269



Create a distinctive design system using these as starting tokens.



Visual characteristics:



\- Premium mobile-app appearance

\- Elegant gradients used selectively

\- Beautiful subject cards

\- Generous, intentional spacing

\- Soft shadows

\- Rounded cards

\- Excellent Arabic typography

\- Consistent illustrations and iconography

\- Smooth micro-interactions

\- Skeleton loading states

\- Delightful success and error feedback

\- Readable educational content

\- Excellent touch accessibility

\- Full light and dark themes



Do not overdecorate.



Focus on excellent visual hierarchy and learning usability.



All components must follow consistent design tokens.



Use subtle animations only where they improve understanding or feedback. Respect reduced-motion preferences.



\---



\# 4. APPLICATION ARCHITECTURE



Create two integrated application areas.



\## STUDENT APPLICATION



Mobile-first, responsive PWA.



Main navigation:



1\. الرئيسية

2\. المواد

3\. اختبر نفسك

4\. غلطاتي

5\. حسابي



On mobile use a beautifully designed bottom navigation bar.



On desktop use a responsive sidebar or other appropriate navigation layout.



\## ADMIN APPLICATION



A dedicated professional administrative dashboard under /admin.



Admin functionality must include curriculum management, content management, question bank management, publishing, users, and analytics.



Enforce role-based access control on the server.



Do not rely on client-side route hiding for authorization.



\---



\# 5. STUDENT EXPERIENCE — ALL REQUIRED SCREENS



Build these screens with complete responsive layouts.



\## Screen 01 — Splash \& Onboarding



Beautiful branded onboarding:



\- افهم دروسك بسهولة

\- اختبر نفسك بذكاء

\- اتعلم من كل غلطة



Include next, skip, and start actions.



\## Screen 02 — Authentication



\- Login

\- Registration

\- Password reset

\- Secure session management

\- Form validation

\- Clear Arabic error messages



Use real authentication and properly secured password handling.



\## Screen 03 — Academic Setup



Students select:



\- الثانوية العامة or البكالوريا المصرية

\- Grade

\- Academic year

\- Academic track where applicable



The curriculum must be configurable through administration rather than hardcoded.



\## Screen 04 — Student Home Dashboard



Create a beautiful personalized dashboard including:



\- Student greeting

\- Continue learning

\- Subjects

\- Current progress

\- Completed lessons

\- Weekly study activity

\- Quick exam button

\- Review mistakes button

\- Daily challenges

\- Recommended revision



This must be one of the visually strongest screens.



\## Screen 05 — Subjects



Responsive subject cards containing:



\- Subject icon

\- Subject name

\- Units count

\- Lessons count

\- Completion progress

\- Navigation to subject details



\## Screen 06 — Subject Details



Display:



\- Subject overview

\- Chapters and units

\- Unit progress

\- Lesson counts

\- Exam shortcuts

\- Clear unit navigation



\## Screen 07 — Unit Details



Display:



\- Unit overview

\- Ordered lessons

\- Learning status

\- Quick access to summaries

\- Unit-wide exam

\- Multiple lesson selection



\## Screen 08 — Lesson Explanation



Design a premium long-form educational reading interface.



Include:



\- Structured rich text

\- Headings

\- Highlighted definitions

\- Tables

\- Formulas

\- Illustrations

\- Worked examples

\- Important examination tips

\- Embedded videos when available

\- Bookmarks

\- Reading progress

\- Next and previous lesson navigation



The lesson page should offer four tabs:



الشرح | الزتونة | Mind Map | الأسئلة



\## Screen 09 — Golden Summary (الزتونة)



This is a signature feature.



Provide:



\- Key concepts

\- Important definitions

\- Essential formulas

\- Important comparisons

\- Examination tips

\- Common mistakes

\- Revision checklist



The summary must be highly readable on small mobile screens.



\## Screen 10 — Interactive Mind Maps



Use React Flow or an appropriate accessible visualization.



Features:



\- Expandable nodes

\- Topic relationships

\- Zoom in/out

\- Reset view

\- Pan

\- Full-screen view

\- Readable outline fallback



Mind maps should be associated with specific lessons or units.



\## Screen 11 — Smart Exam Builder



This is a critical product feature.



Allow students to select:



1\. Subject.

2\. Whole subject, whole unit, one lesson, or multiple specific lessons.

3\. Question type:

&#x20;  - Multiple choice

&#x20;  - Essay

&#x20;  - True/False

&#x20;  - Mixed

4\. Difficulty:

&#x20;  - Easy

&#x20;  - Medium

&#x20;  - Hard

&#x20;  - All

5\. Question count.

6\. Practice or exam mode.

7\. Optional exam timer.



Show the number of available matching questions.



Prevent invalid exam configurations.



Ensure selected lessons actually determine the returned questions.



Never include questions outside the requested scope.



Do not repeat questions within an exam.



If insufficient questions exist, clearly display the available quantity and provide an appropriate adjustment.



\## Screen 12 — Multiple Choice Question



Beautiful distraction-free exam UI:



\- Question progress

\- Answer choices

\- Selected state

\- Previous/next navigation

\- Flag for revision

\- Optional timer

\- Save answers reliably

\- Correct/incorrect indicators according to examination mode



\## Screen 13 — Detailed Answer Explanation



This screen must be exceptionally good.



For every MCQ:



\- Display the student's selected answer.

\- Display the correct answer.

\- Explain why the correct answer is correct.

\- Explain why each incorrect option is wrong, where appropriate.

\- Identify the underlying concept.

\- Link to the corresponding lesson section.

\- Allow the question to be saved for revision.



For True/False:



\- Show the correct verdict.

\- Explain the reasoning.

\- Correct the false statement.



Practice mode:

Show feedback immediately after answering.



Exam mode:

Do not reveal correctness or explanations until submission.



\## Screen 14 — Essay Questions



Students should be able to write long-form answers.



Include:



\- Question statement

\- Answer editor

\- Model answer

\- Marking rubric

\- Comparison with expected answer elements

\- Review status



If optional AI grading is implemented, run it server-side, ground it in a reviewed marking rubric, and label its result as indicative rather than authoritative.



The base application must work without an AI API key.



\## Screen 15 — Exam Results



Create an impressive results dashboard:



\- Total marks

\- Percentage

\- Correct answers

\- Incorrect answers

\- Unanswered questions

\- Time spent

\- Performance by topic

\- Performance by difficulty

\- Explanations for each answer

\- Recommended lessons to review

\- Retry incorrect questions

\- Retake exam



\## Screen 16 — My Mistakes



A dedicated revision hub:



\- Incorrect questions

\- Saved questions

\- Filters by subject/unit/lesson

\- Review statuses

\- Previous attempts

\- Explanations

\- Retake incorrect questions

\- Improvement tracking



\## Screen 17 — Student Profile



\- Personal information

\- Academic system

\- Current grade

\- Learning statistics

\- Test history

\- Achievements

\- Theme settings

\- Notification preferences

\- Account settings



\---



\# 6. ADMIN DASHBOARD



Create a separate Arabic RTL administration system.



\## Dashboard Overview



\- Students count

\- Subjects count

\- Units and lessons count

\- Published questions

\- Examination activity

\- Learning performance

\- Most frequently missed concepts



\## Curriculum Management



CRUD for:



\- Educational systems

\- Academic years

\- Grades

\- Academic tracks

\- Subjects

\- Units

\- Lessons



Support ordering, visibility, and curriculum versioning.



\## Content Editor



Build a rich educational content editor capable of:



\- Headings

\- Paragraphs

\- Lists

\- Bold/highlight formatting

\- Images

\- Tables

\- Mathematical formulas

\- Worked examples

\- Important notes

\- Lesson sections with stable anchor IDs



Each lesson should support separate explanation, summary, and mind map content.



\## Question Bank Management



CRUD for:



\- MCQs

\- Essay questions

\- True/False questions



Question fields include:



\- Question statement

\- Educational system and academic year

\- Subject

\- Unit

\- Related lesson(s)

\- Learning objective

\- Difficulty

\- Question type

\- Answer options

\- Correct answer

\- Correct-answer explanation

\- Per-option incorrect-answer explanation

\- Explanation linked to a lesson section

\- Model answer and rubric for essays

\- Review/publishing status



Support bulk CSV import with validation and preview.



No malformed question should silently enter the published question bank.



\## Publishing Workflow



Support:



Draft → In Review → Published → Archived



Only published content is visible to students.



\## User Administration



Roles:



\- SUPER\_ADMIN

\- ADMIN

\- EDITOR

\- TEACHER

\- STUDENT



Use clear, server-enforced permissions.



\---



\# 7. DATABASE DESIGN — PRISMA + POSTGRESQL



Design a normalized and scalable Prisma schema.



Suggested core entities:



\- User

\- Account

\- Session

\- EducationalSystem

\- AcademicYear

\- Grade

\- AcademicTrack

\- Subject

\- Unit

\- Lesson

\- LessonSection

\- LessonContent

\- LessonSummary

\- MindMap

\- LearningObjective

\- Question

\- QuestionOption

\- QuestionLesson

\- QuestionExplanation

\- EssayRubric

\- Exam

\- ExamQuestion

\- ExamAttempt

\- StudentAnswer

\- StudentProgress

\- Bookmark

\- MistakeReview

\- ContentRevision

\- AuditLog



Refine relationships as needed.



Critical database requirements:



1\. Questions must support association with one or more lessons.

2\. Questions must be reusable across exams.

3\. Exam attempts must preserve the exact questions and answer order used.

4\. Historic exam results must remain valid after question edits.

5\. Curriculum revisions must not corrupt previous student progress.

6\. Use appropriate constraints, unique indexes, and foreign keys.

7\. Support transaction-safe exam submission.

8\. Prevent duplicate submissions and grading.

9\. Avoid N+1 queries and inefficient fetching.

10\. Never expose correct answers to students before the permitted reveal time.



Create actual Prisma migrations.



Provide realistic but clearly fictional seed data for development.



Do not represent demonstration curriculum content as officially approved educational material.



\---



\# 8. EXAM ENGINE — CRITICAL BUSINESS LOGIC



The exam engine must operate entirely from the database.



Implement the following pipeline:



Student selects filters

→ Server validates selection and permissions

→ Server resolves permitted published questions

→ Server checks availability

→ Server creates a reproducible exam attempt

→ Student answers questions

→ Answers are persisted

→ Student submits

→ Server evaluates objective answers

→ Results and explanations become available

→ Incorrect answers are linked to revision records



Requirements:



\- Unique questions per exam

\- Randomization when enabled

\- Reliable answer persistence

\- Resume behavior for unfinished attempts

\- Idempotent exam submission

\- Objective grading handled server-side

\- Essay grading handled through reviewed rubrics/manual review unless a properly configured optional grading service is enabled

\- Strict separation between practice and examination feedback behavior



Add automated tests for this logic.



\---



\# 9. PWA EXPERIENCE



Build the platform as a genuine installable PWA.



Implement:



\- Web app manifest

\- App name and icons

\- Theme colors

\- Standalone display

\- Responsive layouts

\- Mobile safe-area support

\- Install guidance

\- Service worker with appropriate caching

\- Offline page

\- Network status feedback

\- Update availability notification



Allow suitable previously cached published reading content to remain accessible offline where practical.



Do not claim full offline exam submission until reliable offline synchronization and conflict handling are implemented.



Never cache authenticated API responses or sensitive student records in a way that could leak between users.



Test PWA behavior separately from ordinary development navigation.



\---



\# 10. SECURITY \& QUALITY



Implement:



\- Secure authentication

\- Server-side authorization

\- Password hashing

\- Protected admin routes

\- Role-based permissions

\- Input validation with Zod

\- HTML sanitization where necessary

\- Safe file upload handling

\- Rate limiting for sensitive operations

\- CSRF protection where applicable

\- Secure cookie/session configuration

\- Environment variable validation

\- Protection against mass assignment

\- Safe error handling

\- No secrets in client bundles

\- Audit logging for important admin actions



Consider students may be minors; collect only necessary personal data and provide clear privacy controls.



Use accessible form fields, semantic HTML, keyboard navigation, visible focus states, and WCAG-conscious contrast.



\---



\# 11. PROJECT STRUCTURE



Build a clean maintainable structure following Next.js App Router conventions.



Suggested modules:



src/app

src/components

src/components/ui

src/components/layout

src/features/auth

src/features/curriculum

src/features/lessons

src/features/summaries

src/features/mindmaps

src/features/question-bank

src/features/exams

src/features/revision

src/features/progress

src/features/admin

src/lib

src/server

src/hooks

src/types

prisma

public

tests



Keep:



\- UI components

\- Domain logic

\- Data access

\- Validation

\- Authorization

\- Database logic



properly separated.



Avoid giant components, duplicated business logic, and unnecessary abstractions.



\---



\# 12. MANDATORY UX QUALITY



Every important screen must include appropriate:



\- Loading state

\- Skeleton state

\- Empty state

\- Error state

\- Success feedback

\- Form validation

\- Disabled state

\- Responsive behavior

\- Keyboard accessibility



Do not implement buttons that merely look functional.



Every interactive control must either perform a real implemented action or be clearly identified as unavailable.



No fake success notifications for actions that did not complete.



No hardcoded mock data masquerading as live analytics.



\---



\# 13. DEVELOPMENT EXECUTION PLAN



You are operating as a coding agent.



DO NOT stop after explaining an architecture.



DO NOT only generate design mockups.



DO NOT provide isolated snippets without integrating them.



You must implement working files in the project workspace.



Execute in the following order.



\## PHASE A — PROJECT ANALYSIS



1\. Inspect the existing repository.

2\. Inspect available Stitch design exports and assets.

3\. Detect existing technologies.

4\. Identify what is already implemented.

5\. Create a concise implementation plan.

6\. Do not overwrite useful existing code unnecessarily.



\## PHASE B — FOUNDATION



1\. Initialize or repair the Next.js project.

2\. Configure TypeScript, Tailwind, and shadcn/ui.

3\. Implement fonts, RTL, themes, and design tokens.

4\. Create reusable layouts and navigation.

5\. Configure PostgreSQL and Prisma.

6\. Set up authentication and server authorization.

7\. Add environment configuration and Docker Compose.



\## PHASE C — STUDENT INTERFACE



Implement all student screens with realistic responsive layouts.



Use reusable components.



Create polished transitions and consistent loading states.



\## PHASE D — REAL DATA



Implement:



\- Curriculum relationships

\- Lesson content retrieval

\- Question bank

\- Exam generation

\- Exam attempts

\- Answer persistence

\- Server-side grading

\- Detailed explanations

\- Student revision records



\## PHASE E — ADMINISTRATION



Implement:



\- Curriculum CRUD

\- Lesson content editing

\- Summary management

\- Mind map management

\- Question creation/editing

\- Publishing

\- Student performance views



\## PHASE F — PWA AND POLISH



\- App manifest

\- Icons

\- Offline fallback

\- Caching rules

\- Performance improvements

\- Responsive polish

\- Accessibility checks



\## PHASE G — TESTING



Run and fix:



\- TypeScript checking

\- Linting

\- Prisma generation

\- Database migrations

\- Unit tests

\- Integration tests

\- Production build

\- End-to-end critical user flows



Do not claim tests passed unless you actually ran them successfully.



If a tool, service, or environment is unavailable, document the blocker precisely and complete everything else that can be validated.



\---



\# 14. ACCEPTANCE TESTS



The MVP is acceptable only when:



1\. A student can register and log in.

2\. A student can choose their academic system and grade.

3\. Published subjects, units, and lessons load from PostgreSQL.

4\. A student can read a lesson and its summary.

5\. A student can select several lessons for an exam.

6\. The exam contains only eligible questions from those lessons.

7\. MCQ answers are persisted.

8\. Correct/incorrect explanations are revealed at the appropriate time.

9\. An exam can be submitted without producing duplicate results.

10\. Scores are calculated correctly.

11\. Incorrect questions appear in the revision area.

12\. Students can access their previous results.

13\. Administrators can create, edit, review, and publish lessons.

14\. Administrators can create questions with answers and explanations.

15\. Published content becomes available to students without code changes.

16\. Unauthorized students cannot access admin operations.

17\. The platform is responsive on mobile, tablet, and desktop.

18\. The application has working installable PWA configuration.



Cover the exam selection and answer-explanation flows with automated tests.



\---



\# 15. DESIGN EXCELLENCE CHECK



Before completing each major interface, evaluate:



\- Does this look like a premium educational application?

\- Is the Arabic typography genuinely readable?

\- Is RTL implemented correctly?

\- Is mobile navigation comfortable?

\- Is the visual hierarchy obvious?

\- Can a student complete the main action without confusion?

\- Are subject, lesson, and exam screens visually consistent?

\- Do correct and wrong answer states communicate clearly?

\- Does every visible action have a meaningful outcome?

\- Is the code reusable and maintainable?



If any answer is no, refine the implementation.



Prioritize functionality and usability over decorative complexity.



\---



\# 16. REQUIRED PROJECT OUTPUTS



Deliver:



1\. Working Next.js application.

2\. Prisma schema and migrations.

3\. PostgreSQL development configuration.

4\. Authentication and roles.

5\. Student application.

6\. Admin dashboard.

7\. Functional question bank and examination engine.

8\. PWA configuration.

9\. Development seed data.

10\. Automated tests.

11\. .env.example without real secrets.

12\. README with exact installation and execution steps.

13\. Summary of completed and incomplete features.



Provide useful commands for local setup, database migration, seed execution, development, testing, and production build.



Never expose secrets.



\---



\# FINAL EXECUTION INSTRUCTION



Start working immediately inside the project workspace.



First inspect the repository and the available Google Stitch reference.



Create a short implementation plan, then begin coding.



Do not spend the entire session discussing possibilities.



Build a fully integrated vertical slice first:



Authentication

→ Student Dashboard

→ Curriculum

→ Lesson Explanation

→ Golden Summary

→ Exam Builder

→ Question Solving

→ Detailed Answer Explanation

→ Exam Results

→ Mistake Review

→ Admin Content Management



Make this vertical slice genuinely functional using Prisma and PostgreSQL before expanding less critical enhancements.



Afterward, complete remaining screens and features incrementally.



Keep the project runnable after each stage.



Validate actual behavior, not only visual appearance.



Your objective is to create an exceptional, scalable Arabic educational PWA that students will enjoy using every day.



\*\*Build EL KHOLASA as a real product, not as a prototype.\*\*

