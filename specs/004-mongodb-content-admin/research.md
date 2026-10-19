# Research: MongoDB Content and Single Admin

## Decision: Extend the existing MongoDB/Mongoose content architecture

**Rationale**: The application already has a cached Mongoose connection and models for
Projects, Services, Learning Hub offerings, and Gallery entries. Their route handlers
already implement public active-record queries and administrator-only writes. Completing
those existing surfaces minimizes migration risk and avoids a parallel content system.

**Alternatives considered**: Introduce a new generic CMS collection or replace Mongoose
with another persistence layer. Rejected because separate section models and APIs already
exist, and a broad storage redesign is not required by the feature.

## Decision: Add a Research collection and matching route/admin flow

**Rationale**: The current Research page presents hard-coded domain records and has no
Research model, API, or admin page. Its visible content includes title, description,
category, domain, service/topic list, features, delivery time, popularity, rating, icon,
and color; these fields give the admin a source-of-truth editable record shape.

**Alternatives considered**: Reuse Service or Project records as research records.
Rejected because their schemas and meaning differ, so reusing them would cause unclear
data ownership and lossy UI mapping.

## Decision: Use environment-driven credentials and an explicit single-admin provisioner

**Rationale**: `User` currently has role and active status but no persisted password
field. The credentials provider already uses bcrypt comparison, but its stored field is
absent. Persist only a one-way password hash, accept the admin email/password through
ignored local/deployment environment settings, and provide an explicit provision command
that fails closed if an administrator already exists. Never echo the password or reset
an existing account as part of repeated setup.

**Alternatives considered**: Hard-code or commit a default password; create an admin
automatically on every application startup; expose an admin registration form. Rejected
because these approaches leak credentials, introduce unsafe startup writes, or violate
the one-admin/no-registration requirement.

## Decision: Restrict sign-in to email/password and administrator creation to provisioning

**Rationale**: The user explicitly requested email/password sign-in only, no Google
option, and no admin-account creation from the UI. The current shared sign-in page has
Google OAuth and a create-account link; the auth configuration also provisions client
accounts on Google sign-in. Remove third-party providers application-wide. Existing
client registration may remain, but it must assign only the client role and cannot
create or promote an administrator; the sole admin is provisioned out of band.

**Alternatives considered**: Hide the Google button but keep the server provider, or keep
Google sign-in for non-admin users. Rejected because the clarified requirement is
email/password-only application-wide. Removing all client registration was also
considered but is unnecessary to enforce a sole administrator; client-only registration
can remain if it exists today.

## Decision: Reuse existing section models and admin forms; add only missing edit flows

**Rationale**: Admin management exists for Learning Hub and Gallery (Gallery currently
lacks editing), and Projects/Services have list and create pages with existing update
and soft-delete endpoints but lack edit pages. Complete these patterns with the existing
shared components and validation utilities, and use the same established visual patterns
for Research.

**Alternatives considered**: Add a new admin framework or generic custom form library.
Rejected because the current dependencies and admin UI patterns meet the requirement.

## Decision: Fresh page-load reads; no push-based updates

**Rationale**: The spec defines real-time updates as appearing on the next page load or
reload within five seconds, not updates pushed to already-open pages. Public reads can
use the current API responses with explicit non-cacheable data behavior, which preserves
the requested outcome without a new streaming or event service.

**Alternatives considered**: WebSockets, server-sent events, periodic polling, or a
hosted realtime service. Rejected because they solve a stronger live-update requirement
than the spec requests and would add unnecessary operational complexity.

## Decision: Add no external test or runtime dependencies

**Rationale**: ESLint and production builds exist, but the repository has no configured
test runner. Use Node's built-in test runner for isolated validation/provisioning
behavior where suitable, and exercise Mongo-backed flows using a disposable local
database with documented smoke checks.

**Alternatives considered**: Add Jest, Vitest, or a browser automation dependency.
Deferred because the requested feature does not require a new framework and existing
tools can validate the security and content flows.

## Repository findings

- MongoDB connection: `src/lib/mongodb.js`.
- Existing content models: `src/models/Project.js`, `Service.js`,
  `LearningOffering.js`, and `GalleryImage.js`.
- Public Projects and Services pages have demo values while their Mongo-backed API
  routes already exist. Learning Hub and Gallery already fetch their APIs.
- The Research page defines hard-coded mock engineering records; no Research model or
  CRUD route exists.
- Project and Service API routes support list/create and item update/deactivation;
  their admin list/create UIs expose edit links without matching edit pages.
- Gallery supports list/create/delete but not edit. Learning Hub already has a public
  listing, detail route, admin page, and CRUD APIs.
- NextAuth v4 is configured for Google and credentials; `User` has no password field
  even though credential authorization calls bcrypt comparison.
- `src/proxy.js` protects `/admin` and `/api/admin`; each content write handler must
  also enforce role authorization because most are not under `/api/admin`.
- The sign-in page includes Google sign-in and a link to account registration.
- `env.example` and `README.md` document local setup, but the example does not include
  `ADMIN_PASSWORD` and uses a different MongoDB database name than the local dev URI.
- Package scripts include `lint`, `build`, and `start`; no test framework is configured.

## Open questions

None. Product assumptions about the five content sections and refresh-on-next-load
behavior are recorded in `spec.md`.
