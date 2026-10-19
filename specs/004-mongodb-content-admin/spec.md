# Feature Specification: MongoDB Content and Single Admin

**Feature Branch**: `004-mongodb-content-admin`

**Created**: 2026-10-17

**Status**: Draft

**Input**: User description: "to display the real-time data from the MongoDB in the R&D tab, projects tab, services tab, learning tab, and all the tabs need to show original data from the MongoDB rather than the static data. We also need to implement admin functionality for all these tabs so that the admin can add, remove, and edit the data in their portal. Additionally, create one admin user and provide those credentials to me so that I can also sign in and verify. In the UI, when I click on admin sign in, I am seeing the "continue with Google" option. Remove that option. We will only provide email and password sign-in method for now. Also, we should not provide an option to create an admin account from the UI because there will only be one admin present. When I Do the NPM start. Please provide the required Environment variables for that, like MongoDB URI, etc. For that, like MongoDB, URI, etc. so that I can easily verify the functionality correctly."

## Clarifications

### Session 2026-10-17

- Q: For local verification, how should the single admin’s sign-in credentials be supplied? → A: The developer sets `ADMIN_EMAIL` and `ADMIN_PASSWORD` in ignored `.env.local`; provisioning never prints or commits them.
- Q: Should Google sign-in be removed from the entire application, or only from the admin sign-in flow? → A: Remove Google sign-in for all users; sign-in uses email and password only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Current Published Content (Priority: P1)

As a visitor, I want the R&D, Projects, Services, Learning Hub, and Gallery pages to
show the current published records so I can rely on the website to reflect the
organization's actual offerings rather than fixed demonstration content.

**Why this priority**: These public pages are the primary way visitors discover the
organization's research, projects, services, and learning opportunities.

**Independent Test**: Change a record through the admin portal, then open or reload its
public page and verify that the published change appears without rebuilding or restarting
the website.

**Acceptance Scenarios**:

1. **Given** published records exist for a supported public section, **When** a visitor
   opens or reloads that section, **Then** the page shows the current published records
   and not bundled sample content.
2. **Given** an administrator saves an addition, edit, or removal, **When** a visitor
   next opens or reloads the corresponding public page, **Then** the page reflects that
   change within five seconds of the successful save.
3. **Given** a section has no published records, **When** a visitor opens it, **Then**
   the page shows a clear empty state rather than sample content.
4. **Given** the data service is unavailable, **When** a visitor opens a supported
   section, **Then** the page communicates that current content could not be loaded and
   does not silently present stale bundled content as current.

---

### User Story 2 - Manage Public Content as the Sole Administrator (Priority: P1)

As the sole authorized administrator, I want to add, edit, and remove records for each
supported content section from the admin portal so I can keep public information
accurate without developer assistance.

**Why this priority**: The requested live public content depends on the administrator
being able to maintain the source records.

**Independent Test**: Sign in as the configured administrator, create a record, edit it,
and remove it in each supported content section; verify each result in the portal and on
its public page, and verify that an unauthenticated visitor cannot perform these
actions.

**Acceptance Scenarios**:

1. **Given** the sole administrator is authenticated, **When** they add a valid record
   to a supported section, **Then** it is saved and becomes available on the
   corresponding public page.
2. **Given** a saved record exists, **When** the administrator edits it, **Then** the
   updated values are saved and shown publicly.
3. **Given** a saved record exists, **When** the administrator removes it, **Then** it
   is no longer presented publicly and the admin portal confirms the outcome.
4. **Given** required values are missing or invalid, **When** the administrator submits
   the form, **Then** the invalid changes are rejected with field-specific guidance and
   the existing record remains unchanged.
5. **Given** an unauthenticated user or a non-administrator attempts a protected
   content action, **When** the action is submitted, **Then** access is denied and no
   content is changed.
6. **Given** the administrator submits a change while the data service is unavailable,
   **When** saving fails, **Then** the portal reports failure and does not show a
   success-shaped result.

---

### User Story 3 - Sign In with the Single Admin Account (Priority: P1)

