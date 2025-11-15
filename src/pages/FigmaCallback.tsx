import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Figma OAuth callback page.
 * - Verifies state
 * - Posts code to backend at VITE_FIGMA_BACKEND/api/figma/token
 * - Stores the returned access token in localStorage (example)
 */
export default function FigmaCallback() {
  const [status, setStatus] = useState("processing");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const localState = localStorage.getItem("figma_oauth_state");

    if (!code || !state || state !== localState) {
      setStatus("invalid_state_or_missing_code");
      return;
    }

    const backend = import.meta.env.VITE_FIGMA_BACKEND || "";
    const exchange = async () => {
      try {
        const res = await fetch(`${backend}/api/figma/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirect_uri: window.location.origin + "/figma-callback",
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Exchange failed: ${res.status}`);
        }
        const data = await res.json();
        localStorage.setItem("figma_access_token", JSON.stringify(data));
        setStatus("success");
        setTimeout(() => navigate("/connection"), 1000);
      } catch (err) {
        console.error(err);
        setStatus("exchange_error");
      }
    };

    exchange();
  }, [navigate]);

  return (
    <div className="p-6">
      {status === "processing" && <p>Authorizing with Figma…</p>}
      {status === "success" && <p>Figma connected! Redirecting…</p>}
      {status === "invalid_state_or_missing_code" && (
        <p>Invalid state or missing code. Try connecting again.</p>
      )}
      {status === "exchange_error" && (
        <p>There was a problem exchanging the code for a token.</p>
      )}
    </div>
  );
}