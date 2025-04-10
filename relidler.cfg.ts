import { defineConfig } from "@reliverse/relidler-cfg";

/**
 * Reliverse Bundler Configuration
 * Hover over a field to see more details
 * @see https://github.com/reliverse/relidler
 */
export default defineConfig({
  // Bump configuration
  bumpDisable: true,
  bumpFilter: ["package.json", "reliverse.ts"],
  bumpMode: "autoPatch",

  // Common configuration
  commonPubPause: true,
  commonPubRegistry: "npm-jsr",
  commonVerbose: false,

  // Core configuration
  coreDeclarations: false,
  coreEntryFile: "main.ts",
  coreEntrySrcDir: "src",
  coreIsCLI: true,

  // JSR-only config
  distJsrAllowDirty: true,
  distJsrBuilder: "jsr",
  distJsrCopyRootFiles: ["README.md", "LICENSE"],
  distJsrDirName: "dist-jsr",
  distJsrDryRun: false,
  distJsrGenTsconfig: false,
  distJsrOutFilesExt: "ts",
  distJsrSlowTypes: true,

  // NPM-only config
  distNpmBuilder: "mkdist",
  distNpmCopyRootFiles: ["README.md", "LICENSE"],
  distNpmDirName: "dist-npm",
  distNpmOutFilesExt: "js",

  // Libraries Relidler Plugin
  // Publish specific dirs as separate packages
  // This feature is experimental at the moment
  // Please commit your changes before using it
  libsActMode: "libs-only", // TODO: change to "main-and-libs"
  libsDirDist: "dist-libs",
  libsDirSrc: "src/libs",
  libsList: {
    "@reliverse/rese": {
      libDeclarations: true,
      libDescription:
        "@reliverse/rese is an extendible, ultra-fast, minimalist typescript/node/bun/desktop/mobile/web framework — with batteries-included DX, expressive routing, and with the full developer-first flavor of Reliverse.",
      libDirName: "core",
      libMainFile: "core/core-main.ts",
      libPkgKeepDeps: true,
      libTranspileMinify: true,
    },
  },

  // Logger setup
  logsFileName: "relinka.log",
  logsFreshFile: true,

  // Dependency filtering
  rmDepsMode: "patterns-and-devdeps",
  rmDepsPatterns: [
    "@types",
    "biome",
    "eslint",
    "knip",
    "prettier",
    "@reliverse/cli-cfg",
  ],

  // Build setup
  transpileEsbuild: "es2023",
  transpileFormat: "esm",
  transpileMinify: true,
  transpilePublicPath: "/",
  transpileSourcemap: "none",
  transpileSplitting: false,
  transpileStub: false,
  transpileTarget: "node",
  transpileWatch: false,
});
