import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Using the flat config format
export default [
  // Import configurations from the compatibility layer
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Add your custom configurations in flat config format
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      parser: compat.plugins["@typescript-eslint/parser"],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Your custom rules
      "react/prop-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  {
    ignores: ["node_modules", "dist", "build", ".next", ".vercel", "public", "eslint.config.mjs"],
  },
];
