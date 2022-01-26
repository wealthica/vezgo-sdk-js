const c = require('../testutils/common');
const h = require('../testutils/helpers');

describe('Vezgo History resource', () => {
  c.setupResource.bind(this)({ isUser: true });

  test('should NOT be initiated along with the Vezgo instance', () => {
    expect(this.vezgo.history).not.toBeDefined();
  });

  test('should be initiated along with the Vezgo User instance', () => {
    expect(this.user.history).toBeDefined();
    expect(this.user.history).toHaveProperty('getList');
  });

  describe('.getList()', () => {
    test('should validate accountId', async () => {
      await expect(() => this.user.history.getList()).rejects.toThrow();
      await expect(() => this.user.history.getList({})).rejects.toThrow('account id');
      await expect(() => this.user.history.getList({ accountId: 1 })).rejects
        .toThrow('account id');
      expect(h.countRequests(this.userApiMock)).toBe(0);
    });

    test('should GET /accounts/:id/history', async () => {
      this.userApiMock.onGet().reply(200, [{ test: 'data' }]);
      const history = await this.user.history.getList({ accountId: 'test' });
      expect(history).toEqual(expect.arrayContaining([{ test: 'data' }]));
      expect(this.userApiMock.history.get[0].url).toBe('/accounts/test/history');
    });

    test('should forward query params', async () => {
      this.userApiMock.onGet().reply(200, [{ test: 'data' }]);
      await this.user.history.getList({
        accountId: 'test',
        from: '2021-01-01',
        to: '2021-10-01',
        wallet: 'aa:bb:cc',
        anything: 'else',
      });
      expect(this.userApiMock.history.get[0].url).toBe(
        '/accounts/test/history?from=2021-01-01&to=2021-10-01&wallet=aa%3Abb%3Acc&anything=else',
      );
    });

    c.shouldHandleResourceEndpointError.bind(this)({
      mockCall: () => this.userApiMock.onGet('/accounts/test/history'),
      methodCall: () => this.user.history.getList({ accountId: 'test' }),
    });

    c.shouldHandleTokenError.bind(this)({
      methodCall: () => this.user.history.getList({ accountId: 'test' }),
    });
  });
});
