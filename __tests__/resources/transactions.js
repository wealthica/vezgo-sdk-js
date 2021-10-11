const Vezgo = require('../../src');

describe('Vezgo Transactions resource', () => {
  test('should NOT be initiated along with the Vezgo instance', () => {
    const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
    expect(vezgo.transactions).not.toBeDefined();
  });

  test('should be initiated along with the Vezgo User instance', () => {
    const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
    expect(user.transactions).toBeDefined();
    expect(user.transactions).toHaveProperty('getList');
    expect(user.transactions).toHaveProperty('getOne');
  });

  describe('.getList()', () => {
    test('should validate accountId', async () => {
      const request = jest.fn().mockResolvedValue();
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.transactions.getList()).rejects.toThrow();
      await expect(() => user.transactions.getList({})).rejects.toThrow('account id');
      await expect(() => user.transactions.getList({ accountId: 1 })).rejects
        .toThrow('account id');
      expect(request).not.toHaveBeenCalled();
    });

    test('should call /accounts/:id/transactions endpoint', async () => {
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } }) // token call
        .mockResolvedValueOnce({ status: 200, data: [{ test: 'data' }] });
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      const transactions = await user.transactions.getList({ accountId: 'test' });
      expect(request).toHaveBeenCalledTimes(2);
      expect(request.mock.calls[1][0].url).toBe('/accounts/test/transactions');
      expect(transactions).toEqual(expect.arrayContaining([{ test: 'data' }]));
    });

    test('should forward query params', async () => {
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } })
        .mockResolvedValueOnce({ status: 200, data: [{ test: 'data' }] });
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await user.transactions.getList({
        accountId: 'test',
        from: '2021-01-01',
        to: '2021-10-01',
        ticker: 'ABC',
        wallet: 'aa:bb:cc',
        last: 'test',
        limit: 10,
        not: 'supported', // unsupported param should be ignored
      });
      expect(request).toHaveBeenCalledTimes(2);
      expect(request.mock.calls[1][0].url).toBe(
        '/accounts/test/transactions?from=2021-01-01&to=2021-10-01&ticker=ABC&wallet=aa%3Abb%3Acc&last=test&limit=10',
      );
    });

    test('should allow passing an empty `last`', async () => {
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } })
        .mockResolvedValueOnce({ status: 200, data: [{ test: 'data' }] });
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await user.transactions.getList({ accountId: 'test', last: '' });
      expect(request).toHaveBeenCalledTimes(2); // called once because token request is not needed
      expect(request.mock.calls[1][0].url).toBe('/accounts/test/transactions?last=');
    });

    test('should handle API error', async () => {
      const error = new Error('Test Error');
      error.response = { status: 400 };
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } })
        .mockRejectedValueOnce(error);
      mockAxios({ request });

      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.transactions.getList({ accountId: 'test' })).rejects
        .toThrow('Test Error');
    });

    test('should handle token error', async () => {
      const error = new Error('Token Error');
      error.response = { status: 400 };
      const request = jest.fn().mockRejectedValue(error);
      mockAxios({ request });

      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.transactions.getList({ accountId: 'test' })).rejects
        .toThrow('Token Error');
      expect(request).toHaveBeenCalledTimes(1);
    });
  });

  describe('.getOne()', () => {
    test('should validate both accountId and txId', async () => {
      const request = jest.fn().mockResolvedValue();
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.transactions.getOne()).rejects.toThrow();
      await expect(() => user.transactions.getOne({})).rejects.toThrow('account id');
      await expect(() => user.transactions.getOne({ txId: 'test' })).rejects.toThrow('account id');
      await expect(() => user.transactions.getOne({ accountId: 'test' })).rejects
        .toThrow('transaction id');
      await expect(() => user.transactions.getOne({ accountId: 'test', txId: 1 })).rejects
        .toThrow('transaction id');
      await expect(() => user.transactions.getOne({ accountId: 1, txId: 'test' })).rejects
        .toThrow('account id');
      expect(request).not.toHaveBeenCalled();
    });

    test('should call /accounts/:id/transactions/:txid endpoint', async () => {
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } })
        .mockResolvedValueOnce({ status: 200, data: { test: 'data' } });
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      const transaction = await user.transactions.getOne({
        accountId: 'test',
        txId: 'test',
        not: 'supported', // unsupported param should be ignored
      });
      expect(request).toHaveBeenCalledTimes(2);
      expect(request.mock.calls[1][0].url).toBe('/accounts/test/transactions/test');
      expect(transaction).toEqual({ test: 'data' });
    });

    test('should handle API error', async () => {
      const error = new Error('Test Error');
      error.response = { status: 400 };
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } })
        .mockRejectedValueOnce(error);
      mockAxios({ request });

      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.transactions.getOne({ accountId: 'test', txId: 'test' })).rejects
        .toThrow('Test Error');
    });

    test('should handle token error', async () => {
      const error = new Error('Token Error');
      error.response = { status: 400 };
      const request = jest.fn().mockRejectedValue(error);
      mockAxios({ request });

      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.transactions.getOne({ accountId: 'test', txId: 'test' })).rejects
        .toThrow('Token Error');
      expect(request).toHaveBeenCalledTimes(1);
    });
  });
});
