import assert from "node:assert/strict";
import { test } from "node:test";
import { qualifyPost } from "../src/signals";

test("signal qualification requires evidence, identity and a valid X source", () => {
  const strong = qualifyPost({
    id: "123",
    createdAt: new Date().toISOString(),
    fullText: "Our university needs help implementing NSPM-33 research security compliance before the federal grant deadline.",
    url: "https://x.com/example/status/123",
    author: { userName: "research-office", followers: 1500 },
  });
  assert(strong);
  assert.equal(strong.sourceId, "x:123");
  assert.equal(strong.t, "hot");
  assert(strong.score >= 75);
  assert.equal(qualifyPost({ id: "124", text: "Nice weather", url: "https://x.com/a/status/124", author: { userName: "a" } }), null);
  assert.equal(qualifyPost({ id: "125", text: "Need NSPM-33 help", url: "javascript:alert(1)", author: { userName: "a" } }), null);
});
