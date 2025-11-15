import React from "react";

/**
 * Simple button that redirects to Figma's OAuth authorize endpoint.
 * It saves a random state in localStorage to verify on callback.
 */
export default function FigmaConnectButton() {
  const clientId = import.meta.env.VITE_FIGMA_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_FIGMA_REDIRECT_URI;
  const scope = "file_read"; // adjust scopes as needed

  const handleConnect = () => {
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem("figma_oauth_state", state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      response_type: "code",
    });

    const url = `https://www.figma.com/oauth?${params.toString()}`;
    window.location.href = url;
  };

  return (
    <button
      onClick={handleConnect}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Connect Figma
    </button>
  );
}