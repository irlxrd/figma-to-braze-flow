# Figma to HTML Conversion - Fix Summary

## Problem
The Figma to HTML conversion was not working properly for complex designs like discount posters. The issues were:

1. **Absolute positioning** - Used `position: absolute` which doesn't work in emails
2. **No image handling** - Images and image fills were not being detected or exported
3. **Vector graphics ignored** - Vectors just showed HTML comments instead of actual content
4. **Poor layout structure** - Not compatible with email clients

## Solution

### 1. Email-Compatible Table Layout

**Before:**
```javascript
// Used absolute positioning
styles.position = 'absolute';
styles.left = `${x}px`;
styles.top = `${y}px`;

// Generated divs
<div style="position: absolute; left: 100px; top: 50px;">Content</div>
```

**After:**
```javascript
// Uses table-based layout
element.tag = 'table';
element.tableStyle = 'width: 100%; border-collapse: collapse;';

// Generated tables
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td>Content</td>
  </tr>
</table>
```

### 2. Image Detection and Export

**Added:**
```javascript
// Check if node is an image
function isImageNode(node) {
  if (!node || !node.fills) return false;
  return node.fills.some(fill => fill.type === 'IMAGE');
}

// Get image URL
function getImageUrl(node, fileKey) {
  const imageFill = node.fills.find(fill => fill.type === 'IMAGE');
  if (!imageFill) return null;
  return `/api/figma/image/${fileKey}?ids=${node.id}&format=png`;
}
```

**Result:**
- Images are now detected in RECTANGLE, ELLIPSE, and POLYGON nodes
- Image fills are properly exported via Figma API
- Vector graphics are exported as PNG images

### 3. Better Element Handling

**Before:**
```javascript
case 'VECTOR':
  element.content = '<!-- Vector graphics would need SVG conversion -->';
  break;
```

**After:**
```javascript
case 'VECTOR':
case 'BOOLEAN_OPERATION':
case 'STAR':
case 'LINE':
  element.tag = 'td';
  element.class = 'figma-vector';
  const vectorUrl = `/api/figma/image/${fileKey}?ids=${node.id}&format=png`;
  element.content = `<img src="${vectorUrl}" alt="${node.name}" style="width:100%; height:auto; display:block;" />`;
  break;
```

### 4. Improved Style Extraction

**Added:**
- Removed absolute positioning for email compatibility
- Added better text styling (font-family fallbacks)
- Improved padding and spacing
- Better opacity and visibility handling
- Proper dimensions without position conflicts

### 5. Better Error Handling and Logging

**Added:**
```javascript
// Better error messages
if (!page) {
  throw new Error('Invalid page data - page is null or undefined');
}

// Detailed logging
console.log(`Converting ${mainFrames.length} frames to HTML...`);

// Fallback for different page structures
if (!children) {
  if (page.type === 'FRAME' || page.type === 'CANVAS') {
    children = [page];
  }
}
```

### 6. UI Improvements

**Added:**
1. **Conversion Info Card** - Shows conversion status, frame count, element count, and image status
2. **Reconvert Button** - Allows users to retry conversion if something goes wrong
3. **Debug Logging** - Logs detailed information about page structure to browser console
4. **Better Notifications** - Informative toast messages about conversion results

## Files Modified

1. **`src/services/figmaToHtml.js`**
   - Complete rewrite of conversion logic
   - Added `isImageNode()` function
   - Added `getImageUrl()` function
   - Updated `extractNodeStyles()` for email compatibility
   - Updated `nodeToHtmlElement()` to handle images and vectors
   - Updated `elementToHtml()` for table-based structure
   - Updated `convertPageToHtml()` with better error handling

2. **`src/pages/HtmlEditor.tsx`**
   - Added `fileKey` parameter to `convertPageToHtml()`
   - Added conversion metadata state
   - Added detailed logging in `useEffect`
   - Added conversion info card in UI
   - Added reconvert button
   - Added RefreshCw icon import

## How It Works Now

### Conversion Flow:

```
1. User selects Figma design
   ↓
2. Navigate to HTML Editor with pageData and fileKey
   ↓
3. convertPageToHtml(pageData, fileKey) is called
   ↓
4. Parse Figma structure:
   - Find visible frames
   - Sort children by Y position
   - Detect element types
   ↓
5. Convert each element:
   - TEXT → <td> with styled text
   - RECTANGLE with image → <td> with <img>
   - VECTOR → <td> with <img> (exported as PNG)
   - FRAME/GROUP → <table> with nested rows
   ↓
6. Generate HTML:
   - Table-based structure
   - Inline styles
   - Email-compatible CSS
   - Image export URLs
   ↓
7. Display in editor with:
   - Preview tab (rendered HTML)
   - Code tab (raw HTML)
   - Liquid tag panel
   - AI suggestions
```

### Image Export:

```
Figma Node (with image fill or vector)
   ↓
Generate URL: /api/figma/image/{fileKey}?ids={nodeId}&format=png
   ↓
Figma API returns image URL
   ↓
Image embedded in HTML: <img src="..." />
   ↓
Rendered in preview and exported to Braze
```

## Testing

To test the fix:

1. **Connect to Figma:**
   - Make sure you have a valid Figma Personal Access Token
   - Enter it in the connection screen

2. **Select a Complex Design:**
   - Choose a design with:
     - Multiple text elements
     - Images or image fills
     - Vector graphics (icons, shapes)
     - Background colors and gradients

3. **Convert to HTML:**
   - Click "Convert to HTML + Add Liquid Tags"
   - Check the conversion info card
   - Open browser console (F12) to see detailed logs

4. **Verify Output:**
   - Preview tab: Should show all elements
   - Code tab: Should show table-based HTML
   - Images: Should have proper img tags with Figma export URLs

5. **Check for Issues:**
   - If images don't load: Check Figma token
   - If layout is wrong: Check console for errors
   - If conversion fails: Click "Reconvert" button

## Next Steps

Recommended improvements:

1. **Image Caching:** Cache exported images to avoid repeated API calls
2. **SVG Support:** Export simple vectors as SVG instead of PNG
3. **Layout Optimization:** Better detection of horizontal vs vertical layouts
4. **Auto-layout Support:** Respect Figma auto-layout spacing
5. **Effects Support:** Add shadows and blurs (email-compatible versions)

## Documentation

Created comprehensive guide:
- **FIGMA_TO_HTML_CONVERSION.md** - Complete conversion guide with troubleshooting

## Summary

The Figma to HTML conversion now:
- ✅ Uses email-compatible table layout
- ✅ Detects and exports images
- ✅ Converts vectors to PNG images
- ✅ Handles complex poster designs
- ✅ Provides detailed feedback and debugging
- ✅ Works without AI tool requirement
- ✅ Compatible with Braze email campaigns
