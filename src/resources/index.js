/* eslint-disable global-require */
const RESOURCES = {
  accounts: require('./accounts'),
  history: require('./history'),
  providers: require('./providers'),
  teams: require('./teams'),
  transactions: require('./transactions'),
};

module.exports = function createResources(api, resources) {
  return resources.reduce((res, resource) => {
    res[resource] = new RESOURCES[resource](api);
    return res;
  }, {});
};
