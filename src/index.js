const API = require('./api');

class Vezgo {
  // eslint-disable-next-line class-methods-use-this
  async init(config = {}) {
    const api = new API();
    await api.init(config);

    return api;
  }
}

module.exports = new Vezgo();
