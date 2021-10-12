// eslint-disable-next-line import/no-extraneous-dependencies
const { create } = require('axios');
const utils = require('../src/utils');

jest.mock('../src/utils');
jest.mock('axios');

global.mockNode = () => {
  utils.isNode.mockReturnValue(true);
  utils.isBrowser.mockReturnValue(false);
  utils.isReactNative.mockReturnValue(false);
};

global.mockBrowser = () => {
  utils.isNode.mockReturnValue(false);
  utils.isBrowser.mockReturnValue(true);
  utils.isReactNative.mockReturnValue(false);
};

global.mockReactNative = () => {
  utils.isNode.mockReturnValue(false);
  utils.isBrowser.mockReturnValue(false);
  utils.isReactNative.mockReturnValue(true);
};

global.mockAxios = (options = {}) => {
  create.mockReturnValue({
    defaults: {},
    request: jest.fn().mockResolvedValue({ status: 200 }),
    ...options,
  });
};

// Mock NodeJS environment by default
global.beforeEach(() => {
  global.mockNode();
});
