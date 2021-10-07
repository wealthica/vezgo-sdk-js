module.exports = {
  root: true,
  extends: ['airbnb-base'],
  rules: {
    'no-underscore-dangle': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)', '**/__mocks__/**/*.{j,t}s?(x)'],
      env: {
        jest: true,
      },
      globals: {
        mockNode: 'readonly',
        mockBrowser: 'readonly',
        mockReactNative: 'readonly',
        mockAxios: 'readonly',
      },
    },
  ],
};
