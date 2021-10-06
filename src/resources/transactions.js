class Transactions {
  constructor(api) {
    this.api = api.userApi;
  }

  async getList({
    accountId,
    from,
    to,
    ticker,
    wallet,
    last,
    limit,
  }) {
    if (!accountId) throw new Error('Please provide a valid Vezgo account id.');

    let url = `/accounts/${accountId}/transactions`;

    // TODO validate from, to & ticker
    const searchParams = new URLSearchParams();
    if (from) searchParams.append('from', from);
    if (to) searchParams.append('to', to);
    if (ticker) searchParams.append('ticker', ticker);
    if (wallet) searchParams.append('wallet', wallet);
    if (last !== undefined) searchParams.append('last', last); // allow an empty ?last
    if (limit) searchParams.append('limit', limit);

    const query = searchParams.toString();
    if (query) url = `${url}?${query}`;

    const response = await this.api.get(url);
    if (!response.ok) throw response.originalError;

    return response.data;
  }

  async getOne({ accountId, txId }) {
    if (!accountId) throw new Error('Please provide a valid Vezgo account id.');
    if (!txId) throw new Error('Please provide a valid Vezgo transaction id.');

    const response = await this.api.get(`/accounts/${accountId}/transactions/${txId}`);
    if (!response.ok) throw response.originalError;

    return response.data;
  }
}

module.exports = Transactions;
