module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:svelte/recommended', 'prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2022,
    extraFileExtensions: ['.svelte'],
    ecmaFeatures: {
      classes: true
    }
  },
  env: {
    es6: true,
    browser: true,
    es2017: true,
    node: true
  }
};
