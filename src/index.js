import API from './api';
import { DuplicateConnectionError } from './errors';

class Vezgo {
  init(config = {}) {
    const api = new API(config);

    return api._init();
  }
}

const vezgo = new Vezgo();
vezgo.DuplicateConnectionError = DuplicateConnectionError;

export default vezgo;