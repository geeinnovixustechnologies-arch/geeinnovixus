# Research: Admin Certificate Generation UI

## Admin route protection

**Decision**: Reuse the server-side authorization pattern from existing admin pages,
with an explicit administrator role check before rendering certificate content.
Provide clear loading and access-denied/sign-in UI states consistent with the current
portal.

**Rationale**: Certificate details contain learner-identifying information. Client
session checks improve the interaction but are not sufficient as the only route
protection. Existing project auth utilities and admin route patterns avoid creating a
parallel security model.

**Alternatives considered**:
- Rely only on hiding the navigation link: rejected because direct URL access would
  remain available.
- Add new authentication behavior: rejected because the application already has
  administrator sessions and access conventions.

## Form controls and validation

**Decision**: Prefer installed shared input, label, select, textarea, button, and
alert components. Keep the form in ordinary React state, validate on submit and
provide field-level feedback; use the existing validation library/utilities if they
fit these simple synchronous rules.

**Rationale**: Required fields, a restricted certificate ID, maximum lengths, and
date ordering are bounded local checks. Shared controls preserve consistent
accessibility and styling, and synchronous validation avoids backend coupling.

**Alternatives considered**:
- Add another form or validation library: rejected absent a demonstrated capability
  gap in the existing dependencies.
- Validate only through browser-native required fields: rejected because it does not
  provide consistent field-level date-order and identifier guidance.

## Live certificate preview

**Decision**: Display a responsive, print-like certificate preview that updates from
the current in-memory form state. Mark it prominently as a prototype preview.
Simulated completion displays a success notice stating that no certificate was issued
or saved.

**Rationale**: A current-data preview is the central value of a UI-first prototype.
Explicit mock labeling prevents the preview from being mistaken for an issued,
validated credential.

**Alternatives considered**:
- Persist mock details in local or session storage: rejected because learner details
  should not outlive the current view in this phase.
- Generate downloadable files or public verification links: deferred until backend
  issuance and authenticity requirements are designed.

## Scope and quality

**Decision**: Add one administrator-only single-certificate form/preview workflow.
Add no API routes, storage models, dependencies, PDF/image generation, email
delivery, bulk processing, or verification features in this phase.

**Rationale**: The user explicitly requested a working mock UI first and backend APIs
later. A narrow scope demonstrates the user journey while preserving a clear boundary
for subsequent backend planning.

**Alternatives considered**:
- Implement issuance and storage with the UI: rejected as out of scope and inconsistent
  with the UI-first request.
- Include bulk issuance or recipient access in the prototype: rejected as a separate
  workflow requiring additional requirements and privacy design.

## Remaining unknowns

No blocking technical unknowns remain. The initial interface uses standard certificate
fields from the specification; later backend planning must determine certificate-ID
uniqueness, actual credential verification, printable/export formats, and issuance
records.
