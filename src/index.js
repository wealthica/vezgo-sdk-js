require('core-js/stable');
require('regenerator-runtime/runtime');

const API = require('./api');

class Vezgo {
  // eslint-disable-next-line class-methods-use-this
  init(config = {}) {
    const api = new API(config);

    return api.init();
  }
}

module.exports = new Vezgo();
