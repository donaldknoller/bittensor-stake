import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {
    ignores: ["dist/", "node_modules/", "**/*.js"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: { 
      globals: { ...globals.node }
    },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-console": ["warn", { "allow": ["warn", "error"] }]
    }
  },
  {
    files: ["**/*.test.ts"],
    ignores: ["src/__tests__/setup.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    files: ["src/__tests__/setup.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off"
    }
  },
  {
    files: ["src/examples/**/*.ts"],
    rules: {
      "no-console": "off"
    }
  }
]; 