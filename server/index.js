/**
 * Express server for Figma OAuth and API routes
 */
import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const FIGMA_TOKEN_URL = "https://www.figma.com/api/oauth/token";
const PORT = process.env.PORT || 4000;

// Import route handlers
async function setupRoutes() {
  try {
    console.log('🔄 Loading Figma routes...');
    const figmaRoutes = (await import('../src/routes/figma.js')).default;
    
    console.log('🔄 Loading Braze routes...');
    const brazeRoutes = (await import('../src/routes/brazeConnect.js')).default;
    
    console.log('🔄 Loading Braze test routes...');
    const brazeTestRoutes = (await import('../src/routes/brazeAuthTest.js')).default;
    
    // Mount route handlers with error handling
    app.use('/api/figma', (req, res, next) => {
      try {
        figmaRoutes(req, res, next);
      } catch (error) {
        console.error('❌ Figma route error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    });
    
    app.use('/api/local', (req, res, next) => {
      try {
        figmaRoutes(req, res, next);
      } catch (error) {
        console.error('❌ Local route error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    });
    
    app.use('/api/braze', (req, res, next) => {
      try {
        brazeRoutes(req, res, next);
      } catch (error) {
        console.error('❌ Braze route error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    });

    // Also mount braze routes at /braze for frontend compatibility
    app.use('/braze', (req, res, next) => {
      try {
        brazeRoutes(req, res, next);
      } catch (error) {
        console.error('❌ Braze route error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    });

    app.use('/test', (req, res, next) => {
      try {
        brazeTestRoutes(req, res, next);
      } catch (error) {
        console.error('❌ Test route error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    });
    
    console.log('✅ All routes loaded successfully');
  } catch (error) {
    console.error('⚠️ Route loading error:', error.message);
    console.error(error.stack);
  }
}

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

// Setup routes and start server
setupRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Figma OAuth server listening on http://localhost:${PORT}`);
  });
});