/**
 * Figma to HTML Conversion Service
 * Converts Figma design data to HTML with CSS styling
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
 * Extract CSS styles from Figma node
 * @param {Object} node - Figma node
 * @returns {Object} CSS styles object
 */
function extractNodeStyles(node) {
  const styles = {};
  
  // Dimensions
  if (node.absoluteBoundingBox) {
    styles.width = `${Math.round(node.absoluteBoundingBox.width)}px`;
    styles.height = `${Math.round(node.absoluteBoundingBox.height)}px`;
    styles.position = 'absolute';
    styles.left = `${Math.round(node.absoluteBoundingBox.x)}px`;
    styles.top = `${Math.round(node.absoluteBoundingBox.y)}px`;
  }
  
  // Background fills
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0]; // Use first fill
    if (fill.type === 'SOLID') {
      styles.backgroundColor = figmaColorToCSS(fill.color);
    } else if (fill.type === 'GRADIENT_LINEAR') {
      styles.background = figmaGradientToCSS(fill.gradientStops, fill.gradientHandlePositions);
    }
  }
  
  // Border radius
  if (node.cornerRadius) {
    styles.borderRadius = `${node.cornerRadius}px`;
  }
  
  // Strokes (borders)
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    styles.border = `${node.strokeWeight || 1}px solid ${figmaColorToCSS(stroke.color)}`;
  }
  
  // Typography for text nodes
  if (node.type === 'TEXT' && node.style) {
    const textStyle = node.style;
    if (textStyle.fontSize) styles.fontSize = `${textStyle.fontSize}px`;
    if (textStyle.fontFamily) styles.fontFamily = textStyle.fontFamily;
    if (textStyle.fontWeight) styles.fontWeight = textStyle.fontWeight;
    if (textStyle.lineHeightPx) styles.lineHeight = `${textStyle.lineHeightPx}px`;
    if (textStyle.letterSpacing) styles.letterSpacing = `${textStyle.letterSpacing}px`;
    if (textStyle.textAlignHorizontal) {
      styles.textAlign = textStyle.textAlignHorizontal.toLowerCase();
    }
  }
  
  // Text fills (color)
  if (node.type === 'TEXT' && node.fills && node.fills.length > 0) {
    styles.color = figmaColorToCSS(node.fills[0].color);
  }
  
  // Opacity
  if (node.opacity !== undefined && node.opacity !== 1) {
    styles.opacity = node.opacity;
  }
  
  // Visibility
  if (node.visible === false) {
    styles.display = 'none';
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
 * Generate HTML element from Figma node
 * @param {Object} node - Figma node
 * @param {number} index - Node index for unique IDs
 * @returns {Object} HTML element data
 */
function nodeToHtmlElement(node, index = 0) {
  const styles = extractNodeStyles(node);
  const cssString = stylesToCSS(styles);
  
  let element = {
    id: `figma-${node.id || `node-${index}`}`,
    type: node.type,
    styles: cssString,
    children: []
  };
  
  // Handle different node types
  switch (node.type) {
    case 'TEXT':
      element.tag = 'div';
      element.content = node.characters || 'Text Content';
      element.class = 'figma-text';
      break;
      
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'POLYGON':
      element.tag = 'div';
      element.class = `figma-${node.type.toLowerCase()}`;
      break;
      
    case 'FRAME':
    case 'GROUP':
      element.tag = 'div';
      element.class = `figma-${node.type.toLowerCase()}`;
      // Process children
      if (node.children && node.children.length > 0) {
        element.children = node.children.map((child, childIndex) => 
          nodeToHtmlElement(child, childIndex)
        );
      }
      break;
      
    case 'VECTOR':
      element.tag = 'div';
      element.class = 'figma-vector';
      element.content = '<!-- Vector graphics would need SVG conversion -->';
      break;
      
    default:
      element.tag = 'div';
      element.class = `figma-${node.type.toLowerCase()}`;
      element.content = `<!-- ${node.type} -->`;
  }
  
  return element;
}

/**
 * Generate HTML string from element data
 * @param {Object} element - Element data
 * @param {number} depth - Indentation depth
 * @returns {string} HTML string
 */
function elementToHtml(element, depth = 0) {
  const indent = '  '.repeat(depth);
  const attributes = [];
  
  if (element.id) attributes.push(`id="${element.id}"`);
  if (element.class) attributes.push(`class="${element.class}"`);
  if (element.styles) attributes.push(`style="${element.styles}"`);
  
  const attributeString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
  
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
 * @returns {Object} Conversion result with HTML and metadata
 */
export function convertPageToHtml(page) {
  if (!page || !page.children) {
    throw new Error('Invalid page data');
  }
  
  // Find the main frame or use all children
  const mainFrames = page.children.filter(child => 
    child.type === 'FRAME' && child.visible !== false
  );
  
  if (mainFrames.length === 0) {
    throw new Error('No visible frames found in page');
  }
  
  // Convert each frame to HTML elements
  const htmlElements = mainFrames.map((frame, index) => 
    nodeToHtmlElement(frame, index)
  );
  
  // Generate CSS for responsive design
  const responsiveCSS = `
/* Figma Design Styles */
.figma-container {
  position: relative;
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.figma-frame {
  position: relative;
  width: 100%;
}

.figma-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.figma-rectangle, .figma-ellipse, .figma-polygon {
  display: block;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .figma-container {
    padding: 10px;
  }
  
  .figma-text {
    font-size: 14px !important;
  }
}

/* Liquid template placeholders */
.liquid-placeholder {
  background: #f0f8ff;
  border: 2px dashed #4a90e2;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  color: #4a90e2;
  min-height: 20px;
}
`;
  
  // Generate the full HTML
  const bodyContent = htmlElements.map(element => elementToHtml(element)).join('\n\n');
  
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name || 'Figma Design'}</title>
  <style>
${responsiveCSS}
  </style>
</head>
<body>
  <div class="figma-container">
${bodyContent}
  </div>
</body>
</html>`;
  
  return {
    html: fullHtml,
    css: responsiveCSS,
    elements: htmlElements,
    metadata: {
      pageName: page.name,
      frameCount: mainFrames.length,
      elementCount: htmlElements.length
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