As the administrator, I want to sign in using my email address and password so I can
access the admin portal without an unrelated third-party sign-in option or a public
account-creation flow.

**Why this priority**: Admin access is required to manage content, and it must remain
restricted to one explicitly provisioned account.

**Independent Test**: Use the provisioned administrator credentials to sign in; verify
that invalid credentials are rejected, no Google sign-in or admin-registration option
appears, and an unauthenticated session cannot access admin functions.

**Acceptance Scenarios**:

1. **Given** the sole administrator has valid credentials, **When** they submit their
   email and password, **Then** they are authenticated and can access the admin portal.
2. **Given** a user enters an incorrect email or password, **When** they submit the
   sign-in form, **Then** sign-in is denied with a non-sensitive error message.
3. **Given** a visitor opens the admin sign-in page, **When** the form is displayed,
   **Then** it offers email-and-password sign-in only and provides no Google sign-in or
   account-creation action.
4. **Given** the sole administrator already exists, **When** local setup or
   initialization is repeated, **Then** no additional admin account is created and the
   existing account is not overwritten with a different password.

---

### User Story 4 - Configure a Local Verification Environment (Priority: P2)

As a developer or reviewer, I want clear local environment setup instructions and one
provisioned admin account so I can start the application and verify public content
management safely using a dedicated development database.

**Why this priority**: Reliable local setup lets the requester verify the complete
visitor and admin journey without production credentials.

**Independent Test**: Follow the documented local setup, set the required environment
values, build and start the application, sign in with the provided local admin
credentials, and verify that public and admin pages use the same local records.

**Acceptance Scenarios**:

1. **Given** a developer has a local database service available, **When** they follow
   the setup instructions with the sample local database URI and required
   authentication settings, **Then** the application can be built and started against
   the dedicated local database without production credentials.
2. **Given** the documented required environment values are missing or invalid,
   **When** the developer starts or uses the application, **Then** the setup or
   affected operation reports which configuration is missing without exposing secrets.
3. **Given** the local admin account is provisioned, **When** setup is documented,
   **Then** the requester can identify the local verification credentials without
   relying on a public registration page or a committed password.

### Edge Cases

- A public section has no records, or every record is unpublished; visitors see a
  purposeful empty state, not static sample data.
- The data service is unavailable during a public page request or an admin save; the
  user sees a clear error, and failed changes are not reported as successful.
- Two administrators are not permitted; repeated setup must not create another admin
  or reset the existing account's password.
- A visitor attempts to modify content or access the admin portal without the sole
  administrator's authenticated session.
- An admin form contains invalid, incomplete, overly long, or malformed values; the
  record remains unchanged and validation identifies the relevant fields.
- An admin removes a record that is currently visible publicly; it disappears from the
  public listing after the successful change.
- A local developer has existing environment values; setup instructions must not
  require overwriting unrelated local settings.
- An administrator's password or database connection value is missing; the application
  must not substitute a shared or hard-coded production credential.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Public R&D, Projects, Services, Learning Hub, and Gallery listings MUST
  display their current published records from the configured MongoDB data source
  instead of hard-coded or demonstration records.
- **FR-002**: A successful administrator addition, edit, or removal MUST be reflected
  in the corresponding public listing within five seconds, without requiring a build or
  application restart. Visitors opening or reloading a page MUST see the latest
  published content.
- **FR-003**: Public content pages MUST present clear loading, empty, and data-service
  error states. They MUST NOT use bundled sample content as a silent fallback when
  current records cannot be retrieved.
- **FR-004**: The admin portal MUST allow the sole authorized administrator to add,
  edit, and remove records for R&D, Projects, Services, Learning Hub, and Gallery.
- **FR-005**: Public visitors MUST be able to view published records without signing in;
  content creation, modification, and removal MUST require an authenticated
  administrator.
- **FR-006**: The system MUST validate required and formatted content before saving and
  MUST preserve the existing record when validation or persistence fails.
- **FR-007**: The admin portal MUST report successful and failed saves explicitly and
  MUST NOT show a success state when a change was not persisted.
