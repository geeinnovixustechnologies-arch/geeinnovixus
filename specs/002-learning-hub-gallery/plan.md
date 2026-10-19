# Implementation Plan: Learning Hub, Gallery, and Navigation Updates

**Branch**: `002-learning-hub-gallery` | **Date**: 2026-10-17 | **Spec**:
`specs/002-learning-hub-gallery/spec.md`

**Input**: Feature specification from
`specs/002-learning-hub-gallery/spec.md`

## Summary

Consolidate the existing course and training/workshop public catalogs into one
administrator-managed Learning Hub using the current course-style presentation. Move
learning offerings into a persistent shared catalog, add protected admin management and
public read behavior, and redirect old catalog links to the canonical Learning Hub.
Add an admin-managed public gallery that stores publicly viewable Google Drive image
URLs and associated metadata in MongoDB; administrators do not upload files through the
application and removing a gallery entry does not affect Drive. Update shared public navigation
with the R & D label and an accessible admin sign-in icon while preserving existing
destinations and authentication.

## Technical Context

**Language/Version**: JavaScript (ES modules), Node.js 24.x

**Primary Dependencies**: Next.js 16, React 19, NextAuth.js 4, Mongoose, Tailwind CSS,
Lucide React

**Storage**: MongoDB for learning and gallery metadata; publicly viewable image files
remain in Google Drive and are referenced by URL

**Testing**: Existing ESLint CLI and Next.js production build; focused API/manual
acceptance checks documented in `quickstart.md`. No dedicated test runner is currently
configured.

**Target Platform**: Vercel-hosted Next.js application; responsive desktop and mobile
browsers

**Project Type**: Full-stack web application using Next.js App Router

**Performance Goals**: No feature-specific latency or throughput objective is specified;
catalog and gallery pages must remain navigable and usable at supported mobile and
desktop sizes.

**Constraints**: Preserve existing course-style content and authentication destinations;
admin writes require server-side admin authorization; gallery images are referenced by
public Google Drive URLs and are not uploaded or mutated by this application; do not add
dependencies when existing project facilities meet the requirement.

**Scale/Scope**: One public learning catalog, one public gallery, corresponding
administrator workflows, and the shared public navigation. No new approval workflow,
advanced gallery filtering, or additional hosting targets.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Existing Libraries First**: PASS — use the project's Mongoose, NextAuth, UI
  components, and Lucide icons; no new package or gallery storage integration is
  required.
- **Consistent UI Across Pages**: PASS — reuse the course page patterns and shared
  navigation/admin UI components; provide responsive views.
- **Complete and Accessible User Journeys**: PASS — include loading, empty, invalid URL,
  image fallback, permission-denied, keyboard focus, and touch behavior.
- **Secure and Privacy-Conscious Engineering**: PASS — authorize all management
  operations on the server, validate Google Drive URLs and metadata, do not fetch
  administrator-provided URLs server-side, and do not expose credentials.
- **Verifiable Quality**: PASS — validate API success/denial and UI states with focused
  acceptance checks, then run build and lint checks available in the repository.

No constitution gate violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/002-learning-hub-gallery/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── learning-gallery-api.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── learning-hub/                 # Canonical public catalog and offering details
│   ├── gallery/                      # Public gallery
│   ├── courses/                      # Legacy redirect/alias
│   ├── training/                     # Legacy redirect to Learning Hub
│   ├── admin/
│   │   ├── learning-hub/             # Unified offering management
│   │   └── gallery/                  # Gallery management
│   └── api/
│       ├── learning-offerings/       # Public reads and protected management
│       └── gallery/                  # Public reads and protected URL metadata management
├── components/
│   └── Navigation.js                 # Shared public navigation labels and admin entry
├── lib/
│   └── google-drive-image-url.js     # Google Drive URL validation and display URL
└── models/
    ├── LearningOffering.js           # Unified course-style catalog entity
    └── GalleryImage.js               # Google Drive URL and gallery metadata entity
```

**Structure Decision**: Extend the existing single Next.js App Router application.
Keep domain persistence in Mongoose models, handlers under `src/app/api`, public and
admin pages under `src/app`, and shared behavior/components under `src/lib` and
`src/components`. This matches the current repository structure and avoids a new
application or package boundary.

## Implementation Approach

1. Define a unified LearningOffering schema based on the existing course fields. Convert
   existing static course and training/workshop content to the common shape; keep legacy
   source labels only as internal migration provenance if needed, not as a separate
   public format.
2. Add public listing/detail and admin CRUD endpoints with server-side admin checks,
   validation, active-state filtering, and pagination consistent with existing APIs.
3. Add one course-style Learning Hub list/detail UX and one unified admin management
   workflow. Route old `/courses` and `/training` links to the canonical hub without
   exposing separate structures.
4. Add a gallery metadata model and public/admin API. Admins submit publicly accessible
   Google Drive image URLs plus alt text and event/course context. Validate the URL
   without fetching it server-side, store only metadata, and remove only the metadata
   record on deletion.
5. Add Gallery public/admin pages with a Drive URL field, required alt text and context,
   responsive image layout, empty/loading/unavailable states, and create/delete feedback.
6. Update shared navigation label, Gallery/Learning Hub destinations, and the admin
   sign-in icon with accessible name, focus hint, and touch-compatible activation.
7. Verify data conversion and routes, admin-only management, Drive URL validation and
   rendering, visitor-facing pages, old link redirects, ESLint, and production build.

## Complexity Tracking

No constitution violations. The two new MongoDB entities are required because current
course and training content is hardcoded in separate pages and gallery entries require
persistent metadata. Gallery image bytes remain in Google Drive; the application stores
only a public URL and descriptive metadata.
