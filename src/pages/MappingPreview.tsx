import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";
import { Smartphone } from "lucide-react";

export default function MappingPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFrame, campaignType } = location.state || {};

  const [fields, setFields] = useState({
    headline: "Unlock Premium Features",
    subtext: "Get unlimited access to all features with our premium plan. Start your 30-day free trial today.",
    ctaText: "Start Free Trial",
    triggerType: "on-app-open",
  });

  const handleFieldChange = (field: string, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCampaign = () => {
    navigate("/success", { state: { campaignType, fields } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <DashboardHeader
        title="Map & Preview Campaign"
        subtitle="Customize extracted fields and preview your Braze message"
        showBack
      />
      
      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Source Design</h2>
            <Card className="p-4">
              <img
                src={selectedFrame?.thumbnail || "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop"}
                alt="Source design"
                className="w-full rounded-lg"
              />
            </Card>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Extracted Fields</h2>
              <Card className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={fields.headline}
                    onChange={(e) => handleFieldChange("headline", e.target.value)}
                    className="font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtext">Description / Subtext</Label>
                  <Textarea
                    id="subtext"
                    value={fields.subtext}
                    onChange={(e) => handleFieldChange("subtext", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta">CTA Button Text</Label>
                  <Input
                    id="cta"
                    value={fields.ctaText}
                    onChange={(e) => handleFieldChange("ctaText", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger Type</Label>
                  <Select
                    value={fields.triggerType}
                    onValueChange={(value) => handleFieldChange("triggerType", value)}
                  >
                    <SelectTrigger id="trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-app-open">On App Open</SelectItem>
                      <SelectItem value="on-event">On Custom Event</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="api-triggered">API Triggered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Braze Preview</h2>
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="max-w-sm mx-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
                    <div className="relative bg-card rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800">
                      <div className="h-6 bg-gray-800 flex items-center justify-center">
                        <div className="h-1 w-20 bg-gray-600 rounded-full" />
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-sm font-medium">Your App</div>
                        </div>
                        <h3 className="text-lg font-bold">{fields.headline}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {fields.subtext}
                        </p>
                        <Button size="lg" className="w-full">
                          {fields.ctaText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleCreateCampaign}
            >
              Create Campaign in Braze
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
