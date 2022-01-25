const { getQueryString } = require('../utils');

class Transactions {
  constructor(api) {
    this.api = api.userApi;
  }

  async getList(options = {}) {
    const { accountId, ...params } = options;

    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Please provide a valid Vezgo account id.');
    }

    let url = `/accounts/${accountId}/transactions`;
    const query = getQueryString(params);
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }

  async getOne(options = {}) {
    const { accountId, txId, ...params } = options;

    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Please provide a valid Vezgo account id.');
    }
    if (!txId || typeof txId !== 'string') {
      throw new Error('Please provide a valid Vezgo transaction id.');
    }

    let url = `/accounts/${accountId}/transactions/${txId}`;
    const query = getQueryString(params);
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }
}

module.exports = Transactions;
