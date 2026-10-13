import { defineConfig, globalIgnores } from "eslint/config";

import nextjs from "@votoaberto/config/eslint/nextjs";

export default defineConfig(
  nextjs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
);
