import { cn } from "@/lib/utils";
import { 
  Users, 
  Cpu, 
  Server, 
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  change: string;
  changeType: "increase" | "decrease" | "stable" | "good";
  color: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  change, 
  changeType, 
  color 
}: StatsCardProps) {
  // Function to get icon component based on string
  const getIcon = () => {
    switch (icon) {
      case "users":
        return <Users className="text-terminal" />;
      case "cpu":
        return <Cpu className="text-terminal" />;
      case "server":
        return <Server className="text-terminal" />;
      case "clock":
        return <Clock className="text-terminal" />;
      default:
        return <Users className="text-terminal" />;
    }
  };

  // Function to render change icon based on type
  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return <ArrowUp className="h-3 w-3 mr-1" />;
      case "decrease":
        return <ArrowDown className="h-3 w-3 mr-1" />;
      case "stable":
        return <Minus className="h-3 w-3 mr-1" />;
      case "good":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-black p-4 border border-terminal/30 rounded-sm relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-tech-mono text-white/70">{title}</p>
          <h3 className="text-2xl font-tech-mono mt-2 text-terminal terminal-shadow">{value}</h3>
        </div>
        <div className="bg-black border border-terminal/30 p-2 rounded-sm">
          {getIcon()}
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs font-tech-mono">
        <span className={cn(
          "flex items-center",
          changeType === "increase" && "text-terminal",
          changeType === "decrease" && "text-red-500",
          changeType === "stable" && "text-white",
          changeType === "good" && "text-terminal"
        )}>
          {getChangeIcon()}
          {change}
        </span>
        <span className="ml-2 text-white/50">
          {changeType === "increase" || changeType === "decrease" 
            ? "na última semana" 
            : changeType === "stable" 
              ? "faixa ideal" 
              : ""}
        </span>
      </div>
    </div>
  );
}
