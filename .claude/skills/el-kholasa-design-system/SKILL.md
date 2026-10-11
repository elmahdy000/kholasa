---
name: el-kholasa-design-system
description: Enforces premium Arabic RTL design standards for الخلاصة educational PWA across all screens and components.
triggers:
  - design
  - ui
  - component
  - styling
  - layout
  - responsive
  - rtl
  - arabic
  - landing
  - dashboard
  - lesson
  - exam
  - admin
---

# EL KHOLASA Design System Skill

This skill enforces the visual identity and quality standards for **الخلاصة | EL KHOLASA**, a premium Arabic educational PWA for Egyptian Baccalaureate and secondary students.

## Visual Identity — NON-NEGOTIABLE

### Forbidden
- ❌ Gradients of any kind (background, text, border, button)
- ❌ Glassmorphism, backdrop-blur, frosted glass effects
- ❌ Neon, glow, shadow-glow, or luminous effects
- ❌ Decorative blobs, abstract shapes, or background ornaments
- ❌ Oversized Arabic headlines (>36px desktop, >28px mobile)
- ❌ Excessive whitespace that harms content density
- ❌ Generic AI-generated SaaS aesthetics
- ❌ Unverified metrics or fake statistics

### Required Palette
| Token            | Light Mode | Dark Mode  | Usage                    |
|------------------|------------|------------|--------------------------|
| Primary          | `#4F46E5`  | `#6366F1`  | Buttons, links, accents  |
| Primary Text     | `#0F172A`  | `#F8FAFC`  | Headings, body           |
| Secondary Text   | `#64748B`  | `#94A3B8`  | Captions, metadata       |
| Background       | `#FFFFFF`  | `#0F172A`  | Page background          |
| Surface          | `#F8FAFC`  | `#1E293B`  | Cards, panels            |
| Border           | `#E2E8F0`  | `#334155`  | Dividers, card borders   |
| Success          | `#059669`  | `#34D399`  | Correct answers, confirm |
| Warning          | `#D97706`  | `#FBBF24`  | Tips, caution            |
| Error            | `#DC2626`  | `#F87171`  | Mistakes, validation     |

### Typography
- **Font Family**: IBM Plex Sans Arabic ONLY (no Cairo, no Tajawal, no system fallbacks for UI)
- **Scale** (strict hierarchy):
  - Hero: 32–36px desktop / 24–28px mobile
  - Section Title: 24–28px desktop / 20–24px mobile
  - Card Title: 16–18px
  - Body: 15–16px
  - Caption/Meta: 13–14px
- **Line Height**: 1.6 for body, 1.3 for headings
- **Weight**: 700 for headings, 500 for body, 400 for captions

### Spacing System
- Base unit: **4px**
- All spacing must be multiples of 4: `4`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48`, `64`
- Never use arbitrary values like `p-5`, `gap-3`, `mt-7`
- Component internal padding: minimum `16px`
- Section vertical rhythm: `64px` desktop, `48px` mobile

### RTL Requirements
- `dir="rtl"` on `<html>` element
- All icons must be mirrored or use RTL-aware variants
- Navigation flows right-to-left
- Text alignment defaults to right
- Margins/paddings use logical properties (`ms-`, `me-`, `ps-`, `pe-`) or explicit RTL classes
- Test with actual Arabic content — never assume LTR layouts work

## Component Standards

### Buttons
- Solid fill only (no gradient, no outline-only for primary actions)
- Height: 44px minimum touch target
- Border radius: 8px
- Font weight: 700
- States: default, hover (darken 10%), active (darken 15%), disabled (opacity 50%)
- Primary: `bg-[#4F46E5] text-white`
- Secondary: `bg-[#F1F5F9] text-[#0F172A]` (light) / `bg-[#1E293B] text-[#F8FAFC]` (dark)

### Cards
- Background: `#FFFFFF` (light) / `#1E293B` (dark)
- Border: `1px solid #E2E8F0` (light) / `1px solid #334155` (dark)
- Border radius: 12px
- Padding: 24px
- No shadow unless elevated state (then `shadow-sm` only)
- Hover: subtle border color shift, NO scale/glow/lift animations

### Inputs & Forms
- Height: 44px
- Border: `1px solid #E2E8F0` / `#334155`
- Focus ring: `2px solid #4F46E5`, offset 2px
- Label above input, 8px gap
- Error state: red border + message below in `text-sm text-[#DC2626]`

### Navigation
- Desktop: horizontal top bar, max-width 1200px, height 64px
- Mobile: bottom tab bar with 5 items max, icon + label, active state uses primary color fill
- Active indicator: solid background pill, not underline or glow
- Touch targets: 48x48px minimum on mobile

### States (Every Screen Must Have)
- **Loading**: Skeleton with matching card/layout structure
- **Empty**: Illustration-free message + primary action CTA
- **Error**: Clear message + retry/action button
- **Success**: Subtle confirmation (no confetti, no giant checkmarks)

## Mandatory Workflow

When invoked or when working on any UI task:

1. **Inspect** existing code before modifying
2. **Audit** against this design system — list specific violations
3. **Fix** issues without breaking functionality
4. **Verify** at 390px, 768px, 1440px viewports
5. **Check** RTL alignment, Arabic text rendering, overflow, touch targets
6. **Repeat** until zero violations remain
7. **Never** declare completion without visual verification evidence

## Product-Specific Priorities

Apply highest scrutiny to these screens:
- Student Dashboard
- Lesson Reading Experience
- Golden Summary (الزتونة)
- Mind Maps
- Exam Builder
- Question Solving Interface
- Answer Explanations
- Admin Dashboard

## Anti-Patterns to Reject

- "Let's add a gradient to make it pop" → Use solid color + typography hierarchy
- "Add a glow/shadow for emphasis" → Use border color change or background tint
- "Make the heading bigger" → Improve spacing and weight contrast instead
- "Add decorative elements" → Remove them; let content breathe
- "Use emoji as illustration" → Use Phosphor icons with consistent weight
- "Animate everything" → Animate only functional transitions (tab switch, modal open)

## Integration Notes

- This skill overrides generic design defaults
- When conflicting with user requests, explain the violation and suggest compliant alternative
- Always preserve existing backend logic, routes, and data flow
- Prefer shadcn/ui primitives customized to this token set
- New components must pass design audit before merge