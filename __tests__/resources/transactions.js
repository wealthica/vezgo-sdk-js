const r = require('../testutils/resources');

describe('Vezgo Transactions resource', () => {
  r.setup.bind(this)(true);

  test('should NOT be initiated along with the Vezgo instance', () => {
    expect(this.vezgo.transactions).not.toBeDefined();
  });

  test('should be initiated along with the Vezgo User instance', () => {
    expect(this.user.transactions).toBeDefined();
    expect(this.user.transactions).toHaveProperty('getList');
    expect(this.user.transactions).toHaveProperty('getOne');
  });

  describe('.getList()', () => {
    test('should validate accountId', async () => {
      await expect(() => this.user.transactions.getList()).rejects.toThrow();
      await expect(() => this.user.transactions.getList({})).rejects.toThrow('account id');
      await expect(() => this.user.transactions.getList({ accountId: 1 })).rejects
        .toThrow('account id');
      expect(r.countRequests(this.userApiMock.history)).toBe(0);
    });

    test('should GET /accounts/:id/transactions', async () => {
      this.userApiMock.onGet().reply(200, [{ test: 'data' }]);
      const transactions = await this.user.transactions.getList({ accountId: 'test' });
      expect(transactions).toEqual(expect.arrayContaining([{ test: 'data' }]));
      expect(this.userApiMock.history.get[0].url).toBe('/accounts/test/transactions');
    });

    test('should forward query params', async () => {
      this.userApiMock.onGet().reply(200, [{ test: 'data' }]);
      await this.user.transactions.getList({
        accountId: 'test',
        from: '2021-01-01',
        to: '2021-10-01',
        ticker: 'ABC',
        wallet: 'aa:bb:cc',
        last: 'test',
        limit: 10,
        not: 'supported', // unsupported param should be ignored
      });
      expect(this.userApiMock.history.get[0].url).toBe(
        '/accounts/test/transactions?from=2021-01-01&to=2021-10-01&ticker=ABC&wallet=aa%3Abb%3Acc&last=test&limit=10',
      );
    });

    test('should allow passing an empty `last`', async () => {
      this.userApiMock.onGet().reply(200, [{ test: 'data' }]);
      await this.user.transactions.getList({ accountId: 'test', last: '' });
      expect(this.userApiMock.history.get[0].url).toBe('/accounts/test/transactions?last=');
    });

    r.shouldHandleApiError.bind(this)(
      () => this.userApiMock.onGet('/accounts/test/transactions'),
      () => this.user.transactions.getList({ accountId: 'test' }),
    );

    r.shouldHandleTokenError.bind(this)(
      () => this.user.transactions.getList({ accountId: 'test' }),
    );
  });

  describe('.getOne()', () => {
    test('should validate both accountId and txId', async () => {
      await expect(() => this.user.transactions.getOne()).rejects.toThrow();
      await expect(() => this.user.transactions.getOne({})).rejects.toThrow('account id');
      await expect(() => this.user.transactions.getOne({ txId: 'test' })).rejects
        .toThrow('account id');
      await expect(() => this.user.transactions.getOne({ accountId: 'test' })).rejects
        .toThrow('transaction id');
      await expect(() => this.user.transactions.getOne({ accountId: 'test', txId: 1 })).rejects
        .toThrow('transaction id');
      await expect(() => this.user.transactions.getOne({ accountId: 1, txId: 'test' })).rejects
        .toThrow('account id');
      expect(r.countRequests(this.userApiMock.history)).toBe(0);
    });

    test('should GET /accounts/:id/transactions/:txid', async () => {
      this.userApiMock.onGet().reply(200, { test: 'data' });
      const transaction = await this.user.transactions.getOne({
        accountId: 'test',
        txId: 'test',
        not: 'supported', // unsupported param should be ignored
      });
      expect(transaction).toEqual({ test: 'data' });
      expect(this.userApiMock.history.get[0].url).toBe('/accounts/test/transactions/test');
    });

    r.shouldHandleApiError.bind(this)(
      () => this.userApiMock.onGet('/accounts/test/transactions/test'),
      () => this.user.transactions.getOne({ accountId: 'test', txId: 'test' }),
    );

    r.shouldHandleTokenError.bind(this)(
      () => this.user.transactions.getOne({ accountId: 'test', txId: 'test' }),
    );
  });
});
