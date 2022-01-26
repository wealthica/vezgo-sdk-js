const utils = require('../../src/utils');

jest.mock('../../src/utils', () => {
  const originalModule = jest.requireActual('../../src/utils');

  return {
    ...originalModule,
    isNode: jest.fn(),
    isBrowser: jest.fn(),
    isReactNative: jest.fn(),
  };
});

global.mockNode = () => {
  utils.isNode.mockReturnValue(true);
  utils.isBrowser.mockReturnValue(false);
  utils.isReactNative.mockReturnValue(false);
};

global.mockBrowser = () => {
  utils.isNode.mockReturnValue(false);
  utils.isBrowser.mockReturnValue(true);
  utils.isReactNative.mockReturnValue(false);
  global.window = { location: { origin: 'http://localhost' } };
};

global.mockReactNative = () => {
  utils.isNode.mockReturnValue(false);
  utils.isBrowser.mockReturnValue(false);
  utils.isReactNative.mockReturnValue(true);
};

// Mock NodeJS environment by default
global.beforeEach(() => {
  global.mockNode();
});
