module.exports = {
    tabWidth: 4,
    printWidth: 120,
    trailingComma: 'es5',
    bracketSpacing: true,
    semi: false,
    parser: 'typescript',
    singleQuote: true,
    proseWrap: 'never',
    overrides: [
        {
            files: '**/*.json',
            options: {
                parser: 'json',
                tabWidth: 2,
            },
        },
        {
            files: ['**/*.yml', '**/*.yaml'],
            options: {
                parser: 'yaml',
                tabWidth: 2,
            },
        },
    ],
};
