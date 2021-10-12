// This file contains helpers for the resource tests
const MockAdapter = require('axios-mock-adapter');
const Vezgo = require('../../src');

function countRequests(mockHistory) {
  return Object.keys(mockHistory).reduce((prev, method) => prev + mockHistory[method].length, 0);
}
module.exports.countRequests = countRequests;

module.exports.setup = function (isUserResource) {
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
    expect(countRequests(this[isUserMethod ? 'userApiMock' : 'apiMock'].history)).toBe(0);
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
    expect(countRequests(this.userApiMock.history)).toBe(0);
  });
};
