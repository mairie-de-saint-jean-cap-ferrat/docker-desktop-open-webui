import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactAppConfig from "eslint-config-react-app"; // Import config object directly
import js from "@eslint/js"; // Import recommended rules from @eslint/js

export default [
  // Apply recommended JS rules
  js.configs.recommended,
  // Apply recommended TypeScript rules
  {
    files: ["**/*.{ts,tsx}"], // Apply only to TypeScript files
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json", // Point to your tsconfig for type-aware linting
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules, // Spread recommended TS rules
      // Custom TS rules or overrides
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn", // Changed from "off" to "warn" in previous json
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Allow unused vars starting with _
       // Ensure consistent use of type imports/exports if using TypeScript >= 3.8
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/consistent-type-exports": "warn"
    },
  },
  // Apply React specific rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"], // Apply to JS/JSX/TS/TSX
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "detect", // Detect react version
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules, // Spread recommended React rules
      ...reactHooksPlugin.configs.recommended.rules, // Spread recommended React Hooks rules
      // Custom React rules or overrides
      "react/react-in-jsx-scope": "off", // Not needed with React 17+
      "react-hooks/rules-of-hooks": "error", // Keep enforcing hook rules
      "react-hooks/exhaustive-deps": "warn", // Keep warning on exhaustive deps
    },
  },
  // Apply general rules and react-app config overrides
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"], // Target source files
    rules: {
      // Include rules from eslint-config-react-app if needed, example:
      // ...reactAppConfig.rules, // Spread rules from react-app config if desired
      // General rules overrides
      "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
    },
  },
  // Ignore patterns
  {
    ignores: ["node_modules/", "build/", "dist/", "*.config.js", "eslint.config.js"],
  },
];