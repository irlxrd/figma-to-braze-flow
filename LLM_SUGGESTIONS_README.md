# LLM-Powered Liquid Tag Suggestions

## Overview
This feature uses an LLM (Language Learning Model) to automatically suggest appropriate Braze liquid tags for your HTML email templates based on the content.

## How It Works

1. **Analysis**: The LLM analyzes your HTML content from the Figma design
2. **Suggestions**: It suggests relevant liquid tags for personalization based on:
   - User personalization opportunities (names, emails, etc.)
   - Dynamic content based on user attributes
   - Campaign/Canvas information
   - Text content and structure analysis
3. **Easy Addition**: You can add suggested tags with one click

## Setup

### 1. Add Your LLM API Key

Edit the `.env` file and add your LLM API key:

```env
# LLM Configuration for Liquid Tag Suggestions
LLM_API_KEY=your_actual_api_key_here
```

### 2. Supported LLM Providers

#### OpenAI (Default)
```env
LLM_API_KEY=sk-...
# Optional: specify model (defaults to gpt-4o-mini)
LLM_MODEL=gpt-4o-mini
```

#### Anthropic Claude
```env
LLM_API_KEY=sk-ant-...
LLM_API_URL=https://api.anthropic.com/v1/messages
LLM_MODEL=claude-3-5-sonnet-20241022
```

#### Other OpenAI-Compatible APIs
You can use any API that follows the OpenAI chat completions format:
```env
LLM_API_KEY=your_key
LLM_API_URL=https://your-api-endpoint.com/v1/chat/completions
LLM_MODEL=your-model-name
```

### 3. Restart the Server

After updating the `.env` file, restart your development server for changes to take effect.

## Usage

1. **Convert Design to HTML**: First, convert your Figma design to HTML as usual
2. **Click "AI Suggest Tags"**: In the Liquid Tags panel, click the purple "AI Suggest Tags" button
3. **Review Suggestions**: The AI will analyze your HTML and suggest relevant liquid tags
4. **Add Tags**: Click "Add" on any suggestion to add it to your active tags
5. **Use Tags**: Insert the tags into your HTML using the quick insert buttons

## Features of Suggestions

Each AI suggestion includes:
- **Placeholder**: The liquid tag variable name
- **Description**: What the tag represents
- **Default Value**: A sensible fallback value
- **Location**: Where in the HTML this tag should be used
- **Reason**: Why this tag would be useful

## Example Suggestions

For an email with a greeting and product information, the AI might suggest:

```
{{first_name}} - User's first name
Location: In the greeting headline
Reason: Personalizes the welcome message

{{product_name}} - Product name
Location: In the product title section  
Reason: Dynamically shows the relevant product

{{discount_percentage}} - Discount amount
Location: In the promotional banner
Reason: Shows personalized offer amount
```

## Cost Considerations

- Uses LLM API which may incur costs per request
- Each suggestion request analyzes up to 3000 characters of HTML
- Typically uses 500-1500 tokens per request
- Cost with GPT-4o-mini: ~$0.001-0.003 per suggestion request

## Troubleshooting

### "LLM API key not configured"
- Make sure `LLM_API_KEY` is set in your `.env` file
- Restart the server after adding the key

### "Failed to get suggestions"
- Check that your API key is valid
- Verify you have credits/quota with your LLM provider
- Check the server console for detailed error messages

### No suggestions returned
- Make sure your HTML has content to analyze
- Try clicking the button again
- Check that existing tags aren't already covering all opportunities

## Technical Details

### Files Added
- `/src/services/llmSuggestions.js` - Frontend service for API calls
- `/src/routes/llmSuggestions.js` - Backend API route handler

### API Endpoint
```
POST /api/llm/suggest-liquid-tags
Body: { html: string, existingTags: array }
Response: { success: true, suggestions: array, count: number }
```

### Suggestion Object Structure
```typescript
interface LiquidTagSuggestion {
  placeholder: string;      // Variable name (without {{ }})
  description: string;       // What it represents
  fallback: string;         // Default value
  location: string;         // Where to use it
  reason: string;          // Why it's useful
}
```

## Privacy & Security

- HTML content is sent to your configured LLM provider for analysis
- Only the first 3000 characters of HTML are sent to minimize data transfer
- No HTML content is stored by this application
- Ensure your LLM API key is kept secure and never committed to version control
