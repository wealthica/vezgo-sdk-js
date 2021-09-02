class Teams {
  constructor(api) {
    this.api = api.api;
    this.clientId = api.config.clientId;
  }

  async info() {
    const response = await this.api.get(`/teams/info?client_id=${this.clientId}`);
    if (!response.ok) throw response.originalError;

    return response.data;
  }
}

module.exports = Teams;
