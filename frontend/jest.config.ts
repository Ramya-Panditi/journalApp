import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], 
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', 
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy', 
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.app.json',  // Add this line to make sure it uses the right config
    },
  },
};

export default config;
