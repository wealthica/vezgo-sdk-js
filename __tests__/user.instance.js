const Vezgo = require('../src');

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
});
