import nextESLint from "next/eslint-plugin-next";

const eslintConfig = [
  {
    plugins: {
      "next": nextESLint,
    },
    rules: {
      "next/core-web-vitals": "error",
      "next/rules": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
