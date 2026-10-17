# Tasks: Learning Hub UI Alignment and Development Seed Data

## Learning Hub presentation

- [X] Align the public hero and call-to-action sections with the existing course and
  Services gradient/grid patterns.
- [X] Reuse the installed search, select, badge, and interactive card components for
  responsive Learning Hub filters and cards.
- [X] Preserve program details, search/filter behavior, and accessible loading, error,
  empty, and no-results states.

## Local development data

- [X] Add an ignored `.env.local` with the loopback-only `geeinnovixus_dev` MongoDB URI.
- [X] Add an explicit, idempotent seed command restricted to the local development
  database and representative course, training, and workshop records.
- [X] Document the local MongoDB prerequisite, seed command, and verification flow in
  `quickstart.md`.

## Verification

- [X] Run the seed command twice and verify the sample records are not duplicated.
- [X] Verify seeded course, training, and workshop records are available from the public
  Learning Hub endpoint.
- [X] Run focused ESLint, production build, local route/API smoke checks, and Git ignore
  and whitespace checks.
