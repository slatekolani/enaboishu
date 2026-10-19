module.exports = {
    root: true,
    env: { browser: true, es2022: true },
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
    settings: { react: { version: 'detect' } },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['vendor', 'public', 'node_modules'],
    rules: { 'react/prop-types': 'off' },
};
