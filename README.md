# vezgo-node

Official Vezgo SDK for NodeJS

## Getting started

```javascript
import Vezgo from 'vezgo-node';

(async () => {
  // Create a Vezgo SDK instance
  const vezgo = Vezgo.init({
    clientId: 'YOUR_CLIENT_ID',
    secret: 'YOUR_CLIENT_SECRET',
  });

  // Call the API helper methods
  const providers = await vezgo.providers.getList();
  const team = await vezgo.getTeam();

  // Alternately, pass a loginName to return a Vezgo SDK User instance in order to call
  // user-specific endpoints
  // NOTE the method is asynchronous now
  const user = await Vezgo.init({
    clientId: 'YOUR_CLIENT_ID',
    secret: 'YOUR_CLIENT_SECRET',
    // Optional, only if you need to work with user data API, such as `vezgo.accounts.getOne(id)`,
    // or `vezgo.transactions.getList()` etc.
    loginName: 'YOUR_USERNAME_OR_ID',
  });

  // Call the user-specific API methods
  const account = await user.accounts.getOne('ACCOUNT_ID');
})();
```

## APIs

### General APIs

These methods are SDK-specific and do not have a corresponding Vezgo API endpoint.

#### vezgo.login(loginName)

This method logs a user in and returns a Vezgo SDK User instance so you can call user-specific APIs.

```javascript
// Create a Vezgo SDK instance
const vezgo = Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
});

// Log user(s) in
const user1 = await vezgo.login('USER_ID_1');
const user2 = await vezgo.login('USER_ID_2');

// Call user APIs
const user1Account = await user1.accounts.getOne('ACCOUNT_ID_1');
const user2Account = await user2.accounts.getOne('ACCOUNT_ID_2');
```

#### user.fetchToken()

This method fetches and returns a new user token.

**NOTE**

- User token has a maximum lifetime duration. Current default is 20 minutes.
- All User API methods automatically fetch a new token if the old one expires so this is rarely needed.

```javascript
const token = await user.fetchToken();
```

#### user.getToken()

This method returns an existing user token.

```javascript
const vezgo = Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
});

const user = await vezgo.login('YOUR_USERNAME_OR_ID');
const token = user.getToken(); // returns the user token
```

#### user.getConnectUrl({ provider, redirectURI, state, lang })

This method returns a Vezgo Connect URL for user to connect an account.

**NOTE** The Connect URL is assigned the existing token, and thus only valid within that token's lifetime. If you need to have a fresh token for a maximum valid duration, call `user.fetchToken()` to fetch a new token right before calling this.

```javascript
const url = user.getConnectUrl({
  provider: 'coinbase', // optional
  // required, optional if already passed to `Vezgo.init()` (see below). Must be a registered URI
  redirectURI: 'YOUR_REDIRECT_URI',
  state: 'YOUR_APP_STATE', // optional
  lang: 'en', // optional (en | fr), 'en' by default
});
// https://connect.vezgo.com/connect/coinbase?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&state=YOUR_APP_STATE&token=USER_TOKEN&lang=en

// Alternatively, pass redirectURI once to `Vezgo.init()`
const vezgo = Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
  redirectURI: 'YOUR_REDIRECT_URI',
});

const user1 = await vezgo.login('USER_ID_1');
const url1 = user1.getConnectUrl();

const user2 = await vezgo.login('USER_ID_2');
const url2 = user2.getConnectUrl();

// If much time has passed since the last .login() or .fetchToken() calls, fetch a fresh token first
await user1.fetchToken();
const url1 = user1.getConnectUrl(); // This url will have maximum lifetime of 20 minutes.
```

### User APIs

These methods return user data and thus require a Vezgo SDK User instance. They automatically fetch a new token if necessary so you would not be bothered with tokens logic.

