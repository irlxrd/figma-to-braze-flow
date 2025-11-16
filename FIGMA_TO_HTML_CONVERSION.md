# Figma to HTML Conversion Guide

## Overview

This application converts Figma designs (like discount posters, banners, emails) into HTML that's optimized for Braze email campaigns.

## How It Works

### 1. **Connection to Figma**
- The app connects to Figma using your Personal Access Token
- It fetches your team's files and designs
- You select a design/frame to convert

### 2. **Conversion Process**

The conversion now uses **email-compatible HTML** with the following improvements:

#### ✅ **Table-Based Layout**
- Instead of absolute positioning (which doesn't work in emails), we use HTML tables
- This ensures compatibility with email clients like Gmail, Outlook, etc.

#### ✅ **Image Handling**
- Images and image fills are automatically detected
- Vector graphics (icons, shapes) are exported as PNG images
- Image URLs are generated using the Figma API: `/api/figma/image/{fileKey}?ids={nodeId}&format=png`

#### ✅ **Text Conversion**
- Text elements preserve:
  - Font family, size, and weight
  - Colors and opacity
  - Alignment and spacing
  - Line height and letter spacing

#### ✅ **Styling**
- Background colors and gradients
- Border radius and borders
- Padding and spacing
- Opacity and visibility

## What Gets Converted

### ✅ Supported Elements
- **TEXT** → `<td>` with text content and styling
- **RECTANGLE, ELLIPSE, POLYGON** → `<td>` with background styling or `<img>` if it contains an image
- **FRAME, GROUP, SECTION** → `<table>` structure for layout
- **VECTOR, BOOLEAN_OPERATION, STAR, LINE** → Exported as PNG images
- **INSTANCE, COMPONENT** → `<table>` with nested children

### 📝 Layout Structure

```html
<table class="figma-frame" style="width: 100%; border-collapse: collapse;">
  <tr>
    <td class="figma-text" style="font-size: 24px; color: rgb(255, 0, 0);">
      Discount Text
    </td>
  </tr>
  <tr>
    <td class="figma-image">
      <img src="/api/figma/image/ABC123?ids=1:2&format=png" alt="Poster" style="width:100%; height:auto; display:block;" />
    </td>
  </tr>
</table>
```

## Troubleshooting

### ❌ Problem: "No visible frames found in page"

**Solution:**
- Make sure your Figma design has at least one visible Frame
- Check that the frame is not hidden (visibility toggle in Figma)
- Try selecting a specific frame instead of the entire page

### ❌ Problem: "Images don't appear in the preview"

**Cause:** Images need to be exported from Figma using the API

**Solutions:**
1. **Check Figma Token:** Make sure your Figma Personal Access Token is valid
   - Go to Figma → Settings → Personal Access Tokens
   - Generate a new token if needed
   - Re-enter it in the app

2. **Check File Permissions:** Ensure you have access to the Figma file
   - The file should be in a team you have access to
   - You need at least "View" permissions

3. **Image Export Route:** The app uses `/api/figma/image/:fileKey` to export images
   - This route returns image URLs from Figma
   - Images are exported as PNG by default

### ❌ Problem: "Conversion produces empty or minimal HTML"

**Causes:**
- The design structure might not be recognized
- Frames might be nested too deeply

**Solutions:**
1. **Simplify Design Structure:**
   - Use top-level Frames for main content
   - Avoid excessive nesting (>5 levels)

2. **Check Design Elements:**
   - Make sure elements have dimensions (width/height)
   - Verify that elements are visible

3. **Check Console:**
   - Open browser DevTools (F12)
   - Look for error messages in the Console tab
   - The conversion logs detailed information about what it's processing

### ❌ Problem: "Layout looks wrong in email clients"

**Cause:** Email clients have limited CSS support

**Solutions:**
1. **Use Inline Styles:** The converter automatically adds inline styles
2. **Avoid Complex Layouts:** Keep designs simple for best email compatibility
3. **Test in Email:** Use Braze's preview feature to test in different email clients

## Best Practices for Figma Designs

### 📐 Design Structure

1. **Use Frames for Sections:**
   ```
   Page
   └── Main Frame (600px wide for emails)
       ├── Header Frame
       ├── Content Frame
       └── Footer Frame
   ```

2. **Keep It Simple:**
   - Limit nesting to 3-4 levels
   - Use rectangles for backgrounds
   - Group related elements in frames

3. **Text Elements:**
   - Use web-safe fonts (Arial, Helvetica, Georgia, etc.)
   - Keep font sizes readable (14px minimum for body text)

4. **Images:**
   - Use high-quality images
   - Optimize image sizes (not too large)
   - Consider using image fills on rectangles

### 📧 Email Compatibility

1. **Width:** Keep main frame at 600px (standard email width)
2. **Colors:** Use solid colors when possible
3. **Fonts:** Stick to web-safe fonts
4. **Tables:** The converter uses tables automatically for compatibility

## Technical Details

### Conversion Algorithm

1. **Parse Figma Structure:**
   ```javascript
   Page → Frames → Children (recursive)
   ```

2. **Detect Element Types:**
   - Check node.type (TEXT, RECTANGLE, FRAME, etc.)
   - Check for image fills
   - Sort children by Y position for proper stacking

3. **Generate HTML:**
   - Tables for containers (FRAME, GROUP)
   - Table cells (`<td>`) for content
   - Images for visual elements
   - Inline styles for all elements

4. **Apply Styles:**
   - Extract Figma styles (colors, fonts, spacing)
   - Convert to CSS properties
   - Add as inline styles for email compatibility

### File Key for Images

When you convert a design, the app needs the `fileKey` to export images:

```javascript
// In HtmlEditor.tsx
const { fileKey } = useParams<{ fileKey: string }>();

// Passed to conversion
const result = convertPageToHtml(pageData, fileKey);

// Used in image URLs
const imageUrl = `/api/figma/image/${fileKey}?ids=${nodeId}&format=png`;
```

## API Reference

### Image Export

```
GET /api/figma/image/:fileKey
Query params:
  - ids: comma-separated node IDs
  - format: png (default)
  - scale: optional scaling factor
```

**Example:**
```
/api/figma/image/ABC123XYZ?ids=1:5,1:6,1:7&format=png&scale=2
```

## What's NOT Supported

⚠️ The following features are not yet supported:

- SVG export (uses PNG instead)
- Complex gradients (simplified to basic gradients)
- Effects (shadows, blurs) - will be added in future
- Animations
- Interactive components
- Auto-layout spacing (manual spacing used instead)

## Next Steps

After conversion:
1. **Review HTML:** Check the generated HTML in the Code tab
2. **Add Liquid Tags:** Use AI suggestions or manual tags
3. **Preview:** View in the Preview tab
4. **Upload to Braze:** Send to your Braze account

## Need Help?

If conversion fails or produces unexpected results:

1. Check browser console (F12) for error messages
2. Verify your Figma token is valid
3. Try a simpler design first to test
4. Check that the design has visible frames
5. Review this guide's troubleshooting section
