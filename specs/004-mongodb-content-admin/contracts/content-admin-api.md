# Content and Admin API Contract

This contract documents public reads and administrator writes for the content sections.
Existing route names are preserved; the new Research endpoints follow the existing
`/api/{section}` convention. JSON response details may retain current section-specific
wrappers, but the status, access-control, and state behavior below are required.

## Public content reads

| Method and path | Access | Behavior |
|-----------------|--------|----------|
| `GET /api/research` | Public | Return active Research records, with pagination/search filters if the public page needs them |
| `GET /api/projects` | Public | Return active Projects; an authenticated admin may request inactive records |
| `GET /api/services` | Public | Return active Services; an authenticated admin may request inactive records |
| `GET /api/learning-offerings` | Public | Return active Learning Hub offerings; admin behavior remains compatible |
| `GET /api/gallery` | Public | Return active entries, omitting admin-only fields and including the safe display URL |

List responses use existing section-specific response properties and pagination metadata.
Successful empty lists are `200 OK` with an empty collection. Public reads must not
include password hashes, account secrets, internal admin attribution, or inactive records.
Responses used for live public content must not be served from a stale shared cache.

## Administrator content writes

All writes require a valid authenticated session with `session.user.role === "admin"`.
Authorization is checked inside each route handler, not only by page middleware.
Unauthenticated requests return `401`; authenticated non-admin requests return `403`.
Invalid payloads return `400` with field-level validation details where appropriate.
Missing records return `404`; persistence failures return a non-sensitive `5xx` response.

| Method and path | Behavior |
|-----------------|----------|
| `POST /api/research` | Validate and create a Research record |
| `PATCH /api/research/{id}` | Validate and update an existing Research record |
| `DELETE /api/research/{id}` | Deactivate/remove the record from public visibility |
| `POST /api/projects` | Preserve existing validated create behavior |
| `PUT /api/projects/{id}` | Preserve existing update behavior and ensure admin authorization |
| `DELETE /api/projects/{id}` | Preserve existing deactivation behavior and ensure admin authorization |
| `POST /api/services` | Preserve existing validated create behavior |
| `PUT /api/services/{id}` | Preserve existing update behavior and ensure admin authorization |
| `DELETE /api/services/{id}` | Permanently remove the Service record so it disappears from the admin list and public listing |
| `POST /api/learning-offerings` | Preserve existing administrator create behavior |
| `PATCH /api/learning-offerings/{id}` | Preserve existing administrator update behavior |
| `DELETE /api/learning-offerings/{id}` | Remove/deactivate from public listing using current lifecycle semantics |
| `POST /api/gallery` | Create a URL-only Gallery entry; do not upload image bytes |
| `PATCH /api/gallery/{id}` | Validate and update Gallery metadata |
| `DELETE /api/gallery/{id}` | Remove/deactivate the entry only; do not mutate the external image |

Successful creation returns `201`; successful update/deactivation returns `200` with the
updated public-safe record or confirmation. A failed write must never return a success
status or success-shaped UI state. Public reads after a successful write return the new
state on the next request.

## Single-admin authentication and provisioning

- `GET /api/auth/providers` exposes only the credentials provider.
- Credentials sign-in accepts normalized `email` and `password`; invalid or inactive
  users receive the existing generic authentication failure without disclosing which
  credential was incorrect.
- No public endpoint creates administrator accounts. Existing user/signup/role-change
  pathways may create client accounts only and must not permit creating an additional
  admin or changing a non-admin role to admin from an untrusted request.
- Admin provisioning is an explicit server-side command, not a public HTTP endpoint.
  It requires `MONGODB_URI`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`; it hashes the password
  before persistence and refuses to create or mutate an account if any admin already
  exists.
- Neither sign-in responses, user API responses, logs, nor client-visible data may
  expose `passwordHash`, `ADMIN_PASSWORD`, `MONGODB_URI`, or `NEXTAUTH_SECRET`.

## Public UI state contract

Pages display loading while a public read is pending, a clear empty state for successful
empty results, a clear retryable error when the data source is unavailable, and content
cards only for successfully retrieved active records. They must not silently substitute
mock/demo content on an empty or failed read.
