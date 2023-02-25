const { getQueryString } = require('../utils');

class Providers {
  constructor(api) {
    this.api = api.api;
  }

  async getList(options = {}) {
    let url = '/providers';
    const query = getQueryString(options);
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }

  async getOne(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Please provide a valid Vezgo provider id.');
    }

    const response = await this.api.get(`/providers/${id}`);
    if (!response.ok) throw response.originalError;

    return response.data;
  }
}

module.exports = Providers;
