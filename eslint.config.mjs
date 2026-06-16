import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "src/.next/**",
    "coverage/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Dev-only Playwright screenshot script (CommonJS).
    "screenshot.cjs",
  ]),
]);

export default eslintConfig;
