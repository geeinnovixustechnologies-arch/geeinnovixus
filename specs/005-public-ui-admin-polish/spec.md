# Feature Specification: Public UI and Admin Navigation Polish

**Feature Branch**: `005-public-ui-admin-polish`

**Created**: 2026-10-17

**Status**: Draft

**Input**: User description: "Create the fourth spec that in the gallery tab, whenever, we uploaded any drive image, the aspect ratio is missing. So we need to enhance the gallery tab, UI such that user can have ability to view the, gallery images in a very fashionable and, best UI manner. And also coming to the enhancements, UI enhancements. In the learning hub, I- we are seeing cards, right? In that, I'm seeing some cards ending white space if they have less data, and some cards as bigger if they have more data. So, is there any better way to display those? And the same issue with the projects and R&D cards as well. If the information was less, then the white Space is present in that card at bottom. If information is more, it was looking good, but it was affecting the overall UI, and we need to check this and enhance this. And also in the admin panel menu, we need to remove the profile also, and profile, profile, menu button, and also profile related or anything if present, we need to remove that. And, all the admin menu which present when we click on the user icon, user assembled icon should be displayed in the admin dashboard, such that he can easily open those links and perform the activities. And from the admin dashboard, remove unnecessary action buttons and all."

## Clarifications

### Session 2026-10-17

- Q: Should gallery previews use a consistent frame that shows each whole image, or
  should the grid follow each image’s original shape? → A: Use consistent preview
  frames and fit the entire image inside them, allowing unused space around the image
  rather than cropping or distorting it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and View Gallery Images (Priority: P1)

As a visitor, I want gallery images to display in a consistent, attractive layout and
open for closer viewing so that the original photographs are easy to see regardless of
their shape or size.

**Why this priority**: Gallery images are the primary content of the page. Unclear
cropping or inconsistent image dimensions can hide important visual content.

**Independent Test**: Publish landscape, portrait, and square images, then view the
gallery on mobile and desktop. Verify consistent gallery tiles and that each image can
be opened and viewed without unwanted cropping.

**Acceptance Scenarios**:

1. **Given** published gallery images have different dimensions, **When** a visitor
   browses the gallery, **Then** each image is presented in a visually consistent
   responsive tile without distorting its proportions.
2. **Given** a visitor selects a gallery image, **When** its expanded view opens,
   **Then** the complete image and its descriptive text are available without cropping.
3. **Given** the expanded image view is open, **When** the visitor uses a keyboard,
   pointer, or touch, **Then** they can close the view and continue browsing.
4. **Given** one image fails to load, **When** the gallery is displayed, **Then** that
   image has a clear unavailable state while other images remain usable.

### User Story 2 - Browse Consistent Content Cards (Priority: P1)

As a visitor, I want Learning Hub, Projects, R&D, and Services cards to have consistent
layout and spacing so that varying amounts of information do not make the pages look
uneven or leave distracting blank areas.

**Why this priority**: These public catalogs are core discovery pages, and visibly
uneven cards make comparison and browsing harder. Services cards follow the same
shared public-catalog layout.

**Independent Test**: Display records with short and long titles, descriptions, and
feature lists in each catalog at mobile, tablet, and desktop widths.
Verify each card remains readable, aligned with neighboring cards, and free of
unnecessary blank space.

**Acceptance Scenarios**:

1. **Given** cards in a row contain different amounts of information, **When** a
   visitor views the catalog, **Then** the cards follow a consistent alignment and
   spacing pattern without large unexplained empty areas.
2. **Given** a title, description, or list is longer than its neighbors, **When** the
   cards are displayed, **Then** content remains legible and does not overflow, overlap,
   or hide important information.
3. **Given** the visitor views Learning Hub, Projects, R&D, or Services on a narrow screen,
   **When** the catalog reflows, **Then** cards remain readable and actions remain
   reachable.

### User Story 3 - Navigate Admin Work from the Dashboard (Priority: P2)

As an administrator, I want the dashboard to provide direct access to every relevant
admin area without profile navigation or redundant actions so that I can manage site
content efficiently.

**Why this priority**: A clear admin entry point reduces navigation effort while
removing profile UI that is not needed for the single-admin workflow.

**Independent Test**: Sign in as an administrator, open the dashboard, and verify each
admin destination is directly reachable there, profile-related controls are absent,
and remaining actions are useful and non-duplicative.

**Acceptance Scenarios**:

1. **Given** an administrator opens the dashboard, **When** they review its
   navigation, **Then** every current admin management destination is available as a
   clearly labeled dashboard link.
