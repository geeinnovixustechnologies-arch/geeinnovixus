const fields = [
  "title",
  "description",
  "category",
  "domain",
  "services",
  "features",
  "deliveryTime",
  "popularity",
  "rating",
  "icon",
  "color",
  "isActive",
];

export function validateResearchBody(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "A JSON object is required.";
  }
  if (partial && Object.keys(body).length === 0) {
    return "At least one research field must be updated.";
  }
  if (Object.keys(body).some((key) => !fields.includes(key))) {
    return "The request contains unsupported fields.";
  }

  const required = ["title", "description", "category", "domain"];
  for (const key of required) {
    if (!partial || Object.hasOwn(body, key)) {
      if (typeof body[key] !== "string" || !body[key].trim()) {
        return `${key} is required.`;
      }
    }
  }

  for (const key of ["title", "description", "category", "domain", "deliveryTime", "icon"]) {
    if (Object.hasOwn(body, key) && typeof body[key] !== "string") {
      return `${key} must be text.`;
    }
  }
  for (const key of ["services", "features"]) {
    if (
      Object.hasOwn(body, key) &&
      (!Array.isArray(body[key]) ||
        body[key].some(
          (item) =>
            typeof item !== "string" ||
            !item.trim() ||
            item.trim().length > 200
        ))
    ) {
      return `${key} must contain non-empty text entries up to 200 characters.`;
    }
  }
  for (const key of ["popularity", "rating"]) {
    if (
      Object.hasOwn(body, key) &&
      (typeof body[key] !== "number" ||
        !Number.isFinite(body[key]) ||
        body[key] < 0 ||
        body[key] > (key === "rating" ? 5 : 100))
    ) {
      return `${key} is out of range.`;
    }
  }
  if (Object.hasOwn(body, "isActive") && typeof body.isActive !== "boolean") {
    return "isActive must be a boolean.";
  }
  if (
    Object.hasOwn(body, "color") &&
    !["primary", "secondary", "success", "warning", "info"].includes(body.color)
  ) {
    return "color is not supported.";
  }

  const limits = {
    title: 200,
    description: 2000,
    category: 100,
    domain: 100,
    deliveryTime: 100,
    icon: 50,
  };
  for (const [key, limit] of Object.entries(limits)) {
    if (Object.hasOwn(body, key) && body[key].trim().length > limit) {
      return `${key} cannot exceed ${limit} characters.`;
    }
  }
  return null;
}
