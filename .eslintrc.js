module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:astro/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'jsx-a11y'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
    'no-undef': 'warn',
    'no-useless-escape': 'warn',
    'no-sparse-arrays': 'warn',
    'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['application'] }],
  },
  overrides: [
    {
      files: ['**/*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
        sourceType: 'module',
      },
    },
  ],
  ignorePatterns: [
    'dist/*',
    '.astro/*',
    '.cache/*',
    'src/assets/line-awesome-1.3.0/**',
    'src/content/generated/**',
    'src/content/public/**',
  ],
};
