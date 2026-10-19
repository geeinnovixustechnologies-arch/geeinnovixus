# Implementation Plan: Admin Certificate Generation UI

**Branch**: `006-certificate-generation-ui` | **Date**: 2026-10-17 | **Spec**:
`specs/006-certificate-generation-ui/spec.md`

**Input**: Feature specification from
`specs/006-certificate-generation-ui/spec.md`

## Summary

Build an admin-only certificate prototype using the project's existing auth,
navigation, design system, and form patterns. Administrators enter learner and course
details, validate the required data, and inspect a live certificate preview with an
explicit mock-only completion state. Use temporary page state only: no API calls,
certificate storage, file export, email delivery, or verification in this phase.

## Technical Context

**Language/Version**: JavaScript ES modules; Node.js 24.x

**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS 4, existing shared
Radix UI components, Lucide React, and NextAuth session context.

**Storage**: None for certificate details. Form values remain in memory and are
discarded when leaving or reloading the page.

**Testing**: ESLint, Node.js built-in test runner where focused validation helpers
warrant tests, Next.js production build, and browser acceptance checks for validation,
live preview, authorization states, keyboard/touch interaction, and responsive layout.

**Target Platform**: Existing Vercel-hosted Next.js web application; supported modern
desktop and mobile browsers.

**Project Type**: Next.js App Router web application.

**Performance Goals**: Form feedback and preview updates occur immediately during
ordinary editing, without requiring network access.

**Constraints**: UI-only mock; no backend API, persistence, unique-ID guarantee, PDF or
image generation, printing, email delivery, or certificate verification. Preserve
server-side admin route protection and ensure unauthorized users cannot receive
certificate details. Reuse existing design patterns and libraries; add no dependency
unless the existing stack is unsuitable.

**Scale/Scope**: One administrator-only certificate-generation page, one dashboard
destination, a single-record details form, live preview, input validation, mock
success, and loading/permission states. Bulk processing and recipient-facing
certificate pages are out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Existing Libraries First**: PASS — use the installed shared form controls,
  buttons, badges, icons, and layout conventions; inspect installed form validation
  utilities before implementing validation. No additional package is planned.
- **II. Consistent UI Across Pages**: PASS — add the page under the current admin
  route family and use the existing dashboard/navigation patterns and UI components.
- **III. Complete and Accessible User Journeys**: PASS — plan for required/optional
  form values, validation, preview, mock-only success, loading, empty fields,
  permission-denied, keyboard, touch, and responsive states.
- **IV. Secure and Privacy-Conscious Engineering**: PASS — reuse server-side route
  protection and avoid persisting or placing learner data in URLs, logs, or browser
  storage.
- **V. Verifiable Quality**: PASS — validate field rules and page behavior with
  focused checks, browser scenarios, lint, and production build.

No gate violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/006-certificate-generation-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-interactions.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── admin/
│   │   ├── certificates/page.js      # Admin-only form, validation and preview
│   │   └── page.js                   # Direct certificate destination link
│   └── layout.js                     # Existing shared providers; unchanged
├── components/
│   ├── Navigation.js                 # Existing admin navigation convention
│   └── ui/                           # Existing form and presentation primitives
└── lib/
    ├── auth.js                       # Existing server-side route guard pattern
    └── certificate-validation.js     # Pure input and date validation if extracted

tests/
└── certificate-validation.test.mjs   # Focused validation tests if helper extracted
```

**Structure Decision**: Extend the existing Next.js App Router application under
`src/app/admin/certificates/`. Use existing authentication and shared UI components.
The route is protected by the existing `src/proxy.js` admin-role matcher, with a
client-side session state for loading and denied UI. Use the existing Input, Label,
Textarea, Button, Card, and Badge primitives. Although React Hook Form, Joi, and Yup
are installed, this one-page synchronous form uses a small pure validation helper
instead of adding resolver wiring or introducing new dependencies.

## Implementation Approach

1. Inspect admin route authorization patterns, existing shared input/textarea/button
   components, available validation utilities, dashboard destination conventions, and
   project test scripts before implementation.
2. Add a certificate destination in the admin dashboard and an administrator-only
   certificate page. Preserve the project's loading, unauthenticated, and
   non-admin permission-denied behavior.
3. Create a responsive, accessible form for learner name, course, certificate ID,
   completion and issue dates, issuing organization, signatory, and optional
   achievement note. Use explicit labels, field-level validation, date ordering,
   certificate-ID character restrictions, and appropriate text length limits.
4. Render a live certificate preview from current in-memory form values. Provide a
   mock generation confirmation that states no certificate was issued or saved.
   Editing fields after preview updates the preview; navigating away or reloading
   clears entered values.
5. Validate empty and invalid input, preview updates, explicit mock success, admin
   access, responsive layouts, keyboard/touch controls, lint, focused tests, and
   production build. Do not add backend endpoints or persist learner details.

## Constitution Check (Post-Design)

- **I. Existing Libraries First**: PASS — existing application primitives and form
  validation utilities are sufficient; no package addition is planned.
- **II. Consistent UI Across Pages**: PASS — the page is placed within the current
  admin route structure and reuses the same shared UI and navigation patterns.
- **III. Complete and Accessible User Journeys**: PASS — validation, preview, mock
  success, permission, loading, and responsive input behaviors are specified in the
  interaction contract and quickstart.
- **IV. Secure and Privacy-Conscious Engineering**: PASS — authorized admin access
  remains mandatory and entered details are never written to persistent or
  browser-accessible storage.
- **V. Verifiable Quality**: PASS — pure validation rules are covered by focused tests
  where extracted; browser and build checks cover the complete mock workflow.

No post-design gate violations identified.

## Complexity Tracking

No constitution violations or additional complexity require justification.
