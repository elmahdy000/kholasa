# Admin panel audit — 30 October 2026

## Scope and verification limits

Reviewed the dashboard, curriculum and structure, question bank and import, exams, attempts and grading, users, media, analytics, and shared navigation/dialogs. Source review and local HTTP checks were completed. The browser initially contained a stale curriculum screen, then redirected to login; authenticated desktop/mobile visual verification and successful CRUD workflows remain unverified pending normal admin sign-in. This is not a production certification.

Existing unrelated workspace changes were preserved. No database reseed or deployment was performed. The existing service-audit script was not run because it deletes students' bookmarks/challenges and submits attempts against the configured database.

## Fixed

| Severity | Finding | Change |
| --- | --- | --- |
| Critical | Hardcoded demo passwords authenticated any account regardless of its stored password hash. | Removed fallback; verification now requires the stored bcrypt hash. Added regression coverage for all fallback passwords. |
| High | User list, create and update paths returned password hashes to the browser. | Changed those queries to explicit safe field selection. |
| High | Grading accepted another attempt ID and invalid/out-of-range scores; unfinished attempts and objective questions could be graded manually. | Added request validation, answer-to-attempt checks, completion/type checks and rubric limits; recalculation uses the answer's actual attempt. |
| Medium | Newly created users lacked `attempts` and `progress`, causing table/metric code to fail. | Return the relations required by the client. |
| Medium | Dashboard and search offered role-restricted destinations. | Filter service cards, import shortcuts, review links and audit links by role; derive the displayed service count. |
| Medium | Failed confirmation actions only logged errors. | Show an accessible inline error, allow retry, name the dialog and enlarge its close control. |
| Medium | Failed attempt-detail HTTP responses left the loading state active indefinitely; late requests could reopen a closed modal. | Show errors and ignore obsolete requests. Use the shared accessible dialog. |
| Medium | Search dialog had no focus trap, accessible name, scroll lock or backdrop dismissal. | Use the shared dialog and label controls. |
| Medium | Exam quick actions led to a list or an ignored parameter. | Link directly to the standalone create screen. Question quick-create and subject query parameters now initialize the question bank. |
| Medium | Upload UI advertised SVG/video unsupported by the server; upload zone was inaccessible by keyboard; clipboard/audio failures appeared successful or went unhandled. | Align accepted types and guidance with the server, add keyboard access, and surface failures. |
| Low | Login redirected only ADMIN users to administration, sending SUPER_ADMIN and other staff to the student screen. | Route all staff roles to administration. |
| Low | Public login screen displayed demo credentials and advertised one-click access. | Remove demo account cards and handlers. |
| Low | Dashboard displayed a fixed service count and unmeasured live infrastructure health claims. | Calculate the count and replace health claims with page-load/workspace wording. |
| Low | Mobile search and menu-close controls lacked names. | Add accessible labels and expanded state. |

## Remaining findings

These are source-confirmed concerns requiring additional implementation and authenticated verification.

| Priority | Area | Finding / next work |
| --- | --- | --- |
| Medium | Grading consistency | Answer update and attempt score recalculation are separate operations. Make them transactional and serialize concurrent grading for the same attempt. Confirm the intended scoring policy: the current percentage counts correct answers, while the UI also stores rubric points. |
| Medium | Attempts history | Page loads only 60 attempts; API list loads 50. Client search filters only the loaded subset and has no paging. Older students' attempts can appear absent. Add server search and pagination with explicit counts. |
| Medium | Curriculum / question permissions | Some content controls remain visible to read-only teachers, while bulk import/delete APIs require editor/admin roles. Pass capability flags through these components and verify each staff role. |
| Medium | Modal accessibility and mobile layout | Several specialized create/edit modals still use custom fixed wrappers rather than the shared dialog. Essay grading buttons use 28px height and a non-wrapping action row, which risks narrow-screen overflow. Audit focus, Escape, labels and 44px touch targets after sign-in. |
| Medium | Performance | Dashboard and analytics read all completed attempts to compute aggregates; user management loads all users plus all attempt/progress records. Replace with database aggregates, counts and pagination as data grows. |
| Low | Design consistency | Multiple admin controls use 10–12px text, small targets and colors outside the README design palette. Verify the intended current brand before broad restyling. |

## Validation

- Initial full suite: 47 passed, 10 failed (57 tests). Failures depend on missing pre-existing subjects/units and dereference null IDs; they are not a clean baseline. Avoid reseeding the user's database to satisfy these tests. Isolate test data and database configuration instead.
- Focused run after initial fixes: 46/46 passed across 10 selected suites. Three new regression suites subsequently pass 8/8, covering authentication, grading rejection and safe user creation responses.
- Type checking passes after the fixes.
- Production build passes (59 generated pages reported by Next.js).
- Full lint: no errors; six existing warnings in SubjectModal, TrackModal and curriculum-separation tests. Changed-file lint was also run.
- Unauthenticated HTTP GET checks: `/api/admin/users`, `/structure`, `/questions`, `/exams`, `/attempts`, `/analytics`, `/upload`, `/units`, `/lessons` all returned 403.
- Successful authenticated mutations, upload/playback, grading, role-specific navigation, dark mode and responsive layouts still require browser verification.

The removed password bypass could have allowed unauthorized access wherever that code was deployed. Deployment history and access/session logs should be reviewed separately; this audit did not revoke existing sessions.

## Second review — 30 October 2026

Rechecked the updated working tree. The previous authentication, safe user response and grading validation regression suites pass. The question-bank QA suite also passes; its tests exercise parsing behavior and do not establish visual UI quality.

Additional fixes:

- Fixed a newly introduced TypeScript error: bookmark question IDs are nullable and must be filtered before building the protected-question ID set.
- Official exam creation now validates title, duration, count and input types; refuses empty exams and insufficient question pools; checks explicit questions against published status and the selected subject/unit/lesson; validates unit/lesson ownership; deduplicates IDs and samples random questions without replacement. Validation errors reach the client as HTTP 400.
- Paired uploads validate both categories and file signatures before saving either file. If audio storage fails, the newly saved image is removed. The request size limit now accommodates two files of up to 50 MB each; incomplete pairs are rejected. The paired image picker no longer advertises SVG support.
- Exam-mode changes now show errors, roll back failed updates and suppress concurrent changes to the same exam. Failed logout requests keep the user on the page and show an error.
- Essay grading controls now wrap, have at least 44px height and remain disabled for unfinished attempts or while another grade is saving.

Verification: 27/27 tests passed across six targeted suites, including 13 new exam/media regression cases. Type checking and the production build passed. Targeted lint passed without warnings or errors. All 39 exported method/route combinations under `/api/admin` returned 401/403 when called without a session. No authenticated writes, reseed or deployment were performed.

The browser still redirects to login. Signed-in desktop/mobile visual checks and successful authenticated workflows remain pending. The remaining findings table above still applies, including grading transactions, history pagination, role-specific content controls and broader modal/performance work.
