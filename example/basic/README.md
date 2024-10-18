# Vezgo Example App

### Overview

This Example App provides you with a very basic example of how to implement Vezgo’s ready-to-use Connect Flow.

The code is intentionally kept as simple and short as possible to allow you to quickly understand the use case and get started on your own project.

To get started and to receive your **Client ID** and **Client Secret**, [sign up on the portal](https://portal.vezgo.com/sign-up). If you already have an account, [log in to the portal](https://portal.vezgo.com/sign-in).

### Instructions

1. Create an account and get your API keys from https://portal.vezgo.com

2. Clone the repo `vezgo-sdk-js` to your computer
```
    git clone https://github.com/wealthica/vezgo-sdk-js.git
```

3. Go to example directory
```
cd example/basic
```

4. Install dependencies
```
npm install
```
or
```
yarn install
```

5. Copy `.env.example` to `.env`

```
cp .env.example .env
```

6. Set API keys in `.env` (from https://portal.vezgo.com)

```
VEZGO_CLIENT_ID=your_client_id
VEZGO_CLIENT_SECRET=your_client_secret
```

7. Run widget:

```
npm start
```
or
```
yarn install
```

8. Go to http://localhost:3001 in your browser to try the Vezgo Example App
9. Configure example widget setup in `example/basic/main.js` and find `user.connect` function, see the available options in `vezgo-sdk-js/README.md`
10. Configure your `logo`, `redirect URIs` and `webhook` in https://portal.vezgo.com/api-keys where your can set it for each of your API keys

What's next:
1. Integrate Vezgo Widget to your application following the documentation https://vezgo.com/docs/get-started
2. Subscribe to Advanced Plan to get unlimited access to the Vezgo API https://portal.vezgo.com/subscribe?plan=launch_and_scale
3. Contact hello@vezgo.com for any questions or support
