/**
 * Test LLM Configuration
 * Quick test to verify your LLM API is configured correctly
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/llm/test
 * Test LLM configuration
 */
router.get('/test', async (req, res) => {
  try {
    const llmApiKey = process.env.LLM_API_KEY;
    const llmApiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    const llmModel = process.env.LLM_MODEL || 'gpt-4o-mini';

    // Check if API key is configured
    if (!llmApiKey || llmApiKey === 'your_llm_api_key_here') {
      return res.status(500).json({
        success: false,
        configured: false,
        error: 'LLM_API_KEY not configured. Please add your API key to .env file.'
      });
    }

    // Try a simple test call
    const testResponse = await fetch(llmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llmApiKey}`,
      },
      body: JSON.stringify({
        model: llmModel,
        messages: [
          {
            role: 'user',
            content: 'Reply with just "OK" if you receive this message.'
          }
        ],
        max_tokens: 10,
      }),
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.json();
      return res.status(500).json({
        success: false,
        configured: true,
        error: 'LLM API test failed',
        details: errorData.error?.message || 'Unknown error',
        statusCode: testResponse.status
      });
    }

    const data = await testResponse.json();
    
    res.json({
      success: true,
      configured: true,
      message: 'LLM API is working correctly!',
      provider: llmApiUrl.includes('openai') ? 'OpenAI' : 
                llmApiUrl.includes('anthropic') ? 'Anthropic' : 'Custom',
      model: llmModel,
      testResponse: data.choices?.[0]?.message?.content || 'OK'
    });

  } catch (error) {
    console.error('LLM test error:', error);
    res.status(500).json({
      success: false,
      error: 'LLM test failed',
      details: error.message
    });
  }
});

/**
 * GET /api/llm/config
 * Get current LLM configuration (without exposing API key)
 */
router.get('/config', (req, res) => {
  const llmApiKey = process.env.LLM_API_KEY;
  const llmApiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
  const llmModel = process.env.LLM_MODEL || 'gpt-4o-mini';

  const configured = llmApiKey && llmApiKey !== 'your_llm_api_key_here';

  res.json({
    configured,
    provider: llmApiUrl.includes('openai') ? 'OpenAI' : 
              llmApiUrl.includes('anthropic') ? 'Anthropic' : 'Custom',
    model: llmModel,
    apiUrl: llmApiUrl,
    apiKeySet: configured ? 'Yes (hidden)' : 'No'
  });
});

export default router;
