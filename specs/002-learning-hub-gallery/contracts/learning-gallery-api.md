# Learning Hub and Gallery API Contracts

All endpoints return JSON except multipart upload requests. Management endpoints require
a valid authenticated session whose user role is `admin`; failed authorization returns
HTTP 401 or 403 and performs no write.

## Learning offerings

### `GET /api/learning-offerings`

Publicly lists active learning offerings. Admins may request inactive records for
management by sending `includeInactive=true`; the server ignores this option for
non-admin callers.

Query parameters: `page` (default 1), `limit` (default 12), optional `search`, `category`,
and `level`.

Success: HTTP 200 with `{ offerings, total, page, limit, totalPages }`.

### `GET /api/learning-offerings/{id}`

Returns a single active offering to the public; admins may read inactive offerings.

Success: HTTP 200 with `{ offering }`. Unknown or non-public inactive id: HTTP 404.

### `POST /api/learning-offerings`

Admin only. JSON body contains the course-style offering fields in
[`data-model.md`](../data-model.md); server validates required values and allowed
category/level fields.

Success: HTTP 201 with `{ offering }`. Invalid body: HTTP 400.

### `PATCH /api/learning-offerings/{id}`

Admin only. JSON body contains supported fields to update. Immutable identifiers and
timestamps are ignored or rejected.

Success: HTTP 200 with `{ offering }`. Invalid body: HTTP 400; unknown id: HTTP 404.

### `DELETE /api/learning-offerings/{id}`

Admin only. Deactivates the offering; it must no longer appear in public listing/detail
reads.

Success: HTTP 200. Unknown id: HTTP 404.

## Gallery

### `GET /api/gallery`

Publicly lists all published gallery images, ordered newest first. Optional `page` and
`limit` parameters may be used for pagination.

Success: HTTP 200 with `{ images, total, page, limit, totalPages }`. Empty gallery returns
an empty `images` list with HTTP 200.

### `POST /api/gallery`

Admin only. Multipart form with `file`, `altText`, `caption`, and `category` (`event` or
`course`). Server validates authorization, file type/size, and required metadata, uploads
to Tigris, then persists the GalleryImage record.

Success: HTTP 201 with `{ image }`. Unauthorized: HTTP 401/403. Invalid file or metadata:
HTTP 400. Storage or persistence failure: explicit HTTP 5xx error; never return a success
response for an unpublished image. If metadata persistence fails after upload, attempt to
remove the uploaded object and log/report cleanup failure.

### `DELETE /api/gallery/{id}`

Admin only. First marks the record inactive so it is no longer public, then removes the
image object from Tigris and deletes the metadata record.

Success: HTTP 200. Unauthorized: HTTP 401/403. Unknown id: HTTP 404. Storage failure:
explicit HTTP 5xx error; preserve the inactive metadata record so an administrator can
retry deletion without leaving the image publicly listed.
