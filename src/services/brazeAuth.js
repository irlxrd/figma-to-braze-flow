/**
 * Braze Authentication Module
 * Provides authentication headers for all Braze API requests
 */

/**
 * Get authentication headers for Braze API requests
 * @returns {Object} Headers object with Authorization Bearer token and Content-Type
 * @throws {Error} If BRAZE_API_KEY is not defined
 */
export function getAuthHeaders() {
  const apiKey = process.env.BRAZE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "BRAZE_API_KEY is not defined. Please set it in your environment variables."
    );
  }

  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // Debug: Log the header format (without exposing the full key)
  console.log("[Auth] Using Authorization header:", `Bearer ${apiKey.substring(0, 8)}...`);

  return headers;
}

