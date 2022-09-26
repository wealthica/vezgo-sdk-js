// This file contains common reusable tests
const MockAdapter = require('axios-mock-adapter');
const Vezgo = require('../../src');
const { countRequests, generateToken } = require('./helpers');

// Setting up resource tests
module.exports.setupResource = function ({ isUser } = {}) {
  beforeEach(() => {
    this.vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
    this.user = this.vezgo.login('test');

    if (isUser) {
      // For user resources (accounts, transactions), create mock on the user object
      this.apiMock = new MockAdapter(this.user.api.axiosInstance);
      this.apiMock.onPost('/auth/token').reply(200, { token: 'test' });
      this.userApiMock = new MockAdapter(this.user.userApi.axiosInstance);
    } else {
      // For data resources (providers, teams), create mock on the vezgo object
      this.apiMock = new MockAdapter(this.vezgo.api.axiosInstance);
    }
  });
};

module.exports.shouldValidateResourceId = function ({ message, isUser, calls } = {}) {
  test('should validate id', async () => {
    for (let i = 0; i < calls.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await expect(calls[i]).rejects.toThrow(message);
    }
    expect(this.apiMock.history.post).toHaveLength(0);
    expect(countRequests(isUser ? this.userApiMock : this.apiMock)).toBe(0);
  });
};

module.exports.shouldHandleResourceEndpointError = function ({ mockCall, methodCall } = {}) {
  test('should handle API error', async () => {
    mockCall().reply(400);
    await expect(methodCall).rejects.toThrow('400');
    mockCall().reply(500);
    await expect(methodCall).rejects.toThrow('500');
  });
};

module.exports.shouldHandleTokenError = function ({ methodCall } = {}) {
  test('should handle token error', async () => {
    this.apiMock.onPost('/auth/token').reply(400);
    await expect(methodCall).rejects.toThrow('400');
    this.apiMock.onPost('/auth/token').reply(500);
    await expect(methodCall).rejects.toThrow('500');
    expect(countRequests(this.userApiMock)).toBe(0);
  });
};

module.exports.testGetTokenBehavior = function ({ isBrowser } = {}) {
  describe('.getToken()', () => {
    test('should fetch a new token if the existing one is about to expire', async () => {
      const mockObject = isBrowser ? this.authMock : this.apiMock;

      const existingToken = generateToken(9); // 9 secs remaining
      const newToken = generateToken();
      mockObject.reset();
      mockObject
        .onPost()
        .replyOnce(200, { token: existingToken })
        .onPost()
        .replyOnce(200, { token: newToken });

      const fetchResult = await this.user.fetchToken();
      const getResult = await this.user.getToken();
      expect(fetchResult).toEqual(existingToken);
      expect(getResult).toEqual(newToken);
      expect(mockObject.history.post).toHaveLength(2);
    });

    test('should return existing token if still valid', async () => {
      const mockObject = isBrowser ? this.authMock : this.apiMock;

      const token = generateToken(11); // 11 secs remaining
      mockObject.reset();
      mockObject.onPost().replyOnce(200, { token });

      const fetchResult = await this.user.fetchToken();
      const getResult = await this.user.getToken();
      expect(fetchResult).toEqual(token);
      expect(getResult).toEqual(token);
      expect(mockObject.history.post).toHaveLength(1);
    });
  });
};

module.exports.testAutoRefreshBehavior = function ({ isBrowser } = {}) {
  describe('when making API calls', () => {
    beforeEach(() => {
      const userApiMock = new MockAdapter(this.user.userApi.axiosInstance);
      userApiMock.onGet('/accounts/test').reply(200, { test: 'data' });
    });

    test('should refresh token if the existing one is about to expire', async () => {
      const mockObject = isBrowser ? this.authMock : this.apiMock;

      const existingToken = generateToken(9); // 9 secs remaining
      const newToken = generateToken();
      mockObject.reset();
      mockObject
        .onPost()
        .replyOnce(200, { token: existingToken })
        .onPost()
        .replyOnce(200, { token: newToken });

      await this.user.fetchToken();

      const account = await this.user.accounts.getOne('test');
      expect(account).toEqual({ test: 'data' });
      expect(mockObject.history.post).toHaveLength(2);
    });

    test('should not refresh token if the existing one is still good', async () => {
      const mockObject = isBrowser ? this.authMock : this.apiMock;

      const token = generateToken(11); // 11 secs remaining
      mockObject.reset();
      mockObject.onPost().replyOnce(200, { token });

      await this.user.fetchToken();
      const account = await this.user.accounts.getOne('test');
      expect(account).toEqual({ test: 'data' });
      expect(mockObject.history.post).toHaveLength(1);
    });
  });
};