2. **Given** admin navigation or account controls are displayed, **When** the
   administrator uses them, **Then** profile pages and profile-related menu items are
   not presented.
3. **Given** dashboard actions duplicate navigation or do not serve a current admin
   task, **When** the dashboard is displayed, **Then** those unnecessary actions are
   removed while useful management actions remain available through the dashboard links.
4. **Given** an administrator uses keyboard, touch, or pointer input, **When** they
   navigate the dashboard, **Then** all dashboard links and retained actions remain
   accessible and usable.

### Edge Cases

- Gallery images have portrait, landscape, square, very wide, or very tall dimensions.
- An image cannot be loaded or has no usable description; the gallery must remain
  operable and communicate unavailable content accessibly.
- An expanded image is open when the visitor presses Escape, selects the backdrop, or
  changes viewport size.
- Catalog content contains very long text, no optional lists, or fewer cards than fit a
  row.
- Admin destinations are not available to a visitor or non-admin; dashboard links must
  not bypass existing authorization.
- A destination is removed in a future release; the dashboard must not retain a broken
  shortcut to it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The public Gallery MUST present images in a responsive, consistent layout
  with preview frames that show portrait, landscape, and square source images in full
  without cropping or distorting their proportions.
- **FR-002**: Visitors MUST be able to open a gallery image in an expanded view that
  displays the complete image and its associated descriptive text.
- **FR-003**: The expanded image view MUST be operable by keyboard, pointer, and touch,
  provide a visible close control, and support Escape to close.
- **FR-004**: Gallery loading, empty, and unavailable-image states MUST remain clear,
  accessible, and consistent with the site's visual language.
- **FR-005**: Learning Hub, Projects, R&D, and Services cards MUST use a consistent layout and
  spacing approach that minimizes unintentional blank areas while preserving complete,
  readable content.
- **FR-006**: Long card content MUST wrap or otherwise fit within its card without
  clipping, overlap, or obscuring meaningful information.
- **FR-007**: Catalog cards MUST remain usable at supported mobile, tablet, and desktop
  widths, including when their number or content varies.
- **FR-008**: The admin dashboard MUST provide clear, direct links to all current admin
  management destinations available to the signed-in administrator.
- **FR-009**: Admin navigation and dashboard MUST NOT display profile pages, profile
  menu items, or profile-management controls.
- **FR-010**: The admin dashboard MUST remove redundant or unnecessary action buttons
  while preserving useful admin tasks and direct access to their corresponding areas.
- **FR-011**: Dashboard links and remaining controls MUST preserve existing
  administrator authorization and be operable with keyboard, pointer, and touch input.
- **FR-012**: Gallery, catalog, and dashboard changes MUST include appropriate loading,
  empty, error, and permission-denied states wherever those states apply.

### Key Entities

- **Gallery image**: A published image with its source dimensions, descriptive text,
  caption, and event or course context.
- **Catalog card**: A public representation of a Learning Hub offering, project, or R&D
  record, with variable-length text and optional supporting details.
- **Admin destination**: An authorized management area represented by a labeled
  dashboard navigation link.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All tested portrait, landscape, and square gallery images retain their
  proportions in the gallery and can be opened for complete, uncropped viewing.
- **SC-002**: 100% of images, expanded-view controls, and close actions can be reached
  and operated by keyboard as well as pointer or touch.
- **SC-003**: Across Learning Hub, Projects, R&D, and Services, test records with short and long
  content display without clipping or overlap at mobile, tablet, and desktop widths.
- **SC-004**: Administrators can reach every current admin management destination
  directly from the dashboard, with no profile-related menu or management control
  displayed.
- **SC-005**: No retained dashboard action duplicates a dashboard destination link
  without providing a distinct, necessary task.

## Assumptions

- Gallery previews use a consistent frame and fit the entire image inside it, allowing
  unused space around images of different proportions; selecting a preview provides a
  larger view that fits the available screen.
- Gallery images remain externally hosted as currently configured; this feature changes
  their presentation, not image storage or upload behavior.
- Existing content, filters, links, and authorization rules for Learning Hub, Projects,
  R&D, Services, and admin destinations remain unchanged unless a redundant dashboard action or
  profile control is specifically in scope.
- Every current admin management destination should be represented on the dashboard;
  profile, account-profile editing, and profile-specific menus are excluded. Existing
  authentication and sign-out behavior remain available.
- "Unnecessary action buttons" means buttons that duplicate dashboard navigation or
  expose no distinct current management task; primary content-management workflows are
  not removed.
- The established site visual language and shared UI patterns remain the design source
  for all affected pages; no new dependency is assumed.
