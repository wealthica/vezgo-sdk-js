module.exports = {
  isCancel: jest.fn().mockReturnValue(false),
  create: jest.fn().mockReturnValue({
    defaults: {},
    request: jest.fn().mockResolvedValue({ ok: true }),
  }),
};
