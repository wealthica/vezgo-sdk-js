# vezgo-sdk-js

[![Build Status](https://semaphoreci.com/api/v1/wealthica/vezgo-sdk-js/branches/master/badge.svg)](https://semaphoreci.com/wealthica/vezgo-sdk-js)

Official Vezgo JS SDK for the Browser & NodeJS

## Getting started

```javascript
import Vezgo from 'vezgo-sdk-js';

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
  const user = Vezgo.init({
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

##### From server

`loginName` is required

```javascript
// Create a Vezgo SDK instance
const vezgo = Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
});

// Log user(s) in
const user1 = vezgo.login('USER_ID_1');
const user2 = vezgo.login('USER_ID_2');

// Call user APIs
const user1Account = await user1.accounts.getOne('ACCOUNT_ID_1');
const user2Account = await user2.accounts.getOne('ACCOUNT_ID_2');
```

##### From client (browser/ReactNative)

`loginName` is optional. Authentication is done either via an `authEndpoint` or a custom `authorizer` callback passed to `Vezgo.init()`

```javascript
// Create a Vezgo SDK instance
const vezgo = Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  // POST to `authEndpoint` on your server, expecting a JSON { token: 'USER_TOKEN' }
  authEndpoint: '/vezgo/auth', // default value
  // Optional parameters for `authEndpoint` to authenticate your user
  auth: {
    params: {}, // custom `authEndpoint` body
    headers: { Authorization: `Bearer ${yourAppsUserToken}` }, // custom `authEndpoint` headers
  },
  // Optional authorization method to use instead of `authEndpoint`
  authorizer: async (callback) => {
    try {
      const token = await getUserTokenFromYourServer();
      callback(null, { token });
    } catch (error) {
      callback(error);
    }
  }
});

// Log in to create a Vezgo User instance
const user = vezgo.login();

// Call user APIs
const account = await user.accounts.getOne('ACCOUNT_ID_1');
```

Example server implementation for `authEndpoint`:

```
const vezgo = Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
});

router.post('/vezgo/auth', async function(req, res) {
  const user = vezgo.login(req.user.id);

  res.json({ token: await user.getToken() });
});
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

This method returns an existing user token or fetch a new one if the existing token has less than a specified amount of duration (default 10 seconds).

```javascript
const vezgo = Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
});

const user = vezgo.login('YOUR_USERNAME_OR_ID');
let token = await user.getToken(); // returns the user token, 20 minutes lifetime
// After 10 minutes
token = await user.getToken(); // returns the same token
// After 19 minutes 51 seconds
token = await user.getToken(); // fetches and returns a new token

// After > another 10 minutes
token = await user.getToken({ minimumLifeTime: 600 }); // fetches and returns another new token
```

#### user.getConnectUrl({ provider, redirectURI, state, lang })

This method returns a Vezgo Connect URL for user to connect an account.

The URL has a 10 minute session timeout.

```javascript
const url = await user.getConnectUrl({
  provider: 'coinbase', // optional
  // required for server-side, optional for client (browser, ReactNative) or if already passed to `Vezgo.init()`.
  // Must be a registered URI.
  redirectURI: 'YOUR_REDIRECT_URI',
  // required for Vezgo Connect drop-in widget, but already handled by calling `user.connect()`
  origin: 'YOUR_SITE_ORIGIN', // or com.your-bundle-id for ReactNative
  state: 'YOUR_APP_STATE', // optional
  lang: 'en', // optional (en | fr), 'en' by default
});
// https://connect.vezgo.com/connect/coinbase?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&origin=YOUR_SITE_ORIGIN&state=YOUR_APP_STATE&token=USER_TOKEN&lang=en

// Alternatively, pass redirectURI once to `Vezgo.init()`
const vezgo = Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
  redirectURI: 'YOUR_REDIRECT_URI',
  origin: 'YOUR_SITE_ORIGIN',
});

const user1 = vezgo.login('USER_ID_1');
const url1 = await user1.getConnectUrl();

const user2 = vezgo.login('USER_ID_2');
const url2 = await user2.getConnectUrl();
```

#### user.connect({ provider })

This method starts the Vezgo Connect process inside your webpage/app for user to connect their account.

Connection response are provided via callbacks.

```javascript
user.connect({
  provider: 'coinbase', // optional
}).onConnection(account => {
  // Send the account to your server
  sendToServer('/some-route', account);
}).onError(error => {
  console.error('account connection error:', error)
}).onEvent((name, data) => {
  console.log('account connection event:', name, data);
});
```

#### user.reconnect(accountId)

This method starts the Vezgo Connect process to re-connect an existing account that has expired/revoked credentials.

Connection response are provided via callbacks.

```javascript
user.reconnect('ACCOUNT_ID').onConnection(account => {
  // Send the account to your server
  sendToServer('/some-route', account);
}).onError(error => {
  console.error('account connection error:', error)
}).onEvent((name, data) => {
  console.log('account connection event:', name, data);
});
```

### User APIs

These methods return user data and thus require a Vezgo SDK User instance. They automatically fetch a new token if necessary so you would not be bothered with tokens logic.

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

#### user.accounts.sync(id)

This method triggers an account sync.

```javascript
const account = await user.accounts.sync('603522490d2b02001233a5d6');
```

#### user.accounts.remove(id)

This method removes a single account from the user.

```javascript
await user.accounts.remove('603522490d2b02001233a5d6');
```

#### user.transactions.getList({ accountId, ticker, from, to, wallet, last, limit })

This method retrieves the list of transactions for an account.

Returns data within the last 1 year by default.

```javascript
const transactions = await user.transactions.getList({
  accountId: '603522490d2b02001233a5d6',
  ticker: 'BTC', // optional
  from: '2020-08-31', // optional
  to: '2021-08-31', // optional
  wallet: 'bitcoin:cash:usd', // optional
  last: '603522490d2b02001233a5d6', // optional, blank string is allowed
  limit: 10, // optional
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
git push && git push --tags
# wait until merged then
npm publish
```
