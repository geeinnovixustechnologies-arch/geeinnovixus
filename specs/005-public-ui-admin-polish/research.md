# Research: Public UI and Admin Navigation Polish

## Gallery image viewing

**Decision**: Use the existing accessible dialog component for a full-screen or
near-full-screen image viewer. Use proportional `contain` sizing in both the thumbnail
frame and viewer so portrait, landscape, and square images remain undistorted and fully
visible.

**Rationale**: Gallery source images are remotely hosted and can have arbitrary
dimensions. Fixed-ratio frames with cover cropping can hide content; a contained image
in a consistent frame preserves the full image while providing a predictable grid.
The current project already includes a Radix-based dialog wrapper, which provides
keyboard dismissal and modal interaction behavior without adding a dependency.

**Alternatives considered**:
- Keep image cards non-interactive: does not meet the request to view the entire image
  more clearly.
- Stretch images to fill cards: distorts original proportions.
- Add a lightbox package: rejected because existing dialog primitives can provide the
  interaction.
- Load each thumbnail directly from Google Drive in the visitor's browser: rejected
  after the supplied UI capture showed the browser falling back for every image while
  the same public image endpoint returned valid JPEG data from the server.

**Image delivery**: Keep the existing `displayUrl` field in gallery API responses, but
point it to a same-origin route. The route accepts only validated Drive file IDs,
follows HTTPS redirects to Google image hosts, accepts common raster image MIME types,
and limits image responses to 10 MiB. This avoids relying on each visitor's browser to
reach Google Drive directly.

## Catalog card sizing

**Decision**: Retain the existing responsive grid and card visual treatments while
allowing card height to follow its content. Align repeated card structure and spacing,
wrap long text, and keep each card's information and actions in normal flow.

**Rationale**: The Learning Hub, Projects, R&D, and Services pages already use responsive grids
and shared `MagicCard` styling. Large blank card regions are likely caused by
full-height/flex spacing behavior rather than a need to truncate records. Natural card
height avoids artificial whitespace and preserves content.

**Alternatives considered**:
- Fixed card heights: can clip long content or require arbitrary truncation.
- Line-clamp descriptions and lists: hides information users may need.
- Masonry layout: creates uneven reading order and requires more layout complexity
  than the current grid needs.

## Admin navigation and dashboard

**Decision**: Use the existing `adminNavigation` destination list in `Navigation.js` as
the source of current admin destinations and expose those links on the dashboard.
Remove Profile only in the signed-in administrator menu, preserving sign-out and
non-admin profile behavior. Remove duplicate quick actions rather than eliminating
management destinations.

**Rationale**: The admin menu is the explicitly named source of the destinations the
user wants on the dashboard. The current dashboard's Quick Actions repeat several of
those links and include an invalid activity destination. A shared list prevents
navigation drift and preserves the already-supported management flows.

**Alternatives considered**:
- Remove the entire user menu: would also remove sign-out and administrator
  destinations and is broader than requested.
- Remove Profile for every signed-in role: outside the administrator-specific scope.
- Keep all quick actions and add duplicate destination tiles: increases clutter and
  conflicts with the request to remove unnecessary actions.

## Dependencies, integration, and unknowns

No unresolved technical unknowns remain. Existing gallery data records, public
response schemas, admin authorization, and page destinations are retained. The
same-origin image proxy is a new internal route; no new package or schema change is
required.
