import { vi } from 'vitest';

vi.mock('./src/utils', async (importOriginal) => {
  const originalModule = await importOriginal();

  return {
    ...originalModule,
    isNodeOrSimilar: vi.fn(),
    isBrowser: vi.fn(),
    isReactNative: vi.fn(),
  };
});

const utils = await import('./src/utils');

// Define global mocks
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
beforeEach(() => {
  global.mockNode();
});