const express = require('express');
const path = require('path');
const Vezgo = require('../src/index');

const app = express();
const port = 3001;

const VEZGO_CLIENT_ID = 'YOUR_CLIENT_ID';
const VEZGO_CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

const vezgo = Vezgo.init({
  clientId: VEZGO_CLIENT_ID,
  secret: VEZGO_CLIENT_SECRET,
});

app.get('/assets/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`var constants = { VEZGO_CLIENT_ID: '${VEZGO_CLIENT_ID}' };`);
});

app.get('/assets/vezgo.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '../dist/vezgo.js'));
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
