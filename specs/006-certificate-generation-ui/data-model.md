# Data Model: Admin Certificate Generation UI

This phase introduces no persistent entity, database schema, or backend payload.
Certificate values exist only in the administrator's current page state.

## Certificate details (in-memory form)

| Field | Requirement | Validation |
|---|---|---|
| Learner full name | Required | Trimmed non-empty text; bounded length |
| Course name | Required | Trimmed non-empty text; bounded length |
| Certificate ID | Required | Letters, numbers, hyphens, and underscores only; bounded length |
| Completion date | Required | Valid date |
| Issue date | Required | Valid date; not earlier than completion date |
| Issuing organization | Required | Trimmed non-empty text; bounded length |
| Signatory name | Required | Trimmed non-empty text; bounded length |
| Grade or achievement note | Optional | Bounded text; omitted from certificate when empty |
| Verification record ID (`id`) | Optional | Entered as provided; no additional validation in this UI |
| Student name (`studentName`) | Optional | Entered as provided; shown in the preview when supplied |
| Domain | Optional | Entered as provided; shown in the preview when supplied |
| Duration | Optional | Free-form text; shown in the preview when supplied |
| Status | Optional | Free-form mock value; never treated as actual verification |
| Start date | Optional | Entered as provided; shown in the preview when supplied |
| End date | Optional | Entered as provided; shown in the preview when supplied |
| Issued at | Optional | Entered as provided; shown in the preview when supplied |
| Provider | Optional | Entered as provided; shown in the preview when supplied |

Proposed UI limits should be consistent with existing form conventions: names and
organization up to 120 characters, course title up to 160 characters, certificate ID
up to 64 characters, and achievement note up to 300 characters. These limits apply
only to the prototype and must be revisited with backend validation before issuance is
implemented.

## Certificate preview

- Derived directly from current form values; no separate saved record.
- Displays all required fields and an optional achievement note when provided.
- Always labeled as a preview or demonstration.
- Mock confirmation does not change issuance state or create an ID.

## State transitions

1. **Initial**: Empty form, no preview confirmation, no validation errors.
2. **Editing**: Administrator changes current in-memory values; preview reflects them.
3. **Invalid submission**: Field errors are shown; current values remain available to
   correct; mock-success feedback is not displayed.
4. **Preview ready**: All required details are valid and visible on the certificate
   preview.
5. **Mock complete**: A temporary success notice explicitly says the certificate was
   not issued or saved.
6. **Edit after preview**: Current preview updates and prior success wording is
   removed or clearly scoped to the earlier mock action.
7. **Leave or reload**: Form details and mock status are discarded.
