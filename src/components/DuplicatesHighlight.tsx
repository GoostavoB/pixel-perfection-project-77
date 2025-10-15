import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Mail, ClipboardCopy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DuplicateItem {
  description: string;
  amount: number;
  confidence: "high" | "medium" | "low";
  details: string;
  disputeText: string;
}

interface DuplicatesHighlightProps {
  duplicates: DuplicateItem[];
}

export const DuplicatesHighlight = ({ duplicates }: DuplicatesHighlightProps) => {
  const { toast } = useToast();

  const handleCopyDispute = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Dispute text copied to clipboard",
    });
  };

  const handleEmailRequest = (duplicate: DuplicateItem) => {
    const subject = encodeURIComponent(`Bill Dispute: ${duplicate.description}`);
    const body = encodeURIComponent(duplicate.disputeText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High confidence</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Medium confidence</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Low confidence</Badge>;
      default:
        return null;
    }
  };

  if (duplicates.length === 0) return null;

  const totalAmount = duplicates.reduce((sum, dup) => sum + dup.amount, 0);

  return (
    <Card className="p-6 bg-orange-50/50 border-orange-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Copy className="w-5 h-5 text-orange-700" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-orange-900 mb-1">Possible Duplicates</h2>
          <p className="text-sm text-orange-700">
            {duplicates.length} potential duplicate charge{duplicates.length > 1 ? 's' : ''} detected, 
            totaling ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {duplicates.map((duplicate, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{duplicate.description}</h3>
                <p className="text-sm text-muted-foreground mb-2">{duplicate.details}</p>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-orange-700">
                  ${duplicate.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {getConfidenceBadge(duplicate.confidence)}
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyDispute(duplicate.disputeText)}
                className="text-xs"
              >
                <ClipboardCopy className="w-3 h-3 mr-1" />
                Copy dispute text
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEmailRequest(duplicate)}
                className="text-xs"
              >
                <Mail className="w-3 h-3 mr-1" />
                Email billing
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
