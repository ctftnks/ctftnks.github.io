import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import vue from "eslint-plugin-vue";
import jsdoc from "eslint-plugin-jsdoc";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "public/**", "tests/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  jsdoc.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: vue.parser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
    },
    plugins: {
      vue,
      jsdoc,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      // warning for unused variables instead of error
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { caughtErrors: "none" }],
      "vue/no-unused-vars": "warn",
      // do not warn of maximum number of attributes per line
      "vue/max-attributes-per-line": "off",
      // do not warn of singleline HTML elements with innerHTML content
      "vue/singleline-html-element-content-newline": "off",
      // do not warn of self-closing HTML elements
      "vue/html-self-closing": "off",
      // do not enforce multi-word component names (gives unnecessary errors for pages/)
      "vue/multi-word-component-names": "off",
      // require JSDoc comment for vue component props
      "vue/require-prop-comment": [
        "warn",
        {
          type: "JSDoc",
        },
      ],
      // Enforce braces for all control statements
      curly: ["error", "all"],
      // // disallow the bang operator
      // "@typescript-eslint/no-non-null-assertion": "error",
      // Enforce JSDoc comments for functions and methods
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            ArrowFunctionExpression: false,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
          enableFixer: false,
        },
      ],
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-returns-type": "off",
      "jsdoc/require-returns-description": "off",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true, // allows skipping return types on simple arrow functions used as arguments
        },
      ],
    },
  },
  {
    files: ["**/*.vue"],
    rules: {
      // Often unnecessary in Vue components for simple setup functions or small helpers
      "jsdoc/require-jsdoc": "off",
    },
  },
);
