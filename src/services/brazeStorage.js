/**
 * In-Memory Braze Storage
 * Stores Braze credentials in memory for localhost testing only
 * NO database, NO .env, NO permanent storage
 */

let braze = {
  apiKey: null,
  endpoint: null,
};

/**
 * Get the current Braze configuration
 * @returns {Object} Current braze config
 */
export function getBrazeConfig() {
  return braze;
}

/**
 * Set Braze API key
 * @param {string} apiKey - Braze API key
 */
export function setBrazeApiKey(apiKey) {
  braze.apiKey = apiKey;
}

/**
 * Set Braze endpoint
 * @param {string} endpoint - Braze REST endpoint
 */
export function setBrazeEndpoint(endpoint) {
  braze.endpoint = endpoint;
}

/**
 * Check if Braze is configured
 * @returns {boolean} True if both apiKey and endpoint are set
 */
export function isBrazeConfigured() {
  return braze.apiKey !== null && braze.endpoint !== null;
}

/**
 * Clear Braze configuration
 */
export function clearBrazeConfig() {
  braze.apiKey = null;
  braze.endpoint = null;
}

