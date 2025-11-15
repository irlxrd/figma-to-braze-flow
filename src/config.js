/**
 * Application Configuration
 * Validates and exports environment variables
 * NOTE: For localhost testing, Braze credentials can be set via in-memory storage
 * instead of environment variables
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get Braze configuration from environment (optional for localhost testing)
const BRAZE_API_KEY = process.env.BRAZE_API_KEY;
const BRAZE_REST_ENDPOINT = process.env.BRAZE_REST_ENDPOINT;

// Don't throw errors if env vars are missing - allow in-memory storage instead
export const config = {
  braze: {
    apiKey: BRAZE_API_KEY || null,
    restEndpoint: BRAZE_REST_ENDPOINT || null,
  },
};

