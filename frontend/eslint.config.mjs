// eslint.config.mjs
export default [
  {
    ignores: ["**/*.ts", "**/*.tsx"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-unused-vars": "off",
      "no-undef": "off"
    }
  }
];
