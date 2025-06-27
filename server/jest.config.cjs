module.exports = {
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  transform: {
    '^.+\\.js$': ['babel-jest', { 
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }]
      ]
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(mysql2)/)'
  ],
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'api/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 15000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true
} 