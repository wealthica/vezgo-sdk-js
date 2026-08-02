import { getQueryString } from '../utils';

class Transfers {
  constructor(api) {
    this.api = api.userApi;
  }

  async getList(options = {}) {
    const { accountId, ...params } = options;

    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Please provide a valid Vezgo account id.');
    }

    let url = `/accounts/${accountId}/transfers`;
    const query = getQueryString(params);
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }

  async getOne(options = {}) {
    const { accountId, transferId } = options;

    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Please provide a valid Vezgo account id.');
    }

    if (!transferId || typeof transferId !== 'string') {
      throw new Error('Please provide a valid Vezgo transfer id.');
    }

    const response = await this.api.get(`/accounts/${accountId}/transfers/${transferId}`);
    if (!response.ok) throw response.originalError;

    return response.data;
  }
}

export default Transfers;
