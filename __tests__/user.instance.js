const jwt = require('jsonwebtoken');
const MockAdapter = require('axios-mock-adapter');
const Vezgo = require('../src');

jest.unmock('axios');

function createInstance() {
  return Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
}

describe('Vezgo User instance', () => {
  describe('._connect()', () => {
    test('should throw in NodeJS and ReactNative', () => {
      mockNode();
      expect(() => createInstance()._connect()).toThrow(/Browser/);

      mockReactNative();
      expect(() => createInstance()._connect()).toThrow(/Browser/);
    });
  });

  describe('.reconnect()', () => {
    test('should require accountId', () => {
      mockBrowser();
      expect(() => createInstance().reconnect()).toThrow(/accountId/);
    });
  });

  describe('.fetchToken()', () => {
    const token = jwt.sign({}, 'test');
    let user;
    let mock;

    describe('in NodeJS', () => {
      beforeEach(() => {
        user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
        mock = new MockAdapter(user.api.axiosInstance);
      });

      test('should call Vezgo /auth/token endpoint', async () => {
        mock.onPost().reply(200, { token });
        const resultToken = await user.fetchToken();
        expect(resultToken).toEqual(token);
        expect(mock.history.post).toHaveLength(1);
        expect(mock.history.post[0].url).toBe('/auth/token');
        expect(mock.history.post[0].baseURL).toBe('https://api.vezgo.com/v1');
      });

      test('should handle error from /auth/token', async () => {
        mock.onPost().reply(400);
        await expect(() => user.fetchToken()).rejects.toThrow();
      });
    });

    describe('in Browser', () => {
      beforeEach(() => {
        mockBrowser();
        user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
        mock = new MockAdapter(user.authApi.axiosInstance);
      });

      test('should call default /vezgo/auth endpoint', async () => {
        mock.onPost().reply(200, { token });
        const resultToken = await user.fetchToken();
        expect(resultToken).toEqual(token);
        expect(mock.history.post).toHaveLength(1);
        expect(mock.history.post[0].url).toBe('/vezgo/auth');
        expect(mock.history.post[0].baseURL).toBeUndefined();
      });

      test('should handle error from /vezgo/auth', async () => {
        mock.onPost().reply(400);
        await expect(() => user.fetchToken()).rejects.toThrow();
      });
    });
  });
});
