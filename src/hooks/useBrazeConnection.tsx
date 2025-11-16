import { useState, useEffect } from "react";

interface BrazeConnectionState {
  isConnected: boolean;
  isChecking: boolean;
  error: string | null;
  checkConnection: () => Promise<void>;
}

/**
 * Custom hook for checking Braze connection status
 * @returns {BrazeConnectionState} Connection state and methods
 */
export function useBrazeConnection(): BrazeConnectionState {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const response = await fetch("/braze/connect");
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          setIsConnected(data.connected === true);
        } else {
          console.error("Braze response is empty");
          setIsConnected(false);
          setError("Empty response from server");
        }
      } else {
        console.error("Braze connection check failed with status:", response.status);
        setIsConnected(false);
        setError(`Server returned ${response.status}`);
      }
    } catch (err) {
      console.error("Braze connection check failed:", err);
      setIsConnected(false);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return {
    isConnected,
    isChecking,
    error,
    checkConnection
  };
}