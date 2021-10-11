class Providers {
  constructor(api) {
    this.api = api.api;
  }

  async getList() {
    const response = await this.api.get('/providers');
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
