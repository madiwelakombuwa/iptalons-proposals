import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { collectApifySignals } from "../src/signals";

const token = process.env.APIFY_API_TOKEN || readFileSync(join(homedir(), ".apify_token"), "utf8").trim();
let output = "";
const memoryKv = {
  async get() { return null; },
  async put(key: string, value: string) { if (key === "signals:v2") output = value; },
} as unknown as KVNamespace;

const result = await collectApifySignals(memoryKv, token);
if (!output) throw new Error("Signal scan produced no store document");
process.stderr.write(`Apify scan: ${result.candidateCount} candidates, ${result.leads.length} qualified\n`);
process.stdout.write(output);
