# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Vezgo JS SDK - official JavaScript SDK for the Vezgo cryptocurrency API. Supports both browser and Node.js with a single codebase via dual Vite builds.

## Commands

```bash
yarn install          # Install dependencies
yarn build            # Build for both browser and Node (rm -rf dist && build:node && build:browser)
yarn test             # Run tests (vitest run)
yarn watch:test       # Run tests in watch mode
yarn lint             # ESLint check
yarn lint-fix         # Auto-fix lint issues
```

Run a single test file: `yarn test __tests__/resources/accounts.js`

## Architecture

**Entry point**: `src/index.js` exports a singleton `Vezgo` instance with an `init(config)` method.

**Core flow**: `Vezgo.init({clientId, secret})` creates an `API` instance (`src/api.js`) which:
- Sets up HTTP clients via apisauce (one for public data, one for authenticated user calls)
- Manages JWT token lifecycle (auto-refresh when < 10s remaining)
- Instantiates resource classes for each API domain
- Handles the Connect widget (browser iframe) for account linking

**Resource pattern**: Each file in `src/resources/` is a class that receives the API instance and exposes async methods (getList, getOne, etc.). All use the same error pattern: check `response.ok`, throw `response.originalError` on failure.

**Resources**: accounts, transactions, history, orders, providers, teams

**Environment-aware**: `src/utils.js` detects runtime (Node, Browser, React Native, Deno) to conditionally handle auth (JWT vs authEndpoint), Connect widget, and platform APIs.

## Build

Two Vite configs produce three outputs:
- `vite.config.node.mjs` -> `dist/vezgo.es.js` (ESM) + `dist/vezgo.cjs.js` (CJS), Node 18+ target
- `vite.config.browser.mjs` -> `dist/vezgo.umd.js` (UMD), ES2015+ target with Node polyfills

`prepublishOnly` runs `npm run build` automatically before `npm publish`.

## Testing

- **Framework**: Vitest with axios-mock-adapter
- **Setup**: `vitest.setup.js` provides global helpers: `mockNode()`, `mockBrowser()`, `mockReactNative()`
- **Shared patterns**: `__tests__/testutils/common.js` has reusable test helpers (setupResource, shouldValidateResourceId, etc.)
- **Structure**: `__tests__/resources/` for endpoint tests, `__tests__/user.instance.*.js` for environment-specific tests

## Code Style

- ESLint with airbnb-base, single quotes enforced
- Prettier: single quotes, trailing commas (es5), 100 char width
- ES6 classes, async/await throughout

## Release Process

Published to npm as `vezgo-sdk-js` (see `name` in `package.json`). Releases can be cut from either `master` or a feature branch — the steps below assume you're already on the branch that has the change committed.

```bash
# 1. Use Node 22 (engines: node >= 18; Node 22 is what CI/release tooling uses)
nvm use 22

# 2. Bump version — creates a "X.Y.Z" commit and a matching "vX.Y.Z" tag
npm version patch        # or minor / major

# 3. Push the version-bump commit and the tag
git push origin <current-branch>
git push origin --tags

# 4. Confirm you're logged in to npm (the publish account must have access to the `vezgo-sdk-js` package)
npm whoami               # if this errors, run:
npm login                # follow the browser/OTP prompt

# 5. Publish — `prepublishOnly` runs `npm run build` automatically before upload
npm publish

# 6. Verify the version-specific page is live
open https://www.npmjs.com/package/vezgo-sdk-js/v/<version>
```

There is no separate staging environment — every published version is immediately available to all consumers. The standard local-verification path is:

```bash
cd example/basic
rm -rf node_modules
npm install              # installs the just-published version via the `^` range in package.json
npm start                # visit http://localhost:3001 and exercise the change
```

If the release was cut from a feature branch, remember to merge that branch back into `master` once verified so master and npm stay in sync.
