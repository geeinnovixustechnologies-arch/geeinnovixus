# Learning Hub and Gallery API Contracts

All endpoints return JSON. Management endpoints require a valid authenticated session
whose user role is `admin`; failed authorization returns HTTP 401 or 403 and performs no
write.

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

Admin only. JSON body with `url`, `altText`, `caption`, and `category` (`event` or
`course`). `url` must be an HTTPS `drive.google.com` share/file URL containing a
recognizable file ID. The linked image must be viewable by anyone with the link.

Success: HTTP 201 with `{ image }`. Unauthorized: HTTP 401/403. Invalid URL or metadata:
HTTP 400. The server validates URL structure only and does not fetch the remote resource.
There is no multipart upload or image-storage operation.

### `DELETE /api/gallery/{id}`

Admin only. Deletes the GalleryImage metadata record. The image in Google Drive is not
deleted or modified.

Success: HTTP 200. Unauthorized: HTTP 401/403. Unknown id: HTTP 404.
