import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SummaryCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  variant: "error" | "warning" | "success" | "info";
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

const SummaryCard = ({ icon: Icon, title, value, variant }: SummaryCardProps) => {
  return (
    <Card
      className={`p-6 hover:shadow-card-hover transition-all duration-300 ${variantStyles[variant]} animate-fade-in`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-card ${iconStyles[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className={`text-2xl font-bold ${iconStyles[variant]}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
};

export default SummaryCard;
