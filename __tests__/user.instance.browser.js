import MockAdapter from 'axios-mock-adapter';
import Vezgo from '../src';
import c from './testutils/common';
import { generateToken } from './testutils/helpers';

describe('Vezgo User instance (Browser)', () => {
  beforeEach(() => {
    mockBrowser();
    this.user = Vezgo.init({ clientId: 'test' }).login();
    this.token = generateToken();
    this.authMock = new MockAdapter(this.user.authApi.axiosInstance);
    this.authMock.onPost('/vezgo/auth').reply(200, { token: this.token });
    this.apiMock = new MockAdapter(this.user.api.axiosInstance);
  });

  describe('.reconnect()', () => {
    test('should require accountId', () => {
      expect(() => this.user.reconnect()).toThrow(/accountId/);
    });
  });

  describe('.fetchToken()', () => {
    test('should call default authEndpoint', async () => {
      const resultToken = await this.user.fetchToken();
      expect(resultToken).toEqual(this.token);
      expect(this.authMock.history.post).toHaveLength(1);
      expect(this.authMock.history.post[0].url).toBe('/vezgo/auth');
      expect(this.authMock.history.post[0].baseURL).toBeUndefined();
    });

    test('should call custom authEndpoint if defined', async () => {
      this.user = Vezgo.init({
        clientId: 'test',
        authEndpoint: 'http://localhost/custom/auth',
      }).login('test');
      this.authMock = new MockAdapter(this.user.authApi.axiosInstance);
      this.authMock.onPost('http://localhost/custom/auth').reply(200, { token: this.token });

      const resultToken = await this.user.fetchToken();
      expect(resultToken).toEqual(this.token);
      expect(this.authMock.history.post).toHaveLength(1);
      expect(this.authMock.history.post[0].url).toBe('http://localhost/custom/auth');
    });

    test('should pass custom params & headers to authEndpoint if defined', async () => {
      this.user = Vezgo.init({
        clientId: 'test',
        auth: {
          params: { custom: 'param' },
          headers: { custom: 'header' },
        },
      }).login('test');
      this.authMock = new MockAdapter(this.user.authApi.axiosInstance);
      this.authMock.onPost('/vezgo/auth').reply(200, { token: this.token });

      const resultToken = await this.user.fetchToken();
      expect(resultToken).toEqual(this.token);
      expect(this.authMock.history.post).toHaveLength(1);
      expect(this.authMock.history.post[0].url).toBe('/vezgo/auth');
      expect(this.authMock.history.post[0].data).toBe('{"custom":"param"}');
      expect(this.authMock.history.post[0].headers).toHaveProperty('custom', 'header');
    });

    test('should handle error from authEndpoint', async () => {
      this.authMock.onPost('/vezgo/auth').reply(400);
      await expect(() => this.user.fetchToken()).rejects.toThrow('400');

      this.authMock.onPost('/vezgo/auth').reply(500);
      await expect(() => this.user.fetchToken()).rejects.toThrow('500');
    });

    test('should get token via authorizer function if defined', async () => {
      const authorizer = vi.fn().mockImplementation((callback) => {
        callback(null, { token: this.token });
      });
      this.user = Vezgo.init({
        clientId: 'test',
        authEndpoint: 'http://localhost/custom/auth', // to test authorizer taking precedence
        authorizer,
      }).login('test');
      this.authMock = new MockAdapter(this.user.authApi.axiosInstance);

      const resultToken = await this.user.fetchToken();
      expect(resultToken).toEqual(this.token);
      expect(authorizer).toHaveBeenCalled();
      expect(this.authMock.history.post).toHaveLength(0);
    });

    test('should handle error from authorizer function', async () => {
      const authorizer = vi.fn().mockImplementation((callback) => {
        callback(new Error('test error'));
      });
      this.user = Vezgo.init({
        clientId: 'test',
        authEndpoint: 'http://localhost/custom/auth', // to test authorizer taking precedence
        authorizer,
      }).login('test');
      this.authMock = new MockAdapter(this.user.authApi.axiosInstance);
      await expect(() => this.user.fetchToken()).rejects.toThrow('test error');
    });

    test('should handle invalid result from authorizer function', async () => {
      const authorizer = vi.fn().mockImplementation((callback) => {
        callback(null, { wrong: 'result' });
      });
      this.user = Vezgo.init({
        clientId: 'test',
        authEndpoint: 'http://localhost/custom/auth', // to test authorizer taking precedence
        authorizer,
      }).login('test');
      this.authMock = new MockAdapter(this.user.authApi.axiosInstance);
      await expect(() => this.user.fetchToken()).rejects.toThrow('Invalid authorizer result');
    });
  });

  c.testGetTokenBehavior.bind(this)({ isBrowser: true });
  c.testAutoRefreshBehavior.bind(this)({ isBrowser: true });
  c.testGetConnectDataBehavior.bind(this)({ isBrowser: true });

  describe('Connect widget message handling', () => {
    beforeEach(() => {
      this.onConnection = vi.fn();
      this.onError = vi.fn();
      this.onEvent = vi.fn();
      this.user.onConnection(this.onConnection);
      this.user.onError(this.onError);
      this.user.onEvent(this.onEvent);
      // Simulate an open widget so _triggerCallback actually invokes the callbacks.
      this.user._widgetOpened = true;
      this.user._widgetActive = true;
    });

    const send = (payload) => this.user._onMessage({
      origin: 'https://connect.vezgo.com',
      data: JSON.stringify(payload),
    });

    test('ERROR/DUPLICATE_CONNECTION calls onError and marks the widget inactive', () => {
      const data = { type: 'DUPLICATE_CONNECTION', existing_institution_id: 'abc' };
      send({ vezgo: true, event: 'ERROR', data });
      expect(this.onError).toHaveBeenCalledWith(data);
      expect(this.onEvent).not.toHaveBeenCalled();
      expect(this.user._widgetActive).toBe(false);
    });

    test('ERROR/INVALID_CREDENTIALS calls onEvent and keeps the widget open', () => {
      const data = { type: 'INVALID_CREDENTIALS', error: { name: 'LoginFailedError' } };
      send({ vezgo: true, event: 'ERROR', data });
      expect(this.onEvent).toHaveBeenCalledWith('ERROR', data);
      expect(this.onError).not.toHaveBeenCalled();
      expect(this.user._widgetActive).toBe(true);
    });

    test('ERROR/SECURITY_QUESTION_REQUIRED calls onEvent and keeps the widget open', () => {
      const data = { type: 'SECURITY_QUESTION_REQUIRED' };
      send({ vezgo: true, event: 'ERROR', data });
      expect(this.onEvent).toHaveBeenCalledWith('ERROR', data);
      expect(this.onError).not.toHaveBeenCalled();
      expect(this.user._widgetActive).toBe(true);
    });

    test('legacy lowercase error event still calls onError and closes the widget', () => {
      send({ vezgo: true, event: 'error', error: { message: 'boom' } });
      expect(this.onError).toHaveBeenCalledWith({ message: 'boom' });
      expect(this.user._widgetActive).toBe(false);
    });

    test('messages without vezgo flag are ignored', () => {
      send({ event: 'ERROR', data: { type: 'INVALID_CREDENTIALS' } });
      expect(this.onError).not.toHaveBeenCalled();
      expect(this.onEvent).not.toHaveBeenCalled();
    });
  });
});
