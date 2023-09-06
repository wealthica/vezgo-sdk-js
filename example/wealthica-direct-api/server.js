require('dotenv').config();

const express = require('express');
const { create } = require('apisauce');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

const vezgoApi = create({ baseURL: process.env.VEZGO_API_URL });
const wealthicaApi = create({ baseURL: process.env.WEALTHICA_API_URL });

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/vezgo/token', async (req, res) => {
  // Replace with your own authentication and retrieve a unique user id from your system
  const userId = req.get('userId');

  const response = await vezgoApi.post(
    '/auth/token',
    {
      clientId: process.env.VEZGO_CLIENT_ID,
      secret: process.env.VEZGO_CLIENT_SECRET,
    },
    { headers: { loginName: userId } },
  );

  if (!response.ok || !response.data.token) {
    console.error(response.originalError);
    res.status(500).end();
    return;
  }

  res.json({ token: response.data.token });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Vezgo Example App listening at http://localhost:${port}`);
});
