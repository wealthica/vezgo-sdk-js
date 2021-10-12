const c = require('../testutils/common');

describe('Vezgo Accounts resource', () => {
  c.setupResource.bind(this)(true);

  test('should NOT be initiated along with the Vezgo instance', () => {
    expect(this.vezgo.accounts).not.toBeDefined();
  });

  test('should be initiated along with the Vezgo User instance', () => {
    expect(this.user.accounts).toBeDefined();
    expect(this.user.accounts).toHaveProperty('getList');
    expect(this.user.accounts).toHaveProperty('getOne');
    expect(this.user.accounts).toHaveProperty('remove');
  });

  describe('.getList()', () => {
    test('should GET /accounts', async () => {
      this.userApiMock.onGet().reply(200, [{ test: 'data' }]);
      const accounts = await this.user.accounts.getList();
      expect(accounts).toEqual(expect.arrayContaining([{ test: 'data' }]));
      expect(this.userApiMock.history.get[0].url).toBe('/accounts');
    });

    c.shouldHandleApiError.bind(this)(
      () => this.userApiMock.onGet('/accounts'),
      () => this.user.accounts.getList(),
    );

    c.shouldHandleTokenError.bind(this)(() => this.user.accounts.getList());
  });

  describe('.getOne()', () => {
    test('should GET /accounts/:id', async () => {
      this.userApiMock.onGet().reply(200, { test: 'data' });
      const account = await this.user.accounts.getOne('test');
      expect(account).toEqual({ test: 'data' });
      expect(this.userApiMock.history.get[0].url).toBe('/accounts/test');
    });

    c.shouldValidateId.bind(this)('account id', true, [
      () => this.user.accounts.getOne(),
      () => this.user.accounts.getOne(1),
    ]);

    c.shouldHandleApiError.bind(this)(
      () => this.userApiMock.onGet('/accounts/test'),
      () => this.user.accounts.getOne('test'),
    );

    c.shouldHandleTokenError.bind(this)(() => this.user.accounts.getOne('test'));
  });

  describe('.remove()', () => {
    test('should DELETE /accounts/:id', async () => {
      this.userApiMock.onDelete().reply(202);
      const account = await this.user.accounts.remove('test');
      expect(account).toBeUndefined(); // should not return anything on success
      expect(this.userApiMock.history.delete[0].url).toBe('/accounts/test');
    });

    c.shouldValidateId.bind(this)('account id', true, [
      () => this.user.accounts.remove(),
      () => this.user.accounts.remove(1),
    ]);

    c.shouldHandleApiError.bind(this)(
      () => this.userApiMock.onDelete('/accounts/test'),
      () => this.user.accounts.remove('test'),
    );

    c.shouldHandleTokenError.bind(this)(() => this.user.accounts.remove('test'));
  });
});
