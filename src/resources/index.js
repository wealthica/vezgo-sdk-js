const Accounts = require('./accounts');
const Providers = require('./providers');
const Teams = require('./teams');
const Transactions = require('./transactions');

module.exports = function createResources(api) {
  return {
    accounts: new Accounts(api),
    providers: new Providers(api),
    teams: new Teams(api),
    transactions: new Transactions(api),
  };
};
