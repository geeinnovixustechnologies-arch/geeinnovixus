# Implementation Plan: MongoDB Content and Single Admin

**Branch**: `004-mongodb-content-admin` | **Date**: 2026-10-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-mongodb-content-admin/spec.md`

## Summary

Move public Research/R&D, Projects, Services, Learning Hub, and Gallery content to the
existing MongoDB-backed records, removing hard-coded demo fallbacks for those areas.
Complete single-admin CRUD by reusing the current Mongoose models, API conventions,
NextAuth credentials provider, bcryptjs, and established admin UI. Add the missing
Research model and CRUD surface; complete missing edit flows for Services, Projects,
and Gallery; and repair admin-only credentials provisioning. Remove Google sign-in,
prevent admin-account creation through public registration, and ensure every
account/provisioning path preserves exactly one admin. Document local environment setup and the safe local admin-provisioning flow.

## Technical Context

**Language/Version**: JavaScript, Node.js 24.x

**Primary Dependencies**: Next.js 16.4.2 App Router, React 19, Mongoose 8, NextAuth
4.24, bcryptjs, Tailwind CSS 4, existing shared UI components; add no dependencies.

**Storage**: Existing MongoDB/Mongoose connection (`src/lib/mongodb.js`); existing
Project, Service, LearningOffering, GalleryImage, and User models; add a Research model.

**Testing**: ESLint 9 and the Node.js built-in test runner are available. Use focused
Node tests for validation/provisioning helpers where feasible, plus authenticated and
unauthenticated API/browser smoke tests against a disposable local database. Do not add
a test dependency.

**Target Platform**: Vercel production deployment and local Windows/Node development.

**Project Type**: Next.js web application with public pages, admin pages, and route
handlers.

**Performance Goals**: Public pages display the latest saved records on the next page
load or reload within five seconds, without restart or rebuild; list interactions remain
usable with current pagination and filters.

**Constraints**: Do not commit local credentials or add a hard-coded admin password.
Do not silently fall back to bundled records when a content query fails. Preserve
current public/admin visual patterns, data fields, and authorization boundaries. Keep
Google Drive gallery entries as URLs only. Do not allow public admin registration or
additional admin provisioning. Never overwrite an existing admin password during a
repeat provisioning run.

**Scale/Scope**: One administrator; five public content sections (R&D, Projects,
Services, Learning Hub, Gallery); existing informational/legal pages are not content
management surfaces for this feature.

## Constitution Check

| Principle | Gate | Plan |
|-----------|------|------|
| Existing Libraries First | PASS | Reuse Mongoose, NextAuth credentials, bcryptjs, existing UI components, validation helpers, and route conventions. Add no package dependency. |
| Consistent UI Across Pages | PASS | Extend established list/form/admin patterns for Research, Services, Projects, and Gallery. Preserve responsive layouts and accessible form/loading/empty/error/permission states. |
| Complete and Accessible User Journeys | PASS | Cover visitor, sole-admin, and unauthorized paths; desktop/mobile; validation, success, empty, loading, database-error, and denied states. |
| Secure and Privacy-Conscious Engineering | PASS | Enforce admin role at each write boundary; hash passwords; provision locally from environment without overwrite; remove Google sign-in, restrict signup to client role, and keep secrets out of source and client output. |
| Verifiable Quality | PASS | Add focused tests using the built-in Node test runner where practical; run ESLint, production build, and local DB-backed auth/content smoke scenarios. Report any infeasible checks. |

**Gate result**: PASS. No constitutional exception or new dependency is proposed.

## Project Structure

### Documentation (this feature)

```text
specs/004-mongodb-content-admin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── content-admin-api.md
└── tasks.md                 # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── research/page.js
│   ├── projects/page.js
│   ├── services/page.js
│   ├── learning-hub/page.js
│   ├── gallery/page.js
│   ├── auth/signin/page.js
│   ├── auth/signup/page.js                 # Keep client-only registration if currently supported
│   ├── admin/
│   │   ├── research/                       # New single-admin content editor
│   │   ├── projects/                       # Add edit flow to current list/create UI
│   │   ├── services/                       # Add edit flow to current list/create UI
│   │   ├── learning-hub/page.js            # Preserve and verify full CRUD
│   │   └── gallery/page.js                 # Add edit flow to current list/create UI
│   └── api/
│       ├── research/route.js                # New public list/admin create
│       ├── research/[id]/route.js           # New item read/update/soft-delete
│       ├── projects/                        # Audit and complete existing CRUD
│       ├── services/                        # Audit and complete existing CRUD
│       ├── learning-offerings/              # Audit existing CRUD/authorization
│       ├── gallery/                         # Add edit and audit CRUD
│       ├── users/                           # Prevent creating additional admins
│       └── auth/                            # Remove OAuth and prevent public admin role assignment
├── models/
│   ├── Research.js                          # New
│   └── User.js                              # Add password hash field
└── lib/
    ├── auth.js                              # Credentials-only provider and admin guard conventions
    └── validations.js                       # Extend existing validation patterns
