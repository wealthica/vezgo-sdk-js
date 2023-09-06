# Wealthica Direct API example

NOTE: this is a work in progress.

## Overview

This app shows an example Vezgo integration, using Wealthica Direct API to connect accounts instead of going through the Vezgo Connect UI.

To get started and to receive your **Client ID** and **Client Secret**, [sign up on the portal](https://portal.vezgo.com/sign-up). If you already have an account, [log in to the portal](https://portal.vezgo.com/sign-in).

## Instructions

```bash
# Clone the repo to your computer, and inside `vezgo-sdk-js/example/wealthica-direct-api`:
npm install

# Create .env file to set your VEZGO_CLIENT_ID, VEZGO_CLIENT_SECRET and other variables
cp .env.example .env

# Start example backend server
npm run server

# In another terminal window, start the frontend app
npm run dev

# Go to http://localhost:5173 in your browser to test the app
```
