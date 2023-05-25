require('dotenv').config();

const express = require('express');
const path = require('path');

// Import published SDK version
const Vezgo = require('vezgo-sdk-js');

// Or import from this local repo. Need to run `yarn build` in vezgo-sdk-js directory first
// const Vezgo = require('../../src/index');

const app = express();
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
  // Replace with your own authentication
  const authorization = req.get('Authorization');
  const userId = authorization.replace('Bearer ', '');

  const user = vezgo.login(userId);
  res.json({ token: await user.getToken() });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Vezgo Example App listening at http://localhost:${port}`);
});
