// Builds the standalone client bundle that the CDP host injects into Spotify.
// The host builds from source automatically when esbuild is available; this script
// produces a distributable file for machines where it is not.

import * as esbuild from "esbuild";

const minify = process.argv.includes("--minify");

await esbuild.build({
  entryPoints: ["src/standalone/entry.ts"],
  bundle: true,
  format: "iife",
  target: "es2017",
  outfile: "dist-standalone/client.js",
  minify,
  logLevel: "info",
});
