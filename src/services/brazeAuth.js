/**
 * Braze Authentication Module
 * Provides authentication headers for all Braze API requests
 */

import { getBrazeConfig } from "./brazeStorage.js";

/**
 * Get authentication headers for Braze API requests
 * @returns {Object} Headers object with Authorization Bearer token and Content-Type
 * @throws {Error} If API key is not configured
 */
export function getAuthHeaders() {
  const braze = getBrazeConfig();
  const apiKey = braze.apiKey || process.env.BRAZE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Braze API key is not configured. Please connect your Braze account."
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

