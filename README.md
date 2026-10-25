# الخلاصة | EL KHOLASA

منصة تعليمية مبنية بـ Next.js 16 (App Router) و React 19 و Prisma على PostgreSQL. المصادقة عبر جلسات قاعدة البيانات (cookie مخصص) وليس next-auth.

Educational platform built with Next.js 16 (App Router), React 19 and Prisma on PostgreSQL. Auth uses a custom DB-session cookie (`src/lib/auth.ts`), not next-auth.

## المتطلبات | Prerequisites

- Node.js 24 (matches the Dockerfile and CI)
- npm
- Docker (for the local PostgreSQL)

## التشغيل | Setup

```bash
docker compose up -d db          # PostgreSQL on localhost:5433
cp .env.example .env             # then edit values
npm install
npm run db:migrate               # prisma migrate deploy
npm run db:seed                  # DEV ONLY, see warning below
npm run dev                      # http://localhost:3000
```

تحذير | Warning: `npm run db:seed` يمسح البيانات الموجودة. للتطوير فقط، ويُرفض في الإنتاج إلا مع `SEED_ALLOW_PRODUCTION=true`. اضبط `SEED_ADMIN_PASSWORD` (8 أحرف على الأقل) في `.env` قبل التشغيل، واختياريًا `SEED_STUDENT_PASSWORD` لحساب الطالب التجريبي.
`db:seed` wipes existing data. Development only (refused in production unless `SEED_ALLOW_PRODUCTION=true`). Set `SEED_ADMIN_PASSWORD` (min 8 chars) in `.env` first; optionally `SEED_STUDENT_PASSWORD` for the demo student.

### قواعد بيانات محلية قديمة | Existing local databases

If your local DB was created with `prisma db push`, mark the baseline migration as applied once, before `migrate deploy`:

```bash
npx prisma migrate resolve --applied 0_init
npm run db:migrate
```

### Docker (full stack)

```bash
docker compose up -d --build     # db + app on http://localhost:3000
```

The `app` container runs `prisma migrate deploy` and then `next start`.

## الأوامر | Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Seed dev data (wipes data) |

## الأدوار | Roles

STUDENT, TEACHER, EDITOR, ADMIN and SUPER_ADMIN roles gate access to routes and services. See `prisma/schema.prisma` (`Role` enum) and `DECISIONS.md` for the exact permissions.

## البيئة | Environment

Validated in `src/lib/env.ts` (zod). See `.env.example` for all keys: `DATABASE_URL`, `APP_URL`, `OTP_DELIVERY`, `OTP_WEBHOOK_URL`, `OTP_DEV_ECHO`, `SEED_ADMIN_PASSWORD`, `UPLOAD_DIR`. The seed script additionally reads `SEED_STUDENT_PASSWORD` and requires `SEED_ALLOW_PRODUCTION=true` before it will touch a production database.

## الأمان والخصوصية | Security & Privacy

- **الجلسات:** جلسات مخزنة في PostgreSQL مع Cookie `httpOnly` و`sameSite=lax`؛ لا NextAuth ولا JWT. تغيير كلمة المرور يُبطل الجلسات الأخرى ويُبقي الجهاز الحالي.
- **كلمات المرور:** `bcryptjs` بتكلفة 12، وحد أدنى 8 أحرف. لا توجد كلمات مرور افتراضية في الكود أو الواجهة.
- **سلامة الامتحانات:** يُرفض إعادة تقديم المحاولة المكتملة، وتُخفى مفاتيح الإجابات والشروحات عن حزمة العميل؛ تُجلب الإجابة الصحيحة فقط بعد التسليم عبر مسار محمي ومحدد المعدل.
- **النطاق الدراسي:** الطلاب لا يرون أو يُقيّمون إلا مواد وامتحانات نظامهم/صفهم/مسارهم عبر `src/lib/curriculum.ts`. الموظفون والزوار غير مقيّدين بصف.
- **رؤوس الأمان:** CSP، `X-Frame-Options: DENY`، `nosniff`، `Referrer-Policy`، `Permissions-Policy`، وHSTS في الإنتاج (انظر `next.config.ts`).
- **تحديد المعدل:** في الذاكرة لكل عملية مع الاعتماد على `x-real-ip`. عند تشغيل أكثر من نسخة/حاوية، استخدم مخزناً مشتركاً مثل Redis.
- **الصفحات القانونية:** `/privacy` و`/terms` متاحتان للعامة ومربوطتان من تذييل الصفحة الرئيسية.

## نظام التصميم | Design System

- **الخط:** IBM Plex Sans Arabic فقط.
- **اللوحة:** `#4F46E5`/`#6366F1` (أساسي)، `#0F172A`/`#F8FAFC` (نص)، `#64748B`/`#94A3B8` (ثانوي)، `#FFFFFF`/`#0F172A` (خلفية)، `#F8FAFC`/`#1E293B` (سطح)، `#E2E8F0`/`#334155` (حدود)، نجاح `#059669`/`#34D399`، تنبيه `#D97706`/`#FBBF24`، خطأ `#DC2626`/`#F87171`.
- لا تدرجات، ولا `backdrop-blur`/زجاج، ولا توهج/ظلال ملوّنة، ولا أشكال زخرفية. الظل الوحيد `shadow-sm`.
- حدود الزوايا: بطاقات 12px، أزرار 8px، حوارات 16px. الحد الأدنى للنص 13px، وأهداف اللمس 44px، والمسافات على شبكة 4px.

## الاختبارات والتحقق | Testing & Verification

```bash
npm run typecheck    # tsc --noEmit
npm test             # Vitest (6 files / 24 tests)
npm run lint         # ESLint
npm run build        # Production build (59 routes)
```

The test suite covers the Cairo calendar/streak helpers and curriculum scoping. Runtime checks should include protected API routes returning 401/403, security headers being present, and the seed guard refusing to run without `SEED_ADMIN_PASSWORD`.
