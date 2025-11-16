/**
 * Braze Upload Route
 * Handles uploading images from Figma to Braze
 */

import express from "express";
import axios from "axios";
import { getBrazeConfig } from "../services/brazeStorage.js";
import { getAuthHeaders } from "../services/brazeAuth.js";

const router = express.Router();

/**
 * POST /api/braze/upload-image
 * Upload an image from Figma to Braze
 * Body: { imageUrl: string, campaignName: string }
 */
router.post("/upload-image", async (req, res) => {
  try {
    const { imageUrl, campaignName } = req.body;

    // Validate input
    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({
        success: false,
        error: "imageUrl is required and must be a string",
      });
    }

    if (!campaignName || typeof campaignName !== "string") {
      return res.status(400).json({
        success: false,
        error: "campaignName is required and must be a string",
      });
    }

    // Check if Braze is configured
    const braze = getBrazeConfig();
    if (!braze.apiKey || !braze.endpoint) {
      return res.status(400).json({
        success: false,
        error: "Braze is not connected. Please connect your Braze account first.",
      });
    }

    // Download the image from Figma
    let imageBuffer;
    try {
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      imageBuffer = Buffer.from(imageResponse.data);
    } catch (error) {
      console.error("Error downloading image from Figma:", error);
      return res.status(400).json({
        success: false,
        error: `Failed to download image from Figma: ${error.message}`,
      });
    }

    // Convert to base64 for Braze API
    const base64Image = imageBuffer.toString("base64");
    const imageDataUri = `data:image/png;base64,${base64Image}`;

    // Upload to Braze using the Content Blocks API
    // Braze uses /content_blocks/create for uploading images
    // Note: This is a simplified implementation - adjust based on your Braze API version
    try {
      const headers = getAuthHeaders();
      
      // Try multiple Braze endpoints for image upload
      const uploadEndpoints = [
        "/content_blocks/create",
        "/api/v3/content_blocks/create",
        "/assets/upload",
        "/api/v3/assets/upload",
      ];

      let uploadSuccess = false;
      let lastError = null;

      for (const endpoint of uploadEndpoints) {
        try {
          const uploadUrl = `${braze.endpoint}${endpoint}`;
          
          // Try different payload formats
          const payloads = [
            {
              name: campaignName,
              description: `Image exported from Figma: ${campaignName}`,
              content: imageDataUri,
              content_type: "image/png",
            },
            {
              name: campaignName,
              image: imageDataUri,
            },
            {
              name: campaignName,
              file: imageDataUri,
              type: "image",
            },
          ];

          for (const payload of payloads) {
            try {
              const response = await axios.post(uploadUrl, payload, {
                headers: {
                  ...headers,
                  "Content-Type": "application/json",
                },
                validateStatus: () => true, // Don't throw on any status
              });

              // If we get 200-299, consider it success
              if (response.status >= 200 && response.status < 300) {
                uploadSuccess = true;
                return res.json({
                  success: true,
                  message: "Image uploaded to Braze successfully",
                  data: response.data,
                });
              }

              // If we get 401/403, auth failed - don't try other endpoints
              if (response.status === 401 || response.status === 403) {
                throw new Error("Invalid Braze API key - authentication failed");
              }
            } catch (payloadError) {
              lastError = payloadError;
              continue; // Try next payload format
            }
          }
        } catch (endpointError) {
          lastError = endpointError;
          continue; // Try next endpoint
        }
      }

      // If all attempts failed
      if (!uploadSuccess) {
        throw lastError || new Error("Failed to upload image to Braze - all endpoints failed");
      }
    } catch (error) {
      console.error("Error uploading to Braze:", error);
      const status = error.response?.status || 500;
      const errorData = error.response?.data || { error: error.message };

      return res.status(status).json({
        success: false,
        error: `Failed to upload image to Braze: ${error.message}`,
        details: errorData,
      });
    }
  } catch (error) {
    console.error("Error in /braze/upload-image:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * POST /api/braze/upload-template
 * Upload an HTML template to Braze as a Content Block or Email Template
 * Body: { html: string, templateName: string, type: 'content_block' | 'email_campaign' }
 */
router.post("/upload-template", async (req, res) => {
  try {
    const { html, templateName, type = 'content_block' } = req.body;

    console.log('[Upload Template] Request received:', {
      hasHtml: !!html,
      htmlLength: html?.length,
      templateName,
      type
    });

    // Validate input
    if (!html || typeof html !== "string") {
      console.error('[Upload Template] Invalid HTML:', typeof html);
      return res.status(400).json({
        success: false,
        error: "html is required and must be a string",
      });
    }

    if (!templateName || typeof templateName !== "string") {
      console.error('[Upload Template] Invalid template name:', typeof templateName);
      return res.status(400).json({
        success: false,
        error: "templateName is required and must be a string",
      });
    }

    // Sanitize template name for Braze
    // Braze only allows alphanumeric, dashes, and underscores
    const sanitizedName = templateName
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace invalid chars with underscore
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores

    console.log('[Upload Template] Sanitized name:', {
      original: templateName,
      sanitized: sanitizedName
    });

    // Check if Braze is configured
    const braze = getBrazeConfig();
    console.log('[Upload Template] Braze config:', {
      hasApiKey: !!braze.apiKey,
      hasEndpoint: !!braze.endpoint,
      endpoint: braze.endpoint
    });
    
    if (!braze.apiKey || !braze.endpoint) {
      return res.status(400).json({
        success: false,
        error: "Braze is not connected. Please connect your Braze account first.",
      });
    }

    const headers = getAuthHeaders();
    console.log('[Upload Template] Headers prepared');
    
    // Upload to Braze
    try {
      if (type === 'content_block') {
        // Create a Content Block
        const contentBlockUrl = `${braze.endpoint}/content_blocks/create`;
        console.log('[Upload Template] Creating content block at:', contentBlockUrl);
        
        const payload = {
          name: sanitizedName,
          description: `HTML template created from Figma design: ${templateName}`,
          content: html,
          content_type: "html",
          tags: ["figma", "email-template"]
        };

        const response = await axios.post(contentBlockUrl, payload, {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          validateStatus: () => true, // Don't throw, we'll handle status codes
        });

        console.log('[Upload Template] Braze response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });

        if (response.status >= 200 && response.status < 300) {
          return res.json({
            success: true,
            message: "Content block created successfully",
            data: response.data,
            sanitizedName: sanitizedName,
            originalName: templateName
          });
        } else {
          return res.status(response.status).json({
            success: false,
            error: `Braze API returned ${response.status}: ${response.statusText}`,
            details: response.data,
          });
        }
      } else {
        // For email campaigns, we'll create a template
        const templateUrl = `${braze.endpoint}/templates/email/create`;
        console.log('[Upload Template] Creating email template at:', templateUrl);
        
        const payload = {
          template_name: sanitizedName,
          subject: `Template: ${templateName}`,
          body: html,
          tags: ["figma", "email-template"]
        };

        const response = await axios.post(templateUrl, payload, {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        });

        console.log('[Upload Template] Braze response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });

        if (response.status >= 200 && response.status < 300) {
          return res.json({
            success: true,
            message: "Email template created successfully",
            data: response.data,
            sanitizedName: sanitizedName,
            originalName: templateName
          });
        } else {
          return res.status(response.status).json({
            success: false,
            error: `Braze API returned ${response.status}: ${response.statusText}`,
            details: response.data,
          });
        }
      }
    } catch (error) {
      console.error("[Upload Template] Braze API error:", error);
      const status = error.response?.status || 500;
      const errorData = error.response?.data || { error: error.message };

      return res.status(status).json({
        success: false,
        error: `Failed to upload template to Braze: ${error.message}`,
        details: errorData,
      });
    }
  } catch (error) {
    console.error("Error in /api/braze/upload-template:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export default router;

