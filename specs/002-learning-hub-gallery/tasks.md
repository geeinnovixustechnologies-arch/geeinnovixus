---

description: "Implementation tasks for the Learning Hub, Gallery, and Navigation feature"
---

# Tasks: Learning Hub, Gallery, and Navigation Updates

**Input**: Design documents from `specs/002-learning-hub-gallery/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: The repository does not currently define a dedicated test runner and the specification does not request adding one. Validate through the focused acceptance scenarios in `quickstart.md`, lint, and production build.

**Organization**: Tasks are grouped by user story to support incremental implementation and verification.

## Phase 1: Setup

**Purpose**: Verify existing application patterns and prepare the feature integration points.

- [ ] T001 Inspect existing Mongoose models, database connection, NextAuth admin checks, and UI patterns in `src/models/`, `src/lib/`, `src/app/api/`, `src/components/`, and `src/app/admin/` before implementing feature-specific code
- [ ] T002 Identify and record all existing course and training/workshop catalog entries and their detail fields in `src/app/courses/page.js` and `src/app/training/page.js` as the migration source for the unified catalog

## Phase 2: Foundational

**Purpose**: Establish persistence and shared server-side safeguards required by the stories.

- [ ] T003 [P] Create the `LearningOffering` Mongoose model in `src/models/LearningOffering.js` with trimmed required `title` (maximum 200 characters), `description` (maximum 2,000 characters), `shortDescription` (maximum 300 characters), allowed `category`, required `level` and `duration`, optional trimmed `modules`, `software`, and `features` arrays, optional image URL and alternative text, `isActive` defaulting to true, and managed timestamps
- [X] T004 [P] Create the `GalleryImage` Mongoose model in `src/models/GalleryImage.js` with a required Google Drive `url`, trimmed non-empty `altText` and `caption`, `category` restricted to `event` or `course`, required `postedBy` User reference, `isActive` defaulting to true, and managed timestamps
- [X] T005 Identify and reuse the existing database connection and admin authorization helpers in `src/lib/` for feature routes; gallery management stores URLs only and does not use file-storage helpers

## Phase 3: User Story 1 - Browse Learning Offerings (Priority: P1)

**Goal**: Present courses, training, and workshops through a single persistent course-style Learning Hub and unified admin workflow.

**Independent Test**: Seed or migrate representative course, training, and workshop offerings; verify active records render in the same course-style listing and detail experience, an empty catalog has a clear state, admins can create/update/deactivate offerings, non-admin writes are denied, and `/courses` and `/training` resolve to the Learning Hub.

### Implementation

- [ ] T006 [US1] Implement an idempotent migration for existing hardcoded course and training/workshop offerings into `LearningOffering`, adapting source fields to the course schema without losing understandable information, in `scripts/migrate-learning-offerings.mjs`
- [ ] T007 [P] [US1] Implement public active offering listing with pagination, search, category/level filters, and admin-only `includeInactive` behavior in `src/app/api/learning-offerings/route.js`
- [ ] T008 [P] [US1] Implement offering detail reads and admin-only create, update, and deactivate operations with server-side input validation and 401/403/404/400 responses in `src/app/api/learning-offerings/[id]/route.js`
- [ ] T009 [US1] Build the canonical responsive course-style catalog with loading, empty, error, and unavailable states in `src/app/learning-hub/page.js`
- [ ] T010 [US1] Build accessible course-style offering detail pages that handle missing or inactive offerings in `src/app/learning-hub/[id]/page.js`
- [ ] T011 [US1] Build unified administrator listing, create, edit, and deactivate workflow for all learning offerings in `src/app/admin/learning-hub/page.js`
- [ ] T012 [US1] Replace the standalone training/workshop presentation with a redirect to `/learning-hub` in `src/app/training/page.js`
- [ ] T013 [US1] Preserve existing course links by redirecting `/courses` to `/learning-hub` in `src/app/courses/page.js`
- [ ] T014 [US1] Remove or redirect separate training/workshop management navigation and ensure one course-style admin workflow is linked from `src/components/Navigation.js` and relevant `src/app/admin/` navigation components

**Checkpoint**: The unified public catalog and admin workflow operate independently of Gallery and navigation label refinements.

## Phase 4: User Story 2 - View the Activity Gallery (Priority: P1)

**Goal**: Allow visitors to browse administrator-posted Google Drive image URLs for event and course images, and allow only admins to manage URL metadata.

**Independent Test**: As admin, add a publicly viewable Google Drive image URL with alt text, caption, and event/course category, verify it appears newest-first publicly, then delete the entry and confirm the Drive file is untouched. Verify invalid URLs are rejected, unauthorized management is denied, and empty and image-load-failure states remain usable.

### Implementation

- [X] T015 [P] [US2] Implement public gallery listing of active URL metadata, ordered newest first, with pagination and a derived embeddable Drive image URL in `src/app/api/gallery/route.js`
- [X] T016 [US2] Implement admin-only JSON URL metadata creation in `src/app/api/gallery/route.js`, validating HTTPS Google Drive file URLs, non-empty alt text and caption, and `event` or `course` category; do not fetch URLs or upload files
- [X] T017 [US2] Implement admin-only gallery metadata deletion in `src/app/api/gallery/[id]/route.js`; do not delete or modify the linked Drive file
- [X] T018 [US2] Build the responsive public image gallery in `src/app/gallery/page.js` with meaningful alt text, context captions, loading/empty/error states, and a per-image unavailable fallback
- [X] T019 [US2] Build the admin gallery management page with a Google Drive URL form, success/error feedback, existing-image listing, and metadata-only delete confirmation in `src/app/admin/gallery/page.js`

**Checkpoint**: Public visitors can browse gallery content while URL metadata mutations remain protected; the app performs no file upload or external file deletion.

## Phase 5: User Story 3 - Recognize Admin Sign-In and Updated Navigation (Priority: P2)

**Goal**: Update shared public navigation labels and provide an accessible, discreet admin sign-in entry without changing destinations.

**Independent Test**: At desktop and mobile sizes, verify Learning Hub, Gallery, and R & D navigation destinations; confirm the unauthenticated header has no general Sign In button, and the admin icon has an accessible name/hint and works by pointer, keyboard, and touch.

### Implementation

- [ ] T020 [US3] Update public navigation in `src/components/Navigation.js` to show Learning Hub, Gallery, and “R & D” while preserving the existing research destination
- [ ] T021 [US3] Replace the unauthenticated public Sign In button with an admin sign-in icon linking to the existing sign-in flow, with accessible labeling, visible keyboard focus, hover/focus hint, and touch-compatible activation in `src/components/Navigation.js`
- [ ] T022 [US3] Verify responsive public and admin navigation destinations remain consistent at mobile and desktop breakpoints in `src/components/Navigation.js` and relevant shared navigation components

**Checkpoint**: Shared navigation reflects the new destinations and supports pointer, keyboard, and touch access.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate cross-story integration, security, and documented acceptance flows.

- [ ] T023 Review all learning and gallery management endpoints in `src/app/api/learning-offerings/` and `src/app/api/gallery/` to verify server-side admin authorization, input validation, public active-only reads, and explicit failure handling
- [ ] T024 Run the Learning Hub, Gallery, legacy redirect, navigation, role/permission, and responsive acceptance scenarios documented in `specs/002-learning-hub-gallery/quickstart.md`; resolve feature regressions in affected `src/` files
- [ ] T025 Run the repository lint and production build checks and address feature-related failures in affected source files

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; confirms source data and existing integration patterns.
- **Foundational (Phase 2)**: Depends on setup; model definitions and reuse decisions unblock story implementation.
- **User Story 1 (Phase 3)**: Depends on foundational models and helpers.
- **User Story 2 (Phase 4)**: Depends on the foundational model and URL/auth patterns; otherwise independent of User Story 1.
- **User Story 3 (Phase 5)**: Depends on setup; can be implemented independently of the catalog and gallery.
- **Polish (Phase 6)**: Depends on all three stories.

### User Story Dependencies

- **US1 (P1)**: Independent after foundational tasks.
- **US2 (P1)**: Independent after foundational tasks; can proceed in parallel with US1 if separate contributors avoid shared navigation files.
- **US3 (P2)**: Independent after setup; can proceed alongside US1/US2, but navigation integration task T014 must be coordinated with T020-T022 because they touch shared navigation.

### Parallel Opportunities

- T003 and T004 create distinct model files.
- T007 and T008 create separate API route files after T003.
- T015 and T018 can proceed in parallel once T004 and the URL/auth patterns are confirmed; T016/T017 are sequential with their shared route/model requirements.
- US1 and US2 implementation can proceed independently after foundation.
- US3 navigation updates should be coordinated with T014 to prevent overlapping edits to `src/components/Navigation.js`.

## Implementation Strategy

### MVP First

Complete setup and foundation, then US1 as the first deliverable: migrate course/training/workshop records, expose one public course-style catalog, provide one admin workflow, and redirect legacy URLs. Validate that story independently before integrating Gallery.

### Incremental Delivery

1. Complete setup and foundational persistence/auth integration.
2. Complete US1 and validate the unified Learning Hub and legacy routes.
3. Complete US2 and validate public viewing plus protected URL metadata management.
4. Complete US3 and verify shared navigation on desktop/mobile and with keyboard/touch.
5. Run cross-story acceptance checks, lint, and production build.

### Parallel Team Strategy

After foundation, separate contributors may implement US1, US2, and US3 in parallel when shared navigation changes are coordinated; within each story, avoid parallel work on the same route or component file.
