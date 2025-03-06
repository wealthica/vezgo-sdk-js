import API from './api';

class Vezgo {
   
  init(config = {}) {
    const api = new API(config);

    return api._init();
  }
}

export default new Vezgo();