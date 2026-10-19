# UI Interaction Contracts

## Public Gallery

- The gallery displays a consistent responsive image frame without stretching or
  obscuring the source image.
- Gallery images are delivered from the application origin so client browsers do not
  depend on direct cross-origin Google Drive thumbnail requests.
- Activating an image opens an accessible enlarged viewer showing the full image and
  its alternative text/caption.
- A visible close action and Escape dismiss the viewer. Clicking outside the image may
  dismiss it where supported by the existing dialog behavior.
- The viewer fits within the current viewport, including narrow screens and landscape
  orientation.
- Unavailable images retain an accessible fallback; the failure of one image does not
  disable the rest of the gallery.

## Learning Hub, Projects, R&D, and Services cards

- Cards use responsive grids and consistent content spacing.
- Variable-length text wraps without clipping, overlap, or horizontal overflow.
- All existing content and meaningful card actions remain available.
- Cards do not create artificial blank areas solely to equalize their content height.

## Administrator dashboard and navigation

- The dashboard links directly to every route represented by the existing admin
  navigation: Dashboard, R&D, Projects, Services, Learning Hub, and Gallery.
- Duplicate dashboard quick-action links are not retained as separate controls.
- Signed-in admin navigation provides no Profile link or profile-management action.
- Sign-out remains available; non-admin profile navigation is unchanged.
- Dashboard links do not bypass existing route authorization.
- Loading, dashboard data error, and unauthorized states remain understandable and
  accessible.

No persistence or gallery list response schema changes are introduced. The existing
`displayUrl` property points to the same-origin image proxy; that route accepts only
validated Google Drive file IDs and image responses within the documented size limit.
