import Vezgo from '../src/index';
import API from '../src/api';

describe('Vezgo.init()', () => {
  test('should return a Vezgo instance', () => {
    const vezgo = Vezgo.init({
      clientId: 'test',
      secret: 'test',
    });

    expect(vezgo).toBeInstanceOf(API);
    expect(vezgo).toHaveProperty('getTeam');
    // Test API instance has been `init`ed
    expect(vezgo.providers).toHaveProperty('getList');
    expect(vezgo.teams).toHaveProperty('info');
    // Test not being a Vezgo User instance
    expect(vezgo.accounts).toBeUndefined();
    expect(vezgo.transactions).toBeUndefined();
  });

  test('should return a Vezgo User instance when loginName is passed in', () => {
    const vezgo = Vezgo.init({
      clientId: 'test',
      secret: 'test',
      loginName: 'test',
    });

    expect(vezgo.accounts).toHaveProperty('getList');
    expect(vezgo.transactions).toHaveProperty('getList');
  });

  test('should require & validate clientId', () => {
    expect(() => Vezgo.init({ secret: 'test' })).toThrow(/clientId/);
    expect(() => Vezgo.init({ clientId: 1, secret: 'test' })).toThrow(/clientId/);
  });

  test('should require & validate secret in NodeJS', () => {
    mockNode();
    expect(() => Vezgo.init({ clientId: 'test' })).toThrow(/secret/);
    expect(() => Vezgo.init({ clientId: 'test', secret: 1 })).toThrow(/secret/);
  });

  test('should NOT require secret in Browser & ReactNative', () => {
    mockBrowser();
    expect(() => Vezgo.init({ clientId: 'test' })).not.toThrow(/secret/);

    mockReactNative();
    expect(() => Vezgo.init({ clientId: 'test' })).not.toThrow(/secret/);
  });
});
