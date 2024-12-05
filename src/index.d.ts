import { ApisauceInstance } from "apisauce";

export = Vezgo;

export declare var Vezgo: {
  init(config: APIConfig): APIInterface;
};

export interface APIInterface {
  constructor(config: APIConfig);
  __init(): APIInterface;
  /** loginName required only for server-side login **/
  login(loginName?: string): APIUserInterface;
  getToken(options?: TokenOptions): Promise<string>;
  fetchToken(): Promise<string>;
  authApi: ApisauceInstance;
  api: ApisauceInstance;
  getTeam(): Promise<Team>;
  getConnectData(options: ConnectDataOptions): Promise<ConnectData>;
  connect(options?: ConnectOptions): APIInterface;
  reconnect(accountId: string, options?: ConnectOptions): APIUserInterface;
  onConnection(callback: Function): APIInterface;
  onError(callback: Function): APIInterface;
  onEvent(callback: Function): APIInterface;
  providers: ProvidersInterface;
  teams: TeamsInterface;
}

export interface ProvidersInterface {
  constructor(api: APIInterface);
  getList(): Promise<Provider[]>;
  getOne(id: string): Promise<Provider>;
}

export interface TeamsInterface {
  constructor(api: APIInterface);
  info(): Promise<{}>;
}

export interface APIUserInterface extends APIInterface {
  userApi: ApisauceInstance;
  accounts: AccountsInterface;
  history: HistoryInterface;
  transactions: TransactionsInterface;
}

export interface AccountsInterface {
  constructor(api: APIUserInterface);
  getList(): Promise<Account[]> | Promise<never>;
  getOne(id: string, params?: {}): Promise<Account> | Promise<never>;
  sync(id): Promise<Account> | Promise<never>;
  remove(id): Promise<void> | Promise<never>;
}

export interface HistoryInterface {
  constructor(api: APIUserInterface);
  getList(options: HistoryListOptions): Promise<HistoryEntry[]> | Promise<never>;
}

export type HistoryListOptions = {
  accountId: string;
  from?: string;
  to?: string;
  wallet?: string;
};

export interface TransactionsInterface {
  constructor(api: APIUserInterface);
  getList(options: TransactionsOptions): Promise<Transaction[]> | Promise<never>;
  getOne(options: TransactionOptions): Promise<Transaction> | Promise<never>;
}

export type TransactionsOptions = {
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
};

export type TransactionOptions = {
  accountId: string;
  txId: string;
};

export type APIConfig = {
  clientId: string;
  /** secret required only for server-side **/
  secret?: string;
  baseURL?: string;
  connectURL?: string;
  redirectURI?: string;
  loginName?: string | null;
  demo?: boolean;
  authEndpoint?: string;
  auth?: {
    headers?: object;
    params?: object;
  };
  hideWalletConnectWallets?: boolean;
};

export type TokenOptions = {
  minimumLifetime: number;
};

export type ProvidersPreferences = {
  [key: string]: {
    disallow?: Array<string>;
    allow?: Array<string>;
    no_manual_input?: boolean;
  };
};

export type ConnectOptions = {
  provider?: string;
  accountId?: string;
  lang?: string;
  providerCategories?: string;
  providers?: Array<string>;
  disabledProviders?: Array<string>;
  theme?: string;
  providersPerLine?: string;
  syncNfts?: boolean;
  features?: string;
  multiWallet?: boolean;
  hideWalletConnectWallets?: boolean;
  connectionType?: string;
  providersPreferences?: ProvidersPreferences;
};

export type ConnectDataOptions = {
  provider?: string;
  accountId: string;
  lang?: string;
  providerCategories?: string;
  providers?: Array<string>;
  disabledProviders: Array<string>;
  theme?: string;
  providersPerLine?: string;
  syncNfts?: boolean;
  features?: string;
  multiWallet?: boolean;
  hideWalletConnectWallets?: boolean;
  providersPreferences?: ProvidersPreferences;

  origin?: string;
  state: string;
  redirectURI?: Array<string>;
};

export type ConnectData = {
  url: string;
  token: string;
};

