module.exports = {
  root: true,
  extends: '@react-native',
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['@react-native/babel-preset'],
    },
  },
  ignorePatterns: [
    'babel.config.js',
    'jest.config.js',
    'metro.config.js',
    '*.config.js',
    'node_modules/',
    'build/',
    'android/',
    'ios/',
  ],
};
