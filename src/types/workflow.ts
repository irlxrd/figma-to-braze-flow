export interface FigmaFile {
  id: string;
  name: string;
  thumbnail: string;
  lastModified: string;
  frames?: FigmaFrame[];
}

export interface FigmaFrame {
  id: string;
  name: string;
  thumbnail: string;
}

export type CampaignType = "in-app" | "email" | "push" | "content-block";

export interface ExtractedFields {
  headline: string;
  subtext: string;
  ctaText: string;
  imageUrl: string;
}

export interface WorkflowState {
  figmaConnected: boolean;
  brazeConnected: boolean;
  selectedFile?: FigmaFile;
  selectedFrame?: FigmaFrame;
  campaignType?: CampaignType;
  extractedFields?: ExtractedFields;
  triggerType?: string;
}
