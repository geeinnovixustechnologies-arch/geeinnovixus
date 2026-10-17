import test from "node:test";
import assert from "node:assert/strict";
import { getGoogleDriveImageUrl } from "../src/lib/google-drive-image-url.js";

test("converts shared Google Drive file links to a browser-renderable thumbnail URL", () => {
  assert.equal(
    getGoogleDriveImageUrl(
      "https://drive.google.com/file/d/1f7Yzu_jw0D4biej23QrEEuwbozSAv6sH/view?usp=sharing"
    ),
    "https://drive.google.com/thumbnail?id=1f7Yzu_jw0D4biej23QrEEuwbozSAv6sH&sz=w1600"
  );
});

test("rejects non-Google-Drive URLs and malformed file IDs", () => {
  assert.equal(
    getGoogleDriveImageUrl("https://example.com/file/d/1f7Yzu_jw0D4biej23QrEEuwbozSAv6sH"),
    null
  );
  assert.equal(
    getGoogleDriveImageUrl("https://drive.google.com/file/d/invalid/view"),
    null
  );
});
