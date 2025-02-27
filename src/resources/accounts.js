import { getQueryString } from '../utils';

class Accounts {
  constructor(api) {
    this.api = api.userApi;
  }

  async getList(params = {}) {
    let url = '/accounts';
    const query = getQueryString(params);
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }

  async getOne(id, params = {}) {
    if (!id || typeof id !== 'string') throw new Error('Please provide a valid Vezgo account id.');

    let url = `/accounts/${id}`;
    const query = getQueryString(params);
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }

  async sync(id) {
    if (!id || typeof id !== 'string') throw new Error('Please provide a valid Vezgo account id.');

    const response = await this.api.post(`/accounts/${id}/sync`, {});
    if (!response.ok) throw response.originalError;

    return response.data;
  }

  async remove(id) {
    if (!id || typeof id !== 'string') throw new Error('Please provide a valid Vezgo account id.');

    const response = await this.api.delete(`/accounts/${id}`);
    if (!response.ok) throw response.originalError;
  }
}

export default Accounts;
