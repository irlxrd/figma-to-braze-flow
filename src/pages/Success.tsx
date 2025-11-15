import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const { campaignType, fields, exportData, pageName } = location.state || {};

  const campaignId = `BRZ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Check if this is from HTML export
  const isHtmlExport = exportData && pageName;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <DashboardHeader
        title="Campaign Created Successfully"
        subtitle="Your Figma design has been transformed into a Braze campaign"
      />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center">
            <div className="inline-flex h-20 w-20 rounded-full bg-success/10 items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            
            <h2 className="text-3xl font-bold mb-3">
              {isHtmlExport ? 'HTML Export Complete!' : 'Campaign Created!'}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {isHtmlExport 
                ? `"${pageName}" has been converted to HTML and is ready for Braze`
                : 'Your campaign has been successfully created in Braze'
              }
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8 space-y-3">
              {isHtmlExport ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Design Name</span>
                    <span className="font-semibold">{pageName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Export Type</span>
                    <span className="font-semibold capitalize">{exportData.type || 'Email'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Liquid Tags</span>
                    <span className="font-semibold">{exportData.liquidTags?.length || 0} found</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <span className="text-success font-semibold">Ready for Braze</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Campaign ID</span>
                    <span className="font-mono font-semibold">{campaignId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Type</span>
                    <span className="font-semibold capitalize">
                      {campaignType?.replace("-", " ") || "In-App Message"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <span className="text-success font-semibold">Draft</span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full gap-2">
                <ExternalLink className="h-5 w-5" />
                Open in Braze
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2"
                onClick={() => navigate("/")}
              >
                <Plus className="h-5 w-5" />
                Create Another Campaign
              </Button>
            </div>
          </Card>

          <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              What's Next?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              {isHtmlExport ? (
                <>
                  <li>• Upload the HTML file to your Braze campaign</li>
                  <li>• Test the liquid tags with sample user data</li>
                  <li>• Set up targeting and scheduling options</li>
                  <li>• Preview on different devices and email clients</li>
                </>
              ) : (
                <>
                  <li>• Review and test your campaign in Braze dashboard</li>
                  <li>• Set up targeting and scheduling options</li>
                  <li>• Add conversion tracking and analytics</li>
                  <li>• Launch when ready!</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
