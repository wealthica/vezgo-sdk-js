const utils = require('../../src/utils');

jest.mock('../../src/utils', () => {
  const originalModule = jest.requireActual('../../src/utils');

  return {
    ...originalModule,
    isNodeOrSimilar: jest.fn(),
    isBrowser: jest.fn(),
    isReactNative: jest.fn(),
  };
});

global.mockNode = () => {
  utils.isNodeOrSimilar.mockReturnValue(true);
  utils.isBrowser.mockReturnValue(false);
  utils.isReactNative.mockReturnValue(false);
};

global.mockBrowser = () => {
  utils.isNodeOrSimilar.mockReturnValue(false);
  utils.isBrowser.mockReturnValue(true);
  utils.isReactNative.mockReturnValue(false);
  global.window = { location: { origin: 'http://localhost' } };
};

global.mockReactNative = () => {
  utils.isNodeOrSimilar.mockReturnValue(false);
  utils.isBrowser.mockReturnValue(false);
  utils.isReactNative.mockReturnValue(true);
};

// Mock NodeJS environment by default
global.beforeEach(() => {
  global.mockNode();
});
