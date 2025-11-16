/**
 * Figma to HTML Conversion Service
 * Converts Figma design data to HTML with CSS styling
 * Optimized for email compatibility (table-based layout)
 */

/**
 * Convert a Figma color to CSS color
 * @param {Object} color - Figma color object with r, g, b, a properties
 * @returns {string} CSS color string
 */
function figmaColorToCSS(color) {
  if (!color) return 'transparent';
  
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;
  
  if (a === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}

/**
 * Check if a node is an image
 * @param {Object} node - Figma node
 * @returns {boolean}
 */
function isImageNode(node) {
  if (!node) return false;
  
  // Check if node has image fills
  if (node.fills && Array.isArray(node.fills)) {
    return node.fills.some(fill => fill.type === 'IMAGE');
  }
  
  return false;
}

/**
 * Get image URL from node
 * @param {Object} node - Figma node
 * @param {string} fileKey - Figma file key
 * @returns {string|null}
 */
function getImageUrl(node, fileKey) {
  if (!node || !node.fills) return null;
  
  const imageFill = node.fills.find(fill => fill.type === 'IMAGE');
  if (!imageFill || !imageFill.imageRef) return null;
  
  // Return a placeholder that we'll replace with actual exported image
  return `/api/figma/image/${fileKey}?ids=${node.id}&format=png`;
}

/**
 * Convert Figma gradients to CSS gradients
 * @param {Array} gradientStops - Array of gradient stops
 * @param {Object} gradientHandlePositions - Gradient handle positions
 * @returns {string} CSS gradient string
 */
function figmaGradientToCSS(gradientStops, gradientHandlePositions) {
  if (!gradientStops || gradientStops.length === 0) return 'transparent';
  
  const stops = gradientStops.map(stop => {
    const color = figmaColorToCSS(stop.color);
    const position = Math.round(stop.position * 100);
    return `${color} ${position}%`;
  }).join(', ');
  
  // Default to linear gradient if no handle positions
  return `linear-gradient(90deg, ${stops})`;
}

/**
 * Extract CSS styles from Figma node (email-compatible)
 * @param {Object} node - Figma node
 * @param {boolean} isEmail - Whether to optimize for email
 * @returns {Object} CSS styles object
 */
function extractNodeStyles(node, isEmail = true) {
  const styles = {};
  
  // Background fills
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills.find(f => f.visible !== false);
    if (fill) {
      if (fill.type === 'SOLID') {
        styles.backgroundColor = figmaColorToCSS(fill.color);
      } else if (fill.type === 'GRADIENT_LINEAR') {
        styles.background = figmaGradientToCSS(fill.gradientStops, fill.gradientHandlePositions);
      }
      // Note: IMAGE fills are handled separately
    }
  }
  
  // Border radius
  if (node.cornerRadius) {
    styles.borderRadius = `${node.cornerRadius}px`;
  }
  
  // Strokes (borders)
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes.find(s => s.visible !== false);
    if (stroke) {
      const borderWidth = node.strokeWeight || 1;
      const borderColor = figmaColorToCSS(stroke.color);
      styles.border = `${borderWidth}px solid ${borderColor}`;
    }
  }
  
  // Typography for text nodes
  if (node.type === 'TEXT' && node.style) {
    const textStyle = node.style;
    if (textStyle.fontSize) styles.fontSize = `${textStyle.fontSize}px`;
    if (textStyle.fontFamily) styles.fontFamily = `${textStyle.fontFamily}, Arial, sans-serif`;
    if (textStyle.fontWeight) styles.fontWeight = textStyle.fontWeight;
    if (textStyle.lineHeightPx) styles.lineHeight = `${textStyle.lineHeightPx}px`;
    if (textStyle.letterSpacing) styles.letterSpacing = `${textStyle.letterSpacing}px`;
    if (textStyle.textAlignHorizontal) {
      const align = textStyle.textAlignHorizontal.toLowerCase();
      styles.textAlign = align === 'justified' ? 'justify' : align;
    }
  }
  
  // Text fills (color)
  if (node.type === 'TEXT' && node.fills && node.fills.length > 0) {
    const textFill = node.fills.find(f => f.visible !== false);
    if (textFill && textFill.type === 'SOLID') {
      styles.color = figmaColorToCSS(textFill.color);
    }
  }
  
  // Padding (from layout settings if available)
  if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
    const pt = node.paddingTop || 0;
    const pr = node.paddingRight || 0;
    const pb = node.paddingBottom || 0;
    const pl = node.paddingLeft || 0;
    styles.padding = `${pt}px ${pr}px ${pb}px ${pl}px`;
  }
  
  // Opacity
  if (node.opacity !== undefined && node.opacity !== 1) {
    styles.opacity = node.opacity;
  }
  
  // Visibility
  if (node.visible === false) {
    styles.display = 'none';
  }
  
  // Dimensions (for email, we'll use width/height on elements)
  if (node.absoluteBoundingBox) {
    styles.width = `${Math.round(node.absoluteBoundingBox.width)}px`;
    if (node.type !== 'TEXT') {
      styles.height = `${Math.round(node.absoluteBoundingBox.height)}px`;
    }
  }
  
  return styles;
}

