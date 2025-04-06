import { useState } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Activity {
  type: string;
  message: string;
  details: string;
  time: string;
  status: "info" | "warning" | "success" | "error";
}

interface ActivityLogProps {
  activities: Activity[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 800);
  };

  // Function to determine border color based on status
  const getBorderColor = (status: Activity['status']) => {
    switch (status) {
      case "info":
        return "border-terminal";
      case "warning":
        return "border-yellow-500";
      case "success":
        return "border-terminal";
      case "error":
        return "border-red-500";
      default:
        return "border-terminal";
    }
  };

  // Function to determine status color and text
  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case "info":
        return { color: "text-terminal", text: "SYS" };
      case "warning":
        return { color: "text-yellow-500", text: "WARN" };
      case "success":
        return { color: "text-terminal", text: "INFO" };
      case "error":
        return { color: "text-red-500", text: "USER" };
      default:
        return { color: "text-terminal", text: "SYS" };
    }
  };

  return (
    <div className="bg-black rounded-sm p-4 border border-terminal/30 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-tech-mono text-lg text-terminal terminal-shadow">ATIVIDADES</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="text-xs bg-black border border-terminal/50 hover:bg-[#111111] text-white hover:text-terminal"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div 
            key={index}
            className={cn(
              "border-l-2 pl-3 pb-3 relative",
              getBorderColor(activity.status)
            )}
          >
            <div className="flex justify-between mb-1">
              <p className="text-sm font-tech-mono">
                <span className={getStatusColor(activity.status).color}>
                  [{activity.type}]
                </span> {activity.message}
              </p>
              <span className="text-xs text-white/50 font-mono">{activity.time}</span>
            </div>
            <p className="text-xs text-white/70">{activity.details}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Button 
          variant="link" 
          className="text-sm text-terminal hover:text-white transition-colors font-tech-mono"
        >
          Ver registro completo <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
