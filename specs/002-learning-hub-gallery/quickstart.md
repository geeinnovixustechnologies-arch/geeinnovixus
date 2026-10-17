# Quickstart: Learning Hub and Gallery Validation

## Prerequisites

- Node.js version declared by the project, npm, and access to the project's MongoDB
  database.
- Tigris S3-compatible bucket configuration available through the existing environment
  variables: `TIGRIS_ENDPOINT`, `TIGRIS_REGION`, `TIGRIS_ACCESS_KEY_ID`,
  `TIGRIS_SECRET_ACCESS_KEY`, and `TIGRIS_BUCKET_NAME`.
- A test administrator account and a non-admin account.
- Valid NextAuth environment configuration for the local application.

## Start the application

```powershell
npm ci
npm run dev
```

Expected result: the application starts; `/learning-hub` and `/gallery` are reachable.
If database or Tigris configuration is absent, configure it locally without committing
secrets.

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
2. Upload one valid JPEG/PNG/WebP image with non-empty alternative text, caption, and
   category. Verify it appears in the management list and public Gallery.
3. Try missing metadata, an unsupported file type, and an oversized file; verify clear
   validation errors and no published gallery entry.
4. Delete an image and verify the public entry disappears and its stored object is
   removed, with an explicit error if storage removal fails.
5. Open the Gallery as a visitor; verify image context and alternative text, newest-first
   ordering, loading/empty states, and resilience when an image URL is unavailable.
6. Call gallery create/delete endpoints as an unauthenticated user and as a non-admin;
   verify requests are rejected without modifying records or objects.

Expected result: only admins can manage gallery content; public users can view published
images and understandable fallback states.

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
