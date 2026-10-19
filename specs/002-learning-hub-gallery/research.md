# Research: Learning Hub, Gallery, and Navigation Updates

## Decision: Use the existing course presentation as the canonical learning format

**Rationale**: The feature specification explicitly says courses, training, and workshops
must use the existing course structure. The public pages currently contain separate
`mockCourses` and `mockTrainings` data, so the implementation must consolidate the
offering data and use one shared listing/detail presentation rather than merely relabel
the current navigation.

**Alternatives considered**:
- Keep the training page and only link to it from Courses: rejected because it preserves
  the separate structure the specification asks to remove.
- Keep two independent datasets and merge them only in the browser: rejected because it
  leaves administration and future updates inconsistent.

## Decision: Introduce a persistent unified learning-offering record and admin workflow

**Rationale**: Existing course and training content is embedded in public page modules;
there is no course/training model or admin CRUD API. Admin management of all learning
offerings therefore requires a persistent shared record and protected create, update,
list, and removal operations. The record uses course-style fields, with migrated
training/workshop content adapted into those fields.

**Alternatives considered**:
- Reuse the `Service` model: rejected because services have pricing and order-oriented
  fields that do not match courses.
- Keep hardcoded public content: rejected because administrators must manage the unified
  catalog.

## Decision: Store and render admin-provided Google Drive URLs

**Rationale**: The user specified that administrators will upload images to Google Drive
themselves and enter the resulting URL in the admin gallery. The application stores that
public URL and associated metadata in MongoDB, then derives an embeddable Google Drive
image URL for the browser. Google Drive files must be shared so anyone with the link can
view them. Removing a gallery entry deletes only its metadata; the Drive file is not
modified.

**Alternatives considered**:
- Upload files through this application's API or store them in Tigris: rejected because
  the requested workflow is URL-only and should not add file-upload or storage
  infrastructure.
- Fetch the provided URL on the server to validate it: rejected to avoid SSRF and
  unnecessary network access; URL shape is validated and actual availability is handled
  by the browser's image error fallback.

## Decision: Enforce gallery and learning administration at server API boundaries

**Rationale**: Existing API routes use NextAuth `getServerSession` and role checks. New
write and management endpoints must authorize the admin role on the server, independently
of hidden or protected UI controls. Public reads return only active learning offerings
and published gallery entries.

**Alternatives considered**:
- Rely only on admin-page visibility: rejected because clients can call endpoints
  directly.

## Decision: Keep existing research destination and authentication flow

**Rationale**: The request changes only the public display label to "R & D" and replaces
the general sign-in label with an admin sign-in icon. Preserve the existing `/research`
and `/auth/signin` destinations, and expose a tooltip plus an accessible name and focus
behavior so the control is usable without hover.

**Alternatives considered**:
- Change the research URL or add a new authentication path: rejected as outside the
  requested behavior.

## Decision: Redirect legacy learning URLs to Learning Hub

**Rationale**: The clarified specification requires existing public links to standalone
training/workshop pages to lead to the consolidated destination. Redirecting the current
`/training` route preserves incoming links while removing the separate visitor-facing
structure. The Courses route may redirect or remain as an alias to Learning Hub; use one
canonical Learning Hub route and preserve old course links.

**Alternatives considered**:
- Return not found for old URLs: rejected because it unnecessarily breaks existing links.

## Google Drive URL behavior

Accept HTTPS `drive.google.com` file/share links with a recognizable file ID and render
them through the Drive `uc?export=view&id=...` image endpoint. The original URL is
preserved as metadata. The source file must be publicly viewable; private, deleted, or
non-image files display the per-image unavailable state. The application never fetches
URLs server-side and never uploads, deletes, or changes Drive files.
