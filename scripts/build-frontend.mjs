import { build } from "esbuild";
import { mkdir, readFile } from "node:fs/promises";

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

await bundle("app", [components, screens, workspace, app].join("\n"));
await build({
  stdin: { contents: share, loader: "js" },
  outfile: new URL("../public/assets/share.js", import.meta.url).pathname,
  minify: true,
  legalComments: "none",
  target: "es2020",
});
