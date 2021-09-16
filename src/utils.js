/* global window,navigator,document */

const isBrowser = () => typeof window !== 'undefined' && Object.prototype.toString.call(window) === '[object Window]';

const isNode = () => typeof global !== 'undefined' && Object.prototype.toString.call(global) === '[object global]';

const isReactNative = () => typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

function appendIframe(name) {
  let iframe = document.getElementsByName(name)[0];

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'position:fixed; top:0; left:0; right:0; bottom:0; z-index:2147483647;');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.frameBorder = 0;
    iframe.allow = 'usb *; hid *';
    iframe.name = name;

    document.body.appendChild(iframe);
  }

  iframe.style.display = 'block';

  return iframe;
}

module.exports = {
  isBrowser,
  isNode,
  isReactNative,
  appendIframe,
};
