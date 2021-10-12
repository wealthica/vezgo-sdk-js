// This file contains common reusable tests
const MockAdapter = require('axios-mock-adapter');
const Vezgo = require('../../src');
const { countRequests, generateToken } = require('./helpers');

// Setting up resource tests
module.exports.setupResource = function (isUserResource) {
  beforeEach(() => {
    this.vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
    this.user = this.vezgo.login('test');

    if (isUserResource) {
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

module.exports.shouldValidateId = function (message, isUserMethod, calls) {
  test('should validate id', async () => {
    for (let i = 0; i < calls.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await expect(calls[i]).rejects.toThrow(message);
    }
    expect(this.apiMock.history.post).toHaveLength(0);
    expect(countRequests(isUserMethod ? this.userApiMock : this.apiMock)).toBe(0);
  });
};

module.exports.shouldHandleApiError = function (mockCall, methodCall) {
  test('should handle API error', async () => {
    mockCall().reply(400);
    await expect(methodCall).rejects.toThrow('400');
    mockCall().reply(500);
    await expect(methodCall).rejects.toThrow('500');
  });
};

module.exports.shouldHandleTokenError = function (call) {
  test('should handle token error', async () => {
    this.apiMock.onPost('/auth/token').reply(400);
    await expect(call).rejects.toThrow('400');
    this.apiMock.onPost('/auth/token').reply(500);
    await expect(call).rejects.toThrow('500');
    expect(countRequests(this.userApiMock)).toBe(0);
  });
};

module.exports.testGetTokenBehavior = function (isBrowser) {
  describe('.getToken()', () => {
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
  });
};

module.exports.testAutoRefreshBehavior = function (isBrowser) {
  describe('when making API calls', () => {
    beforeEach(() => {
      const userApiMock = new MockAdapter(this.user.userApi.axiosInstance);
      userApiMock.onGet('/accounts/test').reply(200, { test: 'data' });
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
  });
};
