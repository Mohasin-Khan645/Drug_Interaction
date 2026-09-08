'use strict';

module.exports = {
  testEnvironment: 'node',
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      globalSetup: '<rootDir>/tests/integration/globalSetup.js',
      setupFilesAfterEnv: ['<rootDir>/tests/integration/setupAfterEnv.js'],
    },
  ],
};
