module.exports = {
  transform: {
    '^.+\\.ts?$': '@swc/jest',
  },
  testEnvironment: 'node',
  globalSetup: './jest.globalSetup'
};
