/**
 * Figma Export Frame Page
 * Exports selected frame as PNG and sends to Braze
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Download, Send, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { FigmaImageResponse } from "@/types/figma";
import { useBrazeConnection } from "@/hooks/useBrazeConnection";
import { BrazeConnectionWarning } from "@/components/BrazeConnectionWarning";

export default function ExportFrame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileKey = window.location.pathname.split("/")[3]; // Extract from /figma/files/:fileKey/export
  const nodeId = searchParams.get("nodeId");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [sent, setSent] = useState(false);
  
  // Use the Braze connection hook
  const { isConnected: brazeConnected, isChecking: checkingBraze } = useBrazeConnection();

  useEffect(() => {
    if (!fileKey || !nodeId) {
      navigate("/figma/files");
      return;
    }

    const exportImage = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/figma/image/${fileKey}?ids=${nodeId}&format=png&scale=2`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to export image");
        }

        const data: FigmaImageResponse = await response.json();
        const url = data.images?.[nodeId];

        if (!url) {
          throw new Error("No image URL returned from Figma");
        }

        setImageUrl(url);
      } catch (err: any) {
        setError(err.message || "Failed to export image");
        toast.error(err.message || "Failed to export image");
      } finally {
        setLoading(false);
      }
    };

    exportImage();
  }, [fileKey, nodeId, navigate]);

  const handleSendToBraze = async () => {
    if (!imageUrl) {
      toast.error("No image to send");
      return;
    }

    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    if (!brazeConnected) {
      toast.error("Braze is not connected. Please connect your Braze account first.");
      navigate("/");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/braze/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          campaignName: campaignName.trim(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to send image to Braze");
      }

      setSent(true);
      toast.success("Image sent to Braze 🎉");
    } catch (err: any) {
      setError(err.message || "Failed to send image to Braze");
      toast.error(err.message || "Failed to send image to Braze");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/figma/files/${fileKey}/frames`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Export & Send to Braze</CardTitle>
              <CardDescription>
                Preview your exported frame and send it to Braze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {checkingBraze ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-3 text-muted-foreground">Checking connections...</span>
                </div>
              ) : !brazeConnected ? (
                <BrazeConnectionWarning 
                  backPath={`/figma/files/${fileKey}/frames`}
                  backText="Back to Frames"
                  message="You need to connect your Braze account before sending images."
                />
              ) : loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-3 text-muted-foreground">Exporting image...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-destructive mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/figma/files/${fileKey}/frames`)}
                  >
                    Go Back
                  </Button>
                </div>
              ) : imageUrl ? (
                <>
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden bg-white p-4">
                      <img
                        src={imageUrl}
                        alt="Exported frame"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>

                    {sent ? (
                      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-green-900">Sent to Braze!</p>
                          <p className="text-sm text-green-700">
                            Your image has been successfully uploaded to Braze.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="campaignName">Campaign Name</Label>
                          <Input
                            id="campaignName"
                            placeholder="Enter campaign name"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !sending && campaignName.trim()) {
                                handleSendToBraze();
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

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              window.open(imageUrl, "_blank");
                            }}
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button
                            onClick={handleSendToBraze}
                            disabled={sending || !campaignName.trim()}
                            className="flex-1"
                          >
                            {sending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Send to Braze
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

