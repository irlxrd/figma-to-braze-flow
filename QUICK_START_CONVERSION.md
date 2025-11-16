# Quick Start: Converting Your Discount Poster

## Step-by-Step Guide

### 1. Connect to Figma ✓
You've already done this! Your app is connected to Figma and can access your designs.

### 2. Select Your Poster Design
- Browse your Figma files
- Find your discount poster
- Click on it to view details

### 3. Convert to HTML
Click **"Convert to HTML + Add Liquid Tags"**

**What happens:**
- The app reads your Figma design structure
- Converts all elements (text, images, shapes) to HTML
- Uses email-compatible table layout
- Exports images and vectors as PNG

### 4. Review Conversion

You'll see a **blue info card** showing:
```
Status: ✓ Converted
Frames: 1-5 (number of sections)
Elements: 10-50+ (number of HTML elements)
Images: Yes (auto-exported) or None
```

### 5. Check the Result

**Preview Tab:**
- See your design rendered as HTML
- Should look similar to your Figma design
- Images should appear (if not, check Figma token)

**Code Tab:**
- Raw HTML code
- Table-based structure for email compatibility
- Inline styles for all elements

## What You Should See

### For a Discount Poster, expect:

#### ✅ Text Elements
```html
<td style="font-size: 36px; font-weight: bold; color: rgb(255, 0, 0);">
  50% OFF SALE!
</td>
```

#### ✅ Images/Graphics
```html
<td class="figma-image">
  <img src="/api/figma/image/ABC123?ids=1:5&format=png" 
       alt="Product Image" 
       style="width:100%; height:auto; display:block;" />
</td>
```

#### ✅ Background Elements
```html
<td style="background-color: rgb(255, 200, 50); padding: 20px;">
  Content here
</td>
```

## Troubleshooting

### Problem: Images Don't Appear

**Quick Fix:**
1. Click the **"Reconvert"** button in the blue info card
2. Check browser console (F12) for errors
3. Verify your Figma token is still valid

### Problem: Layout Looks Wrong

**Tips:**
- Open browser console (F12)
- Look for error messages
- Check if your design has visible frames
- Try reconverting

### Problem: Empty or Minimal HTML

**Check:**
- Does your Figma design have visible frames?
- Are the elements actually visible (not hidden)?
- Try a simpler design first to test

## Next Steps

After successful conversion:

1. **Add Liquid Tags:**
   - Click "AI Suggest Tags" for automatic suggestions
   - Or manually add tags like `{{first_name}}`

2. **Preview:**
   - Switch to Preview tab
   - Check how it looks

3. **Upload to Braze:**
   - Enter a template name
   - Choose type (Content Block or Email Campaign)
   - Click "Upload to Braze"

## Example Structure

Your discount poster in Figma:
```
Main Frame (600x800px)
├── Header (text: "SPECIAL OFFER")
├── Image (product photo)
├── Discount Badge (text: "50% OFF")
├── Description (text details)
└── CTA Button (text: "Shop Now")
```

Converts to HTML:
```html
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="font-size: 24px; color: rgb(255,0,0);">
      SPECIAL OFFER
    </td>
  </tr>
  <tr>
    <td>
      <img src="/api/figma/image/..." alt="Product" style="width:100%;" />
    </td>
  </tr>
  <tr>
    <td style="font-size: 48px; font-weight: bold;">
      50% OFF
    </td>
  </tr>
  <tr>
    <td style="font-size: 16px;">
      Description text here
    </td>
  </tr>
  <tr>
    <td>
      <a href="#" style="background: blue; color: white; padding: 10px;">
        Shop Now
      </a>
    </td>
  </tr>
</table>
```

## Important Notes

✅ **What Works:**
- Text with colors, fonts, sizes
- Images and image fills
- Vector graphics (converted to PNG)
- Background colors
- Borders and border radius
- Opacity

⚠️ **Limitations:**
- Complex gradients (simplified)
- Effects like shadows (not yet supported)
- Animations (not supported in email)
- Interactive elements (converted to static)

## Need More Help?

See full documentation:
- **FIGMA_TO_HTML_CONVERSION.md** - Detailed conversion guide
- **CONVERSION_FIX_SUMMARY.md** - Technical details of the fix
- **TROUBLESHOOTING.md** - General troubleshooting

## Console Logging

Open browser console (F12) to see:
```
Converting page to HTML... { pageData: {...}, fileKey: "ABC123" }
Page data received: { type: "CANVAS", name: "Page 1", childCount: 5 }
Converting 1 frames to HTML...
```

This helps you understand what's happening during conversion!
