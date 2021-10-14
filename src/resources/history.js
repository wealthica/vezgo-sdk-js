class History {
  constructor(api) {
    this.api = api.userApi;
  }

  async getList({
    accountId,
    from,
    to,
    wallet,
  }) {
    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Please provide a valid Vezgo account id.');
    }

    let url = `/accounts/${accountId}/history`;

    // TODO validate from & to
    const searchParams = new URLSearchParams();
    if (from) searchParams.append('from', from);
    if (to) searchParams.append('to', to);
    if (wallet) searchParams.append('wallet', wallet);

    const query = searchParams.toString();
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }
}

module.exports = History;
