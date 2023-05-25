# Vezgo Example App

## Overview

This Example App provides you with a very basic example of how to implement Vezgo’s ready-to-use Connect Flow.

The code is intentionally kept as simple and short as possible to allow you to quickly understand the use case and get started on your own project.

To get started and to receive your **Client ID** and **Client Secret**, [sign up on the portal](https://portal.vezgo.com/sign-up). If you already have an account, [log in to the portal](https://portal.vezgo.com/sign-in).

## Instructions

```bash
# Clone the repo to your computer, and inside `vezgo-sdk-js`:

# (Optional) install SDK dependencies and build, if you want to import the local build
yarn install
yarn build

# Install example dependencies
cd example/basic
yarn install

# Create .env file to set your VEZGO_CLIENT_ID and VEZGO_CLIENT_SECRET
cp .env.example .env

# Start example server
yarn start

# Go to http://localhost:3001 in your browser to use the Vezgo Example App
```
