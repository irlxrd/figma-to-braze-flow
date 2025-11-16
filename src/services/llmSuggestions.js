/**
 * LLM Service for Liquid Tag Suggestions
 * Analyzes HTML content and suggests appropriate liquid tags
 */

/**
 * Analyze HTML and get liquid tag suggestions from LLM
 * @param {string} html - The HTML content to analyze
 * @param {Array} existingTags - Already added liquid tags
 * @returns {Promise<Array>} Array of suggested liquid tags
 */
export async function getLiquidTagSuggestions(html, existingTags = []) {
  try {
    const response = await fetch('/api/llm/suggest-liquid-tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        existingTags,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get suggestions');
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('LLM suggestion error:', error);
    throw error;
  }
}

/**
 * Parse HTML and extract text content for analysis
 * @param {string} html - HTML content
 * @returns {string} Extracted text content
 */
export function extractTextFromHtml(html) {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove script and style tags
  const scripts = tempDiv.getElementsByTagName('script');
  const styles = tempDiv.getElementsByTagName('style');
  
  for (let i = scripts.length - 1; i >= 0; i--) {
    scripts[i].remove();
  }
  
  for (let i = styles.length - 1; i >= 0; i--) {
    styles[i].remove();
  }
  
  // Get text content
  return tempDiv.textContent || tempDiv.innerText || '';
}