export type Team = {
  name: string;
  redirect_uris: string[];
  deactivated: boolean;
  features: string[];
  instructions: string[];
  preferences: Preference;
  logo?: string;
  coinbase_client_id?: string;
};

export type Preference = {
  providers: {
    [key: string]: PreferenceSub; // Allow any string as a key
  };
};

export type PreferenceSub = {
  disallow?: string[];
  allow?: string[];
};

/*
 * ---------------------------------------------------------------
 * The below interfaces were generated from our swagger.yml using
 * swagger-typescript-api, with some modifications (specifically
 * removing `export` or replacing it with `declare`)
 * ---------------------------------------------------------------
 */

export interface Account {
  /** The Vezgo account identifier. */
  id?: string;
  /** Resource type for this object (which is `account`). */
  resource_type?: string;
  /** (`wallet` accounts only) The blockchain holding the account. `null` for accounts coming from a cryptocurrency exchange. Not yet implemented, always `null` for now. */
  blockchain?: string | null;
  /**
   * The Vezgo account's creation date (milliseconds since Epoch).
   * @format int64
   */
  created_at?: number;
  /**
   * The Vezgo account's last updated date (milliseconds since Epoch).
   * @format int64
   */
  updated_at?: number;
  /** The last sync status on fetching investments (account balances). */
  status?: Status;
  /** Detailed status of the last sync. May not be initially when adding the institution until the first sync is completed. */
  status_details?: SyncStatusDetails;
  /** Sync error information */
  error?: Error;
  /** Total fiat value of the account (string representation of a number). */
  fiat_value?: string;
  /** The fiat currency in which the account's `fiat_value` is reported. */
  fiat_ticker?: string;
  provider?: Provider;
  wallets?: Wallet[];
  balances?: Balance[];
}

/** The last sync status on fetching investments (account balances). */
export declare enum Status {
  Ok = "ok",
  Error = "error",
  Syncing = "syncing",
  Retry = "retry",
}

/** Detailed status of the last sync. May not be initially when adding the institution until the first sync is completed. */
export interface SyncStatusDetails {
  /** Status on fetching wallets for the last sync. */
  wallets?: "ok" | "error" | "syncing" | "retry";
  /** Status on fetching balances for the last sync. */
  balances?: "ok" | "error" | "syncing" | "retry";
  /** Status on fetching transactions for the last sync. */
  transactions?: "ok" | "error" | "syncing" | "retry";
}

/** Sync error information */
export interface Error {
  /**
   * Name of the sync error.
   *
   * `LoginFailedError`: The institution has returned a login failed error. The credentials provided are either invalid or our session with the institution has expired. No more sync will be attempted until the credentials are updated.
   *
   * `SecurityQuestionError`: A security question was returned from the institution website, waiting for answer. The question is stored in the sync error message, and possible answers (if any) are stored in the sync error options. Send a PUT request to /institutions/:id with the answer in security_answer to complete the institution authorization.
   *
   * `TemporaryFailureError`: A temporary failure has occurred. Our system will automatically retry to sync the institution. You can POST to /institutions/:id/sync to trigger a retry. An institution staying in TemporaryFailureError for an extended period may indicate a problem with the institution and our support team will need to investigate.
   *
   * `UnknownConnectorError/UnhandledConnectorError`: Behave the same as TemporaryFailureError (temporary & institution is set to retry). These errors provide our team with more information to faster pinpoint the root cause of the issue.
   */
  name:
    | "LoginFailedError"
    | "SecurityQuestionError"
    | "TemporaryFailureError"
    | "UnknownConnectorError"
    | "UnhandledConnectorError";
  /** Sync error message. */
  message: string;
}

