# Tasks: MongoDB Content and Single Admin

**Input**: Design documents from `specs/004-mongodb-content-admin/`

**Prerequisites**: `plan.md`, `spec.md`; supporting decisions in `research.md`, entity
constraints in `data-model.md`, API behavior in `contracts/content-admin-api.md`, and
manual scenarios in `quickstart.md`.

**Tests**: No test framework currently exists and the feature specification does not
require adding a regression suite. Use focused checks and documented smoke scenarios;
add only Node built-in tests for isolated security-sensitive helpers if feasible.

**Organization**: Tasks are grouped by independently verifiable user story. Every task
has an exact file path or explicit set of paths.

## Phase 1: Setup

**Purpose**: Prepare only the feature-specific project configuration and documentation.

- [X] T001 [P] Update `env.example` with the local MongoDB URI example `mongodb://127.0.0.1:27017/geeinnovixus_dev` and the documented `ADMIN_PASSWORD` variable without including real credentials.
- [X] T002 [P] Update `README.md` with the local environment, provisioning, `npm run build`, and `npm start` flow from `specs/004-mongodb-content-admin/quickstart.md`.

## Phase 2: Foundational Security and Persistence

**Purpose**: Establish the shared account, validation, and data-access foundations required by the content and admin journeys.

- [X] T003 Add a server-only `passwordHash` field to `src/models/User.js`; keep hashes out of profile virtuals and serialized/public user responses.
- [X] T004 Update credentials authorization in `src/lib/auth.js` to normalize email, verify active users using `passwordHash`, update `lastLogin`, and return a generic failure for invalid credentials.
- [X] T005 Remove Google and other third-party providers and their account-provisioning callback from `src/lib/auth.js`; retain credentials-only authentication and current session role claims.
- [X] T006 Audit `src/app/api/users/route.js`, `src/app/api/users/[id]/route.js`, `src/app/api/auth/create-test-user/route.js`, `src/app/api/auth/fix-user-roles/route.js`, `src/app/api/auth/migrate-oauth-users/route.js`, and `src/app/auth/signup/page.js`; prevent public role assignment/promotion and any user-facing path from creating a second admin, while retaining client-only registration if supported.
- [X] T007 Add `scripts/provision-admin.mjs` and the `provision:admin` script in `package.json`; require `MONGODB_URI`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`, validate and normalize email, hash the password, create exactly one admin only when none exists, and fail without mutation or password output if an admin already exists or multiple admins are found.
- [X] T008 Verify `.gitignore` excludes `.env.local`, `env.example` contains placeholders only, and no local secret is tracked or exposed; document findings in `specs/004-mongodb-content-admin/quickstart.md`.

## Phase 3: User Story 1 - Browse Current Published Content (Priority: P1) - MVP

**Goal**: Visitors see current published MongoDB records for R&D, Projects, Services, Learning Hub, and Gallery instead of demo content.

**Independent Test**: With active records present in the local database, open or reload each public page and verify it displays the corresponding records; with an empty collection, verify an empty state; with MongoDB unavailable, verify a visible data error and no silent mock fallback.

### Implementation for User Story 1

- [X] T009 [P] [US1] Create `src/models/Research.js` with `title` required/trimmed/max 200 characters, `description` required/trimmed/max 2000 characters, `category` and `domain` required/max 100 characters, trimmed `services` and `features` arrays rejecting empty or oversized entries, optional `deliveryTime` max 100 characters, optional finite `popularity` from 0 to 100, optional finite `rating` from 0 to 5, safe optional `icon`, approved-token `color`, `isActive` defaulting true, and timestamps.
- [X] T010 [US1] Create `src/app/api/research/route.js` with a public active-only GET listing and administrator-only validated POST; return empty lists as 200 and non-sensitive errors on database failure.
- [X] T011 [US1] Create `src/app/api/research/[id]/route.js` with GET, PATCH, and DELETE; enforce administrator role for mutations, validate updates, return 404 for missing records, and deactivate removed records from public visibility.
- [X] T012 [P] [US1] Replace static Research examples in `src/app/research/page.js` with `/api/research` results while preserving search, category/domain filtering, existing visual patterns, and explicit loading, empty, and error states.
- [X] T013 [P] [US1] Replace demo/placeholder content in `src/app/projects/page.js` with `/api/projects` results; preserve existing filters/details and render explicit loading, empty, and error states without static fallback records.
- [X] T014 [P] [US1] Replace hard-coded Services cards in `src/app/services/page.js` with `/api/services` results; map persisted Service fields to existing cards and render loading, empty, and error states without fallback records.
- [X] T015 [US1] Verify `src/app/learning-hub/page.js` and `src/app/gallery/page.js` fetch fresh public records after navigation/reload, show their current loading/empty/error states, and do not substitute demo records on failures.
- [X] T016 [US1] Remove or gate hard-coded fallback services and testimonials in `src/app/page.js`; ensure homepage projects/services/testimonials display persisted active records or explicit empty/error states.
- [X] T017 [US1] Prevent stale shared caching for public reads in `src/app/api/research/route.js`, `src/app/api/projects/route.js`, `src/app/api/services/route.js`, `src/app/api/learning-offerings/route.js`, and `src/app/api/gallery/route.js`; verify a successful write appears on the next page load within five seconds.

## Phase 4: User Story 2 - Manage Public Content as the Sole Administrator (Priority: P1)

**Goal**: The authenticated sole admin can create, edit, and remove all five content types; each persisted change appears publicly and unauthorized writes fail.

**Independent Test**: Sign in as the provisioned admin, perform create/edit/remove on Research, Projects, Services, Learning Hub, and Gallery, and verify each public result; repeat a write unauthenticated and verify a 401/403 with no data change.

### Implementation for User Story 2

- [X] T018 [P] [US2] Create `src/app/admin/research/page.js` with responsive list/create/edit/deactivate controls using existing shared admin components; include validation, loading, success, failure, empty, and permission states for Research fields from `specs/004-mongodb-content-admin/data-model.md`.
- [X] T019 [P] [US2] Add an edit form/route under `src/app/admin/projects/[id]/edit/page.js` and `src/app/admin/projects/[id]/edit/` support files as needed; use existing Project fields and `PUT /api/projects/{id}`, retaining field validation and admin-only access.
- [X] T020 [P] [US2] Add an edit form/route under `src/app/admin/services/[id]/edit/page.js` and `src/app/admin/services/[id]/edit/` support files as needed; use existing Service fields and `PUT /api/services/{id}`, retaining field validation and admin-only access.
- [X] T021 [US2] Add Gallery update validation and `PATCH` handling to `src/app/api/gallery/[id]/route.js`; update metadata only and never upload or delete the external Google Drive image.
- [X] T022 [US2] Extend `src/app/admin/gallery/page.js` with Gallery edit controls and form state for URL, alt text (required, max 300), caption (required, max 500), and category (`event` or `course`); surface save errors and success only after persistence.
- [X] T023 [US2] Audit create/update/delete authorization and field validation in `src/app/api/projects/route.js`, `src/app/api/projects/[id]/route.js`, `src/app/api/services/route.js`, `src/app/api/services/[id]/route.js`, `src/app/api/learning-offerings/route.js`, and `src/app/api/learning-offerings/[id]/route.js`; preserve existing model constraints and ensure public requests cannot mutate content.
- [X] T024 [US2] Verify the admin navigation/dashboard exposes Research, Projects, Services, Learning Hub, and Gallery management routes using `src/components/Navigation.js`, `src/app/admin/page.js`, and existing admin navigation components; align labels and responsive behavior with existing conventions.

## Phase 5: User Story 3 - Sign In with the Single Admin Account (Priority: P1)

**Goal**: The single provisioned administrator signs in via email/password only; public visitors cannot register or promote themselves to admin.

**Independent Test**: Verify `/auth/signin` offers credentials only, correct provisioned credentials grant admin access, invalid credentials fail generically, and no public request or UI creates/promotes another admin.

### Implementation for User Story 3

- [X] T025 [P] [US3] Remove Google/GitHub sign-in buttons, provider loading state, and third-party sign-in handlers from `src/app/auth/signin/page.js`; remove any admin account creation link while preserving client-only signup navigation if the current app requires it.
- [X] T026 [US3] Ensure `src/app/auth/signup/page.js`, `src/app/api/users/route.js`, `src/app/api/users/[id]/route.js`, and `src/app/api/auth/create-test-user/route.js` can create client accounts only and cannot set or promote a user to `admin`.
- [X] T027 [US3] Restrict or disable `src/app/api/auth/fix-user-roles/route.js` and `src/app/api/auth/migrate-oauth-users/route.js` so no public unauthenticated endpoint can create/promote admins or bypass credentials-only sign-in.
- [X] T028 [US3] Verify `src/proxy.js` and every content write route return denied access for unauthenticated and non-admin users, including direct API requests outside `/api/admin`.

## Phase 6: User Story 4 - Configure a Local Verification Environment (Priority: P2)

**Goal**: A developer can configure a safe local database and sole admin, then build/start and verify public and admin behavior without production credentials.

**Independent Test**: Follow `specs/004-mongodb-content-admin/quickstart.md` from a clean local setup, provision the local admin once, run build/start, sign in, and verify content CRUD and environment secrecy.

### Implementation for User Story 4

- [X] T029 [P] [US4] Document `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `env.example` using placeholders and the loopback-only `geeinnovixus_dev` URI; preserve all unrelated examples.
- [X] T030 [US4] Update `README.md` and `specs/004-mongodb-content-admin/quickstart.md` with local database prerequisite, ignored `.env.local` setup, explicit `npm run provision:admin`, `npm run build`, `npm start`, and safe repeat-provisioning behavior; state that credentials are user-supplied and never printed or committed.
- [X] T031 [US4] Run `npm run provision:admin` twice against the dedicated local database and verify first-run creation and repeat-run refusal without a second admin, password reset, secret output, or unrelated collection changes.
- [X] T032 [US4] Verify `npm run build` and `npm start` with the documented local environment; confirm missing/invalid configuration fails explicitly without exposing environment values.

