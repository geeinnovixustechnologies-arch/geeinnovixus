# Quickstart: Public UI and Admin Navigation Polish

## Prerequisites

- Node.js version declared by `package.json`.
- Project dependencies installed.
- Local MongoDB configured and reachable through the existing `.env.local`.
- A provisioned administrator account for dashboard checks.
- At least one gallery image and multiple Learning Hub, Project, R&D, and Services records,
  including short and long content and varied gallery image dimensions.

## Automated checks

From the repository root:

```powershell
npx eslint src/app/gallery/page.js src/app/learning-hub/page.js src/app/projects/page.js src/app/research/page.js src/app/admin/page.js src/components/Navigation.js
npm test
npm run build
```

Expected result: lint, all focused tests, and the production build complete without
errors.

## Manual acceptance checks

1. Start the application with `npm run dev` and open `/gallery`.
2. Verify portrait, landscape, and square images appear without distortion or hidden
   source content. Activate an image by keyboard and touch; verify the complete image,
   descriptive text, visible close control, Escape dismissal, and image-failure
   fallback. Confirm gallery images are loaded through `/api/gallery/image/{fileId}`.
3. Open `/learning-hub`, `/projects`, `/research`, and `/services` at narrow mobile,
   tablet, and desktop widths. Verify varied card content remains readable, naturally
   sized, non-overlapping, and free of avoidable blank card areas.
4. Sign in as the administrator and open `/admin`. Verify dashboard links cover all
   existing admin destinations and open their correct pages. Verify there are no
   duplicate quick-action links, profile controls are absent from admin navigation,
   sign-out remains available, and dashboard loading/error behavior remains clear.
5. Sign in as a non-admin account if available and confirm its existing profile access
   has not changed.

## Scope note

The feature does not change gallery records, response schemas, Google Drive hosting,
or authorization. Gallery image bytes are delivered through a bounded same-origin
route. Reference [UI interaction contracts](contracts/ui-interactions.md) and [data
model](data-model.md) for expected behavior and data boundaries.
