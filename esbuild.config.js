const esbuild = require("esbuild");
const path = require("path");

esbuild
  .build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    outfile: "out/extension.js",
    platform: "node",
    target: ["node20"],
    sourcemap: true,
    minify: false,
    external: ["vscode"],
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["src/webview/index.ts"],
    bundle: true,
    outfile: "out/webview/webview.js",
    platform: "browser",
    target: ["es2022"],
    sourcemap: true,
    minify: false,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  })
  .catch(() => process.exit(1));
