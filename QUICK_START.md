# Quick Start Guide - LLM Liquid Tag Suggestions

## 🚀 Get Started in 3 Steps

### Step 1: Add Your API Key (30 seconds)

Open `.env` file and add your LLM API key:

```bash
# For OpenAI (recommended)
LLM_API_KEY=sk-your-openai-api-key-here

# That's it! The defaults will use gpt-4o-mini
```

**Don't have an API key?**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

### Step 2: Restart Server (10 seconds)

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Try It! (20 seconds)

1. Open your app in the browser
2. Go to HTML Editor (convert a Figma design first)
3. Click the purple **"✨ AI Suggest Tags"** button
4. Watch AI suggest liquid tags!
5. Click "Add" on any suggestion you like

## ✅ Verify Setup

Test if your LLM is configured correctly:

```bash
# In your browser, visit:
http://localhost:4000/api/llm/config

# Should show:
{
  "configured": true,
  "provider": "OpenAI",
  "model": "gpt-4o-mini",
  ...
}
```

Or test the actual API:

```bash
# Visit:
http://localhost:4000/api/llm/test

# Should show:
{
  "success": true,
  "message": "LLM API is working correctly!",
  ...
}
```

## 🎯 What to Expect

**First Click:**
- Loading time: 2-5 seconds
- You'll see a loading spinner
- AI analyzes your HTML

**Results:**
- 5-8 relevant suggestions
- Each with description, default value, location, and reason
- One-click to add to your tags

**Example Suggestion:**
```
{{first_name}}
User's first name
Default: "there"
📍 In the greeting headline
💡 Personalizes the welcome message
[✓ Add]
```

## 💰 Cost

**With OpenAI gpt-4o-mini:**
- ~$0.001-0.003 per suggestion request
- Super affordable for occasional use

**With OpenAI gpt-4o:**
- ~$0.01-0.03 per suggestion request
- Better quality, higher cost

## 🔧 Advanced Setup (Optional)

### Use Anthropic Claude Instead

```bash
# In .env:
LLM_API_KEY=sk-ant-your-anthropic-key
LLM_API_URL=https://api.anthropic.com/v1/messages
LLM_MODEL=claude-3-5-sonnet-20241022
```

### Use Different OpenAI Model

```bash
# In .env:
LLM_API_KEY=sk-your-key
LLM_MODEL=gpt-4o  # More capable, costs more
```

### Use Local LLM

```bash
# With LM Studio or Ollama:
LLM_API_KEY=not-needed
LLM_API_URL=http://localhost:1234/v1/chat/completions
LLM_MODEL=your-local-model-name
```

## ❓ Common Issues

### "LLM API key not configured"
→ Add `LLM_API_KEY` to `.env` and restart server

### "Failed to get suggestions"
→ Check server console for errors
→ Verify API key is valid and has credits

### Button does nothing
→ Make sure server is running
→ Check browser console for errors

### Suggestions are empty/generic
→ Make sure you have HTML content
→ Try with more complete/specific HTML

## 📚 Full Documentation

- **LLM_SUGGESTIONS_README.md** - Complete guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **VISUAL_GUIDE.md** - UI walkthrough

## 🎨 UI Location

Look for the purple gradient button in the **HTML Editor** → **Liquid Tags** panel on the left side:

```
┌─────────────────────────────┐
│  ✨ AI Suggest Tags         │
│  [Purple gradient button]   │
└─────────────────────────────┘
```

## 💡 Pro Tips

1. **Run after converting**: Get best suggestions after initial HTML conversion
2. **Review before adding**: Read the location and reason for each suggestion
3. **Run multiple times**: You can get new suggestions as you edit
4. **Check existing tags**: System won't suggest duplicates
5. **Use quick insert**: After adding tags, use [+] to insert into HTML

## 🎉 That's It!

You're ready to use AI-powered liquid tag suggestions. Simple, straightforward, and helpful!

Questions? Check the full documentation in `LLM_SUGGESTIONS_README.md`
