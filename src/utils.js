/* global window,navigator */

const isBrowser = () => typeof window !== 'undefined' && Object.prototype.toString.call(window) === '[object Window]';

const isNode = () => typeof global !== 'undefined' && Object.prototype.toString.call(global) === '[object global]';

const isReactNative = () => typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

module.exports = {
  isBrowser,
  isNode,
  isReactNative,
};
