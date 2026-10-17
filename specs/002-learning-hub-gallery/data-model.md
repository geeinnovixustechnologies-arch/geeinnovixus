# Data Model: Learning Hub and Gallery

## LearningOffering

Represents a public course, training, or workshop in one unified course-style catalog.

| Field | Type | Required | Validation / purpose |
|---|---|---:|---|
| `title` | String | Yes | Trimmed; non-empty; maximum 200 characters |
| `description` | String | Yes | Trimmed; non-empty; maximum 2,000 characters |
| `shortDescription` | String | Yes | Trimmed; non-empty; maximum 300 characters |
| `category` | String | Yes | Existing course category vocabulary; validated against allowed values |
| `level` | String | Yes | Course-style difficulty/level label |
| `duration` | String | Yes | Human-readable duration adapted from the source course/training record |
| `modules` | String array | No | Course-style topics/modules; trim entries |
| `software` | String array | No | Tools or technologies taught; trim entries |
| `features` | String array | No | Included learning features; trim entries |
| `image` | Object | No | Optional primary image URL and alternative text |
| `isActive` | Boolean | Yes | Defaults to true; inactive offerings are omitted from public reads |
| `createdAt` | Date | Yes | Managed by timestamps |
| `updatedAt` | Date | Yes | Managed by timestamps |

Existing rating, popularity, icon, and color data may be retained where available, but
must have safe defaults and cannot be required to migrate an existing offering. Old
training/workshop records are adapted into this schema; their original type is not a
separate presentation or management structure.

**Lifecycle**: Admin creates or updates an offering; active offerings appear publicly;
admin may deactivate/remove it; inactive offerings remain unavailable to public reads.
Legacy hardcoded offerings are migrated once and must not be duplicated on repeated
deployment or migration runs.

## GalleryImage

Represents one real event/course image published in the public gallery.

| Field | Type | Required | Validation / purpose |
|---|---|---:|---|
| `url` | String | Yes | Publicly retrievable image URL returned by configured Tigris storage |
| `storageKey` | String | Yes | Object key used to remove the stored image |
| `altText` | String | Yes | Trimmed, meaningful, non-empty text alternative |
| `caption` | String | Yes | Short context describing the image, event, or course |
| `category` | String | Yes | `event` or `course` |
| `postedBy` | ObjectId/User reference | Yes | Authenticated administrator who published the image |
| `isActive` | Boolean | Yes | Defaults to true; inactive images are excluded from public reads |
| `deletionPending` | Boolean | Yes | Defaults to false; true when public visibility is removed but storage deletion needs retry |
| `createdAt` | Date | Yes | Publication timestamp; managed by timestamps |
| `updatedAt` | Date | Yes | Last metadata update; managed by timestamps |

**Validation**: Accept only allowed image media types and the existing upload size
limit unless a separately approved product constraint changes it. Validate required
metadata before persistence. Do not trust client-provided storage keys or remote URLs for
deletion. Only an admin may create or delete records.

**Lifecycle**: Validate admin and inputs; upload image to Tigris; create metadata record
only after upload succeeds; expose active records to public reads. On admin delete, first
remove the record from public visibility, then remove the object and metadata. If storage
deletion fails, retain an inactive record with `deletionPending=true` so the operation
can be retried. Partial failures must be surfaced and handled without silently reporting
success.

## Relationships

- Each GalleryImage references the User who posted it.
- LearningOffering and GalleryImage are independent entities; gallery `category` and
  caption associate an image with a course or event without requiring the referenced
  offering to remain active.
