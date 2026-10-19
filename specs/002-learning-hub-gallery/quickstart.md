# Quickstart: Learning Hub and Gallery Validation

## Prerequisites

- Node.js version declared by the project, npm, and access to the project's MongoDB
  database.
- A test administrator account and a non-admin account.
- Valid NextAuth environment configuration for the local application.
- Publicly viewable Google Drive links to image files (shared with "Anyone with the link").

## Start the application

```powershell
npm ci
npm run migrate:learning-offerings
npm run dev
```

Run the migration once against the configured MongoDB database before starting the
application. It is safe to rerun: existing title/category records are not overwritten
or duplicated.

Expected result: the application starts; `/learning-hub` and `/gallery` are reachable.
The gallery feature requires no file-storage credentials.

## Validate the Learning Hub

1. Open `/learning-hub` on desktop and mobile viewport sizes.
2. Confirm active course, training, and workshop records use the course-style layout.
3. Open an offering detail and verify its course information is readable.
4. Sign in as admin, create/update/deactivate an offering in the unified management page,
   then confirm public visibility reflects its active state.
5. Open legacy `/courses` and `/training` URLs and confirm each resolves to the canonical
   Learning Hub without showing an independent training/workshop structure.
6. Request the public listing without an admin session; verify inactive records are not
   exposed.

Expected result: one unified public catalog and one admin workflow; legacy links remain
usable.

## Validate Gallery administration and public view

1. Sign in as admin and open the gallery management page.
2. Add a publicly viewable Google Drive image URL with non-empty alternative text,
   caption, and category. Verify the image appears in the management list and public
   Gallery.
3. Try an invalid or non-Google Drive URL and missing metadata; verify clear validation
   errors and no published gallery entry.
4. Delete a gallery entry and verify it disappears from the public gallery while its
   Google Drive file remains unchanged.
5. Open the Gallery as a visitor; verify image context and alternative text, newest-first
   ordering, loading/empty states, and resilience when a link is private, deleted, or
   otherwise unavailable.
6. Call gallery create/delete endpoints as an unauthenticated user and as a non-admin;
   verify requests are rejected without modifying records or objects.

Expected result: only admins can manage URL metadata; public users can view published
images and understandable fallback states. The application does not upload or delete
image files.

## Validate shared navigation

1. On desktop and mobile, confirm public navigation links to Learning Hub, Gallery, and
   the existing research route labeled "R & D".
2. Confirm the unauthenticated navigation has no general "Sign In" label and includes an
   admin sign-in icon.
3. Hover and keyboard-focus the icon; verify its accessible name and explanatory hint.
4. Activate the icon by keyboard and touch; verify it opens the existing admin sign-in
   destination.

## Quality checks

```powershell
npm run lint
npm run build
```

Expected result: changed files pass lint and the production build completes. Record
unrelated pre-existing lint failures separately from feature regressions. Manual
acceptance scenarios above are required because the repository does not currently define
a dedicated automated test runner.

See [API contracts](contracts/learning-gallery-api.md) and [data model](data-model.md)
for response behavior and validation rules.
