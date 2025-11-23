module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/tests/email.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['<rootDir>/src'],
  setupFiles: ['dotenv/config'],
  moduleNameMapper: {
    '^uuid$': '<rootDir>/src/tests/mocks/uuid.ts',
  },
  forceExit: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/tests/**',
    '!src/scripts/**',
  ],
};
