/**
 * Figma File Detail Page
 * Shows file details and allows sending to Braze
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Loader2, ArrowLeft, Send, Image as ImageIcon, Code } from "lucide-react";
import { toast } from "sonner";

interface FileDetail {
  name: string;
  document: any;
  pages: any[];
  components: Record<string, any>;
  thumbnail: string | null;
  lastModified: string | null;
}

export default function FileDetail() {
  const navigate = useNavigate();
  const { fileKey } = useParams<{ fileKey: string }>();
  const [fileDetail, setFileDetail] = useState<FileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileKey) {
      navigate("/figma/files");
      return;
    }

    const fetchFileDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/figma/file/${fileKey}`);
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            throw new Error("Invalid Figma token. Please reconnect.");
          }
          throw new Error(errorData.error || "Failed to fetch file details");
        }

        const data = await response.json();
        setFileDetail(data);
      } catch (err: any) {
        setError(err.message || "Failed to load file details");
        toast.error(err.message || "Failed to load file details");
      } finally {
        setLoading(false);
      }
    };

    fetchFileDetail();
  }, [fileKey, navigate]);

  const handleConvertToHtml = () => {
    if (!fileDetail || !fileDetail.pages || fileDetail.pages.length === 0) {
      toast.error("No pages found to convert");
      return;
    }

    // Use the first page for now, later we can add page selection
    const pageData = fileDetail.pages[0];
    const pageName = pageData.name || fileDetail.name || 'Design';

    console.log("Converting to HTML:", { fileKey, pageName, pageData });
    
    // Navigate to HTML editor with page data
    navigate(`/html-editor/${fileKey}`, {
      state: {
        pageData: pageData,
        pageName: pageName,
        fileDetail: fileDetail
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/figma/files")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                {loading ? "Loading..." : fileDetail?.name || "File Details"}
              </CardTitle>
              <CardDescription>
                Preview file information and convert designs to HTML with Braze Liquid templating
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
                    onClick={() => navigate("/figma/files")}
                    className="mt-4"
                  >
                    Go Back
                  </Button>
                </div>
              ) : fileDetail ? (
                <div className="space-y-6">
                  {/* Thumbnail */}
                  {fileDetail.thumbnail && (
                    <div className="flex justify-center">
                      <img
                        src={fileDetail.thumbnail}
                        alt={fileDetail.name}
                        className="max-w-full h-auto rounded-lg border shadow-sm"
                      />
                    </div>
                  )}

                  {/* File Info */}
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">File Name</h3>
                      <p className="text-lg">{fileDetail.name}</p>
                    </div>
                    {fileDetail.lastModified && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          Last Modified
                        </h3>
                        <p className="text-base">
                          {new Date(fileDetail.lastModified).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pages */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">Pages</h3>
                    {fileDetail.pages && fileDetail.pages.length > 0 ? (
                      <div className="space-y-2">
                        {fileDetail.pages.map((page, index) => (
                          <div
                            key={page.id || index}
                            className="p-3 bg-muted rounded-lg border"
                          >
                            <p className="font-medium">{page.name || `Page ${index + 1}`}</p>
                            {page.type && (
                              <p className="text-sm text-muted-foreground">Type: {page.type}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No pages found</p>
                    )}
                  </div>

                  {/* Convert to HTML with Liquid Tags Button */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleConvertToHtml}
                      className="w-full"
                      size="lg"
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Convert to HTML + Add Liquid Tags
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

