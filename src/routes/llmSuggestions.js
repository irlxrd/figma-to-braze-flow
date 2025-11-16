/**
 * LLM API Routes for Liquid Tag Suggestions
 */
import express from 'express';

const router = express.Router();

/**
 * POST /api/llm/suggest-liquid-tags
 * Analyze HTML and suggest appropriate liquid tags
 */
router.post('/suggest-liquid-tags', async (req, res) => {
  try {
    const { html, existingTags = [] } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Get LLM API key from environment
    const llmApiKey = process.env.LLM_API_KEY;
    const llmApiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    const llmModel = process.env.LLM_MODEL || 'gpt-4o-mini';

    if (!llmApiKey) {
      return res.status(500).json({ 
        error: 'LLM API key not configured. Please set LLM_API_KEY in environment variables.' 
      });
    }

    // Create the prompt for LLM
    const existingTagsList = existingTags.map(tag => tag.placeholder).join(', ');
    const prompt = `Analyze the following HTML content from a Figma design converted to email HTML.
Suggest appropriate Braze liquid tags that should be added for personalization.

HTML Content:
${html.substring(0, 3000)}${html.length > 3000 ? '... (truncated)' : ''}

Existing liquid tags already added: ${existingTagsList || 'none'}

Please suggest liquid tags for:
1. User personalization (names, emails, etc.)
2. Dynamic content based on user attributes
3. Campaign/Canvas information if relevant
4. Any other personalization opportunities you identify

For each suggestion, provide:
- placeholder: the liquid tag variable name (without {{ }})
- description: what this tag represents
- fallback: a good default value
- location: where in the HTML this should be used (be specific with element type or content)
- reason: why this tag would be useful

Return ONLY a JSON array of suggestions in this exact format:
[
  {
    "placeholder": "first_name",
    "description": "User's first name",
    "fallback": "there",
    "location": "greeting text or headline",
    "reason": "Personalizes the greeting"
  }
]

Limit to 5-8 most relevant suggestions. Do not suggest tags that are already in the existing tags list.`;

    // Call LLM API
    const llmResponse = await fetch(llmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llmApiKey}`,
      },
      body: JSON.stringify({
        model: llmModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Braze liquid templating and email personalization. You analyze HTML content and suggest appropriate liquid tags for email campaigns. Always respond with valid JSON arrays only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!llmResponse.ok) {
      const errorData = await llmResponse.json();
      console.error('LLM API error:', errorData);
      return res.status(500).json({ 
        error: 'LLM API request failed', 
        details: errorData.error?.message || 'Unknown error' 
      });
    }

    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No response from LLM' });
    }

    // Parse the JSON response
    let suggestions = [];
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response:', content);
      return res.status(500).json({ 
        error: 'Failed to parse LLM suggestions', 
        details: content.substring(0, 200) 
      });
    }

    // Validate and sanitize suggestions
    const validSuggestions = suggestions
      .filter(s => s.placeholder && s.description)
      .map(s => ({
        placeholder: s.placeholder.trim(),
        description: s.description.trim(),
        fallback: s.fallback || '',
        location: s.location || 'in the HTML content',
        reason: s.reason || 'Improves personalization'
      }));

    res.json({ 
      success: true, 
      suggestions: validSuggestions,
      count: validSuggestions.length
    });

  } catch (error) {
    console.error('Liquid tag suggestion error:', error);
    res.status(500).json({ 
      error: 'Failed to generate suggestions', 
      details: error.message 
    });
  }
});

export default router;
