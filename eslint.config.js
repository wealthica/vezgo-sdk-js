module.exports = [
  // Global ignores. A config object containing ONLY `ignores` applies repo-wide;
  // pairing `ignores` with `rules` would instead scope it to that one config block
  // and leave build output (lib/, dist/) being linted.
  {
    ignores: ['lib/*', 'dist/*', 'node_modules/*', 'example/*'],
  },
  {
    rules: {
      quotes: ['error', 'single'],
    },
  },
];
