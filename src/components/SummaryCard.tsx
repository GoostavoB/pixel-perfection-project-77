import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SummaryCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  variant: "error" | "warning" | "success" | "info";
  subtitle?: string;
  tooltipContent?: string;
  note?: string;
}

const variantStyles = {
  error: "border-l-4 border-l-destructive bg-destructive/5",
  warning: "border-l-4 border-l-warning bg-warning/5",
  success: "border-l-4 border-l-success bg-success/5",
  info: "border-l-4 border-l-secondary bg-secondary/5",
};

const iconStyles = {
  error: "text-destructive",
  warning: "text-warning",
  success: "text-success",
  info: "text-secondary",
};

const SummaryCard = ({ icon: Icon, title, value, variant, subtitle, tooltipContent, note }: SummaryCardProps) => {
  return (
    <Card
      className={`p-6 hover:shadow-card-hover transition-all duration-300 ${variantStyles[variant]} animate-fade-in`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-card ${iconStyles[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {tooltipContent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{tooltipContent}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className={`text-2xl font-bold ${iconStyles[variant]}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {note && (
            <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
              <strong>Note:</strong> {note}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SummaryCard;
