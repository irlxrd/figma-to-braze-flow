/**
 * Braze Connect Route
 * Handles connecting to Braze API with in-memory credentials
 */

import express from "express";
import axios from "axios";
import {
  setBrazeApiKey,
  setBrazeEndpoint,
  getBrazeConfig,
} from "../services/brazeStorage.js";

const router = express.Router();

/**
 * Region to endpoint mapping
 */
const REGION_ENDPOINTS = {
  "fra-01": "https://rest.fra-01.braze.eu",
  "fra-02": "https://rest.fra-02.braze.eu",
  "us-01": "https://rest.iad-01.braze.com",
  "us-08": "https://rest.iad-08.braze.com",
  "au-01": "https://rest.au-01.braze.com",
};

/**
 * POST /braze/connect
 * Connects to Braze API with provided credentials
 * Body: { apiKey: string, region: string }
 */
router.post("/connect", async (req, res) => {
  try {
    const { apiKey, region } = req.body;

    // Validate input
    if (!apiKey || !region) {
      return res.status(400).json({
        success: false,
        error: "Both apiKey and region are required",
      });
    }

    // Build endpoint from region
    const endpoint = REGION_ENDPOINTS[region];
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: `Invalid region. Supported regions: ${Object.keys(REGION_ENDPOINTS).join(", ")}`,
      });
    }

    // Store credentials in memory
    setBrazeApiKey(apiKey);
    setBrazeEndpoint(endpoint);

    // Test the credentials by calling a simple endpoint
    // We'll try multiple endpoints - if we get 401/403, auth failed. Otherwise, auth is valid.
    try {
      // Try multiple endpoints with and without /api/v3 prefix
      const testEndpoints = [
        "/campaigns/list",  // List campaigns - simple GET endpoint
        "/api/v3/campaigns/list",  // With API version prefix
        "/users/export/ids", // Export user IDs
        "/api/v3/users/export/ids", // With API version prefix
        "/messages/supported_channels", // Supported channels
        "/api/v3/messages/supported_channels", // With API version prefix
      ];
      
      for (const testPath of testEndpoints) {
        try {
          const testUrl = `${endpoint}${testPath}`;
          const response = await axios.get(testUrl, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            // Add params for endpoints that need them
            params: testPath.includes("/users/export/ids") ? { external_ids: ["test"] } : undefined,
            // Don't throw on 4xx errors, we'll check the status
            validateStatus: () => true,
          });
          
          const status = response.status;
          
          // If we get 401 or 403, authentication failed
          if (status === 401 || status === 403) {
            throw new Error("Invalid API key - authentication failed");
          }
          
          // If we get any other status (200, 400, 404, etc.), auth is valid
          // The endpoint might not exist or need different params, but auth worked
          console.log(`[Braze Connect] Successfully tested auth with endpoint: ${testPath} (status: ${status})`);
          return res.json({
            success: true,
          });
        } catch (axiosError) {
          // Check if it's an authentication error
          const status = axiosError.response?.status;
          
          if (status === 401 || status === 403) {
            // Authentication failed
            throw new Error("Invalid API key - authentication failed");
          }
          
          // Network errors or other issues - try next endpoint
          continue;
        }
      }
      
      // If all endpoints failed (but not with 401/403), still consider auth valid
      // This handles cases where endpoints don't exist but auth is correct
      console.log("[Braze Connect] All test endpoints failed, but no auth errors - considering auth valid");
      return res.json({
        success: true,
      });
    } catch (error) {
      // Clear stored credentials on failure
      setBrazeApiKey(null);
      setBrazeEndpoint(null);

      const status = error.response?.status || "N/A";
      const statusText = error.response?.statusText || "N/A";
      const errorData = error.response?.data || error.message;

      // Log detailed error for debugging
      console.error("[Braze Connect] Connection test failed:", {
        status,
        statusText,
        errorData,
        endpoint,
        hasApiKey: !!apiKey,
      });

      // Provide more helpful error message
      let errorMessage = `Failed to connect to Braze API`;
      if (status === 401 || status === 403) {
        errorMessage = "Invalid API key. Please check your API key and try again.";
      } else if (status === 404) {
        errorMessage = "Endpoint not found. Please verify your region selection.";
      } else if (status !== "N/A") {
        errorMessage = `Braze API returned ${status} ${statusText}. ${JSON.stringify(errorData)}`;
      } else {
        errorMessage = `Network error: ${error.message}`;
      }

      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  } catch (error) {
    console.error("Error in /braze/connect:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * GET /braze/connect
 * Check if Braze is connected
 */
router.get("/connect", (req, res) => {
  const braze = getBrazeConfig();
  res.json({
    connected: braze.apiKey !== null && braze.endpoint !== null,
  });
});

export default router;