module.exports.testGetConnectDataBehavior = function ({ isBrowser } = {}) {
  describe('.getConnectData()', () => {
    test('should return the correct url and token', async () => {
      const { url, token } = await this.user.getConnectData();
      const expectedUrl = isBrowser
        ? 'https://connect.vezgo.com/connect?client_id=test&lang=en&origin=http%3A%2F%2Flocalhost&theme=light&providers_per_line=2'
        : 'https://connect.vezgo.com/connect?client_id=test&lang=en&theme=light&providers_per_line=2';

      expect(url).toBe(expectedUrl);
      expect(token).toBe(this.token);
    });

    test('should return preselected url if `provider` is passed in', async () => {
      const { url } = await this.user.getConnectData({ provider: 'someprovider' });
      expect(url).toContain('https://connect.vezgo.com/connect/someprovider?');
    });

    test('should return reconnect url if `accountId` is passed in', async () => {
      const { url } = await this.user.getConnectData({
        provider: 'someprovider', // to test accountId taking precedence
        accountId: 'someaccount',
      });
      expect(url).toContain('https://connect.vezgo.com/reconnect/someaccount?');
    });

    test('should use `redirectURI` if passed to the method or Vezgo.init()', async () => {
      if (isBrowser) {
        this.user = Vezgo.init({ clientId: 'test', redirectURI: 'http://testuri' }).login();
        this.authMock = new MockAdapter(this.user.authApi.axiosInstance);
        this.authMock.onPost('/vezgo/auth').reply(200, { token: this.token });
      } else {
        this.user = Vezgo.init({
          clientId: 'test',
          secret: 'test',
          redirectURI: 'http://testuri',
        }).login('test');
        this.apiMock = new MockAdapter(this.user.api.axiosInstance);
        this.apiMock.onPost('/auth/token').reply(200, { token: this.token });
      }

      const { url } = await this.user.getConnectData();
      expect(url).toContain('redirect_uri=http%3A%2F%2Ftesturi');

      // redirectURI passed to the method call takes precedence over Vezgo.init() option
      const { url: url2 } = await this.user.getConnectData({ redirectURI: 'http://anotheruri' });
      expect(url2).toContain('redirect_uri=http%3A%2F%2Fanotheruri');
    });

    test('should use custom `lang` if passed in', async () => {
      const { url } = await this.user.getConnectData({ lang: 'fr' });
      expect(url).toContain('lang=fr');
    });

    test('should use custom `theme` if passed in', async () => {
      const { url } = await this.user.getConnectData({ theme: 'dark' });
      expect(url).toContain('theme=dark');
    });

    test('should use custom `providersPerLine` if passed in', async () => {
      const { url } = await this.user.getConnectData({ providersPerLine: '1' });
      expect(url).toContain('providers_per_line=1');
    });

    test('should use `state` if passed in', async () => {
      const { url } = await this.user.getConnectData({ state: 'eyJzb21lIjoiZGF0YSIsIm90aGVyIjoxfQ==' });
      expect(url).toContain('state=eyJzb21lIjoiZGF0YSIsIm90aGVyIjoxfQ%3D%3D');

      // handle empty
      const { url: url2 } = await this.user.getConnectData({ state: '' });
      expect(url2).not.toContain('state=');
      const { url: url3 } = await this.user.getConnectData({ state: undefined });
      expect(url3).not.toContain('state=');
      const { url: url4 } = await this.user.getConnectData({ state: null });
      expect(url4).not.toContain('state=');
    });

    test('should ignore unsupported params', async () => {
      const { url } = await this.user.getConnectData({ not: 'supported' });
      expect(url).not.toContain('not=');
    });

    test('should refresh token if the existing one has less than 10 minutes left', async () => {
      const mockObject = isBrowser ? this.authMock : this.apiMock;

      const existingToken = generateToken(599);
      const newToken = generateToken();
      mockObject.reset();
      mockObject
        .onPost()
        .replyOnce(200, { token: existingToken })
        .onPost()
        .replyOnce(200, { token: newToken });

      await this.user.fetchToken();
      const { url } = await this.user.getConnectData();
      expect(url).toContain('https://connect.vezgo.com/');
      expect(mockObject.history.post).toHaveLength(2);
    });

    test('should not refresh token if the existing one has more than 10 minutes left', async () => {
      const mockObject = isBrowser ? this.authMock : this.apiMock;

      const existingToken = generateToken(601);
      mockObject.reset();
      mockObject.onPost().replyOnce(200, { token: existingToken });

      await this.user.fetchToken();
      const { url } = await this.user.getConnectData();
      expect(url).toContain('https://connect.vezgo.com/');
      expect(mockObject.history.post).toHaveLength(1);
    });
  });
};
