/**
 * Figma Team Files Page
 * Displays all files from a specific Figma team
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Loader2, ArrowLeft, Folder } from "lucide-react";
import { toast } from "sonner";
import type { FigmaFile } from "@/types/figma";

interface Project {
  id: string;
  name: string;
}

interface TeamFilesResponse {
  teamId: string;
  projects: Project[];
  files: FigmaFile[];
}

export default function FigmaTeamFiles() {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const [data, setData] = useState<TeamFilesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!teamId) {
        setError("Team ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/figma/team/${teamId}/files`);
        
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            throw new Error("Invalid Figma token. Please reconnect.");
          }
          throw new Error(errorData.error || "Failed to fetch files");
        }

        const responseData = await response.json();
        setData(responseData);
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
    navigate(`/figma/file/${fileKey}`);
  };

  // Group files by project
  const filesByProject = data?.files.reduce((acc, file) => {
    const projectId = file.project_id || "unknown";
    if (!acc[projectId]) {
      acc[projectId] = {
        name: file.project_name || `Project ${projectId}`,
        files: [],
      };
    }
    acc[projectId].files.push(file);
    return acc;
  }, {} as Record<string, { name: string; files: FigmaFile[] }>) || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/figma/team")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Team Files
              </CardTitle>
              <CardDescription>
                Team ID: {teamId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/figma/team")}
                    className="mt-4"
                  >
                    Go Back
                  </Button>
                </div>
              ) : !data || data.files.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No files found in this team</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(filesByProject).map(([projectId, projectData]) => (
                    <div key={projectId} className="space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Folder className="h-5 w-5" />
                        {projectData.name}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projectData.files.map((file) => (
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
                                  Select
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
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

