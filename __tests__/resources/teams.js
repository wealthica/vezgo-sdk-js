const Vezgo = require('../../src');

describe('Vezgo Teams resource', () => {
  test('should be initiated along with the Vezgo instance', () => {
    const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
    expect(vezgo.teams).toBeDefined();
    expect(vezgo.teams).toHaveProperty('info');
  });

  describe('.info()', () => {
    test('should call /teams endpoint', async () => {
      const request = jest.fn().mockResolvedValue({ status: 200, data: { test: 'data' } });
      mockAxios({ request });
      const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
      const team = await vezgo.teams.info();
      expect(request).toHaveBeenCalledTimes(1); // called once because token request is not needed
      expect(request.mock.calls[0][0].url).toBe('/teams/info?client_id=test');
      expect(team).toEqual({ test: 'data' });
    });

    test('should handle API error', async () => {
      const error = new Error('Test Error');
      error.response = { status: 400 };
      const request = jest.fn().mockRejectedValue(error);
      mockAxios({ request });
      const vezgo = Vezgo.init({ clientId: 'test', secret: 'test' });
      await expect(() => vezgo.teams.info()).rejects.toThrow('Test Error'); // original error
    });
  });
});
