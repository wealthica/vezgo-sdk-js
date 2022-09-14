const MockAdapter = require('axios-mock-adapter');
const Vezgo = require('../src');
const c = require('./testutils/common');
const { generateToken } = require('./testutils/helpers');

describe('Vezgo User instance (NodeJS)', () => {
  beforeEach(() => {
    mockNode();
    this.user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
    this.token = generateToken();
    this.apiMock = new MockAdapter(this.user.api.axiosInstance);
    this.apiMock.onPost('/auth/token').reply(200, { token: this.token });
  });

  test('should not allow .connect() and .reconnect()', () => {
    expect(() => this.user.connect()).toThrow(/Browser/);
    expect(() => this.user.reconnect('test')).toThrow(/Browser/);
  });

  describe('.fetchToken()', () => {
    test('should call Vezgo /auth/token endpoint', async () => {
      const resultToken = await this.user.fetchToken();
      expect(resultToken).toEqual(this.token);
      expect(this.apiMock.history.post).toHaveLength(1);
      expect(this.apiMock.history.post[0].url).toBe('/auth/token');
      expect(this.apiMock.history.post[0].baseURL).toBe('https://api.vezgo.com/v1');
    });

    test('should handle error from /auth/token', async () => {
      this.apiMock.onPost('/auth/token').reply(400);
      await expect(() => this.user.fetchToken()).rejects.toThrow('400');

      this.apiMock.onPost('/auth/token').reply(500);
      await expect(() => this.user.fetchToken()).rejects.toThrow('500');
    });
  });

  c.testGetTokenBehavior.bind(this)();
  c.testAutoRefreshBehavior.bind(this)();
  c.testGetConnectDataBehavior.bind(this)();
});
