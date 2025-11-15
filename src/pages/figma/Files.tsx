/**
 * Figma Files List Page
 * Lists all files the user can access
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { FigmaFile } from "@/types/figma";

export default function Files() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("teamId");
  const [files, setFiles] = useState<FigmaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!teamId) {
        setError("Team ID is required. Please use the team input page to select a team.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/figma/files?teamId=${encodeURIComponent(teamId)}`);
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            throw new Error("Invalid Figma token. Please reconnect.");
          }
          throw new Error(errorData.error || "Failed to fetch files");
        }

        const data = await response.json();
        setFiles(data.files || []);
      } catch (err: any) {
        setError(err.message || "Failed to load files");
        toast.error(err.message || "Failed to load files");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [teamId]);

  const handleSelectFile = (fileKey: string) => {
    navigate(`/figma/files/${fileKey}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/figma/connect")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                All Figma Files
              </CardTitle>
              <CardDescription>
                Select a file to preview and prepare for Braze
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">{error}</p>
                  {!teamId ? (
                    <Button
                      onClick={() => navigate("/figma/team")}
                      className="mt-4"
                    >
                      Go to Team Input
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => navigate("/figma/connect")}
                      className="mt-4"
                    >
                      Go Back
                    </Button>
                  )}
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No files found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <Card
                      key={file.key}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Thumbnail */}
                          {(file.thumbnailUrl || file.thumbnail_url) ? (
                            <div className="w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                              <img
                                src={file.thumbnailUrl || file.thumbnail_url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full aspect-video rounded-lg bg-purple-100 flex items-center justify-center border">
                              <File className="h-12 w-12 text-purple-600" />
                            </div>
                          )}
                          
                          {/* File Info */}
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg line-clamp-2">{file.name}</h3>
                            <p className="text-xs text-muted-foreground font-mono">
                              Key: {file.key}
                            </p>
                            {(file.lastModified || file.last_modified) && (
                              <p className="text-sm text-muted-foreground">
                                Last modified: {new Date(file.lastModified || file.last_modified!).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          
                          {/* Select Button */}
                          <Button
                            onClick={() => handleSelectFile(file.key)}
                            className="w-full"
                            size="lg"
                          >
                            Select File
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

