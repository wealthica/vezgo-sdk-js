/* global window,navigator,document */

const isBrowser = () => typeof window !== 'undefined' && Object.prototype.toString.call(window) === '[object Window]';

const isNode = () => typeof global !== 'undefined' && Object.prototype.toString.call(global) === '[object global]';

const isReactNative = () => typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

function appendVezgoIframe() {
  const name = 'vezgo-connect-widget';
  let iframe = document.getElementsByName(name)[0];

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.name = name;
    iframe.frameBorder = 0;

    iframe.setAttribute('style', [
      'width:100%; height:100%;',
      'position:fixed;',
      'top:0; left:0; right:0; bottom:0;',
      'z-index:2147483647;', // max possible z-index
    ].join(' '));

    document.body.appendChild(iframe);
  }

  iframe.style.display = 'block';

  return iframe;
}

function appendVezgoForm({ url, token, iframe }) {
  const form = document.createElement('form');
  form.target = iframe.name;
  form.method = 'POST';
  form.action = url;

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'token';
  input.value = token;
  form.appendChild(input);

  document.body.appendChild(form);

  return form;
}

const getQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    searchParams.append(key, params[key]);
  });

  return searchParams.toString();
};

module.exports = {
  isBrowser,
  isNode,
  isReactNative,
  appendVezgoIframe,
  appendVezgoForm,
  getQueryString,
};
