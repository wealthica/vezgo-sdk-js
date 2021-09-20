import { join } from 'path';
import merge from 'webpack-merge';
// eslint-disable-next-line import/no-extraneous-dependencies
import TerserPlugin from 'terser-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

const include = join(__dirname, 'src');

const baseConfig = {
  entry: './src/index',
  output: {
    filename: 'vezgo.js',
  },
  mode: 'production',
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', include },
    ],
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
};

const browserConfig = merge(baseConfig, {
  output: {
    library: {
      name: 'Vezgo',
      type: 'window',
    },
  },
});

const browserMinifiedConfig = merge(browserConfig, {
  devtool: 'source-map',
  output: {
    filename: 'vezgo.min.js',
  },
  optimization: {
    minimize: true,
  },
});

const commonJsConfig = merge(baseConfig, {
  output: {
    path: join(__dirname, 'lib'),
    library: {
      type: 'umd', // to be universal
    },
    globalObject: 'this', // workaround webpack using 'self' by default
  },
  plugins: [
    // Have eslint here so it only run once instead of once for each build config
    new ESLintPlugin(),
  ],
});

module.exports = [
  // Browser build to be included directly in a frontend page (exposed as `window.Vezgo`)
  browserConfig, // dist/vezgo.js
  browserMinifiedConfig, // dist/vezgo.min.js
  // Universal build, to be used on either backend (nodejs) or frontend (build system)
  commonJsConfig, // lib/vezgo.js
];
