/**
 * Figma API Routes
 * Handles all Figma API requests using Personal Access Token
 */

import express from "express";
import axios from "axios";
import { getFigmaToken, setFigmaToken, isFigmaConfigured } from "../services/figmaStorage.js";
import { getTeamProjects, getProjectFiles } from "../utils/figmaApi.js";

const router = express.Router();

const FIGMA_API_BASE = "https://api.figma.com/v1";

/**
 * Get Figma API headers with token
 * @returns {Object} Headers object
 * @throws {Error} If token is not configured
 */
function getFigmaHeaders() {
  const token = getFigmaToken();
  if (!token) {
    throw new Error("Figma token is not configured. Please set your Personal Access Token.");
  }
  return {
    "X-Figma-Token": token,
  };
}

/**
 * POST /api/local/figma-token
 * Store Figma Personal Access Token in memory
 * Body: { token: string }
 * Note: This route is mounted at /api/local, so the path is just /figma-token
 */
router.post("/figma-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string" || token.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Token is required and must be a non-empty string",
      });
    }

    // Store token in memory
    setFigmaToken(token.trim());

    return res.json({
      success: true,
      message: "Figma token stored successfully",
    });
  } catch (error) {
    console.error("Error storing Figma token:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * GET /api/figma/me
 * Get current user info to verify token
 */
router.get("/me", async (req, res) => {
  try {
    const headers = getFigmaHeaders();
    const response = await axios.get(`${FIGMA_API_BASE}/me`, { headers });
    return res.json(response.data);
  } catch (error) {
    console.error("Figma /me error:", error.response?.data || error.message);
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { error: error.message };
    return res.status(status).json(errorData);
  }
});


/**
 * GET /api/figma/files
 * List all files the user can access
 * Query param: teamId (optional) - if provided, only fetch files from that team
 * Fetches projects → files and aggregates into a single list
 */
router.get("/files", async (req, res) => {
  try {
    const { teamId } = req.query;
    const token = getFigmaToken();
    
    if (!token) {
      return res.status(401).json({ error: "Figma token is not configured. Please set your Personal Access Token." });
    }
    
    // If teamId is provided, use the team-specific endpoint logic
    if (teamId) {
      try {
        const projects = await getTeamProjects(teamId, token);
        const allFiles = [];
        
        for (const project of projects) {
          try {
            const files = await getProjectFiles(project.id, token);
            const filesWithProject = files.map(file => ({
              ...file,
              project_id: project.id,
              project_name: project.name,
            }));
            allFiles.push(...filesWithProject);
          } catch (projectError) {
            console.warn(`Failed to fetch files for project ${project.id}:`, projectError.message);
          }
        }
        
        return res.json({ files: allFiles, teamId });
      } catch (error) {
        console.error("Figma /files error:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        
        if (status === 401 || status === 403) {
          return res.status(401).json({ error: "Invalid Figma token" });
        }
        
        const errorData = error.response?.data || { error: error.message };
        return res.status(status).json(errorData);
      }
    }
    
    // If no teamId provided, return error asking for teamId
    return res.status(400).json({ 
      error: "teamId query parameter is required. Use /api/figma/files?teamId=YOUR_TEAM_ID" 
    });
  } catch (error) {
    console.error("Figma /files error:", error.response?.data || error.message);
    const status = error.response?.status || 500;
    
    if (status === 401 || status === 403) {
      return res.status(401).json({ error: "Invalid Figma token" });
    }
    
    const errorData = error.response?.data || { error: error.message };
    return res.status(status).json(errorData);
  }
});

/**
 * GET /api/figma/file/:fileKey
 * Get file details (name, document, pages, components, thumbnail, lastModified)
 */
router.get("/file/:fileKey", async (req, res) => {
  try {
    const { fileKey } = req.params;
    if (!fileKey) {
      return res.status(400).json({ error: "fileKey is required" });
    }

    const headers = getFigmaHeaders();
    const response = await axios.get(
      `${FIGMA_API_BASE}/files/${fileKey}`,
      { headers }
    );
    
    const data = response.data;
    
    // Extract pages from document
    const pages = data.document?.children || [];
    
    // Extract components (if available in the response)
    const components = data.components || {};
    
    // Get thumbnail (Figma API may use thumbnailUrl or thumbnail_url)
    const thumbnail = data.thumbnailUrl || data.thumbnail_url || null;
    
    // Return only the requested fields
    return res.json({
      name: data.name,
      document: data.document,
      pages: pages,
      components: components,
      thumbnail: thumbnail,
      lastModified: data.lastModified || null,
    });
  } catch (error) {
    console.error("Figma /file/:fileKey error:", error.response?.data || error.message);
    const status = error.response?.status || 500;
    
    // Handle invalid token
    if (status === 401 || status === 403) {
      return res.status(401).json({ error: "Invalid Figma token" });
    }
    
    const errorData = error.response?.data || { error: error.message };
    return res.status(status).json(errorData);
  }
});

/**
 * GET /api/figma/image/:fileKey
 * Export frames/components as PNG
 * Query params: ids (comma-separated node IDs), format (default: png), scale (optional)
 */
router.get("/image/:fileKey", async (req, res) => {
  try {
    const { fileKey } = req.params;
    const { ids, format = "png", scale } = req.query;

    if (!fileKey) {
      return res.status(400).json({ error: "fileKey is required" });
    }

    if (!ids) {
      return res.status(400).json({ error: "ids query parameter is required" });
    }

    const headers = getFigmaHeaders();
    const params = new URLSearchParams({
      ids: ids,
      format: format,
    });

    if (scale) {
      params.append("scale", scale);
    }

    const response = await axios.get(
      `${FIGMA_API_BASE}/images/${fileKey}?${params.toString()}`,
      { headers }
    );
    return res.json(response.data);
  } catch (error) {
    console.error("Figma /image/:fileKey error:", error.response?.data || error.message);
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { error: error.message };
    return res.status(status).json(errorData);
  }
});

/**
 * GET /api/figma/status
 * Check if Figma token is configured
 */
router.get("/status", (req, res) => {
  res.json({
    configured: isFigmaConfigured(),
  });
});

/**
 * GET /api/figma/team/extract-id
 * Extract team ID from Figma team URL
 * Query param: url
 */
router.get("/team/extract-id", (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "url query parameter is required" });
    }
    
    const match = url.match(/team\/(\d+)/);
    
    if (!match) {
      return res.status(400).json({ error: "Invalid team URL. Expected format: https://www.figma.com/files/team/1234567890/..." });
    }
    
    const teamId = match[1];
    return res.json({ teamId });
  } catch (error) {
    console.error("Error extracting team ID:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

/**
 * GET /api/figma/team/:teamId/files
 * Get all files for a team
 * Fetches projects → files and flattens into a single array
 */
router.get("/team/:teamId/files", async (req, res) => {
  try {
    const { teamId } = req.params;
    
    if (!teamId) {
      return res.status(400).json({ error: "teamId is required" });
    }
    
    const token = getFigmaToken();
    if (!token) {
      return res.status(401).json({ error: "Figma token is not configured. Please set your Personal Access Token." });
    }
    
    // Get all projects for the team
    const projects = await getTeamProjects(teamId, token);
    
    // Get all files for each project
    const allFiles = [];
    for (const project of projects) {
      try {
        const files = await getProjectFiles(project.id, token);
        // Add project information to each file
        const filesWithProject = files.map(file => ({
          ...file,
          project_id: project.id,
          project_name: project.name,
        }));
        allFiles.push(...filesWithProject);
      } catch (projectError) {
        // Log but continue - some projects might not be accessible
        console.warn(`Failed to fetch files for project ${project.id}:`, projectError.message);
      }
    }
    
    return res.json({
      teamId,
      projects,
      files: allFiles,
    });
  } catch (error) {
    console.error("Figma /team/:teamId/files error:", error.response?.data || error.message);
    const status = error.response?.status || 500;
    
    // Handle invalid token
    if (status === 401 || status === 403) {
      return res.status(401).json({ error: "Invalid Figma token" });
    }
    
    const errorData = error.response?.data || { error: error.message };
    return res.status(status).json(errorData);
  }
});

export default router;

