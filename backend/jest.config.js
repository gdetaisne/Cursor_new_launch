/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  
  // ESM support
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  
  // Test configuration
  testMatch: [
    '**/tests/**/*.test.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/server.ts', // Entry point, tested via E2E
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Timeout
  testTimeout: 10000, // 10 seconds for DB operations
  
  // Verbose
  verbose: true,
};
