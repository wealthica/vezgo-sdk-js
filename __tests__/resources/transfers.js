import c from '../testutils/common';
import h from '../testutils/helpers';

describe('Vezgo Transfers resource', () => {
  c.setupResource.bind(this)({ isUser: true });

  test('should NOT be initiated along with the Vezgo instance', () => {
    expect(this.vezgo.transfers).not.toBeDefined();
  });

  test('should be initiated along with the Vezgo User instance', () => {
    expect(this.user.transfers).toBeDefined();
    expect(this.user.transfers).toHaveProperty('getList');
    expect(this.user.transfers).toHaveProperty('getOne');
  });

  describe('.getList()', () => {
    test('should validate accountId', async () => {
      await expect(() => this.user.transfers.getList()).rejects.toThrow();
      await expect(() => this.user.transfers.getList({})).rejects.toThrow('account id');
      await expect(() => this.user.transfers.getList({ accountId: 1 })).rejects
        .toThrow('account id');
      expect(h.countRequests(this.userApiMock)).toBe(0);
    });

    test('should GET /accounts/:id/transfers', async () => {
      this.userApiMock.onGet().reply(200, [{ id: 'tr_test' }]);
      const transfers = await this.user.transfers.getList({ accountId: 'test' });
      expect(transfers).toEqual(expect.arrayContaining([{ id: 'tr_test' }]));
      expect(this.userApiMock.history.get[0].url).toBe('/accounts/test/transfers');
    });
  });

  describe('.getOne()', () => {
    test('should validate accountId and transferId', async () => {
      await expect(() => this.user.transfers.getOne()).rejects.toThrow();
      await expect(() => this.user.transfers.getOne({})).rejects.toThrow('account id');
      await expect(() => this.user.transfers.getOne({ accountId: 'test' })).rejects
        .toThrow('transfer id');
      expect(h.countRequests(this.userApiMock)).toBe(0);
    });

    test('should GET /accounts/:id/transfers/:transferId', async () => {
      this.userApiMock.onGet().reply(200, { id: 'tr_test', status: 'confirmed' });
      const transfer = await this.user.transfers.getOne({
        accountId: 'test',
        transferId: 'tr_test',
      });
      expect(transfer).toEqual(expect.objectContaining({ id: 'tr_test' }));
      expect(this.userApiMock.history.get[0].url).toBe('/accounts/test/transfers/tr_test');
    });
  });
});