/**
 * Convert styles object to CSS string
 * @param {Object} styles - Styles object
 * @returns {string} CSS string
 */
function stylesToCSS(styles) {
  return Object.entries(styles)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');
}

/**
 * Generate HTML element from Figma node (email-compatible, table-based)
 * @param {Object} node - Figma node
 * @param {number} index - Node index for unique IDs
 * @param {string} fileKey - Figma file key for image exports
 * @returns {Object} HTML element data
 */
function nodeToHtmlElement(node, index = 0, fileKey = '') {
  if (!node || node.visible === false) {
    return null;
  }
  
  const styles = extractNodeStyles(node, true);
  const cssString = stylesToCSS(styles);
  
  let element = {
    id: `figma-${node.id || `node-${index}`}`,
    type: node.type,
    styles: cssString,
    children: [],
    name: node.name || ''
  };
  
  // Handle different node types
  switch (node.type) {
    case 'TEXT':
      element.tag = 'td';
      element.content = node.characters || 'Text Content';
      element.class = 'figma-text';
      break;
      
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'POLYGON':
      // Check if it's an image
      if (isImageNode(node)) {
        element.tag = 'td';
        element.class = 'figma-image';
        const imgUrl = getImageUrl(node, fileKey);
        element.content = `<img src="${imgUrl || 'https://via.placeholder.com/400x300'}" alt="${node.name || 'Image'}" style="width:100%; height:auto; display:block;" />`;
      } else {
        element.tag = 'td';
        element.class = `figma-${node.type.toLowerCase()}`;
      }
      break;
      
    case 'FRAME':
    case 'GROUP':
    case 'SECTION':
      element.tag = 'table';
      element.class = `figma-${node.type.toLowerCase()}`;
      element.tableStyle = 'width: 100%; border-collapse: collapse;';
      
      // Process children
      if (node.children && node.children.length > 0) {
        // Sort children by Y position for proper stacking
        const sortedChildren = [...node.children].sort((a, b) => {
          const aY = a.absoluteBoundingBox?.y || 0;
          const bY = b.absoluteBoundingBox?.y || 0;
          return aY - bY;
        });
        
        element.children = sortedChildren
          .map((child, childIndex) => nodeToHtmlElement(child, childIndex, fileKey))
          .filter(child => child !== null);
      }
      break;
      
    case 'VECTOR':
    case 'BOOLEAN_OPERATION':
    case 'STAR':
    case 'LINE':
      // For vectors, try to export as image
      element.tag = 'td';
      element.class = 'figma-vector';
      const vectorUrl = `/api/figma/image/${fileKey}?ids=${node.id}&format=png`;
      element.content = `<img src="${vectorUrl}" alt="${node.name || 'Vector'}" style="width:100%; height:auto; display:block;" />`;
      break;
      
    case 'INSTANCE':
    case 'COMPONENT':
      element.tag = 'table';
      element.class = 'figma-component';
      element.tableStyle = 'width: 100%; border-collapse: collapse;';
      
      if (node.children && node.children.length > 0) {
        element.children = node.children
          .map((child, childIndex) => nodeToHtmlElement(child, childIndex, fileKey))
          .filter(child => child !== null);
      }
      break;
      
    default:
      element.tag = 'td';
      element.class = `figma-${node.type.toLowerCase()}`;
      element.content = `<!-- ${node.type}: ${node.name || 'Unnamed'} -->`;
  }
  
  return element;
}

