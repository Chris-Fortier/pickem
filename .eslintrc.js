module.exports = {
   env: {
      browser: true,
      es2021: true,
      node: true,
      jest: true,
   },
   extends: ["eslint:recommended", "plugin:react/recommended"],
   parserOptions: {
      ecmaFeatures: {
         jsx: true,
      },
      ecmaVersion: 12,
      sourceType: "module",
   },
   plugins: ["react"],
   rules: {
      // indent: ['error', 2], // clashed with prettier
      // 'linebreak-style': ['error', 'windows'], // disabled so it can deploy to vercel
      // quotes: ['error', 'single'], // clashes with prettier that prefers double quotes if single quotes are used inside the string
      semi: ["error", "always"],
      "react/prop-types": 0, // not care about prop types
   },
   settings: {
      react: { version: "detect" },
   },
};
