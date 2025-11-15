import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockFigmaFiles } from "@/data/mockData";
import { FigmaFile, FigmaFrame } from "@/types/workflow";
import { FileImage, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SelectDesign() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<FigmaFile | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<FigmaFrame | null>(null);

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
