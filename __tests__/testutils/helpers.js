const jwt = require('jsonwebtoken');

module.exports.generateToken = function (secondsUntilExp = 1200) {
  return jwt.sign({ exp: Math.round(new Date().getTime() / 1000 + secondsUntilExp) }, 'test');
};

module.exports.countRequests = function (mockObject) {
  return Object.keys(mockObject.history).reduce(
    (prev, method) => prev + mockObject.history[method].length,
    0,
  );
};
