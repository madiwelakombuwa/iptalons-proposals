import assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { createPublished, listPublished, loadPublished, recordView, revokePublished, type ShareRecord } from "../src/publications";

function fixture() {
  const sql = new DatabaseSync(":memory:");
  sql.exec("PRAGMA foreign_keys=ON;" + readFileSync("migrations/0002_publications.sql", "utf8"));
  const db: any = { prepare(query: string) {
    let values: unknown[] = [];
    const statement = { bind(...args: unknown[]) { values = args; return statement; },
      async run() { return sql.prepare(query).run(...values); },
      async first<T>() { return (sql.prepare(query).get(...values) || null) as T | null; },
      async all<T>() { return { results: sql.prepare(query).all(...values) as T[] }; } };
    return statement;
  } };
  const kv = {} as KVNamespace;
  return { sql, db, kv };
}

test("D1 publications keep immutable content, exact concurrent view counts and revocation", async () => {
  const { sql, db, kv } = fixture();
  const share: ShareRecord = { token: "abcdefghjkmnpqr", proposalId: "p1", name: "Proposal", prospectName: "University", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), proposal: { id: "p1", name: "Public copy" }, views: [], emails: [] };
  await createPublished(db, kv, share, "admin@example.invalid");
  await Promise.all([recordView(db, kv, share, { at: new Date().toISOString(), country: "LK", ua: "a" }), recordView(db, kv, share, { at: new Date().toISOString(), country: "US", ua: "b" })]);
  const loaded = await loadPublished(db, kv, share.token);
  assert.equal(loaded?.viewCount, 2);
  assert.equal((await listPublished(db, kv))[0].viewCount, 2);
  await revokePublished(db, kv, share.token);
  assert.equal(await loadPublished(db, kv, share.token), null);
  assert.equal((await listPublished(db, kv)).length, 0);
  sql.close();
});
