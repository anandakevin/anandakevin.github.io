module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jquery: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint',
        'import',
        'jsx-a11y'
    ],
    rules: {
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-var-requires': 'warn',
        '@typescript-eslint/no-this-alias': 'warn',
        'no-undef': 'warn',
        'no-useless-escape': 'warn',
        'no-sparse-arrays': 'warn'
    },
    ignorePatterns: ['dist/*']
}; 