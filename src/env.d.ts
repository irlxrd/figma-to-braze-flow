interface ImportMetaEnv {
  readonly VITE_FIGMA_CLIENT_ID: string;
  readonly VITE_FIGMA_REDIRECT_URI: string;
  readonly VITE_FIGMA_BACKEND?: string;
  // add other VITE_ variables you use here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}