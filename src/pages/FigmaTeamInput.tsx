/**
 * Figma Team Input Page
 * Allows user to paste a Figma team URL and extract the team ID
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Figma, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function FigmaTeamInput() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShowFiles = async () => {
    if (!url.trim()) {
      setError("Please enter a Figma team URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/figma/team/extract-id?url=${encodeURIComponent(url.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract team ID");
      }

      const data = await response.json();
      const teamId = data.teamId;

      if (!teamId) {
        throw new Error("Team ID not found in URL");
      }

      // Navigate to the files page
      navigate(`/figma/team/${teamId}/files`);
    } catch (err: any) {
      setError(err.message || "Failed to extract team ID");
      toast.error(err.message || "Failed to extract team ID");
    } finally {
      setLoading(false);
    }
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
            <CardTitle className="text-3xl">Figma Team Files</CardTitle>
            <CardDescription>
              Paste your Figma team URL to view all files in that team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamUrl">Figma Team URL</Label>
              <Input
                id="teamUrl"
                type="url"
                placeholder="https://www.figma.com/files/team/1234567890/all-projects?fuid=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleShowFiles();
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Example: https://www.figma.com/files/team/1234567890/all-projects?fuid=...
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            <Button
              onClick={handleShowFiles}
              className="w-full"
              size="lg"
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Show Files
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

