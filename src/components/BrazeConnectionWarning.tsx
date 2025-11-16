import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BrazeConnectionWarningProps {
  /** Optional back navigation path */
  backPath?: string;
  /** Optional back button text */
  backText?: string;
  /** Optional custom message */
  message?: string;
}

/**
 * Reusable component to show when Braze is not connected
 * Provides navigation to connection settings and back button
 */
export function BrazeConnectionWarning({ 
  backPath, 
  backText = "Go Back",
  message = "You need to connect your Braze account before sending content."
}: BrazeConnectionWarningProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12 space-y-6">
      <div className="flex items-center justify-center gap-2 text-amber-600 mb-4">
        <AlertCircle className="h-6 w-6" />
        <div>
          <h3 className="text-lg font-semibold">Braze Not Connected</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {message}
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Connect Braze Account
        </Button>
        {backPath && (
          <Button
            variant="outline"
            onClick={() => navigate(backPath)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backText}
          </Button>
        )}
      </div>
    </div>
  );
}