/**
 * TypeScript types for Figma API responses
 */

export interface FigmaUser {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

export interface FigmaTeam {
  id: string;
  name: string;
}

export interface FigmaProject {
  id: string;
  name: string;
}

export interface FigmaFile {
  key: string;
  name: string;
  thumbnailUrl?: string;
  thumbnail_url?: string; // Support both formats
  lastModified?: string;
  last_modified?: string; // Support both formats
  project_id?: string; // Added when fetching team files
  project_name?: string; // Added when fetching team files
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  visible?: boolean;
}

export interface FigmaFileResponse {
  document: {
    id: string;
    name: string;
    type: string;
    children: FigmaNode[];
  };
  components: Record<string, any>;
  styles: Record<string, any>;
  name: string;
  lastModified: string;
  version: string;
  thumbnailUrl?: string;
}

export interface FigmaImageResponse {
  images: Record<string, string>; // nodeId -> imageUrl
  error?: boolean;
  status?: number;
}

