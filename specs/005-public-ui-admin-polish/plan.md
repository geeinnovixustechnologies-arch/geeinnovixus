# Implementation Plan: Public UI and Admin Navigation Polish

**Branch**: `005-public-ui-admin-polish` | **Date**: 2026-10-17 | **Spec**:
`specs/005-public-ui-admin-polish/spec.md`

**Input**: Feature specification from
`specs/005-public-ui-admin-polish/spec.md`

## Summary

Improve the public Gallery with proportional image previews and an accessible
full-image viewer, align Learning Hub, Projects, R&D, and Services cards so their content flows
without fixed-height whitespace or clipping, and make the admin dashboard the direct
navigation point for existing admin areas. Remove the Profile entry from the signed-in
administrator menu and replace duplicate dashboard quick actions with a clear set of
admin destinations. Reuse the existing Radix dialog, Lucide icons, Framer Motion,
Tailwind styling, and shared navigation; do not add dependencies or change API schemas.

## Technical Context

**Language/Version**: JavaScript ES modules; Node.js 24.x

**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS 4, Lucide React,
Framer Motion, existing Radix Dialog wrapper

**Storage**: Existing MongoDB records and externally hosted Google Drive images; no
schema or persistence changes

**Testing**: ESLint, Node.js built-in test runner (`npm test`), production build, and
focused responsive/accessibility browser checks

**Target Platform**: Vercel-hosted web application; mobile, tablet, and desktop browsers

**Project Type**: Next.js App Router full-stack web application

**Performance Goals**: No new measurable latency objective; gallery interactions and
catalog layouts must remain responsive and usable with current page data.

**Constraints**: Preserve existing page content, destinations, authorization, and
image hosting through a validated same-origin image proxy. Use existing shared
components and libraries. Maintain accessible
keyboard/touch interactions and responsive layouts. Public-user profile behavior is
outside the admin-only navigation change.

**Scale/Scope**: Public Gallery; Learning Hub, Projects, R&D, and Services listing cards; signed-in
admin navigation and dashboard links/actions. No data migrations or external API
changes; the existing gallery `displayUrl` response field points to the same-origin
proxy rather than the third-party thumbnail.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Existing Libraries First**: PASS — reuse the existing Radix Dialog wrapper,
  Lucide icons, Framer Motion, and Tailwind; no dependency is needed.
- **II. Consistent UI Across Pages**: PASS — preserve the established site card,
  navigation, focus, and responsive patterns across affected pages.
- **III. Complete and Accessible User Journeys**: PASS — account for loading, empty,
  unavailable-image, long-content, permission-denied, keyboard, touch, and close states.
- **IV. Secure and Privacy-Conscious Engineering**: PASS — keep existing admin
  authorization and public-user profile behavior; no data or authorization changes.
- **V. Verifiable Quality**: PASS — use focused automated checks plus responsive,
  keyboard, and admin workflow acceptance checks.

No gate violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/005-public-ui-admin-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-interactions.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/gallery/image/[id]/route.js # Validated same-origin image delivery
│   ├── api/gallery/route.js            # Existing gallery API and proxy URL mapping
│   ├── gallery/page.js              # Responsive image tiles and full-image viewer
│   ├── learning-hub/page.js         # Card content sizing and layout
│   ├── projects/page.js             # Card content sizing and layout
│   ├── research/page.js             # Card content sizing and layout
│   ├── services/page.js             # Card content sizing and layout
│   └── admin/page.js                # Admin destinations and concise dashboard actions
├── components/
│   └── Navigation.js                # Remove admin Profile item; preserve sign-out
└── components/ui/
    └── dialog.js                    # Existing accessible dialog primitive (reuse)
```

**Structure Decision**: Extend the current Next.js App Router application in its
existing page and shared-component locations. Keep gallery records and API response
schemas unchanged; deliver public Drive images through a strict same-origin proxy.

## Implementation Approach

1. Use the existing dialog primitive for gallery image expansion, including keyboard
   dismissal, visible close affordance, meaningful image text, and a responsive
   contain-fit image view. Keep gallery tiles consistent while using contain-fit
   previews so the full source image remains visible.
2. Serve validated, public Google Drive thumbnails through a same-origin image endpoint.
   Restrict file IDs and redirect hosts, enforce a response size limit, and use cache
   headers so the browser does not need to fetch Drive images directly.
3. Review the four catalog card compositions and remove layout behaviors that stretch
   card content to fill rows unnecessarily. Use a consistent responsive grid, natural
   content height, deliberate section spacing, and robust wrapping for long text;
   preserve meaningful actions and all record details.
4. Remove the Profile link only from the signed-in admin account menu in desktop and
   mobile navigation. Keep sign-out behavior and preserve non-admin profile access.
5. Replace dashboard quick-action duplicates with direct, labeled links to the
   destinations already offered in the admin menu. Keep useful live summary counts and
   recent activity; remove unsupported static trend/action elements and the dead
   activity link if it has no corresponding destination.
6. Validate gallery interactions at keyboard/touch sizes and catalog/dashboard layouts
   at representative narrow, medium, and wide viewports. Run focused lint, tests, and a
   production build.

## Constitution Check (Post-Design)

- **I. Existing Libraries First**: PASS — `src/components/ui/dialog.js` is already
  available; no new package is planned.
- **II. Consistent UI Across Pages**: PASS — all catalog pages use existing shared
  card patterns and responsive conventions; the dashboard and navigation keep current
  site styling.
- **III. Complete and Accessible User Journeys**: PASS — `contracts/ui-interactions.md`
  specifies image viewer keyboard/touch behavior, failures, and user roles.
- **IV. Secure and Privacy-Conscious Engineering**: PASS — profile removal is scoped
  to administrators; the image proxy accepts validated Drive file IDs, follows only
  HTTPS Google image redirects, and limits image types and response size.
- **V. Verifiable Quality**: PASS — focused checks are documented in
  `quickstart.md`.

No post-design gate violations identified.

## Complexity Tracking

No constitution violations or additional complexity require justification.
