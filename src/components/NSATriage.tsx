import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NSATriageProps {
  applies: "yes" | "no" | "unknown";
  scenarios: string[];
  missingData: string[];
  prelimAssessment: string;
}

export const NSATriage = ({ applies, scenarios, missingData, prelimAssessment }: NSATriageProps) => {
  const { toast } = useToast();

  const handleGenerateEmail = () => {
    const subject = encodeURIComponent("Request for Network Status and NSA Documentation");
    const body = encodeURIComponent(
      `Dear Billing Department,\n\n` +
      `I am requesting the following information to determine No Surprises Act (NSA) protections for my recent medical bill:\n\n` +
      missingData.map(item => `• ${item}`).join('\n') +
      `\n\nPlease provide this information within 30 days as required by federal law.\n\n` +
      `Thank you,`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleFileComplaint = () => {
    window.open("https://www.cms.gov/nosurprises/consumers/file-a-complaint", "_blank");
  };

  const getStatusColor = () => {
    switch (applies) {
      case "yes":
        return "bg-green-50 border-green-200";
      case "no":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getStatusIcon = () => {
    switch (applies) {
      case "yes":
        return <Shield className="w-5 h-5 text-green-700" />;
      case "no":
        return <Shield className="w-5 h-5 text-gray-700" />;
      default:
        return <Shield className="w-5 h-5 text-blue-700" />;
    }
  };

  return (
    <Card className={`p-6 ${getStatusColor()}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-lg ${applies === "yes" ? "bg-green-100" : applies === "no" ? "bg-gray-100" : "bg-blue-100"}`}>
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-foreground">No Surprises Act Protection</h2>
            {applies === "yes" && (
              <Badge className="bg-green-100 text-green-700 border-green-300">Protected</Badge>
            )}
            {applies === "no" && (
              <Badge className="bg-gray-100 text-gray-700 border-gray-300">Not Protected</Badge>
            )}
            {applies === "unknown" && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-300">Unknown</Badge>
            )}
          </div>
          <p className="text-sm text-foreground/80 mb-3">
            {prelimAssessment}
          </p>
        </div>
      </div>

      {scenarios.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-sm text-foreground mb-2">Applicable Scenarios:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {scenarios.map((scenario, idx) => (
              <li key={idx}>{scenario}</li>
            ))}
          </ul>
        </div>
      )}

      {missingData.length > 0 && (
        <div className="mb-4 p-3 bg-white/50 rounded-lg border border-foreground/10">
          <h3 className="font-semibold text-sm text-foreground mb-2">Missing Information:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {missingData.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        {missingData.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateEmail}
          >
            <Mail className="w-4 h-4 mr-1" />
            Request NSA info
          </Button>
        )}
        {applies === "yes" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleFileComplaint}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            File NSA complaint
          </Button>
        )}
      </div>

      {applies === "yes" && (
        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <p className="text-xs text-green-800">
            <strong>Your Rights:</strong> Under the No Surprises Act (45 CFR § 149.410), you owe only in-network cost-sharing. 
            File a complaint at cms.gov/nosurprises within 120 days if balance-billed.
          </p>
        </div>
      )}
    </Card>
  );
};
