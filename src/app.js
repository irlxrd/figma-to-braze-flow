/**
 * Express Application Setup
 * Main server file for the backend API
 */

import express from "express";
import cors from "cors";
import "./config.js"; // Load and validate config
import brazeAuthTestRouter from "./routes/brazeAuthTest.js";
import brazeConnectRouter from "./routes/brazeConnect.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Register routes
app.use("/test", brazeAuthTestRouter);
app.use("/braze", brazeConnectRouter);

// Root route - API information
app.get("/", (req, res) => {
  res.json({
    message: "Figma to Braze Flow API",
    version: "1.0.0",
    endpoints: {
      health: {
        method: "GET",
        path: "/health",
        description: "Health check endpoint",
      },
      brazeAuthTest: {
        method: "GET",
        path: "/test/braze-auth",
        description: "Test Braze API authentication",
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;

