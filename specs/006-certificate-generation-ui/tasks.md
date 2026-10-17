# Tasks: Admin Certificate Generation UI

**Input**: Design documents from `specs/006-certificate-generation-ui/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/ui-interactions.md`, and `quickstart.md`

**Organization**: Tasks are grouped by user story. This feature is an admin-only,
client-side prototype; it adds no backend API or persistence.

## Phase 1: Setup

**Purpose**: Confirm project UI, auth, and validation facilities before implementation.

- [X] T001 Inspect existing administrator page guards, shared form components and installed validation utilities in `src/app/admin/`, `src/components/ui/`, `src/lib/auth.js`, and `package.json`; record reusable options in `specs/006-certificate-generation-ui/plan.md` without adding dependencies.

## Phase 2: Foundational

**Purpose**: No shared backend, storage, or new infrastructure is required. Existing
authentication and shared UI components remain the foundation; the details form and
preview remain temporary page state.

**Checkpoint**: Complete T001 and retain existing route authorization before starting
the user stories.

## Phase 3: User Story 1 - Enter Certificate Details (Priority: P1)

**Goal**: Provide an admin-only, accessible form with required certificate details,
field-level validation, and clear errors.

**Independent Test**: As an administrator, submit an empty form and invalid identifier
and dates; verify errors are accessible, entered values remain, and no success is
shown.

### Implementation

- [X] T002 [US1] Create the admin-only certificate page shell and loading, unauthenticated, and non-admin permission states in `src/app/admin/certificates/page.js` using existing authentication and admin-page patterns; render no certificate form values for unauthorized users.
- [X] T003 [US1] Add labeled required fields for learner full name and issuing organization with the “Trimmed non-empty text; bounded length” constraint and 120-character limit, and course name with the same constraint and 160-character limit, in `src/app/admin/certificates/page.js`.
- [X] T004 [US1] Add a required certificate ID field in `src/app/admin/certificates/page.js` that accepts only letters, numbers, hyphens, and underscores and enforces the 64-character limit.
- [X] T005 [US1] Add required completion date and issue date inputs in `src/app/admin/certificates/page.js` that reject missing/invalid dates and enforce “not earlier than completion date.”
- [X] T006 [US1] Add the required signatory name field with the “Trimmed non-empty text; bounded length” constraint and 120-character limit, plus optional achievement note with the 300-character limit, in `src/app/admin/certificates/page.js`.
- [X] T007 [US1] Implement and connect submit-time validation in `src/lib/certificate-validation.js` and `src/app/admin/certificates/page.js`, enforcing all data-model constraints verbatim and rendering accessible field errors while preserving current values.

**Checkpoint**: An administrator can enter and validate all certificate details;
invalid submission never shows preview-success feedback.

## Phase 4: User Story 2 - Preview a Mock Certificate (Priority: P1)

**Goal**: Display a styled certificate preview from the current form state and a
clearly mock-only success state.

**Independent Test**: Enter valid sample details, inspect every value in the preview,
edit a field to verify it updates, and activate mock generation to verify no real
issuance or save is claimed.

### Implementation

- [X] T008 [US2] Add a responsive certificate preview to `src/app/admin/certificates/page.js` showing learner, course, certificate ID, completion date, issue date, issuing organization, and signatory from current in-memory form values.
- [X] T009 [US2] Include the optional achievement note in the preview only when non-empty and ensure long and non-Latin values wrap without clipping in `src/app/admin/certificates/page.js`.
- [X] T010 [US2] Add a validated mock-generation action and accessible success notice in `src/app/admin/certificates/page.js` stating that no certificate was saved, issued, emailed, or verified; clear or scope the notice after subsequent edits.
- [X] T011 [US2] Ensure the certificate page stores no form details in browser storage, URLs, logs, or network requests and that reload/navigation resets the prototype to a fresh form in `src/app/admin/certificates/page.js`.

**Checkpoint**: The preview always reflects current values and mock completion cannot
be mistaken for certificate issuance or persistence.

## Phase 5: User Story 3 - Access the Certificate Prototype Safely (Priority: P2)

**Goal**: Make the certificate workflow discoverable by admins only, preserving
existing server-side authorization and accessible denial states.

