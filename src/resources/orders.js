import { getQueryString } from '../utils';

class Orders {
  constructor(api) {
    this.api = api.userApi;
  }

  async getList(options = {}) {
    const { accountId, ...params } = options;

    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Please provide a valid Vezgo account id.');
    }

    let url = `/accounts/${accountId}/orders`;
    const query = getQueryString(params);
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }

  async getOne(options = {}) {
    const { accountId, orderId, ...params } = options;

    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Please provide a valid Vezgo account id.');
    }
    if (!orderId || typeof orderId !== 'string') {
      throw new Error('Please provide a valid Vezgo order id.');
    }

    let url = `/accounts/${accountId}/orders/${orderId}`;
    const query = getQueryString(params);
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }
}

export default Orders;
