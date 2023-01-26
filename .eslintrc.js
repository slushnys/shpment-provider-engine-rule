module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'import'],
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.json',
            },
        },
        'import/external-module-folders': ['node_modules', 'typings'],
    },
    rules: {
        'import/order': [
            'error',
            {
                groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin'],
                'newlines-between': 'always',
            },
        ],
        'import/no-cycle': 'error',
        'prefer-template': 'error',
    },
    overrides: [
        {
            files: ['*.ts'],
            extends: ['standard-with-typescript', 'plugin:import/errors', 'plugin:import/warnings', 'plugin:import/typescript', 'plugin:prettier/recommended', 'prettier'],
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                project: './tsconfig.json',
            },
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'off'
            }
        },
    ],
};