/**
 * Generate HTML string from element data (email-compatible table structure)
 * @param {Object} element - Element data
 * @param {number} depth - Indentation depth
 * @returns {string} HTML string
 */
function elementToHtml(element, depth = 0) {
  if (!element) return '';
  
  const indent = '  '.repeat(depth);
  const attributes = [];
  
  if (element.id) attributes.push(`id="${element.id}"`);
  if (element.class) attributes.push(`class="${element.class}"`);
  
  // For tables, use separate style attribute
  const styleAttr = element.tag === 'table' && element.tableStyle 
    ? element.tableStyle 
    : element.styles;
    
  if (styleAttr) attributes.push(`style="${styleAttr}"`);
  
  const attributeString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
  
  // Handle table elements
  if (element.tag === 'table') {
    if (element.children && element.children.length > 0) {
      const rows = element.children.map((child, idx) => {
        const cellStyle = child.styles || '';
        const cellAttributes = [];
        
        if (child.class) cellAttributes.push(`class="${child.class}"`);
        if (cellStyle) cellAttributes.push(`style="${cellStyle}"`);
        
        const cellAttrString = cellAttributes.length > 0 ? ' ' + cellAttributes.join(' ') : '';
        
        // If child has children (nested table), render as nested
        if (child.children && child.children.length > 0) {
          const nestedHtml = elementToHtml(child, depth + 2);
          return `${indent}  <tr>\n${indent}    <td${cellAttrString}>\n${nestedHtml}\n${indent}    </td>\n${indent}  </tr>`;
        } else {
          const content = child.content || '';
          return `${indent}  <tr>\n${indent}    <td${cellAttrString}>${content}</td>\n${indent}  </tr>`;
        }
      }).join('\n');
      
      return `${indent}<${element.tag}${attributeString}>\n${rows}\n${indent}</${element.tag}>`;
    } else {
      return `${indent}<${element.tag}${attributeString}></${element.tag}>`;
    }
  }
  
  // Handle regular elements (td, div, etc)
  if (element.children && element.children.length > 0) {
    const childrenHtml = element.children
      .map(child => elementToHtml(child, depth + 1))
      .join('\n');
    
    return `${indent}<${element.tag}${attributeString}>\n${childrenHtml}\n${indent}</${element.tag}>`;
  } else {
    const content = element.content || '';
    if (content) {
      return `${indent}<${element.tag}${attributeString}>${content}</${element.tag}>`;
    } else {
      return `${indent}<${element.tag}${attributeString}></${element.tag}>`;
    }
  }
}

/**
 * Convert Figma page to HTML
 * @param {Object} page - Figma page data
 * @param {string} fileKey - Figma file key for image exports
 * @returns {Object} Conversion result with HTML and metadata
 */
