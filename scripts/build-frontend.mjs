import { build } from "esbuild";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const read = (name) => readFile(new URL(`../public/${name}`, import.meta.url), "utf8");
const prelude = `
import React from "react";
import { createRoot } from "react-dom/client";
import Chart from "chart.js/auto";
const ReactDOM = { createRoot };
`;

const components = await read("ip-components.jsx");
const screens = await read("ip-screens.jsx");
const workspace = await read("ip-workspace.jsx");
const app = await read("ip-app.jsx");
const share = await readFile(new URL("../frontend/share.js", import.meta.url), "utf8");

await mkdir(new URL("../public/assets/", import.meta.url), { recursive: true });

async function bundle(name, source) {
  await build({
    stdin: { contents: `${prelude}\n${source}`, loader: "jsx", resolveDir: process.cwd() },
    outfile: new URL(`../public/assets/${name}.js`, import.meta.url).pathname,
    bundle: true,
    minify: true,
    legalComments: "none",
    target: "es2020",
    define: { "process.env.NODE_ENV": '"production"' },
  });
}

await bundle("app-build", [components, screens, workspace, app].join("\n"));
const assetsDir = new URL("../public/assets/", import.meta.url);
const temporaryApp = new URL("app-build.js", assetsDir);
const appBytes = await readFile(temporaryApp);
const appHash = createHash("sha256").update(appBytes).digest("hex").slice(0, 12);
const appFile = `app.${appHash}.js`;
for (const file of await readdir(assetsDir)) {
  if (/^app\.[a-f0-9]{12}\.js$/.test(file) && file !== appFile) await unlink(new URL(file, assetsDir));
}
await rename(temporaryApp, new URL(appFile, assetsDir));
const indexUrl = new URL("../public/index.html", import.meta.url);
const index = await readFile(indexUrl, "utf8");
await writeFile(indexUrl, index.replace(/\/assets\/app(?:\.[a-f0-9]{12})?\.js/g, `/assets/${appFile}`));
await build({
  stdin: { contents: share, loader: "js" },
  outfile: new URL("../public/assets/share.js", import.meta.url).pathname,
  minify: true,
  legalComments: "none",
  target: "es2020",
});
