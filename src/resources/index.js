import Accounts from './accounts';
import Providers from './providers';
import Teams from './teams';
import Transactions from './transactions';

export default function createResources(api) {
  return {
    accounts: new Accounts(api),
    providers: new Providers(api),
    teams: new Teams(api),
    transactions: new Transactions(api),
  };
}
