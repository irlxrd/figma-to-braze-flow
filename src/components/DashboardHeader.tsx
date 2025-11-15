import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export function DashboardHeader({ title, subtitle, showBack }: DashboardHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
