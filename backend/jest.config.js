/** Jest: testes em test/ - rodar da pasta backend com: npm test */
module.exports = {
  testEnvironment: 'node',
  roots: [__dirname],
  testMatch: ['**/test/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'config/**/*.js',
    'data/**/*.js',
    'lib/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    'validators/**/*.js',
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  verbose: true,
};
