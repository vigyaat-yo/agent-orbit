import { cpSync, mkdirSync, rmSync } from "node:fs";
import { build } from "esbuild";

// tsc runs first; copy static Chrome assets alongside its JavaScript output.
mkdirSync("dist", { recursive: true });
cpSync("manifest.json", "dist/manifest.json");
mkdirSync("dist/src/popup", { recursive: true });
cpSync("src/popup/popup.html", "dist/src/popup/popup.html");
cpSync("src/popup/popup.css", "dist/src/popup/popup.css");

// Chrome content_scripts are classic scripts, not ES modules. Bundle imports into one file.
rmSync("dist/src/content", { recursive: true, force: true });
await build({
  entryPoints: ["src/content/content.ts"],
  bundle: true,
  format: "iife",
  target: "es2020",
  outfile: "dist/content.bundle.js"
});
