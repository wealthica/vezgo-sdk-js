# vezgo-node

Official Vezgo SDK for NodeJS

## Getting started

```javascript
import Vezgo from 'vezgo-node';

(async () => {
  // Create a Vezgo SDK instance
  const vezgo = await Vezgo.init({
    clientId: 'YOUR_CLIENT_ID',
    secret: 'YOUR_CLIENT_SECRET',
    // Optional, only if you need to work with user data API, such as `vezgo.accounts.getOne(id)`,
    // or `vezgo.transactions.getList()` etc.
    loginName: 'YOUR_USERNAME_OR_ID',
  });

  // Call the API helper methods
  const account = await vezgo.accounts.getOne('ACCOUNT_ID');

  // Data endpoints do not require passing `loginName` to `Vezgo.init({})`
  const providers = await vezgo.providers.getList();
  const team = await vezgo.getTeam();
})();
```

## APIs

### General APIs

These methods are SDK-specific and do not have a corresponding Vezgo API endpoint.

#### vezgo.login(loginName)

This method logs in a Vezgo SDK instance so you can call user-specific APIs.

```javascript
// Create a Vezgo SDK instance without a loginName
const vezgo = await Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
});

// Login the instance
vezgo.login('YOUR_USERNAME_OR_ID');

// Call user APIs
const account = await vezgo.accounts.getOne('ACCOUNT_ID');
```

#### vezgo.getToken()

This method returns a user token. Requires a logged-in instance.

```javascript

const vezgo = await Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
});

let token = vezgo.getToken(); // returns null because the instance is not logged in

vezgo.login('YOUR_USERNAME_OR_ID');
token = vezgo.getToken(); // returns the user token
```

#### vezgo.getConnectUrl({ provider, redirectURI, state })

This method returns a Vezgo Connect URL for user to connect an account. Requires a logged-in instance.

```javascript

const url = vezgo.getConnectUrl({
  provider: 'coinbase', // optional
  redirectURI: 'YOUR_REDIRECT_URI', // required, must be a registered URI
  state: 'YOUR_APP_STATE', // optional
});
// https://connect.vezgo.com/connect/coinbase?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&state=YOUR_APP_STATE&token=USER_TOKEN
```


### User APIs

These methods return user data and thus require a Vezgo SDK instance initiated with `loginName`.

```javascript
// Create a Vezgo SDK instance
const vezgo = await Vezgo.init({
  clientId: 'YOUR_CLIENT_ID',
  secret: 'YOUR_CLIENT_SECRET',
  loginName: 'YOUR_USERNAME_OR_ID',
});

const account = await vezgo.accounts.getOne('ACCOUNT_ID');

```

#### vezgo.accounts.getList()

This method retrieves the list of accounts for a user.

```javascript
const accounts = await vezgo.accounts.getList();
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

#### vezgo.accounts.getOne(id)

This method retrieves a single account.

```javascript
const account = await vezgo.accounts.getOne('603522490d2b02001233a5d6');
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

#### vezgo.transactions.getList({ accountId, ticker, from, to })

This method retrieves the list of transactions for an account.

Returns data within the last 1 year by default.

```javascript
const transactions = await vezgo.transactions.getList({
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

#### vezgo.transactions.getOne({ accountId, txId })

This method retrieves a single transaction.

```javascript
const transaction = await vezgo.transactions.getOne({
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

These methods provide general Vezgo information and do not require a `loginName`

```javascript
const vezgo = await Vezgo.init({
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
