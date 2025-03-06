require('dotenv').config();
const express = require('express');
const path = require('path');
// For local development replace vezgo-sdk-js vezgo ../../lib/vezgo
// const Vezgo = require('../../dist/vezgo.cjs');

const Vezgo = require('vezgo-sdk-js');

const app = express();
const port = 3001;

const vezgo = Vezgo.init({
  clientId: process.env.VEZGO_CLIENT_ID,
  secret: process.env.VEZGO_CLIENT_SECRET,
  baseURL: process.env.VEZGO_API_URL || 'https://api.vezgo.com/v1',
});

app.get('/assets/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    var constants = {
      VEZGO_CLIENT_ID: '${process.env.VEZGO_CLIENT_ID}',
      VEZGO_CONNECT_URL: '${process.env.VEZGO_CONNECT_URL || 'https://connect.vezgo.com'}',
      VEZGO_API_URL: '${process.env.VEZGO_API_URL || 'https://api.vezgo.com/v1'}',
      VEZGO_CONNECT_TYPE: '${process.env.VEZGO_CONNECT_TYPE || 'POST'}',
      VEZGO_CLIENT_THEME: '${process.env.VEZGO_CLIENT_THEME || 'light'}',
      VEZGO_CLIENT_PROVIDERS_PER_LINE: ${process.env.VEZGO_CLIENT_PROVIDERS_PER_LINE || 2},
    };
  `);
});

app.get('/assets/vezgo.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  // For local development replace vezgo-sdk-js vezgo ../../lib/vezgo.js
  // res.sendFile(path.join(__dirname, '../../dist/vezgo.umd.js'));

  res.sendFile(path.join(__dirname, '/node_modules/vezgo-sdk-js/dist/vezgo.umd'));
});

app.get('/renderjson.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '/node_modules/renderjson/renderjson.js'));
});

app.get('/main.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '/main.js'));
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
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Vezgo Example App listening at http://localhost:${port}`);
});
