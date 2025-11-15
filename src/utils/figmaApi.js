/**
 * Figma API Helper Functions
 * Utility functions for making Figma API requests
 */

import axios from "axios";

const FIGMA_API_BASE = "https://api.figma.com/v1";

/**
 * Get Figma API headers with token
 * @param {string} token - Figma Personal Access Token
 * @returns {Object} Headers object
 */
function getFigmaHeaders(token) {
  return {
    "X-Figma-Token": token,
  };
}

/**
 * Get all projects for a team
 * @param {string} teamId - Figma team ID
 * @param {string} token - Figma Personal Access Token
 * @returns {Promise<Array>} Array of projects
 */
export async function getTeamProjects(teamId, token) {
  const headers = getFigmaHeaders(token);
  const response = await axios.get(
    `${FIGMA_API_BASE}/teams/${teamId}/projects`,
    { headers }
  );
  return response.data?.projects || [];
}

/**
 * Get all files for a project
 * @param {string} projectId - Figma project ID
 * @param {string} token - Figma Personal Access Token
 * @returns {Promise<Array>} Array of files
 */
export async function getProjectFiles(projectId, token) {
  const headers = getFigmaHeaders(token);
  const response = await axios.get(
    `${FIGMA_API_BASE}/projects/${projectId}/files`,
    { headers }
  );
  return response.data?.files || [];
}