export interface Provider {
  /** Resource type for this object (which is "provider"). */
  resource_type?: string;
  /** The provider's unique name that is used as identification within the Vezgo system. */
  name?: string;
  /** The provider's human-friendly name, to be used for display purpose. */
  display_name?: string;
  /** Alternate names that can be used in place of the provider's unique name in Connect URL  */
  alternate_names?: string[];
  /** The logo URL for the provider. */
  logo?: string;
  /** The provider's authentication type. */
  auth_type?: "password" | "oauth" | "token" | "wallet";
  /** The scopes of access allowed by the provider.Not fully implemented, scope objects (if available) contain only name for now. */
  available_scopes?: string[];
  /** The list of currencies supported by the provider. Not yet implemented, always null for now. */
  available_currencies?: any[] | null;
  /** The provider's service status. Not yet implemented, always `null` for now. */
  status?: string | null;
  /** Whether the Vezgo support for this provider is still beta. See https://vezgo.com/status for up-to-date development status on all providers. */
  is_beta?: boolean;
  /** Notes regarding the provider's connection process. */
  connect_notice?: string | null;
  /** List of credential information requested by the provider, as an array of the following possible values. */
  credentials?: ("username" | "password" | "token" | "key" | "secret" | "wallet" | "code")[];
  /** Instructions about provider's connection process. */
  instructions?: {
    /** Instructions in english */
    en?: string;
    /** Instructions in french */
    fr?: string;
  };
  /** Contains label information for the credentials required by this provider. */
  misc?: object;
  /** Supported features for this provider. */
  features?: {
    account?: boolean;
    positions?: boolean;
    transactions?: boolean;
    nfts?: boolean;
    streaming?: boolean;
  };
}

export interface Wallet {
  /** Unique identifier for a wallet within an account. */
  id?: string;
  /** Wallet name, for display purpose. Not always available. */
  name?: string | null;
  /** The wallet address, for display purpose. Not always available. */
  address?: string | null;
  /** The total fiat value of the wallet (string representation of a number). */
  fiat_value?: string;
  /** The fiat currency in which `fiat_value` is reported. */
  fiat_ticker?: string;
}

export interface Balance {
  /** Resource type for this object (which is "balance"). */
  resource_type?: string;
  /** Ticker symbol for the asset reported by this balance. */
  ticker?: string;
  /** Address of the token, e.g. ERC20 token on an EVM-based connection. */
  ticker_address?: string;
  /** Ticker symbol for the asset, as reported by the account's provider. For staked assets, includes .staked suffix, e.g. ETH.staked. */
  provider_ticker?: string;
  /** The asset name. */
  name?: string | null;
  /** The asset name, as reported by the account's provider. */
  provider_ticker_name?: string;
  /** The asset type or book-keeping model (e.g. "utxo" NOTE only supports the following types - nft and staked. */
  asset_type?: string | null;
  /** The current balance of the asset (string representation of a number). */
  amount?: string;
  /** The number of decimal places for the asset's lowest denominator (e.g. 8 for Bitcoin). */
  decimals?: number;
  /** Whether the asset's amount is verified. false means amount comes "as-is" from the provider without being processed by Vezgo (could be in a wrong format). NOTE - not yet implemented, always `null` for now. */
  asset_is_verified?: boolean | null;
  /** The fiat value of the asset (string representation of a number). */
  fiat_value?: string;
  /** The fiat currency in which fiat_value is reported. */
  fiat_ticker?: string;
  /** Whether the asset's fiat_value is verified. false means fiat_value comes "as-is" from the provider without being processed by Vezgo (could be in a wrong format). NOTE - not yet implemented, always `null` for now. */
  fiat_asset_is_verified?: boolean | null;
  /** The logo URL for the asset if it's a cryptocurrency, or `null` if it's a fiat currency. */
  logo?: string | null;
  /** @format int64 */
  updated_at?: number;
  /** ID of the wallet in which this balance is reported. */
  wallet?: string;
  /** Miscellaneous information for the balance. Non standardized and could be `null`. For NFTs, has metadata standardized object and origin_metadata, that is not standardized. */
  misc?: object | null;
}

