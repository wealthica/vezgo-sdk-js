import { join } from 'path';
import merge from 'webpack-merge';
// eslint-disable-next-line import/no-extraneous-dependencies
import TerserPlugin from 'terser-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

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
    new CopyPlugin({
      patterns: [
        {
          from: './index.d.ts',
          to: 'vezgo.d.ts',
        },
      ],
    }),
  ],
};

const browserConfig = merge(baseConfig, {
  output: {
    library: {
      name: 'Vezgo',
      type: 'window',
    },
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
});

const browserMinifiedConfig = merge(browserConfig, {
  devtool: 'source-map',
  output: {
    filename: 'vezgo.min.js',
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: './index.d.ts',
          to: 'vezgo.min.d.ts',
        },
      ],
    }),
  ],
});

const browserES5Config = merge(baseConfig, {
  output: {
    filename: 'vezgo.es5.js',
    library: {
      type: 'umd',
    },
    globalObject: 'this', // workaround webpack using 'self' by default
  },
  plugins: [
    new NodePolyfillPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: './index.d.ts',
          to: 'vezgo.es5.d.ts',
        },
      ],
    }),
  ],
});

const commonJsConfig = merge(baseConfig, {
  output: {
    path: join(__dirname, 'lib'),
    library: {
      type: 'umd',
    },
  },
  plugins: [
    // Have eslint here so it only run once instead of once for each build config
    new ESLintPlugin(),
  ],
  target: 'node',
});

module.exports = [
  // Browser build to be included directly in a frontend page (exposed as `window.Vezgo`)
  browserConfig, // dist/vezgo.js
  browserMinifiedConfig, // dist/vezgo.min.js
  // Browser build to be imported in a build system
  browserES5Config, // dist/vezgo.es5.js
  // Commonjs build for NodeJS
  commonJsConfig, // lib/vezgo.js
];
