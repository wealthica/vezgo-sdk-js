require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

// Import published SDK version
const Vezgo = require('vezgo-sdk-js');

// Or import from this local repo. Need to run `yarn build` in vezgo-sdk-js directory first
// const Vezgo = require('../../src/index');

const app = express();
app.use(cors());
app.use(helmet({
  // Don't enable HSTS in development
  hsts: (app.get('env') === 'development') ? false : {
    // Override Helmet default HSTS max age
    maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
    includeSubDomains: true,
    // TODO: Submit wealthica.com to HSTS preload list
    preload: true,
  },

  // Only allow from 'self' & used sources now. Add more later if we use
  // other sources (CDN, Userkom embed script, ...)
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", 'connect.vezgo.localhost'],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'cdnjs.cloudflare.com',
        'unpkg.com',
        'https://*.pusher.com',
        '*.mxpnl.com',
        'www.google-analytics.com',
        '*.tractionboard.com',
        'www.googletagmanager.com',
        'tagmanager.google.com',
        'connect.facebook.net', // from GTM
        'http://static.ads-twitter.com', // from GTM
        'analytics.twitter.com', // from GTM
        'https://js.recurly.com',
        'https://cdn.yodlee.com',
        'https://cdn.onesignal.com',
        'https://onesignal.com',
        '*.getwisp.co',
        '*.wisepops.com',
        'https://desk.wealthica.com'
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'fonts.googleapis.com',
        'tagmanager.google.com',
        'https://js.recurly.com',
        'https://onesignal.com',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        '*.walletconnect.com',
        'https://*.gravatar.com',
        'www.google-analytics.com',
        'shield.sitelock.com',
        'ssl.gstatic.com',
        'https://wealthica.com',
        'http://www.googletagmanager.com',
        'www.facebook.com', // from GTM
        'http://t.co', // twitter, from GTM
        'https://stats.g.doubleclick.net', // GTM?
        'https://yodlee-1.hs.llnwd.net', // Yodlee institution logo
      ],
      connectSrc: [
        "'self'",
        'blob:',
        'https://wealthica.com',
        'https://*.pusher.com',
        'wss://*.pusher.com',
        'https://*.gravatar.com',
        '*.mixpanel.com',
        'www.google-analytics.com',
        'data:',
        '*.amazonaws.com', // FIXME: Dangerous to allow anything .amazonaws.com
        '*.tractionboard.com',
        'https://www.iubenda.com',
        'https://api.recurly.com',
        'https://onesignal.com',
        'https://desk.wealthica.com',
        '*.walletconnect.org',
        '*.walletconnect.com',
      ],
      fontSrc: ['data:', '*'],
      objectSrc: ["'self'", 'blob:'],
      mediaSrc: [
        "'self'",
      ],
      frameSrc: [
        "'self'",
        'blob:',
        'connect.vezgo.localhost',
      ],
      frameAncestors: ["'none'"],
      formAction: ["'self'", 'connect.vezgo.localhost'],
    },
  },
}));

app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
const port = process.env.PORT || 3001;

const vezgo = Vezgo.init({
  clientId: process.env.VEZGO_CLIENT_ID,
  secret: process.env.VEZGO_CLIENT_SECRET,

  // The following is for Vezgo developers only, remove if you are a Vezgo client
  baseURL: process.env.VEZGO_API_URL,
  connectURL: process.env.VEZGO_CONNECT_URL,
});

// To pass some configurations to the frontend
app.get('/assets/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
var constants = {
  VEZGO_CLIENT_ID: '${process.env.VEZGO_CLIENT_ID}',
  VEZGO_API_URL: '${process.env.VEZGO_API_URL || 'https://api.vezgo.com/v1'}',
  VEZGO_CONNECT_URL: '${process.env.VEZGO_CONNECT_URL || 'https://connect.vezgo.com'}',
};
  `.trim());
});

// Serve the local build of the Vezgo Browser SDK
app.get('/assets/vezgo.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '../../dist/vezgo.js'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/vezgo/auth', async (req, res) => {
  try {
    // Replace with your own authentication
    const authorization = req.get('Authorization');
    const userId = authorization.replace('Bearer ', '');

    const user = vezgo.login(userId);
    res.json({ token: await user.getToken() });
  } catch (err) {
    res.status(500).json({ error: err.message }).end();
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Vezgo Example App listening at http://localhost:${port}`);
});
