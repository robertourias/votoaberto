import comments from "@eslint-community/eslint-plugin-eslint-comments";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// Regras de comentários de diretiva: desabilitar regra exige descrição (guardrails seção 3).
export default defineConfig(
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/coverage/**",
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: { "@eslint-community/eslint-comments": comments },
    rules: {
      "@eslint-community/eslint-comments/require-description": "error",
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",
      "@eslint-community/eslint-comments/disable-enable-pair": ["error", { allowWholeFile: true }],
      "@eslint-community/eslint-comments/no-unused-disable": "error",
    },
  },
  prettier,
);