## Phase 7: Polish and Cross-Cutting Validation

**Purpose**: Verify all stories and preserve a secure, consistent, operable application.

- [X] T033 [P] Run focused ESLint on modified authentication, model, API, public, and admin files using `npx eslint` with the exact changed paths.
- [X] T034 [P] Verify public and admin layouts at desktop/mobile sizes and keyboard-only navigation for Research, Projects, Services, Learning Hub, Gallery, and sign-in; record results in `specs/004-mongodb-content-admin/quickstart.md`.
- [X] T035 Run the complete create/read/update/remove, validation, empty/error, unauthorized-write, and provisioning-repeat scenarios from `specs/004-mongodb-content-admin/quickstart.md`; record passed/blocked results and remove only the test records created in the dedicated local database.
- [X] T036 Verify `git diff --check`, `.env.local` ignore status, and absence of local credentials/password hashes in tracked changes; update `specs/004-mongodb-content-admin/plan.md` with validation results and remaining limitations.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; configuration documentation can be updated independently.
- **Foundational (Phase 2)**: Depends on setup; blocks authentication and management work that assumes safe admin identity.
- **US1 (Phase 3)**: Depends on foundational account/data boundaries; public Research CRUD can proceed alongside page wiring once the model contract is agreed.
- **US2 (Phase 4)**: Depends on foundational role enforcement and public models; admin create/edit/remove flows can be implemented per section.
- **US3 (Phase 5)**: Depends on foundational credentials storage and provisioning; may be worked on alongside section CRUD after foundation.
- **US4 (Phase 6)**: Depends on provisioner and account behavior from Phase 2 and runtime behavior from US1/US3.
- **Polish (Phase 7)**: Depends on all selected stories being complete.

