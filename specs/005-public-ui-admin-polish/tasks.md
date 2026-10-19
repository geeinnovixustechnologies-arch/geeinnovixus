# Tasks: Public UI and Admin Navigation Polish

**Input**: Design documents from `specs/005-public-ui-admin-polish/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/ui-interactions.md`, and `quickstart.md`

**Organization**: Tasks are grouped by user story to support independent delivery.
No persistent data or dependency changes are planned; a bounded same-origin image
delivery route avoids browser requests to Google Drive.

## Phase 1: Setup

**Purpose**: Confirm existing UI primitives and quality-check commands before changes.

- [x] T001 Verify existing dialog, icon, and lint/test/build facilities in `src/components/ui/dialog.js`, `package.json`, and `eslint.config.mjs`; do not add dependencies.

## Phase 2: Foundational

**Purpose**: No shared data or API foundation is needed; current authorization,
content models, and route contracts remain unchanged.

**Checkpoint**: User stories can be implemented independently after setup verification.

## Phase 3: User Story 1 - Browse and View Gallery Images (Priority: P1)

**Goal**: Present undistorted, consistent gallery previews and an accessible expanded
image viewer.

**Independent Test**: Open `/gallery` with portrait, landscape, square, and failed
images; use keyboard and touch to open and close images, verify complete images and
captions remain available.

### Implementation

- [x] T002 [US1] Update gallery previews and expanded image viewer in `src/app/gallery/page.js` to fit complete images inside consistent responsive frames and use the existing accessible dialog, with descriptive text, visible close control, Escape dismissal, and unavailable-image fallback; route Drive image delivery through the validated same-origin endpoint in `src/app/api/gallery/image/[id]/route.js`.
- [x] T003 [US1] Verify gallery loading, empty, failed-image, keyboard, touch, and responsive states against `specs/005-public-ui-admin-polish/contracts/ui-interactions.md` and `specs/005-public-ui-admin-polish/quickstart.md`.

## Phase 4: User Story 2 - Browse Consistent Content Cards (Priority: P1)

**Goal**: Keep Learning Hub, Projects, R&D, and Services listing cards readable and naturally
sized across viewport widths without artificial blank space or content loss.

**Independent Test**: Compare cards with short and long content, optional details, and
actions at mobile, tablet, and desktop widths on all three pages.

### Implementation

- [x] T004 [P] [US2] Adjust card sizing, content flow, spacing, and long-text wrapping in `src/app/learning-hub/page.js` while preserving all offering information and actions.
- [x] T005 [P] [US2] Adjust card sizing, content flow, spacing, and long-text wrapping in `src/app/projects/page.js` while preserving all project information and actions.
- [x] T006 [P] [US2] Adjust card sizing, content flow, spacing, and long-text wrapping in `src/app/research/page.js` while preserving all research information and actions.
- [x] T007 [US2] Verify short, long, and sparse card content across Learning Hub, Projects, R&D, and Services at narrow, medium, and wide viewports against `specs/005-public-ui-admin-polish/quickstart.md`.

## Phase 5: User Story 3 - Navigate Admin Work from the Dashboard (Priority: P2)

**Goal**: Remove admin profile UI and provide direct dashboard access to current admin
destinations without redundant or misleading dashboard actions.

**Independent Test**: As an administrator, verify all existing admin menu destinations
are linked from the dashboard, Profile is absent, sign-out remains available, and no
broken or redundant action remains. Confirm non-admin profile access is unchanged.

### Implementation

- [x] T008 [US3] Remove the Profile link from administrator desktop and mobile menus in `src/components/Navigation.js` while preserving sign-out and non-admin profile navigation.
- [x] T009 [US3] Replace redundant or unsupported Quick Actions in `src/app/admin/page.js` with labeled links for all destinations in the existing administrator navigation; retain useful live summaries and recent activity, remove misleading static changes and the invalid activity link, and preserve loading/error/permission states.
- [x] T010 [US3] Verify dashboard destination links, admin menu behavior, sign-out, non-admin profile access, and responsive keyboard/touch usability against `specs/005-public-ui-admin-polish/contracts/ui-interactions.md` and `specs/005-public-ui-admin-polish/quickstart.md`.

## Phase 6: Polish and Cross-Cutting Validation

**Purpose**: Validate the completed implementation across all affected pages.

- [x] T011 Run focused ESLint for the affected public pages, `src/app/admin/page.js`, `src/components/Navigation.js`, gallery API handlers, and `src/app/api/gallery/image/[id]/route.js`, then run `npm test` and `npm run build`; resolve regressions caused by this feature.
- [x] T012 Review final changes against `specs/005-public-ui-admin-polish/spec.md`, `specs/005-public-ui-admin-polish/contracts/ui-interactions.md`, and `specs/005-public-ui-admin-polish/quickstart.md`; confirm no dependency, API schema, persistence, authorization, or unrelated behavior changes.

## Dependencies and Execution Order

### Phase Dependencies

- Setup (Phase 1) precedes all implementation work.
- Foundational (Phase 2) introduces no tasks; no shared infrastructure blocks stories.
- User Stories 1, 2, and 3 can be developed independently after setup.
- Polish and cross-cutting validation follows all implementation tasks.

### User Story Dependencies

- **US1 (P1)**: Independent; uses the existing gallery data and dialog primitive.
- **US2 (P1)**: Independent; T004, T005, and T006 affect separate page files and can
  run in parallel. T007 follows them.
- **US3 (P2)**: T008 and T009 affect separate files and can run in parallel. T010
  follows both.

### Parallel Opportunities

- T004, T005, and T006 can run in parallel after setup.
- T008 and T009 can run in parallel after setup.
- US1, US2, and US3 are separate workstreams, though shared final validation is
  sequential.

## Implementation Strategy

1. Complete T001 and establish the existing shared UI constraints.
2. Implement and validate US1 as the first independently demonstrable increment.
3. Implement US2 and US3 independently; parallelize only tasks affecting different
   files.
4. Run the final lint, test, build, and acceptance review in T011-T012.

## Notes

- Each checklist task specifies its affected file path.
- No new automated UI test framework is planned; validate interactions using the
  available browser workflow and run the existing project tests.
- Production browser checks passed for real same-origin gallery image delivery,
  loading/empty/failed-image states, keyboard and touch activation, Escape close,
  responsive cards on mobile/tablet/desktop, admin/non-admin menu states, and admin
  destination links.
- Keep API response schemas, persisted records, authorization, and non-admin profile
  behavior unchanged; gallery image `displayUrl` values use the same-origin proxy.
