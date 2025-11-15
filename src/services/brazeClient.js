/**
 * Braze API Client
 * Wrapper for making authenticated requests to Braze REST API
 */

import axios from "axios";
import { getAuthHeaders } from "./brazeAuth.js";
import { getBrazeConfig } from "./brazeStorage.js";

/**
 * Make an authenticated request to Braze API
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} path - API path (e.g., "/messages/supported_channels")
 * @param {Object|null} body - Request body (optional, for POST/PUT requests)
 * @returns {Promise<Object>} Braze API response data
 * @throws {Error} If request fails or configuration is missing
 */
export async function brazeRequest(method, path, body = null) {
  const braze = getBrazeConfig();
  const endpoint = braze.endpoint || process.env.BRAZE_REST_ENDPOINT;

  // Validate configuration
  if (!endpoint) {
    throw new Error(
      "Braze endpoint is not configured. Please connect your Braze account."
    );
  }

  // Build full URL
  const url = `${endpoint}${path}`;

  // Get authentication headers
  const headers = getAuthHeaders();

  // Log request for debugging
  console.log(`[Braze] ${method} ${path}`);

  try {
    const config = {
      method,
      url,
      headers,
    };

    // Add body for POST/PUT requests
    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      config.data = body;
    }

    const response = await axios(config);

    // Log success
    console.log(`[Braze] ${method} ${path} - Status: ${response.status}`);

    return response.data;
  } catch (error) {
    // Extract error details
    const status = error.response?.status || "N/A";
    const statusText = error.response?.statusText || "N/A";
    const errorData = error.response?.data || error.message;

    // Log error
    console.error(`[Braze] ${method} ${path} - Error ${status}: ${statusText}`);
    console.error(`[Braze] Error details:`, errorData);

    // Throw formatted error
    throw new Error(
      `Braze API request failed: ${method} ${path} - ${status} ${statusText}. ${JSON.stringify(errorData)}`
    );
  }
}