export interface Transaction {
  /** The Vezgo transaction identifier. */
  id?: string;
  /** Resource type for this object (which is "transaction"). */
  resource_type?: string;
  /** The transaction status. Not yet implemented, always `null` for now. */
  status?: string | null;
  /**
   * The transaction type:
   * * `deposit` - (Usually 1-part) transactions where the amount was sent to the account (direction: `received`).
   * * `withdrawal` - (Usually 1-part) transactions where the amount was sent from the account (direction: `sent`).
   * * `trade` - (Usually 2-part) transactions with both `sent` and `received` directions.
   * * `staking` - (Usually 2-part) transactions with staking of a base asset (base asset is sent, staked asset is received).
   * * `unstaking` - (Usually 2-part) transactions with unstaking of a staked asset (staked asset is sent, base asset is received).
   * * `reward` - (Usually 1-part) transactions with earned reward (staking/learning/etc).
   * * `bonus` - (Usually 1-part) transactions with bonus (airdrop/referral bonus/etc).
   * * `other` - Other transactions not matching any of the above types.
   */
  transaction_type?: TransactionType;
  /**
   * The subtype (more detailed type) of the transaction. Could be `null`.
   *
   * Subtypes of `deposit`:
   * * `onchain_deposit` - Deposit of currency from within blockchain
   * * `offchain_deposit` - Deposit of currency from outside the blockchain
   * * `fiat_deposit` - Deposit of FIAT currency
   * * `vault_deposit` - Deposit of currency into a vault
   * * `transfer_in` - Deposit of currency through transfer
   * * `receive_payment` - Receiving a payment
   *
   * Subtypes of `withdrawal`:
   * * `onchain_withdrawal` - Withdrawal of currency from within blockchain
   * * `offchain_withdrawal` - Withdrawal of currency from outside the blockchain
   * * `fiat_withdrawal` - Withdrawal of FIAT currency
   * * `vault_withdrawal` - Withdrawal of currency from a vault
   * * `transfer_out` - Withdrawal of currency through transfer
   * * `liquidation` - Withdrawal of assets due to liquidation
   * * `send_payment` - Sending a payment
   *
   * Subtypes of `trade`:
   * * `buy` - Buying crypto for FIAT currency
   * * `sell` - Selling crypto for FIAT currency
   * * `trade_crypto` - Trading crypto for crypto
   * * `trade_fiat` - Trading FIAT currency for FIAT currency
   *
   * Subtypes of `reward`:
   * * `income_reward` - Receiving income rewards
   * * `interest_income` - Receiving interest
   * * `staking_reward` - Earning rewards from staking
   *
   * Subtypes of `bonus`:
   * * `distribution` - Receiving an airdrop/giveaway/free coin distribution
   * * `cashback` - Receiving cash back
   * * `rebate` - Receiving a rebate
   * * `referral_bonus` - Earning a bonus through referral
   *
   * Subtypes of `other`:
   * * `refund` - Receiving a refund/compensation
   * * `cancel` - Cancelling a transaction
   * * `fees` - Some extra fees
   * * `spam` - Spam-related activity
   * * `fork` - Occurrence of a blockchain fork
   * * `mining` - Earning currency through mining
   */
  transaction_subtype?: TransactionSubtype;
  /** The transaction hash from blockchain. */
  transaction_hash?: string;
  /**
   * The date when fiat_values from the transaction parts were calculated (milliseconds since Epoch).
   * @format int64
   */
  fiat_calculated_at?: number;
  /**
   * The date when the transaction was initiated (milliseconds since Epoch).
   * @format int64
   */
  initiated_at?: number;
  /**
   * The date when the transaction was confirmed (milliseconds since Epoch). Could be `null` if the transaction hasn't been confirmed.
   * @format int64,null
   */
  confirmed_at?: number;
  /** ID of the wallet in which this transaction is reported. */
  wallet?: string;
  /** Miscellaneous information for the transaction. */
  misc?: Misc;
  parts?: TransactionPart[];
  fees?: TransactionFee[];
}

