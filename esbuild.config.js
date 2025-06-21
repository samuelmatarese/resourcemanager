const esbuild = require("esbuild");
const path = require("path");

esbuild.build({
  entryPoints: ["src/webview/index.ts"],
  bundle: true,
  outfile: "out/webview/webview.js",
  platform: "browser",
  sourcemap: true,
  minify: false,
  target: ["es2022"],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
}).catch(() => process.exit(1));
