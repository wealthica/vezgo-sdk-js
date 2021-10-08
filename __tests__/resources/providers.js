const Vezgo = require('../../src');

describe('Vezgo Providers resource', () => {
  test('should be initiated along with the Vezgo instance', () => {
    const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
    expect(vezgo.providers).toBeDefined();
    expect(vezgo.providers).toHaveProperty('getList');
    expect(vezgo.providers).toHaveProperty('getOne');
  });

  describe('.getList()', () => {
    test('should call /providers endpoint', async () => {
      const request = jest.fn().mockResolvedValue({ status: 200, data: [{ test: 'data' }] });
      mockAxios({ request });
      const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
      const providers = await vezgo.providers.getList();
      expect(request).toHaveBeenCalledTimes(1); // called once because token request is not needed
      expect(request.mock.calls[0][0].url).toBe('/providers');
      expect(providers).toEqual(expect.arrayContaining([{ test: 'data' }]));
    });

    test('should handle API error', async () => {
      const error = new Error('Test Error');
      error.response = { status: 400 };
      const request = jest.fn().mockRejectedValue(error);
      mockAxios({ request });
      const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
      await expect(() => vezgo.providers.getList()).rejects.toThrow('Test Error'); // original error
    });
  });

  describe('.getOne(id)', () => {
    test('should validate id', async () => {
      const request = jest.fn().mockResolvedValue({ status: 200, data: [{ test: 'data' }] });
      mockAxios({ request });
      const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
      await expect(() => vezgo.providers.getOne()).rejects.toThrow('provider id');
      await expect(() => vezgo.providers.getOne(1)).rejects.toThrow('provider id');
      expect(request).not.toHaveBeenCalled();
    });

    test('should call /providers/:id endpoint', async () => {
      const request = jest.fn().mockResolvedValue({ status: 200, data: { test: 'data' } });
      mockAxios({ request });
      const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
      const provider = await vezgo.providers.getOne('test');
      expect(request).toHaveBeenCalledTimes(1); // called once because token request is not needed
      expect(request.mock.calls[0][0].url).toBe('/providers/test');
      expect(provider).toEqual({ test: 'data' });
    });

    test('should handle API error', async () => {
      const error = new Error('Test Error');
      error.response = { status: 400 };
      const request = jest.fn().mockRejectedValue(error);
      mockAxios({ request });
      const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
      await expect(() => vezgo.providers.getOne('test')).rejects.toThrow('Test Error');
    });
  });
});
