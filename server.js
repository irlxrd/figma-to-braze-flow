/**
 * Server Entry Point
 * Starts the Express server
 */

import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Braze API endpoint: ${process.env.BRAZE_REST_ENDPOINT}`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test/braze-auth`);
});

