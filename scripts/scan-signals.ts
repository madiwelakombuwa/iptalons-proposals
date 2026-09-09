import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { collectApifySignals, qualifyPost } from "../src/signals";

const token = process.env.APIFY_API_TOKEN || readFileSync(join(homedir(), ".apify_token"), "utf8").trim();
let output = "";
const memoryKv = {
  async get() { return null; },
  async put(key: string, value: string) { if (key === "signals:v2") output = value; },
} as unknown as KVNamespace;

let result;
if (process.argv.includes("--last")) {
  const response = await fetch("https://api.apify.com/v2/acts/apidojo~tweet-scraper/runs/last/dataset/items?status=SUCCEEDED&clean=true&limit=50", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Unable to read last Apify dataset (${response.status})`);
  const posts = await response.json() as Record<string, unknown>[];
  const now = new Date().toISOString();
  const leads = posts.map(post => qualifyPost(post, now)).filter(lead => Boolean(lead)).sort((a, b) => b!.score - a!.score);
  result = { leads, scannedAt: now, actor: "apidojo~tweet-scraper", candidateCount: posts.length };
  output = JSON.stringify(result);
} else {
  result = await collectApifySignals(memoryKv, token);
}
if (!output) throw new Error("Signal scan produced no store document");
process.stderr.write(`Apify scan: ${result.candidateCount} candidates, ${result.leads.length} qualified\n`);
process.stdout.write(output);
