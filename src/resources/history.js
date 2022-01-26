const { getQueryString } = require('../utils');

class History {
  constructor(api) {
    this.api = api.userApi;
  }

  async getList(options = {}) {
    const { accountId, ...params } = options;

    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Please provide a valid Vezgo account id.');
    }

    let url = `/accounts/${accountId}/history`;
    const query = getQueryString(params);
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }
}

module.exports = History;