```javascript
// Create a Vezgo SDK User instance
const vezgo = Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
});
const user = await vezgo.login('YOUR_USERNAME_OR_ID');

// Alternatively, pass loginName directly to Vezgo.init
const user = await Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
  loginName: 'YOUR_USERNAME_OR_ID',
});

// Then call the API methods
const account = await user.accounts.getOne('ACCOUNT_ID');
```

#### user.accounts.getList()

This method retrieves the list of accounts for a user.

```javascript
const accounts = await user.accounts.getList();
```

```json
[
  {
    "id": "603522490d2b02001233a5d6",
    "provider": {
      "name": "coinbase",
      "display_name": "Coinbase",
      "logo": "https://app.wealthica.com/images/institutions/coinbase.png",
      "type": "oauth",
      "scopes": [],
      "resource_type": "provider"
    },
    "balances": [
      {
        "ticker": "BTC",
        "provider_ticker": "BTC",
        "name": "Bitcoin",
        "asset_is_verified": null,
        "asset_type": "",
        "amount": "0.20210831",
        "decimals": 8,
        "fiat_ticker": "USD",
        "fiat_value": "2021.08",
        "fiat_asset_is_verified": null,
        "logo": "https://data.wealthica.com/api/securities/CRYPTO:BTC/logo",
        "updated_at": 1630412605283,
        "misc": null,
        "resource_type": "balance"
      }
    ],
    "blockchain": null,
    "created_at": 1630412605283,
    "updated_at": 1630412605283,
    "resource_type": "account",
  },
  {
    "id": "603522490d2b02001233a5d7",
    "provider": {
      "name": "bitcoin",
      "display_name": "Bitcoin Address",
      "logo": "https://app.wealthica.com/images/institutions/bitcoin.png",
      "type": "wallet",
      "scopes": [],
      "resource_type": "provider"
    },
    "balances": [],
    "blockchain": null,
    "created_at": 1630412605283,
    "updated_at": 1630412605283,
    "resource_type": "account",
  }
]
```

#### user.accounts.getOne(id)

This method retrieves a single account.

```javascript
const account = await user.accounts.getOne('603522490d2b02001233a5d6');
```

```json
{
  "id": "603522490d2b02001233a5d6",
  "provider": {
    "name": "coinbase",
    "display_name": "Coinbase",
    "logo": "https://app.wealthica.com/images/institutions/coinbase.png",
    "type": "oauth",
    "scopes": [],
    "resource_type": "provider"
  },
  "balances": [
    {
      "ticker": "BTC",
      "provider_ticker": "BTC",
      "name": "Bitcoin",
      "asset_is_verified": null,
      "asset_type": "",
      "amount": "0.20210831",
      "decimals": 8,
      "fiat_ticker": "USD",
      "fiat_value": "2021.08",
      "fiat_asset_is_verified": null,
      "logo": "https://data.wealthica.com/api/securities/CRYPTO:BTC/logo",
      "updated_at": 1630412605283,
      "misc": null,
      "resource_type": "balance"
    }
  ],
  "blockchain": null,
  "created_at": 1630412605283,
  "updated_at": 1630412605283,
  "resource_type": "account",
}
```

#### user.transactions.getList({ accountId, ticker, from, to })

This method retrieves the list of transactions for an account.

Returns data within the last 1 year by default.

```javascript
const transactions = await user.transactions.getList({
  accountId: '603522490d2b02001233a5d6',
  ticker: 'BTC', // optional
  from: '2020-08-31', // optional
  to: '2021-08-31', // optional
});
```

