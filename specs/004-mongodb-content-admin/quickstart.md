# Quickstart: Local Content Admin Verification

This guide describes the planned end-to-end verification for the single-admin content
feature. It targets a local development database; do not point provisioning or test
writes at production.

## Prerequisites and local environment

- Node.js 24.x and npm.
- MongoDB running locally on the developer machine.
- A private email address to use as the single local admin.
- A locally generated password of at least 12 characters and a strong random
  NextAuth secret.

Create or update the ignored `.env.local` without overwriting existing unrelated settings:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/geeinnovixus_dev
NEXTAUTH_SECRET=<generate a unique local secret>
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=<your local admin email>
ADMIN_PASSWORD=<your private local admin password>
# Optional public Google Drive links for Gallery sample records
SEED_GALLERY_IMAGE_URL_1=https://drive.google.com/file/d/<public-file-id>/view
SEED_GALLERY_IMAGE_URL_2=https://drive.google.com/file/d/<another-public-file-id>/view
```

Generate a local NextAuth secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Never commit `.env.local`, use a real production database for verification, or paste
these values into client-side code. For deployment, configure the corresponding values
as server-side deployment secrets.

## Install, provision, build, and start

```powershell
npm ci
npm run provision:admin
npm run build
npm start
```

The admin provision command must be explicit and safe to repeat: first run creates the
one admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD`; a later run must report that an admin
already exists and must not create another account or reset its password. The command
must never echo the password. Use the configured email and private password to sign in
at `http://localhost:3000/auth/signin`.

The provisioner refuses passwords shorter than 12 characters. Set the administrator
email and password yourself in the ignored `.env.local`; they are not included in this
repository or printed by the provisioning command.

## Seed sample content

After provisioning an admin, set one or two publicly viewable Google Drive file URLs
in `SEED_GALLERY_IMAGE_URL_1` and `SEED_GALLERY_IMAGE_URL_2` in `.env.local` if you
want Gallery examples, then run:

```powershell
npm run seed:content
```

The seed command is restricted to the local `geeinnovixus_dev` database. It validates
all sample records first, inserts records only into empty collections, and skips
collections that already contain data. It includes sample Research, Projects, Services,
and Learning Hub content; Gallery entries are created only for configured public Drive
URLs. Replace sample captions and details with accurate content before publishing.

## Manual acceptance scenarios

1. Open `/auth/signin`: verify email/password is the only sign-in option and no admin
   account creation option is shown. Attempt incorrect credentials and confirm sign-in
   is denied with a generic error.
2. Sign in with the local admin credentials. Verify the admin can open all five content
   management sections: Research, Projects, Services, Learning Hub, and Gallery.
3. In each section, create a uniquely titled local test record, then open or reload the
   matching public page. Verify the record appears with its saved values and no
   hard-coded sample is substituted.
4. Edit each test record and verify the public page shows the update on its next load.
   Remove/deactivate each record and verify it no longer appears publicly; deleting a
   Service permanently removes it from both the admin list and public listing.
5. Sign out. Attempt a direct create/update/delete request and confirm it is denied and
   the database record remains unchanged.
6. Submit invalid required fields while signed in; verify field-level feedback and no
   persisted partial update.
7. Stop MongoDB or use an isolated invalid connection in a disposable local process.
   Verify public pages show a data error rather than mock records and admin saves do not
   report success.
8. Run the provision command a second time. Verify it neither creates a second admin
   nor changes the existing password.
9. Check a narrow viewport and keyboard-only navigation through sign-in, admin forms,
   status feedback, and public content pages; verify no horizontal overflow or
   inaccessible controls.

## Automated validation

```powershell
npm run lint
npm run build
npm test
```

Run the feature's focused built-in Node tests (as added) and any documented Mongo-backed
smoke checks. Keep test records confined to `geeinnovixus_dev` and remove them after
verification. See [the API contract](contracts/content-admin-api.md) and
[the data model](data-model.md) for expected record, response, and authorization
behavior.

## Verification status

- Focused ESLint, production build, and five Research validation tests pass.
- A disposable local MongoDB database was used to run the provisioner twice: the first
  run created one administrator, the second was refused, the stored password hash and
  unrelated collections were unchanged, and neither output contained the password.
  The disposable database was dropped after the check.
- Authenticated API integration checks on an isolated database passed create, public
  read, update, and remove for Research, Projects, Services, Learning Hub, and Gallery.
  Invalid Research data returned HTTP 400 and an anonymous content write returned
  HTTP 401. Test records and the isolated database were removed.
- A local admin was provisioned in `geeinnovixus_dev`; production-mode credentials
  sign-in returned an admin session and `/admin/research` returned HTTP 200. The
  generated credentials and NextAuth secret are stored only in ignored `.env.local`,
  not in repository documentation.
- With an empty disposable database, all five public list APIs returned HTTP 200 and
  empty arrays. With MongoDB unavailable on a separate test port, all five APIs
  returned HTTP 500 and `Cache-Control: no-store`. The empty test database was removed.
- Headless Chrome 155 checked all five public pages, credentials sign-in, and all five
  admin management pages at desktop (1365 px) and mobile (390 px) widths. No horizontal
  overflow was found, and repeated Tab presses moved keyboard focus on every checked
  page. These checks verify basic responsiveness and keyboard operability, not a
  comprehensive assistive-technology audit.
- A production server started against the local database; public sign-in and the
  Research, Projects, Services, Learning Hub, and Gallery read endpoints returned
  successfully. Anonymous content mutations were denied with HTTP 401.
- The full content CRUD integration ran against an isolated database; the local admin
  credentials were separately verified against `geeinnovixus_dev`. A missing-
  credentials preflight was confirmed to stop before connecting or changing the
  database.
- Service DELETE was verified in production mode using a uniquely named temporary
  record: after deleting, it was absent from both admin and public filtered lists and
  its item endpoint returned HTTP 404.
