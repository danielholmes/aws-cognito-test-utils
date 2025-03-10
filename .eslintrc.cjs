module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true
  },
  extends: [
    "prettier",
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    "plugin:promise/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict"
  ],
  plugins: [
    "@typescript-eslint",
    "deprecation",
    "promise",
    "import",
    "filenames"
  ],
  rules: {
    // Try and ensure certain deps not included
    "@typescript-eslint/consistent-type-imports": "error",

    // Some cognito responses have this
    "@typescript-eslint/no-empty-object-type": "off",

    // Better performance when include extensions
    "import/extensions": ["error", "ignorePackages"],
    
    // I Like all exports being at end of file
    "import/exports-last": "error",

    // Have some uses
    "@typescript-eslint/no-explicit-any": "off",

    // Default was interfaces, I like types
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],

    // Want to ensure unions are covered
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    
    // Want to know if there's uses of deprecated code
    "deprecation/deprecation": "warn",

    // Allow console warns and errors, but don't want accidental debug logs
    "no-console": ["error", { "allow": ["debug", "warn", "error"] }],

    // kebab case files
    "filenames/match-regex": ["warn", "^[a-z.-]+$", true],

    // Serve a purpose a lot of the time
    "@typescript-eslint/no-empty-function": "off",

    // Triggering for describe, etc in tests
    "@typescript-eslint/no-floating-promises": "off",

    // Want to allow destructuring
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "ignoreRestSiblings": true
      }
    ],

    // Too strict atm, giving too many errors
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-return": "off"
  }
}
