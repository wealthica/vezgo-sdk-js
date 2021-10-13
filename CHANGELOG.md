# Changelog

All notable changes to the Vezgo SDK across versions will be documented in this file.

## [Unreleased]

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

[Unreleased]: https://github.com/wealthica/vezgo-sdk-js/compare/v0.0.12...HEAD
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
