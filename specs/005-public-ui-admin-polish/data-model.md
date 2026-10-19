# Data Model: Public UI and Admin Navigation Polish

This feature changes presentation and navigation only. It does not add or modify
persistent entities, MongoDB schemas, or API payloads.

## Gallery image (existing)

Represents a public gallery entry backed by existing data.

- **Identity**: Existing gallery record identifier.
- **Source**: Existing public image URL (Google Drive).
- **Alternative text**: Existing image description, used as the image's accessible
  name.
- **Caption and category**: Existing context displayed with the image.
- **Availability state**: Existing loading and image-failure presentation; a failed
  image remains represented by an accessible unavailable state.
- **Relationships**: None added.

## Catalog card (presentation view)

Represents an existing Learning Hub offering, project, or R&D record in a public
listing.

- **Identity**: Existing record identifier.
- **Content**: Existing title, summary/description, labels, optional supporting lists,
  images, and actions.
- **Layout behavior**: Content is allowed to wrap and determine natural card height;
  no data is truncated or persisted differently by this feature.
- **Relationships**: No changes to catalog records or links.

## Admin destination (navigation view)

Represents a currently supported administrator management route shown as a dashboard
link.

- **Label and route**: Reuse the existing administrator navigation destination.
- **Availability**: Link visibility is limited to the signed-in administrator
  dashboard; route-level authorization remains authoritative.
- **Relationships**: No change to user accounts, roles, or route permissions.
