import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier, { rules } from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "public/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],

    plugins: {
      jsdoc,
    },

    languageOptions: {
      globals: globals.browser,
    },

    rules: {
      // Enforce JSDoc comments for functions and methods
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            ArrowFunctionExpression: false,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: false,
            FunctionExpression: false,
            MethodDefinition: false,
          },
          enableFixer: false,
        },
      ],
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
];
