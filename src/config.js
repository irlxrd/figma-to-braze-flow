/**
 * Application Configuration
 * Validates and exports environment variables
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required Braze configuration
const BRAZE_API_KEY = process.env.BRAZE_API_KEY;
const BRAZE_REST_ENDPOINT = process.env.BRAZE_REST_ENDPOINT;

if (!BRAZE_API_KEY) {
  throw new Error(
    "BRAZE_API_KEY is required. Please set it in your .env file or environment variables."
  );
}

if (!BRAZE_REST_ENDPOINT) {
  throw new Error(
    "BRAZE_REST_ENDPOINT is required. Please set it in your .env file or environment variables."
  );
}

export const config = {
  braze: {
    apiKey: BRAZE_API_KEY,
    restEndpoint: BRAZE_REST_ENDPOINT,
  },
};

