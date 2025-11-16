# Architecture Diagram - LLM Liquid Tag Suggestions

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    HTML Editor Page                        │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │         Liquid Tags Panel (Left Side)                │  │  │
│  │  │                                                        │  │  │
│  │  │  ┌──────────────────────────────────────────┐        │  │  │
│  │  │  │  ✨ AI Suggest Tags Button               │        │  │  │
│  │  │  │  [Click triggers LLM request]            │        │  │  │
│  │  │  └──────────────────────────────────────────┘        │  │  │
│  │  │                    ↓                                  │  │  │
│  │  │  ┌──────────────────────────────────────────┐        │  │  │
│  │  │  │  AI Suggestions Panel                    │        │  │  │
│  │  │  │  - Shows 5-8 suggestions                │        │  │  │
│  │  │  │  - Location, reason, defaults           │        │  │  │
│  │  │  │  - [Add] button per suggestion          │        │  │  │
│  │  │  └──────────────────────────────────────────┘        │  │  │
│  │  │                    ↓                                  │  │  │
│  │  │  ┌──────────────────────────────────────────┐        │  │  │
│  │  │  │  Active Tags List                        │        │  │  │
│  │  │  │  - User's selected tags                 │        │  │  │
│  │  │  │  - [+] Insert, [×] Remove               │        │  │  │
│  │  │  └──────────────────────────────────────────┘        │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    HTTP POST/GET Requests
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER (PORT 4000)                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Route Handlers                          │  │
│  │                                                             │  │
│  │  GET  /api/llm/config    → LLM configuration status       │  │
│  │  GET  /api/llm/test      → Test LLM connection            │  │
│  │  POST /api/llm/suggest-liquid-tags → Get suggestions      │  │
│  │                                                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              LLM Suggestion Handler                        │  │
│  │  /src/routes/llmSuggestions.js                            │  │
│  │                                                             │  │
│  │  1. Receive HTML + existing tags                          │  │
│  │  2. Load LLM config from .env                             │  │
│  │  3. Construct AI prompt                                   │  │
│  │  4. Call LLM API                                           │  │
│  │  5. Parse JSON response                                    │  │
│  │  6. Validate suggestions                                   │  │
│  │  7. Return to frontend                                     │  │
│  │                                                             │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                        HTTPS Request
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    LLM API (OpenAI/Anthropic/etc)               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │  Input:                                                     │  │
│  │  - System prompt (Braze expert)                           │  │
│  │  - User prompt (HTML + existing tags)                     │  │
│  │  - Parameters (model, temperature, max_tokens)            │  │
│  │                                                             │  │
│  │                        ↓                                    │  │
│  │                   AI Processing                            │  │
│  │  - Analyzes HTML structure                                │  │
│  │  - Identifies personalization opportunities               │  │
│  │  - Generates contextual suggestions                       │  │
│  │                        ↓                                    │  │
│  │                                                             │  │
│  │  Output:                                                    │  │
│  │  JSON array of suggestions with:                          │  │
│  │  - placeholder, description, fallback                     │  │
│  │  - location, reason                                       │  │
│  │                                                             │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Clicks "AI Suggest Tags"

```
HtmlEditor.tsx
  ↓
  getSuggestions()
    ↓
    setState: loadingSuggestions = true
      ↓
      llmSuggestions.js service
        ↓
        fetch('/api/llm/suggest-liquid-tags', {
          html: processedHtml,
          existingTags: liquidTags
        })
```

### 2. Server Processes Request

```
server/index.js
  ↓
  /api/llm route
    ↓
    llmSuggestions.js route handler
      ↓
      Load .env config
        ↓
        Construct prompt with:
          - System message (Braze expert)
          - HTML content (first 3000 chars)
          - Existing tags list
        ↓
        Call LLM API
```

### 3. LLM Generates Suggestions

```
LLM API receives:
  ↓
  {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are Braze expert..." },
      { role: "user", content: "Analyze HTML..." }
    ],
    temperature: 0.7,
    max_tokens: 1500
  }
  ↓
  AI analyzes HTML
  ↓
  Returns JSON array of suggestions
```

### 4. Server Validates & Returns

