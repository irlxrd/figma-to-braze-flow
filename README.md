
## Project info

**URL**: https://lovable.dev/projects/fecc280c-0316-49f7-94db-becc99ae4c78

## Environment Setup

Before running the app, create a `.env` file in the project root with the following variables:

### Required Variables

```env
# Figma Integration (Frontend)
VITE_FIGMA_CLIENT_ID=your_figma_client_id
VITE_FIGMA_REDIRECT_URI=http://localhost:8081/figma-callback
VITE_FIGMA_BACKEND=http://localhost:3000

# Figma Personal Access Token (Backend)
# Get from: https://www.figma.com/developers/api#access-tokens
FIGMA_TOKEN=your_figma_personal_access_token

# Figma OAuth (Backend - if using OAuth flow)
FIGMA_CLIENT_ID=your_figma_oauth_client_id
FIGMA_CLIENT_SECRET=your_figma_oauth_client_secret
```

### Optional Variables

```env
# Braze Integration (for uploading templates)
# Leave commented if you only want to convert designs to HTML
BRAZE_API_KEY=your_braze_api_key
BRAZE_REST_ENDPOINT=https://rest.iad-01.braze.com

# LLM Configuration (for AI-powered Liquid tag suggestions)
# Supported providers: OpenAI, Featherless AI, or any OpenAI-compatible API
LLM_API_KEY=your_llm_api_key
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini

# Server Port (defaults to 3000 if not set)
PORT=3000
```

### Getting API Keys

1. **Figma Personal Access Token**: 
   - Go to [Figma Settings > Personal Access Tokens](https://www.figma.com/developers/api#access-tokens)
   - Generate a new token with file read permissions

2. **Figma OAuth** (optional, for multi-user apps):
   - Create an app in [Figma Developer Portal](https://www.figma.com/developers/apps)
   - Get Client ID and Client Secret

3. **Braze** (optional):
   - Get your API key from Braze Dashboard > Settings > API Keys
   - Find your REST endpoint based on your [Braze instance](https://www.braze.com/docs/api/basics/#endpoints)

4. **LLM Provider** (optional):
   - OpenAI: Get key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Featherless AI: Get key from [Featherless Dashboard](https://featherless.ai/)

### Minimal Setup (Just Figma → HTML conversion)

If you only want to convert Figma designs to HTML without Braze upload or AI features:

```env
VITE_FIGMA_CLIENT_ID=your_figma_client_id
VITE_FIGMA_REDIRECT_URI=http://localhost:8081/figma-callback
VITE_FIGMA_BACKEND=http://localhost:3000
FIGMA_TOKEN=your_figma_personal_access_token
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fecc280c-0316-49f7-94db-becc99ae4c78) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create a .env file (see Environment Setup section above)
cp .env.example .env
# Edit .env with your API keys

# Step 5: Start the backend server (in one terminal)
node server.js

# Step 6: Start the frontend development server (in another terminal)
npm run dev
```

The app will be available at:
- Frontend: http://localhost:8081
- Backend API: http://localhost:3000

## Usage

### Basic Workflow

1. **Connect to Braze**:
   - **Important**: Connect to Braze FIRST before working with Figma designs
   - Go to the Braze connection page in the app
   - Enter your Braze API Key and REST Endpoint
   - The app will validate your credentials
   - This step is required even if you have `BRAZE_API_KEY` in your `.env` file
2. **Connect to Figma**: Click "Connect to Figma" and authorize the app to access your Figma files
3. **Select a Design**: Browse your team files and select the design you want to convert
4. **Convert to HTML**: The app will convert your Figma design to email-compatible HTML
5. **Edit & Add Liquid Tags** (optional): Use the HTML editor to customize and add Braze Liquid tags
   - You can manually add Liquid tags or use the AI suggestion feature (if LLM is configured)
6. **Upload to Braze**: Upload your HTML template as a Content Block or Email Template


**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/fecc280c-0316-49f7-94db-becc99ae4c78) and click on Share -> Publish.

