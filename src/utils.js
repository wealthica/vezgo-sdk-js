/* global window */

const isBrowser = () => typeof window !== 'undefined' && Object.prototype.toString.call(window) === '[object Window]';

const isNode = () => typeof global !== 'undefined' && Object.prototype.toString.call(global) === '[object global]';

module.exports = {
  isBrowser,
  isNode,
};
