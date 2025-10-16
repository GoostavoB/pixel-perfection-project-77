import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, ExternalLink, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface NSATriageProps {
  applies: "protected" | "not-protected" | "unknown";
  scenarios: string[];
  missingData: string[];
  prelimAssessment: string;
}

export const NSATriage = ({ applies, scenarios, missingData, prelimAssessment }: NSATriageProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleGenerateEmail = () => {
    const emailText = 
      `Subject: Request for Network Status and NSA Documentation\n\n` +
      `Dear Billing Department,\n\n` +
      `I am requesting the following information to determine No Surprises Act (NSA) protections for my recent medical bill:\n\n` +
      missingData.map(item => `• ${item}`).join('\n') +
      `\n\nPlease provide this information within 30 days as required by federal law.\n\n` +
      `Thank you,`;
    
    navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied!",
      description: "Email text copied to clipboard",
    });
  };

  const handleFileComplaint = () => {
    window.open("https://www.cms.gov/nosurprises/consumers/file-a-complaint", "_blank");
  };

  const getStatusColor = () => {
    switch (applies) {
      case "protected":
        return "bg-green-50 border-green-200";
      case "not-protected":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getStatusIcon = () => {
    switch (applies) {
      case "protected":
        return <Shield className="w-5 h-5 text-green-700" />;
      case "not-protected":
        return <Shield className="w-5 h-5 text-gray-700" />;
      default:
        return <Shield className="w-5 h-5 text-blue-700" />;
    }
  };

  return (
    <Card className={`p-6 ${getStatusColor()}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-lg ${applies === "protected" ? "bg-green-100" : applies === "not-protected" ? "bg-gray-100" : "bg-blue-100"}`}>
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-foreground">No Surprises Act Protection</h2>
            {applies === "protected" && (
              <Badge className="bg-green-100 text-green-700 border-green-300">Protected</Badge>
            )}
            {applies === "not-protected" && (
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
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg mt-4">
            <div className="flex items-start gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-900 mb-1">No Surprises Act Request Email</p>
                <p className="text-xs text-blue-700">
                  Email to Hospital/Provider Billing Department requesting information to determine if you're protected from balance billing under federal law. 
                  Could save you significant money if NSA protections apply.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateEmail}
              className="transition-all w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1 animate-scale-in text-green-600" />
                  <span className="text-green-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-1" />
                  Copy NSA Request Email
                </>
              )}
            </Button>
          </div>
        )}
        {applies === "protected" && (
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

      {applies === "protected" && (
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
