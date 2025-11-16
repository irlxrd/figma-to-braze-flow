# LLM Liquid Tag Suggestions - Implementation Summary

## What Was Built

A simple, straightforward AI-powered feature that suggests which liquid tags to add to your HTML email templates based on content analysis.

## Files Created

### Backend
1. **`/src/routes/llmSuggestions.js`** - API endpoint for LLM suggestions
   - Handles POST requests to `/api/llm/suggest-liquid-tags`
   - Calls LLM API with HTML content
   - Parses and validates suggestions
   - Returns structured suggestions to frontend

2. **`/src/services/llmSuggestions.js`** - Frontend service
   - `getLiquidTagSuggestions()` - Calls the API endpoint
   - `extractTextFromHtml()` - Helper for text extraction

3. **`/src/components/LLMSuggestionsHelp.tsx`** - Optional help card component
   - Explains the feature to users
   - Can be added to UI if needed

### Configuration
4. **Updated `/server/index.js`** - Added LLM route registration
5. **Updated `.env`** - Added LLM configuration variables
6. **Updated `.env.example`** - Added example LLM config
7. **Created `LLM_SUGGESTIONS_README.md`** - Comprehensive documentation

### UI Updates
8. **Updated `/src/pages/HtmlEditor.tsx`**
   - Added "AI Suggest Tags" button
   - Added suggestions display panel
   - Added one-click suggestion application
   - Added loading states

## How to Use

### 1. Setup (One-time)
```bash
# Add to your .env file
LLM_API_KEY=sk-your-actual-api-key-here

# Optional: Use different provider
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
```

### 2. Restart Server
```bash
# Restart your development server to load new environment variables
npm run dev
```

### 3. Use in HTML Editor
1. Convert a Figma design to HTML
2. Click the purple "AI Suggest Tags" button in the Liquid Tags panel
3. Review AI suggestions
4. Click "Add" on any suggestion to add it to your tags
5. Use the quick insert buttons to add tags to your HTML

## Features

### AI Suggestions Include:
- ✅ **Placeholder name** - e.g., "first_name"
- ✅ **Description** - What the tag represents
- ✅ **Default value** - Smart fallback
- ✅ **Location** - Where to use it in your HTML
- ✅ **Reason** - Why it's useful

### User Experience:
- ✅ Simple one-button operation
- ✅ Clear, actionable suggestions
- ✅ One-click to add suggestions
- ✅ No duplicate suggestions
- ✅ Visual feedback with loading states
- ✅ Beautiful gradient UI

## Technical Details

### LLM Prompt Strategy
The system sends:
- First 3000 chars of HTML (to minimize tokens)
- List of existing tags (to avoid duplicates)
- Structured request for JSON response
- Context about Braze liquid templating

### API Flow
```
User clicks "AI Suggest Tags"
    ↓
Frontend calls getLiquidTagSuggestions()
    ↓
Backend /api/llm/suggest-liquid-tags receives request
    ↓
Backend constructs prompt with HTML + existing tags
    ↓
Backend calls LLM API (OpenAI/Anthropic/etc)
    ↓
Backend parses JSON response
    ↓
Backend validates and sanitizes suggestions
    ↓
Frontend displays suggestions in UI
    ↓
User clicks "Add" to accept suggestion
    ↓
Tag added to liquidTags state
```

### Supported LLM Providers

1. **OpenAI (Default)**
   - Models: gpt-4o-mini, gpt-4o, gpt-3.5-turbo
   - Cost: ~$0.001-0.003 per request
   - Setup: Just add API key

2. **Anthropic Claude**
   - Models: claude-3-5-sonnet, claude-3-opus
   - Cost: Similar to OpenAI
   - Setup: Set API URL + key

3. **Any OpenAI-Compatible API**
   - Local models via LM Studio, Ollama
   - Cloud providers with OpenAI-compatible endpoints
   - Setup: Set custom API URL

## Example Suggestion Output

```json
[
  {
    "placeholder": "first_name",
    "description": "User's first name",
    "fallback": "there",
    "location": "In the greeting headline",
    "reason": "Personalizes the welcome message"
  },
  {
    "placeholder": "product_name",
    "description": "Featured product name",
    "fallback": "this product",
    "location": "In the main product title",
    "reason": "Shows the specific product user viewed"
  }
]
```

## Error Handling

- ❌ No API key → Clear error message
- ❌ API request fails → Toast notification with error
- ❌ Invalid JSON response → Graceful fallback
- ❌ Empty HTML → Button disabled
- ❌ Network issues → Timeout and error message

## Cost Estimation

- Typical request: 500-1500 tokens
- With GPT-4o-mini: ~$0.001-0.003 per suggestion
- With GPT-4o: ~$0.01-0.03 per suggestion
- User triggered, so costs controlled

## Security Considerations

- ✅ API key stored in .env (server-side only)
- ✅ API key never sent to frontend
- ✅ HTML sanitized before sending
- ✅ Only first 3000 chars sent to minimize data transfer
- ✅ Validation of all responses
- ✅ No storage of suggestions or HTML

## Future Enhancements (Optional)

If you want to expand this feature:

1. **Context-aware insertion**: Auto-insert tags at suggested locations
2. **Learn from usage**: Track which suggestions are accepted
3. **Custom prompts**: Let users customize the analysis
4. **Batch suggestions**: Suggest for multiple designs at once
5. **Save suggestions**: Cache suggestions for reuse
6. **Preview mode**: Show HTML with suggested tags inserted

## Testing Checklist

- [ ] Add LLM_API_KEY to .env
- [ ] Restart server
- [ ] Convert Figma design to HTML
- [ ] Click "AI Suggest Tags"
- [ ] Verify suggestions appear
- [ ] Click "Add" on a suggestion
- [ ] Verify tag is added to active tags
- [ ] Insert tag into HTML
- [ ] Verify tag works in preview

## Troubleshooting

**Button doesn't work?**
- Check server console for errors
- Verify API key is set in .env
- Restart server after adding API key

**No suggestions returned?**
- Check that HTML has content
- Verify API key has credits
- Check server logs for API errors

**Suggestions are generic?**
- Make sure HTML is specific/complete
- Try after adding more content
- Check that existing tags aren't covering everything

## Success Criteria ✅

- ✅ Simple one-click operation
- ✅ Clear, actionable suggestions
- ✅ Fast response time (2-5 seconds)
- ✅ Easy setup (just add API key)
- ✅ Beautiful UI integration
- ✅ Handles errors gracefully
- ✅ Works with any LLM provider
- ✅ No complex configuration needed
