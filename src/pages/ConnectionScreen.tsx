import { DashboardHeader } from "@/components/DashboardHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Figma, Zap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ConnectionScreen() {
  const navigate = useNavigate();
  const [figmaConnected, setFigmaConnected] = useState(false);
  const [brazeConnected, setBrazeConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check connection status on mount
    const checkConnections = async () => {
      setLoading(true);
      
      // Check Braze connection
      try {
        const brazeResponse = await fetch("http://localhost:3000/test/braze-auth");
        
        // Check if the HTTP response is OK (200-299)
        if (!brazeResponse.ok) {
          console.log("Braze connection check: HTTP error", brazeResponse.status);
          setBrazeConnected(false);
          setLoading(false);
          return;
        }
        
        const brazeData = await brazeResponse.json();
        // Only set connected if both HTTP status is OK AND success is true
        const isConnected = brazeData.success === true;
        console.log("Braze connection check result:", isConnected, brazeData);
        setBrazeConnected(isConnected);
      } catch (error) {
        console.error("Braze connection check failed:", error);
        setBrazeConnected(false);
      }

      // Check Figma connection (for now, assume not connected if no API endpoint exists)
      // TODO: Add Figma connection check endpoint
      setFigmaConnected(false);
      
      setLoading(false);
    };

    checkConnections();
  }, []);

  const handleContinue = () => {
    navigate("/select-design");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <DashboardHeader
        title="Connect Your Accounts"
        subtitle="Link Figma and Braze to start transforming designs into campaigns"
      />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Figma className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Figma Account</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Access your designs and frames
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </div>
              ) : (
                <StatusBadge status={figmaConnected ? "connected" : "disconnected"} />
              )}
            </div>
            {!figmaConnected && !loading && (
              <Button className="mt-6 w-full" size="lg">
                Connect Figma
              </Button>
            )}
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Braze Account</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deploy campaigns and messages
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </div>
              ) : (
                <StatusBadge status={brazeConnected ? "connected" : "disconnected"} />
              )}
            </div>
            {!brazeConnected && !loading && (
              <Button className="mt-6 w-full" size="lg" variant="secondary">
                Connect Braze
              </Button>
            )}
          </Card>

          {!loading && figmaConnected && brazeConnected && (
            <Button
              size="lg"
              className="w-full mt-8"
              onClick={handleContinue}
            >
              Continue to Select Design
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
