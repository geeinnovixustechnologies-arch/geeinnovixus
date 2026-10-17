# Learning Hub UI and Local Seed Quickstart

## Local MongoDB

The repository's `.env.local` contains a local-only sample:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/geeinnovixus_dev
```

This file is excluded from version control. If `.env.local` already contains developer
settings, preserve them and add or update only `MONGODB_URI`. Start a local MongoDB
service before seeding.

Run the seed explicitly:

```powershell
npm run seed:learning-hub
```

The command accepts only a loopback MongoDB URI for the exact `geeinnovixus_dev`
database, inserts the checked-in course-style sample records, and uses stable title and
category matches so repeated runs do not duplicate or overwrite existing records. It
never runs automatically when the application starts and refuses remote, credentialed,
or differently named database URIs.

Then start the application and open `/learning-hub`:

```powershell
npm run dev
```

## Verify the Learning Hub

- Compare the hero, search and filter controls, responsive card grid, and visual states
  with the existing Services and course catalog patterns at mobile, tablet, and desktop
  widths.
- Search by title, description, or software; filter by category and level; open an
  offering detail.
- Confirm loading, database error, empty catalog, and no matching results remain clear
  and usable.
- Run the seed command twice and verify the second run reports existing records rather
  than inserting duplicates.
