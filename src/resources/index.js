import accounts from './accounts';
import history from './history';
import providers from './providers';
import teams from './teams';
import transactions from './transactions';
import transfers from './transfers';
import orders from './orders';

const RESOURCES = {
  accounts,
  history,
  providers,
  teams,
  transactions,
  transfers,
  orders,
};

function createResources(api, resources) {
  return resources.reduce((res, resource) => {
    res[resource] = new RESOURCES[resource](api);
    return res;
  }, {});
};

export default createResources;