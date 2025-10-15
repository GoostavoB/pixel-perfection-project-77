import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface ConfidenceBadgeProps {
  score: number;
  label: string;
}

export const ConfidenceBadge = ({ score, label }: ConfidenceBadgeProps) => {
  const getConfig = () => {
    if (score >= 0.95) {
      return {
        icon: CheckCircle,
        color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
        emoji: "🟢",
        title: "Alta Confiança",
        description: "Análise baseada em evidências claras e padrões bem estabelecidos"
      };
    }
    if (score >= 0.80) {
      return {
        icon: AlertTriangle,
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
        emoji: "🟠",
        title: "Confiança Moderada",
        description: "Análise baseada em padrões prováveis, requer verificação adicional"
      };
    }
    return {
      icon: AlertCircle,
      color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
      emoji: "🔴",
      title: "Requer Revisão",
      description: "Análise preliminar, recomendamos verificar documentação médica"
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${config.color} border-none cursor-help flex items-center gap-1.5`}
          >
            <Icon className="h-3 w-3" />
            <span>{label}</span>
            <span className="ml-1">{(score * 100).toFixed(0)}%</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold flex items-center gap-1">
              {config.emoji} {config.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
