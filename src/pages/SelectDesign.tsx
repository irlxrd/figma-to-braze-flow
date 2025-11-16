import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockFigmaFiles } from "@/data/mockData";
import { FigmaFile, FigmaFrame } from "@/types/workflow";
import { FileImage, ChevronRight, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SelectDesign() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<FigmaFile | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<FigmaFrame | null>(null);
  const [showMockWarning, setShowMockWarning] = useState(true);

  useEffect(() => {
    // Show a warning that these are demo designs
    toast.info("These are demo designs. Connect to your Figma account to access your real designs.", {
      duration: 5000,
    });
  }, []);

  const handleContinue = () => {
    if (selectedFrame) {
      navigate("/campaign-type", { state: { selectedFrame, selectedFile } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <DashboardHeader
        title="Select Figma Design"
        subtitle="Choose a file and frame to transform into a Braze campaign"
        showBack
      />
      
      <main className="container mx-auto px-6 py-12">
        {showMockWarning && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <div className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  These are Demo Designs
                </h3>
                <p className="text-sm text-orange-800 mb-3">
                  You're viewing sample designs. To work with your actual Figma files, connect to your Figma team.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => navigate("/figma/team")}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Browse My Figma Files
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowMockWarning(false)}
                  >
                    Continue with Demo
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!selectedFile ? (
              <>
                <h2 className="text-xl font-semibold">Your Figma Files</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockFigmaFiles.map((file) => (
                    <Card
                      key={file.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-primary"
                      onClick={() => setSelectedFile(file)}
                    >
                      <img
                        src={file.thumbnail}
                        alt={file.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold">{file.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Modified {file.lastModified}
                      </p>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setSelectedFrame(null);
                    }}
                    className="hover:text-foreground transition-colors"
                  >
                    Files
                  </button>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground font-medium">{selectedFile.name}</span>
                </div>
                
                <h2 className="text-xl font-semibold">Select a Frame</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedFile.frames?.map((frame) => (
                    <Card
                      key={frame.id}
                      className={`p-4 cursor-pointer hover:shadow-md transition-all ${
                        selectedFrame?.id === frame.id
                          ? "border-primary border-2"
                          : "hover:border-primary"
                      }`}
                      onClick={() => setSelectedFrame(frame)}
                    >
                      <img
                        src={frame.thumbnail}
                        alt={frame.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold">{frame.name}</h3>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileImage className="h-5 w-5 text-primary" />
                Selected Frame Preview
              </h3>
              {selectedFrame ? (
                <div className="space-y-4">
                  <img
                    src={selectedFrame.thumbnail}
                    alt={selectedFrame.name}
                    className="w-full rounded-lg border"
                  />
                  <div>
                    <p className="font-medium">{selectedFrame.name}</p>
                    <p className="text-sm text-muted-foreground">
                      From: {selectedFile?.name}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleContinue}
                  >
                    Continue to Campaign Type
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileImage className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Select a frame to preview it here
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
