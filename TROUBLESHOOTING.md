# Troubleshooting Guide - LLM Liquid Tag Suggestions

## Common Issues & Solutions

### 🔴 "LLM API key not configured"

**Problem:** When you click "AI Suggest Tags", you get an error saying the API key is not configured.

**Solution:**
1. Open your `.env` file in the project root
2. Add this line:
   ```bash
   LLM_API_KEY=your_actual_api_key_here
   ```
3. Replace `your_actual_api_key_here` with your real API key
4. **Restart your server** (Ctrl+C then `npm run dev`)
5. Try again

**Check:**
```bash
# Visit in browser:
http://localhost:4000/api/llm/config

# Should show:
{ "configured": true, ... }
```

---

### 🔴 Button Does Nothing / No Response

**Problem:** You click "AI Suggest Tags" but nothing happens.

**Diagnosis:**
1. Open browser console (F12)
2. Click the button
3. Look for errors in console

**Solutions:**

**If you see "Failed to fetch":**
- Check if server is running: `http://localhost:4000`
- Restart the server: `npm run dev`

**If you see "Network error":**
- Check your internet connection
- Verify you can access the LLM API URL

**If console is empty:**
- Check server terminal for errors
- Look for a crash or error message

---

### 🔴 "Failed to get suggestions" Error

**Problem:** Button works but shows an error toast.

**Diagnosis - Check Server Console:**

Look for specific error messages in your server terminal.

**Common Errors & Solutions:**

#### "Invalid API key"
```
Solution: Your API key is wrong or expired
1. Get a new API key from your LLM provider
2. Update .env file
3. Restart server
```

#### "Rate limit exceeded"
```
Solution: You've hit your API quota
1. Wait a few minutes
2. Or upgrade your API plan
3. Or switch to different API key
```

#### "Model not found"
```
Solution: Your model name is wrong
1. Check .env for LLM_MODEL
2. For OpenAI use: gpt-4o-mini, gpt-4o, or gpt-3.5-turbo
3. For Anthropic use: claude-3-5-sonnet-20241022
4. Restart server
```

#### "Insufficient quota"
```
Solution: Your account has no credits
1. Add credits to your LLM provider account
2. Or use a different API key
```

---

### 🔴 Slow Response (>10 seconds)

**Problem:** Button shows loading for a very long time.

**Normal Behavior:**
- First request: 3-5 seconds (normal)
- Subsequent requests: 2-4 seconds (normal)

**If taking >10 seconds:**

**Check 1: Model Speed**
- Some models are slower than others
- GPT-4o is slower than gpt-4o-mini
- Consider using a faster model in .env:
  ```bash
  LLM_MODEL=gpt-4o-mini
  ```

**Check 2: Network**
- Check your internet speed
- Try again (might be temporary)

**Check 3: API Status**
- Check OpenAI/Anthropic status page
- Service might be experiencing issues

---

### 🔴 Suggestions Are Empty / Generic

**Problem:** AI returns 0 suggestions or very generic ones.

**Solutions:**

**If 0 suggestions:**
1. Make sure your HTML has actual content (not just empty tags)
2. Try with a more complete HTML template
3. Check if all existing tags already cover everything

**If suggestions are too generic:**
1. Your HTML might be very simple
2. Add more specific content to analyze
3. Try running it again (AI can vary)

**If suggestions don't match content:**
1. This shouldn't happen - report as bug
2. Try clicking the button again
3. Check if HTML is what you expect

---

### 🔴 Suggestions Don't Apply / Add Button Doesn't Work

**Problem:** Click "Add" on a suggestion but nothing happens.

**Diagnosis:**
1. Open browser console
2. Click "Add" button
3. Look for errors

**Solutions:**

**If you see "already exists" toast:**
- That tag is already in your active tags
- This is normal behavior

**If no toast appears:**
- Check browser console for JavaScript errors
- Try refreshing the page
- Check if other buttons work

---

### 🔴 Server Won't Start After Adding LLM Routes

**Problem:** Server crashes on startup with error about LLM routes.

**Check Server Error Message:**

**"Cannot find module":**
```bash
Solution: 
1. Make sure all new files exist:
   - src/routes/llmSuggestions.js
   - src/routes/llmTest.js
   - src/services/llmSuggestions.js
2. Check file paths are correct
3. Try: npm install (refresh dependencies)
```

**"Syntax error":**
```bash
Solution:
1. Check for typos in new files
2. Make sure all imports are correct
3. Verify file has no syntax errors
```

---

### 🔴 Authentication / API Errors

**Problem:** Getting 401, 403, or similar authentication errors.

**For OpenAI:**
```bash
Solution:
1. Verify your API key starts with "sk-"
2. Check you have credits: https://platform.openai.com/usage
3. Make sure API key has proper permissions
4. Try generating a new API key
```

**For Anthropic:**
```bash
Solution:
1. Verify your API key starts with "sk-ant-"
2. Check you have credits
3. Make sure API key is active
4. Verify you set LLM_API_URL correctly:
   LLM_API_URL=https://api.anthropic.com/v1/messages
```

---

### 🔴 CORS / Network Errors

**Problem:** Browser console shows CORS errors.

**This shouldn't happen** because:
- API calls go through your server (not directly from browser)
- Server has CORS enabled

