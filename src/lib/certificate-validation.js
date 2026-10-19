const FIELD_LIMITS = {
  learnerName: 120,
  courseName: 160,
  certificateId: 64,
  organization: 120,
  signatoryName: 120,
  achievementNote: 300,
};

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}

export function validateCertificateDetails(details) {
  const errors = {};
  const requiredText = [
    ["learnerName", "Enter the learner's full name."],
    ["courseName", "Enter the course name."],
    ["organization", "Enter the issuing organization."],
    ["signatoryName", "Enter the signatory name."],
  ];

  for (const [field, message] of requiredText) {
    if (!details[field].trim()) errors[field] = message;
  }

  for (const [field, maxLength] of Object.entries(FIELD_LIMITS)) {
    if (details[field].length > maxLength) {
      errors[field] = `Use ${maxLength} characters or fewer.`;
    }
  }

  if (!details.certificateId.trim()) {
    errors.certificateId = "Enter a certificate ID.";
  } else if (
    details.certificateId.length <= FIELD_LIMITS.certificateId &&
    !/^[a-zA-Z0-9_-]+$/.test(details.certificateId)
  ) {
    errors.certificateId =
      "Use only letters, numbers, hyphens, and underscores.";
  }

  if (!isValidDate(details.completionDate)) {
    errors.completionDate = "Enter a valid completion date.";
  }
  if (!isValidDate(details.issueDate)) {
    errors.issueDate = "Enter a valid issue date.";
  } else if (
    isValidDate(details.completionDate) &&
    details.issueDate < details.completionDate
  ) {
    errors.issueDate = "Issue date cannot be earlier than completion date.";
  }

  return errors;
}