**Independent Test**: Navigate from the admin dashboard as an administrator, then
open the direct route as an admin, non-admin, and unauthenticated visitor; ensure only
the admin sees form values and controls.

### Implementation

- [X] T012 [P] [US3] Add a clearly labeled Certificate Generation destination linking to `/admin/certificates` in `src/app/admin/page.js`, matching existing admin destination styling and keyboard focus behavior.
- [X] T013 [US3] Verify direct access behavior for authenticated admin, authenticated non-admin, and unauthenticated visitors in `src/app/admin/certificates/page.js`; preserve existing authorization and never expose the form to denied roles.

**Checkpoint**: The administrator can discover and open the feature; other roles see
only the appropriate sign-in or access-denied state.

## Phase 6: Polish and Cross-Cutting Validation

**Purpose**: Validate the UI against the spec, privacy boundaries, responsiveness, and
existing application checks.

- [X] T014 Run focused ESLint for `src/app/admin/certificates/page.js`, `src/app/admin/page.js`, and `src/lib/certificate-validation.js`, then run `npm test` and `npm run build`; resolve regressions caused by this feature.
- [ ] T015 Run the manual scenarios from `specs/006-certificate-generation-ui/quickstart.md` and verify validation, current-value preview, mock-only messaging, admin/non-admin access, reload data reset, keyboard/touch operation, and phone/tablet/desktop layouts.
- [X] T016 Review the final implementation against `specs/006-certificate-generation-ui/spec.md`, `specs/006-certificate-generation-ui/data-model.md`, and `specs/006-certificate-generation-ui/contracts/ui-interactions.md`; confirm no backend endpoints, persistence, downloads, delivery, or verification were added.
- [X] T017 Add optional, unvalidated admin inputs and preview values for `id`, `studentName`, `domain`, `duration`, `status`, `startDate`, `endDate`, `issuedAt`, and `provider` in `src/app/admin/certificates/page.js`.

## Dependencies and Execution Order

### Phase Dependencies

- Setup (Phase 1) precedes implementation.
- Foundational (Phase 2) adds no independent task; existing auth and shared components
  are prerequisites confirmed by T001.
- User Stories 1 and 2 depend on the admin page shell from T002. Validation and form
  structure in US1 precede preview and mock completion in US2.
- User Story 3 depends on the route existing; dashboard navigation T012 can be
  implemented in parallel with form and preview work after setup.
- Polish and cross-cutting validation follows all implementation.

### User Story Dependencies

- **US1 (P1)**: Establishes the certificate page and details form. T003–T006 all
  modify `src/app/admin/certificates/page.js` and should be performed sequentially;
  T007 implements and connects shared validation after the form fields are established.
- **US2 (P1)**: Depends on valid current form state from US1. T008–T011 modify the
  same page and should be performed sequentially.
- **US3 (P2)**: T012 modifies only the dashboard and can run in parallel with US1/US2
  after setup. T013 verifies route authorization after T002.

### Parallel Opportunities

- T012 can run in parallel with page implementation after T001 because it affects a
  separate file.
- Most certificate-page tasks are sequential because they touch the same file.

## Parallel Example: User Story 3 Navigation

```text
Task: "Add the Certificate Generation dashboard destination in src/app/admin/page.js"
Task: "Implement certificate form fields and preview in src/app/admin/certificates/page.js"
```

## Implementation Strategy

### MVP First

1. Complete T001 and T002.
2. Complete US1 details form and validation (T003–T007).
3. Validate empty, invalid, and valid form behavior before continuing.
4. Complete US2 preview and mock-only success (T008–T011).
5. Add admin dashboard discovery and verify authorization (US3).
6. Run all automated and manual final checks.

### Incremental Delivery

1. Deliver admin-only data entry and validation.
2. Add a live certificate preview and explicit mock completion.
3. Add dashboard navigation and verify role-denial behavior.
4. Complete responsive, accessibility, privacy, and build validation.

## Notes

- Every task is an unchecked checkbox with a sequential ID and an exact project-relative
  file path.
- [P] indicates tasks that can safely proceed in parallel on separate files without
  depending on unfinished work.
- No standalone automated UI test task is required by the feature spec. Run the
  existing test suite and verify certificate validation boundaries in the browser.
- No certificate API, model, or durable storage task is in scope.
