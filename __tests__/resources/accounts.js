const c = require('../testutils/common');

describe('Vezgo Accounts resource', () => {
  c.setupResource.bind(this)({ isUser: true });

  test('should NOT be initiated along with the Vezgo instance', () => {
    expect(this.vezgo.accounts).not.toBeDefined();
  });

  test('should be initiated along with the Vezgo User instance', () => {
    expect(this.user.accounts).toBeDefined();
    expect(this.user.accounts).toHaveProperty('getList');
    expect(this.user.accounts).toHaveProperty('getOne');
    expect(this.user.accounts).toHaveProperty('sync');
    expect(this.user.accounts).toHaveProperty('remove');
  });

  describe('.getList()', () => {
    test('should GET /accounts', async () => {
      this.userApiMock.onGet().reply(200, [{ test: 'data' }]);
      const accounts = await this.user.accounts.getList();
      expect(accounts).toEqual(expect.arrayContaining([{ test: 'data' }]));
      expect(this.userApiMock.history.get[0].url).toBe('/accounts');
    });

    c.shouldHandleResourceEndpointError.bind(this)({
      mockCall: () => this.userApiMock.onGet('/accounts'),
      methodCall: () => this.user.accounts.getList(),
    });

    c.shouldHandleTokenError.bind(this)({
      methodCall: () => this.user.accounts.getList(),
    });
  });

  describe('.getOne()', () => {
    test('should GET /accounts/:id', async () => {
      this.userApiMock.onGet().reply(200, { test: 'data' });
      const account = await this.user.accounts.getOne('test');
      expect(account).toEqual({ test: 'data' });
      expect(this.userApiMock.history.get[0].url).toBe('/accounts/test');
    });

    c.shouldValidateResourceId.bind(this)({
      message: 'account id',
      isUser: true,
      calls: [
        () => this.user.accounts.getOne(),
        () => this.user.accounts.getOne(1),
      ],
    });

    c.shouldHandleResourceEndpointError.bind(this)({
      mockCall: () => this.userApiMock.onGet('/accounts/test'),
      methodCall: () => this.user.accounts.getOne('test'),
    });

    c.shouldHandleTokenError.bind(this)({
      methodCall: () => this.user.accounts.getOne('test'),
    });
  });

  describe('.sync()', () => {
    test('should POST /accounts/:id/sync', async () => {
      this.userApiMock.onPost().reply(202, { test: 'data' });
      const account = await this.user.accounts.sync('test');
      expect(account).toEqual({ test: 'data' });
      expect(this.userApiMock.history.post[0].url).toBe('/accounts/test/sync');
    });

    c.shouldValidateResourceId.bind(this)({
      message: 'account id',
      isUser: true,
      calls: [
        () => this.user.accounts.sync(),
        () => this.user.accounts.sync(1),
      ],
    });

    c.shouldHandleResourceEndpointError.bind(this)({
      mockCall: () => this.userApiMock.onPost('/accounts/test/sync'),
      methodCall: () => this.user.accounts.sync('test'),
    });

    c.shouldHandleTokenError.bind(this)({
      methodCall: () => this.user.accounts.sync('test'),
    });
  });

  describe('.remove()', () => {
    test('should DELETE /accounts/:id', async () => {
      this.userApiMock.onDelete().reply(202);
      const account = await this.user.accounts.remove('test');
      expect(account).toBeUndefined(); // should not return anything on success
      expect(this.userApiMock.history.delete[0].url).toBe('/accounts/test');
    });

    c.shouldValidateResourceId.bind(this)({
      message: 'account id',
      isUser: true,
      calls: [
        () => this.user.accounts.remove(),
        () => this.user.accounts.remove(1),
      ],
    });

    c.shouldHandleResourceEndpointError.bind(this)({
      mockCall: () => this.userApiMock.onDelete('/accounts/test'),
      methodCall: () => this.user.accounts.remove('test'),
    });

    c.shouldHandleTokenError.bind(this)({
      methodCall: () => this.user.accounts.remove('test'),
    });
  });
});
