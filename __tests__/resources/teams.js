import c from '../testutils/common';

describe('Vezgo Teams resource', () => {
  c.setupResource.bind(this)();

  test('should be initiated along with the Vezgo instance', () => {
    expect(this.vezgo.teams).toBeDefined();
    expect(this.vezgo.teams).toHaveProperty('info');
  });

  describe('.info()', () => {
    test('should GET /teams/info', async () => {
      this.apiMock.onGet().reply(200, { test: 'data' });
      const team = await this.vezgo.teams.info();
      expect(team).toEqual({ test: 'data' });
      expect(this.apiMock.history.get[0].url).toBe('/teams/info?client_id=test');
    });

    c.shouldHandleResourceEndpointError.bind(this)({
      mockCall: () => this.apiMock.onGet('/teams/info?client_id=test'),
      methodCall: () => this.vezgo.teams.info(),
    });
  });
});
