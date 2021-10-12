const Vezgo = require('../src');

describe('Vezgo User instance (ReactNative)', () => {
  beforeEach(() => {
    mockReactNative();
    this.user = Vezgo.init({ clientId: 'test' }).login();
  });

  test('should not allow .connect() and .reconnect()', () => {
    expect(() => this.user.connect()).toThrow(/Browser/);
    expect(() => this.user.reconnect('test')).toThrow(/Browser/);
  });
});
