import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface StatusBadgeProps {
  status: "connected" | "disconnected";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isConnected = status === "connected";
  
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
        isConnected
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      {isConnected ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
      {isConnected ? "Connected" : "Not Connected"}
    </div>
  );
}