scripts/
└── provision-admin.mjs                      # New explicit, repeat-safe local provisioner
tests/
└── research-validation.test.mjs             # Focused built-in Node tests
```

**Structure Decision**: Extend the repository's existing Next.js App Router structure;
keep section-specific handlers and pages adjacent to their route segments. Use existing
Mongoose models where present. New code is limited to Research persistence/UI, missing
edit workflows, single-admin credential storage/provisioning, and changes needed to
connect or secure existing paths.

## Implementation Approach

1. **Audit and secure account setup first**: Add a required hashed-password field to the
   User model and normalize credential validation. Create an explicit admin provision
   command that requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`, hashes the password, and
   creates one admin only if none exists. If an admin already exists, refuse to create
   or overwrite credentials; if the configured account conflicts with an existing
   different admin or multiple admins are found, fail clearly without modifying users.
   Review and constrain all account creation and role-assignment routes so none can
   silently create a second administrator. Remove Google and other third-party auth
   providers application-wide. Preserve any existing client-only registration path,
   but ensure it cannot select or acquire the administrator role.
2. **Complete section-specific persistence and admin CRUD**: Reuse current Project,
   Service, LearningOffering, and GalleryImage models, validation, and APIs, filling
   missing edit UI/routes and verifying both hard-delete and soft-deactivation behavior.
   Add a Research model/API/admin workflow using the fields presented by the current
   Research page, replacing mock data with active MongoDB records.
3. **Wire public content to current records**: Update the R&D, Projects, Services,
   Learning Hub, and Gallery pages to read their matching public list sources and retain
   existing visual patterns, query/filter behavior, and detail links. Remove sample
   fallbacks for these sections. Ensure requests do not serve stale page/API data and
   render explicit loading, empty, and failure states. Audit corresponding homepage
   project/service sections to ensure they use the same published records rather than
   alternate hard-coded content.
4. **Verify end-to-end and document**: Add/adjust local environment instructions and
   focused tests. Exercise each section's create/read/update/remove path using the sole
   admin, verify public visibility after reload, and verify authorization, validation,
   empty, and database-failure outcomes.

## Complexity Tracking

No constitutional violations or additional dependencies are proposed.

## Implementation and Verification Results

- Implemented credentials-only authentication with a non-serialized password hash,
  a repeat-safe local administrator provisioner, singleton-admin database constraint,
  and safeguards against role promotion/deactivation/deletion through user APIs.
- Added Research model, validation, public/admin APIs, and an admin editor. Replaced
  Research, Projects, and Services public demo content with MongoDB reads; removed
  homepage service/testimonial fallbacks; completed Project/Service edit pages and
  Gallery metadata editing. Public reads use `no-store`; external Drive images remain
  URL-only.
- Removed third-party sign-in UI/providers and disabled the legacy public account and
  OAuth migration endpoints. Anonymous mutation requests to content and user endpoints
  returned HTTP 401.
- Focused ESLint passed for the modified authentication, model, API, public, admin, and
  test files. `npm test` passed all five Research validation tests. `npm run build`
  completed successfully.
- `npm start` was smoke-tested with the local MongoDB database and a temporary process
  `NEXTAUTH_SECRET`: sign-in returned HTTP 200 without a Google option, and the public
  Research, Projects, Services, Learning Hub, and Gallery endpoints returned HTTP 200
  with `Cache-Control: no-store`.
- The provisioner was run twice against a uniquely named disposable local MongoDB
  database using generated in-memory test credentials: the first run created one
  administrator; the second refused to proceed; the stored password hash and unrelated
  collections were unchanged; and the output did not contain the password. The
  disposable database was dropped afterward.
- A credentials-authenticated API integration run passed create/read/update/remove for
  each of Research, Projects, Services, Learning Hub, and Gallery, including public
  visibility after write. Invalid Research input returned 400 and an anonymous write
  returned 401; all temporary records and the disposable database were cleaned up.
- On an empty disposable database, the five public list APIs returned HTTP 200 with
  empty arrays. With MongoDB unreachable, they returned HTTP 500 and `Cache-Control:
  no-store`; the disposable empty database was dropped.
- Headless Chrome 155 checked five public pages, sign-in, and five admin management
  pages at 1365 px and 390 px, with no horizontal overflow and keyboard focus movement
  on every page. This was a basic operability check, not a full accessibility audit.
- A local single admin was provisioned in `geeinnovixus_dev`; a production-mode
  credentials login returned an admin session, and the protected Research admin page
  returned HTTP 200. Generated credentials and the NextAuth secret remain only in the
  ignored `.env.local`; no credentials were added to tracked files.
- A missing-credentials provisioner preflight also failed safely before connecting or
  writing. The first attempt to integration-test Project/Service CRUD uncovered
  validation callers using the wrong Joi result shape; those create/update handlers
  were corrected to consume Joi's `value`/`error`, and the full CRUD suite then passed.
