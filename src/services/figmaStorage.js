/**
 * Figma Storage
 * Reads Figma Personal Access Token from environment variables (.env file)
 * Falls back to in-memory storage for runtime updates
 */

let figma = {
  token: null,
};

/**
 * Get the current Figma configuration
 * @returns {Object} Current figma config
 */
export function getFigmaConfig() {
  return figma;
}

/**
 * Set Figma Personal Access Token (runtime override)
 * @param {string} token - Figma PAT
 */
export function setFigmaToken(token) {
  figma.token = token;
  // Also set in process.env for this session
  process.env.FIGMA_TOKEN = token;
}

/**
 * Get Figma token (from .env file first, then memory)
 * @returns {string|null} Figma token
 */
export function getFigmaToken() {
  // Priority: .env file > in-memory storage
  return process.env.FIGMA_TOKEN || figma.token || null;
}

/**
 * Check if Figma is configured
 * @returns {boolean} True if token is set
 */
export function isFigmaConfigured() {
  return getFigmaToken() !== null;
}

/**
 * Clear Figma configuration
 */
export function clearFigmaConfig() {
  figma.token = null;
  delete process.env.FIGMA_TOKEN;
}

