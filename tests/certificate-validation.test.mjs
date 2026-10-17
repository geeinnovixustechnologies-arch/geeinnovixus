import test from "node:test";
import assert from "node:assert/strict";
import { validateCertificateDetails } from "../src/lib/certificate-validation.js";

const validDetails = {
  learnerName: "Ada Lovelace",
  courseName: "Introduction to Computing",
  certificateId: "CERT-2026_001",
  completionDate: "2026-10-01",
  issueDate: "2026-10-17",
  organization: "GEE Innovixus",
  signatoryName: "Grace Hopper",
  achievementNote: "",
};

test("accepts complete certificate details within field constraints", () => {
  assert.deepEqual(validateCertificateDetails(validDetails), {});
});

test("requires trimmed learner, course, organization, and signatory names", () => {
  const errors = validateCertificateDetails({
    ...validDetails,
    learnerName: "  ",
    courseName: " ",
    organization: "",
    signatoryName: " ",
  });

  assert.equal(errors.learnerName, "Enter the learner's full name.");
  assert.equal(errors.courseName, "Enter the course name.");
  assert.equal(errors.organization, "Enter the issuing organization.");
  assert.equal(errors.signatoryName, "Enter the signatory name.");
});

test("rejects certificate IDs outside letters, numbers, hyphens, and underscores", () => {
  const errors = validateCertificateDetails({
    ...validDetails,
    certificateId: "CERT 2026/001",
  });

  assert.equal(
    errors.certificateId,
    "Use only letters, numbers, hyphens, and underscores."
  );
});

test("rejects missing or invalid dates and issue dates before completion", () => {
  const errors = validateCertificateDetails({
    ...validDetails,
    completionDate: "2026-02-30",
  });

  assert.equal(errors.completionDate, "Enter a valid completion date.");
  assert.equal(errors.issueDate, undefined);
  assert.equal(
    validateCertificateDetails({
      ...validDetails,
      completionDate: "2026-10-01",
      issueDate: "2026-09-30",
    }).issueDate,
    "Issue date cannot be earlier than completion date."
  );
  assert.equal(
    validateCertificateDetails({ ...validDetails, issueDate: "" }).issueDate,
    "Enter a valid issue date."
  );
});

test("validates calendar dates, including leap days", () => {
  assert.equal(
    validateCertificateDetails({
      ...validDetails,
      completionDate: "2024-02-29",
    }).completionDate,
    undefined
  );
  assert.equal(
    validateCertificateDetails({
      ...validDetails,
      completionDate: "2025-02-29",
    }).completionDate,
    "Enter a valid completion date."
  );
});

test("enforces data-model maximum lengths", () => {
  const errors = validateCertificateDetails({
    ...validDetails,
    learnerName: "a".repeat(121),
    courseName: "a".repeat(161),
    certificateId: "a".repeat(65),
    organization: "a".repeat(121),
    signatoryName: "a".repeat(121),
    achievementNote: "a".repeat(301),
  });

  assert.equal(errors.learnerName, "Use 120 characters or fewer.");
  assert.equal(errors.courseName, "Use 160 characters or fewer.");
  assert.equal(errors.certificateId, "Use 64 characters or fewer.");
  assert.equal(errors.organization, "Use 120 characters or fewer.");
  assert.equal(errors.signatoryName, "Use 120 characters or fewer.");
  assert.equal(errors.achievementNote, "Use 300 characters or fewer.");
});
