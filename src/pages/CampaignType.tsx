import { DashboardHeader } from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Mail, Smartphone, Bell, Box } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { CampaignType } from "@/types/workflow";

const campaignTypes = [
  {
    id: "in-app" as CampaignType,
    name: "In-App Message",
    description: "Show messages inside your mobile app",
    icon: Smartphone,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "email" as CampaignType,
    name: "Email Template",
    description: "Send beautiful email campaigns",
    icon: Mail,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "push" as CampaignType,
    name: "Push Notification",
    description: "Deliver timely push notifications",
    icon: Bell,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: "content-block" as CampaignType,
    name: "Content Block",
    description: "Reusable content for multiple campaigns",
    icon: Box,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
];

export default function CampaignType() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFrame, selectedFile } = location.state || {};

  const handleSelectType = (type: CampaignType) => {
    navigate("/mapping", {
      state: { selectedFrame, selectedFile, campaignType: type },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <DashboardHeader
        title="Choose Campaign Type"
        subtitle="Select where to deploy your design in Braze"
        showBack
      />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {campaignTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className="p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 hover:border-primary"
                  onClick={() => handleSelectType(type.id)}
                >
                  <div className={`h-14 w-14 rounded-xl ${type.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-7 w-7 ${type.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{type.name}</h3>
                  <p className="text-muted-foreground">{type.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
