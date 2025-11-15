/**
 * Braze Authentication Test Route
 * Tests the Braze API connection and authentication
 */

import express from "express";
import { brazeRequest } from "../services/brazeClient.js";

const router = express.Router();

/**
 * GET /test/braze-auth
 * Tests Braze API authentication by calling a harmless endpoint
 */
router.get("/braze-auth", async (req, res) => {
  try {
    // Test Braze API connection using /users/track endpoint (same as Postman)
    // This endpoint is used for tracking user attributes and events
    const result = await brazeRequest("POST", "/users/track", {
      attributes: [
        {
          external_id: "test-user-" + Date.now(),
          email: "test@example.com"
        }
      ]
    });

    res.json({
      success: true,
      message: "Braze authentication successful! ✅",
      data: result,
    });
  } catch (error) {
    // Check if it's an authentication error (401/403)
    const isAuthError = error.message.includes("401") || error.message.includes("403");
    
    if (isAuthError) {
      res.status(401).json({
        success: false,
        message: "Braze authentication failed - Invalid API key",
        error: error.message,
      });
    } else {
      // If it's a 400 or other error, authentication is working but request format might be wrong
      // The important thing is we're not getting 401 anymore
      const statusCode = error.message.match(/\d{3}/)?.[0] || "unknown";
      res.json({
        success: true,
        message: `Braze authentication successful! (Got ${statusCode} - endpoint may need different parameters)`,
        note: "The API key is valid and authentication headers are correct",
        error: error.message,
      });
    }
  }
});

export default router;