/**
 * The transaction type:
 * * `deposit` - (Usually 1-part) transactions where the amount was sent to the account (direction: `received`).
 * * `withdrawal` - (Usually 1-part) transactions where the amount was sent from the account (direction: `sent`).
 * * `trade` - (Usually 2-part) transactions with both `sent` and `received` directions.
 * * `staking` - (Usually 2-part) transactions with staking of a base asset (base asset is sent, staked asset is received).
 * * `unstaking` - (Usually 2-part) transactions with unstaking of a staked asset (staked asset is sent, base asset is received).
 * * `reward` - (Usually 1-part) transactions with earned reward (staking/learning/etc).
 * * `bonus` - (Usually 1-part) transactions with bonus (airdrop/referral bonus/etc).
 * * `other` - Other transactions not matching any of the above types.
 */
export declare enum TransactionType {
  Deposit = "deposit",
  Withdrawal = "withdrawal",
  Trade = "trade",
  Staking = "staking",
  Unstaking = "unstaking",
  Reward = "reward",
  Bonus = "bonus",
  Other = "other",
}

/**
 * The subtype (more detailed type) of the transaction. Could be `null`.
 *
 * Subtypes of `deposit`:
 * * `onchain_deposit` - Deposit of currency from within blockchain
 * * `offchain_deposit` - Deposit of currency from outside the blockchain
 * * `fiat_deposit` - Deposit of FIAT currency
 * * `vault_deposit` - Deposit of currency into a vault
 * * `transfer_in` - Deposit of currency through transfer
 * * `receive_payment` - Receiving a payment
 *
 * Subtypes of `withdrawal`:
 * * `onchain_withdrawal` - Withdrawal of currency from within blockchain
 * * `offchain_withdrawal` - Withdrawal of currency from outside the blockchain
 * * `fiat_withdrawal` - Withdrawal of FIAT currency
 * * `vault_withdrawal` - Withdrawal of currency from a vault
 * * `transfer_out` - Withdrawal of currency through transfer
 * * `liquidation` - Withdrawal of assets due to liquidation
 * * `send_payment` - Sending a payment
 *
 * Subtypes of `trade`:
 * * `buy` - Buying crypto for FIAT currency
 * * `sell` - Selling crypto for FIAT currency
 * * `trade_crypto` - Trading crypto for crypto
 * * `trade_fiat` - Trading FIAT currency for FIAT currency
 *
 * Subtypes of `reward`:
 * * `income_reward` - Receiving income rewards
 * * `interest_income` - Receiving interest
 * * `staking_reward` - Earning rewards from staking
 *
 * Subtypes of `bonus`:
 * * `distribution` - Receiving an airdrop/giveaway/free coin distribution
 * * `cashback` - Receiving cash back
 * * `rebate` - Receiving a rebate
 * * `referral_bonus` - Earning a bonus through referral
 *
 * Subtypes of `other`:
 * * `refund` - Receiving a refund/compensation
 * * `cancel` - Cancelling a transaction
 * * `fees` - Some extra fees
 * * `spam` - Spam-related activity
 * * `fork` - Occurrence of a blockchain fork
 * * `mining` - Earning currency through mining
 */
export declare enum TransactionSubtype {
  OnchainDeposit = "onchain_deposit",
  OffchainDeposit = "offchain_deposit",
  FiatDeposit = "fiat_deposit",
  VaultDeposit = "vault_deposit",
  TransferIn = "transfer_in",
  ReceivePayment = "receive_payment",
  OnchainWithdrawal = "onchain_withdrawal",
  OffchainWithdrawal = "offchain_withdrawal",
  FiatWithdrawal = "fiat_withdrawal",
  VaultWithdrawal = "vault_withdrawal",
  TransferOut = "transfer_out",
  Liquidation = "liquidation",
  SendPayment = "send_payment",
  Buy = "buy",
  Sell = "sell",
  TradeCrypto = "trade_crypto",
  TradeFiat = "trade_fiat",
  IncomeReward = "income_reward",
  InterestIncome = "interest_income",
  StakingReward = "staking_reward",
  Distribution = "distribution",
  Cashback = "cashback",
  Rebate = "rebate",
  ReferralBonus = "referral_bonus",
  Refund = "refund",
  Cancel = "cancel",
  Fees = "fees",
  Spam = "spam",
  Fork = "fork",
  Mining = "mining",
}

