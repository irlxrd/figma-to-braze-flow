import { DashboardHeader } from "@/components/DashboardHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Figma, Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ConnectionScreen() {
  const navigate = useNavigate();
  const [figmaConnected, setFigmaConnected] = useState(false);
  const [brazeConnected, setBrazeConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brazeDialogOpen, setBrazeDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [region, setRegion] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState(false);

  useEffect(() => {
    // Check connection status on mount
    const checkConnections = async () => {
      setLoading(true);
      
      // Check Braze connection
      try {
        const brazeResponse = await fetch("/braze/connect");
        
        if (brazeResponse.ok) {
          const brazeData = await brazeResponse.json();
          setBrazeConnected(brazeData.connected === true);
        } else {
          setBrazeConnected(false);
        }
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

  const handleConnectBraze = async () => {
    if (!apiKey || !region) {
      setConnectError("Please fill in all fields");
      return;
    }

    setConnecting(true);
    setConnectError(null);
    setConnectSuccess(false);

    try {
      const response = await fetch("/braze/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey, region }),
      });

      const data = await response.json();

      if (data.success) {
        setConnectSuccess(true);
        setBrazeConnected(true);
        // Close dialog after 1.5 seconds
        setTimeout(() => {
          setBrazeDialogOpen(false);
          setApiKey("");
          setRegion("");
          setConnectSuccess(false);
        }, 1500);
      } else {
        setConnectError(data.error || "Failed to connect to Braze");
      }
    } catch (error) {
      setConnectError(error instanceof Error ? error.message : "Failed to connect to Braze");
    } finally {
      setConnecting(false);
    }
  };

  const handleOpenBrazeDialog = () => {
    setBrazeDialogOpen(true);
    setConnectError(null);
    setConnectSuccess(false);
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
              <Button
                className="mt-6 w-full"
                size="lg"
                variant="secondary"
                onClick={handleOpenBrazeDialog}
              >
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

      {/* Connect Braze Dialog */}
      <Dialog open={brazeDialogOpen} onOpenChange={setBrazeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Braze</DialogTitle>
            <DialogDescription>
              Enter your Braze API key and select your region to connect.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Braze API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={connecting || connectSuccess}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={region}
                onValueChange={setRegion}
                disabled={connecting || connectSuccess}
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fra-01">FRA-01 (Europe)</SelectItem>
                  <SelectItem value="fra-02">FRA-02 (Europe)</SelectItem>
                  <SelectItem value="us-01">US-01 (US East)</SelectItem>
                  <SelectItem value="us-08">US-08 (US East)</SelectItem>
                  <SelectItem value="au-01">AU-01 (Australia)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {connectError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{connectError}</span>
              </div>
            )}
            {connectSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Connected ✓</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBrazeDialogOpen(false)}
              disabled={connecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConnectBraze}
              disabled={connecting || connectSuccess || !apiKey || !region}
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
