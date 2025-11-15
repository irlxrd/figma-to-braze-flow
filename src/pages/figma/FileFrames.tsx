/**
 * Figma File Frames Page
 * Displays file structure as a tree and allows selecting frames/components
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Frame, Component } from "lucide-react";
import { toast } from "sonner";
import type { FigmaFileResponse, FigmaNode } from "@/types/figma";

interface TreeNode extends FigmaNode {
  expanded?: boolean;
  level?: number;
}

export default function FileFrames() {
  const navigate = useNavigate();
  const { fileKey } = useParams<{ fileKey: string }>();
  const [fileData, setFileData] = useState<FigmaFileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [frames, setFrames] = useState<TreeNode[]>([]);

  useEffect(() => {
    if (!fileKey) {
      navigate("/figma/files");
      return;
    }

    const fetchFile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/figma/file/${fileKey}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch file");
        }

        const data = await response.json();
        setFileData(data);

        // Extract frames and components
        const extractedFrames = extractFramesAndComponents(data.document);
        setFrames(extractedFrames);
      } catch (err: any) {
        setError(err.message || "Failed to load file");
        toast.error(err.message || "Failed to load file");
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileKey, navigate]);

  /**
   * Recursively extract FRAME and COMPONENT nodes
   */
  const extractFramesAndComponents = (node: FigmaNode, level = 0): TreeNode[] => {
    const result: TreeNode[] = [];

    // Include this node if it's a FRAME or COMPONENT
    if (node.type === "FRAME" || node.type === "COMPONENT") {
      result.push({
        ...node,
        level,
        expanded: false,
      });
    }

    // Recursively process children
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        result.push(...extractFramesAndComponents(child, level + 1));
      });
    }

    return result;
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const handleExport = () => {
    if (!selectedNode || !fileKey) {
      toast.error("Please select a frame or component");
      return;
    }
    navigate(`/figma/files/${fileKey}/export?nodeId=${selectedNode}`);
  };

  const renderTree = () => {
    if (frames.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No frames or components found in this file</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {frames.map((node) => (
          <div key={node.id}>
            <div
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                selectedNode === node.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
              style={{ paddingLeft: `${(node.level || 0) * 1.5 + 0.5}rem` }}
              onClick={() => handleNodeSelect(node.id)}
            >
              {node.type === "FRAME" ? (
                <Frame className="h-4 w-4" />
              ) : (
                <Component className="h-4 w-4" />
              )}
              <span className="flex-1 text-sm font-medium">{node.name || "Unnamed"}</span>
              <span className="text-xs opacity-70">{node.type}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
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
              <CardTitle>Select a Frame or Component</CardTitle>
              <CardDescription>
                {fileData?.name || "Loading..."} - Choose a frame or component to export
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
              ) : (
                <div className="space-y-4">
                  {renderTree()}
                  {selectedNode && (
                    <div className="mt-6 pt-6 border-t">
                      <Button onClick={handleExport} className="w-full" size="lg">
                        Export Selected Frame
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

