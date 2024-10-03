# Changelog

All notable changes to the Vezgo SDK across versions will be documented in this file.

## [Unreleased]

## [1.0.3]
- Add `disabledProviders` providers array support for `user.connect()`, `user.reconnect()` & `user.getConnectUrl()`.

## [1.1.8]
- Upgrade jsonwebtoken dependency to 9

## [1.1.7]
- Allow copy/write to clipboard for WalletConnect widget in Widget Mode.

## [1.1.6]
- Add support for `hideWalletConnectWallets` to allow hiding WalletConnect wallets list in Vezgo Connect flow.

## [1.1.5]
- Bumped apisauce package to 3.0.1 to get rid of CSRF vulnerability in axios.

## [1.1.4]
- Fix required params in ts interface

## [1.1.3]
- Update basic example to display network in list of connected wallets in multi wallet mode

## [1.1.2]
- Add support for `multiWallet` flag which allows to connect multiple wallets in one take and return list of connected `accounts`

## [1.1.1]
- Added support for fetching orders
- Support `alternate_names` if available in providers list

## [1.1.0]
- Rework TypeScript headers (not likely but could be breaking change depending on how you use TypeScript)

## [1.0.18]
- Update basic example instruction

## [1.0.17]
- Add support for provider_categories parameter in `user.connect()`, `user.reconnect()` and `user.getConnectData()`.

## [1.0.16]
- Add support for exclude_fields parameter in `user.transactions.getList()`.

## [1.0.13]
- Added vezgo-direct-api example app

## [1.0.11]
- Add VEZGO_CLIENT_THEME and VEZGO_CLIENT_PROVIDERS_PER_LINE configs to example app

## [1.0.10]
- Add `dotenv` to example app
- Add support of connectionType: 'GET' for connect and reconnect methods for local development

## [1.0.8]
- Add `features` flag to enable certain experimental features.
- Allow passing query parameters to `vezgo.providers.getList()` call.

## [1.0.7]
- `syncNfts` flag changed to `true` by default, pass `false` if you need to disable it. Besides `sync_nfts` feature should be enabled for your `App Project`.

## [1.0.6]
- Add `syncNfts` flag support for `user.connect()` and `user.getConnectData()`.

## [1.0.5]
- Add Declaration Files enable a bit of TS support (thanks to @zcuric)
- Bugfix: add missing body in accounts.sync() request (issues/37)

## [1.0.4]
- Bugfix: hide visible form
- Bugfix: remove iFrame on close widget instead of hiding

## [1.0.3]
- Add `theme` (light | dark) support for `user.connect()`, `user.reconnect()` & `user.getConnectUrl()`.
- Add `providersPerLine` (1 | 2) support for `user.connect()`, `user.reconnect()` & `user.getConnectUrl()`.

## [1.0.2]
- Add keywords
- Add annotation

## [1.0.1]
- Readme fix

## [1.0.0]
Note: Latest Vezgo Connect requires to be opened via `POST` request with `token` in the form data.

- Add `user.getConnectData()` to get Vezgo Connect URL and authorization token.
- Delete `user.getConnectUrl()`.
- `user.connect()` and `user.reconnect()` updated accordingly.

## [0.0.16]
- Allow passing extra query params to API calls.

## [0.0.15]
- Fix missing lang parameter in `user.connect()`.
- Update default origin for `user.connect()` to the full url origin.

## [0.0.14]

- Add `lang: 'es'` support for `user.connect()`, `user.reconnect()` & `user.getConnectUrl()`.

## [0.0.13]

### Added

- Add `user.history.getList()` to get account balance history.

## [0.0.12]

### Added

- Add `user.accounts.sync()` to trigger an account sync.
- Add `providers` parameter to `user.connect()` & `user.getConnectUrl()` to control the list of providers in Vezgo Connect.

## [0.0.11]

### Fixed

- Fix an issue with `authorizer` function breaking all User API method helpers.

## [0.0.10]

### Added

- Add `wallet` parameter to `user.transactions.getList()` to support querying by wallet.
- Add `last` and `limit` parameters to `user.transactions.getList()` to support pagination.

## [0.0.9]

### Added

- Add `user.reconnect()` for reconnecting a disconnected account.

## [0.0.8]

### Fixed

- Fix broken NodeJS build caused by build setup.

## [0.0.7]

### Added

- Add `user.accounts.remove(id)` method.

## [0.0.6]

### Changed

- Make `origin` parameter optional in NodeJS for `user.getConnectUrl()`.

## [0.0.5]

### Added

- Add `user.connect()` method for connecting an account via the drop-in Vezgo Connect Widget.

## [0.0.4]

### Added

- Add partial support for ReactNative.
- Add `minimumLifetime` parameter to `user.getToken()` method.

### Changed

- Change all methods that rely on token to automatically renew token.
- Change `vezgo.login()` and `Vezgo.init()` to be synchronous.

### Fixed

- Fix token renew.

## [0.0.3]

### Added

- Add browser auth parameters (`authEndpoint`, `auth { params, headers }`, `authorizer`) to `Vezgo.init()`

[Unreleased]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.18...HEAD
[1.0.16]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.17...v1.0.18
[1.0.16]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.16...v1.0.17
[1.0.16]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.15...v1.0.16
[1.0.15]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.14...v1.0.15
[1.0.14]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.13...v1.0.14
[1.0.13]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.12...v1.0.13
[1.0.12]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.11...v1.0.12
[1.0.11]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.10...v1.0.11
[1.0.10]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.9...v1.0.10
[1.0.9]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/wealthica/vezgo-sdk-js/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.16...v1.0.0
[0.0.16]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.15...v0.0.16
[0.0.15]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.14...v0.0.15
[0.0.14]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.13...v0.0.14
[0.0.13]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.12...v0.0.13
[0.0.12]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.11...v0.0.12
[0.0.11]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/wealthica/vezgo-sdk-js/releases/tag/v0.0.2