### User Story Dependencies

- **US1 (P1)**: Begins after Phase 2. Provides public current-record behavior and is the MVP.
- **US2 (P1)**: Begins after Phase 2; admin CRUD depends on existing public API/model contracts but is otherwise section-parallel.
- **US3 (P1)**: Begins after Phase 2; complete sign-in requires the password hash and provisioner.
- **US4 (P2)**: Requires the explicit provisioner from Phase 2 and usable public/admin flows from US1–US3.

### Parallel Opportunities

- T001 and T002 can proceed in parallel.
- Within US1, Research model/API work (T009–T011) is separate from public Projects and Services wiring (T013–T014); pages for Research, Projects, and Services touch different files (T012–T014).
- Within US2, the Research admin page and Projects/Services edit pages (T018–T020) touch separate files and can proceed in parallel after APIs exist.
- US1 public-page wiring and US3 sign-in UI changes touch separate page files and can proceed in parallel after foundational tasks.
- Documentation tasks T029 and T030 touch separate files and can proceed in parallel.
- T033 lint and T034 responsive/keyboard review can proceed independently after implementation stabilizes.

### Implementation Strategy

1. Complete environment/docs setup and foundational authentication/data safety.
2. Deliver MVP US1 public Mongo-backed records and Research CRUD; verify active, empty, and failure states.
3. Complete US2 administrator CRUD by section, reusing existing admin UI and APIs.
4. Complete US3 credentials-only single-admin experience and confirm every role-change path is closed to public callers.
5. Complete US4 local verification setup and repeat-safe provisioning.
6. Run cross-cutting quality checks and update the plan with actual results.

**MVP scope**: US1, provided the administrator provisioning/authentication foundation is complete. Public pages display only current MongoDB content with explicit empty/error states; full self-service CRUD follows as US2.
