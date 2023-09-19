import { ApisauceInstance } from "apisauce";

export = Vezgo

declare var Vezgo: {
  init(config: APIConfig): APIInterface;
};

interface APIInterface {
  constructor(config: APIConfig)
  __init(): APIInterface
  login(loginName: string): APIUserInterface
  getToken(options: TokenOptions): Promise<string>
  fetchToken(): Promise<string>
  authApi: ApisauceInstance
  api: ApisauceInstance
  getTeam(): string;
  getConnectData(options: ConnectDataOptions): Promise<ConnectData>
  connect(options?: APIConfig): APIInterface
  reconnect(accountId: string): APIUserInterface
  onConnection(callback: Function): APIInterface
  onError(callback: Function): APIInterface
  onEvent(callback: Function): APIInterface
  providers: ProvidersInterface
  teams: TeamsInterface
}

interface ProvidersInterface {
  constructor(api: APIInterface)
  getList(): Promise<Provider[]>
  getOne(id: string): Promise<Provider>
}

interface TeamsInterface {
  constructor(api: APIInterface)
  info(): Promise<{}>
}

interface APIUserInterface extends APIInterface {
  userApi: ApisauceInstance
  accounts: AccountsInterface
  history: HistoryInterface
  transactions: TransactionsInterface
}

interface AccountsInterface {
  constructor(api: APIUserInterface)
  getList(): Promise<Account[]> | Promise<never>
  getOne(id: string, params?: {}): Promise<Account> | Promise<never>
  sync(id): Promise<Account> | Promise<never>
  remove(id): Promise<void> | Promise<never>
}

interface HistoryInterface {
  constructor(api: APIUserInterface)
  getList(options: HistoryListOptions): Promise<BalanceHistory[]> | Promise<never>
}

interface TransactionsInterface {
  constructor(api: APIUserInterface)
  getList(options: TransactionsOptions): Promise<Transactions[]> | Promise<never>
  getOne(options: TransactionOptions): Promise<Transactions> | Promise<never>
}

type APIConfig = {
  clientId: string;
  secret: string;
  baseURL?: string;
  connectURL?: string;
  redirectURI?: string;
  loginName?: string | null;
  demo?: boolean,
  authEndpoint?: string
  auth?: {
    headers?: object;
    params?: object;
  }
}

type TokenOptions = {
  minimumLifetime: number;
}

type ConnectDataOptions = {
  provider: string;
  accountId: string;
  state: string;
  origin: string | undefined;
  lang: string;
  redirectURI: string;
  providers: Array<string> | undefined;
}

type ConnectData = {
  url: string;
  token: string;
}

type TransactionsOptions = {
  accountId: string;
  ticker?: string;
  from?: string;
  to?: string;
  last?: string;
  limit?: number;
  wallet?: string;
  sort?: "asc" | "desc";
  types?: string;
  exclude_fields?: string;
}

type TransactionOptions = {
  accountId: string;
  txId: string;
}

type Part = {
  direction: string;
  ticker: string;
  provider_ticker: string;
  amount: string;
  asset_is_verified?: boolean | null;
  fiat_ticker: string;
  fiat_value: string;
  fiat_asset_is_verified?: boolean | null;
  other_parties: any[];
}

type Fee = {
  type?: string | null;
  ticker: string;
  provider_ticker: string;
  amount: string;
  asset_is_verified?: boolean | null;
  fiat_ticker: string;
  fiat_value: string;
  fiat_asset_is_verified?: boolean | null;
  resource_type: string;
}

type Transactions = {
  id: string;
  status?: string | null;
  transaction_type: string;
  parts: Part[];
  fees: Fee[];
  misc: any[];
  fiat_calculated_at: number;
  initiated_at: number;
  confirmed_at: number;
  resource_type: string;
}

type HistoryListOptions = {
  accountId: string;
  from?: string;
  to?: string;
  wallet?: string;
}

type BalanceHistory = {
  id: string;
  date: number;
  wallet: string;
  fiat_ticker: string;
  fiat_value: string;
}

type Provider = {
  name: string;
  display_name: string;
  logo: string;
  auth_type: string;
  available_scopes: any[];
  available_currencies?: any;
  resource_type: string;
  status?: any;
  is_beta: boolean;
  connect_notice: string;
  credentials: string[];
}

type AccountProvider = {
  name: string;
  display_name: string;
  logo: string;
  type: string;
  scopes: any[];
  resource_type: string;
}

type Balance = {
  ticker: string;
  provider_ticker: string;
  name: string;
  asset_is_verified?: any;
  asset_type: string;
  amount: string;
  decimals: number;
  fiat_ticker: string;
  fiat_value: string;
  fiat_asset_is_verified?: any;
  logo: string;
  updated_at: number;
  misc?: any;
  resource_type: string;
}

type Wallet = {
  id: string;
  name?: string | null;
  address?: string | null;
  fiat_ticker: string;
  fiat_value?: number;
}

type Account = {
  id: string;
  provider: AccountProvider;
  balances: Balance[];
  wallets: Wallet[];
  blockchain?: any;
  created_at: number;
  updated_at: number;
  resource_type: string;
}
