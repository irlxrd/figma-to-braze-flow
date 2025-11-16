import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useBrazeConnection } from "@/hooks/useBrazeConnection";
import { BrazeConnectionWarning } from "./BrazeConnectionWarning";

interface BrazeProtectedProps {
  children: ReactNode;
  /** Custom loading message */
  loadingMessage?: string;
  /** Back path for the warning component */
  backPath?: string;
  /** Back button text for the warning component */
  backText?: string;
  /** Custom message for the warning component */
  warningMessage?: string;
}

/**
 * Component wrapper that protects content requiring Braze connection
 * Shows loading state while checking, warning if not connected, or renders children if connected
 */
export function BrazeProtected({ 
  children, 
  loadingMessage = "Checking Braze connection...",
  backPath,
  backText,
  warningMessage 
}: BrazeProtectedProps) {
  const { isConnected, isChecking } = useBrazeConnection();

  if (isChecking) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">{loadingMessage}</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <BrazeConnectionWarning 
        backPath={backPath}
        backText={backText}
        message={warningMessage}
      />
    );
  }

  return <>{children}</>;
}