```
llmSuggestions.js
  ↓
  Parse JSON response
  ↓
  Validate each suggestion:
    - Has placeholder?
    - Has description?
    - Sanitize strings
  ↓
  Return validated suggestions
```

### 5. Frontend Displays Results

```
llmSuggestions.js service
  ↓
  Returns data to HtmlEditor.tsx
    ↓
    setState: {
      suggestions: data.suggestions,
      loadingSuggestions: false,
      showSuggestions: true
    }
    ↓
    UI renders suggestion cards
```

### 6. User Adds Suggestion

```
User clicks "Add" button
  ↓
  applySuggestion(suggestion)
    ↓
    Add to liquidTags state
    ↓
    Remove from suggestions
    ↓
    Show success toast
    ↓
    Tag now available in active tags
```

## Component Hierarchy

```
HtmlEditor.tsx
├── BrazeProtected (wrapper)
│   ├── Header
│   │   ├── Back button
│   │   ├── Template name input
│   │   └── Upload button
│   │
│   └── Grid layout
│       ├── Left Column (1/3)
│       │   └── Liquid Tags Card
│       │       ├── AI Suggest Button ⭐
│       │       ├── Suggestions Panel ⭐
│       │       │   └── Suggestion Cards ⭐
│       │       │       ├── Placeholder name
│       │       │       ├── Description
│       │       │       ├── Default value
│       │       │       ├── Location
│       │       │       ├── Reason
│       │       │       └── [Add] button
│       │       │
│       │       ├── Active Tags List
│       │       │   └── Tag Cards
│       │       │       ├── [+] Insert
│       │       │       └── [×] Remove
│       │       │
│       │       └── Add New Tag Form
│       │
│       └── Right Column (2/3)
│           └── Editor Card
│               └── Tabs
│                   ├── Preview
│                   ├── HTML
│                   └── CSS
```

## State Management

```javascript
// HtmlEditor.tsx state
{
  // Original HTML
  html: string,
  css: string,
  
  // Liquid tags
  liquidTags: LiquidTag[],
  newTag: LiquidTag,
  
  // Processed output
  processedHtml: string,
  
  // AI suggestions ⭐
  suggestions: LiquidTagSuggestion[],
  loadingSuggestions: boolean,
  showSuggestions: boolean,
  
  // UI state
  loading: boolean,
  exporting: boolean,
  activeTab: string,
  templateName: string,
  uploadType: string
}
```

## API Endpoints

```
GET  /api/llm/config
Response: {
  configured: boolean,
  provider: string,
  model: string,
  apiUrl: string
}

GET  /api/llm/test
Response: {
  success: boolean,
  configured: boolean,
  message: string,
  provider: string,
  model: string,
  testResponse: string
}

POST /api/llm/suggest-liquid-tags
Request: {
  html: string,
  existingTags: LiquidTag[]
}
Response: {
  success: boolean,
  suggestions: LiquidTagSuggestion[],
  count: number
}
```

## Environment Variables

```bash
# Required
LLM_API_KEY=sk-...

# Optional (with defaults)
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
```

## Error Handling Flow

```
Try to get suggestions
  ↓
  API key not set?
    → Return 500: "LLM_API_KEY not configured"
  ↓
  LLM API fails?
    → Return 500: "LLM API request failed" + details
  ↓
  Response not JSON?
    → Return 500: "Failed to parse LLM suggestions"
  ↓
  No suggestions?
    → Return empty array (valid response)
  ↓
  Success!
    → Return validated suggestions
```

## Security Layers

```
1. Client Side
   ↓ Only sends HTML + tag names (no sensitive data)
   
2. Server Side
   ↓ API key stored in .env (not in code)
   ↓ Never sent to frontend
   ↓ Validates all inputs
   
3. LLM Provider
   ↓ Receives truncated HTML (3000 chars max)
   ↓ No data stored by our app
   ↓ Standard HTTPS encryption
```

## Performance Optimization

```
1. Truncate HTML (3000 chars)
   → Reduces tokens/cost
   
2. User-triggered only
   → No automatic calls
   
3. Frontend caching
   → Suggestions stored in state
   
4. Efficient model (gpt-4o-mini)
   → Fast + affordable
   
5. Async processing
   → Non-blocking UI
```