export function convertPageToHtml(page, fileKey = '') {
  if (!page) {
    throw new Error('Invalid page data - page is null or undefined');
  }
  
  // Handle different page structures
  let children = page.children;
  if (!children) {
    // Maybe page IS the frame
    if (page.type === 'FRAME' || page.type === 'CANVAS') {
      children = [page];
    } else {
      throw new Error('No children found in page data');
    }
  }
  
  // Find the main frames or use all children
  const mainFrames = children.filter(child => 
    child && (child.type === 'FRAME' || child.type === 'SECTION') && child.visible !== false
  );
  
  if (mainFrames.length === 0) {
    console.warn('No visible frames found, trying to use all children');
    // Fallback: use all visible children
    const visibleChildren = children.filter(child => child && child.visible !== false);
    if (visibleChildren.length === 0) {
      throw new Error('No visible content found in page');
    }
    mainFrames.push(...visibleChildren);
  }
  
  console.log(`Converting ${mainFrames.length} frames to HTML...`);
  
  // Convert each frame to HTML elements
  const htmlElements = mainFrames
    .map((frame, index) => nodeToHtmlElement(frame, index, fileKey))
    .filter(el => el !== null);
  
  if (htmlElements.length === 0) {
    throw new Error('Failed to convert frames to HTML elements');
  }
  
  // Generate CSS for email compatibility
  const emailCSS = `
/* Figma to Braze Email Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  line-height: 1.6;
  background-color: #f5f5f5;
}

.email-container {
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
}

.figma-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.figma-frame, .figma-section {
  width: 100%;
  border-collapse: collapse;
}

.figma-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  padding: 10px;
}

.figma-image img, .figma-vector img {
  max-width: 100%;
  height: auto;
  display: block;
}

.figma-rectangle, .figma-ellipse, .figma-polygon {
  padding: 10px;
}

/* Responsive */
@media only screen and (max-width: 600px) {
  .email-container, .figma-container {
    width: 100% !important;
  }
  
  .figma-text {
    font-size: 14px !important;
    padding: 8px !important;
  }
}

/* Liquid template placeholders */
.liquid-placeholder {
  background: #f0f8ff;
  border: 2px dashed #4a90e2;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  color: #4a90e2;
  display: inline-block;
}
`;
  
  // Generate the full HTML (email-compatible)
  const bodyContent = htmlElements.map(element => elementToHtml(element, 1)).join('\n\n');
  
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${page.name || 'Figma Design'}</title>
  <style>
${emailCSS}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="figma-container">
${bodyContent}
    </div>
  </div>
</body>
</html>`;
  
  return {
    html: fullHtml,
    css: emailCSS,
    elements: htmlElements,
    metadata: {
      pageName: page.name,
      frameCount: mainFrames.length,
      elementCount: htmlElements.length,
      requiresImages: htmlElements.some(el => 
        el.class && (el.class.includes('figma-image') || el.class.includes('figma-vector'))
      )
    }
  };
}

/**
 * Insert Liquid templating placeholders
 * @param {string} html - Original HTML
 * @param {Array} liquidTags - Array of liquid tag definitions
 * @returns {string} HTML with liquid tags
 */
export function insertLiquidTags(html, liquidTags = []) {
  let processedHtml = html;
  
  // Common Braze liquid tags
  const defaultTags = [
    {
      placeholder: '{{first_name}}',
      description: 'User first name',
      fallback: 'there'
    },
    {
      placeholder: '{{last_name}}',
      description: 'User last name',
      fallback: ''
    },
    {
      placeholder: '{{email_address}}',
      description: 'User email address',
      fallback: 'user@example.com'
    }
  ];
  
  const tagsToProcess = [...defaultTags, ...liquidTags];
  
  // Replace text content with liquid template options
  tagsToProcess.forEach(tag => {
    const liquidSyntax = tag.fallback 
      ? `{{${tag.placeholder} | default: '${tag.fallback}'}}`
      : `{{${tag.placeholder}}}`;
    
    // Add liquid placeholder class for styling
    processedHtml = processedHtml.replace(
      new RegExp(tag.placeholder, 'g'),
      `<span class="liquid-placeholder" title="${tag.description}">${liquidSyntax}</span>`
    );
  });
  
  return processedHtml;
}

/**
 * Generate Braze-ready HTML export
 * @param {string} html - HTML with liquid tags
 * @returns {Object} Export data for Braze
 */
export function generateBrazeExport(html) {
  // Clean up the HTML for Braze compatibility
  let brazeHtml = html
    // Remove doctype and html wrapper for email campaigns
    .replace(/<!DOCTYPE html>/g, '')
    .replace(/<html[^>]*>/g, '')
    .replace(/<\/html>/g, '')
    .replace(/<head>[\s\S]*?<\/head>/g, '')
    .replace(/<body[^>]*>/g, '')
    .replace(/<\/body>/g, '')
    // Remove liquid placeholder styling classes
    .replace(/class="liquid-placeholder"[^>]*/g, '')
    .replace(/title="[^"]*"/g, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  // Extract inline styles for email compatibility
  const inlineStyles = html.match(/<style>([\s\S]*?)<\/style>/);
  const css = inlineStyles ? inlineStyles[1] : '';
  
  return {
    html: brazeHtml,
    css: css,
    type: 'email', // Can be 'email', 'push', 'in-app'
    preview: html, // Full HTML for preview
    liquidTags: extractLiquidTags(brazeHtml)
  };
}

/**
 * Extract liquid tags from HTML
 * @param {string} html - HTML string
 * @returns {Array} Array of found liquid tags
 */
function extractLiquidTags(html) {
  const liquidRegex = /\{\{([^}]+)\}\}/g;
  const tags = [];
  let match;
  
  while ((match = liquidRegex.exec(html)) !== null) {
    tags.push(match[1].trim());
  }
  
  return [...new Set(tags)]; // Remove duplicates
}