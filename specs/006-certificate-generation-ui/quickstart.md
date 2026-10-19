# Quickstart: Admin Certificate Generation UI

## Prerequisites

- Node.js version declared by `package.json`; project dependencies installed.
- Existing local application configuration and database/auth provider available to
  sign in as an administrator.
- An administrator and a non-admin account for permission checks where available.

## Automated checks

From the repository root:

```powershell
npx eslint src/app/admin/certificates/page.js src/app/admin/page.js src/lib/certificate-validation.js
node --test tests/certificate-validation.test.mjs
npm test
npm run build
```

Expected result: focused lint, applicable validation tests, and the production build
complete without errors. If validation stays in the page rather than a shared helper,
omit `src/lib/certificate-validation.js` from the lint command.

## Manual acceptance checks

1. Start the app with `npm run dev`, sign in as an administrator, and open the
   certificate page using the dashboard destination.
2. Attempt preview with empty fields. Verify field-level errors, visible focus, and
   preservation of any entered values.
3. Enter a valid learner name, course, certificate ID, completion date, issue date,
   issuing organization, and signatory. Confirm the preview displays each field and
   updates when a value changes.
4. Verify invalid certificate-ID characters, blank or whitespace-only required text,
   excessive input lengths, and an issue date before completion are rejected.
5. Use the mock action and confirm its success state explicitly says no certificate
   was saved, issued, emailed, or verified.
6. Check keyboard-only use and narrow phone, tablet, and desktop layouts; verify no
   horizontal page overflow and no clipping of long names or notes.
7. Reload and confirm the page returns to a fresh form with no saved mock details.
8. Open the route as a non-admin and as an unauthenticated visitor; verify they cannot
   see form values or generation controls.

Refer to [the interaction contract](contracts/ui-interactions.md) and
[the data model](data-model.md) for detailed expected behavior.
