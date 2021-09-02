import API from './api';

class Vezgo {
  // eslint-disable-next-line class-methods-use-this
  async init(config = {}) {
    const api = new API(config);
    await api.init();

    return api;
  }
}

export default new Vezgo();
