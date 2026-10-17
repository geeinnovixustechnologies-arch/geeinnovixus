# UI Interaction Contract: Admin Certificate Generation

## Access and navigation

- Only an authenticated administrator can view the certificate form or preview.
- Unauthenticated users receive the existing sign-in/unauthorized experience.
- Authenticated non-admin users receive a clear access-denied state without
  certificate form values.
- An administrator can reach the certificate page from the admin dashboard.

## Certificate form

- Provide labeled controls for learner name, course name, certificate ID, completion
  date, issue date, issuing organization, signatory, and optional achievement note.
- Required fields are identified in visible text and programmatic labels.
- Invalid submissions preserve entered values and place a readable error beside each
  affected field; focus moves to the first invalid field or an error summary.
- Certificate ID accepts only letters, numbers, hyphen, and underscore.
- Issue date cannot precede completion date.
- Inputs and actions are operable by keyboard and touch with visible focus.

## Preview and mock completion

- The preview uses current form values and updates when any field changes.
- It displays all required certificate details and the optional note when supplied.
- It is visibly labeled as a preview/mock and not an issued certificate.
- Mock generation shows a clear success notice only after current values pass
  validation.
- The notice states that no certificate was saved, issued, emailed, or verified.
- No entered values are stored in browser storage or sent to a certificate backend.
- Reloading or leaving the page discards the mock form and status.
- Include optional inputs for `id`, `studentName`, `domain`, `duration`, `status`,
  `startDate`, `endDate`, `issuedAt`, and `provider`. Keep these added values
  unvalidated and in memory only; show supplied values in the preview without implying
  that the entered status is a real verification result.

## Layout and states

- The form and preview reflow at phone, tablet, and desktop sizes without page-level
  horizontal overflow.
- Long names, course titles, certificate IDs, and notes wrap without obscuring
  required content.
- Loading, initial empty form, field validation, preview, mock success, unauthenticated,
  and non-admin denied states are understandable and accessible.
