/**
 * Minimal exchange server for Figma OAuth.
 * POST /api/figma/token { code, redirect_uri }
 */
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const FIGMA_TOKEN_URL = "https://www.figma.com/api/oauth/token";
const PORT = process.env.PORT || 4000;

app.post('/api/figma/token', async (req, res) => {
  const { code, redirect_uri } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'missing code' });
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.FIGMA_CLIENT_ID,
      client_secret: process.env.FIGMA_CLIENT_SECRET,
      redirect_uri: redirect_uri || process.env.FRONTEND_URL + '/figma-callback',
      grant_type: 'authorization_code',
      code,
    });

    const response = await axios.post(FIGMA_TOKEN_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return res.json(response.data);
  } catch (err) {
    console.error('Token exchange error:', err.response ? err.response.data : err.message);
    const status = err.response ? err.response.status : 500;
    const data = err.response ? err.response.data : { error: err.message };
    return res.status(status).json(data);
  }
});

app.get('/', (req, res) => res.send('Figma OAuth server is running'));

app.listen(PORT, () => {
  console.log(`Figma OAuth server listening on http://localhost:${PORT}`);
});