import jwt from 'jsonwebtoken';

export const generateToken = function (secondsUntilExp = 1200) {
  return jwt.sign({ exp: Math.round(new Date().getTime() / 1000 + secondsUntilExp) }, 'test');
};

export const countRequests = function (mockObject) {
  return Object.keys(mockObject.history).reduce(
    (prev, method) => prev + mockObject.history[method].length,
    0,
  );
};

export default {
  generateToken,
  countRequests,
};