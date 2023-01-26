module.exports = {
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest'],
    },
    testPathIgnorePatterns: ['node_modules'] ,
    testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,js}', '!**/vendor/**'],
    coveragePathIgnorePatterns: ['/node_modules/', '__test__'],

    coverageDirectory: 'coverage',
    setupFilesAfterEnv: ['./src/__test__/setup.ts'],
};
