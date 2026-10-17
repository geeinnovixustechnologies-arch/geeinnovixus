# Data Model: MongoDB Content and Single Admin

This feature uses existing MongoDB content collections where present. It introduces a
Research record and password-hash storage on the existing User record. Admin-created
content is active/published on creation unless the existing section workflow explicitly
supports a draft state.

## Research Record (new)

Represents one public R&D offering/domain managed in the admin portal.

| Field | Type | Rules |
|-------|------|-------|
| `title` | String | Required, trimmed, bounded (maximum 200 characters) |
| `description` | String | Required, trimmed, bounded (maximum 2000 characters) |
| `category` | String | Required, bounded (maximum 100 characters) |
| `domain` | String | Required, bounded (maximum 100 characters) |
| `services` | String array | Trimmed entries; reject empty or oversized entries |
| `features` | String array | Trimmed entries; reject empty or oversized entries |
| `deliveryTime` | String | Optional, bounded (maximum 100 characters) |
| `popularity` | Number | Optional, finite and between 0 and 100 |
| `rating` | Number | Optional, finite and between 0 and 5 |
| `icon` | String | Optional, bounded; treated as display text/icon identifier, never executable markup |
| `color` | String | Optional; restricted to existing approved style tokens |
| `isActive` | Boolean | Defaults to `true`; public listing filters to active records |
| `createdAt`, `updatedAt` | Date | Managed timestamps |

Existing Research page values are migration/reference examples only; they are not
implicitly inserted as production records. Any local sample content must use an explicit,
repeat-safe development seed action and must never be silently presented after a query
failure.

## Project Record (existing)

Existing fields remain the source of truth: title, description, short description,
category/domain/tags/technologies, pricing, images, links, features, difficulty, estimate,
requirements, deliverables, featured state, and `isActive` publication state. Preserve
model validation and extend the current admin edit flow rather than duplicating fields in
a new schema.

## Service Record (existing)

Existing fields remain authoritative: name, description, short description, category,
subcategory, pricing, features, delivery time, process, requirements, deliverables,
`isPopular`, and `isActive`. Public card labels must map these fields without hard-coded
fallback records.

## Learning Offering (existing)

Preserve the existing course-style offering model and its supported fields (including
title, descriptions, category, level, duration, modules/features, and `isActive`). Keep
existing list/detail and admin CRUD behavior; verify validation and publication semantics
against the single admin requirements.

## Gallery Entry (existing)

Preserve URL-only storage: publicly viewable Google Drive URL, alt text, caption,
event/course category, `postedBy`, and `isActive`. Editing metadata updates the entry;
removing an entry removes/deactivates the database record and never deletes the remote
image file. Public reads omit private attribution fields.

## Administrator User (existing; password hash added)

Represents the only account permitted to manage content.

| Field | Type | Rules |
|-------|------|-------|
| `name` | String | Required, trimmed |
| `email` | String | Required, normalized lowercase, unique |
| `passwordHash` | String | Required for credentials authentication; one-way bcrypt hash; never returned from APIs or session |
| `role` | String | `admin` for the provisioned account |
| `isActive` | Boolean | Must be `true` to authenticate |
| `lastLogin` | Date | Updated after successful authentication |

The provisioner accepts a plain password only from server-side environment configuration,
hashes it before persistence, never prints it, never creates a second administrator, and
never overwrites an existing password. Account uniqueness is enforced against existing
database contents as well as email uniqueness.

## Environment Configuration (not persisted as content)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Required connection URI; local example targets `geeinnovixus_dev` on loopback |
| `NEXTAUTH_SECRET` | Required secret for signing/encrypting sessions |
| `NEXTAUTH_URL` | Canonical application URL; local example `http://localhost:3000` |
| `ADMIN_EMAIL` | Email of the one provisioned administrator |
| `ADMIN_PASSWORD` | Local/deployment secret used only by the explicit provisioner; never committed or exposed to client |

Environment values are server-only, stored in ignored local configuration or deployment
secret settings, and must not be included in logs, public responses, or rendered page
data.

## Relationships and states

- Public listings read active (`isActive: true`) records from their corresponding
  collections; the admin view can inspect and manage inactive records.
- A content change moves from persisted current state to the new persisted state only
  after validation and successful database write. A failed write leaves the prior state.
- One Administrator User is authorized to create, edit, and remove all five content
  types. Visitors have read-only access to published content.