**If you see CORS errors:**
```bash
Solution:
1. Make sure you're calling /api/llm/suggest-liquid-tags
2. Not calling LLM API directly from frontend
3. Check server is running on correct port
4. Verify VITE_FIGMA_BACKEND is set correctly
```

---

### 🔴 Response Parsing Errors

**Problem:** Server logs show "Failed to parse LLM response".

**This means:** LLM didn't return valid JSON.

**Solutions:**
1. Try clicking the button again (LLM can vary)
2. If persists, check server logs for full response
3. Some models follow instructions better than others
4. Try a different model (gpt-4o is more reliable than gpt-3.5-turbo)

**Temporary Fix:**
- Just click the button again
- Usually works on retry

---

### 🔴 Suggestions Keep Appearing After Adding

**Problem:** After adding a suggestion, it still appears in suggestions list.

**This shouldn't happen** - it's a bug.

**Temporary Fix:**
1. Close suggestions panel (click X)
2. Click "AI Suggest Tags" again
3. New suggestions won't include already-added tags

---

### 🔴 HTML Preview Not Updating

**Problem:** Added tags but preview doesn't show them.

**This is expected:**
- Tags show as `{{placeholder}}` in raw form
- Preview won't resolve actual values
- This is how Braze will receive them

**To see resolved tags:**
- Preview is for layout, not tag values
- Braze will resolve tags when sending emails

---

## Testing Your Setup

### Quick Test Checklist

```bash
# 1. Check environment
cat .env | grep LLM_API_KEY
# Should show your API key (not "your_llm_api_key_here")

# 2. Test configuration
curl http://localhost:4000/api/llm/config
# Should return: { "configured": true, ... }

# 3. Test API connection
curl http://localhost:4000/api/llm/test
# Should return: { "success": true, ... }

# 4. Test full flow in browser
# - Open HTML Editor
# - Click "AI Suggest Tags"
# - Should see suggestions in 2-5 seconds
```

### Detailed Diagnostic

```bash
# Check if server is running
curl http://localhost:4000
# Should return: "Figma OAuth server is running"

# Check if LLM routes are loaded
# Look in server terminal for:
# "🔄 Loading LLM routes..."
# "🔄 Loading LLM test routes..."
# "✅ All routes loaded successfully"

# Check environment variables
echo $LLM_API_KEY
# Should show your key (if exported)

# Test with full request
curl -X POST http://localhost:4000/api/llm/suggest-liquid-tags \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hello {{name}}</h1>","existingTags":[]}'
# Should return suggestions JSON
```

---

## Getting Help

### Information to Gather

If you need help, collect this info:

1. **Error message** (exact text)
2. **Server console output** (any errors)
3. **Browser console output** (any errors)
4. **Your configuration:**
   ```bash
   curl http://localhost:4000/api/llm/config
   ```
5. **Test result:**
   ```bash
   curl http://localhost:4000/api/llm/test
   ```

### Debug Mode

Enable detailed logging:

**Server side:**
- Look at server terminal for all requests/errors
- Errors are logged automatically

**Browser side:**
- Open console (F12)
- Network tab shows all API calls
- Console tab shows any JavaScript errors

---

## Reset / Start Fresh

If nothing works, try fresh start:

```bash
# 1. Stop server
# Press Ctrl+C

# 2. Clear any caches
rm -rf node_modules/.cache

# 3. Verify .env
cat .env | grep LLM

# 4. Restart server
npm run dev

# 5. Test configuration
curl http://localhost:4000/api/llm/config

# 6. Test API
curl http://localhost:4000/api/llm/test

# 7. Try in browser
```

---

## Still Not Working?

Check these files exist and have no syntax errors:

```bash
# Backend
ls -la server/index.js
ls -la src/routes/llmSuggestions.js
ls -la src/routes/llmTest.js

# Frontend
ls -la src/services/llmSuggestions.js
ls -la src/pages/HtmlEditor.tsx

# Config
ls -la .env
```

Make sure .env has:
```bash
LLM_API_KEY=sk-...  # Your real key
```

Server terminal should show:
```
🔄 Loading LLM routes...
🔄 Loading LLM test routes...
✅ All routes loaded successfully
🚀 Figma OAuth server listening on http://localhost:4000
```

---

## Prevention Tips

**To avoid issues:**

✅ Always restart server after changing .env  
✅ Use valid API key with credits  
✅ Check server logs for errors  
✅ Test with `/api/llm/test` first  
✅ Keep API key secure (never commit to git)  
✅ Monitor your API usage/costs  
✅ Start with gpt-4o-mini (fast and cheap)  

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| "API key not configured" | Add LLM_API_KEY to .env + restart |
| Button does nothing | Check server running + browser console |
| Slow response | Normal for first request, try faster model |
| Empty suggestions | Need more HTML content |
| 401/403 errors | Check API key validity + credits |
| CORS errors | Shouldn't happen - check server running |
| Won't add suggestion | Check if already exists in active tags |

---

## Emergency Contacts

**OpenAI Issues:**
- Status: https://status.openai.com/
- Help: https://help.openai.com/

**Anthropic Issues:**
- Status: https://status.anthropic.com/
- Help: https://support.anthropic.com/

---

**Last Updated:** November 16, 2024  
**Version:** 1.0.0
