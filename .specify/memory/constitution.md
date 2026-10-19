<!--
Sync Impact Report
Version change: 1.0.0 -> 1.0.1
Modified principles: III. Complete and Accessible User Journeys (explicit permission UI state)
Added sections: none
Removed sections: none
Follow-up TODOs: Confirm the original ratification date.
-->

# Gee Innovixus Constitution

## Core Principles

### I. Existing Libraries First
Before implementing a capability or adding a dependency, contributors MUST inspect the
project's installed libraries, shared components, hooks, and utilities. They MUST use a
suitable existing option when it meets the requirement. A new dependency is permitted only
when no existing option can satisfy the requirement; its purpose and the alternatives
considered MUST be recorded in the implementation plan or pull request.

### II. Consistent UI Across Pages
All public and administrative pages MUST use the established design tokens, shared UI
components, interaction patterns, and responsive conventions. Contributors MUST extend
shared components when a pattern is reused, rather than introduce visually divergent
one-off implementations. Intentional page-specific differences MUST have a clear product
reason and preserve the site's overall visual and interaction language.

### III. Complete and Accessible User Journeys
Changes MUST account for the relevant user roles, devices, permissions, and UI states,
including loading, empty, success, validation, error, and permission-denied states where
applicable. Interactive experiences MUST support semantic markup, keyboard operation,
visible focus, and readable contrast. Requirements and implementation plans MUST identify
relevant edge cases rather than treating the primary success path as complete.

### IV. Secure and Privacy-Conscious Engineering
Features MUST enforce authorization at trusted server boundaries, validate untrusted input,
and handle personal or confidential data only as required for the feature. Secrets MUST be
kept out of source control and client-visible code. File, authentication, and administrative
flows MUST preserve existing security controls; errors MUST not expose secrets or sensitive
user data.

### V. Verifiable Quality
Changes MUST include or update focused automated tests for changed behavior when the project
has an applicable test setup. Validation MUST cover relevant success, failure, and boundary
cases. Before completion, contributors MUST run the applicable lint, test, and build checks
available in the repository, and report checks that could not be run.

## Technology and Dependency Constraints

The existing Next.js, React, Tailwind CSS, HeroUI, Radix-based UI components, and shared
utilities form the default technology choices where they fit the requirement. This is a
preference, not a mandate to use a library that does not meet functional, accessibility,
security, or maintenance needs. New dependencies MUST be justified against the existing
stack, reviewed for maintenance and license suitability, and kept to the smallest practical
set. Shared design tokens and components MUST remain the source of truth for cross-page UI
consistency.

## Development Workflow and Quality Gates

Implementation plans MUST state the affected pages and user roles, relevant UI states and
edge cases, reused or newly introduced libraries, and validation approach. Contributors MUST
review changes across all affected page types and responsive layouts. Pull requests MUST
summarize behavior changes, dependency decisions, and validation results. Reviewers MUST
check compliance with this constitution and request an explicit rationale for any exception.

## Governance

This constitution governs feature specifications, implementation plans, code changes, and
reviews. Amendments MUST be proposed with their rationale and impact, reviewed by the
project's maintainers, and reflected in the constitution before dependent work is approved.
The version MUST follow semantic versioning: MAJOR for incompatible governance changes,
MINOR for new or materially expanded principles or sections, and PATCH for clarifications
that do not change the requirements.

Every implementation plan and pull request MUST identify applicable principles and explain
any exception. Reviewers MUST verify that library reuse, cross-page UI consistency, relevant
user cases, security, and validation requirements are addressed. Exceptions MUST be explicit,
scoped, and approved by maintainers. When this constitution conflicts with lower-level
guidance, this constitution takes precedence.

**Version**: 1.0.1 | **Ratified**: TODO(RATIFICATION_DATE: confirm original adoption date) | **Last Amended**: 2026-10-17