- **FR-008**: The application sign-in experience MUST use email and password only and
  MUST not offer Google or other third-party sign-in.
- **FR-009**: The application MUST provide for exactly one administrator account,
  provisioned outside the public UI. The public UI MUST NOT provide administrator
  registration or let users assign themselves the administrator role. If public
  registration is available for non-admin users, it MUST only create client accounts.
- **FR-010**: Repeating local setup or account initialization MUST NOT create a second
  administrator or silently replace the existing administrator's credentials.
- **FR-011**: Administrator passwords MUST be protected from plaintext storage and
  exposure. Authentication secrets and database credentials MUST remain out of
  version-controlled files and client-visible content.
- **FR-012**: Local setup documentation MUST identify the required environment
  variables `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, and
  `ADMIN_PASSWORD`; it MUST include the safe local-only MongoDB URI example
  `mongodb://127.0.0.1:27017/geeinnovixus_dev` and must not present fabricated remote
  credentials as working.
- **FR-013**: Local verification documentation MUST explain the required build and
  application start sequence (`npm run build`, then `npm start`), how the single local
  administrator is provisioned, and how the requester obtains the local verification
  credentials without committing them.
- **FR-014**: Existing data and content fields for each supported section MUST remain
  understandable in the public page and editable in the admin portal; changes in one
  section MUST NOT corrupt or remove records belonging to another section.

### Key Entities

- **Research record**: A published or unpublished R&D item with its public descriptive
  content and administrative publication state.
- **Project record**: A project listing and its descriptive content, media references,
  and publication state.
- **Service record**: A service listing with its descriptive content and publication
  state.
- **Learning offering**: A course-style Learning Hub item, including its title,
  description, category, level, duration, and other existing public details.
- **Gallery entry**: A public image reference with descriptive text and event or course
  context; removing an entry removes it from the gallery and does not delete an
  externally hosted image.
- **Administrator account**: The single provisioned account with permission to manage
  supported public records and sign in using email and password.
- **Environment configuration**: Local or deployment-only values needed to connect the
  data source, establish authentication, and provision the sole administrator without
  exposing secrets to visitors or version control.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of published records shown on R&D, Projects, Services, Learning Hub,
  and Gallery pages come from the configured data source; no hard-coded sample record
  is shown as current content.
- **SC-002**: 100% of successful additions, edits, and removals appear correctly in
  their corresponding public listing within five seconds, without rebuilding or
  restarting the application.
- **SC-003**: 100% of unauthenticated or non-administrator content changes are denied
  without altering stored records.
- **SC-004**: A valid provisioned administrator can sign in with email and password,
  while Google sign-in and administrator registration are absent from the UI.
- **SC-005**: Repeating local administrator setup leaves exactly one administrator and
  does not silently change that account's credentials.
- **SC-006**: A developer can follow the local setup instructions to build, start, and
  verify the application using a local database and without production credentials.
- **SC-007**: Empty and unavailable-data conditions are distinguishable to visitors,
  and a failed save is never presented as successful.

## Assumptions

- “Real-time” means that a completed admin change is reflected on the next public page
  load or reload within five seconds; visitors do not require updates pushed into pages
  that have already been open and idle.
- “All the tabs” means the named R&D, Projects, Services, and Learning Hub content
  sections, plus Gallery as an existing public database-backed content section. Static
  informational pages such as About, FAQ, contact, and legal notices are outside this
  content-management scope.
- Existing record shapes and presentation conventions are retained where possible;
  the admin experience adapts to each section's current content fields.
- A local administrator's email and password are supplied through ignored local
  environment configuration. The requester chooses the local verification credentials;
  no default production credential is hard-coded, printed by provisioning, or committed.
- Local database setup uses a dedicated loopback-only development database. A sample
  loopback URI is an example, not a remote working database or production credential.
- Google and other third-party sign-in are removed for all users. Administrator
  registration and public admin-role assignment are out of scope; existing public
  registration may continue for client accounts only.
- Gallery entries continue to reference publicly viewable externally hosted images;
  content management does not upload or delete the underlying image files.
