import API from './api';
export { DuplicateConnectionError } from './errors';

class Vezgo {
   
  init(config = {}) {
    const api = new API(config);

    return api._init();
  }
}

export default new Vezgo();