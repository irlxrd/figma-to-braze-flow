/**
 * Figma Connect Page
 * Allows user to enter their Figma Personal Access Token
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Figma, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function FigmaConnect() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/figma/status");
        const data = await response.json();
        if (data.configured) {
          // Verify token by getting user info
          const userResponse = await fetch("/api/figma/me");
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
            setConnected(true);
          }
        }
      } catch (err) {
        console.error("Connection check failed:", err);
      }
    };
    checkConnection();
  }, []);

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setError(null);
    setToken("");
  };

  const handleConnect = async () => {
    if (!token.trim()) {
      setError("Please enter a token");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      // Store token
      const storeResponse = await fetch("/api/local/figma-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token.trim() }),
      });

      if (!storeResponse.ok) {
        const errorText = await storeResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(errorText || `Failed to store token: ${storeResponse.status}`);
        }
        throw new Error(errorData.error || "Failed to store token");
      }

      const storeData = await storeResponse.json();

      if (!storeData.success) {
        throw new Error(storeData.error || "Failed to store token");
      }

      // Verify token
      const verifyResponse = await fetch("/api/figma/me");
      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(errorText || `Invalid token: ${verifyResponse.status}`);
        }
        throw new Error(errorData.error || "Invalid token");
      }

      const userData = await verifyResponse.json();
      setUser(userData);
      setConnected(true);
      setDialogOpen(false);
      setToken("");
      toast.success("Connected to Figma successfully!");
      // Redirect to files page after successful connection
      navigate("/figma/files");
    } catch (err: any) {
      setError(err.message || "Failed to connect to Figma");
      toast.error(err.message || "Failed to connect to Figma");
    } finally {
      setConnecting(false);
    }
  };

  const handleContinue = () => {
    navigate("/figma/files");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-figma-orange/10 p-4">
                <Figma className="h-12 w-12 text-figma-orange" />
              </div>
            </div>
            <CardTitle className="text-3xl">Connect to Figma</CardTitle>
            <CardDescription>
              Enter your Figma Personal Access Token to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {connected && user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Connected</p>
                    <p className="text-sm text-green-700">
                      Logged in as {user.email || user.handle || user.id}
                    </p>
                  </div>
                </div>
                <Button onClick={handleContinue} className="w-full" size="lg">
                  Browse Your Figma Files
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>How to get your Figma Personal Access Token:</strong>
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-800">
                    <li>Go to Figma Settings → Account</li>
                    <li>Scroll to "Personal Access Tokens"</li>
                    <li>Click "Create new token"</li>
                    <li>Copy the token and paste it below</li>
                  </ol>
                </div>
                <Button onClick={handleOpenDialog} className="w-full" size="lg">
                  Enter Figma Token
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Figma Personal Access Token</DialogTitle>
            <DialogDescription>
              Your token will be stored locally and used for this session only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="token">Personal Access Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="figd_..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !connecting) {
                    handleConnect();
                  }
                }}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={connecting}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={connecting || !token.trim()}>
              {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