```json
[
  {
    "id": "603522490d2b02001233a5d6",
    "status": null,
    "transaction_type": "deposit",
    "parts": [
      {
        "direction": "received",
        "ticker": "BTC",
        "provider_ticker": "BTC",
        "amount": "1.20210831",
        "asset_is_verified": null,
        "fiat_ticker": "USD",
        "fiat_value": "1234567.8",
        "fiat_asset_is_verified": null,
        "other_parties": []
      }
    ],
    "fees": [
      {
        "type": null,
        "ticker": "USD",
        "provider_ticker": "USD",
        "amount": "0.5",
        "asset_is_verified": null,
        "fiat_ticker": "",
        "fiat_value": "",
        "fiat_asset_is_verified": null,
        "resource_type": "transaction_fee"
      }
    ],
    "misc": [],
    "fiat_calculated_at": 1630412605283,
    "initiated_at": 1630412605283,
    "confirmed_at": 1630412605283,
    "resource_type": "transaction"
  },
  {
    "id": "603522490d2b02001233a5d7",
    "status": null,
    "transaction_type": "deposit",
    "parts": [],
    "fees": [],
    "misc": [],
    "fiat_calculated_at": 1630412605283,
    "initiated_at": 1630412605283,
    "confirmed_at": 1630412605283,
    "resource_type": "transaction"
  }
]
```

#### user.transactions.getOne({ accountId, txId })

This method retrieves a single transaction.

```javascript
const transaction = await user.transactions.getOne({
  accountId: '603522490d2b02001233a5d6',
  txId: '603522490d2b02001233a5d6'
});
```

```json
{
  "id": "603522490d2b02001233a5d6",
  "status": null,
  "transaction_type": "deposit",
  "parts": [
    {
      "direction": "received",
      "ticker": "BTC",
      "provider_ticker": "BTC",
      "amount": "1.20210831",
      "asset_is_verified": null,
      "fiat_ticker": "USD",
      "fiat_value": "1234567.8",
      "fiat_asset_is_verified": null,
      "other_parties": []
    }
  ],
  "fees": [
    {
      "type": null,
      "ticker": "USD",
      "provider_ticker": "USD",
      "amount": "0.5",
      "asset_is_verified": null,
      "fiat_ticker": "",
      "fiat_value": "",
      "fiat_asset_is_verified": null,
      "resource_type": "transaction_fee"
    }
  ],
  "misc": [],
  "fiat_calculated_at": 1630412605283,
  "initiated_at": 1630412605283,
  "confirmed_at": 1630412605283,
  "resource_type": "transaction"
}
```

### Data APIs

These methods provide general Vezgo information and do not require logging in a user.

```javascript
const vezgo = Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
});

const providers = await vezgo.providers.getList();
```

#### vezgo.providers.getList()

This method retrieves the list of Vezgo supported providers.

```javascript
const providers = await vezgo.providers.getList();
```

```json
[
  {
    "name": "coinbase",
    "display_name": "Coinbase",
    "logo": "https://app.wealthica.com/images/institutions/coinbase.png",
    "auth_type": "oauth",
    "available_scopes": [],
    "available_currencies": null,
    "resource_type": "provider",
    "status": null,
    "is_beta": true,
    "connect_notice": "",
    "credentials": ["code"]
  },
  {
    "name": "bitcoin",
    "display_name": "Bitcoin Address",
    "logo": "https://app.wealthica.com/images/institutions/bitcoin.png",
    "auth_type": "wallet",
    "available_scopes": [],
    "available_currencies": null,
    "resource_type": "provider",
    "status": null,
    "is_beta": true,
    "connect_notice": "",
    "credentials": ["wallet"]
  }
]
```

#### vezgo.providers.getOne(id)

This method retrieves a single provider.

```javascript
const provider = await vezgo.providers.getOne('coinbase');
```

```json
{
    "name": "coinbase",
    "display_name": "Coinbase",
    "logo": "https://app.wealthica.com/images/institutions/coinbase.png",
    "auth_type": "oauth",
    "available_scopes": [],
    "available_currencies": null,
    "resource_type": "provider",
    "status": null,
    "is_beta": true,
    "connect_notice": "",
    "credentials": ["code"]
  }
```

## Development

### Install

```
yarn install
```

### Build

```
yarn build
```

### Test

```
yarn build
yarn test
```

### Release
```
npm version patch # or minor/major
git push --tags
# wait until merged then
npm publish
```
