import Vezgo from '../src/index';

describe('Vezgo User instance (ReactNative)', () => {
  beforeEach(() => {
    global.mockReactNative();
    this.user = Vezgo.init({ clientId: 'test' }).login();
  });

  test('should not allow .connect() and .reconnect()', () => {
    expect(() => this.user.connect()).toThrow(/Browser/);
    expect(() => this.user.reconnect('test')).toThrow(/Browser/);
  });
});
