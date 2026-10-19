import test from "node:test";
import assert from "node:assert/strict";
import { validateResearchBody } from "../src/lib/research-validation.js";

const validResearch = {
  title: "Applied AI Research",
  description: "Research support for applied artificial intelligence projects.",
  category: "Engineering",
  domain: "Computer Science",
  services: ["Model development"],
  features: ["Evaluation"],
  rating: 4.5,
};

test("accepts valid research content", () => {
  assert.equal(validateResearchBody(validResearch), null);
});

test("requires the core research fields", () => {
  assert.match(validateResearchBody({ ...validResearch, title: " " }), /title is required/);
});

test("rejects oversized and empty list entries", () => {
  assert.match(
    validateResearchBody({ ...validResearch, services: [" "] }),
    /services must contain/
  );
  assert.match(
    validateResearchBody({ ...validResearch, features: ["x".repeat(201)] }),
    /features must contain/
  );
});

test("rejects ratings outside their supported range", () => {
  assert.match(
    validateResearchBody({ ...validResearch, rating: 6 }),
    /rating is out of range/
  );
});

test("requires at least one field for a partial update", () => {
  assert.match(validateResearchBody({}, true), /At least one research field/);
  assert.equal(validateResearchBody({ isActive: false }, true), null);
});
