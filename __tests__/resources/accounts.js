const Vezgo = require('../../src');

describe('Vezgo Accounts resource', () => {
  test('should NOT be initiated along with the Vezgo instance', () => {
    const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
    expect(vezgo.accounts).not.toBeDefined();
  });

  test('should be initiated along with the Vezgo User instance', () => {
    const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
    expect(user.accounts).toBeDefined();
    expect(user.accounts).toHaveProperty('getList');
    expect(user.accounts).toHaveProperty('getOne');
    expect(user.accounts).toHaveProperty('remove');
  });

  describe('.getList()', () => {
    test('should call /accounts endpoint', async () => {
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } }) // token call
        .mockResolvedValueOnce({ status: 200, data: [{ test: 'data' }] });
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      const accounts = await user.accounts.getList();
      expect(request).toHaveBeenCalledTimes(2);
      expect(request.mock.calls[1][0].url).toBe('/accounts');
      expect(accounts).toEqual(expect.arrayContaining([{ test: 'data' }]));
    });

    test('should handle API error', async () => {
      const error = new Error('Test Error');
      error.response = { status: 400 };
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } })
        .mockRejectedValueOnce(error);
      mockAxios({ request });

      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.accounts.getList()).rejects.toThrow('Test Error');
    });

    test('should handle token error', async () => {
      const error = new Error('Token Error');
      error.response = { status: 400 };
      const request = jest.fn().mockRejectedValue(error);
      mockAxios({ request });

      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.accounts.getList()).rejects.toThrow('Token Error');
      expect(request).toHaveBeenCalledTimes(1);
    });
  });

  describe('.getOne()', () => {
    test('should validate id', async () => {
      const request = jest.fn().mockResolvedValue();
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.accounts.getOne()).rejects.toThrow('account id');
      await expect(() => user.accounts.getOne(1)).rejects.toThrow('account id');
      expect(request).not.toHaveBeenCalled();
    });

    test('should call /accounts/:id endpoint', async () => {
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } })
        .mockResolvedValueOnce({ status: 200, data: { test: 'data' } });
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      const account = await user.accounts.getOne('test');
      expect(request).toHaveBeenCalledTimes(2);
      expect(request.mock.calls[1][0].url).toBe('/accounts/test');
      expect(account).toEqual({ test: 'data' });
    });

    test('should handle API error', async () => {
      const error = new Error('Test Error');
      error.response = { status: 400 };
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } })
        .mockRejectedValueOnce(error);
      mockAxios({ request });

      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.accounts.getOne('test')).rejects.toThrow('Test Error');
    });

    test('should handle token error', async () => {
      const error = new Error('Token Error');
      error.response = { status: 400 };
      const request = jest.fn().mockRejectedValue(error);
      mockAxios({ request });

      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.accounts.getOne('test')).rejects.toThrow('Token Error');
      expect(request).toHaveBeenCalledTimes(1);
    });
  });

  describe('.remove()', () => {
    test('should validate id', async () => {
      const request = jest.fn().mockResolvedValue();
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.accounts.remove()).rejects.toThrow('account id');
      await expect(() => user.accounts.remove(1)).rejects.toThrow('account id');
      expect(request).not.toHaveBeenCalled();
    });

    test('should call /accounts/:id endpoint', async () => {
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } })
        .mockResolvedValueOnce({ status: 200, data: { test: 'data' } });
      mockAxios({ request });
      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      const account = await user.accounts.remove('test');
      expect(request).toHaveBeenCalledTimes(2);
      expect(request.mock.calls[1][0].url).toBe('/accounts/test');
      expect(request.mock.calls[1][0].method).toBe('delete');
      expect(account).toBeUndefined(); // should not return anything on success
    });

    test('should handle API error', async () => {
      const error = new Error('Test Error');
      error.response = { status: 400 };
      const request = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { token: 'test' } })
        .mockRejectedValueOnce(error);
      mockAxios({ request });

      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.accounts.remove('test')).rejects.toThrow('Test Error');
    });

    test('should handle token error', async () => {
      const error = new Error('Token Error');
      error.response = { status: 400 };
      const request = jest.fn().mockRejectedValue(error);
      mockAxios({ request });

      const user = Vezgo.init({ clientId: 'test', secret: 'test' }).login('test');
      await expect(() => user.accounts.remove('test')).rejects.toThrow('Token Error');
      expect(request).toHaveBeenCalledTimes(1);
    });
  });
});
