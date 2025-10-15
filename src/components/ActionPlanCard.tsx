import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, FileText, ClipboardCopy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActionPlanCardProps {
  title: string;
  description: string;
  script: string;
  icon: "phone" | "mail" | "document";
  accountId?: string;
  dateRange?: string;
}

export const ActionPlanCard = ({ title, description, script, icon, accountId, dateRange }: ActionPlanCardProps) => {
  const { toast } = useToast();

  const handleCopyScript = () => {
    const fullScript = script
      .replace('[ID]', accountId || '[YOUR ACCOUNT ID]')
      .replace('[range]', dateRange || '[YOUR SERVICE DATES]');
    
    navigator.clipboard.writeText(fullScript);
    toast({
      title: "Script copied!",
      description: "Call script copied to clipboard",
    });
  };

  const getIcon = () => {
    switch (icon) {
      case "phone":
        return <Phone className="w-5 h-5" />;
      case "mail":
        return <Mail className="w-5 h-5" />;
      case "document":
        return <FileText className="w-5 h-5" />;
    }
  };

  const getIconBg = () => {
    switch (icon) {
      case "phone":
        return "bg-blue-100";
      case "mail":
        return "bg-purple-100";
      case "document":
        return "bg-green-100";
    }
  };

  const getIconColor = () => {
    switch (icon) {
      case "phone":
        return "text-blue-700";
      case "mail":
        return "text-purple-700";
      case "document":
        return "text-green-700";
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-lg ${getIconBg()}`}>
          <div className={getIconColor()}>
            {getIcon()}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <p className="text-sm text-foreground font-mono leading-relaxed whitespace-pre-wrap">
          {script
            .replace('[ID]', accountId || '[YOUR ACCOUNT ID]')
            .replace('[range]', dateRange || '[YOUR SERVICE DATES]')}
        </p>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={handleCopyScript}
        className="w-full"
      >
        <ClipboardCopy className="w-4 h-4 mr-2" />
        Copy script
      </Button>
    </Card>
  );
};