/** Miscellaneous information for the transaction. */
export interface Misc {
  /** Original transaction id if it comes from an exchange, or transaction hash if from a blockchain. */
  origin_id?: string;
  /** Original transaction type as seen in the blockchain/exchange. */
  origin_type?: string;
  /** Whether the transaction is a swap (supported for Ethereum-like connectors). Is added only for swap transactions (i.e. you won't see "isSwap" as false). */
  is_swap?: boolean;
  /** List of attributes that are incomplete and thus should not be trusted. This should be empty in most cases but if it isn't, it might be indicative of an error in our connector and should be reported to the Vezgo team. */
  incomplete?: ("fiat_value" | "amount" | "ticker" | "fees")[];
}

export interface TransactionPart {
  /** The Vezgo transaction part identifier. This field is optional. */
  id?: string;
  /** The financial direction for this transaction part. */
  direction?: "sent" | "received";
  /** Ticker symbol for the asset involved in this transaction part. */
  ticker?: string;
  /** Ticker symbol for the asset, as reported by the account's provider. For staked assets, includes .staked suffix, e.g. ETH.staked. */
  provider_ticker?: string;
  /** Address of the token, e.g. ERC20 token on an EVM-based connection. */
  ticker_address?: string;
  /** The asset amount involved in this transaction part (string representation of a number). */
  amount?: string;
  /** Whether the transaction's amount is verified. false means amount comes "as-is" from the provider without being processed by Vezgo (could be in a wrong format). Not yet implemented, always `null` for now. */
  asset_is_verified?: boolean | null;
  /** The fiat currency in which fiat_value is reported. */
  fiat_ticker?: string;
  /** The fiat value of the transaction part (string representation of a number). */
  fiat_value?: string;
  /** Whether the transaction's fiat_value is verified. false means fiat_value comes "as-is" from the provider without being processed by Vezgo (could be in a wrong format).Not yet implemented, always `null` for now. */
  fiat_asset_is_verified?: boolean | null;
  /** Address of the wallet that receives the asset */
  to_address?: string | null;
  /** Address of the wallet that sends the asset */
  from_address?: string | null;
  /** List of other cryptocurrency accounts (source addresses for received or recipient addresses for sent) involved in this transaction part. */
  other_parties?: string[];
}

export interface TransactionFee {
  /** The Vezgo transaction fee identifier. If this is the same as a transaction part, it means the fee is applied to that part. */
  id?: string;
  /** Resource type for this object (which is `transaction_fee`). */
  resource_type?: string;
  /** The fee type (or source of fee) for the transaction. Not yet implemented, always `null` for now. */
  type?: string | null;
  /** Ticker symbol for the asset charged in this transaction fee. */
  ticker?: string;
  /** Ticker symbol for the asset, as reported by the account's provider. */
  provider_ticker?: string;
  /** The asset amount charged in this transaction fee (string representation of a number). */
  amount?: string;
  /** Whether the fee's amount is verified. false means amount comes "as-is" from the provider without being processed by Vezgo (could be in a wrong format). Not yet implemented, always `null` for now. */
  asset_is_verified?: boolean | null;
  /** The fiat value of the transaction fee (string representation of a number). */
  fiat_value?: string;
  /** The fiat currency in which fiat_value is reported. */
  fiat_ticker?: string;
  /** Whether the fee's fiat_value is verified. false means fiat_value comes "as-is" from the provider without being processed by Vezgo (could be in a wrong format). Not yet implemented, always `null` for now. */
  fiat_asset_is_verified?: boolean | null;
}

export interface HistoryEntry {
  /** The Vezgo history entry identifier. */
  id?: string;
  /**
   * The date when the history entry was recorded (milliseconds since Epoch).
   * @format int64
   */
  date?: number;
  /** ID of the account wallet recorded in this history entry. */
  wallet?: string;
  /** Total fiat value of the account wallet at the recorded date (string representation of a number). */
  fiat_ticker?: string;
  /** The fiat currency in which this history entry's fiat_value is reported. */
  fiat_value?: string;
}
